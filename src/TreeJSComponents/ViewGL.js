import * as THREE from "three";

import { moon, sun, mercury, venus, earth } from "./planets/solarSystem";
import { ambientLight } from "./lights/lights";
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

    this.pointLightInstance = new THREE.PointLight(0xffffff, 2, 9000);
    this.pointLightInstance.position.set(350, 300, -900);
    this.renderer.render(this.scene, this.camera);
    // Lights
    this.scene.add(this.pointLightInstance, ambientLight);

    // SUN
    this.renderedSun = sun.build();
    this.renderedSun.position.set(350, 300, -900);
    this.scene.add(this.renderedSun);
    // MERCURY
    this.renderedMercury = mercury.build();
    this.renderedMercury.position.set(0, 0, 700);
    this.renderedSun.add(this.renderedMercury);

    // VENUS
    this.renderedVenus = venus.build();
    this.renderedVenus.position.set(0, 0, 900);
    this.venusObj = new THREE.Object3D();
    this.venusObj.position.set(350, 300, -900);
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
    this.earthObj.position.set(350, 300, -900);
    this.earthObj.add(this.renderedEarth);

    this.scene.add(this.earthObj);

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
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();
    animate.bind(this)();

    requestAnimationFrame(this.update.bind(this));
  }
}
