// findByRole here is the scene's own synchronous lookup (./findByRole), not
// Testing Library's async query, so the Testing Library query rules misfire.
/* eslint-disable testing-library/await-async-query, testing-library/prefer-screen-queries */
// jsdom doesn't ship a 2D canvas context — stub it BEFORE importing sun so
// makeGlowTexture / makeRayTexture can run during module load and inside build().
HTMLCanvasElement.prototype.getContext = function () {
  return {
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    fillStyle: "",
  };
};

const { sun } = require("./sun");
const { findByRole } = require("../../findByRole");

describe("sun.build()", () => {
  let group;
  beforeAll(() => { group = sun.build(); });

  test.each([
    ["sphere"],
    ["corona"],
    ["sprite"],
    ["flare"],
    ["prominenceGroup"],
    ["coronaRays"],
  ])("tags an animated child with userData.role = '%s'", (role) => {
    expect(findByRole(group, role)).toBeDefined();
  });

  test("every animated child has its role tag set", () => {
    const animatedRoles = ["sphere", "corona", "sprite", "flare", "prominenceGroup", "coronaRays"];
    for (const role of animatedRoles) {
      const child = findByRole(group, role);
      expect(child).toBeDefined();
      expect(child.userData.role).toBe(role);
    }
  });

  test("keeps three faint prominences, not six wire-like loops", () => {
    const arcs = findByRole(group, "prominenceGroup").children;
    expect(arcs).toHaveLength(3);
    arcs.forEach((arc) => expect(arc.material.opacity).toBeLessThanOrEqual(0.4));
  });

  test("the corona is one soft fresnel shell, not flat-opacity spheres", () => {
    expect(findByRole(group, "chromosphere")).toBeUndefined();
    expect(findByRole(group, "kCorona")).toBeUndefined();
    const corona = findByRole(group, "corona");
    expect(corona.material.uniforms.intensity).toBeDefined();
  });
});
