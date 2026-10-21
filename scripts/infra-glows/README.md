# Infrastructure glow rasters

`public/infrastructure/env-glow.png` is the section's blurred ambient
glow, pre-rendered: it was an SVG `feGaussianBlur` filter (stdDeviation
150) and phones re-ran it on every repaint of the animating SVG, which is
what made the frame switches stutter (Jasper, iPhone, 2026-09-08). The
page here draws the exact original markup — the ambient ellipse with its
lighten-blended grain (the generator copied from Infrastructure.tsx) —
and headless Chrome screenshots it on a transparent ground. (A second
raster, the panel's top wash, came and went: Vector 24, then Ellipse
21903, both dropped from the design on 2026-10-21 — "避免波纹状".)

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# the ambient: 0.5x over its filter region (x -503.2, y -125.1, 1932 x 966)
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --default-background-color=00000000 --virtual-time-budget=3000 --window-size=966,483 \
  --screenshot=public/infrastructure/env-glow.png "file://$PWD/scripts/infra-glows/env-glow.html"
```

The `<image>` element in Infrastructure.tsx is placed at that region. A
blur has no detail finer than its radius, so a 0.5x raster is exact
enough at any screen density.
