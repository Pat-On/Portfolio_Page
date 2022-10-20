import Planet from "../baseClassPlanet/baseClassPlanet";

import venusTexture from "../../../textures/2k_venus_surface.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

export const venus = new Planet(venusTexture, normalTextureMoon, {
  radius: 45,
  width: 32,
  height: 32,
});
