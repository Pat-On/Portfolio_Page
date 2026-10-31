import * as THREE from "three";
import { ambientLight, sunLight } from "./lights";
import { SUN_POS } from "../registry";

describe("scene lighting", () => {
  test("the sun is the key light: it sits at the sun and does not fade with distance", () => {
    expect(sunLight).toBeInstanceOf(THREE.PointLight);
    expect(sunLight.position.toArray()).toEqual([SUN_POS.x, SUN_POS.y, SUN_POS.z]);
    expect(sunLight.decay).toBe(0);
    expect(sunLight.distance).toBe(0);
  });

  test("ambient light is a low fill, so planets keep a dark side", () => {
    expect(ambientLight).toBeInstanceOf(THREE.AmbientLight);
    expect(ambientLight.intensity).toBeLessThanOrEqual(0.2);
  });
});
