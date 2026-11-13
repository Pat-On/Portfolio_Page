const THREE = require("three");
const { bankAngle, throttle, blink, blinkNavLights } = require("./flight");

describe("bankAngle()", () => {
  const opts = { gain: 1, max: 0.6 };

  test("flying straight, the ship stays level", () => {
    expect(bankAngle(0, -100, 0, 0, opts)).toBeCloseTo(0, 9);
    expect(bankAngle(30, -100, 3, -10, opts)).toBeCloseTo(0, 9);   // speeding up along its heading
  });

  test("turning left dips the left wing, turning right the right one", () => {
    // Heading -Z (the ships' forward). Pushed towards -X: a left turn.
    const left = bankAngle(0, -100, -50, 0, opts);
    const right = bankAngle(0, -100, 50, 0, opts);
    expect(left).toBeGreaterThan(0);        // +roll about Z lowers the -X side
    expect(right).toBeCloseTo(-left, 9);
  });

  test("a tighter turn banks more, up to the limit", () => {
    const gentle = bankAngle(0, -100, -10, 0, opts);
    const tight = bankAngle(0, -100, -40, 0, opts);
    expect(tight).toBeGreaterThan(gentle);
    expect(bankAngle(0, -100, -5000, 0, opts)).toBe(0.6);
  });

  test("a ship that is not moving does not bank", () => {
    expect(bankAngle(0, 0, 5, 5, opts)).toBe(0);
  });
});

describe("throttle()", () => {
  test("runs from 0 at the slow end of the path to 1 at the fast end", () => {
    expect(throttle(100, 100, 500)).toBe(0);
    expect(throttle(300, 100, 500)).toBeCloseTo(0.5, 9);
    expect(throttle(900, 100, 500)).toBe(1);
    expect(throttle(10, 100, 500)).toBe(0);
  });
});

describe("blink()", () => {
  test("is on for the first part of each period and off for the rest", () => {
    expect(blink(0.01, 1, 0.2)).toBe(1);
    expect(blink(0.5, 1, 0.2)).toBe(0);
    expect(blink(3.1, 1, 0.2)).toBe(1);
  });

  test("a phase shifts when the flash comes", () => {
    expect(blink(0.5, 1, 0.2, 0.5)).toBe(1);
    expect(blink(0.01, 1, 0.2, 0.5)).toBe(0);
  });
});

describe("blinkNavLights()", () => {
  const lamp = () => new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4),
    new THREE.MeshStandardMaterial({ emissive: 0xff0000, emissiveIntensity: 1 }));

  test("flashes every lamp between dim and bright", () => {
    const ship = new THREE.Group();
    const lamps = [lamp(), lamp()];
    ship.userData.animated = { navLights: lamps };
    const seen = new Set();
    for (let t = 0; t < 2; t += 0.01) {
      blinkNavLights(ship, t);
      seen.add(lamps[0].material.emissiveIntensity);
    }
    expect(seen.size).toBe(2);
    expect(Math.min(...seen)).toBeLessThan(0.5);
    expect(Math.max(...seen)).toBeGreaterThan(1);
  });

  test("ignores a ship without lamps", () => {
    expect(() => blinkNavLights(new THREE.Group(), 1)).not.toThrow();
    expect(() => blinkNavLights(undefined, 1)).not.toThrow();
  });
});
