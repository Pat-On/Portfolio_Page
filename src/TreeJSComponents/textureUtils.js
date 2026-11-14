import * as THREE from "three";

// Shared texture helpers for the planets, the sun, the background and the ships.
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

// Tag an already-created colour texture (a loaded image, say) as sRGB.
export function srgb(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Roughness/data textures stay in linear space (the default) — correct as-is.
export function linearTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = ANISO;
  return t;
}

// Relief (normal) maps are loaded once per URL: each separate
// TextureLoader.load is its own GPU upload. They stay linear — they are data.
const _normals = new Map();
export function normalMapTex(url) {
  let t = _normals.get(url);
  if (!t) {
    t = new THREE.TextureLoader().load(url);
    t.anisotropy = ANISO;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    _normals.set(url, t);
  }
  return t;
}
