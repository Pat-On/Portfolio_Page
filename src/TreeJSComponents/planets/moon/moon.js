import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import moon2k from "../../../textures/2k_moon.webp";
import moon1k from "../../../textures/1k_moon.webp";
import normalTextureMoon from "../../../textures/normal.webp";

export const moon = new Planet(pickMap(moon2k, moon1k), normalTextureMoon, {
  radius: 30,
  width: 32,
  height: 32,
});
