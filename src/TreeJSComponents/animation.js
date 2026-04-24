let _t = 0;

function animate() {
  _t += 0.005;

  this.renderedSun.rotation.y += 0.001;

  // Pulse the outer corona sprite scale
  const sunPulse = 1 + Math.sin(_t * 0.9) * 0.04;
  const sunSprite = this.renderedSun.children[3]; // outer glow sprite
  if (sunSprite) sunSprite.scale.setScalar(420 * 6.5 * sunPulse);
  const sunFlare = this.renderedSun.children[4];  // inner flare sprite
  if (sunFlare) sunFlare.material.opacity = 0.45 + Math.sin(_t * 1.4) * 0.12;

  this.renderedMercury.rotation.y += 0.005;

  this.venusObj.rotation.y += 0.0025;
  this.renderedVenus.rotation.y += 0.001;

  this.earthObj.rotation.y += 0.002;
  this.renderedEarth.rotation.y += 0.0015;

  this.marsObj.rotation.y += 0.0016;
  this.renderedMars.rotation.y += 0.0014;

  this.jupiterObj.rotation.y += 0.001;
  this.renderedJupiter.rotation.y += 0.003;

  this.saturnObj.rotation.y += 0.0008;
  this.renderedSaturn.rotation.y += 0.0025;

  this.uranusObj.rotation.y += 0.0006;
  this.renderedUranus.rotation.y += 0.0018;

  this.neptuneObj.rotation.y += 0.0005;
  this.renderedNeptune.rotation.y += 0.0016;

  // Alien saucer — elliptical orbit between Earth and Mars with hover bob
  this.renderedSpaceship.position.x = 900 + Math.cos(_t * 0.4) * 600;
  this.renderedSpaceship.position.y = 700 + Math.sin(_t * 1.2) * 40;
  this.renderedSpaceship.position.z = 1800 + Math.sin(_t * 0.4) * 900;
  this.renderedSpaceship.rotation.y += 0.012;

  // Pulse saucer rim lights
  const pulse = 0.8 + Math.sin(_t * 3) * 0.4;
  this.renderedSpaceship.children.forEach((child) => {
    if (child.material && child.material.emissive && child.material.color.r === 0) {
      child.material.emissiveIntensity = pulse;
    }
  });

  // Enterprise — slow patrol arc, banking gently
  this.renderedEnterprise.position.x = -400 + Math.cos(_t * 0.18) * 500;
  this.renderedEnterprise.position.y = 500 + Math.sin(_t * 0.25) * 80;
  this.renderedEnterprise.position.z = 2800 + Math.sin(_t * 0.18) * 400;
  this.renderedEnterprise.rotation.y = Math.PI / 4 + Math.sin(_t * 0.18) * 0.4;
  this.renderedEnterprise.rotation.z = Math.sin(_t * 0.18) * 0.08;

  // Borg cube — slow tumble, drifting toward Saturn ominously
  this.renderedBorg.rotation.x += 0.002;
  this.renderedBorg.rotation.y += 0.003;
  this.renderedBorg.rotation.z += 0.001;
  this.renderedBorg.position.x = 600 + Math.sin(_t * 0.1) * 150;
  this.renderedBorg.position.y = 400 + Math.cos(_t * 0.12) * 60;

  // Millennium Falcon — fast erratic flight, banking hard on turns
  this.renderedFalcon.position.x = -500 + Math.cos(_t * 0.65) * 550;
  this.renderedFalcon.position.y =  550 + Math.sin(_t * 0.85) * 160;
  this.renderedFalcon.position.z = 3200 + Math.sin(_t * 0.5)  * 450;
  this.renderedFalcon.rotation.y  = Math.PI * 0.75 + _t * 0.35;
  this.renderedFalcon.rotation.z  = Math.sin(_t * 0.65) * 0.45;  // banking
  this.renderedFalcon.rotation.x  = Math.cos(_t * 0.85) * 0.18;

  // Imperial Star Destroyer — slow, imposing patrol; barely rotates
  this.renderedISD.position.x = 300 + Math.sin(_t * 0.07) * 350;
  this.renderedISD.position.y = 250 + Math.cos(_t * 0.05) * 80;
  this.renderedISD.rotation.y = Math.PI * 0.1 + Math.sin(_t * 0.07) * 0.25;
  this.renderedISD.rotation.x = Math.sin(_t * 0.04) * 0.04; // barely any pitch

  // Death Star — menacing slow orbit + rotation + pulsing superlaser
  this.deathStarObj.rotation.y += 0.00018;
  this.renderedDeathStar.rotation.y += 0.0006;
  const ll = this.renderedDeathStar.userData.laserLight;
  if (ll) ll.intensity = 4 + Math.sin(_t * 1.8) * 2;
  const em = this.renderedDeathStar.userData.emitter;
  if (em) em.material.emissiveIntensity = 3.5 + Math.sin(_t * 1.8) * 1.5;
}

export { animate };
