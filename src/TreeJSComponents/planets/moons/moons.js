import * as THREE from "three";
import { srgb } from "../../textureUtils";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { texSize } from "../../../utils/mobileQuality";

// The four big moons of Jupiter and Saturn's Titan. Sizes keep the real
// order (Ganymede > Titan > Callisto > Io > Europa), enlarged like everything
// else here so they can be seen at all. Surfaces are painted until real maps
// can be used: `base` is the overall colour, `marks` the blotches on it.
export const MOON_LOOKS = {
  io:       { radius: 9,  base: "#d9c45a", marks: ["#b5651d", "#f2e6a0", "#7a4a1e"], seed: 11, count: 70 },
  europa:   { radius: 8,  base: "#d8cfc0", marks: ["#a8876a", "#efe9df"],            seed: 23, count: 40, streaks: true },
  ganymede: { radius: 13, base: "#8f8676", marks: ["#5f594f", "#b9b0a0", "#746c60"], seed: 37, count: 90 },
  callisto: { radius: 11, base: "#5d5347", marks: ["#3d362e", "#8a7d6c", "#a59884"], seed: 41, count: 120 },
  titan:    { radius: 12, base: "#d39a45", marks: ["#c2893a", "#dba955"],            seed: 53, count: 30, hazy: true },
};

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function paintMoon({ base, marks, seed, count, streaks, hazy }) {
  const W = texSize(256), H = texSize(128);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < count; i++) {
    const x = rand() * W, y = (0.1 + rand() * 0.8) * H;
    const r = (hazy ? 0.12 + rand() * 0.2 : 0.01 + rand() * rand() * 0.09) * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, marks[Math.floor(rand() * marks.length)]);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = hazy ? 0.25 : 0.35 + rand() * 0.45;
    ctx.fillStyle = g;
    // Draw twice across the seam so the map wraps
    for (const dx of [0, x < W / 2 ? W : -W]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, y, r * (hazy ? 4 : 1.4), r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (streaks) {
    // Europa's long cracks
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = marks[0];
    ctx.lineWidth = Math.max(1, H / 128);
    for (let i = 0; i < 26; i++) {
      const x = rand() * W, y = rand() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * W * 0.3, y + (rand() - 0.5) * H * 0.5,
        x + (rand() - 0.5) * W * 0.5, y + (rand() - 0.5) * H * 0.7);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  return canvas;
}

class PaintedMoon extends Planet {
  constructor(look) {
    super(null, null, { radius: look.radius, width: 20, height: 14 });
    this.look = look;
  }

  buildMaterial() {
    return new THREE.MeshStandardMaterial({
      map: srgb(new THREE.CanvasTexture(paintMoon(this.look))),
      roughness: this.look.hazy ? 0.7 : 0.95,
      metalness: 0,
    });
  }
}

export const io = new PaintedMoon(MOON_LOOKS.io);
export const europa = new PaintedMoon(MOON_LOOKS.europa);
export const ganymede = new PaintedMoon(MOON_LOOKS.ganymede);
export const callisto = new PaintedMoon(MOON_LOOKS.callisto);
export const titan = new PaintedMoon(MOON_LOOKS.titan);
