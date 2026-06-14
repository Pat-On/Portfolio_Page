import * as THREE from "three";
import { IS_MOBILE } from "../../../utils/mobileQuality";

export default class Planet {
  constructor(mapTexture, normalMap, sphereParams, color = null) {
    this.mapTexture = mapTexture;
    this.normalMap = normalMap;
    this.sphereParams = sphereParams;
    this.color = color;
  }

  buildMaterial() {
    if (this.mapTexture) {
      const map = new THREE.TextureLoader().load(this.mapTexture);
      if (IS_MOBILE) {
        map.generateMipmaps = false;
        map.minFilter = THREE.LinearFilter;
      }
      const params = { map, metalness: 0.05, roughness: 0.85 };
      // Skip normal maps on mobile — they're the single biggest texture cost
      // (a separate GPU copy per planet) and barely visible at this scale.
      if (!IS_MOBILE && this.normalMap) {
        params.normalMap = new THREE.TextureLoader().load(this.normalMap);
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
