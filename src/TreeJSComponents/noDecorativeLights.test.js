// The scene keeps two lights, the sun and an ambient fill, in every mode
// (docs/decisions: the scene has two lights). Ships, the comet and the
// Death Star glow through emissive materials, never through PointLights,
// which cost every lit pixel and force shader recompiles when added.
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy(
    { createRadialGradient: () => ({ addColorStop: noop }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      measureText: () => ({ width: 0 }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
};

const { celestialBodies, ships } = require("./registry");
const { buildComet } = require("./planets/comet/comet");

const lightsIn = (object) => {
  const found = [];
  object.traverse((o) => { if (o.isLight) found.push(o.type); });
  return found;
};

describe("no decorative lights", () => {
  test.each(ships.map((s) => [s.name, s]))("the %s carries no light", (name, ship) => {
    expect(lightsIn(ship.builder.build())).toEqual([]);
  });

  test.each(celestialBodies.map((b) => [b.name, b]))("%s carries no light", (name, body) => {
    expect(lightsIn(body.builder.build())).toEqual([]);
  });

  test("the comet carries no light", () => {
    expect(lightsIn(buildComet())).toEqual([]);
  });
});
