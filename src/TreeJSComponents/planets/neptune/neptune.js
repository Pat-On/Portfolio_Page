import Planet from "../baseClassPlanet/baseClassPlanet";

// Neptune has so little detail that 1k is all any screen can show
import neptune1k from "../../../textures/1k_neptune.webp";

export const neptune = new Planet(neptune1k, null, { radius: 60, width: 32, height: 32 });
