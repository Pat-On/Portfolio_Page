import * as THREE from "three";

class BorgCube {
  build() {
    const group = new THREE.Group();

    const size = 80;

    // Outer cube shell — dark green metallic
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a1a,
      metalness: 0.9,
      roughness: 0.4,
      wireframe: false,
    });
    const shell = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), shellMat);
    group.add(shell);

    // Wireframe overlay for the "technological" look
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ff44,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wire = new THREE.Mesh(new THREE.BoxGeometry(size + 1, size + 1, size + 1), wireMat);
    group.add(wire);

    // Green circuit-line panels on each face (flat boxes)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x003300,
      emissive: 0x00cc33,
      emissiveIntensity: 0.5,
      roughness: 0.6,
    });
    const panelConfigs = [
      { pos: [0, 0, size / 2 + 1], rot: [0, 0, 0] },
      { pos: [0, 0, -size / 2 - 1], rot: [0, Math.PI, 0] },
      { pos: [size / 2 + 1, 0, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-size / 2 - 1, 0, 0], rot: [0, -Math.PI / 2, 0] },
      { pos: [0, size / 2 + 1, 0], rot: [-Math.PI / 2, 0, 0] },
      { pos: [0, -size / 2 - 1, 0], rot: [Math.PI / 2, 0, 0] },
    ];
    panelConfigs.forEach(({ pos, rot }) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.8, size * 0.8), panelMat);
      panel.position.set(...pos);
      panel.rotation.set(...rot);
      group.add(panel);
    });

    // Green tractor beam emitter (bottom centre)
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x00ff44,
      emissive: 0x00ff44,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8,
    });
    const emitter = new THREE.Mesh(new THREE.CylinderGeometry(6, 2, 12, 16), beamMat);
    emitter.position.set(0, -size / 2 - 6, 0);
    group.add(emitter);

    // Tractor beam cone extending downward
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0, 20, 60, 16), beamMat.clone());
    beam.material.opacity = 0.15;
    beam.position.set(0, -size / 2 - 40, 0);
    group.add(beam);

    // Green ambient glow
    const borgLight = new THREE.PointLight(0x00ff44, 2, 400);
    borgLight.position.set(0, 0, 0);
    group.add(borgLight);

    return group;
  }
}

export const borgCube = new BorgCube();
