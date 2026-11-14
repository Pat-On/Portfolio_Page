// The game's rules of thumb as plain functions on {x, y, z}: no three.js, so
// they can be reasoned about and tested as arithmetic. Speeds are per second.

const hyp = (x, y, z) => Math.sqrt(x * x + y * y + z * z);

// ── Enemy gunnery ───────────────────────────────────────────────────────────

// Longest flight time a gunner plans for. A target that cannot be caught
// (boosting straight away) is led this far and no further.
const MAX_LEAD_S = 2;

// Where to aim so a bolt and a moving target arrive together.
export function leadPoint(shooter, target, targetVel, boltSpeed) {
  let t = 0;
  let aim = target;
  for (let i = 0; i < 6; i++) {
    t = Math.min(MAX_LEAD_S, hyp(aim.x - shooter.x, aim.y - shooter.y, aim.z - shooter.z) / boltSpeed);
    aim = { x: target.x + targetVel.x * t, y: target.y + targetVel.y * t, z: target.z + targetVel.z * t };
  }
  return aim;
}

// How far off a gunner's aim may be, as a share of the distance to the target.
// Crews get better every wave; nobody is perfect.
const AIM_ERROR_FIRST = 0.085;
const AIM_ERROR_LAST = 0.02;
const AIM_WAVES = 8;

export function aimError(wave) {
  const k = Math.min(1, Math.max(0, (wave - 1) / (AIM_WAVES - 1)));
  return AIM_ERROR_FIRST + (AIM_ERROR_LAST - AIM_ERROR_FIRST) * k;
}

// The aim point, thrown off by up to `error` × distance on each axis.
export function scatter(from, aim, error, rand) {
  const reach = hyp(aim.x - from.x, aim.y - from.y, aim.z - from.z) * error;
  return {
    x: aim.x + (rand() * 2 - 1) * reach,
    y: aim.y + (rand() * 2 - 1) * reach,
    z: aim.z + (rand() * 2 - 1) * reach,
  };
}

// ── Collisions ──────────────────────────────────────────────────────────────

// Running into a ship throws the player clear of it.
export function knockBack(player, enemy, distance) {
  let x = player.x - enemy.x, y = player.y - enemy.y, z = player.z - enemy.z;
  const d = hyp(x, y, z);
  if (d < 1e-6) { x = 0; y = 1; z = 0; } else { x /= d; y /= d; z /= d; }
  return { x: x * distance, y: y * distance, z: z * distance };
}

// ── Spawning ────────────────────────────────────────────────────────────────

// New enemies arrive where the player can see them coming: ahead or abeam,
// never from behind. `forward` is the player's view direction.
const SPAWN_ARC = (100 * Math.PI) / 180;   // to either side of straight ahead
const SPAWN_RISE = 0.5;                    // total spread above/below, radians

export function spawnDirection(forward, rand) {
  const flat = Math.hypot(forward.x, forward.z);
  const heading = flat > 1e-3 ? Math.atan2(forward.z, forward.x) : 0;
  const a = heading + (rand() * 2 - 1) * SPAWN_ARC;
  const rise = (rand() - 0.5) * SPAWN_RISE;
  return { x: Math.cos(rise) * Math.cos(a), y: Math.sin(rise), z: Math.cos(rise) * Math.sin(a) };
}

// ── Off-screen arrows ───────────────────────────────────────────────────────

// For an enemy that is not in view: where on the screen's edge to draw an
// arrow, and which way it points (radians, 0 = right, screen y down).
// `ndc` is the enemy projected by the camera (x, y in -1..1 when on screen)
// and whether it lies behind the camera, where a projection comes out mirrored.
export function edgeArrow(ndc, width, height, margin) {
  if (!ndc.behind && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1) return null;
  let sx = ndc.behind ? -ndc.x : ndc.x;
  let sy = ndc.behind ? ndc.y : -ndc.y;     // screen y runs down
  if (Math.abs(sx) < 1e-6 && Math.abs(sy) < 1e-6) sy = 1;   // dead astern: point down
  const halfW = width / 2 - margin, halfH = height / 2 - margin;
  const k = Math.min(
    Math.abs(sx) > 1e-9 ? halfW / Math.abs(sx) : Infinity,
    Math.abs(sy) > 1e-9 ? halfH / Math.abs(sy) : Infinity
  );
  return { x: width / 2 + sx * k, y: height / 2 + sy * k, angle: Math.atan2(sy, sx) };
}

// ── Boost ───────────────────────────────────────────────────────────────────

// Boost runs off a bar: about three seconds from full, slower to come back,
// and once emptied it stays off until it has partly refilled.
export const BOOST_DRAIN_PER_S = 0.3;
export const BOOST_REFILL_PER_S = 0.18;
export const BOOST_RESTART_AT = 0.25;

