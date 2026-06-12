import * as THREE from "three";
import { findByRole } from "./findByRole";
import { celestialBodies } from "./registry";

let _t = 0;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const meshAlias = (name) => `rendered${cap(name)}`;
const orbitAlias = (name) => `${name}Obj`;

function animate(delta) {
  const dt60 = delta * 60;
  _t += delta * 0.3;
  if (_t > 6283) _t -= 6283;

  // ── PLANETARY ORBITS + SPINS — driven by registry ─────────────
  for (const body of celestialBodies) {
    const mesh = this[meshAlias(body.name)];
    if (!mesh) continue;
    if (body.spinSpeed) mesh.rotation.y += body.spinSpeed * dt60;
    if (body.orbitSpeed) {
      const wrap = this[orbitAlias(body.name)];
      if (wrap) wrap.rotation.y += body.orbitSpeed * dt60;
    }
    if (body.children) {
      for (const child of body.children) {
        const childMesh = this[meshAlias(child.name)];
        if (!childMesh) continue;
        if (child.spinSpeed) childMesh.rotation.y += child.spinSpeed * dt60;
        if (child.orbitSpeed) {
          const childWrap = this[orbitAlias(child.name)];
          if (childWrap) childWrap.rotation.y += child.orbitSpeed * dt60;
        }
      }
    }
  }

  const sunPulse  = 1 + Math.sin(_t * 0.9) * 0.04;
  const sunSprite = findByRole(this.renderedSun, "sprite");
  if (sunSprite) sunSprite.scale.setScalar(420 * 5.0 * sunPulse);
  const sunFlare  = findByRole(this.renderedSun, "flare");
  if (sunFlare)  sunFlare.material.opacity = 0.38 + Math.sin(_t * 1.4) * 0.10;
  // Chromosphere flicker
  const chromosphere = findByRole(this.renderedSun, "chromosphere");
  if (chromosphere) chromosphere.material.opacity = 0.08 + Math.sin(_t * 2.3) * 0.025;

  // Prominence pulse — each arc breathes at its own rate
  const pg = findByRole(this.renderedSun, "prominenceGroup");
  if (pg) pg.children.forEach((p, i) => {
    p.material.opacity = 0.45 + Math.sin(_t * (0.7 + i * 0.25) + i * 1.1) * 0.22;
  });

  // Corona ray streaks — slow rotation via SpriteMaterial.rotation
  const rs = findByRole(this.renderedSun, "coronaRays");
  if (rs) rs.material.rotation += delta * 0.006;

  // Surface texture UV drift — simulates differential rotation
  const sunSphere = findByRole(this.renderedSun, "sphere");
  if (sunSphere?.material?.map) {
    sunSphere.material.map.offset.x        += delta * 0.00025;
    sunSphere.material.emissiveMap.offset.x = sunSphere.material.map.offset.x;
  }

  // Earth cloud layer + asteroid belt aren't part of the registry — keep inline
  if (this.renderedEarth.userData.cloudMesh)
    this.renderedEarth.userData.cloudMesh.rotation.y -= 0.0003 * dt60;
  this.asteroidBelt.rotation.y += 0.00008 * dt60;

  // ── ENGINE LIGHT ANIMATIONS (all modes) ───────────────────────
  // Alien Saucer — engine cone + glow, slower offset from rim lights
  const saucerAnim = this.renderedSpaceship.userData.animated;
  if (saucerAnim) {
    const engPulse = 0.7 + Math.sin(_t * 2.5 + 0.8) * 0.4;
    saucerAnim.engineLight.intensity            = 1.5 * engPulse;
    saucerAnim.engineMesh.material.emissiveIntensity = engPulse;
  }

  // Enterprise — impulse flicker + nacelle warp exhaust shimmer + Bussard spin
  const entAnim = this.renderedEnterprise.userData.animated;
  if (entAnim) {
    entAnim.impulseLight.intensity = 1.2 + Math.sin(_t * 3.1 + 0.4) * 0.5;
    const nacellePulse = 1.8 + Math.sin(_t * 1.5) * 0.8;
    for (const l of entAnim.nacelleLights) l.intensity = nacellePulse;
    if (entAnim.bussardGroups) {
      for (const bg of entAnim.bussardGroups) bg.rotation.z += 0.08 * delta * 60;
    }
  }

  // Borg Cube — tractor beam rotation + intensity pulse + circuit UV drift
  const borgAnim = this.renderedBorg.userData.animated;
  if (borgAnim) {
    const borgPulse = 1.5 + Math.sin(_t * 0.8) * 0.8;
    borgAnim.borgLight.intensity               = borgPulse;
    borgAnim.emitter.material.emissiveIntensity = borgPulse;
    borgAnim.emitter.rotation.y               += 0.02 * delta * 60;
    if (borgAnim.circuitTex) {
      borgAnim.circuitTex.offset.x += delta * 0.007;
      borgAnim.circuitTex.offset.y -= delta * 0.005;
    }
  }

  // Millennium Falcon — fast heartbeat engine pulse + reactor warmth + plume scale
  const falconAnim = this.renderedFalcon.userData.animated;
  if (falconAnim) {
    const beat = 0.9 + Math.sin(_t * 4.5) * 0.6 + Math.sin(_t * 9) * 0.15;
    const clampedBeat = Math.max(0.3, beat);
    falconAnim.engineLight.intensity = 2.5 * clampedBeat;
    falconAnim.coreLight.intensity   = 0.8 + Math.sin(_t * 1.8) * 0.3;
    if (falconAnim.plumeMesh) {
      falconAnim.plumeMesh.material.opacity = 0.10 + clampedBeat * 0.14;
      falconAnim.plumeMesh.scale.z          = 0.7  + clampedBeat * 0.4;
    }
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

    // Enterprise — slow patrol arc, bow always faces travel direction
    this.renderedEnterprise.position.x = -400 + Math.cos(_t * 0.18) * 500;
    this.renderedEnterprise.position.y =  500 + Math.sin(_t * 0.25) * 80;
    this.renderedEnterprise.position.z = 2800 + Math.sin(_t * 0.18) * 400;
    const _entVx = -Math.sin(_t * 0.18) * 90;
    const _entVz =  Math.cos(_t * 0.18) * 72;
    const _entSpd = Math.sqrt(_entVx * _entVx + _entVz * _entVz);
    _slerp(this.renderedEnterprise,
      Math.atan2(-_entVx, -_entVz),
      -_entVx / Math.max(_entSpd, 1) * 0.10,
      0,
      0.05 * delta * 60
    );

    // Borg cube — slow tumble, drifting ominously
    this.renderedBorg.rotation.x  += 0.002 * delta * 60;
    this.renderedBorg.rotation.y  += 0.003 * delta * 60;
    this.renderedBorg.rotation.z  += 0.001 * delta * 60;
    this.renderedBorg.position.x   = 600 + Math.sin(_t * 0.1) * 150;
    this.renderedBorg.position.y   = 400 + Math.cos(_t * 0.12) * 60;

    // Millennium Falcon — fast erratic flight, nose faces travel direction
    this.renderedFalcon.position.x  = -500 + Math.cos(_t * 0.65) * 550;
    this.renderedFalcon.position.y  =  550 + Math.sin(_t * 0.85) * 160;
    this.renderedFalcon.position.z  = 3200 + Math.sin(_t * 0.5)  * 450;
    const _falVx  = -Math.sin(_t * 0.65) * 358;
    const _falVz  =  Math.cos(_t * 0.5)  * 225;
    const _falVy  =  Math.cos(_t * 0.85) * 136;
    const _falSpd = Math.sqrt(_falVx * _falVx + _falVz * _falVz);
    _slerp(this.renderedFalcon,
      Math.atan2(-_falVx, -_falVz),
      -_falVx / Math.max(_falSpd, 1) * 0.40,
      -Math.atan2(_falVy, Math.max(_falSpd, 1)) * 0.35,
      0.08 * delta * 60
    );

    // Imperial Star Destroyer — slow imposing arc, bow always cuts forward
    this.renderedISD.position.x  = 300 + Math.sin(_t * 0.07) * 350;
    this.renderedISD.position.y  = 250 + Math.cos(_t * 0.05) * 80;
    this.renderedISD.position.z  = 4700 + Math.cos(_t * 0.07) * 200;
    const _isdVx  = Math.cos(_t * 0.07) * 24.5;
    const _isdVz  = -Math.sin(_t * 0.07) * 14;
    const _isdSpd = Math.sqrt(_isdVx * _isdVx + _isdVz * _isdVz);
    _slerp(this.renderedISD,
      Math.atan2(-_isdVx, -_isdVz),
      -_isdVx / Math.max(_isdSpd, 1) * 0.04,
      0,
      0.025 * delta * 60
    );
  }

  // ── COMET — elliptical orbit, tails always point away from sun ─
  const _SX = 350, _SY = 300, _SZ = -900;
  const _ct  = _t * 0.032;
  const _cx  = -1200 + Math.cos(_ct) * 400;
  const _cy  =   975 + Math.sin(_ct * 0.3) * 120;
  const _cz  = -1400 + Math.sin(_ct) * 500;
  this.renderedComet.position.set(_cx, _cy, _cz);
  _tmpVec3.set(_cx - _SX, _cy - _SY, _cz - _SZ).normalize();
  _tmpQuat.setFromUnitVectors(_cometFwd, _tmpVec3);
  this.renderedComet.quaternion.copy(_tmpQuat);
  const _cl = this.renderedComet.userData.cometLight;
  if (_cl) _cl.intensity = 0.5 + Math.sin(_t * 3.2) * 0.18;

  // ── DEATH STAR (laser FX only — orbit + spin are registry-driven) ─
  const _dsRaw = Math.sin(_t * 0.08);
  const _dsFiring = _dsRaw > 0.92;

  const ll = this.renderedDeathStar.userData.laserLight;
  if (ll) ll.intensity = _dsFiring
    ? 4 + (_dsRaw - 0.92) * 150
    : 4 + Math.sin(_t * 1.8) * 2;

  const em = this.renderedDeathStar.userData.emitter;
  if (em) em.material.emissiveIntensity = _dsFiring
    ? 3.5 + (_dsRaw - 0.92) * 80
    : 3.5 + Math.sin(_t * 1.8) * 1.5;

  const beam = this.renderedDeathStar.userData.laserBeam;
  if (beam) beam.material.opacity = _dsFiring ? (_dsRaw - 0.92) * 8.75 : 0;
}

// ── Helpers ───────────────────────────────────────────────────────
const _tmpQuat   = new THREE.Quaternion();
const _tmpEuler  = new THREE.Euler();
const _tmpVec3   = new THREE.Vector3();
const _cometFwd  = new THREE.Vector3(0, 0, 1);

function _slerp(obj, ry, rz, rx, alpha) {
  _tmpEuler.set(rx, ry, rz, 'YXZ');
  _tmpQuat.setFromEuler(_tmpEuler);
  obj.quaternion.slerp(_tmpQuat, Math.min(1, alpha));
}

export { animate };
