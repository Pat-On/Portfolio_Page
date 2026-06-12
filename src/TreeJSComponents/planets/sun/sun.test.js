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
    ["chromosphere"],
    ["sprite"],
    ["flare"],
    ["prominenceGroup"],
    ["coronaRays"],
  ])("tags an animated child with userData.role = '%s'", (role) => {
    expect(findByRole(group, role)).toBeDefined();
  });

  test("every animated child has its role tag set", () => {
    const animatedRoles = ["sphere", "chromosphere", "sprite", "flare", "prominenceGroup", "coronaRays"];
    for (const role of animatedRoles) {
      const child = findByRole(group, role);
      expect(child).toBeDefined();
      expect(child.userData.role).toBe(role);
    }
  });
});
