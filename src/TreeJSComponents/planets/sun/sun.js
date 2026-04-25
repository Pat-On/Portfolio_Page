import * as THREE from "three";
import sunTexture from "../../../textures/2k_sun.jpeg";
import normalTexture from "../../../textures/normal.jpeg";
import Planet from "../baseClassPlanet/baseClassPlanet";
import { makeGlowTexture } from "../../utils/atmosphereGlow";

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
      map: makeGlowTexture(512, [
        [0.0,  "rgba(255, 240, 180, 1.0)"],
        [0.12, "rgba(255, 200,  80, 0.85)"],
        [0.28, "rgba(255, 140,  20, 0.55)"],
        [0.5,  "rgba(255,  80,   0, 0.22)"],
        [0.75, "rgba(220,  40,   0, 0.06)"],
        [1.0,  "rgba(0,     0,   0, 0.0)"],
      ]),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.setScalar(R * 6.5);
    group.add(sprite);

    // ── Tight inner flare sprite (brighter centre bloom) ──────────
    const flareMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(256, [
        [0.0,  "rgba(255, 240, 180, 1.0)"],
        [0.12, "rgba(255, 200,  80, 0.85)"],
        [0.28, "rgba(255, 140,  20, 0.55)"],
        [0.5,  "rgba(255,  80,   0, 0.22)"],
        [0.75, "rgba(220,  40,   0, 0.06)"],
        [1.0,  "rgba(0,     0,   0, 0.0)"],
      ]),
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
