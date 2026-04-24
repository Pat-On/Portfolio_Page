import * as THREE from "three";

export default class Planet {
  constructor(mapTexture, normalMap, sphereParams, color = null) {
    this.mapTexture = mapTexture;
    this.normalMap = normalMap;
    this.sphereParams = sphereParams;
    this.color = color;
  }

  buildMaterial() {
    if (this.mapTexture) {
      return new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(this.mapTexture),
        normalMap: new THREE.TextureLoader().load(this.normalMap),
      });
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
