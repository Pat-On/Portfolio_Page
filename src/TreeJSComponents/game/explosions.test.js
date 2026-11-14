// Real three.js: a kill's blast is sparks, a flash, a ring and debris, all
// from fixed pools, and all of it is gone again afterwards.
jest.mock("three", () => jest.requireActual("three"));

const THREE = require("three");
const { GameSystem } = require("./GameSystem");

function game() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const g = new GameSystem(scene, camera, [], () => {}, () => {}, () => {});
  g.init();
  return { g, scene };
}
const shown = (list) => list.filter((m) => m.visible).length;

describe("explosions", () => {
  test("a kill makes sparks, a flash, a ring and debris", () => {
    const { g } = game();
    g._spawnExplosion(new THREE.Vector3(0, 0, -500), 70);
    expect(g._particleSlots.filter((s) => s.inUse).length).toBeGreaterThan(20);
    expect(shown(g._blastFlashes)).toBe(1);
    expect(shown(g._blastRings)).toBe(1);
    expect(g._debrisSlots.filter((s) => s.life > 0).length).toBeGreaterThan(4);
  });

  test("the flash is over in a blink, the ring a little later, and everything is returned", () => {
    const { g } = game();
    g._spawnExplosion(new THREE.Vector3(0, 0, -500), 70);
    for (let i = 0; i < 24; i++) g._updateExplosions(1 / 60); // 0.4 s
    expect(shown(g._blastFlashes)).toBe(0);
    expect(shown(g._blastRings)).toBe(1);
    for (let i = 0; i < 300; i++) g._updateExplosions(1 / 60); // 5 s more
    expect(shown(g._blastRings)).toBe(0);
    expect(g._particleSlots.some((s) => s.inUse)).toBe(false);
    expect(g._debrisSlots.some((s) => s.life > 0)).toBe(false);
    expect(g._explosions).toHaveLength(0);
  });

  test("the ring faces the player and grows", () => {
    const { g } = game();
    g._camera.rotation.set(0.3, 1.1, 0);
    g._spawnExplosion(new THREE.Vector3(0, 0, -500), 70);
    g._updateExplosions(1 / 60);
    const ring = g._blastRings.find((m) => m.visible);
    const first = ring.scale.x;
    expect(ring.quaternion.angleTo(g._camera.quaternion)).toBeLessThan(1e-6);
    g._updateExplosions(0.2);
    expect(ring.scale.x).toBeGreaterThan(first);
  });

  test("three big kills at once all get their sparks: one does not starve the next", () => {
    const { g } = game();
    for (let i = 0; i < 3; i++) g._spawnExplosion(new THREE.Vector3(i * 400, 0, -500), 160);
    expect(g._explosions).toHaveLength(3);
    const counts = g._explosions.map((e) => e.particles.length);
    expect(Math.min(...counts)).toBe(Math.max(...counts));
    expect(shown(g._blastFlashes)).toBe(3);
  });

  test("cleanup takes everything out of the scene", () => {
    const { g, scene } = game();
    g._spawnExplosion(new THREE.Vector3(0, 0, -500), 70);
    g.cleanup();
    expect(scene.children).toHaveLength(0);
  });
});
