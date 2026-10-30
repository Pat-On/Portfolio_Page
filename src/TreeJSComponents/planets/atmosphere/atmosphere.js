import * as THREE from "three";

// A soft glow around a sphere, drawn as one back-faced shell. Brightness
// follows how directly the shell faces the camera, so it is strongest next to
// the body it wraps and fades to nothing at its own edge, with no visible rim.
// One draw call and a few shader instructions: the cheap stand-in for an
// atmosphere-scattering shader.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  glowColor;
  uniform float intensity;
  uniform float power;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Back faces: the normal points away, so flip it before comparing
    float facing = clamp(dot(-vNormal, vViewDir), 0.0, 1.0);
    float glow = pow(facing, power) * intensity;
    gl_FragColor = vec4(glowColor * glow, glow);
  }
`;

export function makeAtmosphere({
  radius,
  color,
  intensity = 1,
  power = 3,
  widthSegments = 48,
  heightSegments = 24,
}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      power: { value: power },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material);
}
