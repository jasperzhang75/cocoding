/* The tokens-dashboard trend chart, rebuilt as data-driven inline SVG from
   the Figma vectors (framer.com-style: polyline strokes + soft-masked glow
   fills — no raster). Geometry extracted from node 16555:17393 via the
   Plugin API; every coordinate below is in CARD space (600x462), and the
   card's overflow-hidden provides the same clipping the Figma frame does.

   Layer relationships preserved exactly:
   - green series: line UNDER its area glow (Figma paint order), the whole
     group at 70% opacity, soft-clipped by a blurred ellipse;
   - blue series: gradient-stroked line over its area glow, soft-clipped by
     a blurred rect;
   - Figma LAYER_BLUR r=100 == feGaussianBlur stdDeviation 50.

   SERIES holds the raw data points — swap these arrays (or feed them from
   an API) and the paths, areas and glows all follow. */

type Pt = [number, number];

const GREEN_LINE: Pt[] = [
  [-169, 449.9], [-102.4, 382], [-13.9, 362], [71.1, 317.5], [157.6, 311],
  [236.6, 311], [329.6, 281], [438.6, 257], [572, 208],
];
const GREEN_BASE = 450.4;

const BLUE_LINE: Pt[] = [
  [-80.4, 441.4], [6.9, 403.6], [90.8, 365.7], [183.3, 365.7],
  [256.9, 351.3], [334, 326.6], [457.3, 304.4], [584, 287.4],
];
const BLUE_BASE = 462.4;

const line = (pts: Pt[]) =>
  "M " + pts.map(([x, y]) => `${x} ${y}`).join(" L ");

const area = (pts: Pt[], base: number) =>
  `${line(pts)} L ${pts[pts.length - 1][0]} ${base} L ${pts[0][0]} ${base} Z`;

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
        <filter id="dc-blur" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="50" />
        </filter>

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

        {/* soft window over the green series: blurred ellipse */}
        <mask id="dc-green-soft" maskUnits="userSpaceOnUse">
          <ellipse cx="307.5" cy="303" rx="224.5" ry="56" fill="#fff" filter="url(#dc-blur)" />
        </mask>
        {/* green glow clipped to the region under the line */}
        <mask id="dc-green-area" maskUnits="userSpaceOnUse">
          <path d={area(GREEN_LINE, GREEN_BASE)} fill="#fff" />
        </mask>

        {/* soft window over the blue series: blurred rect */}
        <mask id="dc-blue-soft" maskUnits="userSpaceOnUse">
          <rect x="107" y="238" width="392" height="169" fill="#fff" filter="url(#dc-blur)" />
        </mask>
        <mask id="dc-blue-area" maskUnits="userSpaceOnUse">
          <path d={area(BLUE_LINE, BLUE_BASE)} fill="#fff" />
        </mask>

        {/* blue line stroke: white/9 -> #4C8BE9/85 at 47% -> white/23 */}
        <linearGradient id="dc-blue-stroke" gradientUnits="userSpaceOnUse" x1="-80.4" y1="0" x2="584" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.09" />
          <stop offset="0.47" stopColor="#4C8BE9" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.23" />
        </linearGradient>
      </defs>

      {/* green series, 70% as in Figma */}
      <g opacity="0.7" mask="url(#dc-green-soft)">
        <path d={line(GREEN_LINE)} stroke="#87FF89" strokeOpacity="0.86" strokeWidth="1" mask="url(#dc-reveal)" />
        <g mask="url(#dc-green-area)">
          <rect x="-199.2" y="255.7" width="1148.5" height="194.6" fill="#14AF35" opacity="0.35" filter="url(#dc-blur)" />
          <rect x="-199.2" y="255.7" width="1148.5" height="194.6" fill="#000000" opacity="0.16" filter="url(#dc-blur)" />
        </g>
      </g>

      {/* blue series */}
      <g mask="url(#dc-blue-soft)">
        <g mask="url(#dc-blue-area)">
          {/* 60% since 2026-10-20 (Jasper, redesign file 1063:265); 33% before */}
          <rect x="-224.7" y="267.7" width="1199.8" height="194.6" fill="#4D74E1" opacity="0.6" filter="url(#dc-blur)" />
          <rect x="-224.7" y="267.7" width="1199.8" height="194.6" fill="#FFFFFF" opacity="0.03" filter="url(#dc-blur)" />
        </g>
        <path d={line(BLUE_LINE)} stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="0.9" mask="url(#dc-reveal)" />
        <path d={line(BLUE_LINE)} stroke="url(#dc-blue-stroke)" strokeWidth="0.9" mask="url(#dc-reveal)" />
      </g>
    </svg>
  );
}
