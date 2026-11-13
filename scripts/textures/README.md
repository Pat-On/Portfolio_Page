# Planet textures

`make_textures.py` turns the downloaded source maps into the WebP files in `src/textures`.

- **Source:** Solar System Scope, <https://www.solarsystemscope.com/textures/>, licensed CC BY 4.0. The site
  footer carries the credit; keep it there for as long as these maps are used.
- **Sizes:** every surface is written at 2048×1024 for desktops and 1024×512 for phones. Uranus and Neptune, and
  all relief maps, are 1024×512 everywhere.
- **Earth's extras** (`*_earth_extras.webp`) pack three greyscale maps into one picture: red is the night-side
  city lights, green the oceans (they glint), blue the clouds.
- **Relief:** Earth's is the measured map. The Moon's, Mercury's and Mars's are worked out from the fine detail
  of their photos. Gas giants, Venus and the sun have none.
- **Format:** WebP. GPU-compressed KTX2 was tried on the Jupiter and Mars maps: it saves about 8 MB of GPU memory
  per 2k map but triples the download at slightly lower quality (ETC1S) or multiplies it by ten (UASTC), and
  needs a 576 KB transcoder. The scene fits its memory budget without it.

```bash
python scripts/textures/make_textures.py <folder-with-the-downloaded-maps>
```

Needs Pillow and numpy.
