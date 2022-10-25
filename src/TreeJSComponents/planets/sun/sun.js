import sunTexture from "../../../textures/2k_sun.jpeg";

import Planet from "../baseClassPlanet/baseClassPlanet";
import normalTextureMoon from "../../../textures/normal.jpeg";

const sun = new Planet(sunTexture, normalTextureMoon, {
  radius: 420,
  width: 200,
  height: 200,
});

export { sun };
