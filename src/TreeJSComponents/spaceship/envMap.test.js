// jsdom has no 2D canvas
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy(
    { createRadialGradient: () => ({ addColorStop: noop }), createLinearGradient: () => ({ addColorStop: noop }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
};

const THREE = require("three");
const { sharedEnvMap, envUv, SUN_UV, addReflections } = require("./envMap");
const { SUN_POS } = require("../sunPosition");

describe("the sky the ships reflect", () => {
  test("is one small picture shared by every ship", () => {
    const env = sharedEnvMap();
    expect(sharedEnvMap()).toBe(env);
    expect(env.mapping).toBe(THREE.EquirectangularReflectionMapping);
    expect(env.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(env.image.width).toBeLessThanOrEqual(256);
  });

  test("envUv() follows three.js's equirect layout", () => {
    expect(envUv(new THREE.Vector3(1, 0, 0))).toEqual({ u: 0.5, v: 0.5 });
    expect(envUv(new THREE.Vector3(0, 0, -1)).u).toBeCloseTo(0.25, 6);
    expect(envUv(new THREE.Vector3(0, 1, 0)).v).toBeCloseTo(1, 6);
  });

  test("its sun sits where the real sun is, seen from the middle of the ships' patrol", () => {
    const dir = new THREE.Vector3(SUN_POS.x - 500, SUN_POS.y - 400, SUN_POS.z - 3500).normalize();
    const { u, v } = envUv(dir);
    expect(SUN_UV.u).toBeCloseTo(u, 1);
    expect(SUN_UV.v).toBeCloseTo(v, 1);
  });
});

describe("addReflections()", () => {
  const part = (material) => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  const hull = new THREE.MeshStandardMaterial({ metalness: 0.65, roughness: 0.5 });
  const paint = new THREE.MeshStandardMaterial({ metalness: 0.0, roughness: 0.6 });
  const lamp = new THREE.MeshStandardMaterial({ metalness: 0.5, emissive: 0xff0000, emissiveIntensity: 1 });
  const flat = new THREE.MeshBasicMaterial();
  const group = new THREE.Group();
  group.add(part(hull), part(paint), part(lamp), part(flat));
  const out = addReflections(group);

  test("returns the group it was given", () => expect(out).toBe(group));

  test("metal reflects the sky", () => {
    expect(hull.envMap).toBe(sharedEnvMap());
    expect(hull.envMapIntensity).toBeGreaterThan(0);
  });

  test("paint, lamps and unlit parts are left alone", () => {
    expect(paint.envMap).toBeNull();
    expect(lamp.envMap).toBeNull();
    expect(flat.envMap).toBeNull();
  });
});
