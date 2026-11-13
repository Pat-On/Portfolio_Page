import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import mercury2k from "../../../textures/2k_mercury.webp";
import mercury1k from "../../../textures/1k_mercury.webp";
import normalTextureMoon from "../../../textures/normal.webp";

export const mercury = new Planet(pickMap(mercury2k, mercury1k), normalTextureMoon, {
  radius: 35,
  width: 32,
  height: 32,
});
