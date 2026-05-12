import * as THREE from "three";
import Planet from "../baseClassPlanet/baseClassPlanet";
import earthTexture from "../../../textures/2k_earth_daymap.jpeg";
import normalTextureMoon from "../../../textures/normal.jpeg";

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function buildCloudTexture() {
  const W = 1024, H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(23);

  // Transparent background — alpha channel carries cloud shape
  ctx.clearRect(0, 0, W, H);

  // Cloud blobs — slightly clustered toward equator and poles
  for (let i = 0; i < 110; i++) {
    const yBias = rand() < 0.35
      ? rand() * H * 0.22                     // north polar
      : rand() < 0.55
        ? H - rand() * H * 0.22              // south polar
        : H * 0.2 + rand() * H * 0.6;        // equatorial band
    const cx = rand() * W;
    const cy = yBias;
    const r = 20 + rand() * 75;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0.0, `rgba(255,255,255,${0.55 + rand() * 0.20})`);
    grad.addColorStop(0.5, `rgba(255,255,255,${0.18 + rand() * 0.12})`);
    grad.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cirrus streaks
  const rand2 = rng(77);
  for (let i = 0; i < 20; i++) {
    const sx = rand2() * W, sy = rand2() * H;
    const len = 80 + rand2() * 140;
    const angle = (rand2() - 0.5) * 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + Math.cos(angle) * len * 0.35, sy + Math.sin(angle) * len * 0.35 + (rand2() - 0.5) * 20,
      sx + Math.cos(angle) * len * 0.65, sy + Math.sin(angle) * len * 0.65 + (rand2() - 0.5) * 20,
      sx + Math.cos(angle) * len,        sy + Math.sin(angle) * len
    );
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + rand2() * 0.15})`;
    ctx.lineWidth = 3 + rand2() * 6;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  return canvas;
}

class EarthPlanet extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius;

    group.add(super.build());

    // Atmosphere halo
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.05, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      })
    ));

    // Cloud layer
    const cloudCanvas = buildCloudTexture();
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.015, 32, 32),
      new THREE.MeshStandardMaterial({
        map: cloudTex,
        alphaMap: new THREE.CanvasTexture(cloudCanvas),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        metalness: 0.0,
        roughness: 1.0,
      })
    );
    group.add(cloudMesh);
    group.userData.cloudMesh = cloudMesh;

    return group;
  }
}

export const earth = new EarthPlanet(earthTexture, normalTextureMoon, { radius: 55, width: 32, height: 32 });
