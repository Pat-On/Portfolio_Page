import * as THREE from "three";

export function makeGlowTexture(size = 256, stops) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;

  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  for (const [pos, color] of stops) {
    grad.addColorStop(pos, color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export function addAtmosphere(group, radius, layers) {
  for (const { scale, color, opacity, segments = 32 } of layers) {
    group.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(radius * scale, segments, segments),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(...color),
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide,
        })
      )
    );
  }
}

export function addGlowSprite(group, radius, scale, stops, opacity) {
  const mat = new THREE.SpriteMaterial({
    map: makeGlowTexture(256, stops),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(radius * scale);
  group.add(sprite);
}
