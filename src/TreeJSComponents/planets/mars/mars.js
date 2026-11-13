import Planet from "../baseClassPlanet/baseClassPlanet";
import { pickMap } from "../../../utils/mobileQuality";

import mars2k from "../../../textures/2k_mars.webp";
import mars1k from "../../../textures/1k_mars.webp";
import marsRelief from "../../../textures/1k_mars_normal.webp";

export const mars = new Planet(pickMap(mars2k, mars1k), marsRelief, { radius: 30, width: 32, height: 32 });
