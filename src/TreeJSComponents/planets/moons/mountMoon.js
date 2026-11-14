import * as THREE from "three";
import { orientPlane } from "../axialTilt";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Hangs a moon on its planet. The moon goes round in a frame centred on the
// planet but living in the planet's orbital wrapper, not on the planet itself:
// the planet's spin must not swing it. An `equatorial` moon gets one more
// frame, leaning with the planet's axis, so it circles above the equator
// (and in the plane of the rings).
//
// Leaves three handles on the view, as the animation expects them:
// rendered<Name> (the moon), <name>Obj (turn about Y to orbit) and, for an
// equatorial moon, <name>Plane (the leaning frame).
export function mountMoon(view, parentBody, parentMesh, child, childMesh) {
  childMesh.position.set(child.position.x, child.position.y, child.position.z);
  view[`rendered${cap(child.name)}`] = childMesh;

  const orbit = new THREE.Object3D();
  orbit.add(childMesh);
  view[`${child.name}Obj`] = orbit;

  const home = view[`${parentBody.name}Obj`] || view.scene;
  if (child.equatorial) {
    const plane = new THREE.Object3D();
    plane.position.copy(parentMesh.position);
    orientPlane(plane, parentBody, 0);
    plane.add(orbit);
    home.add(plane);
    view[`${child.name}Plane`] = plane;
  } else {
    orbit.position.copy(parentMesh.position);
    home.add(orbit);
  }
  return orbit;
}
