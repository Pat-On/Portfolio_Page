import { io, europa, ganymede, callisto, titan } from "./planets/solarSystem";
import { moon, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune } from "./planets/solarSystem";
import { deathStar } from "./spaceship/deathStar";
import { spaceship } from "./spaceship/spaceship";
import { enterprise } from "./spaceship/enterprise";
import { borgCube } from "./spaceship/borg";
import { falcon } from "./spaceship/falcon";
import { isd } from "./spaceship/isd";

import { SUN_POS } from "./sunPosition";

export { SUN_POS };

// Each body's `position` is its position in the orbital wrapper's local frame
// (or its own frame for top-level objects). The wrapper itself sits at SUN_POS,
// so e.g. mercury at z=700 appears 700 units in front of the sun.
// `wrap: false` skips the wrapper — used for the sun, which has no orbit of its own.
// `tilt` is the real axial tilt in degrees (planets/axialTilt.js); a negative
// `spinSpeed` is a planet that turns backwards. Spin speeds keep the real order
// of day lengths, not their ratios: Venus's day is 243 Earth days.
export const celestialBodies = [
  { name: "sun",       builder: sun,       position: SUN_POS, wrap: false,
    spinSpeed: 0.001 },
  { name: "mercury",   builder: mercury,   position: { x: 0, y: 0,    z: 700  },
    orbitSpeed: 0.005,   spinSpeed: 0.0003 },
  { name: "venus",     builder: venus,     position: { x: 0, y: 0,    z: 900  },
    orbitSpeed: 0.0025,  spinSpeed: -0.0002, tilt: 2.6 },
  {
    name: "earth", builder: earth, position: { x: 650, y: 450, z: 1300 },
    orbitSpeed: 0.002, spinSpeed: 0.0015, tilt: 23.4,
    children: [{ name: "moon", builder: moon, position: { x: 150, y: 0, z: 0 },
                 orbitSpeed: 0.008, spinSpeed: 0.002 }],
  },
  { name: "mars",      builder: mars,      position: { x: 0, y: 100,  z: 1700 },
    orbitSpeed: 0.0016,  spinSpeed: 0.0014, tilt: 25.2 },
  { name: "jupiter",   builder: jupiter,   position: { x: 0, y: 0,    z: 2500 },
    orbitSpeed: 0.001,   spinSpeed: 0.003, tilt: 3.1,
    // The Galilean moons, in the planet's equator; inner ones go round faster
    children: [
      { name: "io",       builder: io,       position: { x: 190,  y: 0, z: 0 },    orbitSpeed: 0.0055, spinSpeed: 0.002, equatorial: true },
      { name: "europa",   builder: europa,   position: { x: -140, y: 0, z: 190 },  orbitSpeed: 0.0038, spinSpeed: 0.002, equatorial: true },
      { name: "ganymede", builder: ganymede, position: { x: 100,  y: 0, z: -275 }, orbitSpeed: 0.0025, spinSpeed: 0.0015, equatorial: true },
      { name: "callisto", builder: callisto, position: { x: -330, y: 0, z: -120 }, orbitSpeed: 0.0015, spinSpeed: 0.001, equatorial: true },
    ] },
  { name: "saturn",    builder: saturn,    position: { x: 0, y: -100, z: 3400 },
    orbitSpeed: 0.0008,  spinSpeed: 0.0025, tilt: 26.7,
    // Titan circles in the plane of the rings, outside them
    children: [
      { name: "titan", builder: titan, position: { x: -190, y: 0, z: 260 }, orbitSpeed: 0.002, spinSpeed: 0.001, equatorial: true },
    ] },
  { name: "uranus",    builder: uranus,    position: { x: 0, y: 150,  z: 4300 },
    orbitSpeed: 0.0006,  spinSpeed: -0.0018, tilt: 97.8 },
  { name: "neptune",   builder: neptune,   position: { x: 0, y: 0,    z: 5200 },
    orbitSpeed: 0.0005,  spinSpeed: 0.0016, tilt: 28.3 },
  { name: "deathStar", builder: deathStar, position: { x: -600, y: -300, z: 7200 },
    orbitSpeed: 0.00018, spinSpeed: 0.0006 },
];

export const ships = [
  { name: "spaceship",  builder: spaceship,  position: { x: 1300, y: 720, z:  900 } },
  { name: "enterprise", builder: enterprise, position: { x:  400, y: 500, z: 3100 }, rotationY: Math.PI, scale: 1.5 },
  { name: "borg",       builder: borgCube,   position: { x:  550, y: 300, z: 4850 } },
  { name: "falcon",     builder: falcon,     position: { x:  200, y: 380, z: 1900 }, rotationY: Math.PI },
  { name: "isd",        builder: isd,        position: { x:  150, y: 210, z: 6100 }, rotationY: -Math.PI / 2 },
];
