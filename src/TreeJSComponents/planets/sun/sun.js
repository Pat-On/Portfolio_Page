import * as THREE from "three";
import { IS_MOBILE, texSize } from "../../../utils/mobileQuality";
import sunTexture from "../../../textures/2k_sun.webp";
import normalTexture from "../../../textures/normal.webp";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { makeAtmosphere } from "../atmosphere/atmosphere";

function makeGlowTexture(size = texSize(256)) {
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

function makeRayTexture(size = texSize(512), count = 14) {
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
    sunTex.wrapS    = THREE.RepeatWrapping;  // needed for UV-offset animation
    if (IS_MOBILE) {
      sunTex.generateMipmaps = false;
      sunTex.minFilter = THREE.LinearFilter;
    }

    const sunMatParams = {
      map: sunTex,
      emissiveMap: sunTex,
      emissive: new THREE.Color(1.0, 0.6, 0.1),
      emissiveIntensity: 0.48,
    };
    // Drop the sun's normal map on mobile (shared normal.webp copy).
    if (!IS_MOBILE) {
      const normalTex = new THREE.TextureLoader().load(normalTexture);
      normalTex.wrapS = THREE.RepeatWrapping;
      sunMatParams.normalMap = normalTex;
    }
    const sunMat = new THREE.MeshStandardMaterial(sunMatParams);

    // Eddington limb darkening: I(μ) = I₀·(0.36 + 0.64·μ), μ = cos(angle from disk centre)
    sunMat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float mu = clamp(abs(normalize(vNormal).z), 0.0, 1.0);
        diffuseColor.rgb *= 0.36 + 0.64 * mu;`
      );
    };

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(R, this.sphereParams.width, this.sphereParams.height),
      sunMat
    );
    sphere.userData.role = "sphere";
    group.add(sphere);

    // Corona: one fresnel shell, bright at the limb and fading outward, in
    // place of two flat-opacity spheres that read as a grey disc under bloom
    const corona = makeAtmosphere({
      radius: R * 1.3,
      color: new THREE.Color(1.0, 0.62, 0.28),
      intensity: 0.9,
      power: 2.2,
    });
    corona.userData.role = "corona";
    group.add(corona);

    const outerSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(512),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.62,
    }));
    outerSprite.scale.setScalar(R * 5.0);
    outerSprite.userData.role = "sprite";
    group.add(outerSprite);

    const innerFlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(256),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.45,
    }));
    innerFlare.scale.setScalar(R * 2.4);
    innerFlare.userData.role = "flare";
    group.add(innerFlare);

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
    prominenceGroup.userData.role = "prominenceGroup";
    group.add(prominenceGroup);

    const raySpr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRayTexture(512, 14),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.30,
    }));
    raySpr.scale.setScalar(R * 4.8);
    raySpr.userData.role = "coronaRays";
    group.add(raySpr);

    return group;
  }
}

const sun = new Sun(sunTexture, normalTexture, {
  radius: 420,
  width: 64,
  height: 64,
});

export { sun };
