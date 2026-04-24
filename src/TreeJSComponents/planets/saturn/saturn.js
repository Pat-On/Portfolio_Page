import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";

class SaturnPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const ringGeo = new THREE.RingGeometry(
      this.sphereParams.radius * 1.4,
      this.sphereParams.radius * 2.3,
      64
    );

    // Remap UVs so a radial gradient texture would work; also fine for flat color.
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - this.sphereParams.radius * 1.4) / (this.sphereParams.radius * 0.9), 0.5);
    }

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc2a870,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    return group;
  }
}

export const saturn = new SaturnPlanet(null, null, { radius: 100, width: 32, height: 32 }, 0xead6b8);
