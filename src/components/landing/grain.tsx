/* GRAIN: a 240px tile of very dark fractal noise — opaque, 0 to 10 levels
   centred on 2.5 — to be SCREENED over a dark surface. It lifts the dark
   by ~2.5 levels and scatters ±2 around that, which is what keeps big
   soft gradients from banding: a glow blurred over 300px crosses only a
   few dozen 8-bit steps, and each step reads as a ring on a flat dark
   card (Jasper 2026-10-19: "波纹状的图样"). The noise is static and
   tiles seamlessly (stitchTiles). First used under the hero's stand-in
   (2026-09-07), shared since 2026-10-19 with the Features cards.
   Screen does nothing in light areas, so text and the glows' bright
   hearts are untouched. */

export const GRAIN =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
      "<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' seed='11'/>" +
      "<feColorMatrix values='0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0 0 0 0 1'/>" +
      "</filter><rect width='240' height='240' filter='url(#g)'/></svg>"
  );

/* the dither layer: last child of a card whose root is `isolate` (so the
   screen blend stays inside it) and `relative overflow-hidden` */
export default function Grain() {
  return (
    <div
      aria-hidden
      data-grain
      className="pointer-events-none absolute inset-0 mix-blend-screen"
      style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "240px 240px" }}
    />
  );
}
