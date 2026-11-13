import * as THREE from "three";
import { tiltedSpin, orientBody } from "./axialTilt";

const Y = new THREE.Vector3(0, 1, 0);
const rad = THREE.MathUtils.degToRad;

// Where the body's spin axis points in the frame the orbit wrapper sits in:
// the wrapper turns by the orbit angle, the body by the returned quaternion.
const axisInSpace = (tiltDeg, spin, orbit) => {
  const q = tiltedSpin(new THREE.Quaternion(), rad(tiltDeg), spin, orbit);
  const wrapper = new THREE.Quaternion().setFromAxisAngle(Y, orbit);
  return Y.clone().applyQuaternion(wrapper.multiply(q));
};

describe("tiltedSpin()", () => {
  test("with no tilt it is a plain spin about the vertical", () => {
    const q = tiltedSpin(new THREE.Quaternion(), 0, 0.7, 0);
    const expected = new THREE.Quaternion().setFromAxisAngle(Y, 0.7);
    expect(q.angleTo(expected)).toBeCloseTo(0, 6);
  });

  test("the spin axis leans from the vertical by the tilt", () => {
    const axis = axisInSpace(23.4, 0, 0);
    expect(THREE.MathUtils.radToDeg(axis.angleTo(Y))).toBeCloseTo(23.4, 4);
  });

  test("the axis keeps pointing the same way as the planet goes round the sun", () => {
    const a = axisInSpace(26.7, 0.3, 0);
    const b = axisInSpace(26.7, 2.1, 1.9);
    const c = axisInSpace(26.7, 5.0, 4.4);
    expect(a.distanceTo(b)).toBeCloseTo(0, 6);
    expect(a.distanceTo(c)).toBeCloseTo(0, 6);
  });

  test("spinning turns the surface about that axis", () => {
    const tilt = rad(25);
    const p = new THREE.Vector3(1, 0, 0);
    const before = p.clone().applyQuaternion(tiltedSpin(new THREE.Quaternion(), tilt, 0, 0));
    const after = p.clone().applyQuaternion(tiltedSpin(new THREE.Quaternion(), tilt, Math.PI / 2, 0));
    const axis = axisInSpace(25, 0, 0);
    expect(before.dot(axis)).toBeCloseTo(0, 6); // on the equator before and after
    expect(after.dot(axis)).toBeCloseTo(0, 6);
    expect(before.angleTo(after)).toBeCloseTo(Math.PI / 2, 6);
  });
});

describe("orientBody()", () => {
  test("applies the registry tilt and the spin kept on the mesh", () => {
    const mesh = new THREE.Object3D();
    mesh.userData.spinAngle = 1.2;
    orientBody(mesh, { tilt: 97.8 }, 0.4);
    const expected = tiltedSpin(new THREE.Quaternion(), rad(97.8), 1.2, 0.4);
    expect(mesh.quaternion.angleTo(expected)).toBeCloseTo(0, 6);
  });

  test("a body with no tilt in the registry keeps a plain vertical spin", () => {
    const mesh = new THREE.Object3D();
    mesh.userData.spinAngle = 0.5;
    orientBody(mesh, {}, 3);
    expect(mesh.rotation.y).toBeCloseTo(0.5, 6);
    expect(mesh.rotation.x).toBeCloseTo(0, 6);
  });
});
