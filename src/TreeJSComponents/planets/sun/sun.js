import * as THREE from "three";
import sunTexture from "../../../textures/2k_sun.jpeg";
import normalTexture from "../../../textures/normal.jpeg";
import Planet from "../baseClassPlanet/baseClassPlanet";

function makeGlowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0,  "rgba(255, 248, 210, 1.0)");
  grad.addColorStop(0.08, "rgba(255, 235, 160, 0.80)");
  grad.addColorStop(0.22, "rgba(255, 210, 100, 0.42)");
  grad.addColorStop(0.40, "rgba(255, 180,  50, 0.18)");
  grad.addColorStop(0.60, "rgba(255, 150,  30, 0.06)");
  grad.addColorStop(0.80, "rgba(255, 120,  10, 0.015)");
  grad.addColorStop(1.0,  "rgba(0,     0,   0, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makeRayTexture(size = 512, count = 14) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const len   = size * (0.22 + Math.random() * 0.14);
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0.0,  "rgba(255, 240, 180, 0.38)");
    g.addColorStop(0.35, "rgba(255, 220, 140, 0.15)");
    g.addColorStop(1.0,  "rgba(255, 200, 100, 0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, -size * 0.008, len, size * 0.016);
    ctx.restore();
  }
  return new THREE.CanvasTexture(canvas);
}

function makeProminence(R, latRad, lonRad, arcHeightFactor) {
  const toPoint = (r, lat, lon) => new THREE.Vector3(
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.sin(lon)
  );
  const p1   = toPoint(R, latRad, lonRad);
  const peak = toPoint(R * arcHeightFactor, latRad + 0.18, lonRad + 0.12);
  const p2   = toPoint(R, latRad + 0.32, lonRad + 0.22);
  const curve = new THREE.QuadraticBezierCurve3(p1, peak, p2);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 24, R * 0.014, 6, false),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.28, 0.04),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}

class Sun extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius; // 420

    // ── Core sphere with limb darkening ───────────────────────────
    const sunTex    = new THREE.TextureLoader().load(sunTexture);
    const normalTex = new THREE.TextureLoader().load(normalTexture);
    sunTex.wrapS    = THREE.RepeatWrapping;  // needed for UV-offset animation
    normalTex.wrapS = THREE.RepeatWrapping;

    const sunMat = new THREE.MeshStandardMaterial({
      map: sunTex,
      normalMap: normalTex,
      emissiveMap: sunTex,
      emissive: new THREE.Color(1.0, 0.6, 0.1),
      emissiveIntensity: 0.48,
    });

    // Eddington limb darkening: I(μ) = I₀·(0.36 + 0.64·μ), μ = cos(angle from disk centre)
    sunMat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float mu = clamp(abs(normalize(vNormal).z), 0.0, 1.0);
        diffuseColor.rgb *= 0.36 + 0.64 * mu;`
      );
    };

    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, this.sphereParams.width, this.sphereParams.height),
      sunMat
    )); // children[0]

    // ── Chromosphere ──────────────────────────────────────────────
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.012, 64, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.28, 0.18),
        transparent: true, opacity: 0.12,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
      })
    )); // children[1]

    // ── K-corona (white scattered-light corona) ───────────────────
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.22, 48, 24),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.95, 0.97, 1.0),
        transparent: true, opacity: 0.06,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
      })
    )); // children[2]

    // ── Outer glow sprite ─────────────────────────────────────────
    const outerSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(512),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.62,
    }));
    outerSprite.scale.setScalar(R * 5.0);
    group.add(outerSprite); // children[3]

    // ── Inner flare sprite ────────────────────────────────────────
    const innerFlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(256),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.45,
    }));
    innerFlare.scale.setScalar(R * 2.4);
    group.add(innerFlare); // children[4]

    // ── Solar prominences ─────────────────────────────────────────
    const prominenceGroup = new THREE.Group();
    const promDefs = [
      [0.35, 0.0,        1.28],
      [-0.28, 1.05,      1.22],
      [0.18, 2.09,       1.32],
      [-0.40, 3.14,      1.25],
      [0.30, 4.19,       1.20],
      [-0.15, 5.24,      1.30],
    ];
    for (const [lat, lon, h] of promDefs) {
      prominenceGroup.add(makeProminence(R, lat, lon, h));
    }
    group.add(prominenceGroup); // children[5]

    // ── Corona ray streaks ────────────────────────────────────────
    const raySpr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRayTexture(512, 14),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.30,
    }));
    raySpr.scale.setScalar(R * 4.8);
    group.add(raySpr); // children[6]

    return group;
  }
}

const sun = new Sun(sunTexture, normalTexture, {
  radius: 420,
  width: 200,
  height: 200,
});

export { sun };
