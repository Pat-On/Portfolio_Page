const THREE = require("three");
const {
  planetShadowOnRing, ringCrossing, shadeRing, shadeBody,
} = require("./ringShadows");
const { SUN_POS } = require("../../sunPosition");

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const SUN = v(1, 0, 0);          // sunlight arrives from +X
const R = 100;

describe("the planet's shadow on its rings", () => {
  test("a ring point on the sun's side is fully lit", () => {
    expect(planetShadowOnRing(v(180, 0, 0), SUN, R)).toBe(1);
    expect(planetShadowOnRing(v(0, 0, 180), SUN, R)).toBe(1);
  });

  test("a ring point straight behind the planet is dark", () => {
    expect(planetShadowOnRing(v(-180, 0, 0), SUN, R)).toBe(0);
    expect(planetShadowOnRing(v(-180, 0, 60), SUN, R)).toBe(0);
  });

  test("behind the planet but outside its shadow column the ring is lit", () => {
    expect(planetShadowOnRing(v(-150, 0, 140), SUN, R)).toBe(1);
  });

  test("the shadow edge is soft, not a hard line", () => {
    const edge = planetShadowOnRing(v(-180, 0, R), SUN, R);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(1);
  });
});

describe("where a point of the planet looks through the ring plane towards the sun", () => {
  const AXIS = v(0, 1, 0);
  // sun 30° above the ring plane
  const HIGH_SUN = v(Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0);

  test("a point below the plane on the lit side crosses it at the expected radius", () => {
    const p = v(R * Math.cos(-0.3), R * Math.sin(-0.3), 0);
    const r = ringCrossing(p, HIGH_SUN, AXIS);
    const t = -p.y / HIGH_SUN.y;
    expect(r).toBeCloseTo(p.clone().addScaledVector(HIGH_SUN, t).length(), 6);
    expect(r).toBeGreaterThan(R);
  });

  test("a point on the sun's side of the plane never crosses it", () => {
    expect(ringCrossing(v(0, R, 0), HIGH_SUN, AXIS)).toBe(-1);
  });

  test("with the sun exactly in the ring plane there is no shadow", () => {
    expect(ringCrossing(v(0, -50, 80), SUN, AXIS)).toBe(-1);
  });
});

describe("the shader hooks", () => {
  const stub = () => ({
    uniforms: {},
    vertexShader: "void main() {\n#include <begin_vertex>\n#include <project_vertex>\n}",
    fragmentShader: "void main() {\n#include <map_fragment>\n#include <color_fragment>\n}",
  });

  test("the ring material learns the sun's position and the planet's radius", () => {
    const mat = shadeRing(new THREE.MeshBasicMaterial(), { planetRadius: R });
    const shader = stub();
    mat.onBeforeCompile(shader);
    expect(shader.uniforms.sunPosition.value.toArray()).toEqual([SUN_POS.x, SUN_POS.y, SUN_POS.z]);
    expect(shader.uniforms.planetRadius.value).toBe(R);
    expect(shader.fragmentShader).toContain("planetShadow");
    expect(shader.vertexShader).toContain("vRel");
  });

  test("the body material samples the ring's own opacity for its shadow", () => {
    const ringMap = new THREE.Texture();
    const mat = shadeBody(new THREE.MeshStandardMaterial(), { ringMap, inner: 140, outer: 230 });
    const shader = stub();
    mat.onBeforeCompile(shader);
    expect(shader.uniforms.ringMap.value).toBe(ringMap);
    expect(shader.uniforms.ringInner.value).toBe(140);
    expect(shader.uniforms.ringOuter.value).toBe(230);
    expect(shader.fragmentShader).toContain("ringShadow");
  });

  test("each hooked material gets its own program", () => {
    const a = shadeRing(new THREE.MeshBasicMaterial(), { planetRadius: R });
    const b = shadeBody(new THREE.MeshStandardMaterial(), { ringMap: new THREE.Texture(), inner: 1, outer: 2 });
    expect(a.customProgramCacheKey()).not.toBe(b.customProgramCacheKey());
    expect(a.customProgramCacheKey()).not.toBe(new THREE.MeshBasicMaterial().customProgramCacheKey());
  });
});
