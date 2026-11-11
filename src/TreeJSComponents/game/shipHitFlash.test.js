// Real three.js: hit every ship with the game's flash, then run animation frames.
const noop = () => {};
const gradient = { addColorStop: noop };
HTMLCanvasElement.prototype.getContext = function () {
  return new Proxy(
    { canvas: this },
    {
      get: (t, k) => (k in t ? t[k] : k.startsWith("create") && k.endsWith("Gradient") ? () => gradient : noop),
      set: (t, k, v) => {
        t[k] = v;
        return true;
      },
    }
  );
};

jest.mock("three", () => jest.requireActual("three"));

const THREE = require("three");
const { GameSystem } = require("./GameSystem");
const { animate } = require("../animation");
const ships = {
  renderedSpaceship: require("../spaceship/spaceship").spaceship,
  renderedFalcon: require("../spaceship/falcon").falcon,
  renderedEnterprise: require("../spaceship/enterprise").enterprise,
  renderedBorg: require("../spaceship/borg").borgCube,
  renderedISD: require("../spaceship/isd").isd,
  renderedDeathStar: require("../spaceship/deathStar").deathStar,
};

function scene() {
  const built = {};
  for (const [k, b] of Object.entries(ships)) built[k] = b.build();
  const ctx = new Proxy(
    { ...built, _gameModeActive: true },
    { get: (t, k) => (k in t ? t[k] : typeof k === "string" && /^rendered|Obj$|^asteroidBelt$/.test(k) ? (t[k] = new THREE.Group()) : undefined) }
  );
  return { built, ctx };
}

const flashMat = () => new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 3 });

describe.each(Object.keys(ships))("%s hit by a laser", (key) => {
  test("the animation loop keeps running while it flashes, and its materials come back", () => {
    const { built, ctx } = scene();
    const mesh = built[key];
    const before = new Map();
    mesh.traverse((o) => o.isMesh && before.set(o, o.material));

    const game = Object.create(GameSystem.prototype);
    const enemy = { mesh, hp: 99, flashTimer: 0, flashMat: flashMat() };
    game._hitEnemy(enemy);

    for (let i = 0; i < 30; i++) expect(() => animate.call(ctx, 1 / 60)).not.toThrow();

    enemy.mesh.traverse((c) => {
      if (c.isMesh && c._origMat) {
        c.material = c._origMat;
        delete c._origMat;
      }
    });
    const after = new Map();
    mesh.traverse((o) => o.isMesh && after.set(o, o.material));
    expect(after).toEqual(before);
    for (const [o, mat] of after) expect(mat).toBe(before.get(o));
  });
});
