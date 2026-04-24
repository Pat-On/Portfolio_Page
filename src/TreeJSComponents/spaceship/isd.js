import * as THREE from "three";

// Imperial Star Destroyer — triangular wedge hull built from custom BufferGeometry.
// Forward direction = -Z  (tip faces viewer as camera approaches)

class ImperialStarDestroyer {
  build() {
    const group = new THREE.Group();

    const L = 280, W = 220, HT = 14, HB = 30;

    const hull = new THREE.MeshStandardMaterial({ color: 0x50505f, metalness: 0.65, roughness: 0.55, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a38, metalness: 0.6,  roughness: 0.7  });
    const eng  = new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x6688ff, emissiveIntensity: 1.4, transparent: true, opacity: 0.9 });

    // ── Main wedge hull ───────────────────────────────────────────
    //  6 vertices: top triangle + bottom triangle (thinner at front tip)
    const v = new Float32Array([
      //  X        Y      Z
        0,       HT,  -L/2,   // 0  front tip – top
      -W/2,      HT,   L/2,   // 1  rear-left top
       W/2,      HT,   L/2,   // 2  rear-right top
        0,   HT - 3,  -L/2,   // 3  front tip – bottom (razor-thin front edge)
      -W/2,     -HB,   L/2,   // 4  rear-left bottom
       W/2,     -HB,   L/2,   // 5  rear-right bottom
    ]);
    const idx = [
      0, 2, 1,          // top face
      3, 4, 5,          // bottom face
      0, 1, 3, 1, 4, 3, // left side
      0, 3, 2, 3, 5, 2, // right side
      1, 2, 5, 1, 5, 4, // back face
    ];
    const wedgeGeo = new THREE.BufferGeometry();
    wedgeGeo.setAttribute("position", new THREE.BufferAttribute(v, 3));
    wedgeGeo.setIndex(idx);
    wedgeGeo.computeVertexNormals();
    group.add(new THREE.Mesh(wedgeGeo, hull));

    // ── Top-surface trench details ────────────────────────────────
    // Central spine trench
    group.add(box(8, 3, L * 0.72, dark, 0, HT + 1,  10));

    // Cross-trenches (5 bands)
    for (let i = 0; i < 5; i++) {
      const z = -60 + i * 34;
      const halfW = (W / 2) * ((z + L / 2) / L) * 0.85;
      group.add(box(halfW * 2, 2, 5, dark, 0, HT + 1, z));
    }

    // ── Bridge tower ──────────────────────────────────────────────
    const towerY = HT + 20;
    group.add(box(22, 38, 20, hull, 0, towerY, L * 0.18));

    // Slanted top of tower
    const roofMesh = new THREE.Mesh(new THREE.CylinderGeometry(14, 11, 6, 4), hull);
    roofMesh.position.set(0, towerY + 22, L * 0.18);
    group.add(roofMesh);

    // Command globe (two geodesic spheres flanking the bridge)
    for (const s of [-1, 1]) {
      const globe = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), hull);
      globe.position.set(s * 20, towerY + 14, L * 0.18);
      group.add(globe);
    }

    // Communication towers (thin antennae)
    for (const s of [-1, 1]) {
      group.add(box(1.2, 24, 1.2, dark, s * 12, towerY + 30, L * 0.18));
    }

    // ── Turbolaser turrets ────────────────────────────────────────
    const turretData = [
      [-35, -30], [35, -30], [-55, 10], [55, 10],
      [-20, 50],  [20, 50],  [0, 70],
    ];
    for (const [tx, tz] of turretData) {
      // only place within the triangular top surface
      const maxHalfW = (W / 2) * ((tz + L / 2) / L);
      if (Math.abs(tx) < maxHalfW - 5) {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 5, 8), dark);
        base.position.set(tx, HT + 2.5, tz);
        group.add(base);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 10, 6), dark);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(tx, HT + 7, tz - 4);
        group.add(barrel);
      }
    }

    // ── Engines (rear, row of three) ─────────────────────────────
    for (const x of [-55, 0, 55]) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(16, 14, 10, 22), eng);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(x, -8, L / 2 + 2);
      group.add(nozzle);
      const light = new THREE.PointLight(0x6688ff, 2, 320);
      light.position.set(x, -8, L / 2 + 10);
      group.add(light);
    }

    // ── Running lights ────────────────────────────────────────────
    // Red port light (left wingtip)
    const rl = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }));
    rl.position.set(-W / 2, HT, L / 2 - 5);
    group.add(rl);

    // Green starboard light (right wingtip)
    const gl = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }));
    gl.position.set(W / 2, HT, L / 2 - 5);
    group.add(gl);

    return group;
  }
}

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

export const isd = new ImperialStarDestroyer();
