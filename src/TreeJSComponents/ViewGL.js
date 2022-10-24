import * as THREE from "three";

import { moon, sun, mercury, venus, earth } from "./planets/solarSystem";
import { pointLight, ambientLight } from "./lights/lights";
import { spaceTexture } from "./spaceTexture/spaceTexture";

import { animate } from "./animation";

// dev import:
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
    // Find more reactish way
    const t = document.body.getBoundingClientRect().top;
    this.camera.position.setZ(t * -0.05 + 30);
    this.camera.position.setX(t * -0.0002 - 3);
    this.camera.position.setY(t * -0.0002 + 300);

    this.renderer.render(this.scene, this.camera);
    // Lights
    this.scene.add(pointLight, ambientLight);

    // SUN
    this.renderedSun = sun.build();
    this.renderedSun.position.set(350, 300, -900);
    this.scene.add(this.renderedSun);
    // MERCURY
    this.renderedMercury = mercury.build();
    this.renderedMercury.position.set(-120, 330, -700);
    this.scene.add(this.renderedMercury);
    // VENUS
    this.renderedVenus = venus.build();
    this.renderedVenus.position.set(-120, 330, 500);
    this.scene.add(this.renderedVenus);
    // EARTH
    this.renderedEarth = earth.build();
    this.renderedEarth.position.set(120, 330, 1000);
    this.scene.add(this.renderedEarth);
    // MOON
    this.renderedMoon = moon.build();
    this.renderedMoon.position.set(290, 330, 900);
    this.scene.add(this.renderedMoon);

    // DEVELOPMENT CONTROL - FUTURE USE: FREE WALK
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // const lightHelper = new THREE.PointLightHelper(pointLight);
    // const gridHelper = new THREE.GridHelper(200, 50);
    // this.scene.add(lightHelper, gridHelper);

    this.update();
  }

  // ******************* PUBLIC EVENTS ******************* //
  updateValue(value) {
    // Whatever you need to do with React props
  }

  onScroll() {
    const t = document.body.getBoundingClientRect().top;
    // console.log(t);
    // Mouse Scrolls
    this.camera.position.z = t * -2 + 30;
    this.camera.position.x = t * -0.0002 - 3;
    this.camera.rotation.y = t * 0.0001;
  }

  onMouseMove(e) {
    // Mouse moves
    // console.log(e);
  }

  onWindowResize(vpW, vpH) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(vpW, vpH);
  }

  // ******************* RENDER LOOP ******************* //
  update(t) {
    // console.log(t);
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    animate.bind(this)();

    requestAnimationFrame(this.update.bind(this));
  }
}
