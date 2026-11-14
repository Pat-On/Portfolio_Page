import { GameSystem } from './GameSystem';

jest.mock('three');

beforeAll(() => {
  document.exitPointerLock = jest.fn();
});

function makeMockEnemy(overrides = {}) {
  return {
    mesh: {
      visible: true,
      isMesh: true,
      position: {
        x: 0, y: 0, z: 0,
        set: jest.fn(),
        clone: () => ({ x: 0, y: 0, z: 0 }),
        distanceTo: jest.fn(() => 2000),
      },
      traverse: jest.fn(),
      material: null,
      userData: {},
    },
    id: 'spaceship',
    alive: true,
    activeInWave: true,
    hp: 1,
    maxHp: 1,
    flashTimer: 0,
    flashMat: { emissiveIntensity: 0, dispose: jest.fn() },
    respawnTimer: 0,
    points: 100,
    radius: 50,
    faction: 'rebel',
    target: null,
    targetTimer: 0,
    ...overrides,
  };
}

function makeGameSystem() {
  const scene          = { add: jest.fn(), remove: jest.fn() };
  const camera         = {
    position: { x: 0, y: 0, z: 0, set: jest.fn() },
    rotation: { set: jest.fn() },
    getWorldDirection: jest.fn(),
  };
  const onHealthChange = jest.fn();
  const onScoreChange  = jest.fn();
  const onGameOver     = jest.fn();
  const onPlayerHit    = jest.fn();
  const onKill         = jest.fn();

  const game = new GameSystem(
    scene, camera, [],
    onHealthChange, onScoreChange, onGameOver, onPlayerHit, onKill
  );
  return { game, scene, camera, onHealthChange, onScoreChange, onGameOver, onPlayerHit, onKill };
}

describe('GameSystem — lighting', () => {
  test('init() adds no light: a new light would recompile every lit shader as the game starts', () => {
    const THREE = require('three');
    THREE.PointLight.mockClear();
    // The auto-mock gives InstancedMesh no instance buffer; init() writes one
    THREE.InstancedMesh.mockImplementation(function () {
      this.instanceMatrix = {};
      this.setMatrixAt = jest.fn();
    });
    const { game } = makeGameSystem();
    game.init();
    expect(THREE.PointLight).not.toHaveBeenCalled();
  });
});

describe('GameSystem — shader warm-up', () => {
  test('warmupMaterials() lists every material a game uses, the explosion as instanced', () => {
    const THREE = require('three');
    const list = GameSystem.warmupMaterials();
    // lasers (player, rebel, imperial), pickup, explosion, enemy hit flash, boss beam
    expect(list).toHaveLength(7);
    list.forEach((entry) => expect(entry.material).toBeDefined());
    expect(list.filter((e) => e.instanced)).toHaveLength(1);
    expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(expect.objectContaining({ emissive: 0xff2200 }));
  });
});

describe('GameSystem — constructor initial state', () => {
  test('health starts at 1', () => {
    const { game } = makeGameSystem();
    expect(game._health).toBe(1.0);
  });

  test('score starts at 0', () => {
    const { game } = makeGameSystem();
    expect(game._score).toBe(0);
  });

  test('wave starts at 1', () => {
    const { game } = makeGameSystem();
    expect(game._wave).toBe(1);
  });

  test('_dead starts false', () => {
    const { game } = makeGameSystem();
    expect(game._dead).toBe(false);
  });

  test('_paused starts false', () => {
    const { game } = makeGameSystem();
    expect(game._paused).toBe(false);
  });
});

describe('GameSystem — _damagePlayer (proximity)', () => {
  test('decreases health by the given amount', () => {
    const { game, onHealthChange } = makeGameSystem();
    game._damagePlayer(0.3, false);
    expect(game._health).toBeCloseTo(0.7);
    expect(onHealthChange).toHaveBeenCalledWith(expect.any(Number), 1);
  });

  test('health cannot go below 0', () => {
    const { game } = makeGameSystem();
    game._damagePlayer(5.0, false);
    expect(game._health).toBe(0);
  });

  test('triggers game over when health reaches 0', () => {
    const { game, onGameOver } = makeGameSystem();
    game._damagePlayer(1.0, false);
    expect(onGameOver).toHaveBeenCalledWith(0, false, expect.objectContaining({ kills: 0 }));
    expect(game._dead).toBe(true);
  });
});

