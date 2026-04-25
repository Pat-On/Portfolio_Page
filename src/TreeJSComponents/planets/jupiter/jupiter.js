import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";

function makeJupiterTexture() {
  const w = 512, h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // Base tan background
  ctx.fillStyle = "#c9a96e";
  ctx.fillRect(0, 0, w, h);

  // Horizontal atmospheric bands — drawn as filled horizontal strips
  const bands = [
    { y: 0.00, height: 0.06, color: "rgba(180, 130, 80, 0.9)" },
    { y: 0.06, height: 0.04, color: "rgba(220, 190, 140, 0.7)" },
    { y: 0.10, height: 0.08, color: "rgba(160, 100, 55, 0.85)" },
    { y: 0.18, height: 0.05, color: "rgba(230, 200, 150, 0.6)" },
    { y: 0.23, height: 0.10, color: "rgba(175, 115, 60, 0.9)" },
    { y: 0.33, height: 0.04, color: "rgba(240, 215, 165, 0.65)" },
    { y: 0.37, height: 0.12, color: "rgba(190, 135, 70, 0.8)" },  // equatorial belt
    { y: 0.49, height: 0.05, color: "rgba(235, 205, 155, 0.7)" },
    { y: 0.54, height: 0.09, color: "rgba(170, 110, 58, 0.85)" },
    { y: 0.63, height: 0.04, color: "rgba(225, 195, 145, 0.6)" },
    { y: 0.67, height: 0.08, color: "rgba(158, 98,  50, 0.8)" },
    { y: 0.75, height: 0.05, color: "rgba(215, 180, 130, 0.65)" },
    { y: 0.80, height: 0.07, color: "rgba(172, 118, 62, 0.75)" },
    { y: 0.87, height: 0.07, color: "rgba(195, 155, 95, 0.7)" },
    { y: 0.94, height: 0.06, color: "rgba(155,  95, 48, 0.8)" },
  ];

  for (const b of bands) {
    const grad = ctx.createLinearGradient(0, b.y * h, 0, (b.y + b.height) * h);
    grad.addColorStop(0,   "rgba(0,0,0,0)");
    grad.addColorStop(0.2, b.color);
    grad.addColorStop(0.8, b.color);
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, b.y * h, w, b.height * h);
  }

  // Great Red Spot — warm reddish-brown oval in the southern equatorial region
  const grsX = w * 0.62, grsY = h * 0.60;
  const grsRx = w * 0.055, grsRy = h * 0.07;
  const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, grsRx);
  grsGrad.addColorStop(0.0, "rgba(185, 75, 35, 0.85)");
  grsGrad.addColorStop(0.5, "rgba(200, 95, 45, 0.55)");
  grsGrad.addColorStop(1.0, "rgba(210, 130, 70, 0.0)");
  ctx.save();
  ctx.scale(1, grsRy / grsRx);
  ctx.fillStyle = grsGrad;
  ctx.beginPath();
  ctx.arc(grsX, grsY * (grsRx / grsRy), grsRx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

class JupiterPlanet extends Planet {
  buildMaterial() {
    return new THREE.MeshStandardMaterial({
      map: makeJupiterTexture(),
      roughness: 0.80,
      metalness: 0.0,
    });
  }
}

export const jupiter = new JupiterPlanet(null, null, { radius: 120, width: 64, height: 64 });
