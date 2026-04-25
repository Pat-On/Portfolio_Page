import Planet from "../baseClassPlanet/baseClassPlanet";

import moonTexture2 from "../../../textures/671_PIA17386.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

export const moon = new Planet(moonTexture2, normalTextureMoon, {
  radius: 30,
  width: 64,
  height: 64,
  normalScale: 2.5,
});
