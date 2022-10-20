function animate() {
  //   this.renderedSun.rotation.x += 0.01;
  this.renderedSun.rotation.y += 0.0005;
  // this.torus.rotation.z += 0.01;

  //   this.renderedMercury.rotation.x += 0.01;
  this.renderedMercury.rotation.y += 0.005;
  // this.renderedMercury.rotation.z += 0.01;

  //   this.renderedVenus.rotation.x += 0.01;
  this.renderedVenus.rotation.y += 0.0025;
  // this.renderedVenus.rotation.z += 0.01;

  //   this.renderedEarth.rotation.x += 0.01;
  this.renderedEarth.rotation.y += 0.0005;
  // this.renderedEarth.rotation.z += 0.01;

  //   this.renderedMoon.rotation.x += 0.01;
  this.renderedMoon.rotation.y += 0.003;
  // this.renderedMoon.rotation.z += 0.01;
}

export { animate };
