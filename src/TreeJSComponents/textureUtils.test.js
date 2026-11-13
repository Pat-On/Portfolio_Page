import * as THREE from "three";
import { normalMapTex } from "./textureUtils";

// Real three.js: the root __mocks__/three.js has no colour-space constants.
jest.mock("three", () => jest.requireActual("three"));

describe("normalMapTex()", () => {
  test("returns one texture per URL, so every user shares one GPU upload", () => {
    const load = jest.spyOn(THREE.TextureLoader.prototype, "load");
    const a = normalMapTex("bumps.webp");
    const b = normalMapTex("bumps.webp");
    expect(a).toBe(b);
    expect(load.mock.calls.filter(([url]) => url === "bumps.webp")).toHaveLength(1);
    load.mockRestore();
  });

  test("keeps different URLs apart", () => {
    expect(normalMapTex("one.webp")).not.toBe(normalMapTex("two.webp"));
  });

  test("tiles and stays linear (normal maps are data, not colour)", () => {
    const t = normalMapTex("tile.webp");
    expect(t.wrapS).toBe(THREE.RepeatWrapping);
    expect(t.wrapT).toBe(THREE.RepeatWrapping);
    expect(t.colorSpace).not.toBe(THREE.SRGBColorSpace);
  });
});
