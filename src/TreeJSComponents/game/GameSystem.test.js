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
    expect(onGameOver).toHaveBeenCalledWith(0, false);
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
    expect(onKill).toHaveBeenCalledWith(150);
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

  test('boss kill hides the beam and triggers victory after 2s', () => {
    jest.useFakeTimers();
    const { game, boss, onGameOver } = makeBossFight();
    game._destroyEnemy(boss);
    expect(boss.activeInWave).toBe(false);
    expect(game._bossBeamMesh.visible).toBe(false);
    jest.advanceTimersByTime(2000);
    expect(onGameOver).toHaveBeenCalledWith(500, true);
    jest.useRealTimers();
  });

  test('cleanup before the victory delay cancels the stale game-over', () => {
    jest.useFakeTimers();
    const { game, boss, onGameOver } = makeBossFight();
    game._destroyEnemy(boss);
    game.cleanup(); // player exits game mode during the 2s celebration
    jest.advanceTimersByTime(2000);
    expect(onGameOver).not.toHaveBeenCalled();
    jest.useRealTimers();
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
