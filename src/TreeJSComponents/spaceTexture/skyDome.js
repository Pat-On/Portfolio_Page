import * as THREE from "three";

// The starmap background, drawn by a box that follows the camera and samples
// the equirectangular image directly.
//
// Set as `scene.background`, an equirect texture is first converted by three.js
// into a WebGLCubeRenderTarget whose faces are as tall as the image: six 4096²
// RGBA faces (384 MiB before mipmaps) for the 8k starmap, six 2048² on mobile,
// all on top of the image itself. Sampling the image per pixel costs nothing
// extra and is sharper, since no 4096² resample sits in between.
const vertexShader = /* glsl */ `
  #include <common>
  varying vec3 vWorldDirection;
  void main() {
    vWorldDirection = transformDirection(position, modelMatrix);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w; // on the far plane, behind everything
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  uniform sampler2D map;
  uniform float intensity;
  varying vec3 vWorldDirection;
  void main() {
    vec2 uv = equirectUv(normalize(vWorldDirection));
    // u jumps from 1 back to 0 at the seam, which would make the GPU pick the
    // smallest mip there and draw a line. Take the gradients from whichever of
    // u and its half-turn-shifted copy is continuous at this pixel.
    vec2 dx = dFdx(uv), dy = dFdy(uv);
    float u2 = fract(uv.x + 0.5);
    float du2x = dFdx(u2), du2y = dFdy(u2);
    if (abs(du2x) + abs(du2y) < abs(dx.x) + abs(dy.x)) { dx.x = du2x; dy.x = du2y; }
    vec4 texel = textureGrad(map, uv, dx, dy);
    gl_FragColor = vec4(texel.rgb * intensity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function makeSkyDome(texture, { intensity = 1 } = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      intensity: { value: intensity },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    // Tone mapped when drawn straight to the screen (game mode, bloom dropped),
    // so it matches the bloom path, where OutputPass tone maps the whole frame
    toneMapped: true,
  });
  const dome = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material);
  dome.name = "skyDome";
  dome.frustumCulled = false;
  dome.renderOrder = -1e6;
  dome.onBeforeRender = (_renderer, _scene, camera) => {
    dome.position.copy(camera.position);
    dome.updateMatrixWorld();
  };
  return dome;
}

// Puts the starmap behind the scene and keeps scene.background a clear colour,
// so three.js never builds the cube map.
export function installBackground(scene, texture, options) {
  scene.background = new THREE.Color(0x000000);
  const dome = makeSkyDome(texture, options);
  scene.add(dome);
  return dome;
}
