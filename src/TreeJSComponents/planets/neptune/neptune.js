import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function buildNeptuneTexture() {
  const W = 512, H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(61);

  ctx.fillStyle = "#3f54ba";
  ctx.fillRect(0, 0, W, H);

  // Subtle cloud ovals
  for (let i = 0; i < 12; i++) {
    const cx = rand() * W, cy = rand() * H, r = 30 + rand() * 55;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(80,100,200,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(Math.max(0, cx - r), Math.max(0, cy - r), r * 2, r * 2);
  }

  // Great Dark Spot — oval storm
  const dsX = W * 0.45, dsY = H * 0.40, dsR = W * 0.07;
  ctx.save();
  ctx.translate(dsX, dsY);
  ctx.scale(1.4, 1);
  const dsGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, dsR);
  dsGrad.addColorStop(0.0, "rgba(20,30,80,0.78)");
  dsGrad.addColorStop(0.55, "rgba(25,40,95,0.40)");
  dsGrad.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = dsGrad;
  ctx.fillRect(-dsR * 1.5, -dsR, dsR * 3, dsR * 2);
  ctx.restore();

  // Polar brightening
  for (const cy of [0, H]) {
    const grad = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, W * 0.30);
    grad.addColorStop(0, "rgba(200,215,255,0.10)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  return canvas;
}

class NeptunePlanet extends Planet {
  build() {
    const tex = new THREE.CanvasTexture(buildNeptuneTexture());
    return new THREE.Mesh(
      new THREE.SphereGeometry(this.sphereParams.radius, 32, 32),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.0, roughness: 0.90 })
    );
  }
}

export const neptune = new NeptunePlanet(null, null, { radius: 60, width: 32, height: 32 });
