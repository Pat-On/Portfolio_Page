import * as THREE from "three";

// Player
const LASER_INTERVAL          = 25;
const LASER_SPEED             = 25;
const LASER_LIFETIME          = 120;
const LASER_POOL_SIZE         = 20;

// Enemy base
const ENEMY_DAMAGE_RADIUS     = 150;
const ENEMY_DAMAGE_PER_FRAME  = 0.3;
const RESPAWN_FRAMES          = 180;

// Enemy combat
const ENEMY_FIRE_INTERVAL     = 90;
const ENEMY_LASER_SPEED       = 18;
const ENEMY_LASER_LIFETIME    = 160;
const ENEMY_LASER_POOL_SIZE   = 30;
const ENEMY_COMBAT_RANGE      = 1200;
const ENEMY_LASER_DAMAGE      = 0.15;
const PLAYER_HIT_RADIUS       = 25;
const TARGET_REVAL_FRAMES     = 120;

// Player protection
const I_FRAME_DURATION        = 45;

// Wave progression
const MAX_WAVE                = 10;
const KILLS_PER_WAVE          = 6;
const WAVE_FIRE_BONUS         = 8;
const WAVE_SPEED_BONUS        = 0.12;
const MIN_FIRE_INTERVAL       = 40;
const MAX_SPEED_MULT          = 2.0;

// Ship behaviour
const ARTILLERY_PREFERRED_DIST = 700;
const ARTILLERY_MIN_DIST       = 350;
const STRAFE_FLIP_INTERVAL     = 180;

class GameSystem {
  constructor(scene, camera, enemies, onHealthChange, onScoreChange, onGameOver, onPlayerHit, onKill) {
    this._scene          = scene;
    this._camera         = camera;
    this._enemyDefs      = enemies;
    this._onHealthChange = onHealthChange;
    this._onScoreChange  = onScoreChange;
    this._onGameOver     = onGameOver;
    this._onPlayerHit    = onPlayerHit || null;
    this._onKill         = onKill || null;

    this._health     = 1.0;
    this._score      = 0;
    this._dead       = false;
    this._fireTimer  = 0;
    this._iFrameTimer = 0;
    this._frame      = 0;

    this._wave             = 1;
    this._waveKills        = 0;
    this._waveFireInterval = ENEMY_FIRE_INTERVAL;
    this._waveSpeedMult    = 1.0;

    this._lasers    = [];
    this._laserPool = [];
    this._laserGeo  = null;
    this._laserMat  = null;

    this._enemyLasers     = [];
    this._enemyLaserPool  = [];
    this._enemyLaserGeo   = null;
    this._rebelLaserMat   = null;
    this._imperialLaserMat = null;

    this._muzzleLight = null;
    this._muzzleTimer = 0;

    this._shakeTimer     = 0;
    this._shakeIntensity = 0;

    this._paused         = false;
    this._onWaveComplete = null;

    this._enemies       = [];
    this._explosions    = [];
    this._explosionPool = [];
    this._explosionGeo  = null;
    this._explosionMat  = null;
  }

