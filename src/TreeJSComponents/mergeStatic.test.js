import * as THREE from "three";
import { mergeStatic } from "./mergeStatic";

// Real three.js: merging needs real geometry, matrices and bounding boxes.
jest.mock("three", () => jest.requireActual("three"));

const meshes = (root) => {
  const out = [];
  root.traverse((o) => o.isMesh && out.push(o));
  return out;
};
const box = (geo) => {
  geo.computeBoundingBox();
  return geo.boundingBox;
};

describe("mergeStatic()", () => {
  test("collapses static meshes that share a material into one mesh (one draw)", () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial();
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
      m.position.x = i * 10;
      group.add(m);
    }
    mergeStatic(group);
    const after = meshes(group);
    expect(after).toHaveLength(1);
    expect(after[0].material).toBe(mat);
    expect(after[0].geometry.attributes.position.count).toBe(10 * 24);
  });

  test("bakes each part's transform, including nested groups, into the merged geometry", () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial();
    const pivot = new THREE.Group();
    pivot.position.set(0, 100, 0);
    pivot.rotation.z = Math.PI / 2;
    group.add(pivot);
    const a = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat);
    a.position.set(50, 0, 0); // pivot rotates +x onto +y → world (0, 150, 0)
    pivot.add(a);
    group.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat));
    mergeStatic(group);
    const [merged] = meshes(group);
    const bb = box(merged.geometry);
    expect(bb.max.y).toBeCloseTo(151);
    expect(bb.min.y).toBeCloseTo(-1);
    expect(bb.max.x).toBeCloseTo(1);
  });

  test("keeps one mesh per material", () => {
    const group = new THREE.Group();
    const red = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    for (let i = 0; i < 4; i++) group.add(new THREE.Mesh(new THREE.BoxGeometry(), i % 2 ? red : blue));
    mergeStatic(group);
    expect(meshes(group).map((m) => m.material).sort((a, b) => a.id - b.id)).toEqual(
      [red, blue].sort((a, b) => a.id - b.id)
    );
  });

  test("leaves animated parts (anything userData points at) untouched, with their subtrees", () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial();
    const engine = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    const spinner = new THREE.Group();
    const vane = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    spinner.add(vane);
    group.add(engine, spinner, new THREE.Mesh(new THREE.BoxGeometry(), mat), new THREE.Mesh(new THREE.BoxGeometry(), mat));
    group.userData.animated = { engineMesh: engine, groups: [spinner] };
    group.userData.emitter = engine;
    mergeStatic(group);
    expect(engine.parent).toBe(group);
    expect(vane.parent).toBe(spinner);
    expect(spinner.parent).toBe(group);
    expect(meshes(group)).toHaveLength(3); // engine + vane + one merged static mesh
  });

  test("leaves role-tagged and transparent parts alone", () => {
    const group = new THREE.Group();
    const glass = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5 });
    const g1 = new THREE.Mesh(new THREE.BoxGeometry(), glass);
    const g2 = new THREE.Mesh(new THREE.BoxGeometry(), glass);
    const mat = new THREE.MeshStandardMaterial();
    const tagged = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    tagged.userData.role = "sphere";
    group.add(g1, g2, tagged, new THREE.Mesh(new THREE.BoxGeometry(), mat));
    mergeStatic(group);
    expect(g1.parent).toBe(group);
    expect(g2.parent).toBe(group);
    expect(tagged.parent).toBe(group);
  });

  test("a lone mesh is not rebuilt", () => {
    const group = new THREE.Group();
    const only = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    group.add(only);
    mergeStatic(group);
    expect(only.parent).toBe(group);
  });

  test("returns the same group so builders can `return mergeStatic(group)`", () => {
    const group = new THREE.Group();
    expect(mergeStatic(group)).toBe(group);
  });

  test("disposes the per-part geometries it replaced", () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial();
    const geos = [new THREE.BoxGeometry(), new THREE.BoxGeometry()];
    const spies = geos.map((g) => jest.spyOn(g, "dispose"));
    geos.forEach((g) => group.add(new THREE.Mesh(g, mat)));
    mergeStatic(group);
    spies.forEach((s) => expect(s).toHaveBeenCalled());
  });

  test("a mirrored part (negative scale) keeps facing outward after the merge", () => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial();
    const plain = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    const mirrored = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    mirrored.scale.x = -1;
    mirrored.position.x = 10;
    group.add(plain, mirrored);
    mergeStatic(group);
    const [merged] = meshes(group);
    // Every triangle's winding normal must agree with its vertex normals.
    const pos = merged.geometry.attributes.position;
    const nrm = merged.geometry.attributes.normal;
    const idx = merged.geometry.index.array;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    let inward = 0;
    for (let i = 0; i < idx.length; i += 3) {
      a.fromBufferAttribute(pos, idx[i]); b.fromBufferAttribute(pos, idx[i + 1]); c.fromBufferAttribute(pos, idx[i + 2]);
      const face = b.sub(a).cross(c.sub(a));
      n.fromBufferAttribute(nrm, idx[i]);
      if (face.dot(n) < 0) inward++;
    }
    expect(inward).toBe(0);
  });
});
