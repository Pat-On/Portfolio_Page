const THREE = require("three");
const { nightAmount, earthSurface, cloudLayer, driftClouds } = require("./earthSurface");
const { SUN_POS } = require("../../sunPosition");

describe("nightAmount()", () => {
  test("no city lights in daylight", () => {
    expect(nightAmount(1)).toBe(0);
    expect(nightAmount(0.3)).toBe(0);
  });

  test("all of them deep in the night", () => {
    expect(nightAmount(-1)).toBe(1);
    expect(nightAmount(-0.2)).toBe(1);
  });

  test("they come on through dusk", () => {
    const dusk = nightAmount(0.05);
    expect(dusk).toBeGreaterThan(0);
    expect(dusk).toBeLessThan(1);
    expect(nightAmount(0)).toBeGreaterThan(nightAmount(0.1));
  });
});

describe("earthSurface()", () => {
  const stub = () => ({
    uniforms: {},
    vertexShader: "void main() {\n#include <begin_vertex>\n}",
    fragmentShader: "void main() {\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <emissivemap_fragment>\n}",
  });
  const extras = new THREE.Texture();
  const mat = earthSurface(new THREE.MeshStandardMaterial(), { extras });
  const shader = stub();
  mat.onBeforeCompile(shader);

  test("reads the packed extras and knows where the sun is", () => {
    expect(shader.uniforms.earthExtras.value).toBe(extras);
    expect(shader.uniforms.sunPosition.value.toArray()).toEqual([SUN_POS.x, SUN_POS.y, SUN_POS.z]);
  });

  test("city lights glow on the night side, dimmed under cloud", () => {
    expect(shader.fragmentShader).toMatch(/totalEmissiveRadiance \+= .*night/);
    expect(shader.fragmentShader).toMatch(/1\.0 - .*cloud/);
  });

  test("oceans are smoother than land, so the sun glints off them", () => {
    expect(shader.fragmentShader).toMatch(/roughnessFactor = mix\(roughnessFactor, .*ocean\)/);
  });

  test("clouds cast a soft shadow that follows the cloud layer as it drifts", () => {
    expect(shader.uniforms.cloudShift).toBe(mat.userData.cloudShift);
    expect(shader.fragmentShader).toMatch(/diffuseColor\.rgb \*= .*shade/);
  });
});

describe("driftClouds()", () => {
  const make = () => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4),
      earthSurface(new THREE.MeshStandardMaterial(), { extras: new THREE.Texture() }));
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.01, 4, 4), new THREE.MeshStandardMaterial());
    group.add(body, cloudMesh);
    group.userData.cloudMesh = cloudMesh;
    group.userData.surface = body;
    return { group, body, cloudMesh };
  };

  test("turns the cloud layer and moves its shadow on the ground by the same angle", () => {
    const { group, body, cloudMesh } = make();
    driftClouds(group, -0.3);
    driftClouds(group, -0.2);
    expect(cloudMesh.rotation.y).toBeCloseTo(-0.5, 9);
    expect(body.material.userData.cloudShift.value).toBeCloseTo(-0.5 / (2 * Math.PI), 9);
  });

  test("does nothing for an Earth without clouds", () => {
    expect(() => driftClouds(new THREE.Group(), 1)).not.toThrow();
    expect(() => driftClouds(undefined, 1)).not.toThrow();
  });
});

describe("cloudLayer()", () => {
  test("clouds thin out on the night side, where only starlight would show them", () => {
    const shader = { uniforms: {}, vertexShader: "#include <begin_vertex>", fragmentShader: "#include <alphamap_fragment>" };
    const mat = cloudLayer(new THREE.MeshStandardMaterial());
    mat.onBeforeCompile(shader);
    expect(shader.uniforms.sunPosition.value.toArray()).toEqual([SUN_POS.x, SUN_POS.y, SUN_POS.z]);
    expect(shader.fragmentShader).toMatch(/diffuseColor\.a \*= mix\(.*night\)/);
  });
});
