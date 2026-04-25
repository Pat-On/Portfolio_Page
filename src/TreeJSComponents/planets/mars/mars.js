import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

class MarsPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.04, color: [0.78, 0.39, 0.24], opacity: 0.10, segments: 48 },
    ]);

    addGlowSprite(group, R, 2.2, [
      [0.0,  "rgba(200, 100, 60, 1.0)"],
      [0.18, "rgba(180,  80, 40, 0.5)"],
      [0.4,  "rgba(150,  50, 20, 0.18)"],
      [0.7,  "rgba(100,  20,  0, 0.04)"],
      [1.0,  "rgba(0,     0,  0, 0.0)"],
    ], 0.40);

    return group;
  }
}

export const mars = new MarsPlanet(null, null, { radius: 30, width: 64, height: 64 }, 0xc1440e);
