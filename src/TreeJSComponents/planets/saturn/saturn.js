import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";

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
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const ringGeo = new THREE.RingGeometry(
      this.sphereParams.radius * 1.4,
      this.sphereParams.radius * 2.3,
      128
    );

    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - this.sphereParams.radius * 1.4) / (this.sphereParams.radius * 0.9), 0.5);
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

export const saturn = new SaturnPlanet(null, null, { radius: 100, width: 64, height: 64 }, 0xead6b8);