describe('GameSystem — _damagePlayer (laser hit with i-frames)', () => {
  test('applies i-frames after the first laser hit', () => {
    const { game } = makeGameSystem();
    game._damagePlayer(0.1, true);
    expect(game._iFrameTimer).toBeGreaterThan(0);
  });

  test('second laser during i-frames does not subtract additional health', () => {
    const { game } = makeGameSystem();
    game._damagePlayer(0.1, true);
    const healthAfterFirst = game._health;
    game._damagePlayer(0.1, true);
    expect(game._health).toBe(healthAfterFirst);
  });

  test('laser hit calls onPlayerHit callback', () => {
    const { game, onPlayerHit } = makeGameSystem();
    game._damagePlayer(0.1, true);
    expect(onPlayerHit).toHaveBeenCalledTimes(1);
  });
});

describe('GameSystem — pause / resume', () => {
  test('pause() sets _paused to true', () => {
    const { game } = makeGameSystem();
    game.pause();
    expect(game._paused).toBe(true);
  });

  test('resume() sets _paused back to false', () => {
    const { game } = makeGameSystem();
    game.pause();
    game.resume();
    expect(game._paused).toBe(false);
  });
});

describe('GameSystem — _destroyEnemy', () => {
  test('marks the enemy as not alive', () => {
    const { game } = makeGameSystem();
    const enemy = makeMockEnemy();
    game._destroyEnemy(enemy);
    expect(enemy.alive).toBe(false);
  });

  test('adds enemy points to score and calls onScoreChange', () => {
    const { game, onScoreChange } = makeGameSystem();
    const enemy = makeMockEnemy({ points: 250 });
    game._destroyEnemy(enemy);
    expect(game._score).toBe(250);
    expect(onScoreChange).toHaveBeenCalledWith(250);
  });

  test('calls onKill with the enemy points', () => {
    const { game, onKill } = makeGameSystem();
    const enemy = makeMockEnemy({ points: 150 });
    game._destroyEnemy(enemy);
    expect(onKill).toHaveBeenCalledWith(150, 1, 1);
  });

  test('increments _waveKills counter', () => {
    const { game } = makeGameSystem();
    const enemy = makeMockEnemy();
    game._destroyEnemy(enemy);
    expect(game._waveKills).toBe(1);
  });

  test('advances wave after 4 kills (KILLS_PER_WAVE)', () => {
    const { game } = makeGameSystem();
    game._waveKills = 3;
    game._destroyEnemy(makeMockEnemy());
    expect(game._wave).toBe(2);
    expect(game._waveKills).toBe(0);
  });

  test('cumulative score from multiple enemies', () => {
    const { game } = makeGameSystem();
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    game._time += 10; // too far apart to be a streak
    game._destroyEnemy(makeMockEnemy({ points: 200 }));
    expect(game._score).toBe(300);
  });
});

describe('GameSystem — setFiring (manual fire)', () => {
  test('firing flag starts false', () => {
    const { game } = makeGameSystem();
    expect(game._firing).toBe(false);
  });

  test('setFiring toggles and coerces to boolean', () => {
    const { game } = makeGameSystem();
    game.setFiring(true);
    expect(game._firing).toBe(true);
    game.setFiring(0);
    expect(game._firing).toBe(false);
  });
});

