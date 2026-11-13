// Adaptive render quality. Levels lower the pixel ratio first (the biggest cost
// on high-DPI screens), then turn bloom off. Every ~2 s of frames the governor
// looks at the 90th-percentile frame time and decides.
//
// requestAnimationFrame never fires faster than the screen refreshes, so frame
// times say "frames are being missed" but never "there is headroom". Hence:
// - Slow is relative to the screen: P90 more than 20% over the best frame
//   interval seen (60 Hz is assumed until something faster shows up).
// - A step down has to pay for itself. If the next window is not clearly
//   faster, the slowness is a frame-rate cap (a phone in low-power mode) or the
//   CPU, not pixels: the step is undone and stepping down pauses for a while.
// - Stepping up is a timed try: after half a minute without slow windows, go
//   one level up. If that turns slow again right away, come back down and wait
//   twice as long before the next try.

const WINDOW_S = 2;
const MIN_SAMPLES = 8;
// One frame adds at most this much to the window's clock, so a lone stall
// (shader warm-up, a GC pause) is a single slow sample among many, while a
// device that is slow every frame still fills windows with slow samples.
const STALL_S = 0.25;
const ASSUMED_REFRESH_S = 1 / 60;
const MIN_REFRESH_S = 0.004;
const SLOW_FACTOR = 1.2; // P90 above 1.2 × the refresh interval: frames are being missed
const HELPED_FACTOR = 0.85; // a step down must make P90 at least 15% shorter
const WAIT_S = 30; // smooth time before trying a step up; pause after a useless step down
const MAX_WAIT_S = 240;
const PROBE_S = 10; // a step up that turns slow within this long has failed

export function qualityLevels(maxPixelRatio) {
  const ratios = [maxPixelRatio, 1.5, 1].filter((r, i, all) => r <= maxPixelRatio && all.indexOf(r) === i);
  if (!ratios.length) ratios.push(maxPixelRatio);
  return [
    ...ratios.map((pixelRatio) => ({ pixelRatio, bloom: true })),
    { pixelRatio: ratios[ratios.length - 1], bloom: false },
  ];
}

export function createQualityGovernor({ levels, start = 0, pinned = false, onChange = () => {} }) {
  const last = levels.length - 1;
  let level = start === "last" ? last : Math.max(0, Math.min(last, start));
  let samples = [];
  let elapsed = 0;
  let grace = 0;
  let refresh = ASSUMED_REFRESH_S; // best frame interval seen: what the screen can do
  let stepDownP90 = null; // P90 that caused the last step down, until that step is judged
  let smoothFor = 0; // time without a slow window, at a lowered level
  let upWait = WAIT_S;
  let probeAge = null; // time since a step up, while it is still on trial
  let downWait = WAIT_S;
  let downPause = 0; // no stepping down while this runs

  const percentile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];

  const setLevel = (next) => {
    level = next;
    onChange(levels[level], level);
  };

  const judge = (windowS) => {
    const sorted = samples.slice().sort((a, b) => a - b);
    const p90 = percentile(sorted, 0.9);
    refresh = Math.max(MIN_REFRESH_S, Math.min(refresh, percentile(sorted, 0.5)));

    // Did the last step down help? If not, pixels are not what is slow.
    if (stepDownP90 !== null) {
      const helped = p90 <= stepDownP90 * HELPED_FACTOR;
      const was = stepDownP90;
      stepDownP90 = null;
      if (!helped) {
        refresh = Math.max(refresh, Math.min(was, p90)); // a steady cap is this screen's normal
        downPause = downWait;
        downWait = Math.min(MAX_WAIT_S, downWait * 2);
        smoothFor = 0;
        setLevel(level - 1);
        return;
      }
    }

    const slow = p90 > refresh * SLOW_FACTOR;
    downPause = Math.max(0, downPause - windowS);

    if (slow) {
      smoothFor = 0;
      if (probeAge !== null) {
        // The step up did not hold: back down, and wait longer before the next try
        probeAge = null;
        upWait = Math.min(MAX_WAIT_S, upWait * 2);
        setLevel(level + 1);
      } else if (level < last && downPause <= 0) {
        stepDownP90 = p90;
        setLevel(level + 1);
      }
      return;
    }

    if (probeAge !== null) {
      probeAge += windowS;
      if (probeAge >= PROBE_S) {
        probeAge = null; // it held
        upWait = WAIT_S;
      }
    }
    if (level > 0 && probeAge === null) {
      smoothFor += windowS;
      if (smoothFor >= upWait) {
        smoothFor = 0;
        probeAge = 0;
        setLevel(level - 1);
      }
    }
  };

  return {
    get level() {
      return level;
    },
    get settings() {
      return levels[level];
    },
    tick(dt) {
      if (pinned || !(dt > 0)) return;
      const t = Math.min(dt, STALL_S);
      if (grace > 0) {
        grace -= t;
        return;
      }
      samples.push(dt);
      elapsed += t;
      if (elapsed < WINDOW_S || samples.length < MIN_SAMPLES) return;
      const windowS = elapsed;
      judge(windowS);
      samples = [];
      elapsed = 0;
    },
    // Forget the current window and skip the next `graceSeconds` of frames:
    // call it around known stalls (page load, tab resume, entering a mode, a
    // resize) so they are not read as a slow device.
    reset(graceSeconds = 0) {
      samples = [];
      elapsed = 0;
      grace = Math.max(0, graceSeconds);
    },
  };
}

// `?quality=high` pins full quality, `?quality=low` the lowest; anything else is automatic.
export function qualityOverride(search) {
  const q = new URLSearchParams(search || "").get("quality");
  if (q === "high") return { start: 0, pinned: true };
  if (q === "low") return { start: "last", pinned: true };
  return null;
}
