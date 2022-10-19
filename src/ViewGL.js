import * as THREE from "three";
import space from "./pexels-felix-mittermeier-956999.jpeg";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function animate() {
  this.torus.rotation.x += 0.01;
  this.torus.rotation.y += 0.005;
  this.torus.rotation.z += 0.01;
}

export default class ViewGL {
  constructor(canvasRef) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef,
      antialias: false,
    });
    const t = document.body.getBoundingClientRect().top;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.setZ(t * -0.05 + 30);
    this.camera.position.setX(t * -0.0002 - 3);

    this.renderer.render(this.scene, this.camera);
    // this.scene.add(torus);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Torus
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
    this.torus = new THREE.Mesh(geometry, material);
    // Create meshes, materials, etc.
    this.scene.add(this.torus);

    // Lights

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(pointLight, ambientLight);

    const spaceTexture = new THREE.TextureLoader().load(space);
    this.scene.background = spaceTexture;

    function addStar() {
      const geometry = new THREE.SphereGeometry(0.25, 24, 24);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(100));

      star.position.set(x, y, z);
      this.scene.add(star);
    }

    Array(200)
      .fill()
      .forEach(addStar.bind(this));

    this.update();
  }

  // ******************* PUBLIC EVENTS ******************* //
  updateValue(value) {
    // Whatever you need to do with React props
  }

  onScroll() {
    const t = document.body.getBoundingClientRect().top;
    console.log(t);
    // Mouse Scrolls
    this.camera.position.z = t * -0.05 + 30;
    this.camera.position.x = t * -0.0002 - 3;
    this.camera.rotation.y = t * -0.0002;
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
    this.controls.update();
    animate.bind(this)();

    requestAnimationFrame(this.update.bind(this));
  }
}
