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
