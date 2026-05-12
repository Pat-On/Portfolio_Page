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
        clone: () => ({ x: 0, y: 0, z: 0 }),
        distanceTo: jest.fn(() => 2000),
      },
      traverse: jest.fn(),
      material: null,
    },
    alive: true,
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

  test('advances wave after 6 kills (KILLS_PER_WAVE)', () => {
    const { game } = makeGameSystem();
    game._waveKills = 5;
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

  test('triggers victory after clearing wave 10', () => {
    jest.useFakeTimers();
    const { game, onGameOver } = makeGameSystem();
    game._wave = 10;
    game._waveKills = 5;
    game._destroyEnemy(makeMockEnemy({ points: 100 }));
    jest.advanceTimersByTime(2000);
    expect(onGameOver).toHaveBeenCalledWith(100, true);
    jest.useRealTimers();
  });
});
