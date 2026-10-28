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

  // logo192.png and logo512.png were referenced here for a long time without ever being in
  // public/, so the apple-touch-icon and og:image tags both pointed at a 404.
  test("only references assets that are actually in public/", () => {
    const referenced = [...html.matchAll(/%PUBLIC_URL%\/([\w.-]+)/g)].map((m) => m[1]);
    expect(referenced.length).toBeGreaterThan(0);
    const missing = referenced.filter(
      (file) => !fs.existsSync(path.resolve(__dirname, "../public", file))
    );
    expect(missing).toEqual([]);
  });

  test("gives the deployed URL to link previews and to the Person schema", () => {
    const SITE = "https://patryk-nowak-portfolio.netlify.app/";
    expect(html).toContain(`<meta property="og:url" content="${SITE}" />`);
    const ld = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]
    );
    expect(ld.url).toBe(SITE);
  });
});
