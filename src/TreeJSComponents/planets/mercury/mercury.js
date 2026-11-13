import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import mercury2k from "../../../textures/2k_mercury.webp";
import mercury1k from "../../../textures/1k_mercury.webp";
import mercuryRelief from "../../../textures/1k_mercury_normal.webp";

export const mercury = new Planet(pickMap(mercury2k, mercury1k), mercuryRelief, {
  radius: 35,
  width: 32,
  height: 32,
});