describe('GameSystem — boss wave (wave 8)', () => {
  function makeBossFight() {
    const ctx = makeGameSystem();
    const boss = makeMockEnemy({ id: 'deathStar', points: 500, faction: 'imperial' });
    const escort = makeMockEnemy({ id: 'falcon', points: 100 });
    ctx.game._wave = 8; // MAX_WAVE
    ctx.game._enemies = [boss, escort];
    ctx.game._boss = boss;
    ctx.game._bossBeamMesh = { visible: true };
    return { ...ctx, boss, escort };
  }

  test('escort kill gives points but does not advance the wave', () => {
    const { game, escort } = makeBossFight();
    game._destroyEnemy(escort);
    expect(game._score).toBe(100);
    expect(game._wave).toBe(8);
    expect(game._waveKills).toBe(0);
  });

  test('boss kill hides the beam and triggers victory after 2s of game time', () => {
    const { game, boss, onGameOver } = makeBossFight();
    game._destroyEnemy(boss);
    expect(boss.activeInWave).toBe(false);
    expect(game._bossBeamMesh.visible).toBe(false);
    game._enemies = [];
    game.update(1.9);
    expect(onGameOver).not.toHaveBeenCalled();
    game.update(0.2);
    // 500 for the boss + 1000 for an untouched hull
    expect(onGameOver).toHaveBeenCalledWith(1500, true, expect.objectContaining({ hullBonus: 1000 }));
  });

  test('the victory delay waits while the game is paused', () => {
    jest.useFakeTimers();
    const { game, boss, onGameOver } = makeBossFight();
    game._destroyEnemy(boss);
    game._enemies = [];
    game.pause();
    game.update(5);
    jest.advanceTimersByTime(5000);
    expect(onGameOver).not.toHaveBeenCalled();
    game.resume();
    game.update(2.1);
    expect(onGameOver).toHaveBeenCalledWith(1500, true, expect.anything());
    jest.useRealTimers();
  });

  test('cleanup before the victory delay cancels the stale game-over', () => {
    const { game, boss, onGameOver } = makeBossFight();
    game._destroyEnemy(boss);
    game.cleanup(); // player exits game mode during the 2s celebration
    game.update(3);
    expect(onGameOver).not.toHaveBeenCalled();
  });

  test('enemy fire does not hurt the boss: only the player can bring it down', () => {
    const { game, boss } = makeBossFight();
    boss.hp = 5;
    game._hitEnemy(boss, false);
    expect(boss.hp).toBe(5);
    game._hitEnemy(boss, true);
    expect(boss.hp).toBe(4);
  });
});

describe('GameSystem — _applyWaveComposition', () => {
  function makeRoster() {
    const ctx = makeGameSystem();
    ctx.game._enemies = ['spaceship', 'enterprise', 'borg', 'falcon', 'isd', 'deathStar']
      .map((id) => makeMockEnemy({ id, alive: false, activeInWave: false }));
    return ctx;
  }

  test('wave 1 activates only the two skirmishers', () => {
    const { game } = makeRoster();
    game._applyWaveComposition(1);
    const activeIds = game._enemies.filter((e) => e.activeInWave).map((e) => e.id);
    expect(activeIds.sort()).toEqual(['falcon', 'spaceship']);
  });

  test('advancing deactivates ships not in the new wave without scoring', () => {
    const { game, onScoreChange } = makeRoster();
    game._applyWaveComposition(2); // spaceship, falcon, enterprise
    game._applyWaveComposition(3); // spaceship, falcon, borg
    const enterprise = game._enemies.find((e) => e.id === 'enterprise');
    expect(enterprise.activeInWave).toBe(false);
    expect(enterprise.alive).toBe(false);
    expect(enterprise.mesh.visible).toBe(false);
    expect(onScoreChange).not.toHaveBeenCalled();
  });

  test('wave 8 activates the Death Star as boss with boss HP', () => {
    const { game } = makeRoster();
    game._applyWaveComposition(8);
    const boss = game._enemies.find((e) => e.id === 'deathStar');
    expect(boss.activeInWave).toBe(true);
    expect(game._boss).toBe(boss);
    expect(boss.hp).toBe(30);
    expect(boss.maxHp).toBe(30);
  });

  test('benched enemies do not respawn in _updateEnemies', () => {
    const { game } = makeRoster();
    game._applyWaveComposition(1);
    // Kill the wave-1 ships so the update loop only exercises respawn logic
    for (const e of game._enemies) e.alive = false;
    const borg = game._enemies.find((e) => e.id === 'borg'); // benched in wave 1
    borg.respawnTimer = 0.01;
    game._updateEnemies(1 / 60);
    expect(borg.alive).toBe(false);
  });
});

