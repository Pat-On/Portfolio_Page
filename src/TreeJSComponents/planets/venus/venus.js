import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { makeAtmosphere } from "../atmosphere/atmosphere";
import { IS_MOBILE } from "../../../utils/mobileQuality";
import venusTexture from "../../../textures/2k_venus_surface.webp";
import normalTextureMoon from "../../../textures/normal.webp";

class VenusPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    group.add(super.build());

    // Thick sulfuric atmosphere: one warm fresnel rim in place of two
    // flat-opacity shells that tinted the whole disc
    group.add(makeAtmosphere({
      radius: R * 1.14,
      color: 0xe8b860,
      intensity: 1.3,
      power: 1.4,
      widthSegments: IS_MOBILE ? 24 : 32,
      heightSegments: IS_MOBILE ? 12 : 16,
    }));

    return group;
  }
}

export const venus = new VenusPlanet(venusTexture, normalTextureMoon, { radius: 45, width: 32, height: 32 });
