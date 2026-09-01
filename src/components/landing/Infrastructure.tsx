import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";

/* Infrastructure — the isometric story, currently at stage 2 of 3 (Figma
   17205:87420): the stacked block split into its three layers, each called
   out as FRONTEND / BACKEND / DATABASE. Static while the frames are being
   approved one by one; the scroll scrub that walks 1 -> 2 -> 3 lands after
   stage 3. Everything is read off the Figma nodes:

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
   two behind. Stage 2: the stack pulled apart into three layers. All faces
   share one style: black fill, the A8A8A8 -> 424242 linear stroke at 50%. */
const FACES = [{ y: 348.3 }, { y: 294.6 }, { y: 240 }];

/* Right-hand callouts — a hairline from x475 to x715 with a 13px mono label
   hanging under its right end, one per layer, each centered on its face. */
const CALLOUTS = [
  { y: 286, label: "FRONTEND" },
  { y: 340, label: "BACKEND" },
  { y: 394, label: "DATABASE" },
];

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
            </defs>

            {/* the three layers — group renders at 90% through Plus lighter,
                exactly the Figma group's blend settings */}
            <g opacity="0.9" style={{ mixBlendMode: "plus-lighter" }}>
              {FACES.map((f) => (
                <g key={f.y} transform={`translate(375.5 ${f.y})`}>
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

            {CALLOUTS.map((c) => (
              <g key={c.label}>
                <line
                  x1="475"
                  y1={c.y}
                  x2="715"
                  y2={c.y}
                  stroke="#FFFFFF"
                  strokeOpacity="0.1"
                  strokeWidth="0.9"
                />
                <text
                  x="715"
                  y={c.y + 24.5}
                  textAnchor="end"
                  fill="#4E4E4E"
                  fontSize="13"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {c.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
