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
