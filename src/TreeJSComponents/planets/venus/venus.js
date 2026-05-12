import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import venusTexture from "../../../textures/2k_venus_surface.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

class VenusPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    group.add(super.build());

    // Inner sulfuric cloud haze
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.02, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xd09030,
        transparent: true,
        opacity: 0.10,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      })
    ));

    // Outer atmosphere glow
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.08, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xe8c060,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      })
    ));

    return group;
  }
}

export const venus = new VenusPlanet(venusTexture, normalTextureMoon, { radius: 45, width: 32, height: 32 });
