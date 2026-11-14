// How the game feels, as plain functions on numbers and {x, y, z}: no
// three.js, so the timing and the curves can be tested as arithmetic.

// ── Where a hit came from ───────────────────────────────────────────────────

// The bearing of `toSource` (a vector from the player to whatever hit them)
// round the player, in radians: 0 dead ahead, +π/2 to the right, ±π astern.
// `forward` and `right` are the player's unit view axes. Height is ignored.
export function damageBearing(forward, right, toSource) {
  const ahead = toSource.x * forward.x + toSource.y * forward.y + toSource.z * forward.z;
  const side  = toSource.x * right.x + toSource.y * right.y + toSource.z * right.z;
  return Math.atan2(side, ahead);
}

// ── Flight ──────────────────────────────────────────────────────────────────

// Velocity eased toward what the controls ask for: `rate` per second, the same
// whatever the frame rate. A little weight, not a drifting ship.
export const INERTIA_RATE = 9;

export function easeVelocity(v, want, delta, rate = INERTIA_RATE) {
  const k = 1 - Math.exp(-rate * delta);
  return { x: v.x + (want.x - v.x) * k, y: v.y + (want.y - v.y) * k, z: v.z + (want.z - v.z) * k };
}

// How far the view rolls (radians about the line of sight; negative is a roll
// to the right). `strafe` is -1..1 (right positive), `yawRate` in radians per
// second (three.js yaw: negative when turning right).
export const MAX_BANK = 0.16;

export function bankTarget(strafe, yawRate) {
  const lean = -strafe * 0.09 + yawRate * 0.05;
  return Math.max(-MAX_BANK, Math.min(MAX_BANK, lean));
}

// ── Explosions ──────────────────────────────────────────────────────────────

const unit = (age, life) => Math.max(0, Math.min(1, age / life));

// The flash: full brightness at once, swelling fast, gone by `life`.
export function explosionFlash(age, life) {
  const k = unit(age, life);
  return { scale: 1 - (1 - k) ** 3, opacity: (1 - k) ** 2 };
}

// The shock ring: spreads outward, slowing, and fades as it goes.
export function shockRing(age, life) {
  const k = unit(age, life);
  return { scale: 1 - (1 - k) ** 2, opacity: 1 - k };
}

// ── Sound ───────────────────────────────────────────────────────────────────

// The engine's hum for a speed given as a share of cruise speed (boost is
// about 2.2): pitch and loudness rise with speed, and it never gets loud.
export function engineTone(speed) {
  const s = Math.max(0, Math.min(2.2, speed));
  return { frequency: 46 + 34 * s, gain: 0.012 + 0.024 * s };
}

// ── Guns ────────────────────────────────────────────────────────────────────

// Where a shot leaves the ship relative to the line of sight: the two guns
// take turns.
export function muzzleOffset(shotIndex) {
  return { right: shotIndex % 2 === 0 ? 14 : -14, up: -9 };
}
