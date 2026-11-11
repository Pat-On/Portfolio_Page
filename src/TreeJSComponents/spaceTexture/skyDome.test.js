import * as THREE from "three";
import { makeSkyDome, installBackground } from "./skyDome";

jest.mock("three", () => jest.requireActual("three"));

describe("makeSkyDome()", () => {
  const tex = new THREE.Texture();
  const dome = makeSkyDome(tex, { intensity: 1.6 });

  test("samples the equirect starmap itself: no cube-map conversion", () => {
    expect(dome.material).toBeInstanceOf(THREE.ShaderMaterial);
    expect(dome.material.uniforms.map.value).toBe(tex);
    expect(dome.material.uniforms.intensity.value).toBe(1.6);
  });

  test("is drawn first, behind everything, and never culled or written to depth", () => {
    expect(dome.material.depthWrite).toBe(false);
    expect(dome.material.depthTest).toBe(false);
    expect(dome.frustumCulled).toBe(false);
    expect(dome.renderOrder).toBeLessThan(-1000);
    expect(dome.material.side).toBe(THREE.BackSide);
  });

  test("filters across the wrap-around seam and matches three.js's output colour handling", () => {
    const fs = dome.material.fragmentShader;
    expect(fs).toMatch(/textureGrad/);
    expect(fs).toMatch(/#include <colorspace_fragment>/);
    // Tone mapped like the rest of the frame, so drawing straight to the screen
    // (game mode, or with bloom dropped) looks like the bloom path, where
    // OutputPass tone maps everything
    expect(dome.material.toneMapped).toBe(true);
  });

  test("stays centred on whichever camera renders it", () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(120, -40, 9000);
    dome.onBeforeRender(null, null, camera);
    expect(dome.position.toArray()).toEqual([120, -40, 9000]);
    expect(dome.matrixWorld.elements[14]).toBe(9000);
  });
});

describe("installBackground()", () => {
  test("adds the dome and leaves scene.background as a plain clear colour", () => {
    const scene = new THREE.Scene();
    const tex = new THREE.Texture();
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const dome = installBackground(scene, tex, { intensity: 1.6 });
    expect(scene.children).toContain(dome);
    expect(scene.background?.isTexture).toBeFalsy();
  });
});
