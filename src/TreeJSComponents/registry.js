/* eslint-disable no-unused-vars */
// TEMP TEST: scene stripped to isolate the iOS Safari memory crash. REVERT after test.
import { moon, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune } from "./planets/solarSystem";
import { deathStar } from "./spaceship/deathStar";
import { spaceship } from "./spaceship/spaceship";
import { enterprise } from "./spaceship/enterprise";
import { borgCube } from "./spaceship/borg";
import { falcon } from "./spaceship/falcon";
import { isd } from "./spaceship/isd";

export const SUN_POS = { x: 350, y: 300, z: -900 };

// TEMP TEST: both lists emptied — no planets/ships built. REVERT to restore.
export const celestialBodies = [];
export const ships = [];
