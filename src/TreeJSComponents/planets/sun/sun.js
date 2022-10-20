import * as THREE from "three";
import sunTexture from "../../../textures/2k_sun.jpeg";
//sun object
// const color = new THREE.Color("#FDB813");
// const geometry = new THREE.IcosahedronGeometry(1, 15);
// const material = new THREE.MeshBasicMaterial({ color: color });
// const sphere = new THREE.Mesh(geometry, material);
// sphere.position.set(10, 10, 10);
// sphere.layers.set(1);

import Planet from "../baseClassPlanet/baseClassPlanet";
import normalTextureMoon from "../../../textures/normal.jpeg";

// const sunMaterial = new THREE.MeshStandardMaterial({
//   emissive: 0xffd700,
//   emissiveMap: new THREE.TextureLoader().load(sunTexture),
//   emissiveIntensity: 1,
// });

// const sunGeometry = new THREE.SphereGeometry(320, 200, 200);
// const sun = new THREE.Mesh(sunGeometry, sunMaterial);

const sun = new Planet(sunTexture, normalTextureMoon, {
  radius: 420,
  width: 200,
  height: 200,
});

export { sun };
