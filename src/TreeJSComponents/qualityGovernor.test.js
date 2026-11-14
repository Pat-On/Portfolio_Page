import { createQualityGovernor, qualityLevels, qualityOverride } from "./qualityGovernor";

const run = (gov, ms, seconds) => {
  for (let t = 0; t < seconds * 1000; t += ms) gov.tick(ms / 1000);
};

describe("qualityLevels()", () => {
  test("steps the pixel ratio down from the device's cap, then drops bloom", () => {
    expect(qualityLevels(2)).toEqual([
      { pixelRatio: 2, bloom: true },
      { pixelRatio: 1.5, bloom: true },
      { pixelRatio: 1, bloom: true },
      { pixelRatio: 1, bloom: false },
    ]);
  });

  test("never adds a level above the cap", () => {
    expect(qualityLevels(1)).toEqual([
      { pixelRatio: 1, bloom: true },
      { pixelRatio: 1, bloom: false },
    ]);
    expect(qualityLevels(1.5).map((l) => l.pixelRatio)).toEqual([1.5, 1, 1]);
  });
});

// Frame time depends on the level the governor is at: msAt(level) → ms
const sim = (gov, msAt, seconds) => {
  for (let t = 0; t < seconds * 1000; ) {
    const ms = msAt(gov.level);
    gov.tick(ms / 1000);
    t += ms;
  }
};
// A 60 Hz screen where roughly one frame in six misses vsync
const janky60 = (gov, seconds) => {
  let i = 0;
  for (let t = 0; t < seconds * 1000; i++) {
    const ms = i % 6 === 0 ? 33.3 : 16.7;
    gov.tick(ms / 1000);
    t += ms;
  }
};

