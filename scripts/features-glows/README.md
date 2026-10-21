# Features card 2 — the chart's blurred layers as rasters

`public/features/f2-areas.png`, `f2-soft-green.png` and `f2-soft-blue.png`
are the parts of the tokens-dashboard chart (DashboardChart.tsx) that used
`feGaussianBlur` (stdDeviation 50 — Figma LAYER_BLUR 100): the two glowing
areas under the lines, and the two soft windows (a blurred ellipse, a
blurred rect) that mask the lines' ends. The reveal animation redraws
the chart every frame as the card scrolls in, and Safari recomputes
every SVG filter on each redraw: the first entrance ran at 150-250ms a
frame for two seconds (Jasper, 2026-10-21; Chrome was fine). With the
blurred parts rendered once here, the live SVG holds only paths and
image masks. The pages draw the exact original markup in the chart's
600 x 462 space; headless Chrome screenshots them at 2x on a
transparent ground.

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for n in areas soft-green soft-blue; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --virtual-time-budget=3000 --window-size=1200,924 \
    --screenshot=public/features/f2-$n.png "file://$PWD/scripts/features-glows/$n.html"
done
```

The soft masks are white shapes; DashboardChart.tsx reads them through
`<mask style="mask-type: alpha">` so only their alpha counts.
