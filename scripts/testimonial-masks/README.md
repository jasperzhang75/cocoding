# Testimonial photo masks

`public/testimonials/mask-openai.png` and `mask-notion.png` are the
alpha masks the two photo cards wear, pre-rendered from the design
(Figma yFciEPejue3E2xhstXF0Wu 16798:8257 / 16798:8295, read 2026-10-21):
each photo sits in a group masked by "Ellipse 21897" — an ellipse,
ROTATED (-13.6° / -29.7°, placed by its Figma relativeTransform — read
`relativeTransform`, not the x/y of the dump, which was the first
mistake), with a gradient along its own axis whose ALPHA runs 88% ->
100% -> 73% (OpenAI) and 100% -> 100% -> 75% (Notion), layer-blurred 300
(feGaussianBlur stdDeviation 150), then the alpha raised 1.2x (feFuncA
slope) — Figma's render of the masked card divided by its render of the
bare image showed the mask it applies is a uniform 1.18-1.22x of the plain
blur, same shape; without the gain the faces came out ~15% too dark. Rendered at 2x over the card's 386 x 481 on a
transparent ground; CSS `mask-image` reads the alpha.

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for n in openai notion; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --virtual-time-budget=3000 --window-size=772,962 \
    --screenshot=public/testimonials/mask-$n.png "file://$PWD/scripts/testimonial-masks/$n.html"
done
```
