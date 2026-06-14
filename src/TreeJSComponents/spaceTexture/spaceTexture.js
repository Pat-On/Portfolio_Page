import * as THREE from "three";
// TEMP TEST: lowest-quality starmap to isolate the iOS memory crash. REVERT after test.
import space1k from "../../textures/starmap_1k.webp";

const spaceTexture = new THREE.TextureLoader().load(space1k);
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
