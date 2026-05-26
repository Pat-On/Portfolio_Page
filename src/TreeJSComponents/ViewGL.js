import * as THREE from "three";

import { moon, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune } from "./planets/solarSystem";
import { spaceship } from "./spaceship/spaceship";
import { enterprise } from "./spaceship/enterprise";
import { borgCube } from "./spaceship/borg";
import { isd } from "./spaceship/isd";
import { falcon } from "./spaceship/falcon";
import { deathStar } from "./spaceship/deathStar";
import { ambientLight } from "./lights/lights";
import { spaceTexture } from "./spaceTexture/spaceTexture";
import { buildAsteroidBelt } from "./planets/asteroidBelt/asteroidBelt";
import { buildComet } from "./planets/comet/comet";

import { animate } from "./animation";
import { isMobileDevice } from "../utils/isMobileDevice";
import { GameSystem } from "./game/GameSystem";
import { GameAudio } from "./game/GameAudio";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

THREE.Cache.enabled = true;

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

    const SUN_X = 350, SUN_Y = 300, SUN_Z = -900;

    // SUN
    this.renderedSun = sun.build();
    this.renderedSun.position.set(SUN_X, SUN_Y, SUN_Z);
    this.scene.add(this.renderedSun);

    // MERCURY
    this.renderedMercury = mercury.build();
    this.renderedMercury.position.set(0, 0, 700);
    this.mercuryObj = new THREE.Object3D();
    this.mercuryObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.mercuryObj.add(this.renderedMercury);
    this.scene.add(this.mercuryObj);

    // VENUS
    this.renderedVenus = venus.build();
    this.renderedVenus.position.set(0, 0, 900);
    this.venusObj = new THREE.Object3D();
    this.venusObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.venusObj.add(this.renderedVenus);
    this.scene.add(this.venusObj);

    // MOON
    // EARTH
    this.renderedEarth = earth.build();
    this.renderedEarth.position.set(650, 450, 1300);
    this.earthObj = new THREE.Object3D();
    this.earthObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.earthObj.add(this.renderedEarth);
    this.scene.add(this.earthObj);

    // MOON — independent orbital pivot as child of Earth mesh
    this.renderedMoon = moon.build();
    this.renderedMoon.position.set(150, 0, 0);
    this.moonObj = new THREE.Object3D();
    this.moonObj.add(this.renderedMoon);
    this.renderedEarth.add(this.moonObj);

    // MARS
    this.renderedMars = mars.build();
    this.renderedMars.position.set(0, 100, 1700);
    this.marsObj = new THREE.Object3D();
    this.marsObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.marsObj.add(this.renderedMars);
    this.scene.add(this.marsObj);

    // JUPITER
    this.renderedJupiter = jupiter.build();
    this.renderedJupiter.position.set(0, 0, 2500);
    this.jupiterObj = new THREE.Object3D();
    this.jupiterObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.jupiterObj.add(this.renderedJupiter);
    this.scene.add(this.jupiterObj);

    // SATURN
    this.renderedSaturn = saturn.build();
    this.renderedSaturn.position.set(0, -100, 3400);
    this.saturnObj = new THREE.Object3D();
    this.saturnObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.saturnObj.add(this.renderedSaturn);
    this.scene.add(this.saturnObj);

    // URANUS
    this.renderedUranus = uranus.build();
    this.renderedUranus.position.set(0, 150, 4300);
    this.uranusObj = new THREE.Object3D();
    this.uranusObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.uranusObj.add(this.renderedUranus);
    this.scene.add(this.uranusObj);

    // NEPTUNE
    this.renderedNeptune = neptune.build();
    this.renderedNeptune.position.set(0, 0, 5200);
    this.neptuneObj = new THREE.Object3D();
    this.neptuneObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.neptuneObj.add(this.renderedNeptune);
    this.scene.add(this.neptuneObj);

    // ASTEROID BELT — between Mars (~1700) and Jupiter (~2500)
    this.asteroidBelt = buildAsteroidBelt();
    this.asteroidBelt.position.set(SUN_X, SUN_Y, SUN_Z);
    this.scene.add(this.asteroidBelt);

    // COMET — elliptical orbit, starts at perihelion offset
    this.renderedComet = buildComet();
    this.scene.add(this.renderedComet);

    // ALIEN SPACESHIP
    this.renderedSpaceship = spaceship.build();
    this.renderedSpaceship.position.set(900, 700, 1800);
    this.scene.add(this.renderedSpaceship);

    // ENTERPRISE (NCC-1701) — front is -Z, t=0 velocity points in -Z so ry=π
    this.renderedEnterprise = enterprise.build();
    this.renderedEnterprise.position.set(-400, 500, 2800);
    this.renderedEnterprise.rotation.y = Math.PI;
    this.scene.add(this.renderedEnterprise);

    // BORG CUBE
    this.renderedBorg = borgCube.build();
    this.renderedBorg.position.set(600, 400, 3600);
    this.scene.add(this.renderedBorg);

    // MILLENNIUM FALCON — front is -Z, t=0 velocity points in -Z so ry=π
    this.renderedFalcon = falcon.build();
    this.renderedFalcon.position.set(-500, 550, 3200);
    this.renderedFalcon.rotation.y = Math.PI;
    this.scene.add(this.renderedFalcon);

    // IMPERIAL STAR DESTROYER — front is -Z, t=0 velocity points in +X so ry=-π/2
    this.renderedISD = isd.build();
    this.renderedISD.position.set(300, 250, 4700);
    this.renderedISD.rotation.y = -Math.PI / 2;
    this.scene.add(this.renderedISD);

    // DEATH STAR — slow orbital patrol beyond Neptune
    this.renderedDeathStar = deathStar.build();
    this.renderedDeathStar.position.set(-300, -200, 6500);
    this.deathStarObj = new THREE.Object3D();
    this.deathStarObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.deathStarObj.add(this.renderedDeathStar);
    this.scene.add(this.deathStarObj);

    // Bloom post-processing
    this._composer = new EffectComposer(this.renderer);
    this._composer.addPass(new RenderPass(this.scene, this.camera));
    this._bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      0.55,  // strength
      0.4,   // radius
      0.55   // threshold
    );
    this._composer.addPass(this._bloomPass);
    this._composer.addPass(new OutputPass());

    this._gameModeActive = false;
    this._gameSystem = null;
    this._gameAudio  = null;
    this._clock = new THREE.Clock();
    this._boundUpdate = this.update.bind(this);

    this.update();
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
    this._composer.setSize(vpW, vpH);
    if (this._overlayCanvas) {
      this._overlayCanvas.width  = vpW;
      this._overlayCanvas.height = vpH;
    }
  }

  _restoreDeathStarOrbit() {
    if (this.renderedDeathStar.parent !== this.deathStarObj) {
      this.deathStarObj.add(this.renderedDeathStar);
      this.renderedDeathStar.position.set(-300, -200, 6500);
    }
  }

  setGameMode(enabled, onGameOver, onHudUpdate, onPlayerHit, onKill, onWaveComplete, onPause) {
    this._gameModeActive = enabled;
    this._onPause = onPause || null;

    if (enabled) {
      if (!this._exploring) {
        this.setExploreMode(true, () => {
          if (this._gameModeActive) {
            this._gameModeActive = false;
            const score = this._gameSystem ? this._gameSystem._score : 0;
            if (this._gameSystem) { this._gameSystem.cleanup(); this._gameSystem = null; }
            this._restoreDeathStarOrbit();
            if (onGameOver) onGameOver(score);
          }
        });
      }

      // Detach Death Star from its orbital wrapper so its position is in world space
      const dsWorldPos = new THREE.Vector3();
      this.renderedDeathStar.getWorldPosition(dsWorldPos);
      this.scene.add(this.renderedDeathStar);
      this.renderedDeathStar.position.copy(dsWorldPos);

      const enemies = [
        { mesh: this.renderedSpaceship,  radius: 50,  faction: 'rebel',    hitsToKill: 3,  speed: 2.8, points: 100, behavior: 'skirmisher' },
        { mesh: this.renderedEnterprise, radius: 70,  faction: 'rebel',    hitsToKill: 5,  speed: 1.6, points: 150, behavior: 'artillery'  },
        { mesh: this.renderedBorg,       radius: 60,  faction: 'imperial', hitsToKill: 6,  speed: 1.0, points: 200, behavior: 'brawler'    },
        { mesh: this.renderedFalcon,     radius: 45,  faction: 'rebel',    hitsToKill: 3,  speed: 3.5, points: 100, behavior: 'skirmisher' },
        { mesh: this.renderedISD,        radius: 150, faction: 'imperial', hitsToKill: 8,  speed: 0.7, points: 300, behavior: 'artillery'  },
        { mesh: this.renderedDeathStar,  radius: 160, faction: 'imperial', hitsToKill: 12, speed: 0.4, points: 500, behavior: 'artillery'  },
      ];

      const onHealthChange = (hp, wave) => {
        if (onHudUpdate) onHudUpdate(hp, this._gameSystem._score, wave || this._gameSystem._wave);
      };
      const onScoreChange = (score) => {
        if (onHudUpdate) onHudUpdate(this._gameSystem._health, score, this._gameSystem._wave);
      };

      if (!this._gameAudio) this._gameAudio = new GameAudio();
      this._gameAudio.init();

      this._gameSystem = new GameSystem(
        this.scene, this.camera, enemies,
        onHealthChange, onScoreChange, onGameOver,
        onPlayerHit, onKill
      );
      this._gameSystem.init();
      this._gameSystem._audio         = this._gameAudio;
      this._gameSystem._onWaveComplete = onWaveComplete || null;
    } else {
      if (!this._isMobile) document.exitPointerLock();
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
    const rcx    = W - MARGIN - RADIUS;
    const rcy    = H - MARGIN - RADIUS;

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

    ctx.beginPath();
    ctx.arc(rcx, rcy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffc947';
    ctx.fill();
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
          if (e.key.toLowerCase() === 'p' && this._gameModeActive && this._gameSystem) {
            if (this._gameSystem._paused) {
              this._gameSystem.resume();
            } else {
              this._gameSystem.pause();
            }
            if (this._onPause) this._onPause(this._gameSystem._paused);
          }
          if (e.key.toLowerCase() === 'm' && this._gameAudio) {
            this._gameAudio.muted = !this._gameAudio.muted;
          }
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
        this.renderer.domElement.requestPointerLock();
      }
    } else {
      if (!this._isMobile) document.exitPointerLock();
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
    const speed = 20 * delta * 60;
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
    const delta = this._clock.getDelta();
    this._applyExploreMovement(delta);

    if (this._gameModeActive && this._gameSystem) {
      this._gameSystem.update(delta);
      if (!this._gameSystem._paused && this._gameSystem._shakeTimer > 0) {
        const si = this._gameSystem._shakeIntensity * this._gameSystem._shakeTimer;
        this._gameSystem._shakeTimer = Math.max(0, this._gameSystem._shakeTimer - delta * 3.0);
        this.camera.position.x += (Math.random() - 0.5) * si;
        this.camera.position.y += (Math.random() - 0.5) * si;
      }
    }

    if (this._gameModeActive) {
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

    requestAnimationFrame(this._boundUpdate);
  }
}
