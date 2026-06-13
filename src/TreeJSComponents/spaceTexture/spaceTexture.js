import * as THREE from "three";
import space4k from "../../textures/starmap_4k.webp";


const spaceTexture = new THREE.TextureLoader().load(space4k);
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
