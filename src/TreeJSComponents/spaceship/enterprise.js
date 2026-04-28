import * as THREE from "three";
import normalTexture from "../../textures/normal.jpeg";

function buildEnterpriseHullTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8a8e9a";
  ctx.fillRect(0, 0, size, size);

  const COLS = 24, ROWS = 12;
  const cellW = size / COLS;
  const cellH = size / ROWS;
  const seam = 2;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * cellW + seam;
      const y = row * cellH + seam;
      const w = cellW - seam * 2;
      const h = cellH - seam * 2;

      const base = 190 + Math.floor(Math.random() * 25);
      const isHatch = Math.random() < 0.08;
      const v = isHatch ? base - 18 : base;
      ctx.fillStyle = `rgb(${v},${v},${v + 6})`;
      ctx.fillRect(x, y, w, h);

      // Recessed sub-panel
      if (Math.random() < 0.20) {
        const mg = Math.max(3, Math.min(w, h) * 0.15);
        ctx.fillStyle = "rgba(0,0,15,0.28)";
        ctx.fillRect(x + mg, y + mg, w - mg * 2, h - mg * 2);
      }

      // Starfleet geometric registry mark
      if (Math.random() < 0.10) {
        const mx = x + w / 2;
        const my = y + h / 2;
        ctx.strokeStyle = "rgba(140,145,165,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx - 7, my);
        ctx.lineTo(mx + 7, my);
        ctx.moveTo(mx - 7, my - 2);
        ctx.lineTo(mx - 7, my + 2);
        ctx.moveTo(mx + 7, my - 2);
        ctx.lineTo(mx + 7, my + 2);
        ctx.stroke();
      }

      // Structural rib accent on every 4th column seam (right edge of cell)
      if ((col + 1) % 4 === 0) {
        ctx.fillStyle = "rgba(200,205,220,0.12)";
        ctx.fillRect(x + w - 1, y, 1, h);
      }

      // Bevel highlight
      ctx.fillStyle = "rgba(215,220,235,0.07)";
      ctx.fillRect(x, y, w, 1.5);
      ctx.fillRect(x, y, 1.5, h);
      ctx.fillStyle = "rgba(0,0,8,0.10)";
      ctx.fillRect(x, y + h - 1.5, w, 1.5);
      ctx.fillRect(x + w - 1.5, y, 1.5, h);
    }
  }

  return canvas;
}

function buildEnterpriseRoughnessMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(0, 0, size, size);

  const COLS = 24, ROWS = 12;
  const cellW = size / COLS;
  const cellH = size / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * cellW + 1;
      const y = row * cellH + 1;
      const w = cellW - 2;
      const h = cellH - 2;
      const v = 144 + Math.floor(Math.random() * 16);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, w, h);

      // Sub-panel recesses — shinier
      if (Math.random() < 0.20) {
        const mg = Math.max(2, Math.min(w, h) * 0.15);
        ctx.fillStyle = "#404040";
        ctx.fillRect(x + mg, y + mg, w - mg * 2, h - mg * 2);
      }
    }
  }

  // Seam lines
  ctx.fillStyle = "#505050";
  for (let c = 1; c < COLS; c++) {
    ctx.fillRect(c * cellW - 1, 0, 2, size);
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.fillRect(0, r * cellH - 1, size, 2);
  }

  // Structural rib lines every 4th column
  ctx.fillStyle = "#606060";
  for (let c = 4; c < COLS; c += 4) {
    ctx.fillRect(c * cellW - 1, 0, 1, size);
  }

  return canvas;
}

