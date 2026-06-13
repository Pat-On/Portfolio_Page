import * as THREE from "three";
import normalTexture from "../../textures/normal.webp";

// Shared texture helpers for all ship builders.
// Anisotropy 4 is universally supported and keeps panel lines crisp at the
// grazing angles ships are seen at during patrol, with negligible cost.
const ANISO = 4;

// Color/albedo (`map`) textures must be tagged sRGB — otherwise three.js treats
// the canvas as linear and the hull renders washed-out.
export function albedoTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  return t;
}

// Roughness/data textures stay in linear space (the default) — correct as-is.
export function linearTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = ANISO;
  return t;
}

// The normal map is identical across every ship — load it once and reuse.
let _normal = null;
export function sharedNormalMap() {
  if (!_normal) {
    _normal = new THREE.TextureLoader().load(normalTexture);
    _normal.anisotropy = ANISO;
    _normal.wrapS = _normal.wrapT = THREE.RepeatWrapping;
  }
  return _normal;
}
