# Scene profiling

Playwright scripts that drive headless Chromium on SwiftShader, so the real three.js scene renders.
SwiftShader renders on the CPU: headless fps is **not** a GPU signal. Compare draw calls,
renderables and texture memory, which are deterministic, and look at the screenshots.

```bash
npm run build
(cd build && python3 -m http.server 4173 --bind 127.0.0.1 &)
node scripts/perf/webgl-profile.mjs perf-out/run both        # screenshots + stats.json per viewport
node scripts/perf/scene-graph.mjs > perf-out/run/scene-graph.json
node scripts/perf/compare.mjs perf-out/baseline perf-out/run       # diff two runs
```

- `webgl-profile.mjs <outDir> [desktop|mobile|both]` scrolls to seven depths and writes
  `scene_NNN.png` (DOM hidden, scene only), `page_NNN.png` and `stats.json` per viewport:
  draw calls and triangles per frame, shader programs, texture uploads and bytes, network bytes,
  console errors.
- `scene-graph.mjs` reaches the live `ViewGL` through the Scene component's `apiRef` and reports
  renderables per top-level object, lights, materials and an estimate of GPU texture memory.
- `compare.mjs <baseDir> <candidateDir>` prints the before → after deltas of both.

`MOTION=reduce` freezes the ambient motion so two builds' screenshots line up; `SETTLE_MS`
(default 1500) is the wait after the loading screen before the first sample.

The scene's frame-time governor (`qualityGovernor.js`) reacts to SwiftShader's slow frames: it
tries a lower level, and puts it back if that did not make frames faster, so quality can differ
between samples. Profile with `SHOOT_URL=http://127.0.0.1:4173/?quality=high`, which pins full
quality like a fast GPU (`?quality=low` pins the lowest level).

Both capture scripts expect the build on `http://127.0.0.1:4173`; `SHOOT_URL` overrides it.