describe('GameSystem — health pickups', () => {
  function makePickupMesh(dist = 10) {
    return {
      visible: false,
      rotation: { y: 0 },
      position: { y: 0, copy: jest.fn(), distanceTo: jest.fn(() => dist) },
    };
  }

  test('_spawnPickup pulls from the pool and tracks the pickup', () => {
    const { game } = makeGameSystem();
    const mesh = makePickupMesh();
    game._pickupPool = [mesh];
    game._spawnPickup({ x: 0, y: 5, z: 0 });
    expect(mesh.visible).toBe(true);
    expect(game._pickups).toHaveLength(1);
    expect(game._pickups[0].baseY).toBe(5);
  });

  test('_spawnPickup is a no-op when the pool is empty', () => {
    const { game } = makeGameSystem();
    game._pickupPool = [];
    game._spawnPickup({ x: 0, y: 0, z: 0 });
    expect(game._pickups).toHaveLength(0);
  });

  test('flying through a pickup heals 0.25 and returns the mesh to the pool', () => {
    const { game, onHealthChange } = makeGameSystem();
    const mesh = makePickupMesh(10); // inside PICKUP_RADIUS
    game._pickups = [{ mesh, life: 0, baseY: 0 }];
    game._health = 0.5;
    game._updatePickups(1 / 60);
    expect(game._health).toBeCloseTo(0.75);
    expect(onHealthChange).toHaveBeenCalled();
    expect(game._pickups).toHaveLength(0);
    expect(game._pickupPool).toContain(mesh);
  });

  test('healing is capped at full health', () => {
    const { game } = makeGameSystem();
    game._pickups = [{ mesh: makePickupMesh(10), life: 0, baseY: 0 }];
    game._health = 0.9;
    game._updatePickups(1 / 60);
    expect(game._health).toBe(1);
  });

  test('pickups expire after their lifetime without healing', () => {
    const { game, onHealthChange } = makeGameSystem();
    const mesh = makePickupMesh(5000); // out of reach
    game._pickups = [{ mesh, life: 11.99, baseY: 0 }];
    game._updatePickups(0.1);
    expect(game._pickups).toHaveLength(0);
    expect(onHealthChange).not.toHaveBeenCalled();
    expect(mesh.visible).toBe(false);
  });
});

describe('hit flash', () => {
  // The Falcon's plume is a ShaderMaterial whose uniforms the animation loop
  // writes every frame; swapping it for the flash material threw a TypeError
  // in setPlume and stopped the render loop.
  it('leaves shader-material meshes (engine plumes) alone', () => {
    const { game } = makeGameSystem();
    const hullMat  = { isMeshStandardMaterial: true };
    const plumeMat = { isShaderMaterial: true, uniforms: { opacity: { value: 1 } } };
    const hull  = { isMesh: true, material: hullMat };
    const plume = { isMesh: true, material: plumeMat };
    const enemy = makeMockEnemy({ hp: 3, maxHp: 3 });
    enemy.mesh.traverse = (fn) => [hull, plume].forEach(fn);

    game._hitEnemy(enemy);

    expect(hull.material).toBe(enemy.flashMat);
    expect(plume.material).toBe(plumeMat);
    expect(plume.material.uniforms.opacity.value).toBe(1);
  });
});

describe('GameSystem — running into a ship', () => {
  const touching = () => {
    const ctx = makeGameSystem();
    const enemy = makeMockEnemy({ radius: 50 });
    enemy.mesh.position.x = -100;      // the enemy sits to the player's left
    ctx.game._enemies = [enemy];
    return { ...ctx, enemy };
  };

  test('is a hard knock, not death: a fixed bite of hull and a shove clear of the ship', () => {
    const { game, enemy, camera, onPlayerHit, onGameOver } = touching();
    game._bump(enemy);
    expect(game._health).toBeCloseTo(0.8);
    expect(game._dead).toBe(false);
    expect(onGameOver).not.toHaveBeenCalled();
    expect(onPlayerHit).toHaveBeenCalledTimes(1);
    expect(camera.position.x).toBeGreaterThan(200);   // thrown away from the enemy
  });

  test('gives the same brief invulnerability as a laser hit, so one touch is one hit', () => {
    const { game, enemy, camera } = touching();
    game._bump(enemy);
    const x = camera.position.x;
    game._bump(enemy);
    game._bump(enemy);
    expect(game._health).toBeCloseTo(0.8);
    expect(camera.position.x).toBe(x);
  });

  test('five collisions, spaced out, are what it takes to lose a full hull', () => {
    const { game, enemy } = touching();
    for (let i = 0; i < 5; i++) { game._iFrameTimer = 0; game._bump(enemy); }
    expect(game._dead).toBe(true);
  });
});

