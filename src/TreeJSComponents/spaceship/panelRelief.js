import * as THREE from "three";
import { texSize } from "../../utils/mobileQuality";

// A hull's relief, made from the hull's own painted panels: dark seams and
// insets become grooves, so the bumps line up with what is drawn. Before this
// every ship borrowed the planets' crater map, whose dents had nothing to do
// with its plating.

// Half the hull map's size is plenty for grooves, and a quarter of its memory
export const RELIEF_SIZE = texSize(512);

// Height field (0..1, row-major, top row first as on a canvas) → RGBA normal
// map. Edges wrap. Green is flipped for three.js, which reads a canvas with
// its first row at the top of the texture.
export function heightToNormal(heights, w, h, strength = 2) {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const up = ((y + h - 1) % h) * w, down = ((y + 1) % h) * w, row = y * w;
    for (let x = 0; x < w; x++) {
      const dx = (heights[row + ((x + 1) % w)] - heights[row + ((x + w - 1) % w)]) * 0.5;
      const dy = (heights[down + x] - heights[up + x]) * 0.5;
      const nx = -dx * strength, ny = dy * strength;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const i = (row + x) * 4;
      out[i] = Math.round((nx * inv * 0.5 + 0.5) * 255 + 0.25);
      out[i + 1] = Math.round((ny * inv * 0.5 + 0.5) * 255 + 0.25);
      out[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
      out[i + 3] = 255;
    }
  }
  return out;
}

// The normal map for a hull painted on `hullCanvas`. Brightness is read as
// height. `repeat` matches a hull map that tiles.
export function panelNormalTex(hullCanvas, { strength = 2, repeat = false } = {}) {
  const N = RELIEF_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = N;
  const ctx = canvas.getContext("2d");
  // Scaling down also softens the seams into slopes a light can catch
  ctx.drawImage(hullCanvas, 0, 0, N, N);
  const src = ctx.getImageData(0, 0, N, N);
  if (src && src.data) {
    const heights = new Float32Array(N * N);
    for (let i = 0; i < heights.length; i++) {
      const j = i * 4;
      heights[i] = (src.data[j] * 0.299 + src.data[j + 1] * 0.587 + src.data[j + 2] * 0.114) / 255;
    }
    const img = ctx.createImageData(N, N);
    img.data.set(heightToNormal(heights, N, N, strength * (N / 512) * 4));
    ctx.putImageData(img, 0, 0);
  } else {
    // Could not read the canvas back: a flat map, so the hull is merely smooth
    ctx.fillStyle = "rgb(128,128,255)";
    ctx.fillRect(0, 0, N, N);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
