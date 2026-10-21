/* The tokens-dashboard trend chart, rebuilt as data-driven inline SVG from
   the Figma vectors (framer.com-style: polyline strokes + soft-masked glow
   fills). Geometry extracted from node 16555:17393 via the Plugin API;
   every coordinate below is in CARD space (600x462), and the card's
   overflow-hidden provides the same clipping the Figma frame does.

   Layer relationships preserved exactly:
   - green series: line UNDER its area glow (Figma paint order), the whole
     group at 70% opacity, soft-clipped by a blurred ellipse;
   - blue series: gradient-stroked line over its area glow, soft-clipped by
     a blurred rect;
   - Figma LAYER_BLUR r=100 == feGaussianBlur stdDeviation 50.

   THE BLURS ARE RASTERS (2026-10-21): the two area glows (with their soft
   windows and the clip to the region under each line) are one PNG,
   f2-areas.png, and the two soft windows are PNG alpha masks, so the live
   SVG holds no filter at all. The reveal below redraws the chart every
   frame as the card scrolls in, and Safari recomputed every filter on
   each redraw — the first entrance ran at 150-250ms a frame for two
   seconds (Jasper: "safari 下第一次滚入的时候动画会非常卡顿"; Chrome was
   fine). Rendered from the very same markup at 2x by
   scripts/features-glows (the command is in its README).

   SERIES holds the raw data points — swap these arrays (or feed them from
   an API) and the paths follow; the rasters are drawn from them too, so
   re-render those after a data change. */

type Pt = [number, number];

const GREEN_LINE: Pt[] = [
  [-169, 449.9], [-102.4, 382], [-13.9, 362], [71.1, 317.5], [157.6, 311],
  [236.6, 311], [329.6, 281], [438.6, 257], [572, 208],
];

const BLUE_LINE: Pt[] = [
  [-80.4, 441.4], [6.9, 403.6], [90.8, 365.7], [183.3, 365.7],
  [256.9, 351.3], [334, 326.6], [457.3, 304.4], [584, 287.4],
];

const line = (pts: Pt[]) =>
  "M " + pts.map(([x, y]) => `${x} ${y}`).join(" L ");

export default function DashboardChart() {
  return (
    <svg
      data-chart
      className="absolute inset-0"
      width="600"
      height="462"
      viewBox="0 0 600 462"
      fill="none"
      aria-hidden
    >
      <defs>
        {/* THE REVEAL (Jasper 2026-10-20: the curves should grow in as the
            card scrolls into view — the LINES only, the glowing areas
            under them are there from the start): a mask on the three line
            paths — a solid band from far left up to the reveal's position
            p, then a 60px feather fading to nothing — that TokensCard
            bursts from p -60 (no line) to 620 (whole line) when the card
            arrives. Drawn fully revealed here, so the server HTML and a
            page without the script show the finished chart. */}
        <linearGradient id="dc-reveal-edge" gradientUnits="userSpaceOnUse" x1="620" y1="0" x2="680" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="dc-reveal" maskUnits="userSpaceOnUse" x="-300" y="-100" width="1300" height="700">
          <rect data-reveal-solid x="-300" y="-100" width="920" height="700" fill="#fff" />
          <rect data-reveal-edge x="620" y="-100" width="60" height="700" fill="url(#dc-reveal-edge)" />
        </mask>

        {/* soft window over the green series: the blurred ellipse (cx 307.5
            cy 303 rx 224.5 ry 56, stdDeviation 50), as a raster's alpha */}
        <mask id="dc-green-soft" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="462" style={{ maskType: "alpha" }}>
          <image href="/features/f2-soft-green.png" x="0" y="0" width="600" height="462" />
        </mask>
        {/* soft window over the blue series: the blurred rect (107 / 238,
            392 x 169, stdDeviation 50) */}
        <mask id="dc-blue-soft" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="462" style={{ maskType: "alpha" }}>
          <image href="/features/f2-soft-blue.png" x="0" y="0" width="600" height="462" />
        </mask>

        {/* blue line stroke: white/9 -> #4C8BE9/85 at 47% -> white/23 */}
        <linearGradient id="dc-blue-stroke" gradientUnits="userSpaceOnUse" x1="-80.4" y1="0" x2="584" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.09" />
          <stop offset="0.47" stopColor="#4C8BE9" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.23" />
        </linearGradient>
      </defs>

      {/* the two area glows — the green one (#14AF35 35% + black 16% over
          its 1148-wide band, 70% in its soft ellipse, clipped under its
          line) and the blue one (#4D74E1 60% + white 3%, in its soft rect,
          clipped under its line) — as one raster, under the lines as in
          Figma's paint order */}
      <image href="/features/f2-areas.png" x="0" y="0" width="600" height="462" />

      {/* green series, 70% as in Figma */}
      <g opacity="0.7" mask="url(#dc-green-soft)">
        <path d={line(GREEN_LINE)} stroke="#87FF89" strokeOpacity="0.86" strokeWidth="1" mask="url(#dc-reveal)" />
      </g>

      {/* blue series */}
      <g mask="url(#dc-blue-soft)">
        <path d={line(BLUE_LINE)} stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="0.9" mask="url(#dc-reveal)" />
        <path d={line(BLUE_LINE)} stroke="url(#dc-blue-stroke)" strokeWidth="0.9" mask="url(#dc-reveal)" />
      </g>
    </svg>
  );
}