export function stepBoost({ energy, locked }, wantsBoost, delta) {
  if (locked && energy >= BOOST_RESTART_AT) locked = false;
  const boosting = !!wantsBoost && !locked && energy > 0;
  if (boosting) {
    energy -= BOOST_DRAIN_PER_S * delta;
    if (energy <= 0) { energy = 0; locked = true; }
  } else {
    energy = Math.min(1, energy + BOOST_REFILL_PER_S * delta);
  }
  return { energy, locked, boosting };
}

// ── The boss ────────────────────────────────────────────────────────────────

// The fight has three stages, a third of the boss's health each:
// 1 escorts and bolts, 2 the superlaser joins in, 3 the dish is exposed.
export function bossStage(hp, maxHp) {
  const left = hp / maxHp;
  if (left > 2 / 3) return 1;
  if (left > 1 / 3) return 2;
  return 3;
}

// A unit vector turned from `dir` toward `wanted` by at most `maxAngle`
// radians: how the superlaser follows a target it cannot keep up with.
export function turnToward(dir, wanted, maxAngle) {
  const dot = Math.min(1, Math.max(-1, dir.x * wanted.x + dir.y * wanted.y + dir.z * wanted.z));
  const angle = Math.acos(dot);
  if (angle <= maxAngle) return { x: wanted.x, y: wanted.y, z: wanted.z };
  // The part of `wanted` at right angles to `dir`: the way to turn
  let px = wanted.x - dir.x * dot, py = wanted.y - dir.y * dot, pz = wanted.z - dir.z * dot;
  let p = hyp(px, py, pz);
  if (p < 1e-6) {
    // Dead astern: any way round is as good; take one at right angles to `dir`
    const ax = Math.abs(dir.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
    px = dir.y * ax.z - dir.z * ax.y; py = dir.z * ax.x - dir.x * ax.z; pz = dir.x * ax.y - dir.y * ax.x;
    p = hyp(px, py, pz);
  }
  const c = Math.cos(maxAngle), s = Math.sin(maxAngle) / p;
  return { x: dir.x * c + px * s, y: dir.y * c + py * s, z: dir.z * c + pz * s };
}

// Whether a hit landed on the face the dish looks out of. `dishDir` is the
// unit vector from the boss's centre through the dish. Wider than the dish
// itself: a shot from a moving ship should not need a sniper.
const DISH_HALF_ANGLE = (30 * Math.PI) / 180;

export function onDish(hit, bossPos, dishDir) {
  const x = hit.x - bossPos.x, y = hit.y - bossPos.y, z = hit.z - bossPos.z;
  const d = hyp(x, y, z);
  if (d < 1e-6) return false;
  return (x * dishDir.x + y * dishDir.y + z * dishDir.z) / d >= Math.cos(DISH_HALF_ANGLE);
}

// The dish is the way in, but only once the hull is failing (stage 3) and
// only while the superlaser charges through it.
export const DISH_DAMAGE = 3;

export function bossHitDamage({ stage, charging, dish }) {
  return stage === 3 && charging && dish ? DISH_DAMAGE : 1;
}

// ── Score ───────────────────────────────────────────────────────────────────

// Kills in quick succession are a streak. Counted in game time, so a pause
// neither breaks a streak nor keeps one alive.
export const STREAK_WINDOW_S = 3;

// `sinceLastKill` is null for the first kill of a run.
export function stepStreak(streak, sinceLastKill) {
  return sinceLastKill !== null && sinceLastKill < STREAK_WINDOW_S ? streak + 1 : 1;
}

// A quarter more per kill in a row, up to double from the fifth.
export function streakMultiplier(streak) {
  return Math.min(2, 1 + 0.25 * (Math.max(1, streak) - 1));
}

export const waveClearBonus = (wave) => 100 * wave;

// On victory: a full hull brought home is worth two boss kills.
export const hullBonus = (health) => Math.round(1000 * Math.max(0, health));

// Share of shots that hit something; null when no shot was fired.
export const accuracy = (shots, hits) => (shots > 0 ? hits / shots : null);

// ── What the screen says ────────────────────────────────────────────────────

// The two lines over the boss's health bar: which stage the fight is in, and
// what the player needs to know right now (null when nothing).
export function bossBanner({ stage, charging, critical }) {
  let warning = null;
  if (critical) warning = `CRITICAL HIT ×${DISH_DAMAGE}`;
  else if (charging) warning = stage === 3 ? "⚠ SUPERLASER CHARGING · HIT THE DISH ⚠" : "⚠ SUPERLASER CHARGING ⚠";
  return { label: `DEATH STAR · STAGE ${stage} OF 3`, warning };
}

// Seconds as m:ss
export function formatRunTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
