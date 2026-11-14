import * as THREE from "three";
import { SUN_POS } from "../sunPosition";

// What the ships' metal reflects. Without it a metal surface has nothing to
// mirror and looks like painted plastic. This is a small painted sky, not the
// 8k starmap: a mirror on a hull only needs the big shapes (the sun, the band
// of the Milky Way, the dark between), and three.js blurs it per roughness
// anyway. One texture, shared by every ship.

const W = 256, H = 128;

// Where a direction lands on an equirect picture, as three.js samples it
export function envUv(dir) {
  return {
    u: Math.atan2(dir.z, dir.x) / (2 * Math.PI) + 0.5,
    v: Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)) / Math.PI + 0.5,
  };
}

// The ships patrol along the scroll path; from its middle the sun lies here.
// One fixed direction is close enough for all of them: the sun is far behind
// the whole path.
const PATROL_CENTRE = new THREE.Vector3(500, 400, 3500);
export const SUN_UV = envUv(
  new THREE.Vector3(SUN_POS.x, SUN_POS.y, SUN_POS.z).sub(PATROL_CENTRE).normalize()
);

function paintSky() {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Space is not quite black: a faint cool fill keeps shadowed metal readable
  const fill = ctx.createLinearGradient(0, 0, 0, H);
  fill.addColorStop(0, "#0b0e16");
  fill.addColorStop(0.5, "#131824");
  fill.addColorStop(1, "#07090f");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, W, H);

  // The Milky Way: a soft pale band, slanted across the sky
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.22);
  const band = ctx.createLinearGradient(0, -H * 0.22, 0, H * 0.22);
  band.addColorStop(0, "rgba(120,130,160,0)");
  band.addColorStop(0.5, "rgba(120,130,160,0.34)");
  band.addColorStop(1, "rgba(120,130,160,0)");
  ctx.fillStyle = band;
  ctx.fillRect(-W, -H * 0.22, W * 2, H * 0.44);
  ctx.restore();

  // The sun: a hot core in a warm halo. Drawn again one picture-width away so
  // a halo that crosses the seam continues on the other side.
  const sx = SUN_UV.u * W, sy = (1 - SUN_UV.v) * H;
  for (const dx of [0, sx < W / 2 ? W : -W]) {
    const sun = ctx.createRadialGradient(sx + dx, sy, 0, sx + dx, sy, H * 0.42);
    sun.addColorStop(0, "rgba(255,255,245,1)");
    sun.addColorStop(0.1, "rgba(255,240,200,0.95)");
    sun.addColorStop(0.3, "rgba(255,200,120,0.35)");
    sun.addColorStop(1, "rgba(255,170,80,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H);
  }
  return canvas;
}

let _env = null;
export function sharedEnvMap() {
  if (!_env) {
    _env = new THREE.CanvasTexture(paintSky());
    _env.mapping = THREE.EquirectangularReflectionMapping;
    _env.colorSpace = THREE.SRGBColorSpace;
  }
  return _env;
}

// Below this a surface is paint, not metal, and a reflection would only grey it
const METAL_FROM = 0.25;
const INTENSITY = 1.6;

// Gives every metal part of a ship the sky to reflect. Lamps and glows (parts
// that give off their own light) and unlit parts are left as they are.
export function addReflections(group) {
  const seen = new Set();
  group.traverse((o) => {
    const m = o.isMesh && o.material;
    if (!m || seen.has(m) || !m.isMeshStandardMaterial) return;
    seen.add(m);
    const glows = m.emissiveIntensity > 0 && m.emissive.getHex() !== 0;
    if (m.metalness < METAL_FROM || glows) return;
    m.envMap = sharedEnvMap();
    m.envMapIntensity = INTENSITY;
  });
  return group;
}
