import * as THREE from "three";
import { IS_MOBILE } from "../../../utils/mobileQuality";

// Where the belt lies, measured from the sun
export const BELT = { inner: 2000, outer: 2200, ySpread: 80 };

// Rocks with a shape cost triangles; phones keep a handful and the dust
export const rockCount = (isMobile) => (isMobile ? 90 : 320);

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

// One lumpy boulder. Corners that share a position move together, so the
// faces stay joined.
function rockGeometry() {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const lump = 1
      + 0.26 * Math.sin(v.x * 3.1 + 1.3) * Math.sin(v.y * 2.7 + 0.4)
      + 0.16 * Math.sin(v.z * 4.3 + 2.1);
    pos.setXYZ(i, v.x * lump, v.y * lump, v.z * lump);
  }
  geo.computeVertexNormals();
  return geo;
}

// The rocks a visitor can make out: one shape, drawn many times in a single
// call, each with its own size, squash, turn and tint, lit by the sun.
function buildRocks(count) {
  const rand = rng(1337);
  const rocks = new THREE.InstancedMesh(
    rockGeometry(),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, flatShading: true }),
    count
  );
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion();
  const s = new THREE.Vector3(), e = new THREE.Euler(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = BELT.inner + rand() * (BELT.outer - BELT.inner);
    p.set(Math.cos(angle) * r, (rand() - 0.5) * BELT.ySpread, Math.sin(angle) * r);
    q.setFromEuler(e.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2));
    // Mostly small, a few big
    const size = 2.5 + Math.pow(rand(), 3) * 11;
    s.set(size * (0.7 + rand() * 0.6), size * (0.6 + rand() * 0.5), size * (0.7 + rand() * 0.6));
    rocks.setMatrixAt(i, m.compose(p, q, s));
    const shade = 0.16 + rand() * 0.24, warm = rand() * 0.06;
    rocks.setColorAt(i, c.setRGB(shade + warm, shade, shade - warm * 0.5));
  }
  rocks.instanceMatrix.needsUpdate = true;
  rocks.instanceColor.needsUpdate = true;
  return rocks;
}

export function buildAsteroidBelt() {
  const COUNT = 900;
  const INNER_R = BELT.inner, OUTER_R = BELT.outer, Y_SPREAD = BELT.ySpread;
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
  group.add(buildRocks(rockCount(IS_MOBILE)));
  return group;
}
