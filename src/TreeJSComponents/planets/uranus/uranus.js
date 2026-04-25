import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { addAtmosphere, addGlowSprite } from "../../utils/atmosphereGlow";

class UranusPlanet extends Planet {
  build() {
    const group = new THREE.Group();

    const sphere = super.build();
    // Uranus has ~98° axial tilt — it orbits essentially on its side
    sphere.rotation.z = THREE.MathUtils.degToRad(98);
    group.add(sphere);

    const R = this.sphereParams.radius;

    addAtmosphere(group, R, [
      { scale: 1.03, color: [0.44, 0.84, 0.84], opacity: 0.12, segments: 48 },
      { scale: 1.08, color: [0.55, 0.90, 0.90], opacity: 0.05, segments: 32 },
    ]);

    addGlowSprite(group, R, 2.4, [
      [0.0,  "rgba(100, 210, 210, 1.0)"],
      [0.15, "rgba( 80, 190, 195, 0.65)"],
      [0.35, "rgba( 60, 165, 175, 0.25)"],
      [0.6,  "rgba( 30, 120, 140, 0.07)"],
      [1.0,  "rgba(  0,   0,   0, 0.0)"],
    ], 0.50);

    return group;
  }
}

export const uranus = new UranusPlanet(null, null, { radius: 65, width: 64, height: 64 }, 0x72d7d7);
