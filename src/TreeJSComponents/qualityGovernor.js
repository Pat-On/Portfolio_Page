// Adaptive render quality. Every ~2 s of frames, the 90th-percentile frame time
// decides: above 20 ms (under ~50 fps for most frames) drop one level, below
// 12 ms (comfortably over 60 fps) climb one back. Between the two it holds, so
// it does not flap. Levels lower the pixel ratio first (the biggest cost on
// high-DPI screens), then turn bloom off.

const WINDOW_S = 2;
const SLOW_MS = 20;
const FAST_MS = 12;
// One frame counts for at most this long, so a lone stall (shader warm-up, a GC
// pause) is a single slow sample among many, while a device that is slow every
// frame still fills windows with slow samples.
const STALL_S = 0.25;
const MIN_SAMPLES = 8;

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

  const p90 = () => {
    const s = samples.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(s.length * 0.9))] * 1000;
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
      samples.push(t);
      elapsed += t;
      if (elapsed < WINDOW_S || samples.length < MIN_SAMPLES) return;
      const ms = p90();
      samples = [];
      elapsed = 0;
      const next = ms > SLOW_MS ? Math.min(last, level + 1) : ms < FAST_MS ? Math.max(0, level - 1) : level;
      if (next !== level) {
        level = next;
        onChange(levels[level], level);
      }
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
