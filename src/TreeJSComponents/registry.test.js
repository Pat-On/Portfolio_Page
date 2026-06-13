import { SUN_POS, celestialBodies, ships } from "./registry";

describe("scene registry", () => {
  describe("SUN_POS", () => {
    it("matches the original ViewGL sun anchor", () => {
      expect(SUN_POS).toEqual({ x: 350, y: 300, z: -900 });
    });
  });

  describe("celestialBodies", () => {
    const byName = (name) => celestialBodies.find((b) => b.name === name);

    it("contains the sun and every planet from solarSystem.js", () => {
      const names = celestialBodies.map((b) => b.name);
      expect(names).toEqual(
        expect.arrayContaining([
          "sun", "mercury", "venus", "earth", "mars",
          "jupiter", "saturn", "uranus", "neptune", "deathStar",
        ])
      );
    });

    it.each([
      ["mercury", { x: 0,    y: 0,    z: 700 }],
      ["venus",   { x: 0,    y: 0,    z: 900 }],
      ["earth",   { x: 650,  y: 450,  z: 1300 }],
      ["mars",    { x: 0,    y: 100,  z: 1700 }],
      ["jupiter", { x: 0,    y: 0,    z: 2500 }],
      ["saturn",  { x: 0,    y: -100, z: 3400 }],
      ["uranus",  { x: 0,    y: 150,  z: 4300 }],
      ["neptune", { x: 0,    y: 0,    z: 5200 }],
    ])("preserves the original local position of %s", (name, pos) => {
      expect(byName(name).position).toEqual(pos);
    });

    it("places the moon as a child of earth, not a top-level orbit", () => {
      const earth = byName("earth");
      const moon  = earth.children.find((c) => c.name === "moon");
      expect(moon).toBeDefined();
      expect(moon.position).toEqual({ x: 150, y: 0, z: 0 });
    });

    it("places the death star as a top-level orbit at its original position", () => {
      expect(byName("deathStar").position).toEqual({ x: -600, y: -300, z: 7200 });
    });

    it.each([
      ["sun",       { spinSpeed: 0.001 }],
      ["mercury",   { orbitSpeed: 0.005,   spinSpeed: 0.005 }],
      ["venus",     { orbitSpeed: 0.0025,  spinSpeed: 0.001 }],
      ["earth",     { orbitSpeed: 0.002,   spinSpeed: 0.0015 }],
      ["mars",      { orbitSpeed: 0.0016,  spinSpeed: 0.0014 }],
      ["jupiter",   { orbitSpeed: 0.001,   spinSpeed: 0.003 }],
      ["saturn",    { orbitSpeed: 0.0008,  spinSpeed: 0.0025 }],
      ["uranus",    { orbitSpeed: 0.0006,  spinSpeed: 0.0018 }],
      ["neptune",   { orbitSpeed: 0.0005,  spinSpeed: 0.0016 }],
      ["deathStar", { orbitSpeed: 0.00018, spinSpeed: 0.0006 }],
    ])("preserves original orbit/spin speeds for %s", (name, speeds) => {
      const body = byName(name);
      if (speeds.orbitSpeed !== undefined) {
        expect(body.orbitSpeed).toBeCloseTo(speeds.orbitSpeed, 6);
      }
      expect(body.spinSpeed).toBeCloseTo(speeds.spinSpeed, 6);
    });
  });

  describe("ships", () => {
    const byName = (name) => ships.find((s) => s.name === name);

    it("contains every ship from ViewGL", () => {
      const names = ships.map((s) => s.name);
      expect(names).toEqual(
        expect.arrayContaining(["spaceship", "enterprise", "borg", "falcon", "isd"])
      );
    });

    it.each([
      ["spaceship",  { x: 1300, y: 720, z:  900 }, undefined,  undefined],
      ["enterprise", { x:  400, y: 500, z: 3100 }, Math.PI,    1.5],
      ["borg",       { x:  550, y: 300, z: 4850 }, undefined,  undefined],
      ["falcon",     { x:  200, y: 380, z: 1900 }, Math.PI,    undefined],
      ["isd",        { x:  150, y: 210, z: 6100 }, -Math.PI/2, undefined],
    ])("preserves position/rotation/scale for %s", (name, pos, ry, scale) => {
      const ship = byName(name);
      expect(ship.position).toEqual(pos);
      if (ry !== undefined) expect(ship.rotationY).toBeCloseTo(ry);
      if (scale !== undefined) expect(ship.scale).toBe(scale);
    });
  });
});
