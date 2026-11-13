---
title: "Plan: quality governor that works on 60 Hz and frame-capped screens"
status: implemented
created: 2026-11-13
updated: 2026-11-13
---

# Plan: quality governor that works on 60 Hz and frame-capped screens

Branch `fix/quality-governor-refresh-rate`, cut from `perf/visual-perf-v3`, because the governor
(`src/TreeJSComponents/qualityGovernor.js`) only exists on that branch.

## The problem

The governor measures the 90th-percentile frame time over 2 s windows. Above 20 ms it steps one
level down (pixel ratio 2 → 1.5 → 1, then bloom off); below 12 ms it steps one level up. The two
thresholds are absolute, and `requestAnimationFrame` never fires faster than the display refreshes.
Three faults follow, each reproduced by feeding frame times into `createQualityGovernor`:

| Case | What happens |
|---|---|
| **60 Hz display** (frames are 16.7 ms at best) | P90 can never be below 12 ms, so the governor **never steps up**. One window in which 10% of frames miss vsync (page load, a mode's first frames) lowers quality for the rest of the visit. On a pixel-ratio-1 monitor the levels are only "bloom on" and "bloom off", so that one window **turns bloom off for good**. |
| **Frame rate capped at 30 fps** (phone low-power mode, some battery savers) | Every frame is 33 ms, so it steps down every window and reaches the lowest level in about 4 s. The cap is not load: lower quality does not make frames faster, so the visitor loses resolution and bloom for nothing. |
| **High-refresh display, fill-bound GPU** (for example 22 ms at pixel ratio 1.5, 9.8 ms at 1) | Stepping down makes frames fast enough to step up, which makes them slow again: the level **flips every 2 s**, and each flip reallocates the composer's render targets. |

Also: the governor samples from the first frame, so texture uploads and shader compiles during
load count against quality.

The existing tests pass because they use 8 ms frames for "fast" and a single 16 ms case for "holds".

## The fix

Keep the module's shape (`createQualityGovernor`, `qualityLevels`, `qualityOverride`, `tick(dt)`,
`onChange`) and the level ladder. Change how it decides.

1. **Step down on missed frames, relative to the display.** Estimate the display's frame interval
   as the smallest window median seen so far (floor 4 ms, ceiling 34 ms). A window is *slow* when
   its P90 is above 1.5 × that interval. At 60 Hz that is 25 ms (same behaviour as today's 20 ms,
   since frames are 16.7 or 33.3 ms); at 120 Hz it is 12.5 ms.
2. **Check that a step down helped.** After stepping down, compare the next window's P90 with the
   one that triggered the step. If it is not at least 15% faster, the slowness is a cap or the CPU,
   not pixels: undo the step and hold the governor at that level for the session (a `capped`
   state). This handles the 30 fps case and any CPU-bound page.
3. **Step up by timed probe, with backoff.** Frame times cannot show headroom under vsync, so do
   not use a "fast" threshold. After `PROBE_AFTER_S` (30 s) of windows that are not slow, step one
   level up. If that level turns slow again within 10 s, step back down and double the wait
   (30 → 60 → 120 s, capped at 120 s). If it holds, reset the wait to 30 s. This lets a 60 Hz
   screen recover and limits flapping to one try per backoff period.
4. **Do not measure during known stalls.** Add `governor.reset(graceSeconds)`: it clears the
   window and ignores frames for the grace period. `ViewGL` calls it with 3 s at construction,
   and with 1.5 s on tab resume (`_onVisibilityChange`), on entering or leaving Explore and Game
   Mode, and in `onWindowResize`.

`?quality=high|low` pinning is unchanged.

## Steps (test first; each test is run red before the code is written)

1. `qualityGovernor.test.js`, new failing tests:
   - 60 Hz, pixel ratio 1: a janky window steps down, 35 s of 16.7 ms frames steps back up;
   - 60 Hz steady 16.7 ms never changes level;
   - steady 33.3 ms frames: one step down, then undone, then no change for 60 s;
   - fill-bound 120 Hz case above: at most 3 level changes in the first 60 s, and the gaps grow;
   - `reset(3)` ignores a 2 s burst of 50 ms frames;
   - 120 Hz: a slow window is P90 above 12.5 ms, not 20 ms.
2. Rewrite the decision logic in `qualityGovernor.js`; update the two existing tests that encode
   the old thresholds ("steps back up once … below 12 ms", "between the two thresholds").
3. `ViewGL.test.js`: failing tests that `reset` is called at construction, on tab resume, on mode
   entry and exit, and on resize; then wire the calls in `ViewGL.js`.
4. Full suite, lint, production build.
5. Browser check with Playwright on a build: `?quality=high` and `?quality=low` still pin; with
   Chrome DevTools CPU throttling the level goes down and returns after the throttle is lifted.
   SwiftShader runs at a few fps, so use the throttled real-GPU run for the "returns" check where
   one is available, and the unit tests otherwise.
6. Update `scripts/perf/README.md` (it tells you to profile with `?quality=high`; say why) and set
   this plan's status to `implemented` with the outcome.

## Outcome (2026-11-13)

Implemented as planned, with these differences, found while writing the tests:

- **Slow is P90 above 1.2 × the refresh interval** (not 1.5 ×), and the interval starts at an
  assumed 60 Hz and only goes down when faster frames are seen. That keeps the old 20 ms threshold
  on a 60 Hz screen, and a GPU-bound device locked at 30 fps still steps down (and keeps the step,
  because it helps).
- **A step down that did not help** is undone, and stepping down then pauses for 30 s, doubling
  up to 240 s. A steady cap also becomes the screen's normal interval, so it is not retried at all.
- **The step-up wait** doubles up to 240 s (not 120 s), and resets to 30 s once a step up has held
  for 10 s.
- **The P90 uses real frame times**; only the window's clock caps a frame at 0.25 s. With capped
  samples a device at 2–3 fps could not show that a step down helped.
- `ViewGL._settleQuality()` calls `governor.reset()`: 3 s at construction; 1.5 s on tab resume,
  resize, entering Explore or the game, and leaving them. The construction call cannot run in jsdom
  (no WebGL), so it is covered by the browser check only.

Checks: 437 tests green (425 before), lint clean, production build ok. Headless Chromium
(SwiftShader, device pixel ratio 2) on the build: `?quality=high` stays at level 0 and
`?quality=low` at the last level; automatic mode stepped down once, undid the step when frames did
not get faster, and stayed at full quality; the render loop survives a resize; no console errors.
Not checked: a real GPU under CPU throttling (no GPU in the test environment), so "quality returns
on a 60 Hz screen" rests on the unit tests.

## Out of scope

- The level ladder itself (pixel ratio steps, bloom last).
- Any other change from the `perf/visual-perf-v3` review: nothing else was found that blocks it.
