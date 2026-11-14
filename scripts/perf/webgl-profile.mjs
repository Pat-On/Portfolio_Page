// WebGL baseline profiler for the portfolio's three.js scene.
// Renders the REAL scene (SwiftShader), screenshots it at several scroll depths,
// and records draw calls / programs / texture uploads / frame times per position.
// Usage: node webgl-profile.mjs <outDir> [desktop|mobile|both]
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium, devices } = require("playwright");

const PAGE_URL = process.env.SHOOT_URL || "http://127.0.0.1:4173";
const OUT = process.argv[2] || "./shots";
const WHICH = process.argv[3] || "both";
const STOPS = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0];
const SAMPLE_MS = 2500;
// MOTION=reduce freezes the ambient motion (orbits, ship flights), so two builds'
// screenshots line up frame for frame; draw counts then reflect the start positions.
const MOTION = process.env.MOTION === "reduce" ? { reducedMotion: "reduce" } : {};

const instrument = () => {
  const S = (window.__glstats = {
    frames: 0, draws: 0, tris: 0, programs: 0, links: 0, linkMs: 0,
    texUploads: 0, texBytes: 0, storageCalls: 0, storageBytes: 0, frameDraws: [], frameTimes: [], ctxCount: 0,
  });
  let drawsThisFrame = 0;
  const wrap = (proto) => {
    if (!proto || proto.__wrapped) return;
    proto.__wrapped = true;
    const countDraw = (name, triFn) => {
      const orig = proto[name];
      if (!orig) return;
      proto[name] = function (...a) { S.draws++; drawsThisFrame++; S.tris += triFn(a); return orig.apply(this, a); };
    };
    const tri = (mode, n, inst = 1) => (mode === 4 ? (n / 3) * inst : 0); // TRIANGLES only
    countDraw("drawElements", (a) => tri(a[0], a[1]));
    countDraw("drawArrays", (a) => tri(a[0], a[2]));
    countDraw("drawElementsInstanced", (a) => tri(a[0], a[1], a[4]));
    countDraw("drawArraysInstanced", (a) => tri(a[0], a[2], a[3]));
    const origLink = proto.linkProgram;
    proto.linkProgram = function (p) {
      const t = performance.now(); const r = origLink.call(this, p);
      this.getProgramParameter(p, this.LINK_STATUS); // force sync completion so timing is real
      S.links++; S.linkMs += performance.now() - t; return r;
    };
    const origCreate = proto.createProgram;
    proto.createProgram = function () { S.programs++; return origCreate.call(this); };
    // WebGL2 three.js allocates image textures with texStorage2D (immutable, all mip levels),
    // then fills them with texSubImage2D, so texImage2D alone misses most of them.
    // Bytes per pixel by internal format; block-compressed formats are per 4x4 block.
    const BPP = {
      0x8058: 4, 0x8c43: 4, 0x8051: 4, 0x8c41: 4, 0x881a: 8, 0x8814: 16, 0x8229: 1, 0x822b: 2,
      0x83f0: 0.5, 0x83f1: 0.5, 0x83f3: 1, 0x8e8c: 1, 0x8e8d: 1, 0x93b0: 1, 0x93d0: 1,
      0x9274: 0.5, 0x9275: 0.5, 0x9278: 1, 0x9279: 1, 0x8d64: 0.5,
    };
    const origStorage = proto.texStorage2D;
    if (origStorage) {
      proto.texStorage2D = function (target, levels, fmt, w, h) {
        S.storageCalls++;
        const bpp = BPP[fmt] ?? 4;
        for (let i = 0, lw = w, lh = h; i < levels; i++, lw = Math.max(1, lw >> 1), lh = Math.max(1, lh >> 1)) {
          S.storageBytes += lw * lh * bpp * (target === this.TEXTURE_CUBE_MAP ? 6 : 1);
        }
        return origStorage.apply(this, arguments);
      };
    }
    const origTex = proto.texImage2D;
    proto.texImage2D = function (...a) {
      S.texUploads++;
      let w = 0, h = 0;
      if (a.length >= 9) { w = a[3]; h = a[4]; }
      else { const src = a[a.length - 1]; w = src?.width || src?.videoWidth || 0; h = src?.height || src?.videoHeight || 0; }
      S.texBytes += w * h * 4;
      return origTex.apply(this, a);
    };
  };
  wrap(window.WebGLRenderingContext?.prototype);
  wrap(window.WebGL2RenderingContext?.prototype);
  let last = performance.now();
  const tick = (t) => {
    if (drawsThisFrame) { S.frames++; S.frameDraws.push(drawsThisFrame); S.frameTimes.push(t - last); }
    drawsThisFrame = 0; last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const pct = (arr, p) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

async function run(label, ctxOpts) {
  const browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const ctx = await browser.newContext({ ...ctxOpts, ...MOTION });
  const page = await ctx.newPage();
  const net = { bytes: 0, byType: {} };
  page.on("response", async (r) => {
    try {
      const len = Number(r.headers()["content-length"] || (await r.body()).length);
      const type = r.request().resourceType();
      net.bytes += len; net.byType[type] = (net.byType[type] || 0) + len;
    } catch {}
  });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));

  await page.addInitScript(instrument);
  const t0 = Date.now();
  await page.goto(PAGE_URL, { waitUntil: "load" });
  await page.waitForSelector(".loading-screen", { state: "detached", timeout: 60000 });
  const readyMs = Date.now() - t0;
  await page.waitForTimeout(Number(process.env.SETTLE_MS || 1500)); // let lazy bloom composer + textures land

  const dir = `${OUT}/${label}`;
  await mkdir(dir, { recursive: true });
  const rows = [];
  for (const stop of STOPS) {
    await page.evaluate((s) => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * s), stop);
    await page.waitForTimeout(600);
    await page.evaluate(() => { const S = window.__glstats; S.frameDraws = []; S.frameTimes = []; S.tris = 0; S.frames = 0; });
    await page.waitForTimeout(SAMPLE_MS);
    const s = await page.evaluate(() => {
      const S = window.__glstats;
      return { frames: S.frames, draws: S.frameDraws, ft: S.frameTimes, tris: S.tris };
    });
    // Hide DOM content so the screenshot shows the scene itself, then restore.
    const tag = await page.addStyleTag({ content: "main, .App > *:not(canvas){visibility:hidden!important}" });
    await page.screenshot({ path: `${dir}/scene_${String(Math.round(stop * 100)).padStart(3, "0")}.png` });
    await tag.evaluate((n) => n.remove());
    await page.screenshot({ path: `${dir}/page_${String(Math.round(stop * 100)).padStart(3, "0")}.png` });
    rows.push({
      stop, fpsHeadless: +(s.frames / (SAMPLE_MS / 1000)).toFixed(1),
      drawsPerFrame: pct(s.draws, 0.5), drawsMax: Math.max(0, ...s.draws),
      trisPerFrame: s.frames ? Math.round(s.tris / s.frames) : 0,
      frameMsP50: +pct(s.ft, 0.5).toFixed(1), frameMsP95: +pct(s.ft, 0.95).toFixed(1),
    });
  }
  const totals = await page.evaluate(() => {
    const S = window.__glstats;
    return { programs: S.programs, links: S.links, linkMs: Math.round(S.linkMs), texUploads: S.texUploads, texMB: +(S.texBytes / 1048576).toFixed(1), storageCalls: S.storageCalls, storageMB: +(S.storageBytes / 1048576).toFixed(1) };
  });
  const result = { label, readyMs, net: { totalMB: +(net.bytes / 1048576).toFixed(2), byTypeKB: Object.fromEntries(Object.entries(net.byType).map(([k, v]) => [k, Math.round(v / 1024)])) }, totals, rows, errors: [...new Set(errors)].slice(0, 15) };
  await writeFile(`${dir}/stats.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

if (WHICH !== "mobile") await run("desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
if (WHICH !== "desktop") await run("mobile", { ...devices["Pixel 7"] });
