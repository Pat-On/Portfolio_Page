import React from "react";
import { render, cleanup } from "@testing-library/react";

jest.mock("./ViewGL", () => {
  const inst = {
    setExploreMode: jest.fn(),
    setGameMode: jest.fn(),
    onMouseMove: jest.fn(),
    onScroll: jest.fn(),
    onWindowResize: jest.fn(),
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
