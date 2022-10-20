import * as THREE from "three";

export default class Planet {
  constructor(mapTexture, normalMap, sphereParams) {
    this.mapTexture = mapTexture;
    this.normalMap = normalMap;
    this.sphereParams = sphereParams;
  }
  build() {
    const planetTexture = new THREE.TextureLoader().load(this.mapTexture);
    const normalTexture = new THREE.TextureLoader().load(this.normalMap);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(
        this.sphereParams.radius,
        this.sphereParams.width,
        this.sphereParams.height
      ),
      new THREE.MeshStandardMaterial({
        map: planetTexture,
        normalMap: normalTexture,
      })
    );
    return planet;
  }
}
