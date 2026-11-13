import * as THREE from "three";
import { SUN_POS } from "../../sunPosition";

// Saturn's two shadows, worked out per pixel from plain geometry instead of a
// shadow map: the scene is far too large for one, and a sphere and a flat ring
// need only a few lines each.
//
// Everything is measured from the planet's centre, in the planet's own units,
// with `sunDir` the unit direction towards the sun.

// Width of the soft edge of the planet's shadow, as a share of its radius
const EDGE = 0.06;
// The darkest a shadowed piece of ring gets (some light always scatters in)
const RING_FLOOR = 0.1;
// How much of the sunlight the densest part of the ring takes off the planet
const RING_DENSITY = 0.8;

const _v = new THREE.Vector3();

// 1 where a point of the ring sees the sun, 0 inside the planet's shadow: the
// column of radius R stretching away from the sun behind the planet.
export function planetShadowOnRing(p, sunDir, R) {
  const along = p.dot(sunDir);
  if (along >= 0) return 1;
  const across = _v.copy(p).addScaledVector(sunDir, -along).length();
  return THREE.MathUtils.smoothstep(across, R * (1 - EDGE), R * (1 + EDGE));
}

// From a point of the planet, look towards the sun: the distance from the
// centre at which that line passes through the ring plane (`axis` is the
// plane's normal), or -1 if it never does. The ring shades the point when that
// distance falls between the ring's inner and outer edge.
export function ringCrossing(p, sunDir, axis) {
  const slope = sunDir.dot(axis);
  if (Math.abs(slope) < 1e-4) return -1;
  const t = -p.dot(axis) / slope;
  if (t <= 0) return -1;
  return _v.copy(p).addScaledVector(sunDir, t).length();
}

const glsl = (n) => n.toFixed(4);

// Shared by both materials: where the fragment is, relative to the planet's
// centre and in the planet's units. Body and ring both sit at the origin of
// Saturn's group, so the centre is their own model matrix's translation.
const VERTEX_DECL = /* glsl */ `
  varying vec3 vRel;
  varying vec3 vSunDir;
  varying vec3 vAxis;
  uniform vec3 sunPosition;
`;
const VERTEX_BODY = /* glsl */ `
  {
    vec3 centre = modelMatrix[3].xyz;
    float unit = length(modelMatrix[0].xyz);
    vRel = ((modelMatrix * vec4(transformed, 1.0)).xyz - centre) / unit;
    vSunDir = normalize(sunPosition - centre);
    vAxis = normalize(mat3(modelMatrix) * AXIS_LOCAL);
  }
`;
const FRAGMENT_DECL = /* glsl */ `
  varying vec3 vRel;
  varying vec3 vSunDir;
  varying vec3 vAxis;
`;

function hook(material, key, { axisLocal, uniforms, fragmentDecl, fragmentBody }) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, {
      sunPosition: { value: new THREE.Vector3(SUN_POS.x, SUN_POS.y, SUN_POS.z) },
    });
    shader.vertexShader = `#define AXIS_LOCAL ${axisLocal}\n${VERTEX_DECL}${shader.vertexShader}`
      .replace("#include <project_vertex>", `#include <project_vertex>\n${VERTEX_BODY}`);
    shader.fragmentShader = `${FRAGMENT_DECL}${fragmentDecl}${shader.fragmentShader}`
      .replace("#include <color_fragment>", `#include <color_fragment>\n${fragmentBody}`);
  };
  material.customProgramCacheKey = () => key;
  return material;
}

// The ring: darken the part lying in the planet's shadow.
export function shadeRing(material, { planetRadius }) {
  return hook(material, "saturn-ring-shadowed", {
    // RingGeometry lies in its own XY plane
    axisLocal: "vec3(0.0, 0.0, 1.0)",
    uniforms: { planetRadius: { value: planetRadius } },
    fragmentDecl: /* glsl */ `
      uniform float planetRadius;
    `,
    fragmentBody: /* glsl */ `
      {
        float along = dot(vRel, vSunDir);
        float across = length(vRel - vSunDir * along);
        float planetShadow = along >= 0.0 ? 1.0 : smoothstep(
          planetRadius * ${glsl(1 - EDGE)}, planetRadius * ${glsl(1 + EDGE)}, across);
        diffuseColor.rgb *= mix(${glsl(RING_FLOOR)}, 1.0, planetShadow);
      }
    `,
  });
}

// The planet: darken the band where the ring stands between it and the sun,
// by as much as the ring is opaque there.
export function shadeBody(material, { ringMap, inner, outer }) {
  return hook(material, "saturn-body-ring-shadow", {
    // The ring plane's normal is the planet's spin axis
    axisLocal: "vec3(0.0, 1.0, 0.0)",
    uniforms: {
      ringMap: { value: ringMap },
      ringInner: { value: inner },
      ringOuter: { value: outer },
    },
    fragmentDecl: /* glsl */ `
      uniform sampler2D ringMap;
      uniform float ringInner;
      uniform float ringOuter;
    `,
    fragmentBody: /* glsl */ `
      {
        float slope = dot(vSunDir, vAxis);
        float ringShadow = 0.0;
        if (abs(slope) > 1e-4) {
          float t = -dot(vRel, vAxis) / slope;
          float u = (length(vRel + vSunDir * t) - ringInner) / (ringOuter - ringInner);
          if (t > 0.0 && u > 0.0 && u < 1.0) {
            ringShadow = texture2D(ringMap, vec2(u, 0.5)).a * ${glsl(RING_DENSITY)};
          }
        }
        diffuseColor.rgb *= 1.0 - ringShadow;
      }
    `,
  });
}
