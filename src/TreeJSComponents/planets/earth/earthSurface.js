import * as THREE from "three";
import { SUN_POS } from "../../sunPosition";

// What makes Earth look alive, added to its ordinary lit material:
//  - city lights on the night side, hidden under cloud;
//  - oceans smoother than land, so the sun glints off the water;
//  - a soft shadow under the clouds, moving with them.
// All three read one packed picture (scripts/textures): red is the night
// lights, green the clouds, blue the oceans.

// How far into the night a point is, from the cosine of the angle between its
// "up" and the sun: 0 in daylight, 1 once the sun is well below the horizon.
const DUSK_FROM = -0.1;
const DUSK_TO = 0.25;

export function nightAmount(cosSun) {
  return 1 - THREE.MathUtils.smoothstep(cosSun, DUSK_FROM, DUSK_TO);
}

const glsl = (n) => n.toFixed(4);

const OCEAN_ROUGHNESS = 0.38;
const CLOUD_SHADE = 0.35;
// Sodium-lamp orange, bright enough to read on the dark side
const LIGHTS = "vec3(1.0, 0.78, 0.45) * 2.2";

export function earthSurface(material, { extras }) {
  const cloudShift = { value: 0 };
  material.userData.cloudShift = cloudShift;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      earthExtras: { value: extras },
      sunPosition: { value: new THREE.Vector3(SUN_POS.x, SUN_POS.y, SUN_POS.z) },
      cloudShift,
    });
    shader.vertexShader = `varying vec3 vEarthUp;
      varying vec3 vEarthPos;
      varying vec2 vEarthUv;
      ${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
        vEarthUp = normalize(mat3(modelMatrix) * normal);
        vEarthPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vEarthUv = uv;`
    );
    shader.fragmentShader = `uniform sampler2D earthExtras;
      uniform vec3 sunPosition;
      uniform float cloudShift;
      varying vec3 vEarthUp;
      varying vec3 vEarthPos;
      varying vec2 vEarthUv;
      ${shader.fragmentShader}`
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 extras = texture2D(earthExtras, vEarthUv).rgb;
        // The cloud layer turns on its own: look up the cloud above this spot
        float cloud = texture2D(earthExtras, vec2(vEarthUv.x - cloudShift, vEarthUv.y)).g;
        float ocean = extras.b;
        float shade = 1.0 - cloud * ${glsl(CLOUD_SHADE)};
        diffuseColor.rgb *= shade;`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, ${glsl(OCEAN_ROUGHNESS)}, ocean);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float cosSun = dot(normalize(vEarthUp), normalize(sunPosition - vEarthPos));
        float night = 1.0 - smoothstep(${glsl(DUSK_FROM)}, ${glsl(DUSK_TO)}, cosSun);
        totalEmissiveRadiance += ${LIGHTS} * extras.r * night * (1.0 - cloud * 0.8);`
      );
  };
  material.customProgramCacheKey = () => "earth-surface";
  return material;
}

// The cloud layer. Clouds are lit like anything else, but the scene's faint
// fill light would leave them as a grey veil over the whole night side, so
// they thin out there.
const NIGHT_CLOUD = 0.25;

export function cloudLayer(material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.sunPosition = { value: new THREE.Vector3(SUN_POS.x, SUN_POS.y, SUN_POS.z) };
    shader.vertexShader = `varying vec3 vEarthUp;
      varying vec3 vEarthPos;
      ${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
        vEarthUp = normalize(mat3(modelMatrix) * normal);
        vEarthPos = (modelMatrix * vec4(position, 1.0)).xyz;`
    );
    shader.fragmentShader = `uniform vec3 sunPosition;
      varying vec3 vEarthUp;
      varying vec3 vEarthPos;
      ${shader.fragmentShader}`.replace(
      "#include <alphamap_fragment>",
      `#include <alphamap_fragment>
        float cosSun = dot(normalize(vEarthUp), normalize(sunPosition - vEarthPos));
        float night = 1.0 - smoothstep(${glsl(DUSK_FROM)}, ${glsl(DUSK_TO)}, cosSun);
        diffuseColor.a *= mix(1.0, ${glsl(NIGHT_CLOUD)}, night);`
    );
  };
  material.customProgramCacheKey = () => "earth-clouds";
  return material;
}

// Per frame: turn the cloud layer by `angle` and keep its shadow under it.
export function driftClouds(earth, angle) {
  const clouds = earth?.userData?.cloudMesh;
  if (!clouds) return;
  clouds.rotation.y += angle;
  const shift = earth.userData.surface?.material?.userData?.cloudShift;
  if (shift) shift.value = clouds.rotation.y / (2 * Math.PI);
}
