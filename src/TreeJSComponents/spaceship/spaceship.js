import * as THREE from "three";

class Spaceship {
  build() {
    const group = new THREE.Group();

    // Main disc
    const discGeo = new THREE.SphereGeometry(40, 32, 16);
    discGeo.scale(1, 0.18, 1);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      metalness: 0.85,
      roughness: 0.15,
    });
    group.add(new THREE.Mesh(discGeo, discMat));

    // Rim torus
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xaabbcc,
      metalness: 0.9,
      roughness: 0.1,
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(39, 3, 8, 48), rimMat);
    group.add(rim);

    // Glass dome
    const domeGeo = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x44ffaa,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      metalness: 0.1,
      emissive: 0x22aa66,
      emissiveIntensity: 0.4,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 7;
    group.add(dome);

    // Rim lights
    this._rimLights = [];
    const rimLightMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
    });
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const light = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), rimLightMat.clone());
      light.position.set(Math.cos(angle) * 39, -1, Math.sin(angle) * 39);
      this._rimLights.push(light);
      group.add(light);
    }

    // Engine cone underneath
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.75,
    });
    const engine = new THREE.Mesh(new THREE.ConeGeometry(10, 14, 16), engineMat);
    engine.position.y = -10;
    engine.rotation.x = Math.PI;
    group.add(engine);

    // Interior point light
    const glow = new THREE.PointLight(0x00ffcc, 1.5, 300);
    glow.position.y = 5;
    group.add(glow);

    return group;
  }
}

export const spaceship = new Spaceship();
