const QUERY = '(prefers-reduced-motion: reduce)';

// A live MediaQueryList, so a preference changed mid-session is picked up on the next frame.
// Null where matchMedia is missing (very old browsers).
export function reducedMotionQuery() {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(QUERY) : null;
}

// The background scene's orbits, sun pulse and ship flights are ambient motion, so they stop for
// users who ask for reduced motion. Explore and game mode are started deliberately, so they keep it.
export function shouldRunAmbientMotion({ reducedMotion, exploring, gameModeActive }) {
  return !reducedMotion || exploring || gameModeActive;
}
