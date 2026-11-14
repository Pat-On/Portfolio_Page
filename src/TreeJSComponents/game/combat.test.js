import {
  leadPoint, aimError, scatter, knockBack, spawnDirection, edgeArrow, stepBoost,
  BOOST_DRAIN_PER_S, BOOST_REFILL_PER_S, BOOST_RESTART_AT,
} from "./combat";

const len = (v) => Math.hypot(v.x, v.y, v.z);

describe("leadPoint()", () => {
  test("a target standing still is aimed at directly", () => {
    const p = leadPoint({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1000 }, { x: 0, y: 0, z: 0 }, 1500);
    expect(p).toEqual({ x: 0, y: 0, z: -1000 });
  });

  test("a target crossing is aimed ahead of, by its speed times the bolt's flight time", () => {
    const target = { x: 0, y: 0, z: -1500 }, vel = { x: 600, y: 0, z: 0 };
    const p = leadPoint({ x: 0, y: 0, z: 0 }, target, vel, 1500);
    // The bolt and the target reach the aim point at the same moment
    const t = len(p) / 1500;
    expect(p.x).toBeCloseTo(vel.x * t, 0);
    expect(p.x).toBeGreaterThan(550);
    expect(p.z).toBe(-1500);
  });

  test("a target the bolt can never catch is led by a capped amount, not to infinity", () => {
    const p = leadPoint({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1000 }, { x: 0, y: 0, z: -3000 }, 1500);
    expect(Number.isFinite(p.z)).toBe(true);
    expect(p.z).toBeGreaterThan(-1000 - 3000 * 2.01);
  });
});

describe("aimError()", () => {
  test("early waves miss more than late ones, and it never reaches zero", () => {
    expect(aimError(1)).toBeGreaterThan(aimError(4));
    expect(aimError(4)).toBeGreaterThan(aimError(8));
    expect(aimError(8)).toBeGreaterThan(0);
    expect(aimError(50)).toBe(aimError(8));
  });
});

describe("scatter()", () => {
  test("moves the aim point by at most the error times the distance", () => {
    const from = { x: 0, y: 0, z: 0 }, aim = { x: 0, y: 0, z: -1000 };
    const rolls = [0, 1, 0.5, 0.25, 0.9, 0.1];
    let i = 0;
    const p = scatter(from, aim, 0.05, () => rolls[i++ % rolls.length]);
    const off = Math.hypot(p.x - aim.x, p.y - aim.y, p.z - aim.z);
    expect(off).toBeGreaterThan(0);
    expect(off).toBeLessThanOrEqual(0.05 * 1000 * Math.sqrt(3) + 1e-9);
  });

  test("no error, no scatter", () => {
    expect(scatter({ x: 0, y: 0, z: 0 }, { x: 5, y: 6, z: 7 }, 0, Math.random)).toEqual({ x: 5, y: 6, z: 7 });
  });
});

describe("knockBack()", () => {
  test("pushes the player straight away from the enemy by the given distance", () => {
    const k = knockBack({ x: 100, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 250);
    expect(k).toEqual({ x: 250, y: 0, z: 0 });
  });

  test("still pushes somewhere when the two are in the same spot", () => {
    expect(len(knockBack({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, 250))).toBeCloseTo(250, 6);
  });
});

describe("spawnDirection()", () => {
  const forward = { x: 0, y: 0, z: -1 };

  test("is a unit direction ahead of or beside the player, never behind", () => {
    for (let i = 0; i <= 20; i++) {
      for (let j = 0; j <= 4; j++) {
        const rolls = [i / 20, j / 4];
        let k = 0;
        const d = spawnDirection(forward, () => rolls[k++ % 2]);
        expect(len(d)).toBeCloseTo(1, 6);
        // dot with forward: at worst a little behind abeam
        expect(d.x * forward.x + d.z * forward.z).toBeGreaterThan(-0.2);
      }
    }
  });

  test("follows where the player is looking", () => {
    const d = spawnDirection({ x: 1, y: 0, z: 0 }, () => 0.5);
    expect(d.x).toBeGreaterThan(0.9);
  });

  test("looking straight up still gives a usable direction", () => {
    const d = spawnDirection({ x: 0, y: 1, z: 0 }, () => 0.5);
    expect(Number.isFinite(d.x + d.y + d.z)).toBe(true);
    expect(len(d)).toBeCloseTo(1, 6);
  });
});

describe("edgeArrow()", () => {
  const W = 1000, H = 600, M = 30;

  test("nothing for an enemy that is on screen", () => {
    expect(edgeArrow({ x: 0.2, y: -0.4, behind: false }, W, H, M)).toBeNull();
  });

  test("an enemy off to the right gets an arrow on the right edge, pointing right", () => {
    const a = edgeArrow({ x: 3, y: 0, behind: false }, W, H, M);
    expect(a.x).toBeCloseTo(W - M, 6);
    expect(a.y).toBeCloseTo(H / 2, 6);
    expect(a.angle).toBeCloseTo(0, 6);
  });

  test("an enemy above gets an arrow on the top edge, pointing up", () => {
    const a = edgeArrow({ x: 0, y: 4, behind: false }, W, H, M);
    expect(a.y).toBeCloseTo(M, 6);
    expect(a.angle).toBeCloseTo(-Math.PI / 2, 6);
  });

  test("an enemy behind is mirrored, so the arrow points the way to turn", () => {
    // Projected behind the camera, a ship on the player's right shows up on the left
    const a = edgeArrow({ x: -0.3, y: 0, behind: true }, W, H, M);
    expect(a.x).toBeCloseTo(W - M, 6);
  });

  test("an enemy dead astern still gets an arrow", () => {
    expect(edgeArrow({ x: 0, y: 0, behind: true }, W, H, M)).not.toBeNull();
  });
});

describe("stepBoost()", () => {
  test("boosting drains the bar", () => {
    const s = stepBoost({ energy: 1, locked: false }, true, 1);
    expect(s.boosting).toBe(true);
    expect(s.energy).toBeCloseTo(1 - BOOST_DRAIN_PER_S, 9);
  });

  test("coasting refills it, up to full", () => {
    expect(stepBoost({ energy: 0.5, locked: false }, false, 1).energy).toBeCloseTo(0.5 + BOOST_REFILL_PER_S, 9);
    expect(stepBoost({ energy: 0.99, locked: false }, false, 5).energy).toBe(1);
  });

  test("an empty bar stops the boost and locks it until it has partly refilled", () => {
    const empty = stepBoost({ energy: 0.01, locked: false }, true, 1);
    expect(empty.energy).toBe(0);
    expect(empty.locked).toBe(true);
    const still = stepBoost(empty, true, 0.1);
    expect(still.boosting).toBe(false);
    expect(still.energy).toBeGreaterThan(0);        // holding the key does not stop the refill
    const back = stepBoost({ energy: BOOST_RESTART_AT, locked: true }, true, 0.01);
    expect(back.locked).toBe(false);
    expect(back.boosting).toBe(true);
  });

  test("a full bar lasts a few seconds and takes longer to come back", () => {
    expect(1 / BOOST_DRAIN_PER_S).toBeGreaterThanOrEqual(2.5);
    expect(BOOST_REFILL_PER_S).toBeLessThan(BOOST_DRAIN_PER_S);
  });
});
