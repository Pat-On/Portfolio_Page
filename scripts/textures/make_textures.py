"""Builds the planet textures in src/textures from the Solar System Scope maps.

Source maps: https://www.solarsystemscope.com/textures/ (CC BY 4.0, credited in
the site footer). Download the 2k files listed in SOURCES into one folder, then:

    python scripts/textures/make_textures.py <folder-with-downloads>

Needs Pillow and numpy. Every map is written twice: 2k for desktops and 1k for
phones, where GPU memory is the limit. See README.md next to this file.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parents[2] / "src" / "textures"
SOURCES = [
    "2k_jupiter.jpg", "2k_saturn.jpg", "2k_saturn_ring_alpha.png", "2k_mars.jpg",
    "2k_uranus.jpg", "2k_neptune.jpg", "2k_moon.jpg", "2k_earth_nightmap.jpg",
    "2k_earth_clouds.jpg", "2k_earth_specular_map.tif", "2k_earth_normal_map.tif",
]
BIG, SMALL = (2048, 1024), (1024, 512)


def save(img, name, quality=82):
    img.save(OUT / name, "WEBP", quality=quality, method=6)
    print(f"{name:34s} {img.size[0]}x{img.size[1]}  {(OUT / name).stat().st_size // 1024} KB")


def both_sizes(img, stem, quality=82):
    save(img.resize(BIG, Image.LANCZOS), f"2k_{stem}.webp", quality)
    save(img.resize(SMALL, Image.LANCZOS), f"1k_{stem}.webp", quality)


def relief_from_photo(img, strength):
    """A normal map from a surface photo: only its fine detail (craters, ridges)
    is read as height, so broad light and dark regions do not become slopes."""
    grey = img.convert("L").resize(SMALL, Image.LANCZOS)
    fine = np.asarray(grey, dtype=np.float32) - np.asarray(
        grey.filter(ImageFilter.GaussianBlur(6)), dtype=np.float32)
    h = fine / 255.0
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5
    dy[0, :] = dy[-1, :] = 0          # the poles do not wrap top to bottom
    nx, ny, nz = -dx * strength, dy * strength, np.ones_like(h)
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx * inv, ny * inv, nz * inv], axis=-1) * 0.5 + 0.5
    return Image.fromarray((rgb * 255).round().astype(np.uint8), "RGB")


def steeper(normal_map, factor):
    """Earth's measured relief is true to scale, which from orbit is nearly
    flat. Steepen it so mountain ranges catch the light."""
    n = np.asarray(normal_map, dtype=np.float32) / 255.0 * 2.0 - 1.0
    n[..., 0] *= factor
    n[..., 1] *= factor
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return Image.fromarray(((n * 0.5 + 0.5) * 255).round().astype(np.uint8), "RGB")


def main(src):
    src = Path(src)
    photo = lambda name: Image.open(src / name).convert("RGB")

    # Surfaces. Uranus and Neptune have almost no detail: 1k is all they need.
    for stem in ["jupiter", "saturn", "mars", "moon"]:
        both_sizes(photo(f"2k_{stem}.jpg"), stem)
    for stem in ["uranus", "neptune"]:
        save(photo(f"2k_{stem}.jpg").resize(SMALL, Image.LANCZOS), f"1k_{stem}.webp")

    # Phone-sized copies of the maps the repo already had
    for stem in ["mercury", "venus_surface", "earth_daymap", "sun"]:
        save(Image.open(OUT / f"2k_{stem}.webp").convert("RGB").resize(SMALL, Image.LANCZOS), f"1k_{stem}.webp")

    # Saturn's rings: colour and see-through, one strip from inner to outer edge
    ring = Image.open(src / "2k_saturn_ring_alpha.png").convert("RGBA").resize((1024, 16), Image.LANCZOS)
    ring.save(OUT / "saturn_ring.webp", "WEBP", lossless=True, method=6)
    print("saturn_ring.webp", ring.size)

    # Earth's extras in one picture: R night lights, G clouds, B ocean (it glints).
    # Clouds sit in green because three.js reads a see-through mask from green.
    # The night photo also shows dim land and sea; keep only what is brighter
    # than that floor, so the dark side is dark between the cities
    floor = 26
    lights = photo("2k_earth_nightmap.jpg").convert("L").point(
        lambda v: max(0, v - floor) * 255 // (255 - floor))
    ocean = Image.open(src / "2k_earth_specular_map.tif").convert("L")
    clouds = photo("2k_earth_clouds.jpg").convert("L")
    both_sizes(Image.merge("RGB", [lights, clouds, ocean]), "earth_extras", quality=88)

    # Relief only where there is real relief. Earth's comes measured; the Moon's,
    # Mercury's and Mars's are read off their photos.
    save(steeper(Image.open(src / "2k_earth_normal_map.tif").convert("RGB").resize(SMALL, Image.LANCZOS), 8),
         "1k_earth_normal.webp", quality=90)
    save(relief_from_photo(photo("2k_moon.jpg"), 8), "1k_moon_normal.webp", quality=90)
    save(relief_from_photo(photo("2k_mars.jpg"), 9), "1k_mars_normal.webp", quality=90)
    save(relief_from_photo(Image.open(OUT / "2k_mercury.webp"), 8), "1k_mercury_normal.webp", quality=90)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