describe('GameSystem — whose kill it is', () => {
  test("a kill by another ship's fire scores nothing and does not advance the wave", () => {
    const { game, onScoreChange, onKill } = makeGameSystem();
    const enemy = makeMockEnemy({ hp: 1 });
    game._enemies = [enemy];
    game._hitEnemy(enemy, false);
    expect(enemy.alive).toBe(false);
    expect(game._score).toBe(0);
    expect(game._waveKills).toBe(0);
    expect(onScoreChange).not.toHaveBeenCalled();
    expect(onKill).not.toHaveBeenCalled();
    expect(enemy.respawnTimer).toBeGreaterThan(0);   // it still comes back
  });

  test("the player's kill scores and counts, as before", () => {
    const { game, onKill } = makeGameSystem();
    const enemy = makeMockEnemy({ hp: 1 });
    game._enemies = [enemy];
    game._hitEnemy(enemy, true);
    expect(game._score).toBe(100);
    expect(game._waveKills).toBe(1);
    expect(onKill).toHaveBeenCalledWith(100, 1, 1);
  });
});

describe('GameSystem — enemy gunnery', () => {
  const gunner = () => {
    const ctx = makeGameSystem();
    const enemy = makeMockEnemy();
    enemy.mesh.position.z = -1560;                 // one second of bolt flight away
    ctx.game._enemies = [enemy];
    return { ...ctx, enemy };
  };

  test('aims ahead of a moving player', () => {
    const { game, enemy } = gunner();
    game._playerVel = { x: 600, y: 0, z: 0 };
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);   // no scatter
    const aim = game._aimAtPlayer(enemy);
    spy.mockRestore();
    expect(aim.x).toBeGreaterThan(550);
  });

  test('aims straight at a player who is standing still', () => {
    const { game, enemy } = gunner();
    game._playerVel = { x: 0, y: 0, z: 0 };
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const aim = game._aimAtPlayer(enemy);
    spy.mockRestore();
    expect(aim).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('misses by less in later waves', () => {
    const { game, enemy } = gunner();
    game._playerVel = { x: 0, y: 0, z: 0 };
    const spy = jest.spyOn(Math, 'random').mockReturnValue(1);     // worst case every time
    game._wave = 1;
    const early = Math.abs(game._aimAtPlayer(enemy).x);
    game._wave = 8;
    const late = Math.abs(game._aimAtPlayer(enemy).x);
    spy.mockRestore();
    expect(late).toBeLessThan(early);
    expect(late).toBeGreaterThan(0);
  });

  test("tracks the player's velocity from frame to frame", () => {
    const { game, camera } = makeGameSystem();
    game.update(0.1);
    camera.position.x = 120;
    game.update(0.1);
    expect(game._playerVel.x).toBeCloseTo(1200, 6);
  });
});

describe('GameSystem — where enemies arrive', () => {
  test('ahead of or beside the player, beyond the old pop-in distance, never behind', () => {
    const { game, camera } = makeGameSystem();
    camera.getWorldDirection = (v) => { v.x = 0; v.y = 0; v.z = -1; return v; };
    for (let i = 0; i < 50; i++) {
      const p = game._spawnPoint();
      expect(p.z).toBeLessThan(400);                       // forward is -Z: not behind
      expect(Math.hypot(p.x, p.y, p.z)).toBeGreaterThanOrEqual(1800);
    }
  });
});

describe('GameSystem — boost energy', () => {
  test('boost works from a full bar and drains it', () => {
    const { game } = makeGameSystem();
    expect(game.boostEnergy).toBe(1);
    expect(game.boost(true, 1)).toBe(true);
    expect(game.boostEnergy).toBeLessThan(1);
  });

  test('an emptied bar refuses boost until it has partly refilled', () => {
    const { game } = makeGameSystem();
    let guard = 0;
    while (game.boost(true, 0.1) && guard++ < 1000) { /* hold it until it runs dry */ }
    expect(game.boostEnergy).toBeLessThan(0.05);
    expect(game.boost(true, 0.1)).toBe(false);
    for (let i = 0; i < 30; i++) game.boost(false, 0.1);
    expect(game.boost(true, 0.1)).toBe(true);
  });
});

describe('GameSystem — the boss fight in three stages', () => {
  function makeBossFight(hp = 30) {
    const ctx = makeGameSystem();
    const boss = makeMockEnemy({ id: 'deathStar', points: 500, faction: 'imperial', radius: 160, hp, maxHp: 30 });
    const escort = makeMockEnemy({ id: 'falcon', points: 100 });
    ctx.game._wave = 8;
    ctx.game._enemies = [boss, escort];
    ctx.game._boss = boss;
    ctx.game._bossBeamMesh = { visible: false };
    ctx.game._placeBeam = jest.fn();
    ctx.game._bossTimer = 0;
    ctx.camera.position.x = 0; ctx.camera.position.y = 0; ctx.camera.position.z = 1000;
    return { ...ctx, boss, escort };
  }
  const angleTo = (a, b) => Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));

  test('stage 1 is escorts and bolts: the superlaser stays cold', () => {
    const { game } = makeBossFight(30);
    expect(game.bossStage).toBe(1);
    for (let i = 0; i < 20; i++) game._updateBoss(1);
    expect(game._bossPhase).toBe('idle');
  });

  test('stage 2 brings the superlaser in, and soon', () => {
    const { game } = makeBossFight(30);
    game._bossTimer = 9;
    game._updateBoss(0.1);
    game._boss.hp = 20;
    expect(game.bossStage).toBe(2);
    for (let i = 0; i < 35; i++) game._updateBoss(0.1); // 3.5 s
    expect(game._bossPhase).toBe('charging');
  });

  test('the charging superlaser follows the player, but only so fast', () => {
    const { game, camera } = makeBossFight(20);
    game._updateBoss(0.1); // idle → charging, aimed at the player
    expect(game._bossPhase).toBe('charging');
    expect(game._bossAim.z).toBeCloseTo(1, 6);

    camera.position.x = 1000; camera.position.z = 0; // a quarter turn away, at once
    const before = { ...game._bossAim };
    game._updateBoss(0.5);
    const turned = angleTo(before, game._bossAim);
    expect(turned).toBeGreaterThan(0.05);
    expect(turned).toBeLessThan(Math.PI / 2 - 0.5); // nowhere near caught up
    expect(game._bossAim.x).toBeGreaterThan(0);     // but turning the right way
  });

  test('a player who stays put is hit; one who has moved well off the line is not', () => {
    const still = makeBossFight(20);
    still.game._updateBoss(0.1);
    still.game._updateBoss(2.5); // charge done → firing
    expect(still.game._bossPhase).toBe('firing');
    still.game._updateBoss(0.1);
    expect(still.game._health).toBeCloseTo(0.5);

    const moved = makeBossFight(20);
    moved.game._updateBoss(0.1);
    moved.game._updateBoss(2.5);
    moved.camera.position.x = 1000; moved.camera.position.z = 0;
    moved.game._updateBoss(0.1);
    expect(moved.game._health).toBe(1);
  });

  test('the last stage fires more often than the second', () => {
    const second = makeBossFight(20), last = makeBossFight(10);
    for (const { game } of [second, last]) {
      game._updateBoss(0.1); game._updateBoss(2.5); game._updateBoss(0.6); // one full shot
      expect(game._bossPhase).toBe('idle');
    }
    expect(last.game._bossTimer).toBeLessThan(second.game._bossTimer);
  });

  test('in the last stage a hit on the charging dish counts three times', () => {
    const { game, boss } = makeBossFight(10);
    game._dishDir = () => ({ x: 0, y: 0, z: 1 });
    game._bossPhase = 'charging';
    expect(game._bossDamageAt({ x: 0, y: 0, z: 170 })).toBe(3);
    expect(game._bossDamageAt({ x: 170, y: 0, z: 0 })).toBe(1);   // the flank
    game._bossPhase = 'idle';
    expect(game._bossDamageAt({ x: 0, y: 0, z: 170 })).toBe(1);   // not charging
    boss.hp = 20;
    game._bossPhase = 'charging';
    expect(game._bossDamageAt({ x: 0, y: 0, z: 170 })).toBe(1);   // too early in the fight
  });

  test('a hit takes off as much health as it is worth', () => {
    const { game, boss } = makeBossFight(10);
    game._hitEnemy(boss, true, 3);
    expect(boss.hp).toBe(7);
  });

  test('escorts keep coming back until the last stage, then stay down', () => {
    const early = makeBossFight(20);
    early.escort.alive = false; early.escort.respawnTimer = 0;
    early.boss.alive = false; early.boss.activeInWave = false; // only the escort is in question
    early.game._respawnEnemy = jest.fn();
    early.game._updateEnemies(0.1);
    expect(early.game._respawnEnemy).toHaveBeenCalledWith(early.escort);

    const late = makeBossFight(10);
    late.escort.alive = false; late.escort.respawnTimer = 0;
    late.boss.alive = false; late.boss.activeInWave = false; // only the escort is in question
    late.game._respawnEnemy = jest.fn();
    late.game._updateEnemies(0.1);
    expect(late.game._respawnEnemy).not.toHaveBeenCalledWith(late.escort);
  });
});

