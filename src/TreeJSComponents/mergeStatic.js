import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Every mesh is its own draw call, so a ship built from hundreds of small parts
// (the Death Star's panels and windows, the Enterprise's struts) costs hundreds
// of draws even when it is a few pixels tall. mergeStatic() bakes the parts that
// never move on their own into one mesh per material, in the group's own frame.
//
// Left alone:
// - anything the group's userData points at (the animation and game code reach
//   for those: engines, emitters, beams, spinning Bussard groups), with its subtree;
// - role-tagged parts (`userData.role`, looked up by findByRole);
// - transparent parts, which three.js sorts back-to-front per object;
// - hidden parts, instanced and skinned meshes, multi-material meshes.
export function mergeStatic(root) {
  const kept = new Set();
  collectReferenced(root.userData, kept, 0);
  root.traverse((o) => {
    if (o !== root && o.userData && o.userData.role) kept.add(o);
  });
  // A kept object keeps its whole subtree.
  for (const o of [...kept]) o.traverse((d) => kept.add(d));

  const users = new Map(); // geometry → number of meshes using it, to know what is safe to dispose
  const buckets = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    users.set(o.geometry, (users.get(o.geometry) || 0) + 1);
    if (!isMergeable(o, kept, root)) return;
    const key = `${o.material.id}|${o.renderOrder}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(o);
  });

  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const rel = new THREE.Matrix4();

  for (const parts of buckets.values()) {
    if (parts.length < 2) continue;
    const geos = parts.map((mesh) => {
      rel.multiplyMatrices(toRoot, mesh.matrixWorld);
      const g = mesh.geometry.clone();
      g.applyMatrix4(rel);
      if (rel.determinant() < 0) flipWinding(g);
      g.clearGroups();
      g.morphAttributes = {};
      return g;
    });
    const merged = mergeCompatible(geos);
    geos.forEach((g) => g.dispose());
    if (!merged) continue; // attribute layouts differ: leave this material's parts as they are

    const first = parts[0];
    const mesh = new THREE.Mesh(merged, first.material);
    mesh.name = `merged:${first.material.name || first.material.type}`;
    mesh.renderOrder = first.renderOrder;
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    for (const part of parts) {
      part.removeFromParent();
      const left = users.get(part.geometry) - 1;
      users.set(part.geometry, left);
      if (left === 0) part.geometry.dispose();
    }
    root.add(mesh);
  }
  return root;
}

function collectReferenced(value, out, depth) {
  if (!value || depth > 4 || typeof value !== "object") return;
  if (value.isObject3D) {
    out.add(value);
    return;
  }
  if (value.isTexture || value.isMaterial || value.isBufferGeometry) return;
  for (const v of Array.isArray(value) ? value : Object.values(value)) collectReferenced(v, out, depth + 1);
}

function isMergeable(o, kept, root) {
  if (o === root || kept.has(o) || o.isInstancedMesh || o.isSkinnedMesh) return false;
  if (!o.geometry || !o.geometry.isBufferGeometry || Array.isArray(o.material)) return false;
  if (o.material.transparent || o.morphTargetInfluences) return false;
  // Hidden by the builder (or under a hidden parent): merging would show it.
  for (let p = o; p && p !== root; p = p.parent) if (!p.visible) return false;
  return true;
}

// mergeGeometries needs all-indexed or all-non-indexed input with the same attributes.
function mergeCompatible(geos) {
  let list = geos;
  if (list.some((g) => !g.index) && list.some((g) => g.index)) {
    list = list.map((g) => (g.index ? g.toNonIndexed() : g));
  }
  const names = Object.keys(list[0].attributes).filter((n) => list.every((g) => g.attributes[n]));
  for (const g of list) {
    for (const n of Object.keys(g.attributes)) if (!names.includes(n)) g.deleteAttribute(n);
  }
  const merged = mergeGeometries(list, false);
  if (list !== geos) list.forEach((g) => g.dispose());
  return merged;
}

// A mirroring transform (negative scale) turns front faces into back faces.
function flipWinding(g) {
  if (g.index) {
    const a = g.index.array;
    for (let i = 0; i < a.length; i += 3) {
      const t = a[i + 1];
      a[i + 1] = a[i + 2];
      a[i + 2] = t;
    }
    g.index.needsUpdate = true;
    return;
  }
  for (const attr of Object.values(g.attributes)) {
    const s = attr.itemSize;
    const a = attr.array;
    for (let v = 0; v < attr.count; v += 3) {
      for (let k = 0; k < s; k++) {
        const i1 = (v + 1) * s + k;
        const i2 = (v + 2) * s + k;
        const t = a[i1];
        a[i1] = a[i2];
        a[i2] = t;
      }
    }
    attr.needsUpdate = true;
  }
}
