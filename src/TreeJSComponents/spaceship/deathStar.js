import * as THREE from "three";

// ── Procedural textures ──────────────────────────────────────────────────────

function buildSurfaceTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const COLS = 32, ROWS = 16;
  const cellW = size / COLS;
  const cellH = size / ROWS;
  const seam = 2;

  // Dark seam base
  ctx.fillStyle = "#16161f";
  ctx.fillRect(0, 0, size, size);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * cellW + seam;
      const y = row * cellH + seam;
      const w = cellW - seam * 2;
      const h = cellH - seam * 2;

      // Panel base with slight per-panel variation
      const base = 78 + Math.floor(Math.random() * 22);
      const isDark = Math.random() < 0.12;
      const v = isDark ? base - 16 : base;
      ctx.fillStyle = `rgb(${v},${v},${v + 9})`;
      ctx.fillRect(x, y, w, h);

      // Recessed sub-panel on ~35% of panels
      if (Math.random() < 0.35) {
        const mg = Math.max(3, Math.min(w, h) * 0.18);
        ctx.fillStyle = "rgba(0,0,12,0.42)";
        ctx.fillRect(x + mg, y + mg, w - mg * 2, h - mg * 2);
      }

      // Random circuit-line detail on some panels
      if (Math.random() < 0.18) {
        ctx.strokeStyle = "rgba(160,165,185,0.18)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (Math.random() < 0.5) {
          ctx.moveTo(x + 3, y + h * 0.5);
          ctx.lineTo(x + w - 3, y + h * 0.5);
        } else {
          ctx.moveTo(x + w * 0.5, y + 3);
          ctx.lineTo(x + w * 0.5, y + h - 3);
        }
        ctx.stroke();
      }

      // Top-left bevel highlight
      ctx.fillStyle = "rgba(210,215,230,0.06)";
      ctx.fillRect(x, y, w, 1.5);
      ctx.fillRect(x, y, 1.5, h);

      // Bottom-right shadow
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(x, y + h - 1.5, w, 1.5);
      ctx.fillRect(x + w - 1.5, y, 1.5, h);
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function buildRoughnessMap() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const COLS = 32, ROWS = 16;
  const cellW = size / COLS;
  const cellH = size / ROWS;
  const seam = 2;

  // Seams: relatively smooth metal edges (low roughness = darker)
  ctx.fillStyle = "#505050";
  ctx.fillRect(0, 0, size, size);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * cellW + seam;
      const y = row * cellH + seam;
      const w = cellW - seam * 2;
      const h = cellH - seam * 2;

      // Panel body: matte-rough (0.55–0.72)
      const rough = Math.floor((0.55 + Math.random() * 0.17) * 255);
      ctx.fillStyle = `rgb(${rough},${rough},${rough})`;
      ctx.fillRect(x, y, w, h);

      // Sub-panel recesses are shinier
      if (Math.random() < 0.35) {
        const mg = Math.max(3, Math.min(w, h) * 0.18);
        const subV = Math.floor(0.32 * 255);
        ctx.fillStyle = `rgb(${subV},${subV},${subV})`;
        ctx.fillRect(x + mg, y + mg, w - mg * 2, h - mg * 2);
      }
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function buildDishTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2, maxR = size / 2;

  // Deep space interior background
  ctx.fillStyle = "#0b0b14";
  ctx.fillRect(0, 0, size, size);

  // Vignette toward outer rim
  const vignette = ctx.createRadialGradient(cx, cy, maxR * 0.55, cx, cy, maxR);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(22,20,38,0.65)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  // Concentric rings — vary brightness and spacing
  const numRings = 12;
  for (let i = 1; i <= numRings; i++) {
    const r = (i / numRings) * maxR * 0.91;
    const bright = 30 + i * 5;
    const alpha = 0.18 + (i / numRings) * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${bright + 15},${bright + 15},${bright + 28},${alpha})`;
    ctx.lineWidth = i === numRings ? 2.8 : i % 3 === 0 ? 1.8 : 1.0;
    ctx.stroke();
  }

  // Radial spokes — alternating major/minor
  const numSpokes = 16;
  for (let i = 0; i < numSpokes; i++) {
    const angle = (i / numSpokes) * Math.PI * 2;
    const isMajor = i % 2 === 0;
    const innerR = 20;
    const outerR = maxR * 0.9;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.strokeStyle = isMajor ? "rgba(60,62,85,0.55)" : "rgba(40,40,60,0.28)";
    ctx.lineWidth = isMajor ? 1.6 : 0.8;
    ctx.stroke();
  }

  // Alternating panel sectors between major spokes
  for (let i = 0; i < numSpokes; i += 2) {
    const a1 = (i / numSpokes) * Math.PI * 2;
    const a2 = ((i + 1) / numSpokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a1) * 22, cy + Math.sin(a1) * 22);
    ctx.arc(cx, cy, maxR * 0.52, a1, a2);
    ctx.arc(cx, cy, 22, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(18,18,32,0.32)";
    ctx.fill();
  }

  // Superlaser glow — green radial gradient from center
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.28);
  glow.addColorStop(0, "rgba(130,255,75,0.88)");
  glow.addColorStop(0.18, "rgba(70,200,35,0.6)");
  glow.addColorStop(0.55, "rgba(20,90,10,0.2)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Central emitter ring accent
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(160,255,110,0.75)";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Innermost bright dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(200,255,160,0.9)";
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// ── Death Star class ─────────────────────────────────────────────────────────

class DeathStar {
  build() {
    const group = new THREE.Group();
    const R = 150;

    // ── Main spherical body ──────────────────────────────────────
    const bodyMat = new THREE.MeshStandardMaterial({
      map: buildSurfaceTexture(),
      roughnessMap: buildRoughnessMap(),
      metalness: 0.62,
      roughness: 0.60,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), bodyMat));

    // ── Equatorial trench ────────────────────────────────────────
    const trenchMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      metalness: 0.92,
      roughness: 0.28,
    });
    group.add(new THREE.Mesh(new THREE.TorusGeometry(R, 5.5, 8, 120), trenchMat));

    // Secondary latitude bands
    for (const theta of [Math.PI * 0.3, Math.PI * 0.7]) {
      const bandY = Math.cos(theta) * R;
      const bandR = Math.sin(theta) * R;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 2.5, 6, 80), trenchMat);
      band.position.set(0, bandY, 0);
      group.add(band);
    }

    // ── Superlaser dish (tilted off the north pole) ──────────────
    const dishPivot = new THREE.Group();
    dishPivot.rotation.z = -Math.PI * 0.22;
    group.add(dishPivot);

    const dishR = R * 0.38;
    const dishY = R * 0.985;

    // Dark floor with dish texture
    const dishFloor = new THREE.Mesh(
      new THREE.CircleGeometry(dishR, 64),
      new THREE.MeshStandardMaterial({
        map: buildDishTexture(),
        metalness: 0.88,
        roughness: 0.18,
      })
    );
    dishFloor.position.set(0, dishY, 0);
    dishFloor.rotation.x = -Math.PI / 2;
    dishPivot.add(dishFloor);

    // Outer dish rim
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x38384e,
      metalness: 0.82,
      roughness: 0.28,
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(dishR, 5.5, 12, 72), rimMat);
    rim.position.set(0, dishY, 0);
    rim.rotation.x = Math.PI / 2;
    dishPivot.add(rim);

    // Inner concentric ring
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(dishR * 0.52, 2.5, 8, 56), rimMat);
    innerRing.position.set(0, dishY + 0.5, 0);
    innerRing.rotation.x = Math.PI / 2;
    dishPivot.add(innerRing);

    // Radial ribs — 8 structural spokes on the dish floor
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x2e2e42,
      metalness: 0.85,
      roughness: 0.3,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(dishR * 0.9, 1.2, 2.5), ribMat);
      rib.position.set(0, dishY + 0.8, 0);
      rib.rotation.y = angle;
      dishPivot.add(rib);
    }

    // Emitter housing cylinder
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x252535,
      metalness: 0.9,
      roughness: 0.25,
    });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 8, 24), housingMat);
    housing.position.set(0, dishY + 3, 0);
    dishPivot.add(housing);

    // Superlaser emitter orb
    const emitMat = new THREE.MeshStandardMaterial({
      color: 0x99ff55,
      emissive: 0x55ee22,
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.95,
    });
    const emitter = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 20), emitMat);
    emitter.position.set(0, dishY + 8, 0);
    dishPivot.add(emitter);

    // Glow light — stored for animation pulsing
    const laserLight = new THREE.PointLight(0x55ee22, 4, 500);
    laserLight.position.set(0, dishY + 8, 0);
    dishPivot.add(laserLight);
    group.userData.laserLight = laserLight;
    group.userData.emitter = emitter;

    // ── Surface panel geometry (3-D relief over the texture) ─────
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a4c,
      metalness: 0.70,
      roughness: 0.58,
    });

    const addPanelRing = (theta, count) => {
      const y = Math.cos(theta) * R;
      const r = Math.sin(theta) * R;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * Math.PI * 2;
        const px = Math.cos(phi) * r;
        const pz = Math.sin(phi) * r;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 9), panelMat);
        panel.position.set(px, y, pz);
        panel.lookAt(0, 0, 0);
        group.add(panel);
      }
    };

    addPanelRing(Math.PI * 0.22, 10);
    addPanelRing(Math.PI * 0.40, 16);
    addPanelRing(Math.PI * 0.60, 16);
    addPanelRing(Math.PI * 0.78, 10);

    return group;
  }
}

export const deathStar = new DeathStar();
