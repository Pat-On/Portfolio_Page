import * as THREE from "three";
import space1k from "../../textures/starmap_1k.webp";
import space2k from "../../textures/starmap_2k.webp";
import space4k from "../../textures/starmap_4k.webp";

function pickTextureSrc() {
  const px = window.screen.width * (window.devicePixelRatio || 1);
  if (px <= 900) return space1k;  // small / budget phones
  if (px < 1300) return space2k;  // ~1080p-class phones
  return space4k;                 // S22 Ultra (~1442), retina laptops, desktops
}

const spaceTexture = new THREE.TextureLoader().load(pickTextureSrc());
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
