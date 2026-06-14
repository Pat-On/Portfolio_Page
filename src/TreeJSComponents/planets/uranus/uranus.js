import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { texSize } from "../../../utils/mobileQuality";

function buildUranusTexture() {
  const W = texSize(512), H = texSize(512);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#72d7d7";
  ctx.fillRect(0, 0, W, H);

  // Polar darkening at north and south
  for (const cy of [0, H]) {
    const grad = ctx.createRadialGradient(W / 2, cy, W * 0.05, W / 2, cy, W * 0.65);
    grad.addColorStop(0, "rgba(50,140,150,0.22)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Faint equatorial haze band
  const haze = ctx.createLinearGradient(0, H * 0.42, 0, H * 0.58);
  haze.addColorStop(0, "rgba(0,0,0,0)");
  haze.addColorStop(0.5, "rgba(110,200,210,0.08)");
  haze.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, H * 0.42, W, H * 0.16);

  return canvas;
}

function buildUranusRingTexture() {
  const W = texSize(256), H = 8;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0.00, "rgba(80,110,130,0.0)");
  grad.addColorStop(0.15, "rgba(80,110,130,0.45)");
  grad.addColorStop(0.35, "rgba(90,120,140,0.58)");
  grad.addColorStop(0.55, "rgba(85,115,135,0.52)");
  grad.addColorStop(0.75, "rgba(75,105,125,0.42)");
  grad.addColorStop(1.00, "rgba(70,100,120,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Narrow ring multiplicity stripes
  for (const u of [0.22, 0.40, 0.58, 0.74]) {
    ctx.fillStyle = "rgba(20,30,45,0.28)";
    ctx.fillRect(u * W - 1.5, 0, 3, H);
  }
  return canvas;
}

class UranusPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    const tex = new THREE.CanvasTexture(buildUranusTexture());
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 32, 32),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.0, roughness: 0.90 })
    ));

    // Rings — tilted 90° (Uranus lies on its side)
    const ringGeo = new THREE.RingGeometry(R * 1.5, R * 2.0, 64);
    const pos = ringGeo.attributes.position;
    const uv  = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - R * 1.5) / (R * 0.5), 0.5);
    }

    const ringCanvas = buildUranusRingTexture();
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(ringCanvas),
      alphaMap: new THREE.CanvasTexture(ringCanvas),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      metalness: 0.0,
      roughness: 1.0,
    }));
    ring.rotation.z = Math.PI / 2;
    group.add(ring);

    return group;
  }
}

export const uranus = new UranusPlanet(null, null, { radius: 65, width: 32, height: 32 });
