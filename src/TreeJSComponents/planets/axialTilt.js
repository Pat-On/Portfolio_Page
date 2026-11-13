import * as THREE from "three";

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const _q = new THREE.Quaternion();

// Orientation of a planet that spins about an axis leaning `tilt` radians from
// the vertical. The planet hangs in a wrapper that turns about Y by
// `orbitAngle` to carry it round the sun; undoing that turn first keeps the
// axis pointing the same way in space all the way round, as a real planet's
// does (which is what gives it seasons).
export function tiltedSpin(out, tilt, spinAngle, orbitAngle) {
  out.setFromAxisAngle(Y_AXIS, -orbitAngle);
  out.multiply(_q.setFromAxisAngle(X_AXIS, tilt));
  return out.multiply(_q.setFromAxisAngle(Y_AXIS, spinAngle));
}

// Applies a registry body's tilt (degrees) and the spin angle kept in
// mesh.userData.spinAngle.
export function orientBody(mesh, body, orbitAngle = 0) {
  const spin = mesh.userData.spinAngle || 0;
  if (!body.tilt) {
    mesh.rotation.set(0, spin, 0);
    return mesh;
  }
  tiltedSpin(mesh.quaternion, THREE.MathUtils.degToRad(body.tilt), spin, orbitAngle);
  return mesh;
}
