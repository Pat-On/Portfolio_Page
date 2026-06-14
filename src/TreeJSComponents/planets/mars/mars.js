import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { texSize } from "../../../utils/mobileQuality";

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function buildMarsTexture() {
  const W = texSize(1024), H = texSize(512);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(3);

  ctx.fillStyle = "#c1440e";
  ctx.fillRect(0, 0, W, H);

  // Surface variation — highland/lowland patches
  for (let i = 0; i < 480; i++) {
    const cx = rand() * W, cy = rand() * H;
    const rx = 15 + rand() * 65, ry = 12 + rand() * 50;
    const isDark = rand() < 0.55;
    const color = isDark ? `rgba(90,30,10,${0.10 + rand() * 0.12})` : `rgba(210,130,80,${0.08 + rand() * 0.10})`;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W / (rx / Math.max(rx, ry)), H / (ry / Math.max(rx, ry)));
    ctx.restore();
  }

  // Redraw base and patches properly without transform issues
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#c1440e";
  ctx.fillRect(0, 0, W, H);
  const rand2 = rng(3);
  for (let i = 0; i < 480; i++) {
    const cx = rand2() * W, cy = rand2() * H;
    const r = 20 + rand2() * 70;
    const isDark = rand2() < 0.55;
    const alpha = 0.08 + rand2() * 0.12;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, isDark ? `rgba(80,25,8,${alpha})` : `rgba(205,125,75,${alpha})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(Math.max(0, cx - r), Math.max(0, cy - r), r * 2, r * 2);
  }

  // Polar ice caps
  const capGrad = (cy, r1, r2) => {
    const g = ctx.createRadialGradient(W / 2, cy, r1 * 0.3, W / 2, cy, r1);
    g.addColorStop(0, `rgba(240,235,228,0.85)`);
    g.addColorStop(0.6, `rgba(230,225,218,0.50)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(W / 2, cy, r2, r1, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  capGrad(0,   H * 0.12, W * 0.18);
  capGrad(H,   H * 0.09, W * 0.14);

  // Dust streaks
  const rand3 = rng(99);
  for (let i = 0; i < 10; i++) {
    const sx = rand3() * W, sy = rand3() * H;
    const len = 60 + rand3() * 120, angle = rand3() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
    ctx.strokeStyle = `rgba(185,105,55,${0.06 + rand3() * 0.06})`;
    ctx.lineWidth = 4 + rand3() * 6;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  return canvas;
}

class MarsPlanet extends Planet {
  build() {
    const tex = new THREE.CanvasTexture(buildMarsTexture());
    return new THREE.Mesh(
      new THREE.SphereGeometry(this.sphereParams.radius, 32, 32),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.05, roughness: 0.90 })
    );
  }
}

export const mars = new MarsPlanet(null, null, { radius: 30, width: 32, height: 32 });
