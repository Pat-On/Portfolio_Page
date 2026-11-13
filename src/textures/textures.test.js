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

  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".webp"));

  test.each(files.filter((f) => f.startsWith("2k_")))("%s is 2048×1024, the desktop size", (f) => {
    expect(webpSize(tex(f))).toEqual({ w: 2048, h: 1024 });
  });

  test.each(files.filter((f) => f.startsWith("1k_")))("%s is 1024×512, the phone size", (f) => {
    expect(webpSize(tex(f))).toEqual({ w: 1024, h: 512 });
  });

  // A phone must never have to load a 2k map (8 MB of GPU memory each)
  test.each(files.filter((f) => f.startsWith("2k_")))("%s has a 1k twin for phones", (f) => {
    expect(files).toContain(f.replace(/^2k_/, "1k_"));
  });

  test("the photo maps for every painted planet and the moon are there", () => {
    ["2k_jupiter", "2k_saturn", "2k_mars", "1k_uranus", "1k_neptune", "2k_moon", "saturn_ring"].forEach((n) =>
      expect(files).toContain(`${n}.webp`));
  });
});
