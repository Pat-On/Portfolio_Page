import * as THREE from "three";

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

export function buildComet() {
  const group = new THREE.Group();
  const rand  = rng(99);

  // Nucleus
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(8, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xccccaa,
      emissive: 0xffffff,
      emissiveIntensity: 1.2,
      roughness: 0.95,
      metalness: 0.0,
    })
  );
  group.add(nucleus);

  // Coma — diffuse glowing halo around nucleus
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(22, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  ));

  // Dust tail — wide, yellowish, fans out behind
  const DUST = 500;
  const dustPos = new Float32Array(DUST * 3);
  const dustCol = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const t      = rand();
    const spread = t * 55;
    dustPos[i * 3]     = (rand() - 0.5) * spread;
    dustPos[i * 3 + 1] = (rand() - 0.5) * spread * 0.35;
    dustPos[i * 3 + 2] = t * 550;
    const fade = 1 - t;
    dustCol[i * 3]     = 0.92 * fade;
    dustCol[i * 3 + 1] = 0.82 * fade;
    dustCol[i * 3 + 2] = 0.60 * fade;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('color',    new THREE.BufferAttribute(dustCol, 3));
  group.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 4.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  })));

  // Ion tail — narrow, blue, straighter, additive glow
  const ION = 300;
  const ionPos = new Float32Array(ION * 3);
  const ionCol = new Float32Array(ION * 3);
  for (let i = 0; i < ION; i++) {
    const t      = rand();
    const spread = t * 18;
    ionPos[i * 3]     = (rand() - 0.5) * spread;
    ionPos[i * 3 + 1] = (rand() - 0.5) * spread * 0.25;
    ionPos[i * 3 + 2] = t * 680;
    const fade = 1 - t;
    ionCol[i * 3]     = 0.30 * fade;
    ionCol[i * 3 + 1] = 0.72 * fade;
    ionCol[i * 3 + 2] = 1.00 * fade;
  }
  const ionGeo = new THREE.BufferGeometry();
  ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPos, 3));
  ionGeo.setAttribute('color',    new THREE.BufferAttribute(ionCol, 3));
  group.add(new THREE.Points(ionGeo, new THREE.PointsMaterial({
    size: 2.8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));

  // Nucleus point light — faint blue-white glow
  const cometLight = new THREE.PointLight(0xaaccff, 0.6, 350);
  group.add(cometLight);
  group.userData.cometLight = cometLight;

  return group;
}
