import * as THREE from "three";
import normalTexture from "../../textures/normal.jpeg";

function buildSaucerHullTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2;

  // Base radial gradient — lighter at poles (canvas center), darker at rim
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "#b8c8d8");
  grad.addColorStop(0.55, "#7a8a9a");
  grad.addColorStop(1, "#5a6a7a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const SEGMENTS = 12;

  // Radial dividing lines
  ctx.strokeStyle = "rgba(30,40,50,0.6)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * size / 2, cy + Math.sin(angle) * size / 2);
    ctx.stroke();
  }

  // Concentric sub-panel rings at 60% and 80% radius
  const rings = [0.30, 0.48, 0.64, 0.82];
  rings.forEach((r, ri) => {
    const radius = r * size / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(30,40,50,0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Alternate panel fill between rings
    if (ri % 2 === 0) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = (i / SEGMENTS) * Math.PI * 2;
        const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2;
        const innerR = ri > 0 ? rings[ri - 1] * size / 2 : 0;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.arc(cx, cy, innerR, a1, a0, true);
        ctx.closePath();
        const v = 115 + (i % 2 === 0 ? 8 : -6);
        ctx.fillStyle = `rgba(${v},${v + 12},${v + 20},0.18)`;
        ctx.fill();
      }
    }
  });

  // Alien conduit ring at 30% radius
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(100,220,180,0.3)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Geometric alien glyph marks on 6 of 12 outer segments
  for (let i = 0; i < SEGMENTS; i += 2) {
    const angle = ((i + 0.5) / SEGMENTS) * Math.PI * 2;
    const dist = size * 0.35;
    const gx = cx + Math.cos(angle) * dist;
    const gy = cy + Math.sin(angle) * dist;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle + Math.PI / 2);
    ctx.strokeStyle = "rgba(160,240,200,0.25)";
    ctx.lineWidth = 1;
    // L-shaped glyph
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6, 4);
    ctx.lineTo(0, 4);
    ctx.moveTo(2, -4);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bevel highlights — top-left of each major segment at outer ring
  for (let i = 0; i < SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    const r0 = size * 0.30, r1 = size * 0.40;
    const ax = cx + Math.cos(angle) * r0;
    const ay = cy + Math.sin(angle) * r0;
    const bx = cx + Math.cos(angle) * r1;
    const by = cy + Math.sin(angle) * r1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = "rgba(210,225,235,0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  return canvas;
}

function buildSaucerRoughnessMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2;

  ctx.fillStyle = "#9a9a9a";
  ctx.fillRect(0, 0, size, size);

  // Polished central hub
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.18);
  hubGrad.addColorStop(0, "#4f4f4f");
  hubGrad.addColorStop(1, "#9a9a9a");
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Conduit ring — shinier
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
  ctx.strokeStyle = "#3f3f3f";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Radial seam lines
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * size / 2, cy + Math.sin(angle) * size / 2);
    ctx.stroke();
  }

  return canvas;
}

class Spaceship {
  build() {
    const group = new THREE.Group();

    // Main disc
    const discGeo = new THREE.SphereGeometry(40, 32, 16);
    discGeo.scale(1, 0.18, 1);
    const discMat = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(buildSaucerHullTexture()),
      roughnessMap: new THREE.CanvasTexture(buildSaucerRoughnessMap()),
      normalMap: new THREE.TextureLoader().load(normalTexture),
      normalScale: new THREE.Vector2(0.3, 0.3),
      metalness: 0.85,
      roughness: 0.20,
    });
    group.add(new THREE.Mesh(discGeo, discMat));

    // Rim torus
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xaabbcc,
      metalness: 0.9,
      roughness: 0.1,
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(39, 3, 8, 48), rimMat);
    group.add(rim);

    // Glass dome
    const domeGeo = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x44ffaa,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      metalness: 0.1,
      emissive: 0x22aa66,
      emissiveIntensity: 0.4,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 7;
    group.add(dome);

    // Rim lights
    this._rimLights = [];
    const rimLightMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
    });
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const light = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), rimLightMat.clone());
      light.position.set(Math.cos(angle) * 39, -1, Math.sin(angle) * 39);
      this._rimLights.push(light);
      group.add(light);
    }

    // Engine cone underneath
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.75,
    });
    const engine = new THREE.Mesh(new THREE.ConeGeometry(10, 14, 16), engineMat);
    engine.position.y = -10;
    engine.rotation.x = Math.PI;
    group.add(engine);

    // Interior point light
    const glow = new THREE.PointLight(0x00ffcc, 1.5, 300);
    glow.position.y = 5;
    group.add(glow);

    return group;
  }
}

export const spaceship = new Spaceship();
