import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { texSize } from "../../../utils/mobileQuality";

function buildSaturnBodyTexture() {
  const W = texSize(1024), H = texSize(512);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ead6b8";
  ctx.fillRect(0, 0, W, H);

  // 8 wide pale atmospheric bands
  const bands = [
    { y: 0.08, h: 0.10, color: "#e8d2b0" },
    { y: 0.20, h: 0.08, color: "#d4be9a" },
    { y: 0.30, h: 0.12, color: "#f0e0c4" },
    { y: 0.44, h: 0.10, color: "#c8b488" },
    { y: 0.56, h: 0.12, color: "#f0e0c4" },
    { y: 0.70, h: 0.08, color: "#d4be9a" },
    { y: 0.80, h: 0.10, color: "#e8d2b0" },
    { y: 0.92, h: 0.06, color: "#c8b488" },
  ];
  for (const { y, h, color } of bands) {
    ctx.fillStyle = color;
    ctx.fillRect(0, y * H, W, h * H);
    // Soft blend at edges
    for (const edge of [y, y + h]) {
      const grad = ctx.createLinearGradient(0, (edge - 0.025) * H, 0, (edge + 0.025) * H);
      grad.addColorStop(0, "rgba(240,220,185,0)");
      grad.addColorStop(0.5, "rgba(200,178,140,0.12)");
      grad.addColorStop(1, "rgba(240,220,185,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, (edge - 0.025) * H, W, 0.05 * H);
    }
  }
  return canvas;
}

function buildSaturnRingTexture() {
  const W = texSize(256), H = 8;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0.00, "rgba(210,185,140,0.0)");
  grad.addColorStop(0.05, "rgba(210,185,140,0.55)");
  grad.addColorStop(0.20, "rgba(210,185,140,0.65)");
  grad.addColorStop(0.38, "rgba(195,168,118,0.82)");
  grad.addColorStop(0.48, "rgba(80,70,50,0.0)");
  grad.addColorStop(0.54, "rgba(80,70,50,0.0)");
  grad.addColorStop(0.56, "rgba(200,175,128,0.62)");
  grad.addColorStop(0.72, "rgba(205,180,132,0.55)");
  grad.addColorStop(0.85, "rgba(175,152,105,0.38)");
  grad.addColorStop(1.00, "rgba(140,120,85,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Minor division stripes
  for (const u of [0.15, 0.28, 0.60, 0.76]) {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(u * W - 2, 0, 4, H);
  }
  return canvas;
}

class SaturnPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    // Body with procedural banded texture
    const bodyTex = new THREE.CanvasTexture(buildSaturnBodyTexture());
    const bodyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R, 32, 32),
      new THREE.MeshStandardMaterial({ map: bodyTex, metalness: 0.0, roughness: 0.92 })
    );
    group.add(bodyMesh);

    // Rings with Cassini division texture
    const ringGeo = new THREE.RingGeometry(R * 1.4, R * 2.3, 64);
    const pos = ringGeo.attributes.position;
    const uv  = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - R * 1.4) / (R * 0.9), 0.5);
    }

    const ringCanvas = buildSaturnRingTexture();
    const ringTex    = new THREE.CanvasTexture(ringCanvas);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      map: ringTex,
      alphaMap: new THREE.CanvasTexture(ringCanvas),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      metalness: 0.0,
      roughness: 0.95,
    }));
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    return group;
  }
}

export const saturn = new SaturnPlanet(null, null, { radius: 100, width: 32, height: 32 }, 0xead6b8);
