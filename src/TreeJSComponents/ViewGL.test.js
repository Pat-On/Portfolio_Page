// jsdom has no WebGL, so the constructor can't run here. These tests build an
// instance from the prototype with stand-ins for the renderer and timer, and
// check the lifecycle: a running view keeps queuing frames, a disposed one
// stops and lets go of what it holds.
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy(
    { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createLinearGradient: () => ({ addColorStop: noop }),
      measureText: () => ({ width: 0 }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
};

// The ambient animation needs the whole built scene; these tests drive update() without it.
jest.mock("./animation", () => ({ animate: jest.fn() }));

const ViewGL = require("./ViewGL").default;

function makeView() {
  const view = Object.create(ViewGL.prototype);
  view.renderer = { render: jest.fn(), dispose: jest.fn(), domElement: document.createElement("canvas") };
  view._timer = { update: jest.fn(), getDelta: () => 0.016, dispose: jest.fn() };
  view.camera = { fov: 75 };
  view._boundUpdate = jest.fn();
  view._onVisibilityChange = jest.fn();
  view._composer = { dispose: jest.fn(), render: jest.fn() };
  view._gameModeActive = false;
  return view;
}

describe("ViewGL shader warm-up", () => {
  const withRenderer = (view) => {
    view.renderer.compileAsync = jest.fn(() => Promise.resolve());
    view.renderer.extensions = { has: () => true };
    view.renderer.getRenderTarget = jest.fn(() => null);
    view.renderer.setRenderTarget = jest.fn();
    view.renderer.render = jest.fn();
    view.scene = { isScene: true, children: [], traverse: (fn) => view.scene.children.forEach(fn) };
    view.camera = {};
    return view;
  };

  it("prepareGame() compiles the scene for the screen and the game's materials against the scene's lights, once", async () => {
    const view = withRenderer(makeView());
    const material = { isMaterial: true };
    view._GameSystemCtor = { warmupMaterials: () => [{ material }, { material, instanced: true }] };
    view._GameAudioCtor = function () {};
    await view.prepareGame();
    await view.prepareGame();
    const calls = view.renderer.compileAsync.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toBe(view.scene);
    expect(calls[1][2]).toBe(view.scene);
    expect(calls[1][0].children).toHaveLength(2);
    // Kept alive: disposing them would release the programs again
    expect(view._gameWarmMaterials).toHaveLength(2);
  });

  it("warms the scene for the bloom path by compiling into the composer's buffer", async () => {
    const view = withRenderer(makeView());
    const readBuffer = { isRenderTarget: true };
    view._composer = { ...view._composer, readBuffer };
    await view._warmSceneForComposer();
    expect(view.renderer.setRenderTarget).toHaveBeenNthCalledWith(1, readBuffer);
    const [compiledScene, compiledCamera] = view.renderer.compileAsync.mock.calls[0];
    expect(compiledScene).toBe(view.scene);
    expect(compiledCamera).toBe(view.camera);
    expect(view.renderer.setRenderTarget).toHaveBeenLastCalledWith(null);
  });
});

describe("ViewGL shader compile helper", () => {
  it("compiles asynchronously where the browser can compile in parallel", async () => {
    const view = makeView();
    view.renderer.extensions = { has: (n) => n === "KHR_parallel_shader_compile" };
    view.renderer.compileAsync = jest.fn(() => Promise.resolve());
    view.renderer.compile = jest.fn();
    await view._compile("scene", "camera", "target");
    expect(view.renderer.compileAsync).toHaveBeenCalledWith("scene", "camera", "target");
    expect(view.renderer.compile).not.toHaveBeenCalled();
  });

  it("falls back to a plain compile, without three.js's console warning, where it cannot", async () => {
    const view = makeView();
    view.renderer.extensions = { has: () => false };
    view.renderer.compileAsync = jest.fn(() => Promise.resolve());
    view.renderer.compile = jest.fn();
    await view._compile("scene", "camera", null);
    expect(view.renderer.compile).toHaveBeenCalledWith("scene", "camera", null);
    expect(view.renderer.compileAsync).not.toHaveBeenCalled();
  });
});

describe("ViewGL scene priming", () => {
  it("draws the whole scene once off-screen with culling off, so first sight uploads nothing", async () => {
    const view = makeView();
    view.renderer.compileAsync = jest.fn(() => Promise.resolve());
    view.renderer.extensions = { has: () => true };
    view.renderer.getRenderTarget = jest.fn(() => null);
    const targets = [];
    view.renderer.setRenderTarget = jest.fn((t) => targets.push(t));
    const ship = { frustumCulled: true };
    const alwaysDrawn = { frustumCulled: false };
    let culledDuringRender;
    view.renderer.render = jest.fn(() => { culledDuringRender = ship.frustumCulled; });
    view.scene = { children: [ship, alwaysDrawn], traverse: (fn) => [ship, alwaysDrawn].forEach(fn) };
    view.camera = {};
    view._composer = { ...view._composer, readBuffer: { isRenderTarget: true } };

    await view._warmSceneForComposer();

    expect(view.renderer.render).toHaveBeenCalledTimes(1);
    expect(culledDuringRender).toBe(false);
    expect(ship.frustumCulled).toBe(true);
    expect(alwaysDrawn.frustumCulled).toBe(false);
    // drawn into a small off-screen target, then back to where it was
    expect(targets.at(-2).isWebGLRenderTarget).toBe(true);
    expect(targets.at(-1)).toBe(null);
  });
});

describe("ViewGL lifecycle", () => {
  let raf;
  let cancel;

  beforeEach(() => {
    raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 42);
    cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    raf.mockRestore();
    cancel.mockRestore();
  });

  it("dispose() cancels the queued frame", () => {
    const view = makeView();
    view._rafId = 42;
    view.dispose();
    expect(cancel).toHaveBeenCalledWith(42);
  });

  it("a disposed view does not queue another frame", () => {
    const view = makeView();
    view.dispose();
    view.update();
    expect(raf).not.toHaveBeenCalled();
  });

  it("dispose() stops listening for the tab becoming visible again", () => {
    const remove = jest.spyOn(document, "removeEventListener");
    const view = makeView();
    view.dispose();
    expect(remove).toHaveBeenCalledWith("visibilitychange", view._onVisibilityChange);
    remove.mockRestore();
  });

  it("dispose() releases the renderer, the composer and the timer", () => {
    const view = makeView();
    const { renderer, _composer: composer, _timer: timer } = view;
    view.dispose();
    expect(renderer.dispose).toHaveBeenCalled();
    expect(composer.dispose).toHaveBeenCalled();
    expect(timer.dispose).toHaveBeenCalled();
  });

  it("dispose() ends a running game and its input listeners", () => {
    const view = makeView();
    const game = { cleanup: jest.fn() };
    view._gameSystem = game;
    view._gameModeActive = true;
    view._onGameMouseDown = jest.fn();
    view._onGameMouseUp = jest.fn();
    const remove = jest.spyOn(document, "removeEventListener");
    view.dispose();
    expect(game.cleanup).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith("mousedown", expect.any(Function));
    remove.mockRestore();
  });
});

describe("ViewGL scroll camera", () => {
  let rect;
  let raf;
  const scrollTo = (top) => rect.mockReturnValue({ top });
  const scrollView = () => {
    const view = makeView();
    view.camera = { fov: 75, position: { x: 0, y: 300, z: 0 }, rotation: { y: 0 } };
    view._reducedMotion = { matches: false };
    return view;
  };

  beforeEach(() => {
    rect = jest.spyOn(document.body, "getBoundingClientRect");
    raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  });
  afterEach(() => {
    rect.mockRestore();
    raf.mockRestore();
  });

  it("puts the camera straight at the first scroll position (no glide on load)", () => {
    const view = scrollView();
    scrollTo(-1000);
    view.onScroll();
    expect(view.camera.position.z).toBe(2030);
  });

  it("later scrolls ease the camera there over a few frames instead of snapping", () => {
    const view = scrollView();
    scrollTo(0);
    view.onScroll();
    scrollTo(-1000);
    view.onScroll();
    expect(view.camera.position.z).toBe(30); // not moved yet
    view.update(); // one 16 ms frame
    const z1 = view.camera.position.z;
    expect(z1).toBeGreaterThan(30);
    expect(z1).toBeLessThan(2030);
    expect(z1 - 30).toBeCloseTo(2000 * (1 - Math.exp(-6 * 0.016)), 3);
    for (let i = 0; i < 120; i++) view.update();
    expect(view.camera.position.z).toBeCloseTo(2030, 3);
    expect(view.camera.rotation.y).toBeCloseTo(-0.1, 6);
  });

  it("once it has arrived, leaves the camera alone until the next scroll", () => {
    const view = scrollView();
    scrollTo(0);
    view.onScroll();
    scrollTo(-1000);
    view.onScroll();
    for (let i = 0; i < 200; i++) view.update();
    view.camera.rotation.y = 0.5; // something else turned the camera
    view.update();
    expect(view.camera.rotation.y).toBe(0.5);
  });

  it("snaps for visitors who ask for reduced motion", () => {
    const view = scrollView();
    view._reducedMotion = { matches: true };
    scrollTo(0);
    view.onScroll();
    scrollTo(-1000);
    view.onScroll();
    expect(view.camera.position.z).toBe(2030);
  });

  it("does not steer the camera while exploring, and snaps on the first scroll after", () => {
    const view = scrollView();
    scrollTo(0);
    view.onScroll();
    view._exploring = true;
    view._applyExploreMovement = jest.fn();
    view.camera.position.z = 5000; // flown somewhere
    view.update();
    expect(view.camera.position.z).toBe(5000);
    view._exploring = false;
    view._cleanupExplore();
    scrollTo(-1000);
    view.onScroll();
    expect(view.camera.position.z).toBe(2030);
  });
});

describe("ViewGL adaptive quality", () => {
  let raf;
  beforeEach(() => {
    raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  });
  afterEach(() => raf.mockRestore());

  const qualityView = () => {
    const view = makeView();
    view.renderer.setPixelRatio = jest.fn();
    view._composer.setPixelRatio = jest.fn();
    view._reducedMotion = { matches: true };
    return view;
  };

  it("applies a level to the renderer and the bloom composer alike", () => {
    const view = qualityView();
    view._applyQuality({ pixelRatio: 1.5, bloom: true });
    expect(view.renderer.setPixelRatio).toHaveBeenCalledWith(1.5);
    expect(view._composer.setPixelRatio).toHaveBeenCalledWith(1.5);
  });

  it("with bloom dropped, draws straight to the screen and skips the composer", () => {
    const view = qualityView();
    view._applyQuality({ pixelRatio: 1, bloom: false });
    view.update();
    expect(view.renderer.render).toHaveBeenCalled();
    expect(view._composer.render).not.toHaveBeenCalled();
  });

  it("feeds every frame's time to the governor", () => {
    const view = qualityView();
    view._governor = { tick: jest.fn() };
    view.update();
    expect(view._governor.tick).toHaveBeenCalledWith(0.016);
  });

  it("a composer that loads after a drop starts at the current pixel ratio", () => {
    const view = qualityView();
    view._applyQuality({ pixelRatio: 1, bloom: true });
    const composer = { setPixelRatio: jest.fn() };
    view._adoptComposer(composer);
    expect(composer.setPixelRatio).toHaveBeenCalledWith(1);
  });
});
