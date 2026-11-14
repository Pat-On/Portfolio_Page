import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { makeAtmosphere } from "../atmosphere/atmosphere";
import { SUN_POS } from "../../sunPosition";
import { IS_MOBILE, pickMap } from "../../../utils/mobileQuality";
import { earthSurface, cloudLayer } from "./earthSurface";
import extras2k from "../../../textures/2k_earth_extras.webp";
import extras1k from "../../../textures/1k_earth_extras.webp";
import earth2k from "../../../textures/2k_earth_daymap.webp";
import earth1k from "../../../textures/1k_earth_daymap.webp";
import earthRelief from "../../../textures/1k_earth_normal.webp";

class EarthPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    // Night lights (R), clouds (G) and oceans (B) in one picture, shared by
    // the surface shader and the cloud layer
    const extras = new THREE.TextureLoader().load(pickMap(extras2k, extras1k));
    extras.wrapS = THREE.RepeatWrapping; // the cloud shadow looks up past the seam
    if (IS_MOBILE) {
      extras.generateMipmaps = false;
      extras.minFilter = THREE.LinearFilter;
    }

    const surface = super.build();
    earthSurface(surface.material, { extras });
    group.add(surface);
    group.userData.surface = surface;

    // Atmosphere: a thin blue fresnel rim, brightest at the limb. Low
    // segment counts are plenty for a soft glow.
    group.add(makeAtmosphere({
      radius: R * 1.12,
      color: 0x5aa0ff,
      intensity: 1.6,
      power: 1.6,
      sunPosition: SUN_POS, // lit on the day side, dark on the night side
      widthSegments: IS_MOBILE ? 24 : 32,
      heightSegments: IS_MOBILE ? 12 : 16,
    }));

    // Cloud layer: real weather, see-through where the sky is clear (the
    // alpha map reads the picture's green channel, which holds the clouds)
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.015, 32, 32),
      cloudLayer(new THREE.MeshStandardMaterial({
        color: 0xffffff,
        alphaMap: extras,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        metalness: 0.0,
        roughness: 1.0,
      }))
    );
    group.add(cloudMesh);
    group.userData.cloudMesh = cloudMesh;

    return group;
  }
}

export const earth = new EarthPlanet(pickMap(earth2k, earth1k), earthRelief, { radius: 55, width: 32, height: 32 });
