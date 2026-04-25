import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

import venusTexture from "../../../textures/2k_venus_surface.jpeg";
import normalTexture from "../../../textures/normal.jpeg";

class VenusPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.06, color: [1.0, 0.78, 0.30], opacity: 0.22, segments: 48 },
      { scale: 1.18, color: [1.0, 0.90, 0.50], opacity: 0.08, segments: 32 },
    ]);

    addGlowSprite(group, R, 2.5, [
      [0.0,  "rgba(255, 210, 80, 1.0)"],
      [0.15, "rgba(255, 180, 50, 0.75)"],
      [0.35, "rgba(220, 140, 20, 0.35)"],
      [0.6,  "rgba(180,  90,  0, 0.09)"],
      [1.0,  "rgba(0,     0,  0, 0.0)"],
    ], 0.65);

    return group;
  }
}

export const venus = new VenusPlanet(venusTexture, normalTexture, {
  radius: 45,
  width: 64,
  height: 64,
  normalScale: 0.4,
});
