const THREE = require("three");
const { buildAsteroidBelt, rockCount, BELT } = require("./asteroidBelt");

const rocksOf = (belt) => belt.children.find((c) => c.isInstancedMesh);
const dustOf = (belt) => belt.children.find((c) => c.isPoints);

describe("asteroid belt", () => {
  const belt = buildAsteroidBelt();
  const rocks = rocksOf(belt);

  test("keeps the far dust as points and adds rocks as one instanced draw", () => {
    expect(dustOf(belt)).toBeDefined();
    expect(rocks).toBeDefined();
    expect(belt.children).toHaveLength(2);
  });

  test("the rocks are lit by the sun and faceted, not glowing dots", () => {
    expect(rocks.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(rocks.material.flatShading).toBe(true);
  });

  test("a rock is lumpy: its corners sit at different distances from its centre", () => {
    const pos = rocks.geometry.attributes.position;
    const radii = [];
    for (let i = 0; i < pos.count; i++) radii.push(new THREE.Vector3().fromBufferAttribute(pos, i).length());
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(0.2);
  });

  test("every rock lies inside the belt, each with its own size and tint", () => {
    const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    const sizes = new Set();
    for (let i = 0; i < rocks.count; i++) {
      rocks.getMatrixAt(i, m);
      m.decompose(p, q, s);
      const r = Math.hypot(p.x, p.z);
      expect(r).toBeGreaterThanOrEqual(BELT.inner);
      expect(r).toBeLessThanOrEqual(BELT.outer);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(BELT.ySpread / 2);
      sizes.add(s.x.toFixed(3));
    }
    expect(sizes.size).toBeGreaterThan(rocks.count / 2);
    expect(rocks.instanceColor).not.toBeNull();
  });

  test("is the same belt on every load", () => {
    const again = rocksOf(buildAsteroidBelt());
    expect(Array.from(again.instanceMatrix.array)).toEqual(Array.from(rocks.instanceMatrix.array));
  });

  test("phones get far fewer rocks than desktops", () => {
    expect(rockCount(true)).toBeLessThanOrEqual(rockCount(false) / 3);
    expect(rocks.count).toBe(rockCount(false));
  });
});
