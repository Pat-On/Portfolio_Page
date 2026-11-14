// How a ship carries itself along its patrol path. Velocities and
// accelerations are per unit of the animation clock, in the scene's X/Z plane;
// the ships' forward is -Z.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Roll for the turn being flown: a ship leans into a turn, more the tighter it
// is, and flies level on a straight. Positive roll lowers the left (-X) side,
// which is the inside of a left turn.
export function bankAngle(vx, vz, ax, az, { gain = 1, max = 0.6 } = {}) {
  const v2 = vx * vx + vz * vz;
  if (v2 < 1e-6) return 0;
  // Rate at which the heading swings round
  const turnRate = (vz * ax - vx * az) / v2;
  return clamp(turnRate * gain, -max, max);
}

// 0 at the slowest stretch of a path, 1 at the fastest: engines burn harder
// when the ship is going faster.
export function throttle(speed, slowest, fastest) {
  return clamp((speed - slowest) / (fastest - slowest), 0, 1);
}

// 1 for the first `on` share of every period, 0 for the rest
export function blink(t, period, on = 0.2, phase = 0) {
  const at = (((t / period + phase) % 1) + 1) % 1;
  return at < on ? 1 : 0;
}

// Navigation lamps flash in turn: each a short bright flash, then dim.
const LAMP_PERIOD = 0.45;   // clock units; about a second and a half
const LAMP_ON = 0.3;
const LAMP_BRIGHT = 1.8, LAMP_DIM = 0.12;

export function blinkNavLights(ship, t) {
  const lamps = ship?.userData?.animated?.navLights;
  if (!lamps) return;
  for (let i = 0; i < lamps.length; i++) {
    lamps[i].material.emissiveIntensity =
      blink(t, LAMP_PERIOD, LAMP_ON, i / lamps.length) ? LAMP_BRIGHT : LAMP_DIM;
  }
}
