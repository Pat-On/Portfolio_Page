class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z)          { this.x = x; this.y = y; this.z = z; return this; }
  copy(v)               { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone()               { return new Vector3(this.x, this.y, this.z); }
  addScaledVector()     { return this; }
  subVectors()          { return this; }
  normalize()           { return this; }
  multiplyScalar()      { return this; }
  add()                 { return this; }
  distanceTo()          { return 0; }
}

class Quaternion {
  constructor()              { this.x = 0; this.y = 0; this.z = 0; this.w = 1; }
  setFromUnitVectors()       { return this; }
  slerp()                    { return this; }
  setFromEuler()             { return this; }
  copy()                     { return this; }
  identity()                 { return this; }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set()                      { return this; }
}

class Color {
  constructor(c) { this.c = c; }
}

class SphereGeometry {
  constructor(r, w, h) { this.r = r; this.w = w; this.h = h; }
  dispose()            {}
}

class BoxGeometry {
  constructor() {}
  dispose()     {}
}

class CylinderGeometry {
  constructor() {}
  dispose()     {}
}

class MeshStandardMaterial {
  constructor(params = {}) { Object.assign(this, params); this.isMaterial = true; }
  dispose()                {}
}

class MeshBasicMaterial {
  constructor(params = {}) { Object.assign(this, params); this.isMaterial = true; }
  dispose()                {}
}

class MeshPhongMaterial {
  constructor(params = {}) { Object.assign(this, params); this.isMaterial = true; }
  dispose()                {}
}

class Mesh {
  constructor(geometry, material) {
    this.geometry  = geometry;
    this.material  = material;
    this.visible   = true;
    this.isMesh    = true;
    this.userData  = {};
    this.position  = new Vector3();
    this.rotation  = new Euler();
    this.scale     = { x: 1, y: 1, z: 1, setScalar: jest.fn() };
    this.quaternion = new Quaternion();
    this.add       = jest.fn();
    this.traverse  = jest.fn();
  }
}

class Group {
  constructor() {
    this.children  = [];
    this.visible   = true;
    this.userData  = {};
    this.position  = new Vector3();
    this.rotation  = new Euler();
    this.scale     = { x: 1, y: 1, z: 1, setScalar: jest.fn() };
    this.quaternion = new Quaternion();
    this.add       = jest.fn((c) => { this.children.push(c); });
    this.traverse  = jest.fn();
  }
}

class PointLight {
  constructor(color, intensity = 1, distance = 0) {
    this.color     = color;
    this.intensity = intensity;
    this.distance  = distance;
    this.position  = new Vector3();
  }
}

class TextureLoader {
  load() { return { wrapS: 0, wrapT: 0, offset: { x: 0, y: 0 } }; }
}

class CanvasTexture {
  constructor(canvas) { this.image = canvas; this.offset = { x: 0, y: 0 }; }
  dispose() {}
}

class SpriteMaterial {
  constructor(params = {}) { Object.assign(this, params); this.rotation = 0; }
  dispose() {}
}

class Sprite {
  constructor(material) {
    this.material  = material;
    this.userData  = {};
    this.position  = new Vector3();
    this.rotation  = new Euler();
    this.scale     = { x: 1, y: 1, z: 1, setScalar: jest.fn() };
    this.quaternion = new Quaternion();
    this.isSprite  = true;
  }
}

class TubeGeometry {
  constructor() {}
  dispose() {}
}

class QuadraticBezierCurve3 {
  constructor(v0, v1, v2) { this.v0 = v0; this.v1 = v1; this.v2 = v2; }
}

class RingGeometry {
  constructor() {}
  dispose() {}
}

class Clock {
  getDelta() { return 0.016; }
}

class Scene {
  constructor() { this.children = []; this.add = jest.fn(); this.remove = jest.fn(); }
}

class Matrix4 {
  lookAt()                { return this; }
  setFromRotationMatrix() { return this; }
}

class PerspectiveCamera {
  constructor() {
    this.position  = new Vector3();
    this.rotation  = new Euler();
    this.quaternion = new Quaternion();
    this.getWorldDirection = jest.fn((v) => { if (v) { v.x = 0; v.y = 0; v.z = -1; } return v; });
    this.updateProjectionMatrix = jest.fn();
    this.lookAt    = jest.fn();
  }
}

module.exports = {
  Vector3,
  Quaternion,
  Euler,
  Color,
  SphereGeometry,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Mesh,
  Group,
  PointLight,
  TextureLoader,
  Clock,
  Matrix4,
  Scene,
  PerspectiveCamera,
  CanvasTexture,
  SpriteMaterial,
  Sprite,
  TubeGeometry,
  QuadraticBezierCurve3,
  RingGeometry,
  AdditiveBlending: 2,
  NormalBlending: 1,
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  RepeatWrapping: 1000,
  EquirectangularReflectionMapping: 303,
};
