const THREE = require("three");
const { boilingSurface, boilSun, BOIL_RATE } = require("./sunSurface");

const stub = () => ({
  uniforms: {},
  vertexShader: "void main() {\n#include <begin_vertex>\n}",
  fragmentShader: "void main() {\n#include <color_fragment>\n#include <emissivemap_fragment>\n}",
});

describe("boilingSurface()", () => {
  test("gives the material a clock the shader reads", () => {
    const mat = boilingSurface(new THREE.MeshStandardMaterial());
    const shader = stub();
    mat.onBeforeCompile(shader);
    expect(shader.uniforms.surfaceTime).toBe(mat.userData.surfaceTime);
    expect(mat.userData.surfaceTime.value).toBe(0);
  });

  test("churns both the lit colour and the glow, and keeps the darker limb", () => {
    const shader = stub();
    boilingSurface(new THREE.MeshStandardMaterial()).onBeforeCompile(shader);
    expect(shader.fragmentShader).toMatch(/diffuseColor\.rgb \*= .*boil/);
    expect(shader.fragmentShader).toMatch(/totalEmissiveRadiance \*= .*boil/);
    expect(shader.fragmentShader).toContain("0.36 + 0.64 * mu");
    expect(shader.vertexShader).toContain("vSurfacePos = position");
  });

  test("uses fewer noise layers when asked to be cheap", () => {
    const layers = (opts) => {
      const shader = stub();
      boilingSurface(new THREE.MeshStandardMaterial(), opts).onBeforeCompile(shader);
      return Number(/#define BOIL_OCTAVES (\d)/.exec(shader.fragmentShader)[1]);
    };
    expect(layers({ cheap: true })).toBeLessThan(layers({ cheap: false }));
  });
});

describe("boilSun()", () => {
  const makeSun = () => {
    const root = new THREE.Group();
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4),
      boilingSurface(new THREE.MeshStandardMaterial({ map: new THREE.Texture() })));
    sphere.userData.role = "sphere";
    root.add(sphere);
    return { root, sphere };
  };

  test("advances the surface clock with the frame time", () => {
    const { root, sphere } = makeSun();
    boilSun(root, 0.5);
    boilSun(root, 0.25);
    expect(sphere.material.userData.surfaceTime.value).toBeCloseTo(0.75 * BOIL_RATE, 6);
  });

  test("leaves the photo where it is: the surface no longer slides sideways", () => {
    const { root, sphere } = makeSun();
    boilSun(root, 5);
    expect(sphere.material.map.offset.x).toBe(0);
  });

  test("does nothing for a sun that is not built yet", () => {
    expect(() => boilSun(undefined, 1)).not.toThrow();
    expect(() => boilSun(new THREE.Group(), 1)).not.toThrow();
  });
});
