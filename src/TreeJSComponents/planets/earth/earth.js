import Planet from "../baseClassPlanet/baseClassPlanet";

import earthTexture from "../../../textures/2k_earth_daymap.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

export const earth = new Planet(earthTexture, normalTextureMoon, {
  radius: 55,
  width: 32,
  height: 32,
});
