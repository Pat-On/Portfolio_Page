import * as THREE from "three";

let _t = 0;

function animate(delta) {
  _t += delta * 0.3;
  if (_t > 6283) _t -= 6283;

  // ── SUN ────────────────────────────────────────────────────────
  this.renderedSun.rotation.y += 0.001 * delta * 60;

  const sunPulse  = 1 + Math.sin(_t * 0.9) * 0.04;
  const sunSprite = this.renderedSun.children[3];
  if (sunSprite) sunSprite.scale.setScalar(420 * 5.0 * sunPulse);
  const sunFlare  = this.renderedSun.children[4];
  if (sunFlare)  sunFlare.material.opacity = 0.38 + Math.sin(_t * 1.4) * 0.10;
  // Chromosphere flicker
  const chromosphere = this.renderedSun.children[1];
  if (chromosphere) chromosphere.material.opacity = 0.08 + Math.sin(_t * 2.3) * 0.025;

  // Prominence pulse — each arc breathes at its own rate
  const pg = this.renderedSun.children[5];
  if (pg) pg.children.forEach((p, i) => {
    p.material.opacity = 0.45 + Math.sin(_t * (0.7 + i * 0.25) + i * 1.1) * 0.22;
  });

  // Corona ray streaks — slow rotation via SpriteMaterial.rotation
  const rs = this.renderedSun.children[6];
  if (rs) rs.material.rotation += delta * 0.006;

  // Surface texture UV drift — simulates differential rotation
  const sunSphere = this.renderedSun.children[0];
  if (sunSphere?.material?.map) {
    sunSphere.material.map.offset.x        += delta * 0.00025;
    sunSphere.material.emissiveMap.offset.x = sunSphere.material.map.offset.x;
  }

  // ── PLANETS ────────────────────────────────────────────────────
  this.renderedMercury.rotation.y += 0.005 * delta * 60;

  this.venusObj.rotation.y       += 0.0025 * delta * 60;
  this.renderedVenus.rotation.y  += 0.001  * delta * 60;

  this.earthObj.rotation.y       += 0.002  * delta * 60;
  this.renderedEarth.rotation.y  += 0.0015 * delta * 60;

  this.marsObj.rotation.y        += 0.0016 * delta * 60;
  this.renderedMars.rotation.y   += 0.0014 * delta * 60;

  this.jupiterObj.rotation.y     += 0.001  * delta * 60;
  this.renderedJupiter.rotation.y += 0.003 * delta * 60;

  this.saturnObj.rotation.y      += 0.0008 * delta * 60;
  this.renderedSaturn.rotation.y += 0.0025 * delta * 60;

  this.uranusObj.rotation.y      += 0.0006 * delta * 60;
  this.renderedUranus.rotation.y += 0.0018 * delta * 60;

  this.neptuneObj.rotation.y     += 0.0005 * delta * 60;
  this.renderedNeptune.rotation.y += 0.0016 * delta * 60;

  // ── ENGINE LIGHT ANIMATIONS (all modes) ───────────────────────
  // Alien Saucer — engine cone + glow, slower offset from rim lights
  const saucerAnim = this.renderedSpaceship.userData.animated;
  if (saucerAnim) {
    const engPulse = 0.7 + Math.sin(_t * 2.5 + 0.8) * 0.4;
    saucerAnim.engineLight.intensity            = 1.5 * engPulse;
    saucerAnim.engineMesh.material.emissiveIntensity = engPulse;
  }

  // Enterprise — impulse flicker + nacelle warp exhaust shimmer
  const entAnim = this.renderedEnterprise.userData.animated;
  if (entAnim) {
    entAnim.impulseLight.intensity = 1.2 + Math.sin(_t * 3.1 + 0.4) * 0.5;
    const nacellePulse = 1.8 + Math.sin(_t * 1.5) * 0.8;
    for (const l of entAnim.nacelleLights) l.intensity = nacellePulse;
  }

  // Borg Cube — tractor beam rotation + intensity pulse
  const borgAnim = this.renderedBorg.userData.animated;
  if (borgAnim) {
    const borgPulse = 1.5 + Math.sin(_t * 0.8) * 0.8;
    borgAnim.borgLight.intensity               = borgPulse;
    borgAnim.emitter.material.emissiveIntensity = borgPulse;
    borgAnim.emitter.rotation.y               += 0.02 * delta * 60;
  }

  // Millennium Falcon — fast heartbeat engine pulse + reactor warmth
  const falconAnim = this.renderedFalcon.userData.animated;
  if (falconAnim) {
    const beat = 0.9 + Math.sin(_t * 4.5) * 0.6 + Math.sin(_t * 9) * 0.15;
    falconAnim.engineLight.intensity = 2.5 * Math.max(0.3, beat);
    falconAnim.coreLight.intensity   = 0.8 + Math.sin(_t * 1.8) * 0.3;
  }

  // ISD — triple rear engines with staggered phase offsets
  const isdAnim = this.renderedISD.userData.animated;
  if (isdAnim) {
    isdAnim.engineLights.forEach((l, i) => {
      l.intensity = 2.0 + Math.sin(_t * 2.0 + i * (Math.PI * 2 / 3)) * 0.7;
    });
  }

  if (!this._gameModeActive) {
    // ── SPACECRAFT PATROL PATHS ──────────────────────────────────

    // Alien saucer — elliptical orbit with hover bob
    this.renderedSpaceship.position.x   = 900 + Math.cos(_t * 0.4) * 600;
    this.renderedSpaceship.position.y   = 700 + Math.sin(_t * 1.2) * 40;
    this.renderedSpaceship.position.z   = 1800 + Math.sin(_t * 0.4) * 900;
    this.renderedSpaceship.rotation.y  += 0.012 * delta * 60;

    // Pulse saucer rim lights
    const rimPulse = 0.8 + Math.sin(_t * 3) * 0.4;
    this.renderedSpaceship.children.forEach((child) => {
      if (child.material && child.material.emissive && child.material.color.r === 0) {
        child.material.emissiveIntensity = rimPulse;
      }
    });

    // Enterprise — slow patrol arc with smooth banking
    this.renderedEnterprise.position.x = -400 + Math.cos(_t * 0.18) * 500;
    this.renderedEnterprise.position.y =  500 + Math.sin(_t * 0.25) * 80;
    this.renderedEnterprise.position.z = 2800 + Math.sin(_t * 0.18) * 400;
    _slerp(this.renderedEnterprise,
      Math.PI / 4 + Math.sin(_t * 0.18) * 0.4,
      Math.sin(_t * 0.18) * 0.08,
      0,
      0.06 * delta * 60
    );

    // Borg cube — slow tumble, drifting ominously
    this.renderedBorg.rotation.x  += 0.002 * delta * 60;
    this.renderedBorg.rotation.y  += 0.003 * delta * 60;
    this.renderedBorg.rotation.z  += 0.001 * delta * 60;
    this.renderedBorg.position.x   = 600 + Math.sin(_t * 0.1) * 150;
    this.renderedBorg.position.y   = 400 + Math.cos(_t * 0.12) * 60;

    // Millennium Falcon — fast erratic flight with smooth banking
    this.renderedFalcon.position.x  = -500 + Math.cos(_t * 0.65) * 550;
    this.renderedFalcon.position.y  =  550 + Math.sin(_t * 0.85) * 160;
    this.renderedFalcon.position.z  = 3200 + Math.sin(_t * 0.5)  * 450;
    _slerp(this.renderedFalcon,
      Math.PI * 0.75 + _t * 0.35,
      Math.sin(_t * 0.65) * 0.45,
      Math.cos(_t * 0.85) * 0.18,
      0.07 * delta * 60
    );

    // Imperial Star Destroyer — slow imposing patrol
    this.renderedISD.position.x  = 300 + Math.sin(_t * 0.07) * 350;
    this.renderedISD.position.y  = 250 + Math.cos(_t * 0.05) * 80;
    _slerp(this.renderedISD,
      Math.PI * 0.1 + Math.sin(_t * 0.07) * 0.25,
      Math.sin(_t * 0.04) * 0.04,
      0,
      0.04 * delta * 60
    );
  }

  // ── DEATH STAR (always animated) ──────────────────────────────
  this.deathStarObj.rotation.y    += 0.00018 * delta * 60;
  this.renderedDeathStar.rotation.y += 0.0006 * delta * 60;
  const ll = this.renderedDeathStar.userData.laserLight;
  if (ll) ll.intensity = 4 + Math.sin(_t * 1.8) * 2;
  const em = this.renderedDeathStar.userData.emitter;
  if (em) em.material.emissiveIntensity = 3.5 + Math.sin(_t * 1.8) * 1.5;
}

// ── Helpers ───────────────────────────────────────────────────────
const _tmpQuat   = new THREE.Quaternion();
const _tmpEuler  = new THREE.Euler();

function _slerp(obj, ry, rz, rx, alpha) {
  _tmpEuler.set(rx, ry, rz, 'YXZ');
  _tmpQuat.setFromEuler(_tmpEuler);
  obj.quaternion.slerp(_tmpQuat, Math.min(1, alpha));
}

export { animate };
