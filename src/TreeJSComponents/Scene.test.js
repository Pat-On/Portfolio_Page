import React from "react";
import { render, cleanup } from "@testing-library/react";

jest.mock("./ViewGL", () => {
  const inst = {
    setExploreMode: jest.fn(),
    setGameMode: jest.fn(),
    onMouseMove: jest.fn(),
    onScroll: jest.fn(),
    onWindowResize: jest.fn(),
    dispose: jest.fn(),
  };
  const calls = [];
  class MockViewGL {
    constructor(...args) {
      calls.push(args);
      Object.assign(this, inst);
    }
  }
  return { __esModule: true, default: MockViewGL, __inst: inst, __calls: calls };
});

const Scene = require("./Scene").default;
const { __inst: mockViewGL, __calls: ctorCalls } = require("./ViewGL");

beforeEach(() => {
  ctorCalls.length = 0;
  mockViewGL.setExploreMode.mockClear();
  mockViewGL.setGameMode.mockClear();
});

afterEach(cleanup);

describe("Scene", () => {
  it("sizes both canvases in CSS, not with an inline pixel height", () => {
    const { container } = render(<Scene exploring={false} gameMode={false} onReady={() => {}} />);
    container.querySelectorAll("canvas").forEach((c) => {
      expect(c).toHaveClass("canvas");
      expect(c).not.toHaveClass("canvas_inMode");
      expect(c.style.height).toBe("");
    });
  });

  it("switches the canvases to the visible-height class in explore and game mode", () => {
    const { container, rerender } = render(<Scene exploring={true} gameMode={false} onReady={() => {}} />);
    container.querySelectorAll("canvas").forEach((c) => expect(c).toHaveClass("canvas_inMode"));
    rerender(<Scene exploring={false} gameMode={true} onReady={() => {}} />);
    container.querySelectorAll("canvas").forEach((c) => expect(c).toHaveClass("canvas_inMode"));
  });

  it("resizes ViewGL to the canvas's own box when the canvas changes size", () => {
    let observed = null;
    let callback = null;
    const original = window.ResizeObserver;
    window.ResizeObserver = class {
      constructor(cb) { callback = cb; }
      observe(el) { observed = el; }
      disconnect() {}
    };
    mockViewGL.onWindowResize.mockClear();
    const { container, unmount } = render(<Scene exploring={false} gameMode={false} onReady={() => {}} />);
    const canvas = container.querySelector("canvas");
    expect(observed).toBe(canvas);
    Object.defineProperty(canvas, "clientWidth", { value: 390, configurable: true });
    Object.defineProperty(canvas, "clientHeight", { value: 844, configurable: true });
    callback([]);
    expect(mockViewGL.onWindowResize).toHaveBeenCalledWith(390, 844);
    unmount();
    window.ResizeObserver = original;
  });

  it("hides both decorative canvases from assistive technology", () => {
    const { container } = render(<Scene exploring={false} gameMode={false} onReady={() => {}} />);
    const canvases = container.querySelectorAll("canvas");
    expect(canvases).toHaveLength(2);
    canvases.forEach((c) => expect(c).toHaveAttribute("aria-hidden", "true"));
  });

  it("constructs ViewGL on mount with the canvas + overlay refs", () => {
    render(<Scene exploring={false} gameMode={false} onReady={() => {}} />);
    expect(ctorCalls).toHaveLength(1);
    const [canvas, overlay] = ctorCalls[0];
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(overlay).toBeInstanceOf(HTMLCanvasElement);
  });

  it("calls setExploreMode when the exploring prop flips", () => {
    const onExploreEnd = jest.fn();
    const { rerender } = render(
      <Scene exploring={false} gameMode={false} onExploreEnd={onExploreEnd} onReady={() => {}} />
    );
    mockViewGL.setExploreMode.mockClear();
    rerender(
      <Scene exploring={true} gameMode={false} onExploreEnd={onExploreEnd} onReady={() => {}} />
    );
    expect(mockViewGL.setExploreMode).toHaveBeenCalledWith(true, onExploreEnd);
  });

  it("calls setGameMode when the gameMode prop flips", () => {
    const cbs = {
      onGameOver: jest.fn(), onHudUpdate: jest.fn(), onPlayerHit: jest.fn(),
      onKill: jest.fn(), onWaveComplete: jest.fn(), onPause: jest.fn(),
      onMuteChange: jest.fn(),
    };
    const { rerender } = render(
      <Scene exploring={false} gameMode={false} onReady={() => {}} {...cbs} />
    );
    mockViewGL.setGameMode.mockClear();
    rerender(
      <Scene exploring={false} gameMode={true} onReady={() => {}} {...cbs} />
    );
    expect(mockViewGL.setGameMode).toHaveBeenCalledWith(
      true, cbs.onGameOver, cbs.onHudUpdate, cbs.onPlayerHit,
      cbs.onKill, cbs.onWaveComplete, cbs.onPause, cbs.onMuteChange
    );
  });

  it("disposes the ViewGL instance on unmount", () => {
    mockViewGL.dispose.mockClear();
    const { unmount } = render(<Scene exploring={false} gameMode={false} onReady={() => {}} />);
    expect(mockViewGL.dispose).not.toHaveBeenCalled();
    unmount();
    expect(mockViewGL.dispose).toHaveBeenCalledTimes(1);
  });

  it("exposes the ViewGL instance via apiRef", () => {
    const apiRef = { current: null };
    const { unmount } = render(
      <Scene exploring={false} gameMode={false} onReady={() => {}} apiRef={apiRef} />
    );
    expect(apiRef.current).not.toBe(null);
    expect(typeof apiRef.current.setGameMode).toBe("function");
    unmount();
    expect(apiRef.current).toBe(null);
  });
});
