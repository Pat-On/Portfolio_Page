import * as THREE from "three";
import space1k from "../../textures/starmap_1k.webp";
import space2k from "../../textures/starmap_2k.webp";
import space4k from "../../textures/starmap_4k.webp";

function pickTextureSrc() {
  const px = window.screen.width * (window.devicePixelRatio || 1);
  if (px <= 1280) return space1k;
  if (px < 1920) return space2k;
  return space4k;
}

const spaceTexture = new THREE.TextureLoader().load(pickTextureSrc());
spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

export { spaceTexture };
