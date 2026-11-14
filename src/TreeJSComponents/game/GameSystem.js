import * as THREE from "three";
import {
  leadPoint, aimError, scatter, knockBack, spawnDirection, stepBoost,
  bossStage, turnToward, onDish, bossHitDamage,
  stepStreak, streakMultiplier, waveClearBonus, hullBonus, accuracy,
} from "./combat";
import { explosionFlash, shockRing, muzzleOffset } from "./feel";

// Player
const FIRE_INTERVAL_S         = 0.3;
const LASER_SPEED             = 25;
const LASER_LIFETIME_S        = 2.0;
const LASER_POOL_SIZE         = 20;

// Enemy base
// Running into a ship: one hard knock, then thrown clear. Five of them, with
// no repairs between, lose a full hull.
const CONTACT_MARGIN          = 40;      // beyond the ship's own radius
const CONTACT_DAMAGE          = 0.2;
const KNOCK_BACK              = 320;
const RESPAWN_S               = 3.0;
// New ships arrive in front of the player or abeam, far enough to be seen coming
const SPAWN_DIST_MIN          = 1800;
const SPAWN_DIST_SPREAD       = 400;
const VICTORY_DELAY_S         = 2.0;

// Enemy combat
const ENEMY_FIRE_INTERVAL_S   = 1.5;
// Faster than the player cruises (20), slower than boost (44): standing off
// no longer dodges everything, and boost is the way out
const ENEMY_LASER_SPEED       = 26;
const ENEMY_LASER_LIFETIME_S  = 110 / 60;
const ENEMY_LASER_POOL_SIZE   = 30;
const ENEMY_COMBAT_RANGE      = 1200;
const ENEMY_LASER_DAMAGE      = 0.15;
const PLAYER_HIT_RADIUS       = 25;
const TARGET_REVAL_S          = 2.0;

// Player protection
const I_FRAME_S               = 0.75;
const FLASH_DURATION_S        = 15 / 60;

// Wave progression
const MAX_WAVE                = 8;
const KILLS_PER_WAVE          = 4;
const WAVE_FIRE_BONUS_S       = 8 / 60;
const WAVE_SPEED_BONUS        = 0.14;
const MIN_FIRE_INTERVAL_S     = 40 / 60;
const MAX_SPEED_MULT          = 2.0;

// Health pickups
const PICKUP_DROP_CHANCE      = 0.3;
const PICKUP_HEAL             = 0.25;
const PICKUP_LIFETIME_S       = 12;
const PICKUP_BLINK_S          = 3;    // blink during the final seconds before expiry
const PICKUP_RADIUS           = 60;   // fly-through collect distance
const PICKUP_POOL_SIZE        = 4;

// Per-wave enemy compositions (by enemy def id); wave MAX_WAVE is the boss fight
const WAVE_TABLE = [
  null,                                                  // index 0 unused
  ['spaceship', 'falcon'],                               // w1 — learn the controls
  ['spaceship', 'falcon', 'enterprise'],                 // w2 — artillery enters
  ['spaceship', 'falcon', 'borg'],                       // w3 — brawler enters
  ['spaceship', 'falcon', 'enterprise', 'borg'],         // w4
  ['falcon', 'enterprise', 'borg', 'isd'],               // w5 — heavy artillery
  ['spaceship', 'falcon', 'enterprise', 'borg', 'isd'],  // w6
  ['spaceship', 'falcon', 'enterprise', 'borg', 'isd'],  // w7 — max pressure
  ['deathStar', 'falcon', 'isd'],                        // w8 — BOSS + escorts
];

// Boss (Death Star, wave === MAX_WAVE)
const BOSS_HP                  = 30;
// The fight runs in three stages by health (combat.js: bossStage). Stage 1 has
// no superlaser; it wakes soon after stage 2 begins and fires faster in stage 3.
const BOSS_SUPERLASER_PERIOD_S = 9.0;
const BOSS_LAST_STAGE_PERIOD_S = 6.0;
const BOSS_FIRST_SHOT_S        = 3.0;
const BOSS_CHARGE_S            = 2.5;
// The beam follows the player instead of locking where they stood, at a turn
// rate a ship circling at cruise speed out-runs and one flying straight in or
// sitting still does not. It keeps dragging after them, slower, while it burns.
const BOSS_TRACK_RAD_PER_S     = 0.6;
const BOSS_SWEEP_RAD_PER_S     = 0.25;
const CRITICAL_SHOWN_S         = 0.8;
const BOSS_BEAM_ACTIVE_S       = 0.5;
const BOSS_BEAM_DAMAGE         = 0.5;
const BOSS_BEAM_RADIUS         = 70;
const BOSS_BEAM_LENGTH         = 3000;

// Ship behaviour
const ARTILLERY_PREFERRED_DIST = 700;
const ARTILLERY_MIN_DIST       = 350;
const STRAFE_FLIP_S            = 3.0;

// Feedback
const HIT_MARKER_S            = 0.18;    // a hit; a kill shows twice as long
const DAMAGE_FROM_S           = 1.2;     // how long the "hit from there" arc stays

// Explosions: sparks, a flash, a shock ring and tumbling debris, all pooled
const PARTICLE_POOL           = 200;
const PARTICLES_MAX_PER_BLAST = 60;
const BLAST_POOL              = 4;       // flashes and rings alive at once
const BLAST_FLASH_S           = 0.28;
const BLAST_RING_S            = 0.75;
const DEBRIS_POOL             = 60;
const DEBRIS_LIFE_S           = 2.2;

// Module-level scratch vectors — avoid per-frame heap allocations
const _sv1     = new THREE.Vector3();
const _sv2     = new THREE.Vector3();
const _sv3     = new THREE.Vector3();
const _FORWARD = new THREE.Vector3(0, 0, 1);
const _emMat   = new THREE.Matrix4();
const _emQuat  = new THREE.Quaternion();
const _emScale = new THREE.Vector3();

// A colour brighter than white can show: what the bloom pass picks up as glow
const glow = (hex, k) => {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return c;
};

