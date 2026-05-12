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

export function buildAsteroidBelt() {
  const COUNT = 900;
  const INNER_R = 2000, OUTER_R = 2200, Y_SPREAD = 80;
  const rand = rng(42);

  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const angle = rand() * Math.PI * 2;
    const r     = INNER_R + rand() * (OUTER_R - INNER_R);
    positions[i * 3]     = Math.cos(angle) * r;
    positions[i * 3 + 1] = (rand() - 0.5) * Y_SPREAD;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const shade = 0.35 + rand() * 0.35;
    const warm  = rand() * 0.08;
    colors[i * 3]     = shade + warm;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade - warm * 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 3.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.80,
    depthWrite: false,
  }));

  const group = new THREE.Group();
  group.add(pts);
  return group;
}
