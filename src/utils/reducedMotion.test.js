import { reducedMotionQuery, shouldRunAmbientMotion } from './reducedMotion';

describe('reducedMotionQuery', () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test('asks matchMedia for the reduced-motion preference', () => {
    const mql = { matches: true };
    window.matchMedia = jest.fn(() => mql);
    expect(reducedMotionQuery()).toBe(mql);
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  test('returns null where matchMedia is unavailable', () => {
    window.matchMedia = undefined;
    expect(reducedMotionQuery()).toBeNull();
  });
});

describe('shouldRunAmbientMotion', () => {
  test('runs when the user has no reduced-motion preference', () => {
    expect(
      shouldRunAmbientMotion({ reducedMotion: false, exploring: false, gameModeActive: false })
    ).toBe(true);
  });

  test('freezes the background scene under reduced motion', () => {
    expect(
      shouldRunAmbientMotion({ reducedMotion: true, exploring: false, gameModeActive: false })
    ).toBe(false);
  });

  test('still runs in explore mode, which the user opted into', () => {
    expect(
      shouldRunAmbientMotion({ reducedMotion: true, exploring: true, gameModeActive: false })
    ).toBe(true);
  });

  test('still runs in game mode, which the user opted into', () => {
    expect(
      shouldRunAmbientMotion({ reducedMotion: true, exploring: false, gameModeActive: true })
    ).toBe(true);
  });
});
