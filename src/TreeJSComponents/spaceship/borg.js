import * as THREE from "three";
import { albedoTex, linearTex, sharedNormalMap } from "./textureUtils";
import { texSize } from "../../utils/mobileQuality";

function buildBorgCircuitTexture() {
  const size = texSize(512);
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
  const size = texSize(512);
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

    const size = texSize(320);

    // Outer cube shell — dark green metallic
    const circuitTex = albedoTex(buildBorgCircuitTexture());
    circuitTex.wrapS = THREE.RepeatWrapping;
    circuitTex.wrapT = THREE.RepeatWrapping;
    const shellMat = new THREE.MeshStandardMaterial({
      map: circuitTex,
      roughnessMap: linearTex(buildBorgRoughnessMap()),
      normalMap: sharedNormalMap(),
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

    // ── Assimilation tubes — protruding from various faces ────
    const h2 = size / 2;
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x001400, emissive: 0x002200, emissiveIntensity: 0.4,
      metalness: 0.85, roughness: 0.55,
    });
    // [x, y, z, rotX, rotZ, len, r]
    const tubeDefs = [
      [ h2 + 56,   72,  -40,  0,            -Math.PI / 2, 112, 16.0 ],
      [-h2 - 44,  -80,   32,  0,             Math.PI / 2,  88, 14.0 ],
      [  48,  h2 + 60,  -56,  0,             0,           120, 12.0 ],
      [ -72,  -48,  h2 + 48,  Math.PI / 2,  0,            96, 14.0 ],
      [  32,   88, -h2 - 40, -Math.PI / 2,  0,            80, 12.0 ],
    ];
    for (const [x, y, z, rx, rz, len, r] of tubeDefs) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, len, 8), tubeMat);
      tube.position.set(x, y, z);
      tube.rotation.x = rx;
      tube.rotation.z = rz;
      group.add(tube);
    }

    group.userData.animated = { emitter, borgLight, circuitTex };

    return group;
  }
}

export const borgCube = new BorgCube();
