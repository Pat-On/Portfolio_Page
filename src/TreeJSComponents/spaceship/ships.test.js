// Real three.js: these tests count the meshes the real builders produce.
// jsdom ships no 2D canvas; the hull textures only need a context that accepts calls.
const noop = () => {};
const gradient = { addColorStop: noop };
HTMLCanvasElement.prototype.getContext = function () {
  return new Proxy(
    { canvas: this },
    {
      get: (t, k) => (k in t ? t[k] : k.startsWith("create") && k.endsWith("Gradient") ? () => gradient : noop),
      set: (t, k, v) => {
        t[k] = v;
        return true;
      },
    }
  );
};

jest.mock("three", () => jest.requireActual("three"));

const { deathStar } = require("./deathStar");
const { spaceship } = require("./spaceship");
const { enterprise } = require("./enterprise");
const { borgCube } = require("./borg");
const { falcon } = require("./falcon");
const { isd } = require("./isd");

const drawables = (root) => {
  let n = 0;
  root.traverse((o) => {
    if (o.isMesh || o.isPoints || o.isLine || o.isSprite) n++;
  });
  return n;
};
const referenced = (userData) => {
  const out = [];
  const walk = (v, d) => {
    if (!v || typeof v !== "object" || d > 4) return;
    if (v.isObject3D) return out.push(v);
    if (v.isTexture || v.isMaterial) return;
    Object.values(v).forEach((x) => walk(x, d + 1));
  };
  walk(userData, 0);
  return out;
};
const isInside = (o, root) => {
  for (let p = o; p; p = p.parent) if (p === root) return true;
  return false;
};

// Draw-call budgets per ship. On main these were Death Star 465, Enterprise 143,
// ISD 41, Falcon 29 (scripts/perf/scene-graph.mjs); static parts now merge per material.
describe.each([
  ["Death Star", deathStar, 20],
  ["Enterprise", enterprise, 40],
  ["Star Destroyer", isd, 25],
  ["Falcon", falcon, 20],
  ["Borg cube", borgCube, 15],
  ["saucer", spaceship, 20],
])("%s", (_name, builder, budget) => {
  let group;
  beforeAll(() => {
    group = builder.build();
  });

  test(`draws in at most ${budget} calls`, () => {
    expect(drawables(group)).toBeLessThanOrEqual(budget);
  });

  test("still holds every part the animation and game code reach for", () => {
    for (const o of referenced(group.userData)) expect(isInside(o, group)).toBe(true);
  });
});

describe.each([
  ["Star Destroyer", isd, 7],
  ["Falcon", falcon, 1],
])("%s engine plumes", (_name, builder, engines) => {
  let group;
  beforeAll(() => {
    group = builder.build();
  });

  test(`has ${engines} soft additive plume(s), one per engine`, () => {
    const plumes = [];
    group.traverse((o) => o.name === "plume" && plumes.push(o));
    expect(plumes).toHaveLength(engines);
    plumes.forEach((p) => expect(p.material.depthWrite).toBe(false));
  });

  test("no longer draws the flared, flat-opacity back-faced bells", () => {
    const bells = [];
    group.traverse((o) => {
      if (o.isMesh && o.material.isMeshStandardMaterial && o.material.transparent && o.material.side === 1) bells.push(o);
    });
    expect(bells).toHaveLength(0);
  });
});

test("the Falcon's animated plume is the soft one", () => {
  expect(falcon.build().userData.animated.plumeMesh.name).toBe("plume");
});

describe("Borg cube hull", () => {
  let group;
  beforeAll(() => {
    group = borgCube.build();
  });

  test("glows through the circuit map, not as flat emissive slabs", () => {
    const { circuitTex } = group.userData.animated;
    const lit = [];
    group.traverse((o) => {
      if (!o.isMesh || o.material.transparent || !o.material.emissive) return;
      const glow = Math.max(o.material.emissive.r, o.material.emissive.g, o.material.emissive.b) * o.material.emissiveIntensity;
      if (glow > 0.2) lit.push(o.material);
    });
    expect(lit.length).toBeGreaterThan(0);
    lit.forEach((m) => expect(m.emissiveMap).toBe(circuitTex));
  });
});

describe("ships reflect the sky", () => {
  const { sharedEnvMap } = require("./envMap");
  test.each([
    ["Death Star", deathStar], ["Enterprise", enterprise], ["Star Destroyer", isd],
    ["Falcon", falcon], ["Borg cube", borgCube], ["saucer", spaceship],
  ])("%s has metal that mirrors the shared sky", (_name, builder) => {
    const mirrored = [];
    builder.build().traverse((o) => {
      if (o.isMesh && o.material.envMap === sharedEnvMap()) mirrored.push(o);
    });
    expect(mirrored.length).toBeGreaterThan(0);
  });
});

describe("hull relief", () => {
  test.each([
    ["Enterprise", enterprise], ["Star Destroyer", isd],
    ["Falcon", falcon], ["Borg cube", borgCube], ["saucer", spaceship],
  ])("%s's relief comes from its own panels, not the planets' crater map", (_name, builder) => {
    const maps = new Set();
    builder.build().traverse((o) => {
      if (o.isMesh && o.material.normalMap) maps.add(o.material.normalMap);
    });
    expect(maps.size).toBeGreaterThan(0);
    // A canvas worked out from the hull's panels, never a loaded picture
    maps.forEach((m) => expect(m.isCanvasTexture).toBe(true));
  });
});

describe("navigation lights", () => {
  test.each([["Enterprise", enterprise, 3], ["Star Destroyer", isd, 2]])(
    "%s hands its lamps to the animation, each on a material of its own", (_name, builder, count) => {
      const lamps = builder.build().userData.animated.navLights;
      expect(lamps).toHaveLength(count);
      expect(new Set(lamps.map((l) => l.material)).size).toBe(count);
      // The game's hit flash must not swap out a material that is being pulsed
      lamps.forEach((l) => expect(l.userData.keepMaterialOnHit).toBe(true));
    });
});