// Material factories. init() and warmupMaterials() both use these, so the
// shaders compiled ahead of a game are exactly the ones the game will ask for.
const makeLaserMat         = () => new THREE.MeshBasicMaterial({ color: glow(0xff3300, 2.5) });
const makeRebelLaserMat    = () => new THREE.MeshBasicMaterial({ color: glow(0x00ccff, 2.5) });
const makeImperialLaserMat = () => new THREE.MeshBasicMaterial({ color: glow(0x00ff44, 2.5) });
const makeBlastFlashMat    = () => new THREE.MeshBasicMaterial({
  color: glow(0xffd9a0, 2), transparent: true, opacity: 0,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const makeBlastRingMat     = () => new THREE.MeshBasicMaterial({
  color: glow(0xffc27a, 1.5), transparent: true, opacity: 0, side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const makeDebrisMat        = () => new THREE.MeshStandardMaterial({
  color: 0x4a4744, roughness: 0.9, metalness: 0.2, flatShading: true,
});
const makePickupMat        = () => new THREE.MeshStandardMaterial({
  color: 0x22ff66, emissive: 0x22ff66, emissiveIntensity: 2,
});
const makeExplosionMat     = () => new THREE.MeshBasicMaterial({ color: 0xff6600 });
const makeFlashMat         = () => new THREE.MeshStandardMaterial({
  color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 3,
});
const makeBossBeamMat      = () => new THREE.MeshBasicMaterial({
  color: 0x66ff44, transparent: true, opacity: 0.85,
  blending: THREE.AdditiveBlending, depthWrite: false,
});

class GameSystem {
  // One of each material a game uses, for compiling shaders before the game
  // starts. The explosion is drawn instanced, which needs its own shader.
  static warmupMaterials() {
    return [
      { material: makeLaserMat() },
      { material: makeRebelLaserMat() },
      { material: makeImperialLaserMat() },
      { material: makePickupMat() },
      { material: makeExplosionMat(), instanced: true },
      { material: makeFlashMat() },
      { material: makeBossBeamMat() },
      { material: makeBlastFlashMat() },
      { material: makeBlastRingMat() },
      { material: makeDebrisMat(), instanced: true },
    ];
  }

  constructor(scene, camera, enemies, onHealthChange, onScoreChange, onGameOver, onPlayerHit, onKill) {
    this._scene          = scene;
    this._camera         = camera;
    this._enemyDefs      = enemies;
    this._onHealthChange = onHealthChange;
    this._onScoreChange  = onScoreChange;
    this._onGameOver     = onGameOver;
    this._onPlayerHit    = onPlayerHit || null;
    this._onKill         = onKill || null;

    this._health      = 1.0;
    this._score       = 0;
    this._dead        = false;
    this._firing      = false;
    this._autoFire    = false;
    this._fireTimer   = FIRE_INTERVAL_S; // pre-charged → first shot on press is instant
    this._iFrameTimer = 0;
    this._time        = 0.0;

    this._wave             = 1;
    this._waveKills        = 0;
    this._waveFireInterval = ENEMY_FIRE_INTERVAL_S;
    this._waveSpeedMult    = 1.0;

    this._lasers    = [];
    this._laserPool = [];
    this._laserGeo  = null;
    this._laserMat  = null;

    this._enemyLasers      = [];
    this._enemyLaserPool   = [];
    this._enemyLaserGeo    = null;
    this._rebelLaserMat    = null;
    this._imperialLaserMat = null;

    // No muzzle light: adding a light as the game starts recompiled every lit
    // shader (docs/decisions: the scene has two lights)

    this._shakeTimer     = 0;
    this._shakeIntensity = 0;

    this._paused         = false;
    this._onWaveComplete = null;
    // Seconds of game time until the victory screen; null when not counting
    this._victoryCountdown = null;

    // Boost runs off an energy bar (combat.js: stepBoost)
    this._boost = { energy: 1, locked: false, boosting: false };

    // The player's velocity (units per second), for enemy gunners to lead with
    this._playerVel     = { x: 0, y: 0, z: 0 };
    this._lastPlayerPos = null;

    this._pickups    = [];
    this._pickupPool = [];
    this._pickupGeo  = null;
    this._pickupMat  = null;

    this._boss          = null;
    this._bossPhase     = 'idle';
    this._bossTimer     = 0;
    this._bossAim       = { x: 0, y: 0, z: -1 };  // unit vector the superlaser points along
    this._bossStageSeen = 0;
    this._criticalTimer = 0;                     // > 0 just after a hit on the exposed dish
    this._bossBeamMesh  = null;
    this._bossBeamGeo   = null;
    this._bossBeamMat   = null;
    this._bossBeamHitDone = false;

    // The run, for the score and the end screen
    this._streak     = 0;
    this._bestStreak = 0;
    this._lastKillAt = null;   // game time of the player's last kill
    this._kills      = 0;
    this._shots      = 0;
    this._hits       = 0;
    this._hullBonus  = 0;

    // What the overlay shows of the last hit landed and the last hit taken
    this._hitMarker  = null;   // { timer, life, kill }
    this._damageFrom = null;   // { x, y, z (from the player), timer }

    this._blastFlashes = [];
    this._blastRings   = [];
    this._blasts       = [];   // { flash, ring, age, radius }
    this._blastGeo     = null;
    this._ringGeo      = null;
    this._debrisMesh   = null;
    this._debrisGeo    = null;
    this._debrisMat    = null;
    this._debrisSlots  = [];

    this._enemies       = [];
    this._explosions    = [];
    this._explosionMesh = null;
    this._explosionGeo  = null;
    this._explosionMat  = null;
    this._particleSlots = [];
  }

  init() {
    // A bolt is a streak: a bright head tapering to a tail (the head leads, +Z)
    this._laserGeo = new THREE.CylinderGeometry(1.7, 0.25, 70, 6);
    this._laserGeo.rotateX(Math.PI / 2);
    this._laserMat = makeLaserMat();

    for (let i = 0; i < LASER_POOL_SIZE; i++) {
      const m = new THREE.Mesh(this._laserGeo, this._laserMat);
      m.visible = false;
      this._scene.add(m);
      this._laserPool.push(m);
    }

    this._enemyLaserGeo    = new THREE.CylinderGeometry(1.4, 0.2, 54, 6);
    this._enemyLaserGeo.rotateX(Math.PI / 2);
    this._rebelLaserMat    = makeRebelLaserMat();
    this._imperialLaserMat = makeImperialLaserMat();

    for (let i = 0; i < ENEMY_LASER_POOL_SIZE; i++) {
      const m = new THREE.Mesh(this._enemyLaserGeo, this._rebelLaserMat);
      m.visible = false;
      this._scene.add(m);
      this._enemyLaserPool.push(m);
    }

    this._pickupGeo = new THREE.OctahedronGeometry(14);
    this._pickupMat = makePickupMat();
    for (let i = 0; i < PICKUP_POOL_SIZE; i++) {
      const m = new THREE.Mesh(this._pickupGeo, this._pickupMat);
      m.visible = false;
      this._scene.add(m);
      this._pickupPool.push(m);
    }

    this._explosionGeo  = new THREE.SphereGeometry(3, 4, 4);
    this._explosionMat  = makeExplosionMat();
    this._explosionMesh = new THREE.InstancedMesh(this._explosionGeo, this._explosionMat, PARTICLE_POOL);
    this._explosionMesh.count = PARTICLE_POOL;
    this._explosionMesh.frustumCulled = false; // its instances are all over the sky
    _emMat.makeScale(0, 0, 0);
    for (let i = 0; i < PARTICLE_POOL; i++) this._explosionMesh.setMatrixAt(i, _emMat);
    this._explosionMesh.instanceMatrix.needsUpdate = true;
    this._scene.add(this._explosionMesh);

    // The flash and the shock ring of a blast; each has its own material
    // because each fades on its own clock
    this._blastGeo = new THREE.SphereGeometry(1, 16, 12);
    this._ringGeo  = new THREE.RingGeometry(0.95, 1, 64);
    for (let i = 0; i < BLAST_POOL; i++) {
      const flash = new THREE.Mesh(this._blastGeo, makeBlastFlashMat());
      const ring  = new THREE.Mesh(this._ringGeo, makeBlastRingMat());
      flash.visible = false;
      ring.visible  = false;
      this._scene.add(flash);
      this._scene.add(ring);
      this._blastFlashes.push(flash);
      this._blastRings.push(ring);
    }

    // Tumbling wreckage: lit, lumpy rocks like the asteroid belt's
    this._debrisGeo  = new THREE.IcosahedronGeometry(1, 0);
    this._debrisMat  = makeDebrisMat();
    this._debrisMesh = new THREE.InstancedMesh(this._debrisGeo, this._debrisMat, DEBRIS_POOL);
    this._debrisMesh.count = DEBRIS_POOL;
    this._debrisMesh.frustumCulled = false;
    for (let i = 0; i < DEBRIS_POOL; i++) this._debrisMesh.setMatrixAt(i, _emMat);
    this._debrisMesh.instanceMatrix.needsUpdate = true;
    this._scene.add(this._debrisMesh);
    this._debrisSlots = Array.from({ length: DEBRIS_POOL }, () => ({
      life:     0,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      axis:     new THREE.Vector3(0, 1, 0),
      angle:    0,
      spin:     0,
      size:     1,
    }));

    this._particleSlots = Array.from({ length: PARTICLE_POOL }, () => ({
      inUse:     false,
      position:  new THREE.Vector3(),
      velocity:  new THREE.Vector3(),
      initScale: 1,
    }));

    this._enemies = this._enemyDefs.map((def) => {
      def.mesh.visible = false; // hidden until _applyWaveComposition activates them
      return {
        mesh:           def.mesh,
        id:             def.id,
        radius:         def.radius,
        faction:        def.faction    || 'rebel',
        hp:             def.hitsToKill || 4,
        maxHp:          def.hitsToKill || 4,
        speed:          def.speed      || 2,
        points:         def.points     || 100,
        behavior:       def.behavior   || 'brawler',
        alive:          false,
        activeInWave:   false,
        flashTimer:     0,
        flashMat:       makeFlashMat(),
        respawnTimer:   0,
        fireTimer:      Math.random() * ENEMY_FIRE_INTERVAL_S,
        target:         null,
        targetTimer:    0,
        strafeDir:      Math.random() < 0.5 ? 1 : -1,
        strafeDirTimer: Math.random() * STRAFE_FLIP_S,
        strafePhase:    Math.random() * Math.PI * 2,
      };
    });

    this._camera.position.set(0, 400, 3000);
    this._camera.rotation.set(0, 0, 0);

    this._applyWaveComposition(this._wave);
  }

  _applyWaveComposition(wave) {
    const ids = WAVE_TABLE[Math.min(wave, MAX_WAVE)] || WAVE_TABLE[MAX_WAVE];

    for (const enemy of this._enemies) {
      const shouldBeActive = ids.includes(enemy.id);

      if (shouldBeActive && !enemy.activeInWave) {
        enemy.activeInWave = true;
        this._respawnEnemy(enemy);
      } else if (!shouldBeActive && enemy.activeInWave) {
        // Deactivate silently — no explosion, no score
        enemy.activeInWave = false;
        enemy.alive        = false;
        enemy.mesh.visible = false;
      }
    }

    if (wave === MAX_WAVE) this._setupBoss();
  }

  _setupBoss() {
    const boss = this._enemies.find((e) => e.id === 'deathStar');
    if (!boss) return;
    this._boss      = boss;
    boss.hp         = BOSS_HP;
    boss.maxHp      = BOSS_HP;
    this._bossPhase = 'idle';
    this._bossTimer = BOSS_SUPERLASER_PERIOD_S;
    this._bossStageSeen = 1;

    if (!this._bossBeamMesh) {
      this._bossBeamGeo = new THREE.BoxGeometry(14, 14, BOSS_BEAM_LENGTH);
      this._bossBeamMat = makeBossBeamMat();
      this._bossBeamMesh = new THREE.Mesh(this._bossBeamGeo, this._bossBeamMat);
      this._bossBeamMesh.visible = false;
      this._scene.add(this._bossBeamMesh);
    }
  }

  update(delta = 1 / 60) {
    if (this._dead || this._paused) return;
    this._time += delta;
    this._trackPlayer(delta);

    // Counted in game time, so a pause holds the celebration too
    if (this._victoryCountdown !== null) {
      this._victoryCountdown -= delta;
      if (this._victoryCountdown <= 0) {
        this._victoryCountdown = null;
        this._triggerVictory();
        return;
      }
    }
    if (this._iFrameTimer > 0) this._iFrameTimer = Math.max(0, this._iFrameTimer - delta);
    if (this._muzzle && this._muzzle.timer > 0) this._muzzle.timer -= delta;
    if (this._hitMarker && (this._hitMarker.timer -= delta) <= 0) this._hitMarker = null;
    if (this._damageFrom && (this._damageFrom.timer -= delta) <= 0) this._damageFrom = null;

    this._fireTimer = Math.min(this._fireTimer + delta, FIRE_INTERVAL_S);
    if ((this._firing || this._autoFire) && this._fireTimer >= FIRE_INTERVAL_S) {
      this._spawnLaser();
      this._fireTimer = 0;
    }

    this._updateLasers(delta);
    this._updateEnemyFire(delta);
    this._updateEnemyLasers(delta);
    this._updateEnemies(delta);
    this._updateBoss(delta);
    this._updatePickups(delta);
    this._updateExplosions(delta);
  }

  _trackPlayer(delta) {
    const p = this._camera.position;
    const last = this._lastPlayerPos;
    if (last && delta > 0) {
      this._playerVel.x = (p.x - last.x) / delta;
      this._playerVel.y = (p.y - last.y) / delta;
      this._playerVel.z = (p.z - last.z) / delta;
    }
    this._lastPlayerPos = { x: p.x, y: p.y, z: p.z };
  }

  // Where a gunner aims to hit the player: ahead of them by the bolt's flight
  // time, thrown off by the crew's error for this wave.
  _aimAtPlayer(enemy) {
    const from = enemy.mesh.position;
    const lead = leadPoint(from, this._camera.position, this._playerVel, ENEMY_LASER_SPEED * 60);
    return scatter(from, lead, aimError(this._wave), Math.random);
  }

  // The player has flown into a ship.
  _bump(enemy) {
    if (this._iFrameTimer > 0) return;
    const p = this._camera.position;
    const k = knockBack(p, enemy.mesh.position, KNOCK_BACK);
    p.x += k.x; p.y += k.y; p.z += k.z;
    this._lastPlayerPos = null; // the shove is not the player's own speed
    this._damagePlayer(CONTACT_DAMAGE, true, enemy.mesh.position);
  }

  _spawnPoint() {
    const cam = this._camera.position;
    this._camera.getWorldDirection(_sv1);
    const d = spawnDirection(_sv1, Math.random);
    const dist = SPAWN_DIST_MIN + Math.random() * SPAWN_DIST_SPREAD;
    return { x: cam.x + d.x * dist, y: cam.y + d.y * dist, z: cam.z + d.z * dist };
  }

  // 1, 2 or 3 during the boss fight (combat.js: bossStage); 0 outside it
  get bossStage() {
    return this._boss ? bossStage(this._boss.hp, this._boss.maxHp) : 0;
  }

  // Unit vector from the boss to the player, as a plain object
  _towardPlayer() {
    const b = this._boss.mesh.position, p = this._camera.position;
    const x = p.x - b.x, y = p.y - b.y, z = p.z - b.z;
    const d = Math.sqrt(x * x + y * y + z * z) || 1;
    return { x: x / d, y: y / d, z: z / d };
  }

  _updateBoss(delta) {
    const boss = this._boss;
    if (!boss || !boss.alive || this._dead) return;
    if (this._criticalTimer > 0) this._criticalTimer = Math.max(0, this._criticalTimer - delta);

    const stage = this.bossStage;
    if (stage !== this._bossStageSeen) {
      // The superlaser wakes soon after the second stage begins
      if (this._bossStageSeen <= 1 && this._bossPhase === 'idle') {
        this._bossTimer = Math.min(this._bossTimer, BOSS_FIRST_SHOT_S);
      }
      this._bossStageSeen = stage;
    }
    if (stage === 1) return; // escorts and bolts only

    const ud = boss.mesh.userData;
    this._bossTimer -= delta;

    if (this._bossPhase === 'idle') {
      if (this._bossTimer <= 0) {
        this._bossPhase = 'charging';
        this._bossTimer = BOSS_CHARGE_S;
        this._bossAim   = this._towardPlayer();
        if (this._audio) this._audio.superlaserCharge();
      }
    } else if (this._bossPhase === 'charging') {
      this._bossAim = turnToward(this._bossAim, this._towardPlayer(), BOSS_TRACK_RAD_PER_S * delta);
      const t = 1 - Math.max(0, this._bossTimer) / BOSS_CHARGE_S;
      if (ud.emitter)    ud.emitter.material.emissiveIntensity = 3.5 + t * 16.5;
      if (this._bossTimer <= 0) {
        this._bossPhase       = 'firing';
        this._bossTimer       = BOSS_BEAM_ACTIVE_S;
        this._bossBeamHitDone = false;
        this._placeBeam();
        this._bossBeamMesh.visible = true;
        if (this._audio) this._audio.superlaserFire();
      }
    } else if (this._bossPhase === 'firing') {
      this._bossAim = turnToward(this._bossAim, this._towardPlayer(), BOSS_SWEEP_RAD_PER_S * delta);
      this._placeBeam();
      if (!this._bossBeamHitDone && this._beamTouchesPlayer()) {
        this._bossBeamHitDone = true;
        this._damagePlayer(BOSS_BEAM_DAMAGE, true, this._boss.mesh.position);
        if (this._dead) return;
      }
      if (this._bossTimer <= 0) {
        this._bossPhase = 'idle';
        this._bossTimer = stage === 3 ? BOSS_LAST_STAGE_PERIOD_S : BOSS_SUPERLASER_PERIOD_S;
        this._bossBeamMesh.visible = false;
        this._resetBossGlow();
      }
    }
  }

  // Whether the player is inside the beam: within its radius of the nearest
  // point on the segment from the boss along the aim.
  _beamTouchesPlayer() {
    const b = this._boss.mesh.position, p = this._camera.position, a = this._bossAim;
    const along = (p.x - b.x) * a.x + (p.y - b.y) * a.y + (p.z - b.z) * a.z;
    const t = Math.max(0, Math.min(BOSS_BEAM_LENGTH, along));
    const dx = p.x - (b.x + a.x * t), dy = p.y - (b.y + a.y * t), dz = p.z - (b.z + a.z * t);
    return dx * dx + dy * dy + dz * dz < BOSS_BEAM_RADIUS * BOSS_BEAM_RADIUS;
  }

  // Lays the beam mesh from the boss along the aim
  _placeBeam() {
    const a = this._bossAim;
    _sv1.set(a.x, a.y, a.z);
    this._bossBeamMesh.position.copy(this._boss.mesh.position).addScaledVector(_sv1, BOSS_BEAM_LENGTH / 2);
    this._bossBeamMesh.quaternion.setFromUnitVectors(_FORWARD, _sv1);
  }

  // Which way the boss's dish looks, in the world; null for a boss without one
  _dishDir() {
    const boss = this._boss;
    const axis = boss && boss.mesh.userData && boss.mesh.userData.dishAxis;
    if (!axis) return null;
    _sv2.copy(axis).applyQuaternion(boss.mesh.quaternion);
    return { x: _sv2.x, y: _sv2.y, z: _sv2.z };
  }

  // Turns the boss so its dish looks at the player, or down the beam while
  // the superlaser is charging or burning
  _faceDish(boss, delta) {
    const dir = this._bossPhase === 'idle' ? this._towardPlayer() : this._bossAim;
    _sv1.set(dir.x, dir.y, dir.z);
    _lookQuat.setFromUnitVectors(boss.mesh.userData.dishAxis, _sv1);
    const rate = this._bossPhase === 'idle' ? 0.05 : 0.25;
    boss.mesh.quaternion.slerp(_lookQuat, Math.min(1, rate * delta * 60));
  }

  // How much a player's hit at `position` takes off the boss
  _bossDamageAt(position) {
    const dishDir = this._dishDir();
    return bossHitDamage({
      stage:    this.bossStage,
      charging: this._bossPhase === 'charging',
      dish:     !!dishDir && onDish(position, this._boss.mesh.position, dishDir),
    });
  }

  // In the last stage the boss has no reinforcements left to send
  _escortsSpent() {
    return this.bossStage === 3;
  }

  _resetBossGlow() {
    const ud = this._boss && this._boss.mesh.userData;
    if (!ud) return;
    if (ud.emitter)    ud.emitter.material.emissiveIntensity = 3.5;
  }

  _spawnPickup(position) {
    const mesh = this._pickupPool.pop();
    if (!mesh) return;
    mesh.position.copy(position);
    mesh.visible = true;
    this._pickups.push({ mesh, life: 0, baseY: position.y });
  }

  _updatePickups(delta) {
    for (let i = this._pickups.length - 1; i >= 0; i--) {
      const p = this._pickups[i];
      p.life += delta;
      p.mesh.rotation.y    += 2 * delta;
      p.mesh.position.y     = p.baseY + Math.sin(this._time * 3) * 8;

      const expiring = p.life > PICKUP_LIFETIME_S - PICKUP_BLINK_S;
      p.mesh.visible = !expiring || Math.sin(this._time * 12) > 0;

      let remove = p.life > PICKUP_LIFETIME_S;

      if (!remove && p.mesh.position.distanceTo(this._camera.position) < PICKUP_RADIUS) {
        this._health = Math.min(1, this._health + PICKUP_HEAL);
        this._onHealthChange(this._health, this._wave);
        if (this._audio) this._audio.pickup();
        remove = true;
      }

      if (remove) {
        p.mesh.visible = false;
        this._pickupPool.push(p.mesh);
        this._pickups.splice(i, 1);
      }
    }
  }

  _spawnLaser() {
    if (this._lasers.length >= LASER_POOL_SIZE) return;
    const mesh = this._laserPool.pop();
    if (!mesh) return;

    this._camera.getWorldDirection(_sv1);
    mesh.position.copy(this._camera.position).addScaledVector(_sv1, 30);
    // The two guns take turns: the bolt leaves from beside and below the view
    const gun = muzzleOffset(this._shots);
    if (this._camera.matrixWorld) {
      _sv2.setFromMatrixColumn(this._camera.matrixWorld, 0);
      mesh.position.addScaledVector(_sv2, gun.right);
      _sv2.setFromMatrixColumn(this._camera.matrixWorld, 1);
      mesh.position.addScaledVector(_sv2, gun.up);
    }
    mesh.quaternion.setFromUnitVectors(_FORWARD, _sv1);
    mesh.visible = true;
    this._muzzle = { side: Math.sign(gun.right), timer: 0.06 };

    this._shots++;
    if (this._audio) this._audio.laserFire();

    this._lasers.push({ mesh, velocity: _sv1.clone().multiplyScalar(LASER_SPEED), life: 0 });
  }

  _updateLasers(delta = 1 / 60) {
    for (let i = this._lasers.length - 1; i >= 0; i--) {
      const laser = this._lasers[i];
      laser.mesh.position.addScaledVector(laser.velocity, delta * 60);
      laser.life += delta;

      let remove = laser.life > LASER_LIFETIME_S;

      if (!remove) {
        for (const enemy of this._enemies) {
          if (!enemy.alive) continue;
          if (laser.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius * 1.15) {
            this._hits++;
            if (enemy === this._boss) {
              const damage = this._bossDamageAt(laser.mesh.position);
              if (damage > 1) this._criticalTimer = CRITICAL_SHOWN_S;
              this._hitEnemy(enemy, true, damage);
            } else {
              this._hitEnemy(enemy, true);
            }
            // The crosshair ticks and the hit is heard; a kill, more so
            const kill = !enemy.alive;
            const life = kill ? HIT_MARKER_S * 2 : HIT_MARKER_S;
            this._hitMarker = { timer: life, life, kill };
            if (this._audio && this._audio.hitConfirm) this._audio.hitConfirm(kill);
            remove = true;
            break;
          }
        }
      }

      if (remove) {
        laser.mesh.visible = false;
        this._laserPool.push(laser.mesh);
        this._lasers.splice(i, 1);
      }
    }
  }

  _selectTarget(enemy) {
    let nearestEnemy = null;
    let nearestDist  = Infinity;

    for (const other of this._enemies) {
      if (!other.alive || other === enemy || other.faction === enemy.faction) continue;
      const dist = enemy.mesh.position.distanceTo(other.mesh.position);
      if (dist < ENEMY_COMBAT_RANGE && dist < nearestDist) {
        nearestDist  = dist;
        nearestEnemy = other;
      }
    }

    if (nearestEnemy && Math.random() < 0.7) return { type: 'enemy', ref: nearestEnemy };
    return { type: 'player' };
  }

  _updateEnemyFire(delta = 1 / 60) {
    for (const enemy of this._enemies) {
      if (!enemy.alive) continue;

      enemy.targetTimer -= delta;
      if (enemy.targetTimer <= 0) {
        enemy.target      = this._selectTarget(enemy);
        enemy.targetTimer = TARGET_REVAL_S;
      }

      enemy.fireTimer -= delta;
      if (enemy.fireTimer <= 0) {
        this._spawnEnemyLaser(enemy);
        const jitter = (Math.random() - 0.5) * 0.5;
        enemy.fireTimer = this._waveFireInterval + jitter;
      }
    }
  }

  _spawnEnemyLaser(enemy) {
    const mesh = this._enemyLaserPool.pop();
    if (!mesh) return;

    if (enemy.target && enemy.target.type === 'enemy' && enemy.target.ref.alive) {
      _sv1.subVectors(enemy.target.ref.mesh.position, enemy.mesh.position).normalize();
    } else {
      const aim = this._aimAtPlayer(enemy);
      const from = enemy.mesh.position;
      _sv1.set(aim.x - from.x, aim.y - from.y, aim.z - from.z).normalize();
    }
    mesh.position.copy(enemy.mesh.position).addScaledVector(_sv1, enemy.radius + 10);
    mesh.quaternion.setFromUnitVectors(_FORWARD, _sv1);
    mesh.material = enemy.faction === 'rebel' ? this._rebelLaserMat : this._imperialLaserMat;
    mesh.visible  = true;

    this._enemyLasers.push({
      mesh,
      velocity:       _sv1.clone().multiplyScalar(ENEMY_LASER_SPEED),
      life:           0,
      shooterFaction: enemy.faction,
      // Where it was fired from, to show the player which way a hit came
      origin:         { x: enemy.mesh.position.x, y: enemy.mesh.position.y, z: enemy.mesh.position.z },
    });
  }

  _updateEnemyLasers(delta = 1 / 60) {
    for (let i = this._enemyLasers.length - 1; i >= 0; i--) {
      const laser = this._enemyLasers[i];
      laser.mesh.position.addScaledVector(laser.velocity, delta * 60);
      laser.life += delta;

      let remove = laser.life > ENEMY_LASER_LIFETIME_S;

      if (!remove) {
        if (laser.mesh.position.distanceTo(this._camera.position) < PLAYER_HIT_RADIUS) {
          this._damagePlayer(ENEMY_LASER_DAMAGE, true, laser.origin);
          remove = true;
        } else {
          for (const enemy of this._enemies) {
            if (!enemy.alive || enemy.faction === laser.shooterFaction) continue;
            if (laser.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius * 1.15) {
              this._hitEnemy(enemy, false);
              remove = true;
              break;
            }
          }
        }
      }

      if (remove) {
        laser.mesh.visible = false;
        this._enemyLaserPool.push(laser.mesh);
        this._enemyLasers.splice(i, 1);
      }
    }
  }

  // isLaser=true → a hit (bolt, beam or collision): i-frames and the hit callback
  // `from` is where the hit came from (a world position), when there is one
  _damagePlayer(amount, isLaser = false, from = null) {
    if (isLaser) {
      if (this._iFrameTimer > 0) return;
      if (from) {
        const p = this._camera.position;
        this._damageFrom = { x: from.x - p.x, y: from.y - p.y, z: from.z - p.z, timer: DAMAGE_FROM_S };
      }
      this._iFrameTimer    = I_FRAME_S;
      this._shakeTimer     = 1.0;   // normalized [0..1], decayed in ViewGL
      this._shakeIntensity = 8;
      if (this._audio) this._audio.playerHit();
      if (this._onPlayerHit) this._onPlayerHit();
    }
    this._health = this._health - amount;
    if (this._health < 1e-6) this._health = 0; // five hits of 0.2 must add up to a full hull
    this._onHealthChange(this._health, this._wave);
    if (this._health <= 0) this._triggerGameOver();
  }

  // byPlayer=false is another ship's fire: it wounds and can kill, but the kill
  // is not the player's, and the boss only falls to the player.
  _hitEnemy(enemy, byPlayer = true, damage = 1) {
    if (!byPlayer && enemy === this._boss) return;
    enemy.hp -= damage;
    enemy.flashTimer = FLASH_DURATION_S;
    enemy.flashMat.emissiveIntensity = 3;

    // Light sources keep their own material: shader-material plumes, whose
    // uniforms the animation loop writes every frame, and the engines and
    // emitters tagged keepMaterialOnHit, whose emissive pulse would otherwise
    // land on the shared flash material and drive the whole ship's flash.
    enemy.mesh.traverse((child) => {
      if (child.isMesh && !child.material?.isShaderMaterial && !child.userData?.keepMaterialOnHit) {
        if (!child._origMat) child._origMat = child.material;
        child.material = enemy.flashMat;
      }
    });

    if (enemy.hp <= 0) this._destroyEnemy(enemy, byPlayer);
  }

  _destroyEnemy(enemy, byPlayer = true) {
    enemy.alive        = false;
    enemy.mesh.visible = false;
    enemy.respawnTimer = RESPAWN_S;

    for (const e of this._enemies) {
      if (e.target && e.target.type === 'enemy' && e.target.ref === enemy) {
        e.target = null;
        e.targetTimer = 0;
      }
    }

    this._spawnExplosion(enemy.mesh.position.clone(), enemy.radius);
    if (this._audio) this._audio.explosion();

    // A ship shot down by its enemies is gone for a while, but it is not the
    // player's kill: no points, no streak, no progress through the wave
    if (!byPlayer) return;

    // Kills in quick succession are a streak, and a streak pays
    this._kills++;
    this._streak = stepStreak(this._streak, this._lastKillAt === null ? null : this._time - this._lastKillAt);
    this._lastKillAt = this._time;
    this._bestStreak = Math.max(this._bestStreak, this._streak);
    const multiplier = streakMultiplier(this._streak);
    const points     = Math.round(enemy.points * multiplier);

    this._score += points;
    this._onScoreChange(this._score);
    if (this._onKill) this._onKill(points, this._streak, multiplier);

    if (enemy !== this._boss && Math.random() < PICKUP_DROP_CHANCE) {
      this._spawnPickup(enemy.mesh.position);
    }

    // Boss wave: escorts don't advance the wave (and come back until the
    // last stage) — killing the boss is the only way to finish.
    if (this._wave === MAX_WAVE) {
      if (enemy === this._boss) {
        enemy.activeInWave = false; // boss never respawns
        if (this._bossBeamMesh) this._bossBeamMesh.visible = false;
        this._resetBossGlow();
        this._victoryCountdown = VICTORY_DELAY_S;
      }
      return;
    }

    this._waveKills++;
    if (this._waveKills >= KILLS_PER_WAVE) {
      this._waveKills        = 0;
      const completedWave    = this._wave;
      this._wave++;
      this._waveFireInterval = Math.max(MIN_FIRE_INTERVAL_S, this._waveFireInterval - WAVE_FIRE_BONUS_S);
      this._waveSpeedMult    = Math.min(MAX_SPEED_MULT, this._waveSpeedMult + WAVE_SPEED_BONUS);
      const bonus = waveClearBonus(completedWave);
      this._score += bonus;
      this._onScoreChange(this._score);
      this._onHealthChange(this._health, this._wave);
      if (this._audio) this._audio.waveComplete();
      if (this._onWaveComplete) this._onWaveComplete(completedWave, bonus);
      this._applyWaveComposition(this._wave);
    }
  }

  _spawnExplosion(position, shipRadius = 50) {
    const scale     = shipRadius / 50;
    const count     = Math.min(PARTICLES_MAX_PER_BLAST, Math.floor(20 + scale * 25));
    const speed     = 10 + scale * 8;
    const maxLife   = (40 + scale * 25) / 60;
    const initScale = 0.5 + scale;

    const particles = [];
    for (let i = 0; i < this._particleSlots.length && particles.length < count; i++) {
      const slot = this._particleSlots[i];
      if (slot.inUse) continue;
      slot.inUse = true;
      slot.initScale = initScale;
      slot.position.copy(position);
      slot.velocity.set(
        (Math.random() - 0.5) * speed * 2,
        (Math.random() - 0.5) * speed * 2,
        (Math.random() - 0.5) * speed * 2
      );
      _emMat.makeScale(initScale, initScale, initScale);
      _emMat.setPosition(position.x, position.y, position.z);
      this._explosionMesh.setMatrixAt(i, _emMat);
      particles.push(i);
    }

    if (particles.length > 0) {
      this._explosionMesh.instanceMatrix.needsUpdate = true;
      this._explosions.push({ particles, life: 0, maxLife });
    }

    // The flash and the shock ring; with every pair busy the oldest is reused
    let blast = this._blasts.length < this._blastFlashes.length ? null : this._blasts.shift();
    if (!blast) {
      const busy  = new Set(this._blasts.map((b) => b.flash));
      const index = this._blastFlashes.findIndex((m) => !busy.has(m));
      if (index >= 0) blast = { flash: this._blastFlashes[index], ring: this._blastRings[index] };
    }
    if (blast) {
      blast.age    = 0;
      blast.radius = shipRadius;
      blast.flash.position.copy(position);
      blast.ring.position.copy(position);
      blast.flash.visible = true;
      blast.ring.visible  = true;
      this._blasts.push(blast);
      this._poseBlast(blast);
    }

    // Wreckage thrown clear, tumbling
    let pieces = Math.round(5 + scale * 4);
    for (const slot of this._debrisSlots) {
      if (pieces === 0) break;
      if (slot.life > 0) continue;
      pieces--;
      slot.life = DEBRIS_LIFE_S * (0.6 + Math.random() * 0.4);
      slot.position.copy(position);
      slot.velocity.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize().multiplyScalar(speed * (0.4 + Math.random() * 0.6));
      slot.axis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      slot.angle = 0;
      slot.spin  = 2 + Math.random() * 6;
      slot.size  = (2 + Math.random() * 4) * (0.6 + scale * 0.4);
    }
  }

  _poseBlast(blast) {
    const flash = explosionFlash(blast.age, BLAST_FLASH_S);
    const ring  = shockRing(blast.age, BLAST_RING_S);
    blast.flash.scale.setScalar(Math.max(0.001, flash.scale * blast.radius * 1.8));
    blast.flash.material.opacity = flash.opacity;
    blast.flash.visible = blast.age < BLAST_FLASH_S;
    blast.ring.scale.setScalar(Math.max(0.001, ring.scale * blast.radius * 4.5));
    blast.ring.material.opacity = ring.opacity * 0.55;
    blast.ring.quaternion.copy(this._camera.quaternion); // always face-on
    blast.ring.visible = blast.age < BLAST_RING_S;
  }

  _updateExplosions(delta = 1 / 60) {
    const drag = Math.pow(0.92, delta * 60);
    let dirty = false;

    for (let i = this._explosions.length - 1; i >= 0; i--) {
      const ex = this._explosions[i];
      ex.life += delta;
      const decay = 1 - ex.life / ex.maxLife;

      for (const idx of ex.particles) {
        const slot = this._particleSlots[idx];
        slot.position.addScaledVector(slot.velocity, delta * 60);
        slot.velocity.multiplyScalar(drag);
        const s = Math.max(0.001, decay * slot.initScale);
        _emMat.makeScale(s, s, s);
        _emMat.setPosition(slot.position.x, slot.position.y, slot.position.z);
        this._explosionMesh.setMatrixAt(idx, _emMat);
        dirty = true;
      }

      if (ex.life > ex.maxLife) {
        _emMat.makeScale(0, 0, 0);
        for (const idx of ex.particles) {
          this._explosionMesh.setMatrixAt(idx, _emMat);
          this._particleSlots[idx].inUse = false;
        }
        this._explosions.splice(i, 1);
      }
    }

    if (dirty) this._explosionMesh.instanceMatrix.needsUpdate = true;

    for (let i = this._blasts.length - 1; i >= 0; i--) {
      const blast = this._blasts[i];
      blast.age += delta;
      this._poseBlast(blast);
      if (blast.age >= BLAST_RING_S) this._blasts.splice(i, 1);
    }

    let debrisDirty = false;
    for (let i = 0; i < this._debrisSlots.length; i++) {
      const slot = this._debrisSlots[i];
      if (slot.life <= 0) continue;
      slot.life -= delta;
      slot.position.addScaledVector(slot.velocity, delta * 60);
      slot.angle += slot.spin * delta;
      // Shrinks away over its last half second
      const size = slot.life <= 0 ? 0 : slot.size * Math.min(1, slot.life / 0.5);
      _emQuat.setFromAxisAngle(slot.axis, slot.angle);
      _emScale.setScalar(size);
      _emMat.compose(slot.position, _emQuat, _emScale);
      this._debrisMesh.setMatrixAt(i, _emMat);
      debrisDirty = true;
    }
    if (debrisDirty) this._debrisMesh.instanceMatrix.needsUpdate = true;
  }

  _respawnEnemy(enemy) {
    const p = this._spawnPoint();
    enemy.mesh.position.set(p.x, p.y, p.z);

    enemy.hp           = enemy.maxHp;
    enemy.alive        = true;
    enemy.mesh.visible = true;
    enemy.target       = null;
    enemy.targetTimer  = 0;
    enemy.flashTimer   = 0;
    enemy.mesh.traverse((child) => {
      if (child.isMesh && child._origMat) {
        child.material = child._origMat;
        delete child._origMat;
      }
    });
  }

  _moveArtillery(enemy, targetPos, speed, delta) {
    enemy.strafeDirTimer -= delta;
    if (enemy.strafeDirTimer <= 0) {
      enemy.strafeDir     *= -1;
      enemy.strafeDirTimer = STRAFE_FLIP_S + Math.random() * 1.0;
    }

    const dist = enemy.mesh.position.distanceTo(targetPos);

    if (dist < ARTILLERY_MIN_DIST) {
      _sv1.subVectors(enemy.mesh.position, targetPos).normalize();
    } else if (dist > ARTILLERY_PREFERRED_DIST) {
      _sv1.subVectors(targetPos, enemy.mesh.position).normalize();
    } else {
      _sv2.subVectors(targetPos, enemy.mesh.position).normalize();
      _sv1.set(-_sv2.z, 0, _sv2.x).multiplyScalar(enemy.strafeDir);
    }

    enemy.mesh.position.addScaledVector(_sv1, speed * 0.7 * delta * 60);
  }

  _moveSkirmisher(enemy, targetPos, speed, delta) {
    _sv1.subVectors(targetPos, enemy.mesh.position).normalize(); // toTarget
    _sv2.set(-_sv1.z, 0, _sv1.x);                              // lateral
    const drift = Math.sin(this._time * 2.4 + enemy.strafePhase) * 0.6;
    _sv3.copy(_sv1).addScaledVector(_sv2, drift).normalize();   // moveDir
    enemy.mesh.position.addScaledVector(_sv3, speed * delta * 60);
  }

  _updateEnemies(delta = 1 / 60) {
    const playerPos = this._camera.position;

    for (const enemy of this._enemies) {
      if (!enemy.alive) {
        if (!enemy.activeInWave) continue; // benched this wave — no respawn
        if (enemy !== this._boss && this._escortsSpent()) continue;
        enemy.respawnTimer -= delta;
        if (enemy.respawnTimer <= 0) this._respawnEnemy(enemy);
        continue;
      }

      const targetPos = (enemy.target && enemy.target.type === 'enemy' && enemy.target.ref.alive)
        ? enemy.target.ref.mesh.position
        : playerPos;

      const effectiveSpeed = enemy.speed * this._waveSpeedMult;

      if (enemy.behavior === 'artillery') {
        this._moveArtillery(enemy, targetPos, effectiveSpeed, delta);
      } else if (enemy.behavior === 'skirmisher') {
        this._moveSkirmisher(enemy, targetPos, effectiveSpeed, delta);
      } else {
        _sv1.subVectors(targetPos, enemy.mesh.position).normalize();
        enemy.mesh.position.addScaledVector(_sv1, effectiveSpeed * delta * 60);
      }

      if (enemy === this._boss && enemy.mesh.userData && enemy.mesh.userData.dishAxis) {
        this._faceDish(enemy, delta);
      } else {
        _lookAt(enemy.mesh, targetPos, delta);
      }

      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist < enemy.radius + CONTACT_MARGIN) {
        this._bump(enemy);
        if (this._dead) return;
      }
      if (dist > 4500) {
        this._respawnEnemy(enemy);
        continue;
      }

      if (enemy.flashTimer > 0) {
        enemy.flashTimer = Math.max(0, enemy.flashTimer - delta);
        enemy.flashMat.emissiveIntensity = (enemy.flashTimer / FLASH_DURATION_S) * 3;
        if (enemy.flashTimer === 0) {
          enemy.mesh.traverse((child) => {
            if (child.isMesh && child._origMat) {
              child.material = child._origMat;
              delete child._origMat;
            }
          });
        }
      }
    }
  }

  _triggerGameOver() {
    if (this._dead) return;
    this._dead = true;
    if (document.exitPointerLock) document.exitPointerLock();
    if (this._audio) this._audio.gameOver();
    this._onGameOver(this._score, false, this.stats());
  }

  _triggerVictory() {
    if (this._dead) return;
    this._dead = true;
    if (document.exitPointerLock) document.exitPointerLock();
    if (this._audio) this._audio.waveComplete();
    this._hullBonus = hullBonus(this._health);
    this._score += this._hullBonus;
    this._onGameOver(this._score, true, this.stats());
  }

  // How the run went, for the end screen
  stats() {
    return {
      wave:       this._wave,
      kills:      this._kills,
      shots:      this._shots,
      hits:       this._hits,
      accuracy:   accuracy(this._shots, this._hits),
      timeS:      Math.round(this._time),
      bestStreak: this._bestStreak,
      hullBonus:  this._hullBonus,
    };
  }

  // Called every frame with whether the player is asking for boost; says
  // whether they get it.
  boost(wants, delta) {
    this._boost = stepBoost(this._boost, wants, delta);
    return this._boost.boosting;
  }

  // The last hit the player landed, for the crosshair: null once it has faded
  get hitMarker() {
    const m = this._hitMarker;
    return m ? { strength: m.timer / m.life, kill: m.kill } : null;
  }

  // Where the last hit on the player came from (a vector from the player),
  // fading: null once it has gone
  get damageFrom() {
    const d = this._damageFrom;
    return d ? { x: d.x, y: d.y, z: d.z, strength: d.timer / DAMAGE_FROM_S } : null;
  }

  // -1 or 1 for the gun that has just fired, 0 otherwise
  get muzzleFlash() {
    return this._muzzle && this._muzzle.timer > 0 ? this._muzzle.side : 0;
  }

  get boostEnergy() { return this._boost.energy; }
  get boostLocked() { return this._boost.locked; }

  pause()  { this._paused = true;  }
  resume() { this._paused = false; }

  setFiring(v) { this._firing = !!v; }

  setAutoFire(v) { this._autoFire = !!v; }

  cleanup() {
    this._victoryCountdown = null;

    for (const laser of this._lasers) {
      laser.mesh.visible = false;
      this._laserPool.push(laser.mesh);
    }
    this._lasers = [];
    for (const mesh of this._laserPool) this._scene.remove(mesh);
    this._laserPool = [];
    if (this._laserGeo) { this._laserGeo.dispose(); this._laserGeo = null; }
    if (this._laserMat) { this._laserMat.dispose(); this._laserMat = null; }

    for (const laser of this._enemyLasers) {
      laser.mesh.visible = false;
      this._enemyLaserPool.push(laser.mesh);
    }
    this._enemyLasers = [];
    for (const mesh of this._enemyLaserPool) this._scene.remove(mesh);
    this._enemyLaserPool = [];
    if (this._enemyLaserGeo)    { this._enemyLaserGeo.dispose();    this._enemyLaserGeo    = null; }
    if (this._rebelLaserMat)    { this._rebelLaserMat.dispose();    this._rebelLaserMat    = null; }
    if (this._imperialLaserMat) { this._imperialLaserMat.dispose(); this._imperialLaserMat = null; }

    for (const p of this._pickups) {
      p.mesh.visible = false;
      this._pickupPool.push(p.mesh);
    }
    this._pickups = [];
    for (const mesh of this._pickupPool) this._scene.remove(mesh);
    this._pickupPool = [];
    if (this._pickupGeo) { this._pickupGeo.dispose(); this._pickupGeo = null; }
    if (this._pickupMat) { this._pickupMat.dispose(); this._pickupMat = null; }

    if (this._boss) this._resetBossGlow();
    this._boss = null;
    if (this._bossBeamMesh) { this._scene.remove(this._bossBeamMesh); this._bossBeamMesh = null; }
    if (this._bossBeamGeo)  { this._bossBeamGeo.dispose(); this._bossBeamGeo = null; }
    if (this._bossBeamMat)  { this._bossBeamMat.dispose(); this._bossBeamMat = null; }

    for (const mesh of [...this._blastFlashes, ...this._blastRings]) {
      this._scene.remove(mesh);
      mesh.material.dispose();
    }
    this._blastFlashes = [];
    this._blastRings   = [];
    this._blasts       = [];
    if (this._blastGeo) { this._blastGeo.dispose(); this._blastGeo = null; }
    if (this._ringGeo)  { this._ringGeo.dispose();  this._ringGeo  = null; }
    this._debrisSlots = [];
    if (this._debrisMesh) { this._scene.remove(this._debrisMesh); this._debrisMesh = null; }
    if (this._debrisGeo)  { this._debrisGeo.dispose(); this._debrisGeo = null; }
    if (this._debrisMat)  { this._debrisMat.dispose(); this._debrisMat = null; }

    this._explosions    = [];
    this._particleSlots = [];
    if (this._explosionMesh) { this._scene.remove(this._explosionMesh); this._explosionMesh = null; }
    if (this._explosionGeo)  { this._explosionGeo.dispose();  this._explosionGeo  = null; }
    if (this._explosionMat)  { this._explosionMat.dispose();  this._explosionMat  = null; }

    for (const enemy of this._enemies) {
      if (enemy.flashMat) enemy.flashMat.dispose();
      enemy.mesh.visible = true;
      enemy.mesh.traverse((child) => {
        if (child.isMesh && child._origMat) {
          child.material = child._origMat;
          delete child._origMat;
        }
      });
    }
    this._enemies = [];
  }
}

// ── Module-level reuse objects for smooth enemy rotation ─────────────
const _lookMat  = new THREE.Matrix4();
const _lookQuat = new THREE.Quaternion();
const _up       = new THREE.Vector3(0, 1, 0);

function _lookAt(obj, target, delta) {
  _lookMat.lookAt(obj.position, target, _up);
  _lookQuat.setFromRotationMatrix(_lookMat);
  obj.quaternion.slerp(_lookQuat, Math.min(1, 0.08 * delta * 60));
}

export { GameSystem };
