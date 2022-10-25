function animate() {
  this.renderedSun.rotation.y += 0.001;
  this.renderedMercury.rotation.y += 0.005;
  this.venusObj.rotation.y += 0.0025;
  this.earthObj.rotation.y += 0.0025;
  this.renderedEarth.rotation.y += 0.0015;
}

export { animate };
