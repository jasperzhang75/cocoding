"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { HyperText } from "@/components/magicui/hyper-text";
import { ICONS6 } from "./infra-icons";
import { BRAND7 } from "./infra-brand-icons";
import { FACE_MARKS, type FaceMarkKey } from "./infra-face-marks";

/* Infrastructure — the isometric story (Figma 17205:89133 -> 87420 ->
   87636), scrubbed by scroll. The three approved frames are keyframes on
   one paused timeline whose progress is bound directly to the section's
   position in the viewport: it starts as the section enters from below and
   the stack has settled (stage 3) just before the section is centered.
   No easing chase — scroll stops, the drawing stops; scroll back up, it
   plays backwards. All geometry is read off the Figma nodes:

   - Each "diamond" is a 90.64x90.64 rounded square (r6) through the
     isometric matrix [[0.866,-0.866],[0.5,0.5]] — the Figma transform
     verbatim. Stage 1 stacks all three in one spot (y294.6) with a BUILD
     callout; stage 2 spreads them to 240/294.6/348.3 under FRONTEND /
     BACKEND / DATABASE callouts; stage 3 shrinks the squares to 65.8 and
     settles them at x372, y302.7/326.1/343.5. The faint blue glow at the
     panel top rides along through all three stages.
   - Faces: black fill, stroke = A8A8A8 -> 424242 linear at 50%, dashed
     1.8/1.8 at 0.9. The group composites through Plus lighter at 90%,
     reaching 100% as the stack settles.
   - Panel: 751x679, top corners 10, stroke 0.9 on top/left/right only,
     painted white -> black at 8%, fill = black under a 2% #3750C8 wash.
   - Left column tokens as bound in Figma: Indicator+Accent eyebrow,
     Display h2, Heading/sm titles, Body/md desc at Text/Body 60%. */

const ring: CSSProperties = {
  padding: "0.9px 0.9px 0",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.026))",
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
};

/* Seam for part 2 (frames 4-8): the active item will switch and each item
   gets its own scene, so the list is data already. */
const ITEMS: { key: string; title: string; desc?: string; open?: boolean }[] = [
  {
    key: "env",
    title: "Production-ready environment",
    desc: "Run builds in a secure production environment with network isolation, high availability, and automated backup — ready for launch.",
    open: true,
  },
  {
    key: "scalability",
    title: "Scalability",
    desc: "Go further with built-in scalable infrastructure, enabling builds to auto-scale with demand, serve users globally through CDN edge delivery, and deploy updates without downtime.",
  },
  {
    key: "integrations",
    title: "Integrations",
    desc: "Meet the core needs of product launch with built-in infrastructure and external connectors, including authentication, database, file storage, payments, deployment, monitoring, and third-party integrations.",
  },
  {
    key: "analytics",
    title: "Analytics and SEO",
    desc: "Optimize every page with SEO, performance, and analytics best practices to achieve broader reach, better visibility, and clearer post-launch insights.",
  },
];

/* Face keyframes, back-to-front like the Figma children order (the front
   face is the highest one, its black fill occluding the two behind). */
const SPREAD_Y = [348.3, 294.6, 240];
const STACK = { x: 372, y: [343.5, 326.1, 302.7], size: 65.8 };

/* Frame 4 poses the settled stack ~8px lower with 80% faces. */
const ENV_STACK_Y = [351.7, 334.3, 311];

/* Interactive callouts, frames 4 and 5. One is "lit" at a time: gradient
   label plus its description; the others rest gray. Clicking a callout OR
   its cube face takes the light — `face` binds the two. The line wraps
   mirror the NETWORK ISOLATION block's measure. */
const ENV_CALLOUTS = [
  {
    key: "ni",
    face: "lid",
    label: "NETWORK ISOLATION",
    x1: 483,
    x2: 715,
    y: 281,
    anchor: "end" as const,
    desc: [
      "Firewall exists between each",
      "module to keep it isolated for",
      "security",
    ],
  },
  {
    key: "ab",
    face: "left",
    label: "AUTOMATED BACKUP",
    x1: 37,
    x2: 257,
    y: 359,
    anchor: "start" as const,
    desc: [
      "Application data is backed up",
      "automatically and ready to",
      "recover when needed.",
    ],
  },
  {
    key: "ha",
    face: "right",
    label: "HIGH AVAILABILITY",
    x1: 483,
    x2: 715,
    y: 426,
    anchor: "end" as const,
    desc: [
      "Application stays available",
      "even when individual services",
      "encounter issues.",
    ],
  },
];

/* The RUNWAY: at xl the stage sticks at the viewport's center while this
   much extra scroll passes underneath it, and that scroll drives the
   3 -> 4 leg of the animation (see the effect's navigation section). */
const RUNWAY = 500;

/* Right-hand callouts: a hairline from x475 to x715 with a 13px mono label
   hanging under its right end. BUILD (stage 1) sits on the same middle
   line the BACKEND callout uses in stage 2. */
const CALLOUTS = [
  { key: "top", y: 286, label: "FRONTEND" },
  { key: "mid", y: 340, label: "BACKEND" },
  { key: "bot", y: 394, label: "DATABASE" },
];

/* Frame 4 (ENVIRONMENT, Figma 17205:87852): the cube materializes around
   the settled stack — its hidden top/left/right faces become visible, the
   stack drops ~8px and dims to 80%, the wash swaps for two radial glows,
   and legend + three new callouts appear. All values off the nodes:

   - lid: 85.2 rounded square (r6) through the iso matrix, filled with the
     blue -> white gradient down its local axis, stroke #6C91F9 6%;
   - sides: 85.3x85.1 parallelograms (r8), two stacked translucent fills
     (blue 10% + white 5%/3%) with a #909090 22% stroke — the dashed stack
     stays readable through them;
   - glows: two radials (#18365F -> #316FC5 at 52%) — the ambient one
     layer-blurred 300 (stdDev 150), the cube halo sharp with the design's
     tiled grain PNG lightening it at 23%;
   - lucide/server mark riding the lid through its own iso matrix. */
const CUBE = {
  lid: "matrix(0.865 0.502 -0.867 0.498 372.607 246.158)",
  left: "matrix(0.865 0.502 -0.002 1 282.22 320.458)",
  right: "matrix(0.867 -0.498 -0.002 1 393.38 363.24)",
  icon: "matrix(0.877 0.48 -0.881 0.474 373.729 255)",
};

/* Frame 5 (SCALABILITY, Figma 16533:14502): the cube OPENS — the lid
   lifts to y204 and grows to a 97.7 square, the sides spread apart and
   grow to 111.7, and the stack scales out to SIX thinner layers (59.9
   squares, solid A8A8A8 50% strokes instead of the gradient) — the
   auto-scaling picture. A lucide/arrow-down-up mark rides the lifted lid. */
const CUBE5 = {
  lid: "matrix(0.866 0.5 -0.866 0.5 375.625 204)",
  lidSize: 97.7,
  left: "matrix(0.866 0.5 0 1 291 308.445)",
  right: "matrix(0.866 -0.5 0 1 362.5 419.288)",
  sideSize: 111.7,
  icon: "matrix(0.846 0.534 -0.885 0.465 375.701 212)",
};
const STACK5 = { x: 375.85, size: 59.9, y: [370, 352, 333.9], extraY: [318.1, 296.8, 279] };

/* Frame 5's callouts: AUTO-SCALING holds the light by default (accent ->
   white gradient label + description at full #A1A1A1, as this frame draws
   it). Same click-to-light behavior as frame 4. */
const ENV5_CALLOUTS = [
  {
    key: "as",
    face: "lid",
    label: "AUTO-SCALING",
    x1: 475,
    x2: 715,
    y: 254,
    anchor: "end" as const,
    desc: ["Compute and database", "resources scale up and down", "automatically"],
  },
  {
    key: "zdd",
    face: "left",
    label: "ZERO-DOWNTIME DEPLOYS",
    x1: 37,
    x2: 257,
    y: 359,
    anchor: "start" as const,
    desc: [
      "Rolling updates push new",
      "versions live without",
      "interrupting active users or",
      "sessions.",
    ],
  },
  {
    key: "ged",
    face: "right",
    label: "GLOBAL EDGE DELIVERY",
    x1: 475,
    x2: 715,
    y: 425,
    anchor: "end" as const,
    desc: [
      "Built-in CDN and edge caching",
      "serve your app from locations",
      "closer to each user for faster",
      "delivery.",
    ],
  },
];

/* Which callout each face lights, per frame. */
/* The marks riding the cube's faces, one per face per frame (see
   FACE_MARKS for the side ones); each is a group with a bright (-a) and a
   dim (-b) half that the attention flicker trades. */
const SIDE_MARK_KEYS: FaceMarkKey[] = ["left", "right", "left5", "right5"];
const MARK_OF: Record<string, string> = { lid: "[data-cube-mark]", lid5: "[data-mark5]" };
const MARK_HALVES: Record<string, [string, string]> = {
  lid: ["[data-mark-a]", "[data-mark-b]"],
  lid5: ["[data-mark5-a]", "[data-mark5-b]"],
};
for (const k of SIDE_MARK_KEYS) {
  MARK_OF[k] = `[data-mark-side="${k}"]`;
  MARK_HALVES[k] = [`${MARK_OF[k]} [data-mark-side-a]`, `${MARK_OF[k]} [data-mark-side-b]`];
}

const FACE_MAP: Record<number, Record<string, string>> = {
  4: { lid: "ni", left: "ab", right: "ha" },
  5: { lid: "as", left: "zdd", right: "ged" },
};

/* Frame 6 (INTEGRATIONS, Figma 16533:14745): the cube scene gives way to
   a row of tilted connector cards receding to the right under a centered
   BUILD-IN / CONNECTORS tab header. Cards are 77.5 squares through a
   parallelogram matrix — lit: r6 + the accent gradient + 6% stroke, the
   card raised with its legend hanging below; dim: r8, translucent pair,
   #909090 9% stroke. Hovering (or tapping) a card moves the light to it.

   Two rows share the interaction: BUILD-IN (left-facing cards, the
   design's filled 24-grid icons that turn white when lit) and
   CONNECTORS (Figma 17205:88594 — right-facing cards with brand icons).
   `y` is each card's resting height; the lit one sits `raise` higher. */
type Card = { key: string; label: string; x: number; y: number; iconT: string; icon?: string; off?: [number, number] };
const CARDS6: Card[] = [
  { key: "database", icon: "database", label: "DATABASE", x: 204, y: 281.25, iconT: "matrix(0.898 0.439 0 1 23 40.75)" },
  { key: "payments", icon: "creditCard", label: "PAYMENTS", x: 259.1, y: 281.25, iconT: "matrix(0.857 0.514 0 1 22.883 39.75)" },
  { key: "monitoring", icon: "eye", label: "MONITORING", x: 314.2, y: 281.3, iconT: "matrix(0.882 0.471 0 1 22.766 40.75)" },
  { key: "auth", icon: "lock", label: "AUTHENTICATION", x: 369.4, y: 281.3, iconT: "matrix(0.857 0.514 0 1 23.648 39.75)" },
  { key: "storage", icon: "dresser", label: "FILE STORAGE", x: 424.5, y: 281.3, iconT: "matrix(0.866 0.5 0 1 23.531 40)" },
  { key: "deployment", icon: "rocket", label: "DEPLOYMENT", x: 479.6, y: 281, iconT: "matrix(0.832 0.555 0 1 23.414 39)" },
];
const CARDS7: Card[] = [
  { key: "notion", label: "NOTION", x: 122, y: 281.3, iconT: "matrix(0.882 -0.471 0 1 23 54.063)" },
  { key: "whatsapp", label: "WHATSAPP", x: 177.1, y: 281.3, iconT: "matrix(0.942 -0.335 0 1 22.884 51.75)" },
  { key: "telegram", label: "TELEGRAM", x: 232.2, y: 281.3, iconT: "matrix(0.89 -0.455 0 1 22.768 51.75)" },
  { key: "stripe", label: "STRIPE", x: 287.4, y: 281.3, iconT: "matrix(0.89 -0.455 0 1 22.649 51.75)" },
  { key: "slack", label: "SLACK", x: 342.5, y: 281, iconT: "matrix(0.832 -0.555 0 1 23.531 53)" },
  { key: "openai", label: "OPENAI", x: 397.6, y: 281, iconT: "matrix(0.89 -0.455 0 1 23.414 52)" },
  { key: "hubspot", label: "HUBSPOT", x: 452, y: 281, iconT: "matrix(0.841 -0.542 0 1 24 52)", off: [0, 8.51] },
  { key: "airtable", label: "AIRTABLE", x: 507, y: 281, iconT: "matrix(0.898 -0.439 0 1 24 52)", off: [0, 1.92] },
  { key: "supabase", label: "SUPABASE", x: 562, y: 281, iconT: "matrix(0.857 -0.514 0 1 24 53)" },
];
type RowKey = "buildin" | "connectors";
const ROWS: Record<RowKey, { cards: Card[]; face: string; raise: number; lineDx: number }> = {
  buildin: { cards: CARDS6, face: "matrix(0.87 0.5 0 1 0 0)", raise: 25, lineDx: 34 },
  connectors: { cards: CARDS7, face: "matrix(-0.866 0.5 0 1 67.117 0)", raise: 18, lineDx: 35 },
};
/* halfway between the two faces the card is edge-on — zero width — which
   is where the tab switch swaps one row for the other unseen */
