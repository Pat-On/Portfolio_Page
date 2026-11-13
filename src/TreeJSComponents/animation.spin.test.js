import * as THREE from "three";

// animation.js imports the registry, which builds every planet's textures on
// a canvas; jsdom has none. spinBodies takes the bodies as an argument.
jest.mock("./registry", () => ({ celestialBodies: [] }));
jest.mock("./spaceship/plume", () => ({ setPlume: jest.fn() }));

const { spinBodies } = require("./animation");
const Y = new THREE.Vector3(0, 1, 0);

const makeView = () => {
  const view = {};
  for (const name of ["Earth", "Venus", "Moon", "Sun"]) view[`rendered${name}`] = new THREE.Object3D();
  for (const name of ["earth", "venus", "moon"]) view[`${name}Obj`] = new THREE.Object3D();
  return view;
};

const bodies = [
  { name: "sun", spinSpeed: 0.001 },
  { name: "venus", orbitSpeed: 0.0025, spinSpeed: -0.0002, tilt: 2.6 },
  { name: "earth", orbitSpeed: 0.002, spinSpeed: 0.0015, tilt: 23.4,
    children: [{ name: "moon", orbitSpeed: 0.008, spinSpeed: 0.002 }] },
];

describe("spinBodies()", () => {
  test("a tilted planet's axis stays fixed in space while it orbits and spins", () => {
    const view = makeView();
    const axis = () => Y.clone().applyQuaternion(view.earthObj.quaternion.clone().multiply(view.renderedEarth.quaternion));
    spinBodies(view, bodies, 1);
    const first = axis();
    for (let i = 0; i < 500; i++) spinBodies(view, bodies, 1);
    expect(view.earthObj.rotation.y).toBeCloseTo(0.002 * 501, 6);
    expect(first.distanceTo(axis())).toBeCloseTo(0, 5);
    expect(THREE.MathUtils.radToDeg(first.angleTo(Y))).toBeCloseTo(23.4, 3);
  });

  test("keeps the spin angle on the mesh; Venus turns backwards", () => {
    const view = makeView();
    spinBodies(view, bodies, 10);
    expect(view.renderedEarth.userData.spinAngle).toBeCloseTo(0.015, 6);
    expect(view.renderedVenus.userData.spinAngle).toBeCloseTo(-0.002, 6);
  });

  test("bodies without a tilt and child moons still spin and orbit about the vertical", () => {
    const view = makeView();
    spinBodies(view, bodies, 2);
    expect(view.renderedSun.rotation.y).toBeCloseTo(0.002, 6);
    expect(view.renderedMoon.rotation.y).toBeCloseTo(0.004, 6);
    expect(view.moonObj.rotation.y).toBeCloseTo(0.016, 6);
  });

  test("skips bodies the view has not built", () => {
    expect(() => spinBodies({}, bodies, 1)).not.toThrow();
  });
});
