// jsdom has no 2D canvas; the moons paint their surfaces on one.
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy(
    { createRadialGradient: () => ({ addColorStop: noop }),
      createLinearGradient: () => ({ addColorStop: noop }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
};

const THREE = require("three");
const { io, europa, ganymede, callisto, titan, MOON_LOOKS } = require("./moons");
const { mountMoon } = require("./mountMoon");

const all = { io, europa, ganymede, callisto, titan };

describe("the big moons", () => {
  test.each(Object.entries(all))("%s builds a small lit sphere with its own painted surface", (name, builder) => {
    const mesh = builder.build();
    expect(mesh.geometry.type).toBe("SphereGeometry");
    expect(mesh.geometry.parameters.radius).toBe(MOON_LOOKS[name].radius);
    expect(mesh.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(mesh.material.map.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(mesh.material.map.image.width).toBeLessThanOrEqual(256);
  });

  test("each moon has its own colour", () => {
    const colours = Object.values(MOON_LOOKS).map((l) => l.base);
    expect(new Set(colours).size).toBe(colours.length);
  });

  test("Ganymede is the largest and Europa the smallest, as in life", () => {
    const r = (n) => MOON_LOOKS[n].radius;
    expect(r("ganymede")).toBeGreaterThan(r("titan"));
    expect(r("titan")).toBeGreaterThan(r("callisto"));
    expect(r("callisto")).toBeGreaterThan(r("io"));
    expect(r("io")).toBeGreaterThan(r("europa"));
  });
});

describe("mountMoon()", () => {
  const setUp = (child) => {
    const view = { saturnObj: new THREE.Object3D() };
    const planet = new THREE.Object3D();
    planet.position.set(0, -100, 3400);
    const moonMesh = new THREE.Object3D();
    mountMoon(view, { name: "saturn", tilt: 26.7 }, planet, child, moonMesh);
    return { view, planet, moonMesh };
  };
  const Y = new THREE.Vector3(0, 1, 0);

  test("a moon hangs at its distance in a frame centred on the planet, inside the planet's orbit wrapper", () => {
    const { view, moonMesh } = setUp({ name: "titan", position: { x: 320, y: 0, z: 0 } });
    expect(view.renderedTitan).toBe(moonMesh);
    expect(moonMesh.position.toArray()).toEqual([320, 0, 0]);
    expect(view.titanObj.children).toContain(moonMesh);
    expect(view.titanObj.parent).toBe(view.saturnObj);
    expect(view.titanObj.position.toArray()).toEqual([0, -100, 3400]);
    expect(view.titanPlane).toBeUndefined();
  });

  test("an equatorial moon's orbit is laid in the planet's tilted equator from the start", () => {
    const { view } = setUp({ name: "titan", position: { x: 320, y: 0, z: 0 }, equatorial: true });
    expect(view.titanPlane.parent).toBe(view.saturnObj);
    expect(view.titanPlane.position.toArray()).toEqual([0, -100, 3400]);
    expect(view.titanObj.parent).toBe(view.titanPlane);
    expect(view.titanObj.position.toArray()).toEqual([0, 0, 0]);
    const axis = Y.clone().applyQuaternion(view.titanPlane.quaternion);
    expect(THREE.MathUtils.radToDeg(axis.angleTo(Y))).toBeCloseTo(26.7, 3);
  });

  test("a top-level body with no wrapper mounts its moon in the scene", () => {
    const view = { scene: new THREE.Object3D() };
    mountMoon(view, { name: "rogue" }, new THREE.Object3D(), { name: "pebble", position: { x: 1, y: 0, z: 0 } }, new THREE.Object3D());
    expect(view.pebbleObj.parent).toBe(view.scene);
  });
});