const FACE_EDGE = "matrix(0.002 0.5 0 1 33.56 0)";

/* Frame 8 (ANALYTICS AND SEO, Figma 17205:88890): a Google Lighthouse
   scorecard — header (the G mark + "Google Lighthouse" at white 33%, the
   pair at 80%) over a 2x2 of 77.5 tiles, r6, no fill, a #6485E7 -> white
   stroke running from each tile's bottom-right toward its top-left (the
   node's gradient transform decoded into bbox points), 86% paint on a 70%
   rect; "100" in 14px Geist centered, a 13px mono label beneath. */
const TILES8 = [
  { key: "performance", label: "PERFORMANCE", x: 278, y: 261 },
  { key: "accessibility", label: "ACCESSIBILITY", x: 396, y: 261 },
  { key: "bestPractice", label: "BEST PRACTICE", x: 278, y: 393 },
  { key: "seo", label: "SEO", x: 396, y: 393 },
];
const G_MARK =
  "M11.1704 2.521C7.79434 2.521 4.84359 4.38275 3.45301 7.185C2.84223 8.36414 2.52344 9.67268 2.52344 11.0006C2.52344 12.3286 2.84223 13.6371 3.45301 14.8162C4.84359 17.6176 7.79434 19.4793 11.1704 19.4793C13.4988 19.4793 15.4971 18.7212 16.8941 17.4407C19.1711 15.4487 19.8137 12.3082 19.3306 9.47666C19.3215 9.4234 19.2939 9.37505 19.2526 9.34017C19.2114 9.30528 19.1591 9.28609 19.1051 9.286H11.1704C11.1096 9.286 11.0514 9.31014 11.0084 9.35312C10.9654 9.39609 10.9413 9.45438 10.9413 9.51516V12.5677C10.9413 12.6942 11.0439 12.7968 11.1704 12.7968H15.5411C15.3889 13.4752 14.9113 14.3982 13.9965 15.0179L13.9892 15.0225C13.3613 15.4827 12.3988 15.8035 11.1704 15.8035C8.47909 15.8035 6.33501 13.5531 6.33501 10.9177C6.33501 8.36658 8.60101 6.11433 11.1704 6.11433C12.7013 6.11433 13.6638 6.74041 14.3137 7.29683C14.3571 7.334 14.4129 7.35357 14.4701 7.35171C14.5272 7.34984 14.5816 7.32667 14.6226 7.28675L16.9858 4.97675C17.0085 4.95459 17.0263 4.92797 17.0382 4.89855C17.0501 4.86914 17.0557 4.83758 17.0548 4.80587C17.0538 4.77416 17.0463 4.74299 17.0327 4.71434C17.0191 4.68568 16.9997 4.66017 16.9757 4.63941C15.5008 3.36708 13.507 2.521 11.1704 2.521Z";

/* Figma's Vector 24 — the stage-3 wash at the top of the panel: a blob at
   9% #2D69B7 with a white 26% hairline, layer-blurred 60.6 (feGaussianBlur
   stdDeviation = radius / 2), flipped into place by its node transform. */
const GLOW_PATH =
  "M 108.96 275.17 C -90.13 262.91 29.3 52.8 108.96 47.23 C 174.8 42.62 181.3 164.63 246.79 174.68 C 304.18 183.48 330.26 125.58 387.43 114.63 C 436.34 105.26 514.01 114.63 514.01 114.63 C 514.01 114.63 619 123.82 658.41 68.06 C 672.13 48.65 671.59 29.52 685.6 10.46 C 736.96 -59.39 742.8 242.9 708.11 256.78 C 673.41 270.67 591.84 296 591.84 296 C 591.84 296 308.05 287.42 108.96 275.17 Z";

/* The design's grain is generated, not painted: a Figma shader plugin
   whose recipe the designer handed over. Ported here as a one-time canvas
   render instead of shipping the exported raster (Figma's fill-stack
   blending never quite matched in the browser). Per the shader uniforms:
   1024px canvas on a 2px cell grid, 50% of cells visible (u_amount .5),
   duo-tone — each dot flips a coin between #1F1F1F and its inverse
   #E0E0E0 (u_tone Duo) — random per-dot opacity, and a radial fade that
   zeroes out 0.4386 of the canvas from center (u_fade_position). GPU and
   CPU hashes can't match bit-for-bit, so a seeded PRNG stands in — the
   statistics, which are the look, are the same on every load. */
function makeNoiseTexture(): string {
  const SIZE = 1024;
  const CELL = 2;
  const N = SIZE / CELL;
  const MAXD = 0.5 - 0.06140350877192979; // shader's radial fade extent
  const cv = document.createElement("canvas");
  cv.width = SIZE;
  cv.height = SIZE;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";
  let s = 0x12622121; // fixed seed, like the plugin's u_random_seed
  const rnd = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let iy = 0; iy < N; iy++) {
    for (let ix = 0; ix < N; ix++) {
      const visible = rnd() > 0.5;
      const light = rnd() > 0.5;
      const op = rnd();
      if (!visible) continue;
      const dist = Math.hypot(ix / N - 0.5, iy / N - 0.5);
      const fade = 1 - Math.min(1, dist / MAXD);
      if (fade <= 0) continue;
      ctx.fillStyle = light ? "#E0E0E0" : "#1F1F1F";
      // x0.8 ~ the area of the shader's per-cell circle vs our square
      ctx.globalAlpha = op * fade * 0.8;
      ctx.fillRect(ix * CELL, iy * CELL, CELL, CELL);
    }
  }
  return cv.toDataURL("image/png");
}

