import * as THREE from "three";

// An engine exhaust: one open cone per engine, widest at the nozzle, drawn
// additively with no depth write. It fades along its length (white-hot at the
// nozzle, gone at the tip) and towards its silhouette, so it reads as glowing
// gas from any angle, not as a flat translucent bell with hard edges.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  color;
  uniform float intensity;
  uniform float opacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // CylinderGeometry: vUv.y is 0 at the bottom (the nozzle) and 1 at the tip
    float along  = pow(1.0 - vUv.y, 1.6);
    // Faces seen edge-on are the cone's silhouette: fade them out. Keep a floor
    // so the jet still shows when seen straight down its axis from behind.
    float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float soft   = mix(0.3, 1.0, pow(facing, 1.5));
    vec3  hot    = mix(color, vec3(1.0), along * along * 0.55);
    gl_FragColor = vec4(hot, along * soft * intensity * opacity);
  }
`;

export function makePlumeMaterial({ color = 0x88aaff, intensity = 1.0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      opacity: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

// The cone starts at the mesh's origin (put it at the nozzle exit) and points
// along +z; scale.y lengthens it from the nozzle.
export function makePlume({ radius, length, color, intensity, material } = {}) {
  const geo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.8, length, 16, 1, true);
  geo.translate(0, length / 2, 0);
  const mesh = new THREE.Mesh(geo, material || makePlumeMaterial({ color, intensity }));
  mesh.rotation.x = Math.PI / 2;
  mesh.name = "plume";
  return mesh;
}

export function setPlume(mesh, opacity, lengthScale) {
  mesh.material.uniforms.opacity.value = opacity;
  mesh.scale.y = lengthScale;
}
