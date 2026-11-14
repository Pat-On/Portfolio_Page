import * as THREE from "three";
import { srgb, normalMapTex } from "../../textureUtils";
import { IS_MOBILE } from "../../../utils/mobileQuality";

// A planet's surface photo, tagged sRGB. Phones skip mipmaps: their maps are
// already small, and mipmaps would add a third to each one's memory.
export function loadSurface(url) {
  const map = srgb(new THREE.TextureLoader().load(url));
  if (IS_MOBILE) {
    map.generateMipmaps = false;
    map.minFilter = THREE.LinearFilter;
  }
  return map;
}

export default class Planet {
  constructor(mapTexture, normalMap, sphereParams, color = null) {
    this.mapTexture = mapTexture;
    this.normalMap = normalMap;
    this.sphereParams = sphereParams;
    this.color = color;
  }

  buildMaterial() {
    if (this.mapTexture) {
      const map = loadSurface(this.mapTexture);
      const params = { map, metalness: 0.05, roughness: 0.85 };
      // Skip normal maps on mobile — barely visible at this scale. On desktop
      // every planet shares one texture per URL (one GPU upload).
      if (!IS_MOBILE && this.normalMap) {
        params.normalMap = normalMapTex(this.normalMap);
      }
      return new THREE.MeshStandardMaterial(params);
    }
    return new THREE.MeshStandardMaterial({
      color: this.color || 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
    });
  }

  build() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(
        this.sphereParams.radius,
        this.sphereParams.width,
        this.sphereParams.height
      ),
      this.buildMaterial()
    );
  }
}
