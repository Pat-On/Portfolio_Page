import Planet from "../baseClassPlanet/baseClassPlanet";

import mercuryTexture from "../../../textures/2k_mercury.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

export const mercury = new Planet(mercuryTexture, normalTextureMoon, {
  radius: 35,
  width: 32,
  height: 32,
});
