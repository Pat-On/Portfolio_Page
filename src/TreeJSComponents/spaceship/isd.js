import * as THREE from "three";
import normalTexture from "../../textures/normal.jpeg";

// Imperial Star Destroyer — triangular wedge hull built from custom BufferGeometry.
// Forward direction = -Z  (tip faces viewer as camera approaches)

function buildISDHullTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#4a4a58";
  ctx.fillRect(0, 0, size, size);

  // Clip to triangular hull footprint: tip at top-center, wide base at bottom
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.clip();

  // Panel rows widening from tip to base
  const ROWS = 18;
  for (let row = 0; row < ROWS; row++) {
    const v0 = row / ROWS;
    const v1 = (row + 1) / ROWS;
    const y0 = Math.floor(v0 * size);
    const y1 = Math.floor(v1 * size);
    const halfW0 = v0 * (size / 2) * 0.98;
    const halfW1 = v1 * (size / 2) * 0.98;

    // Number of columns in this row: 2 at tip, up to 8 at base
    const nCols = 2 + Math.floor(row * 6 / ROWS);

    for (let col = 0; col < nCols; col++) {
      const u0 = col / nCols;
      const u1 = (col + 1) / nCols;

      // Interpolate X bounds using row's half-width
      const x0 = Math.floor(size / 2 - halfW1 + u0 * halfW1 * 2) + 2;
      const x1 = Math.floor(size / 2 - halfW1 + u1 * halfW1 * 2) - 2;
      const pw = x1 - x0;
      const ph = y1 - y0 - 4;
      if (pw <= 0 || ph <= 0) continue;

      const base = 72 + Math.floor(Math.random() * 12);
      const isLight = Math.random() < 0.10;
      const isDark  = Math.random() < 0.05;
      const v = isDark ? base - 12 : isLight ? base + 14 : base;
      ctx.fillStyle = `rgb(${v},${v},${v + 10})`;
      ctx.fillRect(x0, y0 + 2, pw, ph);

      // Recessed sub-panel
      if (Math.random() < 0.30) {
        const mg = Math.max(2, Math.min(pw, ph) * 0.10);
        ctx.fillStyle = "rgba(0,0,10,0.4)";
        ctx.fillRect(x0 + mg, y0 + 2 + mg, pw - mg * 2, ph - mg * 2);
      }

      // Bevel
      ctx.fillStyle = "rgba(190,195,210,0.06)";
      ctx.fillRect(x0, y0 + 2, pw, 1.5);
      ctx.fillRect(x0, y0 + 2, 1.5, ph);
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(x0, y0 + ph, pw, 1.5);
      ctx.fillRect(x0 + pw - 1.5, y0 + 2, 1.5, ph);
    }
  }

  // Surface trench lines (horizontal bands)
  const trenchVs = [0.15, 0.30, 0.45, 0.60, 0.75];
  trenchVs.forEach((tv) => {
    const ty = Math.floor(tv * size);
    const hw = tv * (size / 2) * 0.98;
    ctx.fillStyle = "rgba(30,30,45,0.85)";
    ctx.fillRect(Math.floor(size / 2 - hw), ty - 2, Math.floor(hw * 2), 4);
  });

  // Central spine
  ctx.fillStyle = "rgba(20,20,35,0.9)";
  ctx.fillRect(size / 2 - 1, 0, 2, size);

  // Turret platform diamonds (approximate positions matching turretData)
  const turretUVs = [
    [-35, -30], [35, -30], [-55, 10], [55, 10],
    [-20, 50],  [20, 50],  [0, 70],
  ];
  const L = 280, W = 220;
  turretUVs.forEach(([tx, tz]) => {
    const u = (tx + W / 2) / W;
    const v = (tz + L / 2) / L;
    const px = Math.floor(u * size);
    const py = Math.floor(v * size);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "rgba(100,100,120,0.35)";
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();
  });

  ctx.restore();
  return canvas;
}

function buildISDRoughnessMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8c8c8c";
  ctx.fillRect(0, 0, size, size);

  const ROWS = 18;
  const cellH = size / ROWS;
  for (let row = 0; row < ROWS; row++) {
    const nCols = 2 + Math.floor(row * 6 / ROWS);
    for (let col = 0; col < nCols; col++) {
      const v = (row / ROWS), halfW = v * (size / 2) * 0.98;
      const x0 = Math.floor(size / 2 - halfW + (col / nCols) * halfW * 2) + 2;
      const x1 = Math.floor(size / 2 - halfW + ((col + 1) / nCols) * halfW * 2) - 2;
      const y0 = Math.floor(row * cellH) + 2;
      const pw = x1 - x0, ph = cellH - 4;
      if (pw <= 0 || ph <= 0) continue;
      const rv = 144 + Math.floor(Math.random() * 16);
      ctx.fillStyle = `rgb(${rv},${rv},${rv})`;
      ctx.fillRect(x0, y0, pw, ph);

      if (Math.random() < 0.30) {
        const mg = Math.max(2, Math.min(pw, ph) * 0.10);
        ctx.fillStyle = "#5a5a5a";
        ctx.fillRect(x0 + mg, y0 + mg, pw - mg * 2, ph - mg * 2);
      }
    }
  }

  // Trench seams — smooth machined metal
  const trenchVs = [0.15, 0.30, 0.45, 0.60, 0.75];
  trenchVs.forEach((tv) => {
    const ty = Math.floor(tv * size);
    ctx.fillStyle = "#3c3c3c";
    ctx.fillRect(0, ty - 1, size, 2);
  });

  // Central spine
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(size / 2 - 1, 0, 2, size);

  return canvas;
}

class ImperialStarDestroyer {
  build() {
    const group = new THREE.Group();

    const L = 280, W = 220, HT = 14, HB = 30;

    const hull = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(buildISDHullTexture()),
      roughnessMap: new THREE.CanvasTexture(buildISDRoughnessMap()),
      normalMap: new THREE.TextureLoader().load(normalTexture),
      normalScale: new THREE.Vector2(0.30, 0.30),
      metalness: 0.65,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
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
    // Planar XZ UV projection: u = (x + W/2) / W, v = (z + L/2) / L
    const uvData = new Float32Array([
      0.5, 0.0,  // v0 front tip top
      0.0, 1.0,  // v1 rear-left top
      1.0, 1.0,  // v2 rear-right top
      0.5, 0.0,  // v3 front tip bottom
      0.0, 1.0,  // v4 rear-left bottom
      1.0, 1.0,  // v5 rear-right bottom
    ]);
    wedgeGeo.setAttribute("uv", new THREE.BufferAttribute(uvData, 2));
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
