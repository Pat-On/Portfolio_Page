import * as THREE from "three";
import { makePlume, setPlume } from "./plume";

jest.mock("three", () => jest.requireActual("three"));

describe("makePlume()", () => {
  const plume = makePlume({ radius: 20, length: 70, color: 0x88aaff });

  test("is one soft additive cone that never hides what is behind it", () => {
    const m = plume.material;
    expect(m).toBeInstanceOf(THREE.ShaderMaterial);
    expect(m.blending).toBe(THREE.AdditiveBlending);
    expect(m.transparent).toBe(true);
    expect(m.depthWrite).toBe(false);
    expect(m.side).toBe(THREE.DoubleSide);
  });

  test("is widest at the nozzle and tapers away from it (not a flared bell)", () => {
    const p = plume.geometry.parameters;
    // CylinderGeometry: radiusBottom is the nozzle end, radiusTop the tip
    expect(p.radiusBottom).toBeGreaterThan(p.radiusTop);
    expect(p.radiusBottom).toBeLessThanOrEqual(20);
    expect(p.openEnded).toBe(true);
  });

  test("starts at the nozzle and points along +z, so scaling it lengthens the jet", () => {
    plume.updateMatrixWorld(true);
    plume.geometry.computeBoundingBox();
    const bb = plume.geometry.boundingBox.clone().applyMatrix4(plume.matrixWorld);
    expect(bb.min.z).toBeCloseTo(0);
    expect(bb.max.z).toBeCloseTo(70);
  });

  test("fades out along its length and towards its silhouette in the shader", () => {
    expect(plume.material.fragmentShader).toMatch(/vUv\.y/);
    expect(plume.material.fragmentShader).toMatch(/vViewDir/);
  });

  test("exposes colour, intensity and opacity as uniforms", () => {
    const u = plume.material.uniforms;
    expect(u.color.value.getHex()).toBe(0x88aaff);
    expect(typeof u.intensity.value).toBe("number");
    expect(u.opacity.value).toBe(1);
  });

  test("engines of one ship can share a material (one shader program)", () => {
    const shared = plume.material;
    const other = makePlume({ radius: 12, length: 50, material: shared });
    expect(other.material).toBe(shared);
  });
});

describe("setPlume()", () => {
  test("drives the shader opacity and the jet length", () => {
    const plume = makePlume({ radius: 10, length: 40, color: 0xffffff });
    setPlume(plume, 0.4, 1.3);
    expect(plume.material.uniforms.opacity.value).toBe(0.4);
    expect(plume.scale.y).toBe(1.3);
  });
});
