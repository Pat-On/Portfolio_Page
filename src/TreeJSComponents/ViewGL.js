import * as THREE from "three";

import { ambientLight } from "./lights/lights";
import { spaceTexture } from "./spaceTexture/spaceTexture";
import { buildAsteroidBelt } from "./planets/asteroidBelt/asteroidBelt";
import { buildComet } from "./planets/comet/comet";
import { SUN_POS, celestialBodies, ships } from "./registry";

import { animate } from "./animation";
import { isMobileDevice } from "../utils/isMobileDevice";

THREE.Cache.enabled = true;

const BOOST_MULT     = 2.2;
const BASE_FOV       = 75;
const BOOST_FOV      = 82;

export default class ViewGL {
  constructor(canvasRef, overlayCanvas, onReady) {
    this._onReady = onReady || null;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1.0,
      50000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: !isMobileDevice(),
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 2D overlay canvas for health bars + radar
    this._overlayCanvas = overlayCanvas || null;
    this._overlayCtx    = overlayCanvas ? overlayCanvas.getContext('2d') : null;
    if (this._overlayCanvas) {
      this._overlayCanvas.width  = window.innerWidth;
      this._overlayCanvas.height = window.innerHeight;
    }
    // Reuse vectors — avoid per-frame allocations in _drawOverlay
    this._projVec  = new THREE.Vector3();
    this._diffVec  = new THREE.Vector3();
    this._fwdVec   = new THREE.Vector3();
    this._rightVec = new THREE.Vector3();

    this.scene.background = spaceTexture;
    this.scene.backgroundIntensity = 0.4;

    const t = document.body.getBoundingClientRect().top;
    this.camera.position.setZ(t * -0.05 + 30);
    this.camera.position.setX(t * -0.0002 - 3);
    this.camera.position.setY(t * -0.0002 + 300);

    this.pointLightInstance = new THREE.PointLight(0xffffff, 1.2, 9000);
    this.pointLightInstance.position.set(350, 300, -900);
    this.renderer.render(this.scene, this.camera);
    this.scene.add(this.pointLightInstance, ambientLight);

    this._buildSceneFromRegistry();

    // ASTEROID BELT — between Mars (~1700) and Jupiter (~2500)
    this.asteroidBelt = buildAsteroidBelt();
    this.asteroidBelt.position.set(SUN_POS.x, SUN_POS.y, SUN_POS.z);
    this.scene.add(this.asteroidBelt);

    // COMET — elliptical orbit, starts at perihelion offset
    this.renderedComet = buildComet();
    this.scene.add(this.renderedComet);

    // Bloom post-processing — lazy-loaded after first paint to keep initial bundle slim
    this._composer  = null;
    this._bloomPass = null;
    this._composerLoading = false;

    this._gameModeActive = false;
    this._gameSystem = null;
    this._gameAudio  = null;
    this._boostHeld   = false;
    this._boostingNow = false;
    this._autoFire    = true; // default-on; App keeps this in sync
    this._onMuteChange = null;
    this._GameSystemCtor = null;
    this._GameAudioCtor  = null;
    this._timer = new THREE.Timer();
    // connect() uses the Page Visibility API so the frame after the tab is
    // re-shown gets a ~0 delta instead of the whole hidden interval.
    this._timer.connect(document);
    this._boundUpdate = this.update.bind(this);
    this._rafQueued = false;

    this._onVisibilityChange = () => {
      if (!document.hidden && !this._rafQueued) {
        this._rafQueued = true;
        requestAnimationFrame(this._boundUpdate);
      }
    };
    document.addEventListener("visibilitychange", this._onVisibilityChange);

    this._scheduleComposerLoad();
    this.update();
  }