describe("createQualityGovernor()", () => {
  const make = (start = 0, maxPixelRatio = 2) => {
    const changes = [];
    let clock = 0;
    const gov = createQualityGovernor({
      levels: qualityLevels(maxPixelRatio),
      start,
      onChange: (lvl, index) => changes.push({ ...lvl, index, at: clock }),
    });
    const tick = gov.tick;
    gov.tick = (dt) => { clock += dt; tick(dt); };
    return { gov, changes };
  };

  test("holds full quality while frames stay fast", () => {
    const { gov, changes } = make();
    run(gov, 8, 10);
    expect(gov.level).toBe(0);
    expect(changes).toHaveLength(0);
  });

  test("steps down after about two seconds of slow frames", () => {
    const { gov, changes } = make();
    run(gov, 25, 1.5);
    expect(gov.level).toBe(0); // not yet: needs a full window of evidence
    run(gov, 25, 0.6);
    expect(gov.level).toBe(1);
    expect(changes.at(-1)).toMatchObject({ pixelRatio: 1.5, bloom: true });
  });

  test("keeps stepping down, one level per window, while each step helps and frames are still slow", () => {
    const { gov } = make();
    sim(gov, (level) => [60, 45, 32, 25][level], 20);
    expect(gov.level).toBe(3);
  });

  test("a device managing only a few frames a second still steps all the way down", () => {
    const { gov } = make();
    sim(gov, (level) => [400, 300, 200, 150][level], 40);
    expect(gov.level).toBe(3);
  });

  test("a few hitches do not count: it looks at the 90th percentile", () => {
    const { gov } = make();
    for (let i = 0; i < 400; i++) gov.tick(i % 20 === 0 ? 0.05 : 0.008); // 5% slow frames
    expect(gov.level).toBe(0);
  });

  test("a lone long stall (shader warm-up, a GC pause) does not cost quality", () => {
    const { gov } = make();
    run(gov, 8, 1);
    gov.tick(6);
    run(gov, 8, 5);
    expect(gov.level).toBe(0);
  });

  test("a steady 60 Hz screen never changes level", () => {
    const { gov, changes } = make(0, 1);
    run(gov, 16.7, 120);
    expect(changes).toHaveLength(0);
  });

  test("60 Hz: quality lost to a janky window comes back after half a minute of smooth frames", () => {
    const { gov, changes } = make(0, 1);
    janky60(gov, 2.2);
    expect(gov.level).toBe(1); // bloom off
    run(gov, 16.7, 20);
    expect(gov.level).toBe(1); // not yet
    run(gov, 16.7, 15);
    expect(gov.level).toBe(0); // bloom back
    run(gov, 16.7, 120);
    expect(gov.level).toBe(0);
    expect(changes).toHaveLength(2);
  });

  test("a lowered level holds for a while before the step up is tried", () => {
    const { gov } = make(1);
    run(gov, 16, 10);
    expect(gov.level).toBe(1);
  });

  test("a 30 fps cap is not load: the step down is undone and not tried again", () => {
    const { gov, changes } = make(0, 1.5);
    run(gov, 33.3, 300);
    expect(gov.level).toBe(0);
    expect(changes.map((c) => c.index)).toEqual([1, 0]);
    expect(changes[1].at).toBeLessThan(5);
  });

  test("jank that a lower level does not cure: undone, then retried only after a growing wait", () => {
    const { gov, changes } = make(0, 1);
    janky60(gov, 60);
    expect(gov.level).toBe(0);
    expect(changes.map((c) => c.index)).toEqual([1, 0, 1, 0]);
    const downs = changes.filter((c) => c.index === 1).map((c) => c.at);
    expect(downs[1] - downs[0]).toBeGreaterThan(25);
    janky60(gov, 240);
    const all = changes.filter((c) => c.index === 1).map((c) => c.at);
    expect(all[2] - all[1]).toBeGreaterThan((all[1] - all[0]) * 1.5);
  });

  test("a step up that turns slow again is taken back, and the next try waits longer", () => {
    // Fill-bound on a fast screen: 22 ms at pixel ratio 1.5, 9.8 ms at 1
    const { gov, changes } = make(0, 1.5);
    sim(gov, (level) => (level === 0 ? 22 : 9.8), 60);
    expect(changes.length).toBeLessThanOrEqual(3);
    sim(gov, (level) => (level === 0 ? 22 : 9.8), 380);
    const ups = changes.filter((c) => c.index === 0).map((c) => c.at);
    expect(ups.length).toBeGreaterThanOrEqual(3);
    expect(ups[1] - ups[0]).toBeGreaterThan(50);
    expect(ups[2] - ups[1]).toBeGreaterThan(100);
    expect(gov.level).toBe(1);
  });

  test("a step up that holds resets the wait", () => {
    const { gov, changes } = make(0, 1);
    janky60(gov, 2.2);
    run(gov, 16.7, 33); // stepped back up…
    expect(gov.level).toBe(0);
    gov.reset();
    janky60(gov, 2.2); // …which did not hold: the wait doubles
    expect(gov.level).toBe(1);
    run(gov, 16.7, 40);
    expect(gov.level).toBe(1);
    run(gov, 16.7, 40); // up again, and this time it holds
    expect(gov.level).toBe(0);
    gov.reset();
    janky60(gov, 2.2);
    const downAt = changes.at(-1).at;
    run(gov, 16.7, 36); // so the next step up comes after the short wait again
    expect(gov.level).toBe(0);
    expect(changes.at(-1).at - downAt).toBeLessThan(36);
  });

  test("slow is relative to the screen: on 120 Hz, 14 ms frames are missed frames", () => {
    const fresh = make();
    run(fresh.gov, 14, 6);
    expect(fresh.gov.level).toBe(0); // nothing faster seen: 14 ms may be all the screen does

    const { gov } = make();
    run(gov, 8.3, 4.2);
    run(gov, 14, 2.5);
    expect(gov.level).toBe(1);
  });

  test("reset(grace) drops the window and ignores frames for the grace period", () => {
    const { gov } = make();
    run(gov, 50, 1.5);
    gov.reset(3);
    run(gov, 50, 2.5); // inside the grace period: not measured
    run(gov, 16.7, 4);
    expect(gov.level).toBe(0);
  });

  test("a pinned governor never changes level", () => {
    const changes = [];
    const gov = createQualityGovernor({ levels: qualityLevels(2), pinned: true, onChange: (l) => changes.push(l) });
    run(gov, 50, 10);
    expect(gov.level).toBe(0);
    expect(changes).toHaveLength(0);
    expect(() => gov.reset(1)).not.toThrow();
  });
});

describe("qualityOverride()", () => {
  test.each([
    ["?quality=high", { start: 0, pinned: true }],
    ["?quality=low", { start: "last", pinned: true }],
    ["?quality=auto", null],
    ["", null],
    ["?quality=nonsense", null],
  ])("%s", (search, expected) => {
    expect(qualityOverride(search)).toEqual(expected);
  });
});
