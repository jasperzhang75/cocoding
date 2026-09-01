import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";

/* Infrastructure — the isometric story, currently at stage 3 of 3 (Figma
   17205:87636): the three layers settle into a tight stack under a faint
   blue glow, callouts gone. Static while the frames are being approved one
   by one; the scroll scrub that walks 1 -> 2 -> 3 comes next. Everything
   is read off the Figma nodes:

   - Each "diamond" is a 90.64x90.64 rounded square (r6) through the
     isometric matrix [[0.866,-0.866],[0.5,0.5]] — the Figma transform
     verbatim. Stage 1 stacks all three in one spot (y~295); stage 2 spreads
     them to 240/294.6/348.3, so animating between stages is pure translation.
   - Faces: black fill, stroke = A8A8A8 -> 424242 linear at 50%, dashed
     1.8/1.8 at 0.9. The group composites at 90% via Plus lighter.
   - Panel: 751x679, top corners 10, stroke 0.9 on top/left/right only,
     painted white -> black at 8% (reads as a border fading out downward),
     fill = black under a 2% #3750C8 wash.
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

/* Top vertex of each face (Figma y), back-to-front like the Figma children
   order — the front face is the highest one, its black fill occluding the
   two behind. Stage 3: the layers settle into the tight stack — faces
   shrink from 90.64 to 65.8 (radius and dashes stay put), the column moves
   to x372, the callouts are gone, and the group opacity goes 0.9 -> 1. */
const STACK = { x: 372, size: 65.8 };
const FACES = [{ y: 343.5 }, { y: 326.1 }, { y: 302.7 }];

/* The soft blue wash breathing at the top of the panel in this stage:
   Figma's Vector 24 — a blob at 9% #2D69B7 with a white 26% hairline,
   layer-blurred 60.6 (feGaussianBlur stdDeviation = radius / 2). Its node
   transform flips the path vertically into place. */
const GLOW_PATH =
  "M 108.96 275.17 C -90.13 262.91 29.3 52.8 108.96 47.23 C 174.8 42.62 181.3 164.63 246.79 174.68 C 304.18 183.48 330.26 125.58 387.43 114.63 C 436.34 105.26 514.01 114.63 514.01 114.63 C 514.01 114.63 619 123.82 658.41 68.06 C 672.13 48.65 671.59 29.52 685.6 10.46 C 736.96 -59.39 742.8 242.9 708.11 256.78 C 673.41 270.67 591.84 296 591.84 296 C 591.84 296 308.05 287.42 108.96 275.17 Z";

export default function Infrastructure() {
  return (
    <section className="px-5 pt-24 md:px-10 xl:px-0 xl:pt-[120px]">
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

            {/* the top-of-panel glow sits behind the stack */}
            <g
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

            {/* the three layers — Plus lighter like the Figma group, now at
                full opacity for the settled stack */}
            <g style={{ mixBlendMode: "plus-lighter" }}>
              {FACES.map((f) => (
                <g key={f.y} transform={`translate(${STACK.x} ${f.y})`}>
                  <rect
                    width={STACK.size}
                    height={STACK.size}
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
          </svg>
        </div>
      </div>
    </section>
  );
}
