import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import jupiter2k from "../../../textures/2k_jupiter.webp";
import jupiter1k from "../../../textures/1k_jupiter.webp";

// No relief map: a gas giant has no surface to cast one
export const jupiter = new Planet(pickMap(jupiter2k, jupiter1k), null, { radius: 120, width: 48, height: 48 });
