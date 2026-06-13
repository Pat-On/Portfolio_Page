import * as THREE from "three";
import space8k from "../../textures/starmap_8k.webp";


const spaceTexture = new THREE.TextureLoader().load(space8k);
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
