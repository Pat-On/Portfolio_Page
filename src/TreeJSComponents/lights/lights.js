import * as THREE from "three";
import { SUN_POS } from "../registry";

// The sun is the scene's key light. decay 0 / distance 0: three.js's default
// physical falloff would let it die out a few hundred units from the sun,
// leaving the planets lit only by the ambient fill.
const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
sunLight.position.set(SUN_POS.x, SUN_POS.y, SUN_POS.z);

// A low fill so the night side of a planet is dark but not black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);

export { sunLight, ambientLight };
