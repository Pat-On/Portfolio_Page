import * as THREE from "three";

// Millennium Falcon — disc hull with forward mandibles.
// Forward direction = -Z  (mandibles face away from camera as it approaches)

class MillenniumFalcon {
  build() {
    const group = new THREE.Group();

    const R = 42, H = 13;

    const hull   = new THREE.MeshStandardMaterial({ color: 0xb0b0be, metalness: 0.35, roughness: 0.65 });
    const dark   = new THREE.MeshStandardMaterial({ color: 0x606070, metalness: 0.4,  roughness: 0.7  });
    const worn   = new THREE.MeshStandardMaterial({ color: 0x888898, metalness: 0.3,  roughness: 0.8  });
    const engMat = new THREE.MeshStandardMaterial({ color: 0x55ddff, emissive: 0x33bbff, emissiveIntensity: 1.3, transparent: true, opacity: 0.9 });
    const cockMat= new THREE.MeshStandardMaterial({ color: 0xeeeebb, emissive: 0xddcc88, emissiveIntensity: 0.35, transparent: true, opacity: 0.85 });

    // ── Main disc ─────────────────────────────────────────────────
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.92, H, 36), hull);
    disc.scale.z = 0.9;
    group.add(disc);

    // Top dome (very shallow)
    const tDome = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hull
    );
    tDome.scale.set(1, 0.14, 0.9);
    tDome.position.y = H / 2;
    group.add(tDome);

    // Bottom dome
    const bDome = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.9, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hull
    );
    bDome.scale.set(1, 0.14, 0.9);
    bDome.position.y = -H / 2;
    group.add(bDome);

    // ── Forward mandibles ─────────────────────────────────────────
    for (const s of [-1, 1]) {
      // Outer prong
      const prong = new THREE.Mesh(new THREE.BoxGeometry(13, H * 0.65, 38), hull);
      prong.position.set(s * 19, 0, -(R * 0.88) - 14);
      group.add(prong);

      // Tapered tip cap
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0, 6, 8, 4), hull);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(s * 19, 0, -(R * 0.88) - 34);
      group.add(tip);
    }

    // ── Cockpit ───────────────────────────────────────────────────
    // Tube / neck connecting cockpit to hull
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 14, 10), dark);
    neck.rotation.z = Math.PI / 2;
    neck.position.set(-(R * 0.42), 1, -(R * 0.45));
    group.add(neck);

    // Cockpit bubble
    const cpk = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 12), cockMat);
    cpk.scale.z = 1.3;
    cpk.position.set(-(R * 0.72), 1, -(R * 0.45));
    group.add(cpk);

    // ── Radar dish ────────────────────────────────────────────────
    // (mounted on top, slightly left-of-centre)
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 2, 24), worn);
    dish.position.set(-6, H / 2 + 5, 8);
    dish.rotation.x = 0.2;
    group.add(dish);

    const dishRim = new THREE.Mesh(new THREE.TorusGeometry(11, 1.2, 6, 24), dark);
    dishRim.position.set(-6, H / 2 + 6, 8);
    dishRim.rotation.x = 0.2;
    group.add(dishRim);

    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 6, 8), dark);
    spike.position.set(-6, H / 2 + 9, 8);
    group.add(spike);

    // ── Surface panel details (top) ───────────────────────────────
    const panelSpots = [
      [0, 10], [20, -5], [-20, -5], [5, -20], [-15, 15], [15, 15],
    ];
    for (const [px, pz] of panelSpots) {
      if (px * px + pz * pz < (R * 0.75) ** 2) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(15, 2, 10), dark);
        p.position.set(px, H / 2 + 1, pz);
        group.add(p);
      }
    }

    // ── Main engine ───────────────────────────────────────────────
    const mainEng = new THREE.Mesh(new THREE.CylinderGeometry(13, 11, 10, 22), engMat);
    mainEng.rotation.x = Math.PI / 2;
    mainEng.position.set(0, 0, R * 0.88 + 3);
    group.add(mainEng);
    const engLight = new THREE.PointLight(0x44ccff, 2.5, 380);
    engLight.position.set(0, 0, R * 0.88 + 8);
    group.add(engLight);

    // Two flanking sub-thrusters
    for (const s of [-1, 1]) {
      const sub = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 8, 14), engMat);
      sub.rotation.x = Math.PI / 2;
      sub.position.set(s * 22, 0, R * 0.8);
      group.add(sub);
    }

    // Subtle underbelly light (warm, like reactor heat)
    const coreLight = new THREE.PointLight(0xffaa44, 0.8, 200);
    coreLight.position.set(0, -H, 0);
    group.add(coreLight);

    return group;
  }
}

export const falcon = new MillenniumFalcon();
