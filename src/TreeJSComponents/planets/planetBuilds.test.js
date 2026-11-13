// jsdom has no 2D canvas; the planets paint their textures on one.
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

const THREE = require("three");
const { SUN_POS } = require("../sunPosition");
const { earth, venus, saturn, uranus } = require("./solarSystem");

const meshes = (root) => {
  const out = [];
  root.traverse((o) => o.isMesh && out.push(o));
  return out;
};
const atmosphereOf = (root) => meshes(root).find((m) => m.material.uniforms?.glowColor);
const ringOf = (root) => meshes(root).find((m) => m.geometry.type === "RingGeometry");

describe("planet atmospheres follow the sun", () => {
  test.each([["earth", earth], ["venus", venus]])("%s's rim is lit from the sun's position", (_name, builder) => {
    const shell = atmosphereOf(builder.build());
    expect(shell.material.uniforms.sunPosition.value.toArray()).toEqual([SUN_POS.x, SUN_POS.y, SUN_POS.z]);
  });
});

describe("rings lie in the planet's equatorial plane", () => {
  // RingGeometry is built in the XY plane; a quarter turn about X lays it flat
  // around the spin axis (Y). The lean comes from the body's tilt in the registry.
  test.each([["saturn", saturn], ["uranus", uranus]])("%s", (_name, builder) => {
    const ring = ringOf(builder.build());
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(ring.quaternion);
    expect(Math.abs(normal.y)).toBeCloseTo(1, 6);
  });
});

describe("Saturn's shadows", () => {
  const group = saturn.build();
  const ring = ringOf(group);
  const body = meshes(group).find((m) => m.geometry.type === "SphereGeometry");
  const compile = (mat) => {
    const shader = {
      uniforms: {},
      vertexShader: "#include <begin_vertex>\n#include <project_vertex>",
      fragmentShader: "#include <map_fragment>\n#include <color_fragment>",
    };
    mat.onBeforeCompile(shader);
    return shader;
  };

  test("the planet casts its shadow across the rings", () => {
    expect(compile(ring.material).uniforms.planetRadius.value).toBe(body.geometry.parameters.radius);
  });

  test("the rings cast theirs on the planet, between their real inner and outer edge", () => {
    const { uniforms } = compile(body.material);
    expect(uniforms.ringInner.value).toBe(ring.geometry.parameters.innerRadius);
    expect(uniforms.ringOuter.value).toBe(ring.geometry.parameters.outerRadius);
    expect(uniforms.ringMap.value).toBe(ring.material.alphaMap);
  });
});
