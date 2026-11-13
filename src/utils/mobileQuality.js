import { isMobileDevice } from "./isMobileDevice";

// Single source of truth for mobile quality downgrades. iOS Safari enforces a hard
// WebGL/canvas memory ceiling that is independent of device RAM, so phones crash
// ("a problem repeatedly occurred") when total texture memory is too high. We keep
// full quality on desktop and shrink only on mobile.
export const IS_MOBILE = isMobileDevice();

// Halve every procedural canvas-texture dimension on mobile. Halving width AND
// height cuts that texture's GPU memory to ~1/4. Clamped to a sane minimum.
export const texSize = (n) => (IS_MOBILE ? Math.max(64, Math.round(n / 2)) : n);

// Every surface map ships twice: 2048×1024 for desktops, 1024×512 for phones
// (a quarter of the GPU memory, and a smaller download).
export const pickMap = (desktop, mobile) => (IS_MOBILE ? mobile : desktop);
