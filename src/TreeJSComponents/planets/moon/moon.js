import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import moon2k from "../../../textures/2k_moon.webp";
import moon1k from "../../../textures/1k_moon.webp";
import moonRelief from "../../../textures/1k_moon_normal.webp";

export const moon = new Planet(pickMap(moon2k, moon1k), moonRelief, {
  radius: 30,
  width: 32,
  height: 32,
});
