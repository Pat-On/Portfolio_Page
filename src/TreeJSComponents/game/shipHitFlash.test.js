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
    // The flash fades on its own clock; an engine or emitter pulse must not drive it
    expect(enemy.flashMat.emissiveIntensity).toBe(3);

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

describe("Death Star hit while its superlaser charges", () => {
  const charging = () => {
    const mesh = ships.renderedDeathStar.build();
    // Past the first stage of the fight, where the superlaser is in play
    const enemy = { mesh, alive: true, hp: 99, maxHp: 200, flashTimer: 0, flashMat: flashMat() };
    const game = Object.create(GameSystem.prototype);
    Object.assign(game, {
      _boss: enemy, _bossPhase: "charging", _bossTimer: 1.0, _dead: false,
      _camera: { position: new THREE.Vector3(0, 0, 1000) }, _bossAim: { x: 0, y: 0, z: 1 }, _bossStageSeen: 2,
    });
    return { game, enemy, emitter: mesh.userData.emitter };
  };

  test("the charge glow stays on the emitter and never lights up the flash", () => {
    const { game, enemy, emitter } = charging();
    const own = emitter.material;
    game._hitEnemy(enemy);
    game._updateBoss(1 / 60);
    expect(enemy.flashMat.emissiveIntensity).toBe(3);
    expect(emitter.material).toBe(own);
    expect(own.emissiveIntensity).toBeGreaterThan(3.5);
  });

  test("a glow reset during the flash lands on the emitter, so it does not stay charged", () => {
    const { game, enemy, emitter } = charging();
    const own = emitter.material;
    game._updateBoss(1 / 60);
    game._hitEnemy(enemy);
    game._resetBossGlow();
    expect(own.emissiveIntensity).toBe(3.5);
  });
});

describe("Death Star dish", () => {
  test("the model says which way its dish looks: from the centre through the emitter", () => {
    const mesh = ships.renderedDeathStar.build();
    mesh.updateMatrixWorld(true);
    const toEmitter = mesh.userData.emitter.getWorldPosition(new THREE.Vector3()).sub(mesh.position).normalize();
    expect(mesh.userData.dishAxis.length()).toBeCloseTo(1, 6);
    expect(mesh.userData.dishAxis.angleTo(toEmitter)).toBeLessThan(0.01);
  });

  test("as the boss it turns the dish toward the player, so the weak point can be shot at", () => {
    const mesh = ships.renderedDeathStar.build();
    const enemy = { mesh, alive: true, hp: 30, maxHp: 30 };
    const game = Object.create(GameSystem.prototype);
    Object.assign(game, { _boss: enemy, _bossPhase: "idle", _camera: { position: new THREE.Vector3(800, 300, -600) } });
    for (let i = 0; i < 300; i++) game._faceDish(enemy, 1 / 60);
    const dish = game._dishDir();
    const want = game._towardPlayer();
    expect(dish.x * want.x + dish.y * want.y + dish.z * want.z).toBeGreaterThan(0.99);
  });
});
