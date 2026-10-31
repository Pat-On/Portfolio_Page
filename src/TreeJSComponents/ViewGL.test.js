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
