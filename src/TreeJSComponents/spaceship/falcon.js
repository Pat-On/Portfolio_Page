import * as THREE from "three";
import normalTexture from "../../textures/normal.jpeg";

function buildFalconHullTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#b2b2bc";
  ctx.fillRect(0, 0, size, size);

  const COLS = 20, ROWS = 20;

  // Pre-compute jittered column and row positions (±15% cell width randomisation)
  const cellW = size / COLS, cellH = size / ROWS;
  const colX = [0];
  for (let c = 1; c < COLS; c++) {
    colX.push(colX[c - 1] + cellW * (0.85 + Math.random() * 0.30));
  }
  const rowY = [0];
  for (let r = 1; r < ROWS; r++) {
    rowY.push(rowY[r - 1] + cellH * (0.85 + Math.random() * 0.30));
  }

  // Draw panels
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = colX[c] + 2;
      const y = rowY[r] + 2;
      const w = ((colX[c + 1] ?? size) - colX[c]) - 4;
      const h = ((rowY[r + 1] ?? size) - rowY[r]) - 4;
      if (w <= 0 || h <= 0) continue;

      const rng = Math.random();
      let pr, pg, pb;
      if (rng < 0.08) {
        // scorch
        pr = 60 + Math.floor(Math.random() * 15);
        pg = 55 + Math.floor(Math.random() * 10);
        pb = 45 + Math.floor(Math.random() * 10);
      } else if (rng < 0.23) {
        // grime
        const base = 150 + Math.floor(Math.random() * 20);
        pr = base - 15; pg = base - 10; pb = base - 20;
      } else if (rng < 0.28) {
        // repair patch
        const base = 195 + Math.floor(Math.random() * 20);
        pr = pg = pb = base;
      } else {
        // normal
        const base = 175 + Math.floor(Math.random() * 30);
        pr = pg = pb = base;
      }
      ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
      ctx.fillRect(x, y, w, h);

      // Repair patch visible seam
      if (rng >= 0.23 && rng < 0.28) {
        ctx.strokeStyle = "rgba(80,80,90,0.7)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }

      // Recessed sub-panel
      if (Math.random() < 0.30) {
        const mg = Math.max(3, Math.min(w, h) * 0.12);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x + mg, y + mg, w - mg * 2, h - mg * 2);
      }

      // Bevel highlight (not on scorch)
      if (rng >= 0.08 && Math.random() < 0.65) {
        ctx.fillStyle = "rgba(210,210,220,0.07)";
        ctx.fillRect(x, y, w, 1.5);
        ctx.fillRect(x, y, 1.5, h);
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(x, y + h - 1.5, w, 1.5);
        ctx.fillRect(x + w - 1.5, y, 1.5, h);
      }
    }
  }

  // Seam lines between panels
  ctx.fillStyle = "#404050";
  for (let c = 0; c < COLS - 1; c++) {
    const sx = colX[c + 1];
    ctx.fillRect(sx - 1, 0, 2, size);
  }
  for (let r = 0; r < ROWS - 1; r++) {
    const sy = rowY[r + 1];
    ctx.fillRect(0, sy - 1, size, 2);
  }

  // Grime streaks
  for (let i = 0; i < 10; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const angle = Math.random() * Math.PI * 2;
    const len = 60 + Math.random() * 80;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
    ctx.strokeStyle = `rgba(40,35,30,${0.15 + Math.random() * 0.15})`;
    ctx.lineWidth = 2 + Math.random() * 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Surface scratches
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 18; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const angle = Math.random() * Math.PI * 2;
    const len = 30 + Math.random() * 60;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
    ctx.strokeStyle = "rgba(200,200,210,0.15)";
    ctx.stroke();
  }

  return canvas;
}

function buildFalconRoughnessMap() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#a5a5a5";
  ctx.fillRect(0, 0, size, size);

  const COLS = 20, ROWS = 20;
  const cellW = size / COLS, cellH = size / ROWS;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * cellW + 2;
      const y = r * cellH + 2;
      const w = cellW - 4;
      const h = cellH - 4;
      const rng = Math.random();
      let v;
      if (rng < 0.08) v = 213; // scorch — very rough
      else if (rng < 0.23) v = 197; // grime
      else if (rng < 0.28) v = 127; // repair — smoother
      else v = 144 + Math.floor(Math.random() * 24); // normal
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, w, h);
    }
  }

  // Seam lines — tighter tolerance, less rough
  ctx.fillStyle = "#5a5a5a";
  for (let c = 1; c < COLS; c++) {
    ctx.fillRect(c * cellW - 1, 0, 2, size);
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.fillRect(0, r * cellH - 1, size, 2);
  }

  return canvas;
}

// Millennium Falcon — disc hull with forward mandibles.
// Forward direction = -Z  (mandibles face away from camera as it approaches)

class MillenniumFalcon {
  build() {
    const group = new THREE.Group();

    const R = 42, H = 13;

    const hull   = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(buildFalconHullTexture()),
      roughnessMap: new THREE.CanvasTexture(buildFalconRoughnessMap()),
      normalMap: new THREE.TextureLoader().load(normalTexture),
      normalScale: new THREE.Vector2(0.45, 0.45),
      metalness: 0.30,
      roughness: 0.68,
    });
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
