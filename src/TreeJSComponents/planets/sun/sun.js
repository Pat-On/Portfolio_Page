import * as THREE from "three";
import sunTexture from "../../../textures/2k_sun.jpeg";
import normalTexture from "../../../textures/normal.jpeg";
import Planet from "../baseClassPlanet/baseClassPlanet";

// Procedural radial-gradient texture for the corona sprite
function makeGlowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;

  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0,  "rgba(255, 240, 180, 1.0)");
  grad.addColorStop(0.12, "rgba(255, 200,  80, 0.85)");
  grad.addColorStop(0.28, "rgba(255, 140,  20, 0.55)");
  grad.addColorStop(0.5,  "rgba(255,  80,   0, 0.22)");
  grad.addColorStop(0.75, "rgba(220,  40,   0, 0.06)");
  grad.addColorStop(1.0,  "rgba(0,     0,   0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

class Sun extends Planet {
  build() {
    const group = new THREE.Group();
    const R = this.sphereParams.radius; // 420

    // ── Core sphere ───────────────────────────────────────────────
    const sunTex    = new THREE.TextureLoader().load(sunTexture);
    const normalTex = new THREE.TextureLoader().load(normalTexture);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(R, this.sphereParams.width, this.sphereParams.height),
      new THREE.MeshStandardMaterial({
        map: sunTex,
        normalMap: normalTex,
        emissiveMap: sunTex,
        emissive: new THREE.Color(1.0, 0.6, 0.1),
        emissiveIntensity: 0.55,
      })
    );
    group.add(sphere);

    // ── Inner atmosphere (additive sphere, just outside the core) ─
    const innerAtm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.04, 64, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.55, 0.05),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      })
    );
    group.add(innerAtm);

    // ── Mid corona (additive sphere) ──────────────────────────────
    const midAtm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.18, 48, 24),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.35, 0.0),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      })
    );
    group.add(midAtm);

    // ── Outer glow sprite (corona) ────────────────────────────────
    const spriteMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(512),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.setScalar(R * 6.5);   // wide, soft halo
    group.add(sprite);

    // ── Tight inner flare sprite (brighter centre bloom) ──────────
    const flareMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(256),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const flare = new THREE.Sprite(flareMat);
    flare.scale.setScalar(R * 2.8);
    group.add(flare);

    return group;
  }
}

const sun = new Sun(sunTexture, normalTexture, {
  radius: 420,
  width: 200,
  height: 200,
});

export { sun };
