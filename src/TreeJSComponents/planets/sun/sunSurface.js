import { findByRole } from "../../findByRole";

// The sun's surface churns in place. Two layers of smooth noise, laid over the
// photo and drifting through each other, brighten and darken it the way hot
// gas rising and sinking does. The photo itself stays put: sliding it sideways
// read as a spinning ball with a picture on it.

// Surface-clock units per second: slow enough to read as huge, fast enough to see
export const BOIL_RATE = 0.12;

const NOISE = /* glsl */ `
  float boilHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float boilNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(boilHash(i), boilHash(i + vec3(1, 0, 0)), f.x),
          mix(boilHash(i + vec3(0, 1, 0)), boilHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(boilHash(i + vec3(0, 0, 1)), boilHash(i + vec3(1, 0, 1)), f.x),
          mix(boilHash(i + vec3(0, 1, 1)), boilHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float boilFbm(vec3 p) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < BOIL_OCTAVES; i++) {
      sum += boilNoise(p) * amp;
      norm += amp;
      p = p * 2.03 + 11.7;
      amp *= 0.5;
    }
    return sum / norm;
  }
  // Around 1: darker lanes about 0.7, bright cells about 1.3
  float boilAt(vec3 dir, float t) {
    float cells = boilFbm(dir * 7.0 + vec3(0.0, t, t * 0.6));
    float grain = boilFbm(dir * 16.0 - vec3(t * 1.3, 0.0, t * 0.8));
    return 0.7 + 0.6 * (cells * 0.6 + grain * 0.4);
  }
`;

// Hooks a MeshStandardMaterial. `cheap` halves the noise work (phones).
export function boilingSurface(material, { cheap = false } = {}) {
  const surfaceTime = { value: 0 };
  material.userData.surfaceTime = surfaceTime;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.surfaceTime = surfaceTime;
    shader.vertexShader = `varying vec3 vSurfacePos;\n${shader.vertexShader}`
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vSurfacePos = position;");
    shader.fragmentShader = `#define BOIL_OCTAVES ${cheap ? 2 : 3}
      uniform float surfaceTime;
      varying vec3 vSurfacePos;
      ${NOISE}
      ${shader.fragmentShader}`
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float boil = boilAt(normalize(vSurfacePos), surfaceTime);
        // Eddington limb darkening: I(μ) = I₀·(0.36 + 0.64·μ), μ = cos(angle from disk centre)
        float mu = clamp(abs(normalize(vNormal).z), 0.0, 1.0);
        diffuseColor.rgb *= (0.36 + 0.64 * mu) * boil;`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance *= boil;`
      );
  };
  material.customProgramCacheKey = () => `sun-boil-${cheap ? 2 : 3}`;
  return material;
}

// Per frame: move the surface clock on.
export function boilSun(sunRoot, delta) {
  const clock = sunRoot && findByRole(sunRoot, "sphere")?.material?.userData?.surfaceTime;
  if (clock) clock.value += delta * BOIL_RATE;
}
