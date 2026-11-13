const THREE = require("three");
const { heightToNormal, panelNormalTex, RELIEF_SIZE } = require("./panelRelief");

const px = (data, w, x, y) => Array.from(data.slice((y * w + x) * 4, (y * w + x) * 4 + 4));

describe("heightToNormal()", () => {
  test("a flat hull gives the straight-up normal everywhere", () => {
    const out = heightToNormal(new Float32Array(16).fill(0.5), 4, 4, 2);
    for (let i = 0; i < 16; i++) expect(px(out, 4, i % 4, Math.floor(i / 4))).toEqual([128, 128, 255, 255]);
  });

  test("a groove's walls lean into it: left wall towards +x, right wall towards -x", () => {
    // 8 wide: plate, a dark seam in columns 3-4, plate
    const w = 8, h = 4, heights = new Float32Array(w * h).fill(1);
    for (let y = 0; y < h; y++) { heights[y * w + 3] = 0; heights[y * w + 4] = 0; }
    const out = heightToNormal(heights, w, h, 2);
    expect(px(out, w, 2, 1)[0]).toBeGreaterThan(140);   // going down to the right
    expect(px(out, w, 5, 1)[0]).toBeLessThan(116);      // coming back up
    expect(px(out, w, 0, 1)).toEqual([128, 128, 255, 255]);
  });

  test("a horizontal seam tilts the green channel, the way three.js reads a flipped canvas", () => {
    const w = 4, h = 8, heights = new Float32Array(w * h).fill(1);
    for (let x = 0; x < w; x++) heights[4 * w + x] = 0;
    const out = heightToNormal(heights, w, h, 2);
    // Row 3 is above the seam on the canvas: the surface drops as v decreases
    expect(px(out, w, 1, 3)[1]).toBeLessThan(116);
    expect(px(out, w, 1, 5)[1]).toBeGreaterThan(140);
  });

  test("more strength, steeper walls", () => {
    const w = 8, h = 1, heights = Float32Array.from([1, 1, 1, 0, 0, 1, 1, 1]);
    const soft = heightToNormal(heights, w, h, 1), hard = heightToNormal(heights, w, h, 4);
    expect(px(hard, w, 2, 0)[0]).toBeGreaterThan(px(soft, w, 2, 0)[0]);
  });
});

describe("panelNormalTex()", () => {
  const fakeCanvas = (data) => {
    HTMLCanvasElement.prototype.getContext = function () {
      const noop = () => {};
      return new Proxy(
        { getImageData: (x, y, w, h) => (data ? { data: new Uint8ClampedArray(w * h * 4).fill(data), width: w, height: h } : undefined),
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) },
        { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
      );
    };
    return document.createElement("canvas");
  };

  test("makes a small data texture of the hull's own panels, tiled like the hull's map", () => {
    const tex = panelNormalTex(fakeCanvas(90));
    expect(tex.isCanvasTexture).toBe(true);
    expect(tex.image.width).toBe(RELIEF_SIZE);
    expect(tex.colorSpace).toBe(THREE.NoColorSpace);
  });

  test("copes with a browser that will not read the canvas back", () => {
    expect(() => panelNormalTex(fakeCanvas(null))).not.toThrow();
  });

  test("starts flat and works the grooves out later, off the loading path", () => {
    jest.useFakeTimers();
    try {
      const reads = [];
      const canvas = fakeCanvas(90);
      const real = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function () {
        const ctx = real.call(this);
        return new Proxy(ctx, { get: (t, k) => (k === "getImageData" ? (...a) => { reads.push(a); return t.getImageData(...a); } : t[k]) });
      };
      // A fresh copy of the module: its queue must start on the fake clock
      let fresh;
      jest.isolateModules(() => { fresh = require("./panelRelief"); });
      const tex = fresh.panelNormalTex(canvas);
      const before = tex.version;
      jest.runAllTimers();
      expect(reads).toHaveLength(0);          // not before the scene is on screen
      fresh.startRelief();
      expect(reads).toHaveLength(0);          // and not in the same breath
      jest.runAllTimers();
      expect(reads).toHaveLength(1);
      expect(tex.version).toBeGreaterThan(before);
    } finally {
      jest.useRealTimers();
    }
  });
});
