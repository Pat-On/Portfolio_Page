import * as THREE from "three";
import { srgb } from "../textureUtils";
import space8k from "../../textures/starmap_8k.webp";
import space4k from "../../textures/starmap_4k.webp";
import { IS_MOBILE } from "../../utils/mobileQuality";

// Mobile gets the 4K starmap (~33 MB) instead of 8K (~134 MB, RGBA). On a
// phone the 4K map is magnified (fewer texels across the view than pixels), so
// its mipmaps would never be sampled: skipping them saves a further ~33%.
// The map is drawn by skyDome.js, not as scene.background.
const spaceTexture = srgb(new THREE.TextureLoader().load(IS_MOBILE ? space4k : space8k));
if (IS_MOBILE) {
  spaceTexture.generateMipmaps = false;
  spaceTexture.minFilter = THREE.LinearFilter;
}

export { spaceTexture };