  _scheduleComposerLoad() {
    if (this._composer || this._composerLoading) return;
    this._composerLoading = true;
    const start = () => this._loadComposer();
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(start, { timeout: 200 });
    } else {
      setTimeout(start, 50);
    }
  }

  async _loadComposer() {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
        await Promise.all([
          import("three/examples/jsm/postprocessing/EffectComposer.js"),
          import("three/examples/jsm/postprocessing/RenderPass.js"),
          import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
          import("three/examples/jsm/postprocessing/OutputPass.js"),
        ]);
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
        0.55, 0.4, 0.55
      );
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      this._bloomPass = bloom;
      this._composer  = composer;
    } finally {
      this._composerLoading = false;
    }
  }

  async _loadGameModules() {
    if (this._GameSystemCtor && this._GameAudioCtor) return;
    const [{ GameSystem }, { GameAudio }] = await Promise.all([
      import("./game/GameSystem"),
      import("./game/GameAudio"),
    ]);
    this._GameSystemCtor = GameSystem;
    this._GameAudioCtor  = GameAudio;
  }

  _buildSceneFromRegistry() {
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    for (const body of celestialBodies) {
      const mesh = body.builder.build();
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      this[`rendered${cap(body.name)}`] = mesh;

      if (body.wrap === false) {
        // Sun-style: positioned directly in world space, no orbital wrapper
        this.scene.add(mesh);
      } else {
        const wrapper = new THREE.Object3D();
        wrapper.position.set(SUN_POS.x, SUN_POS.y, SUN_POS.z);
        wrapper.add(mesh);
        this.scene.add(wrapper);
        this[`${body.name}Obj`] = wrapper;
      }

      if (body.children) {
        for (const child of body.children) {
          const childMesh = child.builder.build();
          childMesh.position.set(child.position.x, child.position.y, child.position.z);
          this[`rendered${cap(child.name)}`] = childMesh;
          const childWrap = new THREE.Object3D();
          childWrap.add(childMesh);
          mesh.add(childWrap);
          this[`${child.name}Obj`] = childWrap;
        }
      }
    }

    for (const ship of ships) {
      const mesh = ship.builder.build();
      mesh.position.set(ship.position.x, ship.position.y, ship.position.z);
      if (ship.rotationY !== undefined) mesh.rotation.y = ship.rotationY;
      if (ship.scale !== undefined) mesh.scale.setScalar(ship.scale);
      this.scene.add(mesh);
      // Preserve original alias naming: borg → renderedBorg, isd → renderedISD
      const alias = ship.name === "isd" ? "ISD"
                  : ship.name === "borg" ? "Borg"
                  : cap(ship.name);
      this[`rendered${alias}`] = mesh;
    }
  }

  updateValue(value) {}

  onScroll() {
    if (this._exploring) return;
    const t = document.body.getBoundingClientRect().top;
    this.camera.position.z = t * -2 + 30;
    this.camera.position.x = t * -0.0002 - 3;
    this.camera.rotation.y = t * 0.0001;
  }

  onMouseMove(e) {}

  onWindowResize(vpW, vpH) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(vpW, vpH);
    if (this._composer) this._composer.setSize(vpW, vpH);
    if (this._overlayCanvas) {
      this._overlayCanvas.width  = vpW;
      this._overlayCanvas.height = vpH;
    }
  }

  _restoreDeathStarOrbit() {
    if (this.renderedDeathStar.parent !== this.deathStarObj) {
      this.deathStarObj.add(this.renderedDeathStar);
      this.renderedDeathStar.position.set(-600, -300, 7200);
    }
  }

  // ── Game input API — shared by keyboard/mouse and HUD touch buttons ──
  setFiring(v) {
    if (this._gameSystem) this._gameSystem.setFiring(v);
  }

  setAutoFire(v) {
    this._autoFire = !!v;
    if (this._gameSystem) this._gameSystem.setAutoFire(this._autoFire);
  }

  setBoosting(v) {
    this._boostHeld = !!v;
  }

  togglePause() {
    if (!this._gameModeActive || !this._gameSystem) return;
    if (this._gameSystem._paused) {
      this._gameSystem.resume();
    } else {
      this._gameSystem.pause();
    }
    if (this._onPause) this._onPause(this._gameSystem._paused);
  }

  toggleMute() {
    if (!this._gameAudio) return false;
    this._gameAudio.muted = !this._gameAudio.muted;
    if (this._onMuteChange) this._onMuteChange(this._gameAudio.muted);
    return this._gameAudio.muted;
  }

  _removeGameMouseInput() {
    if (this._onGameMouseDown) {
      document.removeEventListener("mousedown", this._onGameMouseDown);
      document.removeEventListener("mouseup", this._onGameMouseUp);
      this._onGameMouseDown = null;
      this._onGameMouseUp   = null;
    }
    this._boostHeld = false;
  }

  async setGameMode(enabled, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause, onMuteChange) {
    this._gameModeActive = enabled;
    this._onPause = onPause || null;
    this._onMuteChange = onMuteChange || null;

    if (enabled) {
      await this._loadGameModules();
      if (!this._gameModeActive) return; // user toggled off during the await

      if (!this._exploring) {
        this.setExploreMode(true, () => {
          if (this._gameModeActive) {
            this._gameModeActive = false;
            this._removeGameMouseInput();
            const score = this._gameSystem ? this._gameSystem._score : 0;
            if (this._gameSystem) { this._gameSystem.cleanup(); this._gameSystem = null; }
            this._restoreDeathStarOrbit();
            if (onGameOver) onGameOver(score);
          }
        });
      }

      if (!this._isMobile) {
        this._onGameMouseDown = (e) => { if (e.button === 0) this.setFiring(true); };
        this._onGameMouseUp   = (e) => { if (e.button === 0) this.setFiring(false); };
        document.addEventListener("mousedown", this._onGameMouseDown);
        document.addEventListener("mouseup", this._onGameMouseUp);
      }

      // Detach Death Star from its orbital wrapper so its position is in world space
      const dsWorldPos = new THREE.Vector3();
      this.renderedDeathStar.getWorldPosition(dsWorldPos);
      this.scene.add(this.renderedDeathStar);
      this.renderedDeathStar.position.copy(dsWorldPos);

      const enemies = [
        { mesh: this.renderedSpaceship,  id: 'spaceship',  radius: 50,  faction: 'rebel',    hitsToKill: 3,  speed: 2.8, points: 100, behavior: 'skirmisher' },
        { mesh: this.renderedEnterprise, id: 'enterprise', radius: 70,  faction: 'rebel',    hitsToKill: 5,  speed: 1.6, points: 150, behavior: 'artillery'  },
        { mesh: this.renderedBorg,       id: 'borg',       radius: 60,  faction: 'imperial', hitsToKill: 6,  speed: 1.0, points: 200, behavior: 'brawler'    },
        { mesh: this.renderedFalcon,     id: 'falcon',     radius: 45,  faction: 'rebel',    hitsToKill: 3,  speed: 3.5, points: 100, behavior: 'skirmisher' },
        { mesh: this.renderedISD,        id: 'isd',        radius: 150, faction: 'imperial', hitsToKill: 8,  speed: 0.7, points: 300, behavior: 'artillery'  },
        { mesh: this.renderedDeathStar,  id: 'deathStar',  radius: 160, faction: 'imperial', hitsToKill: 12, speed: 0.4, points: 500, behavior: 'artillery'  },
      ];

      const onHealthChange = (hp, wave) => {
        if (onHudUpdate) onHudUpdate(hp, this._gameSystem._score, wave || this._gameSystem._wave);
      };
      const onScoreChange = (score) => {
        if (onHudUpdate) onHudUpdate(this._gameSystem._health, score, this._gameSystem._wave);
      };

      if (!this._gameAudio) this._gameAudio = new this._GameAudioCtor();
      this._gameAudio.init();

      this._gameSystem = new this._GameSystemCtor(
        this.scene, this.camera, enemies,
        onHealthChange, onScoreChange, onGameOver,
        onPlayerHit, onKill
      );
      this._gameSystem.init();
      this._gameSystem._audio         = this._gameAudio;
      this._gameSystem._onWaveComplete = onWaveComplete || null;
      this._gameSystem.setAutoFire(this._autoFire);
    } else {
      if (document.exitPointerLock) document.exitPointerLock();
      this._removeGameMouseInput();
      if (this._gameSystem) { this._gameSystem.cleanup(); this._gameSystem = null; }
      this._gameModeActive = false;
      this._restoreDeathStarOrbit();
    }
  }

  _drawOverlay() {
    const ctx    = this._overlayCtx;
    const W      = this._overlayCanvas.width;
    const H      = this._overlayCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // ── Enemy HP bars ──────────────────────────────────────────────
    for (const enemy of this._gameSystem._enemies) {
      if (!enemy.alive) continue;
      const dist = enemy.mesh.position.distanceTo(this.camera.position);
      if (dist > 1200) continue;

      this._projVec.copy(enemy.mesh.position).project(this.camera);
      if (this._projVec.z > 1) continue; // behind camera

      const sx   = (this._projVec.x * 0.5 + 0.5) * W;
      const sy   = (-this._projVec.y * 0.5 + 0.5) * H - 28;
      const barW = 40;
      const barH = 4;
      const hp   = enemy.hp / enemy.maxHp;

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(sx - barW / 2 - 1, sy - 1, barW + 2, barH + 2);
      ctx.fillStyle = hp > 0.5 ? '#44ff44' : hp > 0.25 ? '#ffaa00' : '#ff3300';
      ctx.fillRect(sx - barW / 2, sy, barW * hp, barH);
    }

    // ── Radar ───────────────────────────────────────────────────────
    const MARGIN = 20;
    const RADIUS = 55;
    const rcx    = MARGIN + RADIUS;
    const rcy    = MARGIN + RADIUS;

    ctx.beginPath();
    ctx.arc(rcx, rcy, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,201,71,0.4)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,201,71,0.15)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(rcx - RADIUS, rcy); ctx.lineTo(rcx + RADIUS, rcy);
    ctx.moveTo(rcx, rcy - RADIUS); ctx.lineTo(rcx, rcy + RADIUS);
    ctx.stroke();

    this._fwdVec.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this._rightVec.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const scale = RADIUS / 1200;

    for (const enemy of this._gameSystem._enemies) {
      if (!enemy.alive) continue;
      this._diffVec.subVectors(enemy.mesh.position, this.camera.position);
      const rx = this._diffVec.dot(this._rightVec) * scale;
      const ry = -this._diffVec.dot(this._fwdVec)  * scale;
      if (rx * rx + ry * ry > RADIUS * RADIUS) continue;
      ctx.beginPath();
      ctx.arc(rcx + rx, rcy + ry, 3, 0, Math.PI * 2);
      ctx.fillStyle = enemy.faction === 'rebel' ? '#00ccff' : '#00ff44';
      ctx.fill();
    }

    // Pickups on the radar — green crosses
    ctx.strokeStyle = '#22ff66';
    ctx.lineWidth   = 1.5;
    for (const pickup of this._gameSystem._pickups) {
      this._diffVec.subVectors(pickup.mesh.position, this.camera.position);
      const rx = this._diffVec.dot(this._rightVec) * scale;
      const ry = -this._diffVec.dot(this._fwdVec)  * scale;
      if (rx * rx + ry * ry > RADIUS * RADIUS) continue;
      ctx.beginPath();
      ctx.moveTo(rcx + rx - 3, rcy + ry); ctx.lineTo(rcx + rx + 3, rcy + ry);
      ctx.moveTo(rcx + rx, rcy + ry - 3); ctx.lineTo(rcx + rx, rcy + ry + 3);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(rcx, rcy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffc947';
    ctx.fill();

    // ── Boss HP bar + superlaser warning ──────────────────────────
    const boss = this._gameSystem._boss;
    if (boss && boss.alive) {
      const bw = 300, bh = 10;
      const bx = W / 2 - bw / 2;
      const by = 64;
      const hp = boss.hp / boss.maxHp;

      ctx.font      = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,201,71,0.85)';
      ctx.fillText('DEATH STAR', W / 2, by - 8);

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = hp > 0.5 ? '#44ff44' : hp > 0.25 ? '#ffaa00' : '#ff3300';
      ctx.fillRect(bx, by, bw * hp, bh);

      if (this._gameSystem._bossPhase === 'charging') {
        const pulse = 0.5 + Math.abs(Math.sin(performance.now() * 0.012)) * 0.5;
        ctx.font      = '16px monospace';
        ctx.fillStyle = `rgba(255,60,30,${pulse})`;
        ctx.fillText('⚠ SUPERLASER CHARGING ⚠', W / 2, by + 38);
      }
    }
  }

  _drawExploreLabels() {
    if (!this._overlayCtx) return;
    const ctx = this._overlayCtx;
    const W   = this._overlayCanvas.width;
    const H   = this._overlayCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const planets = [
      { name: 'Sun',     mesh: this.renderedSun },
      { name: 'Mercury', mesh: this.renderedMercury },
      { name: 'Venus',   mesh: this.renderedVenus },
      { name: 'Earth',   mesh: this.renderedEarth },
      { name: 'Mars',    mesh: this.renderedMars },
      { name: 'Jupiter', mesh: this.renderedJupiter },
      { name: 'Saturn',  mesh: this.renderedSaturn },
      { name: 'Uranus',  mesh: this.renderedUranus },
      { name: 'Neptune', mesh: this.renderedNeptune },
    ];

    ctx.font      = '13px monospace';
    ctx.textAlign = 'center';

    for (const { name, mesh } of planets) {
      mesh.getWorldPosition(this._diffVec);
      const dist = this._diffVec.distanceTo(this.camera.position);
      if (dist > 5000) continue;

      this._projVec.copy(this._diffVec).project(this.camera);
      if (this._projVec.z > 1) continue;

      const sx = (this._projVec.x * 0.5 + 0.5) * W;
      const sy = (-this._projVec.y * 0.5 + 0.5) * H;
      if (sx < 0 || sx > W || sy < 0 || sy > H) continue;

      const alpha = Math.max(0.25, Math.min(1, 1 - dist / 5000));
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#ffc947';
      ctx.fillText(name, sx, sy - 24);
      ctx.globalAlpha = 1;
    }
  }

  setExploreMode(enabled, onEnd) {
    if (enabled && this._exploring) return;
    this._exploring = enabled;

    if (enabled) {
      this.camera.rotation.order = "YXZ";
      this._isMobile = isMobileDevice();

      if (this._isMobile) {
        this._leftTouch = null;
        this._rightTouch = null;

        this._onTouchStart = (e) => {
          e.preventDefault();
          for (const touch of e.changedTouches) {
            const isLeft = touch.clientX < window.innerWidth / 2;
            if (isLeft && !this._leftTouch) {
              this._leftTouch = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY, x: touch.clientX, y: touch.clientY };
            } else if (!isLeft && !this._rightTouch) {
              this._rightTouch = { id: touch.identifier, lastX: touch.clientX, lastY: touch.clientY };
            }
          }
        };

        this._onTouchMove = (e) => {
          e.preventDefault();
          for (const touch of e.changedTouches) {
            if (this._leftTouch && touch.identifier === this._leftTouch.id) {
              this._leftTouch.x = touch.clientX;
              this._leftTouch.y = touch.clientY;
            } else if (this._rightTouch && touch.identifier === this._rightTouch.id) {
              const dx = touch.clientX - this._rightTouch.lastX;
              const dy = touch.clientY - this._rightTouch.lastY;
              this.camera.rotation.y -= dx * 0.005;
              this.camera.rotation.x -= dy * 0.005;
              this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
              this._rightTouch.lastX = touch.clientX;
              this._rightTouch.lastY = touch.clientY;
            }
          }
        };

        this._onTouchEnd = (e) => {
          for (const touch of e.changedTouches) {
            if (this._leftTouch && touch.identifier === this._leftTouch.id) this._leftTouch = null;
            if (this._rightTouch && touch.identifier === this._rightTouch.id) this._rightTouch = null;
          }
        };

        const canvas = this.renderer.domElement;
        canvas.addEventListener("touchstart",  this._onTouchStart,  { passive: false });
        canvas.addEventListener("touchmove",   this._onTouchMove,   { passive: false });
        canvas.addEventListener("touchend",    this._onTouchEnd);
        canvas.addEventListener("touchcancel", this._onTouchEnd);
      } else {
        this._keys = {};

        this._onKeyDown = (e) => {
          this._keys[e.key.toLowerCase()] = true;
          if (["w", "a", "s", "d", " "].includes(e.key.toLowerCase())) {
            e.preventDefault();
          }
          if (e.key.toLowerCase() === 'p') this.togglePause();
          if (e.key.toLowerCase() === 'm') this.toggleMute();
        };
        this._onKeyUp = (e) => { this._keys[e.key.toLowerCase()] = false; };

        this._exploreMouseMove = (e) => {
          if (!this._exploring) return;
          this.camera.rotation.y -= e.movementX * 0.002;
          this.camera.rotation.x -= e.movementY * 0.002;
          this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
        };

        this._onPointerLockChange = () => {
          if (!document.pointerLockElement && this._exploring) {
            this._exploring = false;
            if (onEnd) onEnd();
            this._cleanupExplore();
          }
        };

        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);
        document.addEventListener("mousemove", this._exploreMouseMove);
        document.addEventListener("pointerlockchange", this._onPointerLockChange);
        if (this.renderer.domElement.requestPointerLock) this.renderer.domElement.requestPointerLock();
      }
    } else {
      if (document.exitPointerLock) document.exitPointerLock();
      this._cleanupExplore();
    }
  }

  _cleanupExplore() {
    this._keys = {};
    this._leftTouch = null;
    this._rightTouch = null;
    if (this._onKeyDown)           document.removeEventListener("keydown", this._onKeyDown);
    if (this._onKeyUp)             document.removeEventListener("keyup", this._onKeyUp);
    if (this._exploreMouseMove)    document.removeEventListener("mousemove", this._exploreMouseMove);
    if (this._onPointerLockChange) document.removeEventListener("pointerlockchange", this._onPointerLockChange);
    if (this._onTouchStart) {
      const canvas = this.renderer.domElement;
      canvas.removeEventListener("touchstart",  this._onTouchStart);
      canvas.removeEventListener("touchmove",   this._onTouchMove);
      canvas.removeEventListener("touchend",    this._onTouchEnd);
      canvas.removeEventListener("touchcancel", this._onTouchEnd);
      this._onTouchStart = null;
      this._onTouchMove  = null;
      this._onTouchEnd   = null;
    }
  }

  _applyExploreMovement(delta = 1 / 60) {
    if (!this._exploring) return;
    if (this._gameModeActive && this._gameSystem && this._gameSystem._paused) return;
    const boosting = (this._keys && this._keys["shift"]) || this._boostHeld;
    this._boostingNow = !!boosting;
    const speed = 20 * (boosting ? BOOST_MULT : 1) * delta * 60;
    this.camera.getWorldDirection(this._fwdVec);
    this._rightVec.crossVectors(this._fwdVec, this.camera.up).normalize();

    if (this._keys) {
      if (this._keys["w"]) this.camera.position.addScaledVector(this._fwdVec, speed);
      if (this._keys["s"]) this.camera.position.addScaledVector(this._fwdVec, -speed);
      if (this._keys["a"]) this.camera.position.addScaledVector(this._rightVec, -speed);
      if (this._keys["d"]) this.camera.position.addScaledVector(this._rightVec, speed);
      if (this._keys[" "]) this.camera.position.y += speed;
      if (this._keys["e"]) this.camera.position.y -= speed;
    }

    if (this._isMobile && this._leftTouch) {
      const DEAD = 10, MAX = 60;
      const dx = this._leftTouch.x - this._leftTouch.startX;
      const dy = this._leftTouch.y - this._leftTouch.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > DEAD) {
        const scale = (Math.min(dist, MAX) / MAX) * speed;
        const nx = dx / dist, ny = dy / dist;
        this.camera.position.addScaledVector(this._fwdVec, -ny * scale);
        this.camera.position.addScaledVector(this._rightVec, nx * scale);
      }
    }
  }

  update() {
    this._rafQueued = false;

    // Pause render loop when tab is hidden — saves CPU/GPU; visibilitychange resumes it.
    if (typeof document !== "undefined" && document.hidden) return;

    this._timer.update();
    const delta = this._timer.getDelta();
    this._applyExploreMovement(delta);

    // Boost FOV kick — lerp toward target, skip matrix update once settled
    const targetFov = this._boostingNow && this._exploring ? BOOST_FOV : BASE_FOV;
    if (Math.abs(this.camera.fov - targetFov) > 0.01) {
      this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, 8 * delta);
      this.camera.updateProjectionMatrix();
    }

    if (this._gameModeActive && this._gameSystem) {
      this._gameSystem.update(delta);
      if (!this._gameSystem._paused && this._gameSystem._shakeTimer > 0) {
        const si = this._gameSystem._shakeIntensity * this._gameSystem._shakeTimer;
        this._gameSystem._shakeTimer = Math.max(0, this._gameSystem._shakeTimer - delta * 3.0);
        this.camera.position.x += (Math.random() - 0.5) * si;
        this.camera.position.y += (Math.random() - 0.5) * si;
      }
    }

    if (this._gameModeActive || !this._composer) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this._composer.render();
    }
    if (this._gameModeActive && this._gameSystem && this._overlayCtx) {
      this._drawOverlay();
    } else if (this._exploring && this._overlayCtx) {
      this._drawExploreLabels();
    } else if (this._overlayCtx) {
      this._overlayCtx.clearRect(0, 0, this._overlayCanvas.width, this._overlayCanvas.height);
    }
    animate.bind(this)(delta);

    if (this._onReady) {
      this._onReady();
      this._onReady = null;
    }

    this._rafQueued = true;
    requestAnimationFrame(this._boundUpdate);
  }
}
