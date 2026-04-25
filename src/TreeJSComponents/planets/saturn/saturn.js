import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

function makeSaturnBodyTexture() {
  const w = 512, h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e8d5a3";
  ctx.fillRect(0, 0, w, h);

  const bands = [
    { y: 0.05, height: 0.06, color: "rgba(200, 175, 120, 0.6)" },
    { y: 0.14, height: 0.04, color: "rgba(220, 195, 140, 0.45)" },
    { y: 0.22, height: 0.08, color: "rgba(195, 168, 110, 0.65)" },
    { y: 0.34, height: 0.12, color: "rgba(210, 183, 128, 0.5)" },
    { y: 0.50, height: 0.10, color: "rgba(192, 165, 108, 0.6)" },
    { y: 0.64, height: 0.06, color: "rgba(215, 188, 132, 0.45)" },
    { y: 0.74, height: 0.09, color: "rgba(198, 170, 114, 0.55)" },
    { y: 0.86, height: 0.07, color: "rgba(205, 178, 122, 0.5)" },
  ];

  for (const b of bands) {
    const grad = ctx.createLinearGradient(0, b.y * h, 0, (b.y + b.height) * h);
    grad.addColorStop(0,   "rgba(0,0,0,0)");
    grad.addColorStop(0.25, b.color);
    grad.addColorStop(0.75, b.color);
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, b.y * h, w, b.height * h);
  }

  return new THREE.CanvasTexture(canvas);
}

function makeRingTexture() {
  const w = 256, h = 4;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0.00, "rgba(190, 160, 100, 0.0)");
  grad.addColorStop(0.05, "rgba(210, 175, 115, 0.5)");
  grad.addColorStop(0.18, "rgba(230, 200, 140, 0.85)");
  grad.addColorStop(0.30, "rgba(200, 170, 110, 0.65)");
  grad.addColorStop(0.42, "rgba(240, 210, 150, 0.90)");
  grad.addColorStop(0.55, "rgba(215, 185, 125, 0.70)");
  grad.addColorStop(0.68, "rgba(195, 165, 105, 0.55)");
  grad.addColorStop(0.80, "rgba(220, 190, 130, 0.75)");
  grad.addColorStop(0.92, "rgba(190, 158,  98, 0.40)");
  grad.addColorStop(1.00, "rgba(170, 140,  80, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

class SaturnPlanet extends Planet {
  buildMaterial() {
    return new THREE.MeshStandardMaterial({
      map: makeSaturnBodyTexture(),
      roughness: 0.80,
      metalness: 0.0,
    });
  }

  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.04, color: [0.92, 0.83, 0.60], opacity: 0.12, segments: 48 },
      { scale: 1.12, color: [0.95, 0.88, 0.68], opacity: 0.05, segments: 32 },
    ]);

    addGlowSprite(group, R, 2.2, [
      [0.0,  "rgba(240, 215, 155, 1.0)"],
      [0.15, "rgba(225, 198, 138, 0.65)"],
      [0.35, "rgba(200, 172, 110, 0.25)"],
      [0.6,  "rgba(170, 140,  85, 0.07)"],
      [1.0,  "rgba(0,     0,   0, 0.0)"],
    ], 0.45);

    const ringGeo = new THREE.RingGeometry(
      R * 1.4,
      R * 2.3,
      128
    );

    const pos = ringGeo.attributes.position;
    const uv  = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - R * 1.4) / (R * 0.9), 0.5);
    }
    uv.needsUpdate = true;

    const ringMat = new THREE.MeshBasicMaterial({
      map: makeRingTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    return group;
  }
}

export const saturn = new SaturnPlanet(null, null, { radius: 100, width: 64, height: 64 });
