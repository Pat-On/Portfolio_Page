import Planet from "../baseClassPlanet/baseClassPlanet";

import mercuryTexture from "../../../textures/2k_mercury.webp";
import normalTextureMoon from "../../../textures/normal.webp";

export const mercury = new Planet(mercuryTexture, normalTextureMoon, {
  radius: 35,
  width: 32,
  height: 32,
});
