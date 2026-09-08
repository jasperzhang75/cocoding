# Infrastructure glow rasters

`public/infrastructure/wash.png` and `env-glow.png` are the section's two
blurred glows, pre-rendered: they were SVG `feGaussianBlur` filters
(stdDeviation 30.3 and 150) and phones re-ran them on every repaint of
the animating SVG, which is what made the frame switches stutter
(Jasper, iPhone, 2026-09-08). The pages here draw the exact original
markup — the wash path with its filter region, the ambient ellipse with
its lighten-blended grain (the generator copied from Infrastructure.tsx)
— and headless Chrome screenshots them on a transparent ground.

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# the wash: 2x over its filter region (x -182.5, y -148, 1095.5 x 592.5)
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --default-background-color=00000000 --virtual-time-budget=3000 --window-size=2191,1185 \
  --screenshot=public/infrastructure/wash.png "file://$PWD/scripts/infra-glows/wash.html"
# the ambient: 0.5x over its filter region (x -503.2, y -125.1, 1932 x 966)
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --default-background-color=00000000 --virtual-time-budget=3000 --window-size=966,483 \
  --screenshot=public/infrastructure/env-glow.png "file://$PWD/scripts/infra-glows/env-glow.html"
```

The `<image>` elements in Infrastructure.tsx are placed at those regions
(`--dump-dom` on wash.html prints its region in the title). A blur has
no detail finer than its radius, so 2x / 0.5x rasters are exact enough
at any screen density.
