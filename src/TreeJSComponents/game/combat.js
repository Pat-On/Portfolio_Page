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
