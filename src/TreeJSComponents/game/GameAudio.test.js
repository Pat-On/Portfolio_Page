import { GameAudio } from "./GameAudio";

function fakeContext() {
  const param = () => ({ value: 0, setValueAtTime: jest.fn(), setTargetAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() });
  const node = () => ({ connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn(), frequency: param(), gain: param(), type: "" });
  const ctx = { currentTime: 0, state: "running", destination: {}, oscillators: [], gains: [] };
  ctx.createOscillator = jest.fn(() => { const n = node(); ctx.oscillators.push(n); return n; });
  ctx.createGain = jest.fn(() => { const n = node(); ctx.gains.push(n); return n; });
  ctx.createBiquadFilter = jest.fn(node);
  return ctx;
}
const audio = () => { const a = new GameAudio(); a._ctx = fakeContext(); return a; };
const lastTarget = (p) => p.setTargetAtTime.mock.calls.slice(-1)[0][0];

describe("GameAudio — hit confirmation", () => {
  test("a hit ticks; a kill ticks lower and longer; muted, nothing", () => {
    const a = audio();
    a.hitConfirm(false);
    a.hitConfirm(true);
    expect(a._ctx.oscillators).toHaveLength(2);
    const [hit, kill] = a._ctx.oscillators;
    expect(kill.frequency.setValueAtTime.mock.calls[0][0]).toBeLessThan(hit.frequency.setValueAtTime.mock.calls[0][0]);
    a.muted = true;
    a.hitConfirm(false);
    expect(a._ctx.oscillators).toHaveLength(2);
  });
});

describe("GameAudio — engine hum", () => {
  test("one engine for the whole game, steered by speed", () => {
    const a = audio();
    a.engine(0);
    a.engine(1);
    a.engine(2.2);
    expect(a._ctx.oscillators).toHaveLength(1);
    const osc = a._ctx.oscillators[0];
    const calls = osc.frequency.setTargetAtTime.mock.calls.map((c) => c[0]);
    expect(calls[2]).toBeGreaterThan(calls[1]);
    expect(calls[1]).toBeGreaterThan(calls[0]);
    expect(osc.start).toHaveBeenCalledTimes(1);
  });

  test("silent while muted, and back when unmuted", () => {
    const a = audio();
    a.engine(1);
    const gain = a._engine.gain.gain;
    expect(lastTarget(gain)).toBeGreaterThan(0);
    a.muted = true;
    a.engine(1);
    expect(lastTarget(gain)).toBe(0);
    a.muted = false;
    a.engine(1);
    expect(lastTarget(gain)).toBeGreaterThan(0);
  });

  test("engine(null) shuts it down, and it can start again", () => {
    const a = audio();
    a.engine(1);
    const osc = a._ctx.oscillators[0];
    a.engine(null);
    expect(osc.stop).toHaveBeenCalled();
    expect(a._engine).toBeNull();
    a.engine(null); // nothing to stop: no error
    a.engine(1);
    expect(a._ctx.oscillators).toHaveLength(2);
  });

  test("without an audio context it does nothing", () => {
    const a = new GameAudio();
    expect(() => { a.engine(1); a.engine(null); a.hitConfirm(true); }).not.toThrow();
  });
});
