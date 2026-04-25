import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

import earthTexture from "../../../textures/2k_earth_daymap.jpeg";
import normalTexture from "../../../textures/normal.jpeg";

class EarthPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.035, color: [0.24, 0.47, 1.0],  opacity: 0.15, segments: 48 },
      { scale: 1.10,  color: [0.35, 0.60, 1.0],  opacity: 0.06, segments: 32 },
    ]);

    addGlowSprite(group, R, 3.0, [
      [0.0,  "rgba(60, 120, 255, 1.0)"],
      [0.15, "rgba(50, 100, 220, 0.7)"],
      [0.35, "rgba(30,  80, 180, 0.3)"],
      [0.6,  "rgba(10,  40, 120, 0.08)"],
      [1.0,  "rgba(0,    0,   0, 0.0)"],
    ], 0.7);

    return group;
  }
}

export const earth = new EarthPlanet(earthTexture, normalTexture, {
  radius: 55,
  width: 64,
  height: 64,
  normalScale: 0.4,
});
