import { isMobileDevice } from './isMobileDevice';

describe('isMobileDevice', () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
    delete window.ontouchstart;
  });

  test('returns true when ontouchstart is present and pointer is coarse', () => {
    window.ontouchstart = () => {};
    window.matchMedia = jest.fn(() => ({ matches: false }));
    expect(isMobileDevice()).toBe(true);
  });

  test('returns true when maxTouchPoints > 0 and pointer is coarse', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 4, configurable: true });
    window.matchMedia = jest.fn(() => ({ matches: false }));
    expect(isMobileDevice()).toBe(true);
  });

  test('returns false when touch is present but pointer is fine (desktop with touch screen)', () => {
    window.ontouchstart = () => {};
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true });
    window.matchMedia = jest.fn(() => ({ matches: true }));
    expect(isMobileDevice()).toBe(false);
  });

  test('returns false when no touch capability', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
    window.matchMedia = jest.fn(() => ({ matches: false }));
    expect(isMobileDevice()).toBe(false);
  });
});
