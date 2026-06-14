import * as THREE from "three";
import space8k from "../../textures/starmap_8k.webp";
import space4k from "../../textures/starmap_4k.webp";
import space2k from "../../textures/starmap_2k.webp";
import { isMobileDevice } from "../../utils/isMobileDevice";


function pickStarmap() {
  if (isMobileDevice()) {
    // High-DPI phones can handle 4K (~33 MB); keep low-DPI / older devices at
    // 2K (~8 MB) where the memory ceiling is lowest.
    return window.devicePixelRatio > 2 ? space4k : space2k;
  }
  return space8k;
}

const spaceTexture = new THREE.TextureLoader().load(pickStarmap());
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
