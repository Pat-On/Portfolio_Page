import {
  damageBearing, easeVelocity, bankTarget, MAX_BANK, explosionFlash, shockRing,
  engineTone, muzzleOffset,
} from "./feel";

describe("damageBearing()", () => {
  const forward = { x: 0, y: 0, z: -1 }, right = { x: 1, y: 0, z: 0 };

  test("0 is dead ahead, a quarter turn clockwise is to the right, half a turn is astern", () => {
    expect(damageBearing(forward, right, { x: 0, y: 0, z: -500 })).toBeCloseTo(0, 6);
    expect(damageBearing(forward, right, { x: 300, y: 0, z: 0 })).toBeCloseTo(Math.PI / 2, 6);
    expect(damageBearing(forward, right, { x: -300, y: 0, z: 0 })).toBeCloseTo(-Math.PI / 2, 6);
    expect(Math.abs(damageBearing(forward, right, { x: 0, y: 0, z: 500 }))).toBeCloseTo(Math.PI, 6);
  });

  test("height does not matter: the ring is flat", () => {
    expect(damageBearing(forward, right, { x: 300, y: 900, z: 0 })).toBeCloseTo(Math.PI / 2, 6);
  });
});

describe("easeVelocity()", () => {
  test("closes most of the gap in a fraction of a second, without overshooting", () => {
    let v = { x: 0, y: 0, z: 0 };
    const want = { x: 1200, y: 0, z: 0 };
    for (let i = 0; i < 12; i++) v = easeVelocity(v, want, 1 / 60, 9); // 0.2 s
    expect(v.x).toBeGreaterThan(900);
    expect(v.x).toBeLessThan(1200);
  });

  test("lets go gradually: the ship coasts for a moment when the key is released", () => {
    const v = easeVelocity({ x: 1200, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 1 / 60, 9);
    expect(v.x).toBeGreaterThan(900);
    expect(v.x).toBeLessThan(1200);
  });

  test("the same in one long frame as in many short ones", () => {
    const want = { x: 600, y: 0, z: -300 };
    let many = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < 6; i++) many = easeVelocity(many, want, 1 / 60, 9);
    const one = easeVelocity({ x: 0, y: 0, z: 0 }, want, 0.1, 9);
    expect(many.x).toBeCloseTo(one.x, 6);
    expect(many.z).toBeCloseTo(one.z, 6);
  });
});

describe("bankTarget()", () => {
  test("leans into a strafe and into a turn, level when flying straight", () => {
    expect(bankTarget(0, 0)).toBeCloseTo(0, 9);
    expect(bankTarget(1, 0)).toBeLessThan(0);    // strafing right rolls right (negative z)
    expect(bankTarget(-1, 0)).toBeGreaterThan(0);
    expect(bankTarget(0, -2)).toBeLessThan(0);   // yaw falls when turning right
  });

  test("never more than a gentle lean", () => {
    expect(bankTarget(1, -50)).toBe(-MAX_BANK);
    expect(bankTarget(-1, 50)).toBe(MAX_BANK);
    expect(MAX_BANK).toBeLessThan(0.3);
  });
});

describe("explosion timing", () => {
  test("the flash is brightest at once, swells fast and is gone by the end", () => {
    expect(explosionFlash(0, 0.3).opacity).toBe(1);
    expect(explosionFlash(0.1, 0.3).scale).toBeGreaterThan(0.5);
    expect(explosionFlash(0.3, 0.3)).toEqual({ scale: 1, opacity: 0 });
    expect(explosionFlash(9, 0.3)).toEqual({ scale: 1, opacity: 0 });
  });

  test("the ring spreads outward and fades as it goes", () => {
    const early = shockRing(0.1, 0.8), late = shockRing(0.6, 0.8);
    expect(late.scale).toBeGreaterThan(early.scale);
    expect(late.opacity).toBeLessThan(early.opacity);
    expect(shockRing(0.8, 0.8).opacity).toBe(0);
  });
});

describe("engineTone()", () => {
  test("idles low and quiet, rises with speed, and is never loud", () => {
    const idle = engineTone(0), cruise = engineTone(1), boost = engineTone(2.2);
    expect(cruise.frequency).toBeGreaterThan(idle.frequency);
    expect(boost.frequency).toBeGreaterThan(cruise.frequency);
    expect(cruise.gain).toBeGreaterThan(idle.gain);
    expect(boost.gain).toBeLessThanOrEqual(0.08);
    expect(engineTone(99).gain).toBe(boost.gain);
  });
});

describe("muzzleOffset()", () => {
  test("shots alternate between the two guns, below the line of sight", () => {
    const a = muzzleOffset(0), b = muzzleOffset(1), c = muzzleOffset(2);
    expect(a.right).toBe(-b.right);
    expect(c).toEqual(a);
    expect(a.up).toBeLessThan(0);
  });
});
