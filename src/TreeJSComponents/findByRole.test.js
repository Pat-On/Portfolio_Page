import { findByRole } from "./findByRole";

describe("findByRole", () => {
  const make = (role) => ({ userData: role ? { role } : {} });

  it("returns the first child whose userData.role matches", () => {
    const parent = { children: [make("a"), make("b"), make("c")] };
    expect(findByRole(parent, "b")).toBe(parent.children[1]);
  });

  it("returns undefined when no child has the role", () => {
    const parent = { children: [make("a"), make("b")] };
    expect(findByRole(parent, "z")).toBeUndefined();
  });

  it("handles children with no userData.role gracefully", () => {
    const parent = { children: [make(null), make("x")] };
    expect(findByRole(parent, "x")).toBe(parent.children[1]);
  });

  it("returns undefined on null parent", () => {
    expect(findByRole(null, "a")).toBeUndefined();
  });

  it("returns undefined on parent without children", () => {
    expect(findByRole({}, "a")).toBeUndefined();
  });
});
