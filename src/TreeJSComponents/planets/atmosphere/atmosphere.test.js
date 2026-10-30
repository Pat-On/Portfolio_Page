import * as THREE from "three";
import { makeAtmosphere } from "./atmosphere";

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
