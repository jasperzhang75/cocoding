import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";

/* Infrastructure — stage 1 of the isometric story (Figma 17205:89133).
   Static for now: the scroll-scrubbed split into three layers arrives with
   frames 2-3. Everything is read off the Figma nodes:

   - The "diamond" is a 90.64x90.64 rounded square (r6) through the isometric
     matrix [[0.866,-0.866],[0.5,0.5]] — same numbers as the Figma transform.
     The design stacks THREE of them sub-pixel apart (295.3/294.6/295), ready
     to split; we reproduce all three so later stages only move them.
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

/* Top vertex of each face (Figma y), bottom-most drawn first. The top two
   faces sit 0.3-0.7px apart in the design — kept verbatim so this frame is
   byte-faithful; the split animation will pull them apart later. */
const FACES = [
  { y: 295.3, stroke: "#A8A8A8", opacity: 0.5 },
  { y: 294.6, stroke: "#A8A8A8", opacity: 0.5 },
  { y: 295, stroke: "url(#infra-face-stroke)", opacity: 1 },
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
              <linearGradient id="infra-face-stroke" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#8C8C8C" />
                <stop offset="1" stopColor="#6E6E6E" />
              </linearGradient>
            </defs>

            {/* the three coincident layers (group at 90% like the design) */}
            <g opacity="0.9">
              {FACES.map((f) => (
                <g key={f.y} transform={`translate(375.5 ${f.y})`}>
                  <rect
                    width="90.64"
                    height="90.64"
                    rx="6"
                    transform="matrix(0.866 0.5 -0.866 0.5 0 0)"
                    fill="#000"
                    stroke={f.stroke}
                    strokeOpacity={f.opacity}
                    strokeWidth="0.9"
                    strokeDasharray="1.8 1.8"
                  />
                </g>
              ))}
            </g>

            {/* BUILD callout */}
            <line
              x1="475"
              y1="340"
              x2="715"
              y2="340"
              stroke="#FFFFFF"
              strokeOpacity="0.1"
              strokeWidth="0.9"
            />
            <text
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
