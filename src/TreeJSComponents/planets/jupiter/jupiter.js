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

function buildJupiterTexture() {
  const W = 1024, H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(17);

  ctx.fillStyle = "#c88b3a";
  ctx.fillRect(0, 0, W, H);

  // Atmospheric band definitions — belts (dark) and zones (light)
  const bands = [
    { y: 0.00, h: 0.06, color: "#d4a060" },
    { y: 0.06, h: 0.08, color: "#8b4513" },
    { y: 0.14, h: 0.10, color: "#e8c980" },
    { y: 0.24, h: 0.07, color: "#a0522d" },
    { y: 0.31, h: 0.12, color: "#f0e0b0" },
    { y: 0.43, h: 0.09, color: "#9b6324" },
    { y: 0.52, h: 0.11, color: "#e8c880" },
    { y: 0.63, h: 0.08, color: "#8b4513" },
    { y: 0.71, h: 0.10, color: "#d4b896" },
    { y: 0.81, h: 0.07, color: "#a86830" },
    { y: 0.88, h: 0.06, color: "#e0cc90" },
    { y: 0.94, h: 0.06, color: "#9b6324" },
  ];

  for (const { y, h, color } of bands) {
    const height = (h + (rand() - 0.5) * 0.02) * H;
    ctx.fillStyle = color;
    ctx.fillRect(0, y * H, W, height);

    // Soft blend at band edges
    const blendH = 30 + rand() * 20;
    for (const edge of [y * H, y * H + height]) {
      const grad = ctx.createLinearGradient(0, edge - blendH / 2, 0, edge + blendH / 2);
      grad.addColorStop(0, "rgba(200,160,80,0)");
      grad.addColorStop(0.5, "rgba(160,110,50,0.08)");
      grad.addColorStop(1, "rgba(200,160,80,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, edge - blendH / 2, W, blendH);
    }
  }

  // Subtle wavy turbulence near equator
  const rand2 = rng(42);
  ctx.lineWidth = 3;
  for (let i = 0; i < 25; i++) {
    const baseY = (0.35 + rand2() * 0.30) * H;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 30) {
      ctx.bezierCurveTo(
        x + 10, baseY + (rand2() - 0.5) * 6,
        x + 20, baseY + (rand2() - 0.5) * 6,
        x + 30, baseY + (rand2() - 0.5) * 4
      );
    }
    ctx.strokeStyle = `rgba(140,90,30,${0.04 + rand2() * 0.05})`;
    ctx.stroke();
  }

  // Great Red Spot — oval storm at ~latitude -20° (y≈62%), longitude ~240° (x≈62%)
  const grsX = W * 0.62, grsY = H * 0.62, grsR = W * 0.055;
  ctx.save();
  ctx.translate(grsX, grsY);
  ctx.scale(1.65, 1);
  const grsGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, grsR);
  grsGrad.addColorStop(0.0, "rgba(175,55,25,0.92)");
  grsGrad.addColorStop(0.35, "rgba(155,72,35,0.70)");
  grsGrad.addColorStop(0.70, "rgba(130,65,30,0.35)");
  grsGrad.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = grsGrad;
  ctx.fillRect(-grsR * 2, -grsR, grsR * 4, grsR * 2);
  ctx.restore();

  // Wraparound second copy of GRS (in case it bleeds off right edge)
  ctx.save();
  ctx.translate(grsX - W, grsY);
  ctx.scale(1.65, 1);
  ctx.fillStyle = ctx.createRadialGradient(0, 0, 0, 0, 0, grsR);
  const grsGrad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, grsR);
  grsGrad2.addColorStop(0.0, "rgba(175,55,25,0.92)");
  grsGrad2.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = grsGrad2;
  ctx.fillRect(-grsR * 2, -grsR, grsR * 4, grsR * 2);
  ctx.restore();

  return canvas;
}

class JupiterPlanet extends Planet {
  build() {
    const tex = new THREE.CanvasTexture(buildJupiterTexture());
    return new THREE.Mesh(
      new THREE.SphereGeometry(this.sphereParams.radius, 48, 48),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.0, roughness: 0.92 })
    );
  }
}

export const jupiter = new JupiterPlanet(null, null, { radius: 120, width: 48, height: 48 });
