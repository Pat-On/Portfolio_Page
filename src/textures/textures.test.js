import fs from "fs";
import path from "path";

// Reads a WebP's pixel size from its header (lossy VP8, lossless VP8L or extended VP8X).
function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${file} is not a WebP`);
  }
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`${file}: unknown WebP chunk ${chunk}`);
}

const tex = (name) => path.join(__dirname, name);

describe("texture budget", () => {
  // One 2048×1024 normal map is ~11 MB on the GPU with mipmaps; the old
  // 4000×2000 one was ~41 MB per upload.
  test("normal.webp is at most 2048×1024", () => {
    const { w, h } = webpSize(tex("normal.webp"));
    expect(w).toBeLessThanOrEqual(2048);
    expect(h).toBeLessThanOrEqual(1024);
  });
});
