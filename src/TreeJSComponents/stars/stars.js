import * as THREE from "three";

// Seeded deterministic RNG — same output every page load
function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function buildNebulaTexture() {
  const W = 2048, H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rand = rng(7);

  ctx.fillStyle = "#00000e";
  ctx.fillRect(0, 0, W, H);

  // Milky Way band — soft diagonal sweep in 3 passes
  const bandParams = [
    { offset: -H * 0.05, width: H * 0.52, opacity: 0.09 },
    { offset:  H * 0.00, width: H * 0.32, opacity: 0.07 },
    { offset:  H * 0.08, width: H * 0.18, opacity: 0.05 },
  ];
  for (const { offset, width, opacity } of bandParams) {
    for (let i = 0; i <= 22; i++) {
      const t  = i / 22;
      const cx = t * W;
      const cy = H * 0.48 + offset + (t - 0.5) * H * 0.25;
      const r  = width * (0.45 + rand() * 0.55);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0.0, `rgba(175, 185, 215, ${opacity})`);
      grad.addColorStop(0.5, `rgba(130, 145, 195, ${opacity * 0.45})`);
      grad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Nebula patches
  const nebulae = [
    [W * 0.17, H * 0.32, 310, [
      [0.0, "rgba( 50,  70, 200, 0.20)"], [0.3, "rgba( 90,  40, 170, 0.12)"],
      [0.6, "rgba( 50,  20, 120, 0.05)"], [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
    [W * 0.76, H * 0.68, 220, [
      [0.0, "rgba(190,  35,  25, 0.16)"], [0.3, "rgba(155,  50,  18, 0.09)"],
      [0.6, "rgba( 90,  15,   8, 0.04)"], [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
    [W * 0.50, H * 0.15, 175, [
      [0.0, "rgba( 18, 130, 170, 0.14)"], [0.4, "rgba( 10,  85, 140, 0.06)"],
      [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
    [W * 0.89, H * 0.26, 155, [
      [0.0, "rgba(130,  35, 170, 0.12)"], [0.5, "rgba( 80,  15, 120, 0.05)"],
      [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
    [W * 0.35, H * 0.78, 190, [
      [0.0, "rgba( 25, 160,  90, 0.10)"], [0.4, "rgba( 15, 100,  60, 0.05)"],
      [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
    [W * 0.62, H * 0.40, 130, [
      [0.0, "rgba(200, 120,  20, 0.09)"], [0.5, "rgba(150,  70,  10, 0.04)"],
      [1.0, "rgba(  0,   0,   0, 0.0)"],
    ]],
  ];
  for (const [cx, cy, r, stops] of nebulae) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (const [pos, color] of stops) grad.addColorStop(pos, color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Distant star dots baked into the texture
  const starRand = rng(31);
  for (let i = 0; i < 5000; i++) {
    const x = starRand() * W;
    const y = starRand() * H;
    const type   = starRand();
    const bright = 130 + Math.floor(starRand() * 125);
    const size   = starRand() < 0.04 ? 1.4 : starRand() < 0.18 ? 0.9 : 0.5;
    let r = bright, g = bright, b = bright;
    if      (type < 0.20) { b = Math.min(255, bright + 45); r = Math.max(0, bright - 25); }
    else if (type < 0.32) { r = Math.min(255, bright + 25); b = Math.max(0, bright - 35); }
    else if (type < 0.38) { r = Math.min(255, bright + 40); g = Math.max(0, bright - 25); b = Math.max(0, bright - 50); }
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${0.55 + starRand() * 0.45})`;
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function buildStarPoints(count, radius, size, opacity, seed) {
  const rand = rng(seed);
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * rand();
    const phi   = Math.acos(2 * rand() - 1);
    const r     = radius * (0.88 + rand() * 0.12);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const type = rand();
    const bv   = 0.82 + rand() * 0.18;
    if (type < 0.60) {
      colors[i*3]=bv; colors[i*3+1]=bv; colors[i*3+2]=Math.min(1,bv+0.04);
    } else if (type < 0.80) {
      colors[i*3]=0.65+rand()*0.25; colors[i*3+1]=0.78+rand()*0.18; colors[i*3+2]=1.0;
    } else if (type < 0.93) {
      colors[i*3]=1.0; colors[i*3+1]=0.86+rand()*0.10; colors[i*3+2]=0.60+rand()*0.22;
    } else {
      colors[i*3]=1.0; colors[i*3+1]=0.42+rand()*0.32; colors[i*3+2]=0.22+rand()*0.22;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,   // always behind everything
  }));
  pts.renderOrder = -1;
  return pts;
}

/**
 * Builds the space background and returns the objects that must be
 * repositioned each frame so they always surround the camera.
 * Call background.update(camera) in the render loop.
 */
export function buildBackground(scene) {
  // Pure black — the sphere covers everything; this is just the WebGL clear colour.
  scene.background = new THREE.Color(0x000000);

  // Nebula sphere — BackSide so the camera always sees the inside.
  // Radius 4500: small enough to always be inside the far plane (10000)
  // even when the camera moves far from the origin.
  const nebulaSphere = new THREE.Mesh(
    new THREE.SphereGeometry(4500, 64, 32),
    new THREE.MeshBasicMaterial({
      map: buildNebulaTexture(),
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,   // always behind everything
    })
  );
  nebulaSphere.rotation.z = 0.35;
  nebulaSphere.renderOrder = -2;
  scene.add(nebulaSphere);

  // Star particle layers — slightly smaller so they sit inside the sphere.
  const smallStars = buildStarPoints(3800, 4200, 1.0, 0.72, 17);
  const medStars   = buildStarPoints(550,  3900, 2.0, 0.88, 53);
  scene.add(smallStars);
  scene.add(medStars);

  const objects = [nebulaSphere, smallStars, medStars];

  return {
    // Call every frame: keeps background centred on the camera so it never clips.
    update(camera) {
      for (const obj of objects) obj.position.copy(camera.position);
    },
  };
}
