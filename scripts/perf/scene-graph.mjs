// Reaches the live ViewGL instance through React's fiber (Scene's apiRef prop)
// and reports per-object draw cost, lights, materials and GPU texture sizes.
import { createRequire } from "node:module";
const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.env.SHOOT_URL || "http://127.0.0.1:4173", { waitUntil: "load" });
await page.waitForSelector(".loading-screen", { state: "detached", timeout: 60000 });
await page.waitForTimeout(2000);

const report = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const key = Object.keys(canvas).find((k) => k.startsWith("__reactFiber"));
  let f = canvas[key];
  while (f && !(f.memoizedProps && f.memoizedProps.apiRef)) f = f.return;
  const gl = f.memoizedProps.apiRef.current;
  window.__viewgl = gl;
  const scene = gl.scene;
  const lights = { PointLight: 0, SpotLight: 0, DirectionalLight: 0, AmbientLight: 0 };
  const mats = new Set(), geos = new Set(), texs = new Map();
  let total = 0;
  const per = [];
  const count = (root) => {
    let n = 0, tris = 0, transparent = 0;
    root.traverse((o) => {
      if (o.isLight && lights[o.type] !== undefined) lights[o.type]++;
      if (o.isMesh || o.isPoints || o.isSprite || o.isLine) {
        n++;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => {
          mats.add(m.uuid);
          if (m.transparent) transparent++;
          for (const k of ["map", "normalMap", "emissiveMap", "roughnessMap", "alphaMap", "bumpMap", "metalnessMap"]) {
            const t = m[k]; if (t && t.image) texs.set(t.uuid, { k, w: t.image.width, h: t.image.height, mip: t.generateMipmaps });
          }
        });
        if (o.geometry) {
          geos.add(o.geometry.uuid);
          const g = o.geometry; const c = g.index ? g.index.count : g.attributes.position?.count || 0;
          tris += o.isMesh ? c / 3 : 0;
        }
      }
    });
    return { n, tris: Math.round(tris), transparent };
  };
  for (const child of scene.children) {
    const c = count(child);
    let name = child.type;
    for (const k of Object.keys(gl)) if (gl[k] === child || (gl[k] && gl[k].isObject3D && child.children.includes(gl[k]))) { name = k; break; }
    per.push({ name, ...c });
    total += c.n;
  }
  const bg = scene.background;
  if (bg && bg.image) texs.set(bg.uuid, { k: "background", w: bg.image.width, h: bg.image.height, mip: bg.generateMipmaps });
  let texMB = 0;
  const texList = [...texs.values()].map((t) => { const mb = (t.w * t.h * 4 * (t.mip ? 4 / 3 : 1)) / 1048576; texMB += mb; return { ...t, mb: +mb.toFixed(1) }; }).sort((a, b) => b.mb - a.mb);
  return {
    renderables: total, materials: mats.size, geometries: geos.size, lights,
    rendererInfo: gl.renderer.info.render, programs: gl.renderer.info.programs?.length,
    pixelRatio: gl.renderer.getPixelRatio(), toneMapping: gl.renderer.toneMapping, composer: !!gl._composer,
    texMBestimate: +texMB.toFixed(1), topTextures: texList.slice(0, 12),
    perObject: per.sort((a, b) => b.n - a.n),
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