  init() {
    this._laserGeo = new THREE.BoxGeometry(2, 2, 40);
    this._laserMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    this._muzzleLight = new THREE.PointLight(0xffaa22, 0, 200);
    this._scene.add(this._muzzleLight);

    for (let i = 0; i < LASER_POOL_SIZE; i++) {
      const m = new THREE.Mesh(this._laserGeo, this._laserMat);
      m.visible = false;
      this._scene.add(m);
      this._laserPool.push(m);
    }

    this._enemyLaserGeo    = new THREE.BoxGeometry(1.5, 1.5, 30);
    this._rebelLaserMat    = new THREE.MeshBasicMaterial({ color: 0x00ccff });
    this._imperialLaserMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });

    for (let i = 0; i < ENEMY_LASER_POOL_SIZE; i++) {
      const m = new THREE.Mesh(this._enemyLaserGeo, this._rebelLaserMat);
      m.visible = false;
      this._scene.add(m);
      this._enemyLaserPool.push(m);
    }

    this._explosionGeo = new THREE.SphereGeometry(3, 6, 6);
    this._explosionMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    for (let i = 0; i < 80; i++) {
      const m = new THREE.Mesh(this._explosionGeo, this._explosionMat);
      m.visible = false;
      this._scene.add(m);
      this._explosionPool.push({ mesh: m, inUse: false });
    }

    this._enemies = this._enemyDefs.map((def) => ({
      mesh:           def.mesh,
      radius:         def.radius,
      faction:        def.faction        || 'rebel',
      hp:             def.hitsToKill     || 4,
      maxHp:          def.hitsToKill     || 4,
      speed:          def.speed          || 2,
      points:         def.points         || 100,
      behavior:       def.behavior       || 'brawler',
      alive:          true,
      flashTimer:     0,
      flashMat:       new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 3 }),
      respawnTimer:   0,
      fireTimer:      Math.floor(Math.random() * ENEMY_FIRE_INTERVAL),
      target:         null,
      targetTimer:    0,
      strafeDir:      Math.random() < 0.5 ? 1 : -1,
      strafeDirTimer: Math.floor(Math.random() * STRAFE_FLIP_INTERVAL),
      strafePhase:    Math.random() * Math.PI * 2,
    }));

    this._camera.position.set(0, 400, 3000);
    this._camera.rotation.set(0, 0, 0);
  }

  update(delta = 1 / 60) {
    if (this._dead || this._paused) return;
    this._frame++;
    if (this._iFrameTimer > 0) this._iFrameTimer--;

    if (this._muzzleTimer > 0) {
      this._muzzleTimer--;
      this._muzzleLight.intensity = Math.max(0, this._muzzleLight.intensity - 0.8);
      const dir = new THREE.Vector3();
      this._camera.getWorldDirection(dir);
      this._muzzleLight.position.copy(this._camera.position).addScaledVector(dir, 30);
    }

    this._fireTimer++;
    if (this._fireTimer >= LASER_INTERVAL) {
      this._spawnLaser();
      this._fireTimer = 0;
    }

    this._updateLasers(delta);
    this._updateEnemyFire();
    this._updateEnemyLasers(delta);
    this._updateEnemies(delta);
    this._updateExplosions(delta);
  }

  _spawnLaser() {
    if (this._lasers.length >= LASER_POOL_SIZE) return;
    const mesh = this._laserPool.pop();
    if (!mesh) return;

    const dir = new THREE.Vector3();
    this._camera.getWorldDirection(dir);

    mesh.position.copy(this._camera.position).addScaledVector(dir, 30);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    mesh.visible = true;

    this._muzzleLight.intensity = 4;
    this._muzzleTimer = 5;

    this._lasers.push({ mesh, velocity: dir.clone().multiplyScalar(LASER_SPEED), life: 0 });
  }

  _updateLasers(delta = 1 / 60) {
    for (let i = this._lasers.length - 1; i >= 0; i--) {
      const laser = this._lasers[i];
      laser.mesh.position.addScaledVector(laser.velocity, delta * 60);
      laser.life++;

      let remove = laser.life > LASER_LIFETIME;

      if (!remove) {
        for (const enemy of this._enemies) {
          if (!enemy.alive) continue;
          if (laser.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius * 1.15) {
            this._hitEnemy(enemy);
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

  _updateEnemyFire() {
    for (const enemy of this._enemies) {
      if (!enemy.alive) continue;

      enemy.targetTimer--;
      if (enemy.targetTimer <= 0) {
        enemy.target      = this._selectTarget(enemy);
        enemy.targetTimer = TARGET_REVAL_FRAMES;
      }

      enemy.fireTimer--;
      if (enemy.fireTimer <= 0) {
        this._spawnEnemyLaser(enemy);
        const jitter = Math.floor(Math.random() * 30) - 15;
        enemy.fireTimer = this._waveFireInterval + jitter;
      }
    }
  }

  _spawnEnemyLaser(enemy) {
    const mesh = this._enemyLaserPool.pop();
    if (!mesh) return;

    const targetPos = (enemy.target && enemy.target.type === 'enemy' && enemy.target.ref.alive)
      ? enemy.target.ref.mesh.position
      : this._camera.position;

    const dir = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position).normalize();

    mesh.position.copy(enemy.mesh.position).addScaledVector(dir, enemy.radius + 10);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    mesh.material = enemy.faction === 'rebel' ? this._rebelLaserMat : this._imperialLaserMat;
    mesh.visible  = true;

    this._enemyLasers.push({
      mesh,
      velocity:       dir.clone().multiplyScalar(ENEMY_LASER_SPEED),
      life:           0,
      shooterFaction: enemy.faction,
    });
  }

  _updateEnemyLasers(delta = 1 / 60) {
    for (let i = this._enemyLasers.length - 1; i >= 0; i--) {
      const laser = this._enemyLasers[i];
      laser.mesh.position.addScaledVector(laser.velocity, delta * 60);
      laser.life++;

      let remove = laser.life > ENEMY_LASER_LIFETIME;

      if (!remove) {
        if (laser.mesh.position.distanceTo(this._camera.position) < PLAYER_HIT_RADIUS) {
          this._damagePlayer(ENEMY_LASER_DAMAGE, true);
          remove = true;
        } else {
          for (const enemy of this._enemies) {
            if (!enemy.alive || enemy.faction === laser.shooterFaction) continue;
            if (laser.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius * 1.15) {
              this._hitEnemy(enemy);
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

  // isLaser=true → triggers i-frames and hit callback; false → proximity (no i-frames)
  _damagePlayer(amount, isLaser = false) {
    if (isLaser) {
      if (this._iFrameTimer > 0) return;
      this._iFrameTimer    = I_FRAME_DURATION;
      this._shakeTimer     = 20;
      this._shakeIntensity = 8;
      if (this._onPlayerHit) this._onPlayerHit();
    }
    this._health = Math.max(0, this._health - amount);
    this._onHealthChange(this._health, this._wave);
    if (this._health <= 0) this._triggerGameOver();
  }

  _hitEnemy(enemy) {
    enemy.hp--;
    enemy.flashTimer = 15;
    enemy.flashMat.emissiveIntensity = 3;

    enemy.mesh.traverse((child) => {
      if (child.isMesh) {
        if (!child._origMat) child._origMat = child.material;
        child.material = enemy.flashMat;
      }
    });

    if (enemy.hp <= 0) this._destroyEnemy(enemy);
  }

  _destroyEnemy(enemy) {
    enemy.alive        = false;
    enemy.mesh.visible = false;
    enemy.respawnTimer = RESPAWN_FRAMES;

    for (const e of this._enemies) {
      if (e.target && e.target.type === 'enemy' && e.target.ref === enemy) {
        e.target = null;
        e.targetTimer = 0;
      }
    }

    this._spawnExplosion(enemy.mesh.position.clone(), enemy.radius);

    this._score += enemy.points;
    this._onScoreChange(this._score);
    if (this._onKill) this._onKill(enemy.points);

    this._waveKills++;
    if (this._waveKills >= KILLS_PER_WAVE) {
      this._waveKills        = 0;
      const completedWave    = this._wave;
      this._wave++;
      this._waveFireInterval = Math.max(MIN_FIRE_INTERVAL, this._waveFireInterval - WAVE_FIRE_BONUS);
      this._waveSpeedMult    = Math.min(MAX_SPEED_MULT, this._waveSpeedMult + WAVE_SPEED_BONUS);
      this._onHealthChange(this._health, this._wave);
      if (this._onWaveComplete) this._onWaveComplete(completedWave);
      if (this._wave > MAX_WAVE) {
        setTimeout(() => { if (!this._dead) this._triggerVictory(); }, 2000);
        return;
      }
    }
  }

  _spawnExplosion(position, shipRadius = 50) {
    const scale     = shipRadius / 50;
    const count     = Math.floor(20 + scale * 25);
    const speed     = 10 + scale * 8;
    const maxLife   = Math.floor(40 + scale * 25);
    const meshScale = 0.5 + scale;

    const particles = [];
    for (let i = 0; i < this._explosionPool.length && particles.length < count; i++) {
      const p = this._explosionPool[i];
      if (p.inUse) continue;
      p.inUse = true;
      p.mesh.position.copy(position);
      p.mesh.scale.setScalar(meshScale);
      p.mesh.visible = true;
      particles.push({
        entry:     p,
        velocity:  new THREE.Vector3(
          (Math.random() - 0.5) * speed * 2,
          (Math.random() - 0.5) * speed * 2,
          (Math.random() - 0.5) * speed * 2
        ),
        initScale: meshScale,
      });
    }

    if (particles.length > 0) {
      this._explosions.push({ particles, life: 0, maxLife });
    }
  }

  _updateExplosions(delta = 1 / 60) {
    for (let i = this._explosions.length - 1; i >= 0; i--) {
      const ex = this._explosions[i];
      ex.life++;
      const decay = 1 - ex.life / ex.maxLife;

      for (const p of ex.particles) {
        p.entry.mesh.position.addScaledVector(p.velocity, delta * 60);
        p.velocity.multiplyScalar(Math.pow(0.92, delta * 60));
        p.entry.mesh.scale.setScalar(Math.max(0.01, decay * p.initScale));
      }

      if (ex.life > ex.maxLife) {
        for (const p of ex.particles) {
          p.entry.mesh.visible = false;
          p.entry.inUse = false;
        }
        this._explosions.splice(i, 1);
      }
    }
  }

  _respawnEnemy(enemy) {
    const cam  = this._camera.position;
    const dist = 800 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi   = (Math.random() - 0.5) * Math.PI;

    enemy.mesh.position.set(
      cam.x + dist * Math.cos(phi) * Math.cos(theta),
      cam.y + dist * Math.sin(phi),
      cam.z + dist * Math.cos(phi) * Math.sin(theta)
    );

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
    enemy.strafeDirTimer--;
    if (enemy.strafeDirTimer <= 0) {
      enemy.strafeDir      *= -1;
      enemy.strafeDirTimer  = STRAFE_FLIP_INTERVAL + Math.floor(Math.random() * 60);
    }

    const dist = enemy.mesh.position.distanceTo(targetPos);
    let moveDir;

    if (dist < ARTILLERY_MIN_DIST) {
      moveDir = new THREE.Vector3().subVectors(enemy.mesh.position, targetPos).normalize();
    } else if (dist > ARTILLERY_PREFERRED_DIST) {
      moveDir = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position).normalize();
    } else {
      const toTarget = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position).normalize();
      moveDir = new THREE.Vector3(-toTarget.z, 0, toTarget.x).multiplyScalar(enemy.strafeDir);
    }

    enemy.mesh.position.addScaledVector(moveDir, speed * 0.7 * delta * 60);
  }

  _moveSkirmisher(enemy, targetPos, speed, delta) {
    const toTarget = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position).normalize();
    const lateral  = new THREE.Vector3(-toTarget.z, 0, toTarget.x);
    const drift    = Math.sin(this._frame * 0.04 + enemy.strafePhase) * 0.6;
    const moveDir  = toTarget.clone().addScaledVector(lateral, drift).normalize();
    enemy.mesh.position.addScaledVector(moveDir, speed * delta * 60);
  }

  _updateEnemies(delta = 1 / 60) {
    const playerPos = this._camera.position;

    for (const enemy of this._enemies) {
      if (!enemy.alive) {
        enemy.respawnTimer--;
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
        const dir = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position).normalize();
        enemy.mesh.position.addScaledVector(dir, effectiveSpeed * delta * 60);
      }

      // Smooth rotation toward target via quaternion slerp
      _lookAt(enemy.mesh, targetPos, delta);

      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist < ENEMY_DAMAGE_RADIUS) {
        this._damagePlayer(ENEMY_DAMAGE_PER_FRAME, false);
        if (this._dead) return;
      }
      if (dist > 3000) {
        this._respawnEnemy(enemy);
        continue;
      }

      if (enemy.flashTimer > 0) {
        enemy.flashTimer--;
        enemy.flashMat.emissiveIntensity = (enemy.flashTimer / 15) * 3;
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
    document.exitPointerLock();
    this._onGameOver(this._score, false);
  }

  _triggerVictory() {
    if (this._dead) return;
    this._dead = true;
    document.exitPointerLock();
    this._onGameOver(this._score, true);
  }

  pause()  { this._paused = true;  }
  resume() { this._paused = false; }

  cleanup() {
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

    for (const ex of this._explosions) {
      for (const p of ex.particles) {
        p.entry.mesh.visible = false;
        p.entry.inUse = false;
      }
    }
    this._explosions = [];

    for (const p of this._explosionPool) this._scene.remove(p.mesh);
    this._explosionPool = [];
    if (this._explosionGeo) { this._explosionGeo.dispose(); this._explosionGeo = null; }
    if (this._explosionMat) { this._explosionMat.dispose(); this._explosionMat = null; }

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

    if (this._muzzleLight) {
      this._scene.remove(this._muzzleLight);
      this._muzzleLight = null;
    }
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
