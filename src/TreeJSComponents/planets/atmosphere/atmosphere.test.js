import * as THREE from "three";
import { makeAtmosphere, daylight } from "./atmosphere";

describe("makeAtmosphere", () => {
  const shell = makeAtmosphere({ radius: 100, color: 0x66aaff, intensity: 0.8, power: 3 });

  test("is one sphere a little larger than the body it wraps", () => {
    expect(shell).toBeInstanceOf(THREE.Mesh);
    expect(shell.geometry.parameters.radius).toBe(100);
  });

  test("draws as a soft additive glow that never hides what is behind it", () => {
    const m = shell.material;
    expect(m).toBeInstanceOf(THREE.ShaderMaterial);
    expect(m.blending).toBe(THREE.AdditiveBlending);
    expect(m.transparent).toBe(true);
    expect(m.depthWrite).toBe(false);
    // Back faces only: the glow fades to nothing at the shell's own edge
    expect(m.side).toBe(THREE.BackSide);
  });

  test("exposes colour, intensity and power as uniforms for animation", () => {
    const u = shell.material.uniforms;
    expect(u.glowColor.value).toBeInstanceOf(THREE.Color);
    expect(u.glowColor.value.getHex()).toBe(0x66aaff);
    expect(u.intensity.value).toBe(0.8);
    expect(u.power.value).toBe(3);
  });

  test("stays cheap: low segment counts by default", () => {
    expect(shell.geometry.parameters.widthSegments).toBeLessThanOrEqual(48);
  });
});

describe("a sun-aware atmosphere", () => {
  const sun = { x: 350, y: 300, z: -900 };
  const shell = makeAtmosphere({ radius: 60, color: 0x5aa0ff, sunPosition: sun });

  test("knows where the sun is", () => {
    const u = shell.material.uniforms;
    expect(u.sunPosition.value).toBeInstanceOf(THREE.Vector3);
    expect(u.sunPosition.value.toArray()).toEqual([350, 300, -900]);
    expect(shell.material.fragmentShader).toContain("sunPosition");
  });

  test("still a single additive back-faced shell", () => {
    const m = shell.material;
    expect(m.side).toBe(THREE.BackSide);
    expect(m.blending).toBe(THREE.AdditiveBlending);
    expect(m.depthWrite).toBe(false);
  });

  test("without a sun position the glow ignores the sun, as the sun's own corona needs", () => {
    const corona = makeAtmosphere({ radius: 100, color: 0xffaa55 });
    expect(corona.material.uniforms.sunPosition).toBeUndefined();
    expect(corona.material.fragmentShader).not.toContain("sunPosition");
  });
});

describe("daylight()", () => {
  // cosine of the angle between the outward normal and the direction to the sun
  test("full on the day side", () => {
    expect(daylight(1)).toBe(1);
    expect(daylight(0.4)).toBe(1);
  });

  test("a faint floor on the night side, never fully black", () => {
    expect(daylight(-1)).toBeCloseTo(daylight(-0.3), 6);
    expect(daylight(-1)).toBeGreaterThan(0);
    expect(daylight(-1)).toBeLessThan(0.1);
  });

  test("fades smoothly through the terminator, already dim where the sun is on the horizon", () => {
    const steps = [-0.25, -0.1, 0, 0.1, 0.2, 0.35].map(daylight);
    for (let i = 1; i < steps.length; i++) expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    expect(daylight(0)).toBeLessThan(0.5);
  });
});
