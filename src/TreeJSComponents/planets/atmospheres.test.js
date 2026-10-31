// jsdom has no 2D canvas; Earth's cloud layer is drawn procedurally
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
const { earth } = require("./earth/earth");
const { venus } = require("./venus/venus");

const flatHalos = (group) =>
  group.children.filter((c) => c.material instanceof THREE.MeshBasicMaterial && c.material.blending === THREE.AdditiveBlending);
const fresnelShells = (group) => group.children.filter((c) => c.material instanceof THREE.ShaderMaterial);

describe.each([["Earth", earth], ["Venus", venus]])("%s atmosphere", (name, planet) => {
  const group = planet.build();

  test("is a single fresnel shell", () => {
    expect(fresnelShells(group)).toHaveLength(1);
  });

  test("has no flat-opacity halo spheres left", () => {
    expect(flatHalos(group)).toHaveLength(0);
  });
});
