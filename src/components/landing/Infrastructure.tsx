"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { HyperText } from "@/components/magicui/hyper-text";

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
const ITEMS: { title: string; desc?: string }[] = [
  {
    title: "Production-ready environment",
    desc: "Run builds in a secure production environment with network isolation, high availability, and automated backup — ready for launch.",
  },
  { title: "Scalability" },
  { title: "Integrations" },
  { title: "Analytics and SEO" },
];

/* Face keyframes, back-to-front like the Figma children order (the front
   face is the highest one, its black fill occluding the two behind). */
const SPREAD_Y = [348.3, 294.6, 240];
const STACK = { x: 372, y: [343.5, 326.1, 302.7], size: 65.8 };

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

      /* TEMP — frame 4 (ENVIRONMENT) static review: park the story at its
         settled end and pose the stack per 17205:87852 — 8px lower, faces
         at 80%, the stage-1-3 wash off. The 3 -> 4 transition will fold
         all of this into the timeline and restore the scroll binding. */
      tl.progress(1);
      gsap.set(faces[0], { y: 351.7, opacity: 0.8 });
      gsap.set(faces[1], { y: 334.3, opacity: 0.8 });
      gsap.set(faces[2], { y: 311, opacity: 0.8 });
      gsap.set(svg.querySelector("[data-wash]"), { opacity: 0 });
      const parkedForReview = true as boolean;
      if (parkedForReview) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.progress(1);
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
      const apply = () => {
        const r = panel.getBoundingClientRect();
        const k = r.height / 679; // render scale of the 751x679 stage
        const vh = window.innerHeight;
        const maxScroll =
          document.documentElement.scrollHeight - vh - window.scrollY;
        const minTop = r.top - Math.max(0, maxScroll); // panel.top at page bottom
        const r0 = vh - 460 * k;
        const r1 = Math.max(vh / 2 - 340 * k, minTop);
        const p = (r0 - r.top) / Math.max(r0 - r1, 1);
        tl.progress(Math.min(1, Math.max(0, p)));
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
      };
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-5 pt-24 md:px-10 xl:px-0 xl:pt-[120px]">
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
              <div key={item.title}>
                {i > 0 && (
                  <div className="mt-[26px] h-px bg-white/[0.06] opacity-70" />
                )}
                <p
                  className={
                    item.desc
                      ? "text-heading-sm text-text-primary"
                      : "mt-[26px] text-heading-sm text-text-primary opacity-20"
                  }
                >
                  {item.title}
                </p>
                {item.desc && (
                  <p className="mt-3 text-body-md text-text-body/60">
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
            <g data-env-back>
              {/* Ellipse 21888 — the ambient, layer-blurred 300; its grain
                  tile is 241.4px (sf 0.1178), two columns cover the box.
                  (21891's sharp radial is dropped — browser compositing
                  turns it into a solid disc; its grain lives at the bottom
                  of the cube group, where the design keeps it.) */}
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

            {/* the halo grain — one layer beneath the cube group, one
                355.3px tile clipped to Ellipse 21891's spot, at 18% */}
            <image
              data-noise
              x="206"
              y="193"
              width="355.3"
              height="355.3"
              preserveAspectRatio="none"
              clipPath="url(#infra-grain-clip)"
              opacity="0.18"
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
            </g>

            {/* frame 4: the cube around the stack, its mark, the legend,
                and the ENVIRONMENT callouts */}
            <g data-env-front>
              {/* lid */}
              <g transform={CUBE.lid}>
                <rect
                  width="85.2"
                  height="85.2"
                  rx="6"
                  fill="url(#infra-lid)"
                  stroke="#6C91F9"
                  strokeOpacity="0.06"
                  strokeWidth="0.9"
                />
              </g>
              {/* side faces: the design stacks two translucent fills, so
                  two rects each — blue below, white on top; no strokes */}
              <g transform={CUBE.left}>
                <rect width="85.3" height="85.1" rx="8" fill="#617FDC" fillOpacity="0.1" />
                <rect width="85.3" height="85.1" rx="8" fill="#FFFFFF" fillOpacity="0.05" />
              </g>
              <g transform={CUBE.right}>
                <rect width="85.3" height="85.1" rx="8" fill="#617CCE" fillOpacity="0.1" />
                <rect width="85.3" height="85.1" rx="8" fill="#FFFFFF" fillOpacity="0.03" />
              </g>
              {/* lucide/server riding the lid */}
              <g
                transform={CUBE.icon}
                fill="none"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16.6667 1.66667H3.33333C2.41286 1.66667 1.66667 2.41286 1.66667 3.33333V6.66667C1.66667 7.58714 2.41286 8.33333 3.33333 8.33333H16.6667C17.5871 8.33333 18.3333 7.58714 18.3333 6.66667V3.33333C18.3333 2.41286 17.5871 1.66667 16.6667 1.66667Z" />
                <path
                  d="M16.6667 11.6667H3.33333C2.41286 11.6667 1.66667 12.4129 1.66667 13.3333V16.6667C1.66667 17.5871 2.41286 18.3333 3.33333 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V13.3333C18.3333 12.4129 17.5871 11.6667 16.6667 11.6667Z"
                  strokeOpacity="0.3"
                />
                <path d="M5 5H5.00833" strokeWidth="0.75" />
                <path d="M5 15H5.00833" strokeOpacity="0.3" strokeWidth="0.75" />
              </g>

              {/* legend */}
              <rect x="36" y="36" width="28" height="28" rx="8" fill="#617CCE" fillOpacity="0.1" />
              <text
                x="76"
                y="53.5"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                ENVIRONMENT
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

              {/* NETWORK ISOLATION — highlighted, with its description */}
              <line x1="483" y1="281" x2="715" y2="281" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.9" />
              <text
                x="715"
                y="305.5"
                textAnchor="end"
                fill="url(#infra-ni-label)"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                NETWORK ISOLATION
              </text>
              <text
                textAnchor="end"
                fill="#A1A1A1"
                fillOpacity="0.6"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                <tspan x="715" y="330.1">Firewall exists between each</tspan>
                <tspan x="715" y="349.6">module to keep it isolated for</tspan>
                <tspan x="715" y="369.1">security</tspan>
              </text>

              {/* AUTOMATED BACKUP (left) and HIGH AVAILABILITY */}
              <line x1="37" y1="359" x2="257" y2="359" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.9" />
              <text
                x="37"
                y="383.5"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                AUTOMATED BACKUP
              </text>
              <line x1="483" y1="426" x2="715" y2="426" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.9" />
              <text
                x="715"
                y="450.5"
                textAnchor="end"
                fill="#4E4E4E"
                fontSize="13"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                HIGH AVAILABILITY
              </text>
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
    </section>
  );
}