export default function Infrastructure() {
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activeFaceRef = useRef("lid");
  const frameRef = useRef(4); // which scene frame the cube is showing
  const flickerRef = useRef<gsap.core.Timeline | null>(null);
  const goToFrameRef = useRef<(target: number) => void>(() => {});

  /* Frame 8's scorecard animation: each tile's outline is drawn by a
     #6485E7 light running the perimeter — fast, then easing out — while
     its score counts 0 -> 100; as the light completes, the resting
     gradient stroke takes over. Tiles stagger in reading order. Reset
     unseen before every entrance so it replays each time. */
  const scoreTlRef = useRef<gsap.core.Timeline | null>(null);
  const resetScorecard = () => {
    const svg = svgRef.current;
    if (!svg) return;
    scoreTlRef.current?.kill();
    scoreTlRef.current = null;
    gsap.set(svg.querySelectorAll("[data-tile-stroke], [data-tile-base], [data-tile-fill]"), { opacity: 0 });
    gsap.set(svg.querySelectorAll("[data-tile-tail]"), { opacity: 0, attr: { "stroke-dashoffset": 0 } });
    gsap.set(svg.querySelectorAll("[data-tile-head]"), { opacity: 0, attr: { "stroke-dashoffset": -10 } });
    svg.querySelectorAll("[data-tile8-score]").forEach((el) => {
      el.textContent = "0";
    });
  };
  const playScorecard = () => {
    const svg = svgRef.current;
    if (!svg) return;
    scoreTlRef.current?.kill();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(svg.querySelectorAll("[data-tile-stroke]"), { opacity: 0.7 });
      gsap.set(svg.querySelectorAll("[data-tile-tail], [data-tile-head], [data-tile-base], [data-tile-fill]"), { opacity: 0 });
      svg.querySelectorAll("[data-tile8-score]").forEach((el) => {
        el.textContent = "100";
      });
      return;
    }
    /* all four tiles at once. The outline shows in white the whole run;
       the blue segment circles it once, CLOCKWISE, on a fast-then-slow
       curve while the score climbs on the same curve. The loop closes
       exactly as the score lands: the light is gone, the white outline
       brightens for a beat, then fades into the resting gradient. */
    const LOOP = 1.4;
    const EASE = "power3.out";
    const bases = svg.querySelectorAll("[data-tile-base]");
    const tails = svg.querySelectorAll("[data-tile-tail]");
    const heads = svg.querySelectorAll("[data-tile-head]");
    const rests = svg.querySelectorAll("[data-tile-stroke]");
    const scores = Array.from(svg.querySelectorAll("[data-tile8-score]"));
    const t = gsap.timeline();
    t.set(bases, { opacity: 0.7 }, 0);
    t.set([tails, heads], { opacity: 1 }, 0);
    // falling offsets carry the pattern forward along the path: clockwise
    t.to(tails, { attr: { "stroke-dashoffset": -100 }, duration: LOOP, ease: EASE }, 0);
    t.to(heads, { attr: { "stroke-dashoffset": -110 }, duration: LOOP, ease: EASE }, 0);
    const n = { v: 0 };
    t.to(
      n,
      {
        v: 100,
        duration: LOOP,
        ease: EASE,
        onUpdate: () => {
          const v = String(Math.round(n.v));
          scores.forEach((el) => {
            el.textContent = v;
          });
        },
      },
      0
    );
    // 100: the light is gone, the white outline flares for a beat, and the
    // tile fills in a burst — full in 0.15s, then dissipating slowly from
    // its peak (the agents' fill logic from the Features card)...
    const fills = svg.querySelectorAll("[data-tile-fill]");
    t.set([tails, heads], { opacity: 0 }, LOOP);
    t.set(bases, { opacity: 1 }, LOOP);
    // the light decelerates into its finish, so the burst leads it a little
    // (0.25s) rather than waiting for the exact arrival, which read as lag
    const BURST_AT = LOOP - 0.25;
    t.fromTo(fills, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power4.out" }, BURST_AT);
    t.to(fills, { opacity: 0, duration: 2.2, ease: "power1.out" }, BURST_AT + 0.15);
    // ...while the outline settles into the resting gradient
    t.to(bases, { opacity: 0, duration: 0.6, ease: "power2.out" }, LOOP + 0.12);
    t.to(rests, { opacity: 0.7, duration: 0.6, ease: "power2.out" }, LOOP + 0.12);
    scoreTlRef.current = t;
  };

  /* Frame 6 rows: which card holds the light in each, and which tab
     shows. Hover/tap moves the light; the tab switch is in the effect. */
  const litRef = useRef<Record<RowKey, string>>({ buildin: "database", connectors: "notion" });
  const tabRef = useRef<RowKey>("buildin");
  const switchTabRef = useRef<(to: RowKey) => void>(() => {});
  /* while the rows are animating (entrance, tab switch) cards sweep under
     the pointer and would fire mouseenter — hover is ignored until done */
  const rowsBusyRef = useRef(false);

  const lightCard = (row: RowKey, key: string) => {
    const svg = svgRef.current;
    if (!svg || rowsBusyRef.current || frameRef.current !== 6) return;
    if (litRef.current[row] === key) return;
    const prev = litRef.current[row];
    litRef.current[row] = key;
    const { cards, raise } = ROWS[row];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const D = reduced ? 0 : 0.35;
    const card = (k: string) => svg.querySelector(`[data-card="${row}:${k}"]`);
    const part = (k: string, sel: string) => card(k)?.querySelector(sel) ?? null;
    const tw = (el: Element | null, vars: gsap.TweenVars) => {
      if (el) gsap.to(el, { duration: D, ease: "power2.inOut", overwrite: "auto", ...vars });
    };
    const base = (k: string) => cards.find((c) => c.key === k)!.y;
    const callout = (k: string) => svg.querySelector(`[data-callout="${row}:${k}"]`);
    /* ONE LIT CARD, ONE LEGEND. A fast sweep fires enters faster than the
       fades run, and a legend's delayed fade-in would otherwise outlive
       the fade-out issued for it. So: kill every pending tween on the
       row, snap all but the previous holder to rest, then animate only
       the handover between the previous card and the new one. */
    cards.forEach((c) => {
      const el = card(c.key);
      const co = callout(c.key);
      if (el) gsap.killTweensOf([el, ...Array.from(el.querySelectorAll("[data-lit], [data-icon-lit], [data-icon-dim]"))]);
      if (co) gsap.killTweensOf(co);
      if (c.key === key || c.key === prev) return;
      if (el) {
        gsap.set(el, { y: c.y });
        const set = (sel: string, o: number) => {
          const p = el.querySelector(sel);
          if (p) gsap.set(p, { opacity: o });
        };
        set("[data-lit]", 0);
        set("[data-icon-lit]", 0);
        set("[data-icon-dim]", 1);
      }
      if (co) gsap.set(co, { opacity: 0 });
    });
    // the previous holder settles and dims
    tw(card(prev), { y: base(prev) });
    tw(part(prev, "[data-lit]"), { opacity: 0 });
    tw(part(prev, "[data-icon-lit]"), { opacity: 0 });
    tw(part(prev, "[data-icon-dim]"), { opacity: 1 });
    tw(callout(prev), { opacity: 0, duration: D * 0.7, overwrite: true });
    // the new one lights and rises
    tw(card(key), { y: base(key) - raise });
    tw(part(key, "[data-lit]"), { opacity: 1 });
    tw(part(key, "[data-icon-lit]"), { opacity: 1 });
    tw(part(key, "[data-icon-dim]"), { opacity: 0 });
    tw(callout(key), { opacity: 1, delay: D * 0.4, overwrite: true });
  };

  /* Put one row back to its rest instantly: cards on their spots, the
     first one lit and raised, only its legend showing. */
  const restRow = (row: RowKey) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { cards, face, raise } = ROWS[row];
    litRef.current[row] = cards[0].key;
    cards.forEach((c, i) => {
      const el = svg.querySelector(`[data-card="${row}:${c.key}"]`);
      if (!el) return;
      const lit = i === 0;
      gsap.set(el, { x: c.x, y: c.y - (lit ? raise : 0), opacity: 1 });
      gsap.set(el.querySelector("[data-cface]"), { attr: { transform: face } });
      const set = (sel: string, o: number) => {
        const p = el.querySelector(sel);
        if (p) gsap.set(p, { opacity: o });
      };
      set("[data-lit]", lit ? 1 : 0);
      set("[data-icon-lit]", lit ? 1 : 0);
      set("[data-icon-dim]", lit ? 0 : 1);
      set("[data-icon]", 1);
      gsap.set(svg.querySelector(`[data-callout="${row}:${c.key}"]`), { opacity: lit ? 1 : 0 });
    });
  };

  /* Both rows back to their authored rest (BUILD-IN showing) — run while
     frame 6 is hidden, before each entrance. A hidden row must not take
     pointer events, or it steals hovers from the row beneath it. The
     showing row is "inherit", never "auto": an explicit auto on a child
     overrides the frame-6 group's none, so the hidden group's cards would
     keep intercepting clicks meant for the cube faces under them. */
  const resetRows = () => {
    const svg = svgRef.current;
    if (!svg) return;
    (Object.keys(ROWS) as RowKey[]).forEach((row) => {
      restRow(row);
      const on = row === "buildin";
      gsap.set(svg.querySelector(`[data-row="${row}"]`), { opacity: on ? 1 : 0, pointerEvents: on ? "inherit" : "none" });
    });
    tabRef.current = "buildin";
    gsap.set(svg.querySelector('[data-tab-text="buildin"]'), { opacity: 1 });
    gsap.set(svg.querySelector('[data-tab-text="connectors"]'), { opacity: 0.2 });
    gsap.set(svg.querySelector('[data-tab-ul="buildin"]'), { opacity: 1 });
    gsap.set(svg.querySelector('[data-tab-ul="connectors"]'), { opacity: 0 });
  };

  /* which mark a face shows in a frame: each frame has one per face
     (frame 4: server / save-all / send-to-back; frame 5:
     arrow-down-up / list-clock / globe-check) */
  const markKey = (frame: number, face: string) =>
    frame === 5 ? (face === "lid" ? "lid5" : `${face}5`) : face;

  /* Every mark to its state for (frame, face): the face holding the light
     shows its mark, the other five are dark. Run on every frame entry and
     every light swap — the whole set each time, never just the pair that
     changed — so no mark can be left showing by history (a click landing
     mid-transition, a hot reload). Instant by default; a duration fades. */
  const settleMarks = (frame: number, face: string, duration = 0) => {
    const svg = svgRef.current;
    if (!svg) return;
    const on = markKey(frame, face);
    for (const k of Object.keys(MARK_OF)) {
      const el = svg.querySelector(MARK_OF[k]);
      if (!el) continue;
      const opacity = k === on ? 1 : 0;
      if (duration) gsap.to(el, { opacity, duration, ease: "power1.inOut" });
      else gsap.set(el, { opacity });
    }
  };

  /* Mark flicker: whenever a mark lights up, its bright and dim halves
     trade places — fast at first, each gap 1.5x the last — before
     settling. Skipped under reduced motion. */
  const flickerMark = (key = "lid") => {
    const svg = svgRef.current;
    if (!svg) return;
    const [selA, selB] = MARK_HALVES[key];
    const a = svg.querySelector(selA);
    const b = svg.querySelector(selB);
    if (!a || !b) return;
    flickerRef.current?.kill();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(a, { opacity: 1 });
      gsap.set(b, { opacity: 0.3 });
      return;
    }
    /* decaying oscillation: quick swaps at first, each gap 1.5x the last,
       so the flicker audibly "settles" instead of cutting off */
    const DIM = 0.3;
    const fl = gsap.timeline();
    let t = 0;
    let step = 0.065;
    for (let i = 0; i < 8; i++) {
      const swapped = i % 2 === 0;
      fl.set(a, { opacity: swapped ? DIM : 1 }, t);
      fl.set(b, { opacity: swapped ? 1 : DIM }, t);
      t += step;
      step *= 1.5;
    }
    fl.set(a, { opacity: 1 }, t);
    fl.set(b, { opacity: DIM }, t);
    flickerRef.current = fl;
  };

  /* Click a cube face or its callout: that face takes the light — the lit
     overlay crosses to it, its callout gains the gradient label and
     description, the previous holder falls back. Works in frames 4 and 5,
     each with its own callout trio (data-co-* vs data-co5-*). */
  const swapFace = (face: string) => {
    const svg = svgRef.current;
    if (!svg || face === activeFaceRef.current) return;
    const frame = frameRef.current;
    const prevFace = activeFaceRef.current;
    activeFaceRef.current = face;
    const co = FACE_MAP[frame][face];
    const prevCo = FACE_MAP[frame][prevFace];
    const p = frame === 5 ? "data-co5" : "data-co";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = (sel: string, opacity: number, duration: number, delay = 0) =>
      gsap.to(svg.querySelector(sel), {
        opacity,
        duration: reduced ? 0 : duration,
        delay: reduced ? 0 : delay,
        ease: "power1.inOut",
        overwrite: "auto",
      });
    fade(`[${p}-active="${prevCo}"]`, 0, 0.35);
    fade(`[${p}-base="${prevCo}"]`, 1, 0.35);
    fade(`[${p}-desc="${prevCo}"]`, 0, 0.25);
    fade(`[${p}-active="${co}"]`, 1, 0.35);
    fade(`[${p}-base="${co}"]`, 0, 0.35);
    fade(`[${p}-desc="${co}"]`, 1, 0.3, 0.12);
    // the light crosses the cube; a mark exists only while its face holds
    // the light, and flickers awake as it takes it
    fade(`[data-face-lit="${prevFace}"]`, 0, 0.35);
    fade(`[data-face-lit="${face}"]`, 1, 0.35);
    settleMarks(frame, face, 0.3);
    flickerMark(markKey(frame, face));
  };

  /* Reset a frame's callout internals to its default holder (lid) — run
     while that frame's group is hidden during a 4<->5 transition. */
  const resetCallouts = (frame: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const p = frame === 5 ? "data-co5" : "data-co";
    const def = FACE_MAP[frame].lid;
    for (const c of frame === 5 ? ENV5_CALLOUTS : ENV_CALLOUTS) {
      const lit = c.key === def;
      gsap.set(svg.querySelector(`[${p}-active="${c.key}"]`), { opacity: lit ? 1 : 0 });
      gsap.set(svg.querySelector(`[${p}-base="${c.key}"]`), { opacity: lit ? 0 : 1 });
      gsap.set(svg.querySelector(`[${p}-desc="${c.key}"]`), { opacity: lit ? 1 : 0 });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const runway = runwayRef.current;
    const panel = panelRef.current;
    const svg = svgRef.current;
    if (!section || !runway || !panel || !svg) return;

    // the code-drawn grain (see makeNoiseTexture) feeds every noise slot
    const noiseUrl = makeNoiseTexture();
    svg.querySelectorAll<SVGImageElement>("[data-noise]").forEach((im) => {
      im.setAttribute("href", noiseUrl);
    });

    // the light starts on the lid with frame 4's mark — stated outright so
    // a re-run of this effect (dev hot reload) cannot inherit a stale light
    frameRef.current = 4;
    activeFaceRef.current = "lid";
    gsap.set(svg.querySelector('[data-face-lit="lid"]'), { opacity: 1 });
    gsap.set(svg.querySelectorAll('[data-face-lit="left"], [data-face-lit="right"]'), { opacity: 0 });
    settleMarks(4, "lid");

    const ctx = gsap.context(() => {
      const faces = Array.from(
        svg.querySelectorAll<SVGGElement>("[data-face]")
      );
      const rects = faces.map((f) => f.querySelector("rect")!);
      const cube = svg.querySelector("[data-cube]");
      const build = svg.querySelector("[data-build]");
      const line = (k: string) => svg.querySelector(`[data-line="${k}"]`);
      const label = (k: string) => svg.querySelector(`[data-label="${k}"]`);

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      /* 0.00-0.10 rests at stage 1 so it registers while entering. */

      // stage 1 -> 2: the block splits into layers, and the BUILD hairline
      // splits with it — two clones ride up and down IN SYNC with the
      // faces (same span, same ease), each staying centered on its layer
      tl.to(build, { opacity: 0, duration: 0.1, ease: "power1.out" }, 0.1);
      tl.to(faces[2], { y: SPREAD_Y[2], duration: 0.33, ease: "power2.inOut" }, 0.12);
      tl.to(faces[0], { y: SPREAD_Y[0], duration: 0.33, ease: "power2.inOut" }, 0.12);
      tl.to(line("top"), { attr: { y1: 286, y2: 286 }, duration: 0.33, ease: "power2.inOut" }, 0.12);
      tl.to(line("bot"), { attr: { y1: 394, y2: 394 }, duration: 0.33, ease: "power2.inOut" }, 0.12);
      // the clones surface while still overlapping the original, so no pop
      tl.to([line("top"), line("bot")], { opacity: 1, duration: 0.08 }, 0.12);

      // only once the split has landed do the three labels appear
      tl.to(label("top"), { opacity: 1, duration: 0.12 }, 0.45);
      tl.to(label("mid"), { opacity: 1, duration: 0.12 }, 0.49);
      tl.to(label("bot"), { opacity: 1, duration: 0.12 }, 0.53);

      /* 0.65-0.70 rests at stage 2. */

      // stage 2 -> 3: callouts fall away, the layers settle into the stack
      tl.to(
        [line("top"), line("mid"), line("bot"), label("top"), label("mid"), label("bot")],
        { opacity: 0, duration: 0.1 },
        0.7
      );
      faces.forEach((f, i) => {
        tl.to(f, { x: STACK.x, y: STACK.y[i], duration: 0.26, ease: "power2.inOut" }, 0.72);
      });
      tl.to(rects, { attr: { width: STACK.size, height: STACK.size }, duration: 0.26, ease: "power2.inOut" }, 0.72);
      tl.to(cube, { opacity: 1, duration: 0.26 }, 0.72);

      /* The 3 -> 4 leg (~1.4 units long): the wash dissolves, the legend
         surfaces, the cube's other faces materialize while the stack eases
         into its frame-4 pose, and the ambient glow blooms from its center
         outward. Callouts trail in last. At xl it is SCRUBBED by the
         runway (progress = scroll position, see apply()); below xl a title
         click plays it timed. Its one-shot side effects (the mark flicker,
         building the morph) live in land(), not in the timeline. */
      const env = {
        wash: svg.querySelector("[data-wash]"),
        cube: svg.querySelector("[data-env-cube]"),
        legend: svg.querySelector("[data-env-legend]"),
        callouts: svg.querySelector("[data-env-callouts]"),
        ambient: svg.querySelector("[data-env-back]"),
      };
      const tl2 = gsap.timeline({ paused: true });
      tl2.to(env.wash, { opacity: 0, duration: 0.42, ease: "power1.out" }, 0);
      tl2.to(env.legend, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.14);
      tl2.to(env.cube, { opacity: 1, duration: 0.63, ease: "power2.out" }, 0.21);
      faces.forEach((f, i) => {
        tl2.to(
          f,
          { y: ENV_STACK_Y[i], opacity: 0.8, duration: 0.56, ease: "power2.inOut" },
          0.21
        );
      });
      tl2.fromTo(
        env.ambient,
        { opacity: 0, scale: 0.3, svgOrigin: "370.5 344.5" },
        { opacity: 1, scale: 1, duration: 1.05, ease: "power2.out" },
        0.35
      );
      tl2.to(env.callouts, { opacity: 1, duration: 0.28, ease: "power1.out" }, 1.12);
      // clicks arm only once the entrance lands; scrubbing back re-disarms them
      tl2.set([env.callouts, env.cube], { pointerEvents: "auto" }, 1.38);

      /* The 4 -> 5 transition (SCALABILITY): built lazily on first use so
         the left column's description heights are measured fresh. Timed
         (~1.6s) like the frame-4 entrance — fired by threshold crossings
         in the second runway segment or by clicking the left column's
         titles; reverse plays it backwards. */
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      let tl3: gsap.core.Timeline | null = null;
      const ensureTl3 = () => {
        if (tl3) return tl3;
        const sq = (sel: string) => svg.querySelector(sel);
        const sqa = (sel: string) => svg.querySelectorAll(sel);
        const OPEN = { duration: 0.9, ease: "power2.inOut" } as const;
        /* Every tween states its frame-4 value outright (fromTo) so the
           morph poses the same whether played, reversed, or scrubbed to an
           end — a .to() would keep whatever it first rendered over, e.g. a
           frame a crossfade had already hidden. fromTo renders its start
           values the moment it is built (and keeps them as its floor when
           the playhead sits before it), which is why the timeline is built
           right as the frame-4 entrance lands: the values it writes are
           exactly what is on screen. */
        const t = gsap.timeline({ paused: true });
        const F4 = { lid: 85.2, side: { width: 85.3, height: 85.1 }, stroke: "url(#infra-face-stroke)" };
        // frame-4 furniture out
        t.fromTo(sq("[data-env-callouts]"), { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0);
        t.fromTo(sq("[data-env-callouts]"), { pointerEvents: "auto" }, { pointerEvents: "none", duration: 0.01 }, 0.01);
        t.fromTo(sq("[data-legend-env]"), { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.05);
        t.fromTo(sq("[data-cube-mark]"), { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0);
        // the cube opens and grows
        t.fromTo(sq('[data-cube-face="lid"]'), { attr: { transform: CUBE.lid } }, { attr: { transform: CUBE5.lid }, ...OPEN }, 0.15);
        t.fromTo(sqa('[data-cube-face="lid"] rect'), { attr: { width: F4.lid, height: F4.lid } }, { attr: { width: CUBE5.lidSize, height: CUBE5.lidSize }, ...OPEN }, 0.15);
        t.fromTo(sq('[data-cube-face="left"]'), { attr: { transform: CUBE.left } }, { attr: { transform: CUBE5.left }, ...OPEN }, 0.15);
        t.fromTo(sq('[data-cube-face="right"]'), { attr: { transform: CUBE.right } }, { attr: { transform: CUBE5.right }, ...OPEN }, 0.15);
        t.fromTo(sqa('[data-cube-face="left"] rect, [data-cube-face="right"] rect'), { attr: F4.side }, { attr: { width: CUBE5.sideSize, height: CUBE5.sideSize }, ...OPEN }, 0.15);
        t.fromTo(sq('[data-cube-face="right"] rect:first-child'), { fill: "#617CCE" }, { fill: "#617FDC", duration: 0.5 }, 0.3);
        t.fromTo(sq('[data-cube-face="right"] rect:nth-child(2)'), { fillOpacity: 0.03 }, { fillOpacity: 0.05, duration: 0.5 }, 0.3);
        // the stack shrinks a touch and re-seats...
        faces.forEach((f, i) => {
          t.fromTo(f, { x: STACK.x, y: ENV_STACK_Y[i] }, { x: STACK5.x, y: STACK5.y[i], duration: 0.7, ease: "power2.inOut" }, 0.25);
        });
        t.fromTo(sqa("[data-face] rect"), { attr: { width: STACK.size, height: STACK.size } }, { attr: { width: STACK5.size, height: STACK5.size }, duration: 0.7, ease: "power2.inOut" }, 0.25);
        t.fromTo(sqa("[data-face] rect"), { attr: { stroke: F4.stroke } }, { attr: { stroke: "#A8A8A8" }, duration: 0.01 }, 0.5);
        // ...and three extra layers pop out upward, one after another
        svg.querySelectorAll("[data-face-x]").forEach((x, i) => {
          t.fromTo(
            x,
            { y: STACK5.extraY[i] + 18, opacity: 0 },
            { y: STACK5.extraY[i], opacity: 0.8, duration: 0.45, ease: "power2.out" },
            0.6 + i * 0.09
          );
        });
        // legend row 1, lid mark, callouts
        t.fromTo(sq("[data-legend-infra]"), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.5);
        t.fromTo(sq("[data-mark5]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.85);
        t.fromTo(sq("[data-env5-callouts]"), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.95);
        t.fromTo(sq("[data-env5-callouts]"), { pointerEvents: "none" }, { pointerEvents: "auto", duration: 0.01 }, 1.3);
        // the arrow flickers awake as it lights (not when reversing out)
        t.call(
          () => {
            if (!t.reversed() && activeFaceRef.current === "lid") flickerMark("lid5");
          },
          [],
          1.0
        );
        // returning to frame 4 re-lights the server mark
        t.eventCallback("onReverseComplete", () => {
          settleMarks(4, activeFaceRef.current);
          flickerMark(markKey(4, activeFaceRef.current));
        });
        tl3 = t;
        return t;
      };

      /* Frame 6 (INTEGRATIONS) transitions are one-way fades, never
         reversed: entering, the leaving frame fades out wholesale and the
         self-contained entrance plays — the leftmost card appears alone at
         the common card height, the other five accordion out on the
         rubber-band ease, then the first card lifts to its raised pose.
         Leaving, frame 6 fades out and the origin frame fades back in. */
      const appendEntrance6 = (t: gsap.core.Timeline) => {
        const sq = (sel: string) => svg.querySelector(sel);
        const { cards, raise } = ROWS.buildin;
        const first = cards[0];
        const firstEl = sq(`[data-card="buildin:${first.key}"]`);
        t.set(svg.querySelectorAll('[data-card^="buildin:"]'), { x: first.x, y: first.y }, 0.35);
        t.set(sq(`[data-callout="buildin:${first.key}"]`), { opacity: 0 }, 0.35);
        t.set(sq("[data-frame6]"), { opacity: 1 }, 0.35);
        t.set(sq("[data-frame6]"), { pointerEvents: "auto" }, 1.3);
        // the leftmost card appears first, alone, level with the rest
        t.fromTo(firstEl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.4);
        t.fromTo(sq("[data-f6-tab]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
        // accordion: cards spring right, overshooting their spacing like a
        // rubber band before settling, nearest first
        cards.forEach((card, i) => {
          if (i === 0) return;
          t.to(
            sq(`[data-card="buildin:${card.key}"]`),
            { x: card.x, y: card.y, duration: 1.1, ease: "elastic.out(1, 0.62)" },
            0.68 + (i - 1) * 0.055
          );
        });
        // once the row has settled, the first card rises a little and its
        // legend hangs beneath it
        t.to(firstEl, { y: first.y - raise, duration: 0.5, ease: "power2.inOut" }, 1.3);
        t.to(sq(`[data-callout="buildin:${first.key}"]`), { opacity: 1, duration: 0.35 }, 1.55);
      };
      /* The left column: every item that is showing folds (normally one,
         but an interrupted swap can leave two part-way), the target opens
         from wherever it stands. */
      const appendItemSwap = (t: gsap.core.Timeline, _foldKey: string, openKey: string) => {
        const descs = Array.from(section.querySelectorAll<HTMLElement>("[data-item-desc]"));
        const open = descs.find((el) => el.dataset.itemDesc === openKey)!;
        // measure the target at full size, then put back exactly what it had
        const style = open.getAttribute("style") ?? "";
        gsap.set(open, { display: "block", height: "auto" });
        const openH = open.offsetHeight;
        open.setAttribute("style", style);
        const closed = getComputedStyle(open).display === "none";
        if (closed) gsap.set(open, { height: 0, opacity: 0, marginTop: 0 });
        for (const el of descs) {
          const k = el.dataset.itemDesc!;
          if (k === openKey) continue;
          // every other title dims (one may be part-lit from an interrupted swap)
          t.to(section.querySelector(`[data-item-title="${k}"]`), { opacity: 0.2, duration: 0.4 }, 0.1);
          if (getComputedStyle(el).display === "none") continue;
          t.to(el, { height: 0, opacity: 0, marginTop: 0, duration: 0.45, ease: "power2.inOut" }, 0.1);
          t.set(el, { display: "none" }, 0.56);
        }
        t.to(section.querySelector(`[data-item-title="${openKey}"]`), { opacity: 1, duration: 0.4 }, 0.45);
        t.set(open, { display: "block" }, 0.5);
        t.to(open, { height: openH, opacity: 1, marginTop: 12, duration: 0.5, ease: "power2.inOut" }, 0.5);
      };
      /* What each origin frame shows — faded out on the way into 6 and
         faded back in on the way out. */
      const ITEM_OF: Record<number, string> = { 4: "env", 5: "scalability", 6: "integrations", 8: "analytics" };
      /* the scene parts the cube frames own, for fading them out or in */
      const sceneParts = (frame: 4 | 5) => {
        const sq = (sel: string) => svg.querySelector(sel);
        const callouts = sq(frame === 5 ? "[data-env5-callouts]" : "[data-env-callouts]");
        return {
          groups: [callouts, sq("[data-env-legend]"), sq("[data-env-cube]")],
          faces: svg.querySelectorAll(frame === 5 ? "[data-face], [data-face-x]" : "[data-face]"),
          clickable: [callouts, sq("[data-env-cube]")],
        };
      };
      const frameGroup = (frame: 6 | 8) =>
        svg.querySelector(frame === 6 ? "[data-frame6]" : "[data-frame8]");
      /* everything the cube frames (4 and 5) draw — both callout sets and
         every stack layer — for hiding wholesale, whatever state a morph
         or crossfade left them in */
      const cubeAll = () => {
        const sq = (sel: string) => svg.querySelector(sel);
        return {
          groups: [sq("[data-env-callouts]"), sq("[data-env5-callouts]"), sq("[data-env-legend]"), sq("[data-env-cube]")],
          faces: svg.querySelectorAll("[data-face], [data-face-x]"),
          clickable: [sq("[data-env-callouts]"), sq("[data-env5-callouts]"), sq("[data-env-cube]")],
        };
      };
      /* every crossfade starts the same way: the frame we are leaving
         fades out wholesale and stops taking clicks — or, when it is being
         abandoned mid-way for the next gesture, vanishes at once */
      const fadeOutFrame = (t: gsap.core.Timeline, from: 4 | 5 | 6 | 8, instant = false) => {
        const d = instant ? 0 : 0.3;
        if (from === 6 || from === 8) {
          const g = frameGroup(from);
          t.to(g, { opacity: 0, duration: d }, 0);
          t.set(g, { pointerEvents: "none" }, 0.01);
        } else {
          const c = cubeAll();
          t.to(c.groups, { opacity: 0, duration: d }, 0);
          t.to(c.faces, { opacity: 0, duration: d }, instant ? 0 : 0.05);
          t.set(c.clickable, { pointerEvents: "none" }, 0.01);
        }
      };
      /* every frame but `keep` is gone at once — the bedrock under the
         crossfades: whatever an interrupted transition left part-way never
         survives into the next one */
      const hideOthers = (keep: number[]) => {
        if (!keep.includes(4) && !keep.includes(5)) {
          const c = cubeAll();
          gsap.set(c.groups, { opacity: 0 });
          gsap.set(c.faces, { opacity: 0 });
          gsap.set(c.clickable, { pointerEvents: "none" });
        }
        for (const f of [6, 8] as const) {
          if (!keep.includes(f)) gsap.set(frameGroup(f), { opacity: 0, pointerEvents: "none" });
        }
      };

      /* Helper tweens a transition starts beside its main timeline —
         settling the cube's groups, re-lighting the lid, resetting callouts
         a moment later. Registered here so an interruption kills them with
         the rest: left alive, a 0.3s "settle to 1" would keep writing over
         the next transition's instant hide and leave the old frame showing. */
      let side: gsap.core.Tween[] = [];
      const aside = (tw: gsap.core.Tween) => {
        side.push(tw);
        return tw;
      };
      const killSide = () => {
        for (const tw of side) tw.kill();
        side = [];
      };

      const normalizeToLid = () => {
        if (activeFaceRef.current !== "lid") {
          aside(gsap.to(svg.querySelector('[data-face-lit="lid"]'), { opacity: 1, duration: 0.3, overwrite: "auto" }));
          aside(gsap.to(svg.querySelectorAll('[data-face-lit="left"], [data-face-lit="right"]'), { opacity: 0, duration: 0.3, overwrite: "auto" }));
          activeFaceRef.current = "lid";
        }
        // the side marks go dark whatever the light was doing (the lid
        // marks are the morph's or the pose's to set)
        aside(gsap.to(svg.querySelectorAll("[data-mark-side]"), { opacity: 0, duration: 0.3, overwrite: "auto" }));
      };

      /* Transitions. 4 <-> 5 is the cube morph (tl3, played/reversed);
         every other pair is a crossfade built fresh per call: the leaving
         frame fades, the target enters — no intermediate frames, no
         chaining. The left column swaps on its own fresh timeline each
         time (fold the current item, open the target), so tl3 can pose
         the cube unseen without touching the column. */
      let running: gsap.core.Timeline | null = null; // the crossfade in flight
      let itemsRunning: gsap.core.Timeline | null = null;
      const run = (t: gsap.core.Timeline) => {
        running = t;
        if (reduced) t.progress(1);
        else t.play();
      };
      const swapItems = (fold: string, open: string) => {
        const t = gsap.timeline({ paused: true });
        appendItemSwap(t, fold, open);
        itemsRunning = t;
        if (reduced) t.progress(1);
        else t.play();
      };
      /* A transition never makes the user wait: a new gesture or click
         interrupts whatever is in flight — the crossfade and the column
         swap stop where they are and the next transition starts from that
         state (fades run from current values; the column folds whatever
         is showing). The morph keeps its playhead: a following stepTo5 or
         stepBack4 resumes it, a fade-out pauses it. */
      const interrupt = () => {
        const inFlight = !!(running?.isActive() || itemsRunning?.isActive() || tl3?.isActive());
        running?.kill();
        running = null;
        itemsRunning?.kill();
        itemsRunning = null;
        killSide();
        flickerRef.current?.kill();
        return inFlight;
      };
      /* the cube frames' own groups whole and clickable again — an
         interrupted crossfade may have left them part-way */
      const settleCube = () => {
        const sq = (sel: string) => svg.querySelector(sel);
        aside(gsap.to([sq("[data-env-legend]"), sq("[data-env-cube]")], { opacity: 1, duration: 0.3, overwrite: "auto" }));
        aside(gsap.to(svg.querySelectorAll("[data-face]"), { opacity: 0.8, duration: 0.3, overwrite: "auto" }));
        gsap.set(sq("[data-env-cube]"), { pointerEvents: "auto" });
      };

      const stepTo5 = () => {
        frameRef.current = 5;
        hideOthers([4, 5]);
        flickerRef.current?.kill();
        normalizeToLid();
        aside(gsap.delayedCall(0.35, () => resetCallouts(4)));
        const t = ensureTl3();
        t.eventCallback("onComplete", () => settleMarks(5, activeFaceRef.current));
        settleCube();
        swapItems("env", "scalability");
        if (reduced) t.progress(1);
        else t.play(); // from wherever it stands (0, or part-way if a reverse was interrupted)
      };
      const stepBack4 = () => {
        frameRef.current = 4;
        hideOthers([4, 5]);
        flickerRef.current?.kill();
        normalizeToLid();
        aside(gsap.delayedCall(0.35, () => resetCallouts(5)));
        const t = ensureTl3();
        settleCube();
        swapItems("scalability", "env");
        if (reduced) t.progress(0);
        else t.reverse(); // from wherever it stands (1, or part-way if the morph was interrupted)
      };
      /* into 6 from anywhere: the leaving frame fades, the card row plays
         its self-contained entrance (rows reset to rest unseen first) */
      const stepTo6 = (from: 4 | 5 | 8, instant = false) => {
        frameRef.current = 6;
        hideOthers([from, 6]);
        flickerRef.current?.kill();
        scoreTlRef.current?.kill();
        if (from !== 8) {
          tl3?.pause(); // a morph in flight stops; the fade takes it from here
          normalizeToLid();
          aside(gsap.delayedCall(0.35, () => resetCallouts(from)));
        }
        resetRows();
        rowsBusyRef.current = true;
        const t = gsap.timeline({
          paused: true,
          onComplete: () => {
            rowsBusyRef.current = false;
          },
        });
        fadeOutFrame(t, from, instant);
        appendEntrance6(t);
        appendItemSwap(t, ITEM_OF[from], "integrations");
        run(t);
      };

      /* BUILD-IN <-> CONNECTORS: the showing row folds back into its lit
         card like an accordion closing, that card flips on its vertical
         axis (left face -> right face, or back) while sliding toward the
         other row's first-card spot, the rows trade places at the
         edge-on midpoint where the card has no width, and the other row
         springs open on the rubber-band ease. Built fresh each time so it
         starts from whatever the rows currently show. */
      switchTabRef.current = (to: RowKey) => {
        const from = tabRef.current;
        if (to === from || rowsBusyRef.current || frameRef.current !== 6) return;
        tabRef.current = to;
        const sq = (sel: string) => svg.querySelector(sel);
        const F = ROWS[from];
        const T = ROWS[to];
        /* the accordion always folds into and springs out of the FIRST
           card: the leaving row hands its light back to it (animated,
           alongside the fold), the arriving row is reset unseen */
        const fromLit = F.cards[0];
        const toLit = T.cards[0];
        lightCard(from, fromLit.key);
        restRow(to);
        const fromLitEl = sq(`[data-card="${from}:${fromLit.key}"]`)!;
        const toLitEl = sq(`[data-card="${to}:${toLit.key}"]`)!;
        const spotFrom = { x: fromLit.x, y: fromLit.y - F.raise };
        const spotTo = { x: toLit.x, y: toLit.y - T.raise };
        const mid = { x: (spotFrom.x + spotTo.x) / 2, y: (spotFrom.y + spotTo.y) / 2 };
        rowsBusyRef.current = true;
        const t = gsap.timeline({
          onComplete: () => {
            rowsBusyRef.current = false;
          },
        });
        if (reduced) t.timeScale(100);
        // tab header + the leaving row's legend
        t.to(sq(`[data-tab-text="${from}"]`), { opacity: 0.2, duration: 0.4 }, 0);
        t.to(sq(`[data-tab-ul="${from}"]`), { opacity: 0, duration: 0.3 }, 0);
        t.to(sq(`[data-tab-text="${to}"]`), { opacity: 1, duration: 0.4 }, 0.1);
        t.to(sq(`[data-tab-ul="${to}"]`), { opacity: 1, duration: 0.3 }, 0.15);
        t.to(sq(`[data-callout="${from}:${fromLit.key}"]`), { opacity: 0, duration: 0.25 }, 0);
        // accordion closes: the other cards fold back into the lit one,
        // farthest first, vanishing as they arrive
        const others = F.cards.filter((c) => c.key !== fromLit.key);
        others
          .slice()
          .sort((a, b) => Math.abs(b.x - fromLit.x) - Math.abs(a.x - fromLit.x))
          .forEach((c, i) => {
            const el = sq(`[data-card="${from}:${c.key}"]`);
            t.to(el, { x: spotFrom.x, y: spotFrom.y, duration: 0.45, ease: "power2.in" }, i * 0.04);
            t.to(el, { opacity: 0, duration: 0.12 }, i * 0.04 + 0.36);
          });
        // the lit card flips to edge-on while sliding halfway across
        const flipAt = 0.5;
        t.to(fromLitEl.querySelector("[data-icon]"), { opacity: 0, duration: 0.15 }, flipAt);
        t.to(fromLitEl.querySelector("[data-cface]"), { attr: { transform: FACE_EDGE }, duration: 0.22, ease: "power1.in" }, flipAt);
        t.to(fromLitEl, { x: mid.x, y: mid.y, duration: 0.22, ease: "power1.in" }, flipAt);
        // rows trade places at zero width (pointer events go with them;
        // "inherit" so the group's own switch still gates the row)
        const swapAt = flipAt + 0.22;
        t.set(sq(`[data-row="${from}"]`), { opacity: 0, pointerEvents: "none" }, swapAt);
        t.set(sq(`[data-row="${to}"]`), { pointerEvents: "inherit" }, swapAt);
        t.set(svg.querySelectorAll(`[data-card^="${to}:"]`), { x: mid.x, y: mid.y, opacity: 0 }, swapAt);
        t.set(toLitEl, { opacity: 1 }, swapAt);
        t.set(toLitEl.querySelector("[data-cface]"), { attr: { transform: FACE_EDGE } }, swapAt);
        t.set(toLitEl.querySelector("[data-icon]"), { opacity: 0 }, swapAt);
        t.set(sq(`[data-callout="${to}:${toLit.key}"]`), { opacity: 0 }, swapAt);
        t.set(sq(`[data-row="${to}"]`), { opacity: 1 }, swapAt);
        // ...and the new lit card flips open the other way, landing on its spot
        t.to(toLitEl.querySelector("[data-cface]"), { attr: { transform: T.face }, duration: 0.22, ease: "power1.out" }, swapAt);
        t.to(toLitEl, { x: spotTo.x, y: spotTo.y, duration: 0.22, ease: "power1.out" }, swapAt);
        t.to(toLitEl.querySelector("[data-icon]"), { opacity: 1, duration: 0.2 }, swapAt + 0.12);
        // accordion opens: the other cards spring out to their spots
        const openAt = swapAt + 0.22;
        T.cards
          .filter((c) => c.key !== toLit.key)
          .forEach((c, i) => {
            const el = sq(`[data-card="${to}:${c.key}"]`);
            t.to(el, { opacity: 1, duration: 0.15 }, openAt + i * 0.055);
            t.to(el, { x: c.x, y: c.y, duration: 1.1, ease: "elastic.out(1, 0.62)" }, openAt + i * 0.055);
          });
        t.to(sq(`[data-callout="${to}:${toLit.key}"]`), { opacity: 1, duration: 0.35 }, openAt + 0.9);
        // leave the folded row tidy for its next turn
        t.set(fromLitEl.querySelector("[data-cface]"), { attr: { transform: F.face } }, openAt);
        t.set(fromLitEl, { x: spotFrom.x, y: spotFrom.y }, openAt);
        t.set(fromLitEl.querySelector("[data-icon]"), { opacity: 1 }, openAt);
        others.forEach((c) => {
          t.set(sq(`[data-card="${from}:${c.key}"]`), { x: c.x, y: c.y, opacity: 1 }, openAt);
        });
      };
      /* into 8 from anywhere: the leaving frame fades, the scorecard plays */
      const stepTo8 = (from: 4 | 5 | 6, instant = false) => {
        frameRef.current = 8;
        hideOthers([from, 8]);
        flickerRef.current?.kill();
        if (from !== 6) {
          tl3?.pause();
          normalizeToLid();
          aside(gsap.delayedCall(0.35, () => resetCallouts(from)));
        }
        resetScorecard();
        const t = gsap.timeline({ paused: true });
        fadeOutFrame(t, from, instant);
        t.fromTo(frameGroup(8), { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.35);
        t.call(() => playScorecard(), [], 0.6);
        appendItemSwap(t, ITEM_OF[from], "analytics");
        run(t);
      };
      /* from 6/8 into a cube frame: the leaving frame fades, the cube is
         posed unseen (tl3 at 0 = frame 4, at 1 = frame 5, lid lit, default
         callouts) and fades in already in place */
      const stepToCube = (from: 6 | 8, target: 4 | 5, instant = false) => {
        frameRef.current = target;
        hideOthers([from, target]);
        flickerRef.current?.kill();
        scoreTlRef.current?.kill();
        const morph = ensureTl3();
        const p = sceneParts(target);
        /* pose the cube right now — it sits hidden under the leaving frame,
           so nothing shows, and an interrupted crossfade can never leave it
           unposed. Pause first: a morph that finished playing is still
           "playing" to GSAP, and moving its playhead would make it play
           again (to frame 5) underneath this crossfade. */
        morph.pause();
        morph.progress(target === 5 ? 1 : 0, true);
        // the pose shows the target's callouts/legend/marks; hide them
        // again so the scene fades in as one
        gsap.set(p.groups, { opacity: 0 });
        gsap.set(p.faces, { opacity: 0 });
        gsap.set(svg.querySelector('[data-face-lit="lid"]'), { opacity: 1 });
        gsap.set(svg.querySelectorAll('[data-face-lit="left"], [data-face-lit="right"]'), { opacity: 0 });
        activeFaceRef.current = "lid";
        // the marks follow the light, which the pose gives to the lid
        settleMarks(target, "lid");
        resetCallouts(target);
        const t = gsap.timeline({ paused: true });
        fadeOutFrame(t, from, instant);
        t.to(p.groups, { opacity: 1, duration: 0.35 }, 0.35);
        t.to(p.faces, { opacity: 0.8, duration: 0.35 }, 0.35);
        t.set(p.clickable, { pointerEvents: "auto" }, 0.7);
        appendItemSwap(t, ITEM_OF[from], ITEM_OF[target]);
        t.eventCallback("onComplete", () => flickerMark(target === 5 ? "lid5" : "lid"));
        run(t);
      };

      /* FREE: the forced first visit is over — 8 was reached or a title
         was clicked — and scrolling is never captured again this page
         load (see the navigation section) */
      let free = false;

      /* `instant`: the frame we are leaving was itself still arriving
         (abandoned for this gesture) — it vanishes instead of fading */
      const goTo = (target: number, instant = false) => {
        if (target === 8) free = true; // the story's end ends the forced visit
        const cur = frameRef.current;
        if (target === cur) return;
        if (cur === 4 && tl2.progress() < 1) return; // frame 4 not landed
        if (cur === 4 && target === 5) return stepTo5();
        if (cur === 5 && target === 4) return stepBack4();
        if (target === 6) return stepTo6(cur as 4 | 5 | 8, instant);
        if (target === 8) return stepTo8(cur as 4 | 5 | 6, instant);
        stepToCube(cur as 6 | 8, target as 4 | 5, instant);
      };
      /* ---------- SCROLL-DRIVEN NAVIGATION ----------
         Frames 1-4 are ONE scrubbed animation: stages 1-3 while the panel
         rises to the viewport's center (tl), 3 -> 4 over the RUNWAY the
         stage stays stuck for (tl2). Both are pure functions of scroll
         position, so scrolling up rewinds them. The scrub runs only while
         frame 4 is the base: at 5/6/8 the runway is inert and the panel
         keeps its frame wherever the page goes.

         The FIRST VISIT is forced: reaching the runway's end on the way
         down captures the page (wheel, keys, touch) and each gesture steps
         4 -> 5 -> 6 -> 8 and back, one per gesture, none while a
         transition runs. Up from 4 releases the page (the scrub rewinds
         with it); down from 8 releases it onward. The visit turns FREE —
         no capture ever again this page load — once 8 has been reached or
         a title was clicked; in free mode the next gesture releases
         whichever way it goes, and frames change by click only. A title
         click always brings the stage to the runway's end first (the
         scrub completes on the way) and holds the page there for the
         frame to play. Desktop pointers at xl only; reduced motion never
         captures; below xl there is no runway and 3 -> 4 plays timed on
         the first title click. */
      const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
      const runwayOn = () => window.matchMedia("(min-width: 1280px)").matches;
      const captureOn = () =>
        runwayOn() && window.matchMedia("(hover: hover)").matches && !reduced;

      let captured = false;
      let landed = false; // frame 4 formed (tl2 at 1)
      let lastTravel = NaN; // runway travel last seen, for the scroll direction
      let arriving: (() => void) | null = null; // runs when a programmatic scroll lands
      let arriveTimer = 0;

      /* stages 1-3 run while the panel's top rises from r0 (460px of it
         showing) to r1 (centered) — fixed design coordinates, clamped to
         the deepest scroll the page allows while this is its last block */
      const pinTarget = () => {
        const r = panel.getBoundingClientRect();
        const k = r.height / 679;
        const vh = window.innerHeight;
        const maxScroll =
          document.documentElement.scrollHeight - vh - window.scrollY;
        const minTop = r.top - Math.max(0, maxScroll); // panel.top at page bottom
        return { r, r0: vh - 460 * k, r1: Math.max(vh / 2 - 340 * k, minTop) };
      };
      /* the runway (xl): how far the stuck stage has travelled into it
         and how much of it the page can reach today — the section is the
         page's last block, so the story clamps to the deepest scroll
         available and the clamp retires as later sections add room */
      const geometry = () => {
        const vh = window.innerHeight;
        const stickyTop = vh / 2 - 347; // the container's sticky top (panel centered)
        const room = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
        const travel = stickyTop - runway.getBoundingClientRect().top;
        const runwayLen = Math.min(RUNWAY, Math.max(1, travel + room));
        return { travel, runwayLen, overshoot: travel - runwayLen };
      };

      /* frame 4 has formed: its one-shot effects, and the 4<->5 morph is
         built now, while its start values are what is on screen */
      const land = () => {
        landed = true;
        settleMarks(4, "lid");
        flickerMark();
        ensureTl3();
      };
      const unland = () => {
        landed = false;
        flickerRef.current?.kill();
      };

      /* ONE STEP PER GESTURE. A gesture is a burst of input events. It
         ends after 90ms of silence — or, because a trackpad keeps streaming
         inertia for a second or two after the finger lifts and the next
         flick lands inside that stream, when a fresh flick shows: the
         stream had DECAYED (a delta under 35% of the gesture's peak) and a
         delta then jumps to at least 10 and at least three times the
         decayed tail's lowest value. The first step a gesture causes spends
         it — however long the fling, one step. A gesture that lands while a
         transition runs is dropped: what plays must always be the answer
         to the scroll happening now, never a queued one. */
      let gestureUsed = false;
      let gestureTimer = 0;
      let acc = 0;
      let peak = 0; // the largest |delta| of the gesture in progress
      let decayed = true; // its stream has died down (or nothing is in progress)
      let trough = 0; // the smallest |delta| seen since it decayed
      let lastStepAt = 0;
      let lastEventAt = 0;
      const PUSH = 10; // a single event this big is a real push
      const resetGesture = () => {
        gestureUsed = false;
        acc = 0;
        peak = 0;
        decayed = true;
        trough = 0;
      };
      const touchGesture = () => {
        window.clearTimeout(gestureTimer);
        gestureTimer = window.setTimeout(resetGesture, 90);
      };
      const STEP_THRESH = 30; // wheel delta that makes a step

      const capture = (overshoot = 0) => {
        if (captured) return;
        captured = true;
        acc = 0;
        gestureUsed = true; // the gesture that brought us here is spent
        touchGesture();
        // align exactly on the runway's end, undoing any overshoot
        if (overshoot > 0) window.scrollBy({ top: -overshoot, behavior: "instant" });
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("keydown", onKey);
      };
      /* let the page go; a nudge starts it moving so a single wheel notch
         or key press visibly leaves */
      const release = (nudge = 0) => {
        if (!captured) return;
        captured = false;
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("keydown", onKey);
        if (nudge) window.scrollBy({ top: nudge, behavior: "smooth" });
      };

      /* one gesture's step: +1 down, -1 up. A forced visit only ever
         stands at 4, 5 or 6 here — reaching 8 makes it free. A transition
         in flight yields to it (see interrupt). */
      const step = (dir: 1 | -1) => {
        if (free) return release(dir * 100);
        const frame = frameRef.current;
        const target = dir > 0 ? (frame === 4 ? 5 : frame === 5 ? 6 : 8) : frame === 6 ? 5 : frame === 5 ? 4 : 0;
        if (!target) return release(-100); // from 4 the page goes and the scrub rewinds with it
        goTo(target, interrupt());
      };

      function onWheel(e: WheelEvent) {
        if (!captured) return;
        e.preventDefault();
        const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
        const abs = Math.abs(delta);
        touchGesture();
        const now = performance.now();
        // a fresh flick: the previous stream had died down for real (a tail
        // under 6, not just the dip as the finger lifts before the momentum
        // phase kicks in) and a push follows; never inside 250ms of a step
        if (gestureUsed && decayed && trough <= 6 && abs >= Math.max(PUSH, trough * 3) && now - lastStepAt > 250) {
          resetGesture();
          decayed = false;
        }
        peak = Math.max(peak, abs);
        if (!decayed && peak >= 8 && abs <= peak * 0.35) {
          decayed = true;
          trough = abs;
        } else if (decayed) trough = Math.min(trough, abs);
        // sparse events (an inertia tail after the quiet reset) never add
        // up to a step: only events within 60ms of each other accumulate
        if (now - lastEventAt > 60) acc = 0;
        lastEventAt = now;
        if (gestureUsed) return;
        acc += delta;
        // a step takes a real push: one event of PUSH, or STEP_THRESH within a dense burst
        if (Math.abs(acc) < STEP_THRESH && abs < PUSH) return;
        const dir: 1 | -1 = acc > 0 ? 1 : -1;
        acc = 0;
        gestureUsed = true;
        lastStepAt = performance.now();
        step(dir);
      }
      function onKey(e: KeyboardEvent) {
        if (!captured) return;
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        let dir: 1 | -1 | 0 = 0;
        if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
        else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
        if (!dir) return;
        e.preventDefault();
        touchGesture();
        if (gestureUsed) return;
        gestureUsed = true;
        step(dir);
      }
      function onTouchMove(e: TouchEvent) {
        if (captured) e.preventDefault();
      }

      /* scroll the page so the stage sits at the runway's end; `then`
         runs when it lands (apply() sees it) — or after 1.5s regardless */
      const scrollToRunwayEnd = (then: () => void) => {
        const { overshoot } = geometry();
        arriving = then;
        window.clearTimeout(arriveTimer);
        arriveTimer = window.setTimeout(() => {
          const f = arriving;
          arriving = null;
          f?.();
        }, 1500);
        window.scrollTo({ top: window.scrollY - overshoot, behavior: "smooth" });
      };
      const arrived = () => {
        const f = arriving;
        arriving = null;
        window.clearTimeout(arriveTimer);
        f?.();
      };

      const apply = () => {
        const { r, r1, r0 } = pinTarget();
        const base4 = frameRef.current === 4;
        if (base4) tl.progress(clamp01((r0 - r.top) / Math.max(r0 - r1, 1)));
        if (!runwayOn()) return; // no runway below xl: frames by click only
        const g = geometry();
        if (base4) {
          const p = clamp01(g.travel / g.runwayLen);
          tl2.progress(p);
          if (p >= 1 && !landed) land();
          else if (p < 1 && landed) unland();
        }
        if (arriving && Math.abs(g.overshoot) <= 2) arrived();
        if (captured) {
          // the scrollbar can still drag the page away: that quits the sequence
          if (Math.abs(g.overshoot) > 40) {
            release();
            free = true;
          }
          return;
        }
        const goingDown = Number.isFinite(lastTravel) && g.travel > lastTravel + 0.5;
        lastTravel = g.travel;
        // the first visit is held at the runway's end on the way down
        if (!free && captureOn() && base4 && landed && goingDown && g.overshoot >= 0) capture(g.overshoot);
      };

      /* Title clicks: the user drives from here (free). The stage comes to
         the runway's end first — the scrub completing on the way — and
         the page holds there while the frame plays. */
      goToFrameRef.current = (target) => {
        if (tl2.isActive() || target === frameRef.current) return;
        free = true;
        const instant = interrupt();
        if (reduced) return goTo(target, instant);
        if (!runwayOn()) {
          // no runway: the 3 -> 4 leg plays timed, then the target
          if (tl2.progress() < 1) {
            tl2.eventCallback("onComplete", () => {
              tl2.eventCallback("onComplete", null);
              land();
              if (target !== 4) goTo(target);
            });
            tl2.play();
          } else goTo(target, instant);
          return;
        }
        const go = () => {
          if (captureOn()) capture(Math.max(0, geometry().overshoot));
          goTo(target, instant);
        };
        if (Math.abs(geometry().overshoot) > 2) scrollToRunwayEnd(go);
        else go();
      };

      if (reduced) {
        tl.progress(1);
        tl2.progress(1);
        land();
        return;
      }

      let listening = false;
      const on = () => {
        if (listening) return;
        listening = true;
        window.addEventListener("scroll", apply, { passive: true });
        window.addEventListener("resize", apply, { passive: true });
      };
      const off = () => {
        if (!listening) return;
        listening = false;
        window.removeEventListener("scroll", apply);
        window.removeEventListener("resize", apply);
      };

      apply();
      on();
      // detach the listeners whenever the section is far off screen
      const io = new IntersectionObserver(
        ([entry]) => {
          apply();
          if (entry.isIntersecting) on();
          else off();
        },
        { rootMargin: "200px" }
      );
      io.observe(section);

      return () => {
        io.disconnect();
        off();
        release();
        window.clearTimeout(gestureTimer);
        window.clearTimeout(arriveTimer);
      };
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-5 md:px-10 xl:px-0">
      <div className="pt-24 xl:pt-[120px]">
      {/* the runway: at xl the stage below sticks at the viewport's center
          while this box's extra height scrolls by, driving 3 -> 4 */}
      <div
        ref={runwayRef}
        className="xl:h-[calc(686px+var(--runway))]"
        style={{ "--runway": `${RUNWAY}px` } as CSSProperties}
      >
      <div className="relative mx-auto max-w-[600px] md:max-w-none xl:sticky xl:top-[calc(50vh-347px)] xl:h-[686px] xl:w-[1200px] xl:max-w-none">
        {/* left column */}
        <div className="xl:absolute xl:left-0 xl:top-0 xl:w-[408px]">
          {/* same one-shot scramble as the FEATURES eyebrow */}
          <HyperText
            as="p"
            startOnView
            delay={400}
            duration={800}
            animateOnHover={false}
            className="font-mono text-indicator uppercase text-accent"
          >
            Infrastructure
          </HyperText>
          <h2 className="mt-3 text-heading-lg text-text-primary xl:text-display">
            Build freely.
            <br />
            Launch confidently.
          </h2>

          <div className="mt-[72px] xl:w-[350px]">
            {ITEMS.map((item, i) => (
              <div key={item.key}>
                {i > 0 && (
                  <div className="mt-[26px] h-px bg-white/[0.06] opacity-70" />
                )}
                <p
                  data-item-title={item.key}
                  className={
                    (item.open
                      ? "text-heading-sm text-text-primary"
                      : "mt-[26px] text-heading-sm text-text-primary opacity-20") +
                    " cursor-pointer"
                  }
                  onClick={() =>
                    goToFrameRef.current(
                      { env: 4, scalability: 5, integrations: 6, analytics: 8 }[item.key] ?? 4
                    )
                  }
                >
                  {item.title}
                </p>
                {item.desc && (
                  <p
                    data-item-desc={item.key}
                    className="mt-3 text-body-md text-text-body/60"
                    style={item.open ? undefined : { display: "none" }}
                  >
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* stage panel — bottom edge runs off the section (no border there) */}
        <div
          ref={panelRef}
          className="relative mt-12 aspect-[751/679] w-full overflow-hidden rounded-t-lg xl:absolute xl:left-[449px] xl:top-[7px] xl:mt-0 xl:aspect-auto xl:h-[679px] xl:w-[751px]"
          style={{
            background:
              "linear-gradient(0deg, rgba(55,80,200,0.02), rgba(55,80,200,0.02)), #000",
          }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-t-lg" style={ring} />

          <svg
            ref={svgRef}
            viewBox="0 0 751 679"
            className="absolute inset-0 size-full"
            fill="none"
            aria-hidden
          >
            <defs>
              {/* runs down the face's local axis, as the Figma handles do */}
              <linearGradient id="infra-face-stroke" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#A8A8A8" />
                <stop offset="1" stopColor="#424242" />
              </linearGradient>
              <filter
                id="infra-glow-blur"
                x="-25%"
                y="-50%"
                width="150%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="30.3" />
              </filter>
              {/* frame-4 paints */}
              <radialGradient id="infra-env-radial">
                <stop stopColor="#18365F" />
                <stop offset="1" stopColor="#316FC5" />
              </radialGradient>
              <filter
                id="infra-env-blur"
                x="-150%"
                y="-150%"
                width="400%"
                height="400%"
              >
                <feGaussianBlur stdDeviation="150" />
              </filter>
              <linearGradient id="infra-lid" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6C91F9" stopOpacity="0.75" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="infra-ni-label" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#577ADC" />
                <stop offset="1" stopColor="#D5D9E5" />
              </linearGradient>
              <linearGradient id="infra-as-label" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#6C91F9" />
                <stop offset="1" stopColor="#FFFFFF" />
              </linearGradient>
              {/* frame-8 resting tile stroke, per the reviewed tile: the
                  Figma transform [[0,-0.917,1],[0.917,0,0.038]] is
                  t = 1 - 0.917y — white at the top edge, #6485E7 reached
                  just past the bottom (y = 1.09) — all four tiles */}
              <linearGradient id="infra-tile-stroke" x1="0.5" y1="1.09" x2="0.5" y2="0">
                <stop stopColor="#6485E7" />
                <stop offset="1" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient
                id="infra-g-mark"
                x1="11.4421"
                y1="-16.7498"
                x2="28.1544"
                y2="28.5273"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#666666" />
              </linearGradient>
              <linearGradient id="infra-card-lit" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6C91F9" stopOpacity="0.75" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.82" />
              </linearGradient>
              <linearGradient id="infra-icon-dim" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#999999" />
              </linearGradient>
              <clipPath id="infra-grain-clip">
                <ellipse cx="368.5" cy="370.5" rx="162.5" ry="177.5" />
              </clipPath>
              <clipPath id="infra-e88-clip">
                <ellipse cx="370.5" cy="344.5" rx="149.5" ry="107.5" />
              </clipPath>
            </defs>

            {/* frame-4 glows behind everything, both compositing NORMALLY
                (adding them was what read as a solid ball). Each ellipse's
                two Figma fills — the 52% radial with the grain tiled over
                it at LIGHTEN — live in an isolated group so the lighten
                stays inside the paint stack, as in Figma. */}
            <g data-env-back style={{ opacity: 0 }}>
              {/* Ellipse 21888 — the ambient, layer-blurred 300; its grain
                  tile is 241.4px (sf 0.1178), two columns cover the box.
                  Hidden until the 3 -> 4 entrance blooms it from center.
                  (21891's sharp radial is dropped — browser compositing
                  turns it into a solid disc.) */}
              <g style={{ isolation: "isolate" }} filter="url(#infra-env-blur)">
                <ellipse
                  cx="370.5"
                  cy="344.5"
                  rx="149.5"
                  ry="107.5"
                  fill="url(#infra-env-radial)"
                  opacity="0.52"
                />
                <image
                  data-noise
                  x="221"
                  y="237"
                  width="241.4"
                  height="241.4"
                  preserveAspectRatio="none"
                  clipPath="url(#infra-e88-clip)"
                  style={{ mixBlendMode: "lighten" }}
                />
                <image
                  data-noise
                  x="462.4"
                  y="237"
                  width="241.4"
                  height="241.4"
                  preserveAspectRatio="none"
                  clipPath="url(#infra-e88-clip)"
                  style={{ mixBlendMode: "lighten" }}
                />
              </g>
            </g>

            {/* the blue wash rides along through stages 1-3 */}
            <g
              data-wash
              transform="translate(-15 219) scale(1 -1)"
              filter="url(#infra-glow-blur)"
            >
              <path
                d={GLOW_PATH}
                fill="#2D69B7"
                fillOpacity="0.09"
                stroke="#FFFFFF"
                strokeOpacity="0.26"
                strokeWidth="0.9"
              />
            </g>

            {/* the halo grain — kept but hidden: neither in nor under the
                cube group read well in review. The generator stays for a
                possible retune. */}
            <image
              data-noise
              x="206"
              y="193"
              width="355.3"
              height="355.3"
              preserveAspectRatio="none"
              clipPath="url(#infra-grain-clip)"
              opacity="0.18"
              style={{ display: "none" }}
            />

            {/* the three layers, authored coincident (stage 1) */}
            <g data-cube opacity="0.9" style={{ mixBlendMode: "plus-lighter" }}>
              {SPREAD_Y.map((y) => (
                <g key={y} data-face transform="translate(375.5 294.6)">
                  <rect
                    width="90.64"
                    height="90.64"
                    rx="6"
                    transform="matrix(0.866 0.5 -0.866 0.5 0 0)"
                    fill="#000"
                    stroke="url(#infra-face-stroke)"
                    strokeOpacity="0.5"
                    strokeWidth="0.9"
                    strokeDasharray="1.8 1.8"
                  />
                </g>
              ))}
              {/* frame 5 scales the stack out to six layers — the three
                  extras exist only from that frame on */}
              {STACK5.extraY.map((y) => (
                <g
                  key={y}
                  data-face-x
                  transform={`translate(${STACK5.x} ${y})`}
                  style={{ opacity: 0 }}
                >
                  <rect
                    width={STACK5.size}
                    height={STACK5.size}
                    rx="6"
                    transform="matrix(0.866 0.5 -0.866 0.5 0 0)"
                    fill="#000"
                    stroke="#A8A8A8"
                    strokeOpacity="0.5"
                    strokeWidth="0.9"
                    strokeDasharray="1.8 1.8"
                  />
                </g>
              ))}
            </g>

            {/* frame 4: the cube around the stack, its mark, the legend,
                and the ENVIRONMENT callouts — three groups so the 3 -> 4
                entrance can stage them separately, all hidden until then */}
            {/* every face is a click target for its callout: lid = NETWORK
                ISOLATION, left = AUTOMATED BACKUP, right = HIGH
                AVAILABILITY. Each carries its dim skin (the translucent
                pair) with a lit overlay (the lid's gradient in its own
                local space) crossfaded by the swap. */}
            <g data-env-cube style={{ opacity: 0, pointerEvents: "none" }}>
              <g
                data-cube-face="lid"
                transform={CUBE.lid}
                onClick={() => swapFace("lid")}
                style={{ cursor: "pointer" }}
              >
                <rect width="85.2" height="85.2" rx="6" fill="#617FDC" fillOpacity="0.1" />
                <rect width="85.2" height="85.2" rx="6" fill="#FFFFFF" fillOpacity="0.05" />
                <rect
                  data-face-lit="lid"
                  width="85.2"
                  height="85.2"
                  rx="6"
                  fill="url(#infra-lid)"
                  stroke="#6C91F9"
                  strokeOpacity="0.06"
                  strokeWidth="0.9"
                />
              </g>
              <g
                data-cube-face="left"
                transform={CUBE.left}
                onClick={() => swapFace("left")}
                style={{ cursor: "pointer" }}
              >
                <rect width="85.3" height="85.1" rx="8" fill="#617FDC" fillOpacity="0.1" />
                <rect width="85.3" height="85.1" rx="8" fill="#FFFFFF" fillOpacity="0.05" />
                <rect
                  data-face-lit="left"
                  width="85.3"
                  height="85.1"
                  rx="8"
                  fill="url(#infra-lid)"
                  stroke="#6C91F9"
                  strokeOpacity="0.06"
                  strokeWidth="0.9"
                  style={{ opacity: 0 }}
                />
              </g>
              <g
                data-cube-face="right"
                transform={CUBE.right}
                onClick={() => swapFace("right")}
                style={{ cursor: "pointer" }}
              >
                <rect width="85.3" height="85.1" rx="8" fill="#617CCE" fillOpacity="0.1" />
                <rect width="85.3" height="85.1" rx="8" fill="#FFFFFF" fillOpacity="0.03" />
                <rect
                  data-face-lit="right"
                  width="85.3"
                  height="85.1"
                  rx="8"
                  fill="url(#infra-lid)"
                  stroke="#6C91F9"
                  strokeOpacity="0.06"
                  strokeWidth="0.9"
                  style={{ opacity: 0 }}
                />
              </g>
              {/* lucide/server riding the lid — present only while the lid
                  holds the light */}
              <g
                data-cube-mark
                transform={CUBE.icon}
                fill="none"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              >
                {/* the two server rows, split so the lit/dim halves can
                    trade places in the attention flicker */}
                <g data-mark-a>
                  <path d="M16.6667 1.66667H3.33333C2.41286 1.66667 1.66667 2.41286 1.66667 3.33333V6.66667C1.66667 7.58714 2.41286 8.33333 3.33333 8.33333H16.6667C17.5871 8.33333 18.3333 7.58714 18.3333 6.66667V3.33333C18.3333 2.41286 17.5871 1.66667 16.6667 1.66667Z" />
                  <path d="M5 5H5.00833" strokeWidth="0.75" />
                </g>
                <g data-mark-b opacity="0.3">
                  <path d="M16.6667 11.6667H3.33333C2.41286 11.6667 1.66667 12.4129 1.66667 13.3333V16.6667C1.66667 17.5871 2.41286 18.3333 3.33333 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V13.3333C18.3333 12.4129 17.5871 11.6667 16.6667 11.6667Z" />
                  <path d="M5 15H5.00833" strokeWidth="0.75" />
                </g>
              </g>
              {/* the side faces' marks: frame 4 has save-all left
                  and send-to-back right, frame 5 list-clock left and
                  globe-check right — each present only while its face
                  holds the light in its frame, with the same bright/dim
                  split for the flicker. Path data and placement come from
                  Figma's export (see FACE_MARKS). */}
              {SIDE_MARK_KEYS.map((side) => {
                const m = FACE_MARKS[side];
                const draw = (paths: typeof m.lit) =>
                  paths.map((pth) => (
                    <path
                      key={pth.d.slice(0, 32)}
                      d={pth.d}
                      fill={pth.fill ? "#FFFFFF" : undefined}
                      stroke={pth.fill ? "none" : undefined}
                      strokeWidth={pth.strokeWidth}
                    />
                  ));
                return (
                  <g
                    key={side}
                    data-mark-side={side}
                    transform={`translate(${m.translate})`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0, pointerEvents: "none" }}
                  >
                    <g data-mark-side-a>{draw(m.lit)}</g>
                    <g data-mark-side-b opacity="0.3">
                      {draw(m.dim)}
                    </g>
                  </g>
                );
              })}
              {/* frame 5's lid mark — lucide/arrow-down-up, same lit/dim
                  split for its own future flicker */}
              <g
                data-mark5
                transform={CUBE5.icon}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0, pointerEvents: "none" }}
              >
                <g data-mark5-a>
                  <path d="M2.5 13.3333L5.83333 16.6667L9.16667 13.3333" />
                  <path d="M5.83333 16.6667V3.33333" />
                </g>
                <g data-mark5-b opacity="0.3">
                  <path d="M17.5 6.66667L14.1667 3.33333L10.8333 6.66667" />
                  <path d="M14.1667 3.33333V16.6667" />
                </g>
              </g>
            </g>

            {/* legend — row 1's label swaps per frame (ENVIRONMENT in
                frame 4, INFRASTRUCTURE from frame 5 on) */}
            <g data-env-legend style={{ opacity: 0 }}>
              <rect x="36" y="36" width="28" height="28" rx="8" fill="#617CCE" fillOpacity="0.1" />
              <text
                data-legend-env
                x="76"
                y="53.5"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                ENVIRONMENT
              </text>
              <text
                data-legend-infra
                x="76"
                y="53.5"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)", opacity: 0 }}
              >
                INFRASTRUCTURE
              </text>
              <rect
                x="36"
                y="88"
                width="28"
                height="28"
                rx="4"
                fill="none"
                stroke="#A8A8A8"
                strokeOpacity="0.5"
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <text
                x="76"
                y="105.5"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                BUILD
              </text>
            </g>

            {/* interactive callouts — pointer events stay off until the
                entrance finishes (a .set near the end of tl2) */}
            <g data-env-callouts style={{ opacity: 0, pointerEvents: "none" }}>
              {ENV_CALLOUTS.map((c) => {
                const lx = c.anchor === "end" ? c.x2 : c.x1;
                const active = c.key === "ni";
                return (
                  <g key={c.key}>
                    <line
                      x1={c.x1}
                      y1={c.y}
                      x2={c.x2}
                      y2={c.y}
                      stroke="#FFFFFF"
                      strokeOpacity="0.1"
                      strokeWidth="0.9"
                    />
                    {/* gray and gradient labels stacked; the swap
                        crossfades them */}
                    <text
                      data-co-base={c.key}
                      x={lx}
                      y={c.y + 24.5}
                      textAnchor={c.anchor}
                      fill="#4E4E4E"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        opacity: active ? 0 : 1,
                      }}
                    >
                      {c.label}
                    </text>
                    <text
                      data-co-active={c.key}
                      x={lx}
                      y={c.y + 24.5}
                      textAnchor={c.anchor}
                      fill="url(#infra-ni-label)"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        opacity: active ? 1 : 0,
                      }}
                    >
                      {c.label}
                    </text>
                    <text
                      data-co-desc={c.key}
                      textAnchor={c.anchor}
                      fill="#A1A1A1"
                      fillOpacity="0.6"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-sans)",
                        opacity: active ? 1 : 0,
                      }}
                    >
                      {c.desc.map((lineText, i) => (
                        <tspan key={lineText} x={lx} y={c.y + 49.1 + i * 19.5}>
                          {lineText}
                        </tspan>
                      ))}
                    </text>
                    {/* hit zone: the line + label band */}
                    <rect
                      x={c.x1}
                      y={c.y - 10}
                      width={c.x2 - c.x1}
                      height={44}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onClick={() => swapFace(c.face)}
                    />
                  </g>
                );
              })}
            </g>

            {/* frame 6: the connector card rows under the BUILD-IN /
                CONNECTORS tab header. The header per Figma: a 0.9 white
                30% baseline under the whole row, the active label at full
                #EBEBEB with a 0.7 underline, the other at 20%. */}
            <g data-frame6 style={{ opacity: 0, pointerEvents: "none" }}>
              <g data-f6-tab>
                {(["buildin", "connectors"] as RowKey[]).map((row) => {
                  const x = row === "buildin" ? 299 : 374;
                  const w = row === "buildin" ? 63 : 78;
                  const on = row === "buildin";
                  return (
                    <g key={row} onClick={() => switchTabRef.current(row)} style={{ cursor: "pointer" }}>
                      <text
                        data-tab-text={row}
                        x={x}
                        y="216.5"
                        fill="#EBEBEB"
                        fontSize="13"
                        style={{ fontFamily: "var(--font-geist-mono)", opacity: on ? 1 : 0.2 }}
                      >
                        {row === "buildin" ? "BUILD-IN" : "CONNECTORS"}
                      </text>
                      <rect
                        data-tab-ul={row}
                        x={x}
                        y="224.65"
                        width={w}
                        height="0.7"
                        fill="#EBEBEB"
                        style={{ opacity: on ? 1 : 0 }}
                      />
                      <rect x={x - 4} y="200" width={w + 8} height="25" fill="transparent" />
                    </g>
                  );
                })}
              </g>

              {(["buildin", "connectors"] as RowKey[]).map((row) => {
                const { cards, face, raise, lineDx } = ROWS[row];
                return (
                  <g
                    key={row}
                    data-row={row}
                    style={{
                      opacity: row === "buildin" ? 1 : 0,
                      // the showing row inherits the group's switch (see resetRows)
                      pointerEvents: row === "buildin" ? "inherit" : "none",
                    }}
                  >
                    {/* drawn right to left so the nearest card is in front */}
                    {[...cards].reverse().map((c, ri) => {
                      const lit = ri === cards.length - 1;
                      return (
                        <g
                          key={c.key}
                          data-card={`${row}:${c.key}`}
                          transform={`translate(${c.x} ${c.y - (lit ? raise : 0)})`}
                          onMouseEnter={() => lightCard(row, c.key)}
                          onClick={() => lightCard(row, c.key)}
                          style={{ cursor: "pointer" }}
                        >
                          <g data-cface transform={face}>
                            <rect width="77.5" height="77.5" rx="8" fill="#617FDC" fillOpacity="0.1" />
                            <rect
                              width="77.5"
                              height="77.5"
                              rx="8"
                              fill="#FFFFFF"
                              fillOpacity="0.05"
                              stroke="#909090"
                              strokeOpacity="0.09"
                              strokeWidth="0.9"
                            />
                            <rect
                              data-lit
                              width="77.5"
                              height="77.5"
                              rx="6"
                              fill="url(#infra-card-lit)"
                              stroke="#6C91F9"
                              strokeOpacity="0.06"
                              strokeWidth="0.9"
                              style={{ opacity: lit ? 1 : 0 }}
                            />
                          </g>
                          <g data-icon transform={c.iconT}>
                            {c.icon ? (
                              <>
                                <path
                                  data-icon-dim
                                  d={ICONS6[c.icon]}
                                  fill="url(#infra-icon-dim)"
                                  fillOpacity="0.2"
                                  style={{ opacity: lit ? 0 : 1 }}
                                />
                                <path
                                  data-icon-lit
                                  d={ICONS6[c.icon]}
                                  fill="#FFFFFF"
                                  style={{ opacity: lit ? 1 : 0 }}
                                />
                              </>
                            ) : (
                              <g
                                transform={c.off ? `translate(${c.off[0]} ${c.off[1]})` : undefined}
                                dangerouslySetInnerHTML={{ __html: BRAND7[c.key].markup }}
                              />
                            )}
                          </g>
                        </g>
                      );
                    })}
                    {/* each card's legend, hanging under it when lit */}
                    {cards.map((c, i) => (
                      <g key={c.key} data-callout={`${row}:${c.key}`} style={{ opacity: i === 0 ? 1 : 0 }}>
                        <line
                          x1={c.x + lineDx}
                          y1="391"
                          x2={c.x + lineDx}
                          y2="480"
                          stroke="#FFFFFF"
                          strokeOpacity="0.1"
                          strokeWidth="0.9"
                        />
                        <text
                          x={c.x + lineDx + 0.5}
                          y="499.5"
                          textAnchor="middle"
                          fill="#EDEDED"
                          fontSize="13"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {c.label}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </g>

            {/* frame 8: the Google Lighthouse scorecard. Static; its own
                animation comes next. */}
            <g data-frame8 style={{ opacity: 0, pointerEvents: "none" }}>
              <g data-f8-header opacity="0.8">
                {/* mynaui:google-so, exported: a white 33% base with the
                    white -> #666 gradient at 83% over it */}
                <g data-g-mark transform="translate(294.5 203)">
                  <path d={G_MARK} fill="#FFFFFF" fillOpacity="0.33" />
                  <path d={G_MARK} fill="url(#infra-g-mark)" fillOpacity="0.83" />
                </g>
                <text
                  x="322.5"
                  y="218.8"
                  fill="#FFFFFF"
                  fillOpacity="0.33"
                  fontSize="16"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  Google Lighthouse
                </text>
              </g>
              {TILES8.map((t) => (
                <g key={t.key} data-tile8={t.key}>
                  {/* the resting gradient stroke, revealed once the light
                      has run the outline */}
                  <rect
                    data-tile-stroke
                    x={t.x}
                    y={t.y}
                    width="77.5"
                    height="77.5"
                    rx="6"
                    fill="none"
                    stroke="url(#infra-tile-stroke)"
                    strokeOpacity="0.86"
                    strokeWidth="1"
                    style={{ opacity: 0.7 }}
                  />
                  {/* the fill burst as the score lands: the design's tile
                      fill (#617FDC 10% under white 5%) flashes on and
                      dissipates, like the agents' fill in the Features card */}
                  <g data-tile-fill style={{ opacity: 0 }}>
                    <rect x={t.x} y={t.y} width="77.5" height="77.5" rx="6" fill="#617FDC" fillOpacity="0.1" />
                    <rect x={t.x} y={t.y} width="77.5" height="77.5" rx="6" fill="#FFFFFF" fillOpacity="0.05" />
                  </g>
                  {/* while the light runs, the outline sits there in white;
                      it brightens for a beat as the score lands, then
                      fades into the resting gradient */}
                  <rect
                    data-tile-base
                    x={t.x}
                    y={t.y}
                    width="77.5"
                    height="77.5"
                    rx="6"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.86"
                    strokeWidth="1"
                    style={{ opacity: 0 }}
                  />
                  {/* the running light: a fixed-length blue segment whose
                      trailing part is translucent so it melts into the
                      white outline behind it. Dash offsets fall (0 -> -100)
                      so the pattern travels CLOCKWISE; pathLength
                      normalizes the perimeter to 100 despite the corners.
                      The solid head covers the front 12 of the 22 units. */}
                  <rect
                    data-tile-tail
                    x={t.x}
                    y={t.y}
                    width="77.5"
                    height="77.5"
                    rx="6"
                    fill="none"
                    stroke="#6485E7"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    pathLength="100"
                    strokeDasharray="22 78"
                    strokeDashoffset="0"
                    style={{ opacity: 0 }}
                  />
                  <rect
                    data-tile-head
                    x={t.x}
                    y={t.y}
                    width="77.5"
                    height="77.5"
                    rx="6"
                    fill="none"
                    stroke="#6485E7"
                    strokeWidth="1"
                    pathLength="100"
                    strokeDasharray="12 88"
                    strokeDashoffset="-10"
                    style={{ opacity: 0 }}
                  />
                  <text
                    data-tile8-score
                    x={t.x + 38.75}
                    y={t.y + 43.5}
                    textAnchor="middle"
                    fill="#EDEDED"
                    fontSize="14"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    100
                  </text>
                  <text
                    x={t.x + 38.75}
                    y={t.y + 102.5}
                    textAnchor="middle"
                    fill="#EDEDED"
                    fontSize="13"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {t.label}
                  </text>
                </g>
              ))}
            </g>

            {/* frame 5's callouts — same click-to-light structure as frame
                4's, with its own gradient and full-#A1A1A1 descriptions */}
            <g data-env5-callouts style={{ opacity: 0, pointerEvents: "none" }}>
              {ENV5_CALLOUTS.map((c) => {
                const lx = c.anchor === "end" ? c.x2 : c.x1;
                const active = c.face === "lid";
                return (
                  <g key={c.key}>
                    <line
                      x1={c.x1}
                      y1={c.y}
                      x2={c.x2}
                      y2={c.y}
                      stroke="#FFFFFF"
                      strokeOpacity="0.1"
                      strokeWidth="0.9"
                    />
                    <text
                      data-co5-base={c.key}
                      x={lx}
                      y={c.y + 24.5}
                      textAnchor={c.anchor}
                      fill="#4E4E4E"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        opacity: active ? 0 : 1,
                      }}
                    >
                      {c.label}
                    </text>
                    <text
                      data-co5-active={c.key}
                      x={lx}
                      y={c.y + 24.5}
                      textAnchor={c.anchor}
                      fill="url(#infra-as-label)"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        opacity: active ? 1 : 0,
                      }}
                    >
                      {c.label}
                    </text>
                    <text
                      data-co5-desc={c.key}
                      textAnchor={c.anchor}
                      fill="#A1A1A1"
                      fontSize="13"
                      style={{
                        fontFamily: "var(--font-geist-sans)",
                        opacity: active ? 1 : 0,
                      }}
                    >
                      {c.desc.map((lineText, i) => (
                        <tspan key={lineText} x={lx} y={c.y + 49.1 + i * 19.5}>
                          {lineText}
                        </tspan>
                      ))}
                    </text>
                    <rect
                      x={c.x1}
                      y={c.y - 10}
                      width={c.x2 - c.x1}
                      height={44}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onClick={() => swapFace(c.face)}
                    />
                  </g>
                );
              })}
            </g>

            {/* callouts — the middle line doubles as BUILD's in stage 1;
                the other two are full-width clones parked on top of it,
                hidden until they ride out with the split */}
            {CALLOUTS.map((c) => (
              <g key={c.key}>
                <line
                  data-line={c.key}
                  x1="475"
                  y1={340}
                  x2={715}
                  y2={340}
                  stroke="#FFFFFF"
                  strokeOpacity="0.1"
                  strokeWidth="0.9"
                  style={c.key === "mid" ? undefined : { opacity: 0 }}
                />
                <text
                  data-label={c.key}
                  x="715"
                  y={c.y + 24.5}
                  textAnchor="end"
                  fill="#4E4E4E"
                  fontSize="13"
                  style={{ fontFamily: "var(--font-geist-mono)", opacity: 0 }}
                >
                  {c.label}
                </text>
              </g>
            ))}
            <text
              data-build
              x="715"
              y="364.5"
              textAnchor="end"
              fill="#4E4E4E"
              fontSize="13"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              BUILD
            </text>
          </svg>
        </div>
      </div>
      </div>
      </div>
    </section>
  );
}
