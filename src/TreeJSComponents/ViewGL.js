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

import { animate } from "./animation";

export default class ViewGL {
  constructor(canvasRef) {
    this.scene = new THREE.Scene();
    this.scene.background = spaceTexture;
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: false,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const t = document.body.getBoundingClientRect().top;
    this.camera.position.setZ(t * -0.05 + 30);
    this.camera.position.setX(t * -0.0002 - 3);
    this.camera.position.setY(t * -0.0002 + 300);

    this.pointLightInstance = new THREE.PointLight(0xffffff, 2, 9000);
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
    this.renderedSun.add(this.renderedMercury);

    // VENUS
    this.renderedVenus = venus.build();
    this.renderedVenus.position.set(0, 0, 900);
    this.venusObj = new THREE.Object3D();
    this.venusObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.venusObj.add(this.renderedVenus);
    this.scene.add(this.venusObj);

    // MOON
    this.renderedMoon = moon.build();
    this.renderedMoon.position.set(29, 30, 220);

    // EARTH
    this.renderedEarth = earth.build();
    this.renderedEarth.position.set(650, 450, 1300);
    this.renderedEarth.add(this.renderedMoon);
    this.earthObj = new THREE.Object3D();
    this.earthObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.earthObj.add(this.renderedEarth);
    this.scene.add(this.earthObj);

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

    // ALIEN SPACESHIP
    this.renderedSpaceship = spaceship.build();
    this.renderedSpaceship.position.set(900, 700, 1800);
    this.scene.add(this.renderedSpaceship);

    // ENTERPRISE (NCC-1701)
    this.renderedEnterprise = enterprise.build();
    this.renderedEnterprise.position.set(-400, 500, 2800);
    this.renderedEnterprise.rotation.y = Math.PI / 4;
    this.scene.add(this.renderedEnterprise);

    // BORG CUBE
    this.renderedBorg = borgCube.build();
    this.renderedBorg.position.set(600, 400, 3600);
    this.scene.add(this.renderedBorg);

    // MILLENNIUM FALCON
    this.renderedFalcon = falcon.build();
    this.renderedFalcon.position.set(-500, 550, 3200);
    this.renderedFalcon.rotation.y = Math.PI * 0.75;
    this.scene.add(this.renderedFalcon);

    // IMPERIAL STAR DESTROYER
    this.renderedISD = isd.build();
    this.renderedISD.position.set(300, 250, 4700);
    this.renderedISD.rotation.y = Math.PI * 0.1;
    this.scene.add(this.renderedISD);

    // DEATH STAR — slow orbital patrol beyond Neptune
    this.renderedDeathStar = deathStar.build();
    this.renderedDeathStar.position.set(-300, -200, 6500);
    this.deathStarObj = new THREE.Object3D();
    this.deathStarObj.position.set(SUN_X, SUN_Y, SUN_Z);
    this.deathStarObj.add(this.renderedDeathStar);
    this.scene.add(this.deathStarObj);

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
  }

  setExploreMode(enabled, onEnd) {
    this._exploring = enabled;

    if (enabled) {
      this._keys = {};
      this.camera.rotation.order = "YXZ";

      this._onKeyDown = (e) => {
        this._keys[e.key.toLowerCase()] = true;
        if (["w", "a", "s", "d", " "].includes(e.key.toLowerCase())) {
          e.preventDefault();
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
    } else {
      document.exitPointerLock();
      this._cleanupExplore();
    }
  }

  _cleanupExplore() {
    this._keys = {};
    if (this._onKeyDown) document.removeEventListener("keydown", this._onKeyDown);
    if (this._onKeyUp) document.removeEventListener("keyup", this._onKeyUp);
    if (this._exploreMouseMove) document.removeEventListener("mousemove", this._exploreMouseMove);
    if (this._onPointerLockChange) document.removeEventListener("pointerlockchange", this._onPointerLockChange);
  }

  _applyExploreMovement() {
    if (!this._exploring || !this._keys) return;
    const speed = 20;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir, this.camera.up).normalize();

    if (this._keys["w"]) this.camera.position.addScaledVector(dir, speed);
    if (this._keys["s"]) this.camera.position.addScaledVector(dir, -speed);
    if (this._keys["a"]) this.camera.position.addScaledVector(right, -speed);
    if (this._keys["d"]) this.camera.position.addScaledVector(right, speed);
    if (this._keys[" "]) this.camera.position.y += speed;
    if (this._keys["e"]) this.camera.position.y -= speed;
  }

  update() {
    this._applyExploreMovement();
    this.renderer.render(this.scene, this.camera);
    animate.bind(this)();
    requestAnimationFrame(this.update.bind(this));
  }
}
