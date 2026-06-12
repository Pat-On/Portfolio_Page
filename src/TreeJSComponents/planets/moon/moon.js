import Planet from "../baseClassPlanet/baseClassPlanet";

import moonTexture2 from "../../../textures/671_PIA17386.webp";
import normalTextureMoon from "../../../textures/normal.webp";

export const moon = new Planet(moonTexture2, normalTextureMoon, {
  radius: 30,
  width: 32,
  height: 32,
});