describe('GameSystem — what a run is worth', () => {
  test('kills in quick succession pay more, and say so', () => {
    const { game, onKill } = makeGameSystem();
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    game._time += 1;
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    game._time += 1;
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    expect(game._score).toBe(100 + 125 + 150);
    expect(onKill).toHaveBeenLastCalledWith(150, 3, 1.5);
  });

  test('a streak is counted in game time: a pause neither breaks nor extends it', () => {
    const { game, onKill } = makeGameSystem();
    game._destroyEnemy(makeMockEnemy());
    game.pause();
    game.update(60); // a minute on the pause screen
    game.resume();
    game._destroyEnemy(makeMockEnemy());
    expect(onKill).toHaveBeenLastCalledWith(125, 2, 1.25);
  });

  test('a kill long after the last one starts a new streak', () => {
    const { game, onKill } = makeGameSystem();
    game._destroyEnemy(makeMockEnemy());
    game._time += 3.5;
    game._destroyEnemy(makeMockEnemy());
    expect(onKill).toHaveBeenLastCalledWith(100, 1, 1);
  });

  test('clearing a wave pays a bonus and reports it', () => {
    const { game, onScoreChange } = makeGameSystem();
    game._onWaveComplete = jest.fn();
    game._wave = 3;
    game._waveKills = 3;
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    expect(game._score).toBe(100 + 300);
    expect(game._onWaveComplete).toHaveBeenCalledWith(3, 300);
    expect(onScoreChange).toHaveBeenLastCalledWith(400);
  });

  test('the end of a run reports how it went', () => {
    const { game, onGameOver } = makeGameSystem();
    game._wave = 4;
    game._time = 95;
    game._shots = 20;
    game._hits = 5;
    game._destroyEnemy(makeMockEnemy());
    game._time += 1;
    game._destroyEnemy(makeMockEnemy());
    game._damagePlayer(1);
    expect(onGameOver).toHaveBeenCalledWith(225, false, {
      wave: 4, kills: 2, shots: 20, hits: 5, accuracy: 0.25, timeS: 96, bestStreak: 2, hullBonus: 0,
    });
  });

  test('shots fired and shots landed are counted', () => {
    const { game, camera } = makeGameSystem();
    const mesh = { position: { copy: jest.fn(() => mesh.position), addScaledVector: jest.fn(), distanceTo: () => 10 }, quaternion: { setFromUnitVectors: jest.fn() }, visible: false };
    game._laserPool = [mesh];
    camera.getWorldDirection = jest.fn();
    const THREE = require('three');
    const spy = jest.spyOn(THREE.Vector3.prototype, 'clone').mockReturnValue({ multiplyScalar: () => ({}) });
    game._spawnLaser();
    spy.mockRestore();
    expect(game._shots).toBe(1);

    const enemy = makeMockEnemy({ hp: 5 });
    game._enemies = [enemy];
    game._updateLasers(1 / 60);
    expect(game._hits).toBe(1);
    expect(enemy.hp).toBe(4);
  });
});
