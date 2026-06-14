import * as THREE from "three";
import space8k from "../../textures/starmap_8k.webp";
import space4k from "../../textures/starmap_4k.webp";
import { IS_MOBILE } from "../../utils/mobileQuality";

// Mobile gets the 4K starmap (~33 MB) instead of 8K (~134 MB). A full-screen
// background never samples mipmaps, so disabling them saves a further ~33%.
const spaceTexture = new THREE.TextureLoader().load(IS_MOBILE ? space4k : space8k);
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;
if (IS_MOBILE) {
  spaceTexture.generateMipmaps = false;
  spaceTexture.minFilter = THREE.LinearFilter;
}

export { spaceTexture };
