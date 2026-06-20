const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.resolve(__dirname, "../public/index.html"),
  "utf8"
);

describe("public/index.html", () => {
  test("has a format-detection meta tag to stop iOS auto-linking (blue text)", () => {
    expect(html).toMatch(/name=["']format-detection["']/);
    expect(html).toMatch(/telephone=no/);
  });

  test("loads the Nunito and Josefin Sans web fonts", () => {
    expect(html).toMatch(/fonts\.googleapis\.com/);
    expect(html).toMatch(/Nunito/);
    expect(html).toMatch(/Josefin\+Sans/);
  });
});
