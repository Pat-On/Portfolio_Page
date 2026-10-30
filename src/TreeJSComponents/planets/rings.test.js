// jsdom has no 2D canvas; the ring and body textures are drawn procedurally
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy(
    { createRadialGradient: () => ({ addColorStop: noop }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
};

const THREE = require("three");
const { saturn } = require("./saturn/saturn");
const { uranus } = require("./uranus/uranus");

const ringOf = (group) => group.children.find((c) => c.geometry instanceof THREE.RingGeometry);

describe.each([["Saturn", saturn], ["Uranus", uranus]])("%s ring", (name, planet) => {
  const ring = ringOf(planet.build());

  test("is unlit, so the sun striking it edge-on does not turn it black", () => {
    expect(ring.material).toBeInstanceOf(THREE.MeshBasicMaterial);
  });

  test("stays a see-through, two-sided band", () => {
    expect(ring.material.transparent).toBe(true);
    expect(ring.material.side).toBe(THREE.DoubleSide);
  });
});
