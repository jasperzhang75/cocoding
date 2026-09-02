"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { HyperText } from "@/components/magicui/hyper-text";
import { ICONS6 } from "./infra-icons";
import { BRAND7 } from "./infra-brand-icons";

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
  { key: "analytics", title: "Analytics and SEO" },
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

/* From stage 3 on, the frames (4 -> 5 -> 6) are timed transitions, one
   per scroll gesture. At xl the page is CAPTURED at the pin position and
   input is consumed as steps (see the effect). Below xl there is no
   capture yet: the frames step off 300px bands of overtravel past stage
   3, entering past ENTER and leaving below BACK — the gap is hysteresis
   so the boundary doesn't flutter. */
const ENTER = 0.35;
const BACK = 0.2;
/* Scroll-driven frame stepping is PARKED while frames 4-8 and their
   in-frame interactions are built out; the inter-frame navigation gets
   a holistic redesign after that. Frames switch by title click only.
   The stages 1-3 scrub is unaffected. */
const SCROLL_NAV = false;

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
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activeFaceRef = useRef("lid");
  const frameRef = useRef(4); // which scene frame the cube is showing
  const flickerRef = useRef<gsap.core.Timeline | null>(null);
  const goToFrameRef = useRef<(target: number) => void>(() => {});

  /* Frame 6 rows: which card holds the light in each, and which tab
     shows. Hover/tap moves the light; the tab switch is in the effect. */
  const litRef = useRef<Record<RowKey, string>>({ buildin: "database", connectors: "notion" });
  const tabRef = useRef<RowKey>("buildin");
  const switchTabRef = useRef<(to: RowKey) => void>(() => {});

  const lightCard = (row: RowKey, key: string) => {
    const svg = svgRef.current;
    if (!svg || litRef.current[row] === key) return;
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
    // the previous holder settles and dims
    tw(card(prev), { y: base(prev) });
    tw(part(prev, "[data-lit]"), { opacity: 0 });
    tw(part(prev, "[data-icon-lit]"), { opacity: 0 });
    tw(part(prev, "[data-icon-dim]"), { opacity: 1 });
    tw(svg.querySelector(`[data-callout="${row}:${prev}"]`), { opacity: 0, duration: D * 0.7 });
    // the new one lights and rises
    tw(card(key), { y: base(key) - raise });
    tw(part(key, "[data-lit]"), { opacity: 1 });
    tw(part(key, "[data-icon-lit]"), { opacity: 1 });
    tw(part(key, "[data-icon-dim]"), { opacity: 0 });
    tw(svg.querySelector(`[data-callout="${row}:${key}"]`), { opacity: 1, delay: D * 0.4 });
  };

  /* Put both rows back to their authored rest (BUILD-IN showing, first
     cards lit) — run while frame 6 is hidden, before each entrance. */
  const resetRows = () => {
    const svg = svgRef.current;
    if (!svg) return;
    (Object.keys(ROWS) as RowKey[]).forEach((row) => {
      const { cards, face, raise } = ROWS[row];
      litRef.current[row] = cards[0].key;
      cards.forEach((c, i) => {
        const el = svg.querySelector(`[data-card="${row}:${c.key}"]`);
        if (!el) return;
        const lit = i === 0;
        gsap.set(el, { x: c.x, y: c.y - (lit ? raise : 0), opacity: 1 });
        gsap.set(el.querySelector("[data-face]"), { attr: { transform: face } });
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
      gsap.set(svg.querySelector(`[data-row="${row}"]`), { opacity: row === "buildin" ? 1 : 0 });
    });
    tabRef.current = "buildin";
    gsap.set(svg.querySelector('[data-tab-text="buildin"]'), { opacity: 1 });
    gsap.set(svg.querySelector('[data-tab-text="connectors"]'), { opacity: 0.2 });
    gsap.set(svg.querySelector('[data-tab-ul="buildin"]'), { opacity: 1 });
    gsap.set(svg.querySelector('[data-tab-ul="connectors"]'), { opacity: 0 });
  };

  /* Mark flicker: whenever a lid mark lights up, its bright and dim rows
     trade places — fast at first, each gap 1.5x the last — before
     settling. Serves both lid marks: frame 4's server and frame 5's
     arrow. Skipped under reduced motion. */
  const flickerMark = (five = false) => {
    const svg = svgRef.current;
    if (!svg) return;
    const a = svg.querySelector(five ? "[data-mark5-a]" : "[data-mark-a]");
    const b = svg.querySelector(five ? "[data-mark5-b]" : "[data-mark-b]");
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
    // the light crosses the cube; the lid's mark exists only while the
    // lid holds it (frame 4's server flickers awake, frame 5's arrow not)
    fade(`[data-face-lit="${prevFace}"]`, 0, 0.35);
    fade(`[data-face-lit="${face}"]`, 1, 0.35);
    const mark = frame === 5 ? "[data-mark5]" : "[data-cube-mark]";
    fade(mark, face === "lid" ? 1 : 0, 0.3);
    if (face === "lid") flickerMark(frame === 5);
    else flickerRef.current?.kill();
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
    const panel = panelRef.current;
    const svg = svgRef.current;
    if (!section || !panel || !svg) return;

    // the code-drawn grain (see makeNoiseTexture) feeds every noise slot
    const noiseUrl = makeNoiseTexture();
    svg.querySelectorAll<SVGImageElement>("[data-noise]").forEach((im) => {
      im.setAttribute("href", noiseUrl);
    });

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

      /* The 3 -> 4 entrance — a timed sequence (~1.4s), fired once by the
         runway trigger rather than scrubbed: the wash dissolves, the
         legend surfaces, the cube's other faces materialize while the
         stack eases into its frame-4 pose, and the ambient glow blooms
         from its center outward. Callouts trail in last. Reversing plays
         the same sequence backwards. */
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
      // clicks arm only once the entrance lands; reversing re-disarms them
      tl2.set([env.callouts, env.cube], { pointerEvents: "auto" }, 1.38);
      // the mark's first light-up flickers too (not when reversing out)
      tl2.call(
        () => {
          if (!tl2.reversed()) flickerMark();
        },
        [],
        0.7
      );

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
        const envDesc = section.querySelector<HTMLElement>('[data-item-desc="env"]')!;
        const scalDesc = section.querySelector<HTMLElement>('[data-item-desc="scalability"]')!;
        // measure the closed description at today's width
        gsap.set(scalDesc, { display: "block", height: "auto", opacity: 0 });
        const scalH = scalDesc.offsetHeight;
        gsap.set(scalDesc, { height: 0, marginTop: 0 });
        const OPEN = { duration: 0.9, ease: "power2.inOut" } as const;
        const t = gsap.timeline({ paused: true });
        // frame-4 furniture out
        t.to(sq("[data-env-callouts]"), { opacity: 0, duration: 0.3 }, 0);
        t.set(sq("[data-env-callouts]"), { pointerEvents: "none" }, 0.01);
        t.to(sq("[data-legend-env]"), { opacity: 0, duration: 0.3 }, 0.05);
        t.to(sq("[data-cube-mark]"), { opacity: 0, duration: 0.25 }, 0);
        // the cube opens and grows
        t.to(sq('[data-cube-face="lid"]'), { attr: { transform: CUBE5.lid }, ...OPEN }, 0.15);
        t.to(sqa('[data-cube-face="lid"] rect'), { attr: { width: CUBE5.lidSize, height: CUBE5.lidSize }, ...OPEN }, 0.15);
        t.to(sq('[data-cube-face="left"]'), { attr: { transform: CUBE5.left }, ...OPEN }, 0.15);
        t.to(sq('[data-cube-face="right"]'), { attr: { transform: CUBE5.right }, ...OPEN }, 0.15);
        t.to(sqa('[data-cube-face="left"] rect, [data-cube-face="right"] rect'), { attr: { width: CUBE5.sideSize, height: CUBE5.sideSize }, ...OPEN }, 0.15);
        t.to(sq('[data-cube-face="right"] rect:first-child'), { fill: "#617FDC", duration: 0.5 }, 0.3);
        t.to(sq('[data-cube-face="right"] rect:nth-child(2)'), { fillOpacity: 0.05, duration: 0.5 }, 0.3);
        // the stack shrinks a touch and re-seats...
        faces.forEach((f, i) => {
          t.to(f, { x: STACK5.x, y: STACK5.y[i], duration: 0.7, ease: "power2.inOut" }, 0.25);
        });
        t.to(sqa("[data-face] rect"), { attr: { width: STACK5.size, height: STACK5.size }, duration: 0.7, ease: "power2.inOut" }, 0.25);
        t.set(sqa("[data-face] rect"), { attr: { stroke: "#A8A8A8" } }, 0.5);
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
        t.to(sq("[data-legend-infra]"), { opacity: 1, duration: 0.35 }, 0.5);
        t.to(sq("[data-mark5]"), { opacity: 1, duration: 0.3 }, 0.85);
        t.to(sq("[data-env5-callouts]"), { opacity: 1, duration: 0.35 }, 0.95);
        t.set(sq("[data-env5-callouts]"), { pointerEvents: "auto" }, 1.3);
        // left column: environment folds, Scalability expands
        t.to(section.querySelector('[data-item-title="env"]'), { opacity: 0.2, duration: 0.4 }, 0.1);
        t.to(envDesc, { height: 0, opacity: 0, marginTop: 0, duration: 0.45, ease: "power2.inOut" }, 0.1);
        t.set(envDesc, { display: "none" }, 0.56);
        t.to(section.querySelector('[data-item-title="scalability"]'), { opacity: 1, duration: 0.4 }, 0.45);
        t.fromTo(
          scalDesc,
          { height: 0, opacity: 0, marginTop: 0 },
          { height: scalH, opacity: 1, marginTop: 12, duration: 0.5, ease: "power2.inOut" },
          0.5
        );
        // the arrow flickers awake as it lights (not when reversing out)
        t.call(
          () => {
            if (!t.reversed()) flickerMark(true);
          },
          [],
          1.0
        );
        // returning to frame 4 re-lights the server mark
        t.eventCallback("onReverseComplete", () => flickerMark());
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
      const appendItemSwap = (
        t: gsap.core.Timeline,
        foldKey: string,
        openKey: string
      ) => {
        const fold = section.querySelector<HTMLElement>(`[data-item-desc="${foldKey}"]`)!;
        const open = section.querySelector<HTMLElement>(`[data-item-desc="${openKey}"]`)!;
        gsap.set(open, { display: "block", height: "auto", opacity: 0 });
        const openH = open.offsetHeight;
        gsap.set(open, { height: 0, marginTop: 0 });
        t.to(section.querySelector(`[data-item-title="${foldKey}"]`), { opacity: 0.2, duration: 0.4 }, 0.1);
        t.to(fold, { height: 0, opacity: 0, marginTop: 0, duration: 0.45, ease: "power2.inOut" }, 0.1);
        t.set(fold, { display: "none" }, 0.56);
        t.to(section.querySelector(`[data-item-title="${openKey}"]`), { opacity: 1, duration: 0.4 }, 0.45);
        t.fromTo(
          open,
          { height: 0, opacity: 0, marginTop: 0 },
          { height: openH, opacity: 1, marginTop: 12, duration: 0.5, ease: "power2.inOut" },
          0.5
        );
      };
      /* What each origin frame shows — faded out on the way into 6 and
         faded back in on the way out. */
      const originParts = (origin: 4 | 5) => {
        const sq = (sel: string) => svg.querySelector(sel);
        const callouts = sq(origin === 5 ? "[data-env5-callouts]" : "[data-env-callouts]");
        return {
          groups: [callouts, sq("[data-env-legend]"), sq("[data-env-cube]")],
          faces: svg.querySelectorAll(origin === 5 ? "[data-face], [data-face-x]" : "[data-face]"),
          clickable: [callouts, sq("[data-env-cube]")],
        };
      };
      const enterTl: Partial<Record<4 | 5, gsap.core.Timeline>> = {};
      const ensureEnter = (origin: 4 | 5) => {
        const have = enterTl[origin];
        if (have) return have;
        const p = originParts(origin);
        const t = gsap.timeline({ paused: true });
        t.to(p.groups, { opacity: 0, duration: 0.3 }, 0);
        t.to(p.faces, { opacity: 0, duration: 0.3 }, 0.05);
        t.set(p.clickable, { pointerEvents: "none" }, 0.01);
        appendEntrance6(t);
        appendItemSwap(t, origin === 5 ? "scalability" : "env", "integrations");
        enterTl[origin] = t;
        return t;
      };
      const leaveTl: Partial<Record<4 | 5, gsap.core.Timeline>> = {};
      const ensureLeave = (origin: 4 | 5) => {
        const have = leaveTl[origin];
        if (have) return have;
        const p = originParts(origin);
        const t = gsap.timeline({ paused: true });
        t.to(svg.querySelector("[data-frame6]"), { opacity: 0, duration: 0.3 }, 0);
        t.to(p.groups, { opacity: 1, duration: 0.35 }, 0.3);
        t.to(p.faces, { opacity: 0.8, duration: 0.35 }, 0.3);
        t.set(p.clickable, { pointerEvents: "auto" }, 0.65);
        appendItemSwap(t, "integrations", origin === 5 ? "scalability" : "env");
        // the origin's lid mark flickers awake; a queued next step (going
        // further than the origin) runs after
        t.eventCallback("onComplete", () => {
          flickerMark(origin === 5);
          const f = afterLeaveSix;
          afterLeaveSix = null;
          f?.();
        });
        leaveTl[origin] = t;
        return t;
      };

      const normalizeToLid = () => {
        if (activeFaceRef.current !== "lid") {
          gsap.to(svg.querySelector('[data-face-lit="lid"]'), { opacity: 1, duration: 0.3, overwrite: "auto" });
          gsap.to(svg.querySelectorAll('[data-face-lit="left"], [data-face-lit="right"]'), { opacity: 0, duration: 0.3, overwrite: "auto" });
          activeFaceRef.current = "lid";
        }
      };

      /* One-shot chain hooks. */
      let afterTl3Complete: (() => void) | null = null;
      let afterLeaveSix: (() => void) | null = null;
      let enteredSixVia: 4 | 5 = 5; // the frame 6 was entered from

      // one-way timelines replay from the top with fresh start values
      const run = (t: gsap.core.Timeline) => {
        if (reduced) t.progress(1);
        else t.invalidate().restart();
      };

      const stepTo5 = () => {
        frameRef.current = 5;
        flickerRef.current?.kill();
        normalizeToLid();
        gsap.delayedCall(0.35, () => resetCallouts(4));
        const t = ensureTl3();
        t.eventCallback("onComplete", () => {
          const f = afterTl3Complete;
          afterTl3Complete = null;
          f?.();
        });
        if (reduced) {
          t.progress(1);
          const f = afterTl3Complete;
          afterTl3Complete = null;
          f?.();
        } else t.play();
      };
      const stepBack4 = () => {
        frameRef.current = 4;
        flickerRef.current?.kill();
        normalizeToLid();
        gsap.delayedCall(0.35, () => resetCallouts(5));
        const t = ensureTl3();
        if (reduced) t.progress(0);
        else t.reverse();
      };
      const stepTo6 = (from: 4 | 5) => {
        frameRef.current = 6;
        enteredSixVia = from;
        flickerRef.current?.kill();
        normalizeToLid();
        gsap.delayedCall(0.35, () => resetCallouts(from));
        resetRows(); // frame 6 is hidden here; rows go back to rest unseen
        run(ensureEnter(from));
      };

      /* BUILD-IN <-> CONNECTORS: the showing row folds back into its lit
         card like an accordion closing, that card flips on its vertical
         axis (left face -> right face, or back) while sliding toward the
         other row's first-card spot, the rows trade places at the
         edge-on midpoint where the card has no width, and the other row
         springs open on the rubber-band ease. Built fresh each time so it
         starts from whatever the rows currently show. */
      let tabBusy = false;
      switchTabRef.current = (to: RowKey) => {
        const from = tabRef.current;
        if (to === from || tabBusy || frameRef.current !== 6) return;
        tabRef.current = to;
        const sq = (sel: string) => svg.querySelector(sel);
        const F = ROWS[from];
        const T = ROWS[to];
        const fromLit = F.cards.find((c) => c.key === litRef.current[from])!;
        const toLit = T.cards.find((c) => c.key === litRef.current[to])!;
        const fromLitEl = sq(`[data-card="${from}:${fromLit.key}"]`)!;
        const toLitEl = sq(`[data-card="${to}:${toLit.key}"]`)!;
        const spotFrom = { x: fromLit.x, y: fromLit.y - F.raise };
        const spotTo = { x: toLit.x, y: toLit.y - T.raise };
        const mid = { x: (spotFrom.x + spotTo.x) / 2, y: (spotFrom.y + spotTo.y) / 2 };
        tabBusy = true;
        const t = gsap.timeline({
          onComplete: () => {
            tabBusy = false;
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
        t.to(fromLitEl.querySelector("[data-face]"), { attr: { transform: FACE_EDGE }, duration: 0.22, ease: "power1.in" }, flipAt);
        t.to(fromLitEl, { x: mid.x, y: mid.y, duration: 0.22, ease: "power1.in" }, flipAt);
        // rows trade places at zero width
        const swapAt = flipAt + 0.22;
        t.set(sq(`[data-row="${from}"]`), { opacity: 0 }, swapAt);
        t.set(svg.querySelectorAll(`[data-card^="${to}:"]`), { x: mid.x, y: mid.y, opacity: 0 }, swapAt);
        t.set(toLitEl, { opacity: 1 }, swapAt);
        t.set(toLitEl.querySelector("[data-face]"), { attr: { transform: FACE_EDGE } }, swapAt);
        t.set(toLitEl.querySelector("[data-icon]"), { opacity: 0 }, swapAt);
        t.set(sq(`[data-callout="${to}:${toLit.key}"]`), { opacity: 0 }, swapAt);
        t.set(sq(`[data-row="${to}"]`), { opacity: 1 }, swapAt);
        // ...and the new lit card flips open the other way, landing on its spot
        t.to(toLitEl.querySelector("[data-face]"), { attr: { transform: T.face }, duration: 0.22, ease: "power1.out" }, swapAt);
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
        t.set(fromLitEl.querySelector("[data-face]"), { attr: { transform: F.face } }, openAt);
        t.set(fromLitEl, { x: spotFrom.x, y: spotFrom.y }, openAt);
        t.set(fromLitEl.querySelector("[data-icon]"), { opacity: 1 }, openAt);
        others.forEach((c) => {
          t.set(sq(`[data-card="${from}:${c.key}"]`), { x: c.x, y: c.y, opacity: 1 }, openAt);
        });
      };
      const leaveSix = () => {
        // fade 6 out and the origin frame back in
        frameRef.current = enteredSixVia;
        flickerRef.current?.kill();
        const t = ensureLeave(enteredSixVia);
        run(t);
      };

      const anyActive = () =>
        [tl3, enterTl[4], enterTl[5], leaveTl[4], leaveTl[5]].some(
          (t) => t && t.isActive()
        );

      const goTo = (target: number) => {
        const cur = frameRef.current;
        if (target === cur) return;
        if (cur === 4 && tl2.progress() < 1) return; // frame 4 not landed
        if (target > cur) {
          if (cur === 4) {
            if (target === 6) stepTo6(4);
            else stepTo5();
          } else if (cur === 5) {
            if (ensureTl3().isActive()) {
              if (target === 6) afterTl3Complete = () => stepTo6(5);
              return; // mid 4->5: queue and let it land
            }
            stepTo6(5);
          }
        } else {
          if (cur === 6) {
            /* leaving 6 lands on the frame it was entered from; asks that
               go beyond it chain one more step after the fade lands */
            if (target !== enteredSixVia) {
              afterLeaveSix = enteredSixVia === 5 ? () => stepBack4() : () => stepTo5();
            }
            leaveSix();
          } else if (cur === 5) {
            stepBack4();
          }
        }
      };
      /* Title clicks switch frames too; if the page isn't captured yet
         (clicked while approaching), capture first so the frame plays
         centered. */
      let captureNow: () => void = () => {};
      goToFrameRef.current = (target) => {
        if (anyActive()) return;
        captureNow();
        goTo(target);
      };

      if (reduced) {
        tl.progress(1);
        tl2.progress(1);
        return;
      }

      /* Scroll binding, anchored to the DIAMOND CLUSTER's own screen
         position — not the section, whose top runs a full 400px+ ahead of
         the artwork (anchoring there played the whole split below the
         fold, so all you ever saw was the tail of the shrink). Fixed
         design coordinates, no feedback from the animation itself.

         p = 0  when the cluster's full excursion range (y240-439, the
                split's outermost vertices) has cleared the viewport bottom
                — the resting diamond rides in as plain scroll before that,
                and every phase after it plays entirely on screen.
         p = 1  when the cluster's center line (y340) reaches half-viewport
                — just before the section is dead center, per the spec —
                OR at the deepest scroll the page allows today, whichever
                comes first. The section is currently the page's last block
                so its center can't reach mid-viewport yet; the clamp makes
                the full story reachable now and retires itself as later
                sections add scroll room below.
         Direct progress writes — no smoothing. */
      const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
      let entered = false; // frame 4 has been entered (tl2 played)

      /* ONE STEP PER GESTURE. A gesture is a burst of input events; 250ms
         of silence ends it. The first step a gesture causes locks it —
         however hard the fling, one step. The next gesture takes the next. */
      let gestureUsed = false;
      let gestureTimer = 0;
      const touchGesture = () => {
        window.clearTimeout(gestureTimer);
        gestureTimer = window.setTimeout(() => {
          gestureUsed = false;
        }, 250);
      };
      const fire = (fn: () => void) => {
        if (gestureUsed) return;
        gestureUsed = true;
        fn();
      };

      /* SCROLL CAPTURE. Once the section reaches its pin position (stage 3
         complete, cluster centered) the page stops scrolling: wheel,
         touch and keys are intercepted and consumed as STEPS through the
         frames — 3 -> 4 -> 5 -> 6 and back — one per gesture. Only at the
         ends does a gesture release the page again: forward past the last
         frame, or backward past stage 3. Crossing the pin position again
         later (from either side) recaptures — the sequence is walked
         every time. Desktop pointers at xl only; reduced motion never
         captures. */
      const capturable = () =>
        window.matchMedia("(min-width: 1280px) and (hover: hover)").matches;
      let captured = false;
      let prevTop: number | null = null; // panel.top last seen, for crossing
      let awayFromPin = true; // must leave the pin before recapturing
      const STEP_THRESH = 120; // wheel delta that makes a step
      let acc = 0;

      /* the panel top's target: stage 3 completes when panel.top == r1 */
      const pinTarget = () => {
        const r = panel.getBoundingClientRect();
        const k = r.height / 679;
        const vh = window.innerHeight;
        const maxScroll =
          document.documentElement.scrollHeight - vh - window.scrollY;
        const minTop = r.top - Math.max(0, maxScroll); // panel.top at page bottom
        return { r, k, vh, r0: vh - 460 * k, r1: Math.max(vh / 2 - 340 * k, minTop) };
      };

      const atStageThree = () => !entered && !tl2.isActive();

      /* one step in a direction; +1 forward (down), -1 backward (up).
         Returns true if the page should be RELEASED instead. */
      const step = (dir: 1 | -1): boolean => {
        if (anyActive() || tl2.isActive()) return false;
        const frame = frameRef.current;
        if (dir > 0) {
          if (atStageThree()) {
            entered = true;
            tl2.play();
          } else if (frame === 4) goTo(5);
          else if (frame === 5) goTo(6);
          else return true; // past the last frame: release downward
        } else {
          if (atStageThree()) return true; // before frame 4: release upward
          if (frame === 6) goTo(enteredSixVia);
          else if (frame === 5) goTo(4);
          else if (frame === 4) {
            entered = false;
            tl2.reverse();
          }
        }
        return false;
      };

      const onWheel = (e: WheelEvent) => {
        if (!captured) return;
        e.preventDefault();
        touchGesture();
        const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        acc += delta;
        if (gestureUsed || Math.abs(acc) < STEP_THRESH) return;
        const dir: 1 | -1 = acc > 0 ? 1 : -1;
        acc = 0;
        fire(() => {
          if (step(dir)) release();
        });
      };
      const onKey = (e: KeyboardEvent) => {
        if (!captured) return;
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        let dir: 1 | -1 | 0 = 0;
        if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
        else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
        if (!dir) return;
        e.preventDefault();
        touchGesture();
        const d = dir;
        fire(() => {
          if (step(d)) release();
        });
      };
      const onTouchMove = (e: TouchEvent) => {
        if (captured) e.preventDefault();
      };

      const capture = () => {
        if (captured) return;
        captured = true;
        acc = 0;
        gestureUsed = true; // the gesture that brought us here is spent
        touchGesture();
        // align exactly on the pin, undoing any overshoot of the last event
        const { r, r1 } = pinTarget();
        window.scrollBy({ top: r.top - r1, behavior: "instant" });
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("keydown", onKey);
      };
      const release = () => {
        if (!captured) return;
        captured = false;
        awayFromPin = false;
        prevTop = null;
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("keydown", onKey);
      };
      captureNow = () => {
        if (SCROLL_NAV && capturable() && !reduced) capture();
      };

      const apply = () => {
        const { r, r1, r0 } = pinTarget();
        tl.progress(clamp01((r0 - r.top) / Math.max(r0 - r1, 1)));
        if (!SCROLL_NAV) return; // frame stepping parked (see SCROLL_NAV)
        if (captured) return; // the scrollbar can still move us; ignore

        if (capturable()) {
          /* native scrolling: watch the panel cross the pin position in
             either direction, then capture there */
          if (Math.abs(r.top - r1) > 40) awayFromPin = true;
          if (prevTop !== null && awayFromPin) {
            const crossedDown = prevTop > r1 && r.top <= r1;
            const crossedUp = prevTop < r1 && r.top >= r1;
            if (crossedDown || crossedUp) {
              capture();
              return;
            }
          }
          prevTop = r.top;
          return;
        }

        /* below xl there is no capture yet (responsive pass pending):
           the frames step off 300px bands of overtravel past stage 3,
           one per gesture */
        touchGesture();
        const q = clamp01((r1 - r.top) / 300);
        const q2 = clamp01((r1 - r.top - 300) / 300);
        const q3 = clamp01((r1 - r.top - 600) / 300);
        const frame = frameRef.current;
        if (!entered && q >= ENTER) {
          fire(() => {
            entered = true;
            tl2.play();
          });
        } else if (entered && frame === 4 && q <= BACK && !anyActive()) {
          fire(() => {
            entered = false;
            tl2.reverse();
          });
        } else if (anyActive()) {
          // let the running transition land before judging the next
        } else if (frame === 4 && tl2.progress() === 1 && q2 >= ENTER) {
          fire(() => goTo(5));
        } else if (frame === 5 && q2 <= BACK) {
          fire(() => goTo(4));
        } else if (frame === 5 && q3 >= ENTER) {
          fire(() => goTo(6));
        } else if (frame === 6 && q3 <= BACK) {
          fire(() => goTo(enteredSixVia));
        }
      };

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
      };
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-5 md:px-10 xl:px-0">
      <div className="pt-24 xl:pt-[120px]">
      <div className="relative mx-auto max-w-[600px] md:max-w-none xl:h-[686px] xl:w-[1200px] xl:max-w-none">
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
                    (item.key !== "analytics" ? " cursor-pointer" : "")
                  }
                  onClick={
                    item.key === "env"
                      ? () => goToFrameRef.current(4)
                      : item.key === "scalability"
                        ? () => goToFrameRef.current(5)
                        : item.key === "integrations"
                          ? () => goToFrameRef.current(6)
                          : undefined
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
                  data-face-lit="ni"
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
                  data-face-lit="ab"
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
                  data-face-lit="ha"
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
                style={{ opacity: 0 }}
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
            <g data-frame6 style={{ opacity: 0 }}>
              <g data-f6-tab>
                <rect x="299" y="224.55" width="153" height="0.9" fill="#FFFFFF" fillOpacity="0.3" />
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
                        y="222.65"
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
                  <g key={row} data-row={row} style={{ opacity: row === "buildin" ? 1 : 0 }}>
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
                          <g data-face transform={face}>
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
    </section>
  );
}
