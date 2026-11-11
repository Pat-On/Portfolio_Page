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

describe("createQualityGovernor()", () => {
  const make = (start = 0) => {
    const changes = [];
    const gov = createQualityGovernor({ levels: qualityLevels(2), start, onChange: (lvl) => changes.push(lvl) });
    return { gov, changes };
  };

  test("holds full quality while frames stay fast", () => {
    const { gov, changes } = make();
    run(gov, 8, 10);
    expect(gov.level).toBe(0);
    expect(changes).toHaveLength(0);
  });

  test("steps down after about two seconds of slow frames (P90 above 20 ms)", () => {
    const { gov, changes } = make();
    run(gov, 25, 1.5);
    expect(gov.level).toBe(0); // not yet: needs a full window of evidence
    run(gov, 25, 0.6);
    expect(gov.level).toBe(1);
    expect(changes.at(-1)).toEqual({ pixelRatio: 1.5, bloom: true });
  });

  test("keeps stepping down one level per window until it reaches the floor", () => {
    const { gov } = make();
    run(gov, 40, 20);
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

  test("a device managing only a few frames a second still steps all the way down", () => {
    const { gov } = make();
    run(gov, 400, 40);
    expect(gov.level).toBe(3);
  });

  test("steps back up once frames are consistently fast (P90 below 12 ms)", () => {
    const { gov, changes } = make(2);
    run(gov, 8, 2.1);
    expect(gov.level).toBe(1);
    expect(changes.at(-1)).toEqual({ pixelRatio: 1.5, bloom: true });
  });

  test("between the two thresholds it stays put (no flapping)", () => {
    const { gov } = make(1);
    run(gov, 16, 10);
    expect(gov.level).toBe(1);
  });

  test("a pinned governor never changes level", () => {
    const changes = [];
    const gov = createQualityGovernor({ levels: qualityLevels(2), pinned: true, onChange: (l) => changes.push(l) });
    run(gov, 50, 10);
    expect(gov.level).toBe(0);
    expect(changes).toHaveLength(0);
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
