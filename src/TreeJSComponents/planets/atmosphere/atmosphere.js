import * as THREE from "three";

// A soft glow around a sphere, drawn as one back-faced shell. Brightness
// follows how directly the shell faces the camera, so it is strongest next to
// the body it wraps and fades to nothing at its own edge, with no visible rim.
// One draw call and a few shader instructions: the cheap stand-in for an
// atmosphere-scattering shader.
// How much of the glow is left at a point of the shell, from the cosine of the
// angle between its outward normal and the direction to the sun: full on the
// day side, fading through the terminator, a faint floor on the night side.
// The shader below computes the same thing from the same three numbers.
const NIGHT_FLOOR = 0.06;
const DUSK_FROM = -0.25;
const DUSK_TO = 0.35;

export function daylight(cosSun) {
  const t = Math.min(1, Math.max(0, (cosSun - DUSK_FROM) / (DUSK_TO - DUSK_FROM)));
  if (t >= 1) return 1;
  return NIGHT_FLOOR + (1 - NIGHT_FLOOR) * t * t * (3 - 2 * t);
}

const glsl = (n) => n.toFixed(4);

const makeVertexShader = (sunAware) => /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  ${sunAware ? "varying vec3 vWorldNormal;\n  varying vec3 vWorldPosition;" : ""}
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    ${sunAware ? "vWorldNormal = normalize(mat3(modelMatrix) * normal);\n    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;" : ""}
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const makeFragmentShader = (sunAware) => /* glsl */ `
  uniform vec3  glowColor;
  uniform float intensity;
  uniform float power;
  ${sunAware ? "uniform vec3 sunPosition;\n  varying vec3 vWorldNormal;\n  varying vec3 vWorldPosition;" : ""}
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Back faces: the normal points away, so flip it before comparing
    float facing = clamp(dot(-vNormal, vViewDir), 0.0, 1.0);
    float glow = pow(facing, power) * intensity;
    ${sunAware ? `float cosSun = dot(normalize(vWorldNormal), normalize(sunPosition - vWorldPosition));
    glow *= mix(${glsl(NIGHT_FLOOR)}, 1.0, smoothstep(${glsl(DUSK_FROM)}, ${glsl(DUSK_TO)}, cosSun));` : ""}
    gl_FragColor = vec4(glowColor * glow, glow);
  }
`;

// `sunPosition` ({x, y, z} in world space) makes the glow follow daylight: a
// planet's air is lit on the day side only. Leave it out for a glow that is
// its own light, like the sun's corona.
export function makeAtmosphere({
  radius,
  color,
  intensity = 1,
  power = 3,
  widthSegments = 48,
  heightSegments = 24,
  sunPosition = null,
}) {
  const sunAware = !!sunPosition;
  const uniforms = {
    glowColor: { value: new THREE.Color(color) },
    intensity: { value: intensity },
    power: { value: power },
  };
  if (sunAware) {
    uniforms.sunPosition = { value: new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z) };
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: makeVertexShader(sunAware),
    fragmentShader: makeFragmentShader(sunAware),
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material);
}
