import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

class NeptunePlanet extends Planet {
  build() {
    const group = new THREE.Group();
    group.add(super.build());

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.04, color: [0.24, 0.33, 0.73], opacity: 0.18, segments: 48 },
      { scale: 1.12, color: [0.32, 0.44, 0.85], opacity: 0.07, segments: 32 },
    ]);

    addGlowSprite(group, R, 2.6, [
      [0.0,  "rgba( 70, 100, 220, 1.0)"],
      [0.15, "rgba( 55,  85, 200, 0.72)"],
      [0.35, "rgba( 40,  65, 170, 0.30)"],
      [0.6,  "rgba( 20,  35, 120, 0.08)"],
      [1.0,  "rgba(  0,   0,   0, 0.0)"],
    ], 0.60);

    return group;
  }
}

export const neptune = new NeptunePlanet(null, null, { radius: 60, width: 64, height: 64 }, 0x3f54ba);
