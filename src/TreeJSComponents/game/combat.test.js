import {
  leadPoint, aimError, scatter, knockBack, spawnDirection, edgeArrow, stepBoost,
  BOOST_DRAIN_PER_S, BOOST_REFILL_PER_S, BOOST_RESTART_AT,
  bossStage, turnToward, onDish, bossHitDamage, DISH_DAMAGE,
  stepStreak, streakMultiplier, STREAK_WINDOW_S, waveClearBonus, hullBonus, accuracy, bossBanner, formatRunTime,
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

describe("bossStage()", () => {
  test("the fight has three stages, a third of the boss's health each", () => {
    expect(bossStage(30, 30)).toBe(1);
    expect(bossStage(21, 30)).toBe(1);
    expect(bossStage(20, 30)).toBe(2);
    expect(bossStage(11, 30)).toBe(2);
    expect(bossStage(10, 30)).toBe(3);
    expect(bossStage(1, 30)).toBe(3);
  });
});

describe("turnToward()", () => {
  const angle = (a, b) => Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));

  test("turns by no more than the given angle, and stays a unit vector", () => {
    const d = turnToward({ x: 0, y: 0, z: -1 }, { x: 1, y: 0, z: 0 }, 0.2);
    expect(len(d)).toBeCloseTo(1, 6);
    expect(angle(d, { x: 0, y: 0, z: -1 })).toBeCloseTo(0.2, 6);
    expect(angle(d, { x: 1, y: 0, z: 0 })).toBeCloseTo(Math.PI / 2 - 0.2, 6);
  });

  test("a target within reach is reached exactly", () => {
    const want = { x: Math.sin(0.1), y: 0, z: -Math.cos(0.1) };
    const d = turnToward({ x: 0, y: 0, z: -1 }, want, 0.5);
    expect(d.x).toBeCloseTo(want.x, 9);
    expect(d.z).toBeCloseTo(want.z, 9);
  });

  test("a target dead astern still gets turned toward, not ignored", () => {
    const d = turnToward({ x: 0, y: 0, z: -1 }, { x: 0, y: 0, z: 1 }, 0.3);
    expect(len(d)).toBeCloseTo(1, 6);
    expect(angle(d, { x: 0, y: 0, z: -1 })).toBeCloseTo(0.3, 6);
  });
});

describe("onDish()", () => {
  const boss = { x: 0, y: 0, z: 0 }, dish = { x: 0, y: 0, z: 1 };

  test("a hit on the face the dish looks out of is on the dish", () => {
    expect(onDish({ x: 0, y: 0, z: 160 }, boss, dish)).toBe(true);
    expect(onDish({ x: 50, y: 0, z: 150 }, boss, dish)).toBe(true);
  });

  test("a hit on the flank or the far side is not", () => {
    expect(onDish({ x: 160, y: 0, z: 0 }, boss, dish)).toBe(false);
    expect(onDish({ x: 0, y: 0, z: -160 }, boss, dish)).toBe(false);
    expect(onDish({ x: 110, y: 0, z: 110 }, boss, dish)).toBe(false);
  });
});

describe("bossHitDamage()", () => {
  test("the dish takes triple damage, but only in the last stage and only while charging", () => {
    expect(bossHitDamage({ stage: 3, charging: true, dish: true })).toBe(DISH_DAMAGE);
    expect(DISH_DAMAGE).toBe(3);
    expect(bossHitDamage({ stage: 3, charging: false, dish: true })).toBe(1);
    expect(bossHitDamage({ stage: 3, charging: true, dish: false })).toBe(1);
    expect(bossHitDamage({ stage: 2, charging: true, dish: true })).toBe(1);
  });
});

describe("kill streaks", () => {
  test("a kill soon after the last one extends the streak; a late one starts over", () => {
    expect(stepStreak(0, null)).toBe(1);
    expect(stepStreak(1, STREAK_WINDOW_S - 0.1)).toBe(2);
    expect(stepStreak(4, 0.5)).toBe(5);
    expect(stepStreak(4, STREAK_WINDOW_S + 0.1)).toBe(1);
  });

  test("a streak pays: a quarter more per kill in a row, up to double", () => {
    expect(streakMultiplier(1)).toBe(1);
    expect(streakMultiplier(2)).toBe(1.25);
    expect(streakMultiplier(3)).toBe(1.5);
    expect(streakMultiplier(5)).toBe(2);
    expect(streakMultiplier(12)).toBe(2);
  });
});

describe("bonuses", () => {
  test("clearing a wave pays more the later the wave", () => {
    expect(waveClearBonus(1)).toBe(100);
    expect(waveClearBonus(7)).toBe(700);
  });

  test("winning pays for the hull brought home", () => {
    expect(hullBonus(1)).toBe(1000);
    expect(hullBonus(0.35)).toBe(350);
    expect(hullBonus(0)).toBe(0);
  });
});

describe("accuracy()", () => {
  test("is the share of shots that landed, and nothing when no shot was fired", () => {
    expect(accuracy(10, 4)).toBe(0.4);
    expect(accuracy(0, 0)).toBeNull();
  });
});

describe("bossBanner()", () => {
  test("names the stage of the fight", () => {
    expect(bossBanner({ stage: 1, charging: false, critical: false }).label).toBe("DEATH STAR · STAGE 1 OF 3");
    expect(bossBanner({ stage: 3, charging: false, critical: false }).label).toBe("DEATH STAR · STAGE 3 OF 3");
  });

  test("warns while the superlaser charges, and in the last stage says where to shoot", () => {
    expect(bossBanner({ stage: 1, charging: false, critical: false }).warning).toBeNull();
    expect(bossBanner({ stage: 2, charging: true, critical: false }).warning).toBe("⚠ SUPERLASER CHARGING ⚠");
    expect(bossBanner({ stage: 3, charging: true, critical: false }).warning).toBe("⚠ SUPERLASER CHARGING · HIT THE DISH ⚠");
  });

  test("a hit on the exposed dish is called out", () => {
    expect(bossBanner({ stage: 3, charging: true, critical: true }).warning).toBe("CRITICAL HIT ×3");
  });
});

describe("formatRunTime()", () => {
  test("minutes and two-digit seconds", () => {
    expect(formatRunTime(0)).toBe("0:00");
    expect(formatRunTime(65)).toBe("1:05");
    expect(formatRunTime(600)).toBe("10:00");
  });
});
