import * as THREE from "three";
import { srgb } from "../../textureUtils";
import Planet, { loadSurface } from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";
import saturn2k from "../../../textures/2k_saturn.webp";
import saturn1k from "../../../textures/1k_saturn.webp";
import saturnRing from "../../../textures/saturn_ring.webp";
import { shadeBody, shadeRing } from "./ringShadows";

class SaturnPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    const bodyMat = new THREE.MeshStandardMaterial({
      map: loadSurface(pickMap(saturn2k, saturn1k)), metalness: 0.0, roughness: 0.92,
    });
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 32), bodyMat);
    group.add(bodyMesh);

    // Rings with Cassini division texture
    const RING_INNER = R * 1.4, RING_OUTER = R * 2.3;
    const ringGeo = new THREE.RingGeometry(RING_INNER, RING_OUTER, 64);
    const pos = ringGeo.attributes.position;
    const uv  = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      uv.setXY(i, (r - RING_INNER) / (RING_OUTER - RING_INNER), 0.5);
    }

    // The real rings as one strip from inner to outer edge: colour, and
    // see-through where the real ones are (the Cassini division, the faint C ring)
    const ringTex = srgb(new THREE.TextureLoader().load(saturnRing));
    const ring = new THREE.Mesh(ringGeo, shadeRing(new THREE.MeshBasicMaterial({
      // Unlit: with the sun as the only key light a lit ring, struck edge-on,
      // goes black. Basic is also the cheapest material to shade.
      color: 0xe6dfd2,
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    }), { planetRadius: R }));
    // The planet's shadow falls across the rings, and the rings' on the planet
    shadeBody(bodyMat, { ringMap: ringTex, inner: RING_INNER, outer: RING_OUTER });
    // Flat in the equatorial plane; the lean is Saturn's axial tilt (registry)
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    return group;
  }
}

export const saturn = new SaturnPlanet(null, null, { radius: 100, width: 32, height: 32 }, 0xead6b8);