class Enterprise {
  build() {
    const group = new THREE.Group();

    // Materials
    const hull = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(buildEnterpriseHullTexture()),
      roughnessMap: new THREE.CanvasTexture(buildEnterpriseRoughnessMap()),
      normalMap: new THREE.TextureLoader().load(normalTexture),
      normalScale: new THREE.Vector2(0.25, 0.25),
      metalness: 0.55,
      roughness: 0.42,
    });
    const dark = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.6, roughness: 0.5 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x3366dd, emissiveIntensity: 1.0, transparent: true, opacity: 0.9 });
    const red  = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xdd1100, emissiveIntensity: 1.1 });
    const orange = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });

    // ─── SAUCER ─────────────────────────────────────────────
    const SR = 50;           // saucer radius
    const SY = 28;           // saucer centre Y
    const SZ = -8;           // saucer centre Z (slightly forward)

    // Rim band
    group.add(mesh(new THREE.CylinderGeometry(SR, SR, 10, 64), hull, 0, SY, SZ));

    // Top dome – flattened
    const tDome = new THREE.Mesh(
      new THREE.SphereGeometry(SR, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      hull
    );
    tDome.scale.y = 0.28;
    tDome.position.set(0, SY + 5, SZ);
    group.add(tDome);

    // Bottom dome – even flatter
    const bDome = new THREE.Mesh(
      new THREE.SphereGeometry(SR, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      hull
    );
    bDome.scale.y = 0.22;
    bDome.position.set(0, SY - 5, SZ);
    group.add(bDome);

    // Bridge dome on top
    const bridge = new THREE.Mesh(
      new THREE.SphereGeometry(8, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      dark
    );
    bridge.position.set(0, SY + 5 + SR * 0.28 + 4, SZ - 4);
    group.add(bridge);

    // Bridge window strip
    const bWin = new THREE.Mesh(
      new THREE.TorusGeometry(4.5, 1.1, 6, 20, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xffcc44, emissiveIntensity: 0.9 })
    );
    bWin.position.set(0, SY + 5 + SR * 0.28 + 7, SZ - 4);
    bWin.rotation.x = Math.PI / 2;
    group.add(bWin);

    // Sensor dome underneath (slightly aft)
    const sDome = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      dark
    );
    sDome.position.set(0, SY - 5 - SR * 0.22 - 2, SZ + 10);
    group.add(sDome);

    // Impulse engines (rear of saucer, glowing orange bar)
    const imp = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 5), orange);
    imp.position.set(0, SY + 2, SZ + SR - 4);
    group.add(imp);
    ptLight(group, 0xff5500, 1.2, 180, 0, SY + 2, SZ + SR - 2);

    // Port / starboard running lights
    const rlGeo = new THREE.SphereGeometry(2.5, 8, 8);
    group.add(mesh(rlGeo, new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }), -SR, SY, SZ));
    group.add(mesh(rlGeo, new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }),  SR, SY, SZ));

    // ─── NECK ───────────────────────────────────────────────
    // Connects saucer bottom-rear to secondary hull top-front
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(5, 10, 34, 14), dark);
    neck.position.set(0, 2, 10);
    neck.rotation.x = 0.52;   // angled aft ~30°
    group.add(neck);

    // ─── SECONDARY HULL ─────────────────────────────────────
    const HY = -28;   // hull centre Y
    const HZ =  18;   // hull centre Z

    // Main horizontal cylinder
    const hullBody = new THREE.Mesh(new THREE.CylinderGeometry(15, 13, 78, 24), hull);
    hullBody.rotation.x = Math.PI / 2;
    hullBody.position.set(0, HY, HZ);
    group.add(hullBody);

    // Front rounded cap
    const fCap = new THREE.Mesh(
      new THREE.SphereGeometry(15, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      hull
    );
    fCap.rotation.x = -Math.PI / 2;
    fCap.position.set(0, HY, HZ - 39);
    group.add(fCap);

    // Deflector dish ring
    group.add(mesh(new THREE.TorusGeometry(10, 2.5, 10, 32), dark, 0, HY, HZ - 42));

    // Deflector glow
    const defl = new THREE.Mesh(new THREE.SphereGeometry(8, 20, 16), blue);
    defl.position.set(0, HY, HZ - 45);
    group.add(defl);
    ptLight(group, 0x4488ff, 2.5, 420, 0, HY, HZ - 45);

    // ─── PYLONS ─────────────────────────────────────────────
    // Angled BoxGeometry: from hull side (±15, HY, HZ) up to nacelle (±70, 15, HZ)
    // ΔX=55, ΔY=43  → length≈70, angle from vertical ≈51°
    [-1, 1].forEach((s) => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(7, 70, 12), dark);
      pylon.position.set(s * 42, HY + 22, HZ);
      pylon.rotation.z = s * -0.9;   // ~51° from vertical
      group.add(pylon);
    });

    // ─── NACELLES ───────────────────────────────────────────
    const NR = 8;     // nacelle radius
    const NL = 88;    // nacelle length
    const NY = 15;    // nacelle centre Y
    const NX = 70;    // nacelle centre |X|

    [-1, 1].forEach((s) => {
      const ng = new THREE.Group();

      // Body
      ng.add(rotX(new THREE.Mesh(new THREE.CylinderGeometry(NR, NR * 0.9, NL, 22), hull), Math.PI / 2));

      // Top accent stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(NR * 0.75, 4, NL * 0.8), dark);
      stripe.position.y = NR + 1;
      ng.add(stripe);

      // Bussard collector housing (dark front dome)
      const bHouse = new THREE.Mesh(
        new THREE.SphereGeometry(NR, 20, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        dark
      );
      bHouse.rotation.x = -Math.PI / 2;
      bHouse.position.z = -NL / 2;
      ng.add(bHouse);

      // Bussard glow
      const buss = new THREE.Mesh(new THREE.SphereGeometry(NR * 0.65, 16, 16), red);
      buss.position.z = -NL / 2 - 3;
      ng.add(buss);
      ptLight(ng, 0xff2200, 1.4, 180, 0, 0, -NL / 2 - 3);

      // Warp exhaust
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(NR * 0.6, NR * 0.35, 12, 16),
        blue
      );
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.z = NL / 2 + 4;
      ng.add(exhaust);
      ptLight(ng, 0x4488ff, 1.8, 240, 0, 0, NL / 2 + 7);

      ng.position.set(s * NX, NY, HZ);
      group.add(ng);
    });

    return group;
  }
}

// ─── helpers ────────────────────────────────────────────────
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

function rotX(obj, angle) {
  obj.rotation.x = angle;
  return obj;
}

function ptLight(parent, color, intensity, distance, x, y, z) {
  const l = new THREE.PointLight(color, intensity, distance);
  l.position.set(x, y, z);
  parent.add(l);
}

export const enterprise = new Enterprise();
