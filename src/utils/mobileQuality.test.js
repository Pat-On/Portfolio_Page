describe("pickMap()", () => {
  const load = (mobile) => {
    let mod;
    jest.isolateModules(() => {
      jest.doMock("./isMobileDevice", () => ({ isMobileDevice: () => mobile }));
      mod = require("./mobileQuality");
    });
    return mod;
  };

  test("desktops get the 2k map", () => {
    expect(load(false).pickMap("big.webp", "small.webp")).toBe("big.webp");
  });

  test("phones get the 1k map, a quarter of the memory", () => {
    expect(load(true).pickMap("big.webp", "small.webp")).toBe("small.webp");
  });
});
