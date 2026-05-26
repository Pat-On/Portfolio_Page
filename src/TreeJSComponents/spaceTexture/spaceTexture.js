import * as THREE from "three";
import space from "../../textures/starmap_4k.jpg";

const spaceTexture = new THREE.TextureLoader().load(space);
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
