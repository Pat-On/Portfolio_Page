import * as THREE from "three";
import normalTexture from "../../textures/normal.jpeg";

function buildBorgCircuitTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const CELLS = 16;
  const cell = size / CELLS;

  ctx.fillStyle = "#0c1a0c";
  ctx.fillRect(0, 0, size, size);

  // Per-cell panel variation
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      const x = col * cell;
      const y = row * cell;
      const v = 12 + Math.floor(Math.random() * 8);
      const g = 20 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${v},${g},${v})`;
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  }

  // Structural seams every 4 cells
  ctx.strokeStyle = "rgba(0,80,20,0.9)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= CELLS; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
    ctx.stroke();
  }

  // Circuit traces per cell
  ctx.lineWidth = 1.2;
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      const x = col * cell;
      const y = row * cell;
      const r = Math.random();

      ctx.strokeStyle = "rgba(0,200,60,0.55)";
      ctx.beginPath();
      if (r < 0.4) {
        // horizontal trace
        const ty = y + cell * (0.3 + Math.random() * 0.4);
        ctx.moveTo(x, ty);
        ctx.lineTo(x + cell, ty);
        ctx.stroke();
      } else if (r < 0.8) {
        // vertical trace
        const tx = x + cell * (0.3 + Math.random() * 0.4);
        ctx.moveTo(tx, y);
        ctx.lineTo(tx, y + cell);
        ctx.stroke();
      } else {
        // L-shaped junction
        const jx = x + cell * (0.3 + Math.random() * 0.4);
        const jy = y + cell * (0.3 + Math.random() * 0.4);
        ctx.moveTo(x, jy);
        ctx.lineTo(jx, jy);
        ctx.lineTo(jx, y + cell);
        ctx.stroke();
      }

      // Solder pad at junctions
      if (Math.random() < 0.25) {
        const px = x + cell * (0.25 + Math.random() * 0.5);
        const py = y + cell * (0.25 + Math.random() * 0.5);
        ctx.fillStyle = "rgba(0,240,80,0.7)";
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }

      // Via holes
      if (Math.random() < 0.12) {
        const vx = x + cell * (0.2 + Math.random() * 0.6);
        const vy = y + cell * (0.2 + Math.random() * 0.6);
        ctx.beginPath();
        ctx.arc(vx, vy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#001800";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,200,60,0.8)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.lineWidth = 1.2;
      }
    }
  }

  // Device blocks — small rectangular tech nodes
  for (let q = 0; q < 4; q++) {
    const qx = (q % 2) * (size / 2);
    const qy = Math.floor(q / 2) * (size / 2);
    for (let n = 0; n < 3; n++) {
      const bx = qx + 8 + Math.random() * (size / 2 - 24);
      const by = qy + 8 + Math.random() * (size / 2 - 24);
      ctx.fillStyle = "rgba(0,180,50,0.4)";
      ctx.fillRect(bx, by, 14, 9);
      ctx.strokeStyle = "rgba(0,240,80,0.6)";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx, by, 14, 9);
    }
  }

  return canvas;
}

function buildBorgRoughnessMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const CELLS = 16;
  const cell = size / CELLS;

  ctx.fillStyle = "#606060";
  ctx.fillRect(0, 0, size, size);

  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      const x = col * cell + 1;
      const y = row * cell + 1;
      const w = cell - 2;
      const h = cell - 2;
      const v = 112 + Math.floor(Math.random() * 16);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, w, h);
    }
  }

  // Structural seams — shinier
  ctx.fillStyle = "#505050";
  for (let i = 0; i <= CELLS; i += 4) {
    ctx.fillRect(i * cell - 1, 0, 2.5, size);
    ctx.fillRect(0, i * cell - 1, size, 2.5);
  }

  // Trace lines — more reflective
  ctx.fillStyle = "#404040";
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      if (Math.random() < 0.5) {
        const x = col * cell + cell * 0.3;
        const y = row * cell + cell * 0.45;
        ctx.fillRect(x, y, cell * 0.4, 1);
      }
    }
  }

  return canvas;
}

class BorgCube {
  build() {
    const group = new THREE.Group();

    const size = 80;

    // Outer cube shell — dark green metallic
    const shellMat = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(buildBorgCircuitTexture()),
      roughnessMap: new THREE.CanvasTexture(buildBorgRoughnessMap()),
      normalMap: new THREE.TextureLoader().load(normalTexture),
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalness: 0.90,
      roughness: 0.38,
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
