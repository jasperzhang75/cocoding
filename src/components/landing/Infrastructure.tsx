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
     settles them at x372, y302.7/326.1/343.5 with a faint blue glow.
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

/* Figma's Vector 24 — the stage-3 wash at the top of the panel: a blob at
   9% #2D69B7 with a white 26% hairline, layer-blurred 60.6 (feGaussianBlur
   stdDeviation = radius / 2), flipped into place by its node transform. */
const GLOW_PATH =
  "M 108.96 275.17 C -90.13 262.91 29.3 52.8 108.96 47.23 C 174.8 42.62 181.3 164.63 246.79 174.68 C 304.18 183.48 330.26 125.58 387.43 114.63 C 436.34 105.26 514.01 114.63 514.01 114.63 C 514.01 114.63 619 123.82 658.41 68.06 C 672.13 48.65 671.59 29.52 685.6 10.46 C 736.96 -59.39 742.8 242.9 708.11 256.78 C 673.41 270.67 591.84 296 591.84 296 C 591.84 296 308.05 287.42 108.96 275.17 Z";

export default function Infrastructure() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const ctx = gsap.context(() => {
      const faces = Array.from(
        svg.querySelectorAll<SVGGElement>("[data-face]")
      );
      const rects = faces.map((f) => f.querySelector("rect")!);
      const cube = svg.querySelector("[data-cube]");
      const glow = svg.querySelector("[data-glow]");
      const build = svg.querySelector("[data-build]");
      const line = (k: string) => svg.querySelector(`[data-line="${k}"]`);
      const label = (k: string) => svg.querySelector(`[data-label="${k}"]`);

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      /* 0.00-0.10 rests at stage 1 so it registers while entering. */

      // stage 1 -> 2: the block splits into layers, callouts fan out
      tl.to(build, { opacity: 0, duration: 0.1, ease: "power1.out" }, 0.1);
      tl.to(faces[2], { y: SPREAD_Y[2], duration: 0.33, ease: "power2.inOut" }, 0.12);
      tl.to(faces[0], { y: SPREAD_Y[0], duration: 0.33, ease: "power2.inOut" }, 0.12);
      tl.to(line("top"), { attr: { x2: 715 }, duration: 0.16, ease: "power2.out" }, 0.28);
      tl.to(line("bot"), { attr: { x2: 715 }, duration: 0.16, ease: "power2.out" }, 0.32);
      tl.to(label("top"), { opacity: 1, duration: 0.12 }, 0.34);
      tl.to(label("mid"), { opacity: 1, duration: 0.12 }, 0.38);
      tl.to(label("bot"), { opacity: 1, duration: 0.12 }, 0.42);

      /* 0.52-0.60 rests at stage 2. */

      // stage 2 -> 3: callouts fall away, the layers settle into the stack
      tl.to(
        [line("top"), line("mid"), line("bot"), label("top"), label("mid"), label("bot")],
        { opacity: 0, duration: 0.12 },
        0.6
      );
      faces.forEach((f, i) => {
        tl.to(f, { x: STACK.x, y: STACK.y[i], duration: 0.32, ease: "power2.inOut" }, 0.64);
      });
      tl.to(rects, { attr: { width: STACK.size, height: STACK.size }, duration: 0.32, ease: "power2.inOut" }, 0.64);
      tl.to(cube, { opacity: 1, duration: 0.32 }, 0.64);
      tl.to(glow, { opacity: 1, duration: 0.16, ease: "power1.in" }, 0.84);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.progress(1);
        return;
      }

      /* Scroll binding: p runs 0 (section top at the viewport bottom) to 1
         (section centered), scaled 1.1 so stage 3 has ALREADY settled just
         before dead center. Direct progress writes — no smoothing. */
      const apply = () => {
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const raw = (vh - r.top) / ((vh + r.height) / 2);
        tl.progress(Math.min(1, Math.max(0, raw * 1.1)));
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
            </defs>

            {/* stage-3 glow, revealed as the stack settles */}
            <g
              data-glow
              style={{ opacity: 0 }}
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

            {/* callouts — the middle line doubles as BUILD's in stage 1;
                the other two draw out during the split */}
            {CALLOUTS.map((c) => (
              <g key={c.key}>
                <line
                  data-line={c.key}
                  x1="475"
                  y1={c.y}
                  x2={c.key === "mid" ? 715 : 475}
                  y2={c.y}
                  stroke="#FFFFFF"
                  strokeOpacity="0.1"
                  strokeWidth="0.9"
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
