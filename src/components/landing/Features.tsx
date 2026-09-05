import Image from "next/image";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import AgentsDiagram from "./AgentsDiagram";
import PosterViewport from "./PosterViewport";
import TokensCard from "./TokensCard";
import TerminalCard from "./TerminalCard";
import SecurityCard from "./SecurityCard";

/* Features bento — Figma node 16555:17150, desktop (1280) only for now.
   Card 1 (parallel agents) only — the other three come one at a time.
   Static: no motion yet, to be added case by case with Jasper.

   All values audited on the nodes via the Plugin API (the CSS export
   flattened several: Agent 1/3/4 strokes are a #4C8BE9->#676767 gradient at
   70%, not solid blue; the tooltip stroke is white->#646464 at 9%, not
   white). Hidden layers in Figma (old hero, old card variants, chips'
   disabled fills, five of seven tooltip shadows) are intentionally omitted.

   The export also stamps parent masks onto every child; each diagram here
   applies its two masks ONCE, on shared containers, at origins recovered
   from the per-child offsets (they all agree):
     card 1: outer 970x814 @ (-223,-69) on the card,
             inner 686x489 @ (-49,4) on the panel
     card 3: outer 980x811 @ (-233,-61), inner 669x425 @ (-66,-35)
     card 4: the lucide/shield alpha mask clips both glows.
   The security toggle is NOT shield-masked even though the export says so —
   those mask coordinates would place it fully outside the mask (y<0) and
   hide it, which contradicts the design render. */

const mask = (
  url: string,
  size: string,
  position: string
): CSSProperties => ({
  maskImage: `url(${url})`,
  maskSize: size,
  maskPosition: position,
  maskRepeat: "no-repeat",
  WebkitMaskImage: `url(${url})`,
  WebkitMaskSize: size,
  WebkitMaskPosition: position,
  WebkitMaskRepeat: "no-repeat",
});

/* 0.9px gradient-stroke ring (padding+mask trick — real borders snap to
   0.5px device pixels; fractional paddings render faithfully). */
const ring = (gradient: string): CSSProperties => ({
  padding: "0.9px",
  background: gradient,
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
});

function CardHeader({
  title,
  desc,
  descWidthClass,
  leftClass = "lg:left-[36px]",
  /** the copy's right edge: 600 - left - 496 at the design width */
  rightClass = "lg:right-[68px]",
}: {
  title: string;
  desc: string;
  /** e.g. "lg:w-[332px]" — the design's fixed copy width at lg */
  descWidthClass: string;
  leftClass?: string;
  rightClass?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 px-7 pb-6 pt-8 lg:absolute lg:top-[35px] lg:p-0 ${leftClass} ${rightClass}`}
    >
      <p className="text-body-md text-text-primary lg:text-heading-sm">{title}</p>
      <p className={`text-balance text-body-sm text-text-body lg:max-w-full lg:text-wrap lg:text-body-md ${descWidthClass}`}>{desc}</p>
    </div>
  );
}

/* A decorative SVG that bleeds beyond its box (Figma blur padding). */
function Bleed({
  src,
  inset,
  className,
  style,
}: {
  src: string;
  inset: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      <div className="absolute" style={{ inset }}>
        <Image src={src} alt="" fill className="max-w-none" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- card 1 */

function AgentsCard() {
  return (
    <div data-agents-card className="order-1 relative w-full max-w-[600px] overflow-hidden rounded-md border border-white/[0.08] bg-black md:rounded-none md:rounded-tl-lg md:border-b-0 lg:absolute lg:left-0 lg:top-0 lg:h-[610px] lg:w-1/2 lg:max-w-none">
      <CardHeader
        leftClass="lg:left-[35px]"
        rightClass="lg:right-[69px]"
        title="Go faster with parallel agents"
        desc="Multiple agents run in parallel to handle tasks simultaneously and speed up every build."
        descWidthClass="lg:w-[332px]"
      />

      <PosterViewport designHeight={610} crop={120} className="lg:absolute lg:inset-0">
      <div
        className="absolute inset-0"
        style={mask("/features/f1-mask-outer.svg", "970px 814px", "-223px -69px")}
      >
        <Bleed
          src="/features/f1-glow-wide.svg"
          inset="-76.14% -30.3%"
          className="absolute left-[35px] top-[130px] h-[394px] w-[990px]"
        />

        <div
          className="absolute left-[36px] top-[172px] h-[444px] w-[563px] overflow-hidden rounded-tl-lg"
          style={{
            borderLeft: "0.9px solid rgba(224,224,224,0.17)",
            borderTop: "0.9px solid rgba(224,224,224,0.17)",
            background:
              "linear-gradient(90deg, rgba(46,46,46,0.27), rgba(46,46,46,0.27)), linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(90deg, #030303, #030303)",
          }}
        >
          {/* BUILDING header — the mark slowly cycles the Figma gradient
              (#FFFFFF / #ACACAC 25% / #595959) back and forth, "running" */}
          <div className="absolute left-[35px] top-[35px] flex items-center gap-2 mix-blend-plus-lighter">
            <div
              aria-hidden
              data-loop
              className="building-mark h-[9px] w-[17px]"
              style={{
                maskImage: "url(/features/f1-logo-mark.svg)",
                maskSize: "100% 100%",
                WebkitMaskImage: "url(/features/f1-logo-mark.svg)",
                WebkitMaskSize: "100% 100%",
              }}
            />
            <p
              className="bg-clip-text font-mono text-[13px] uppercase leading-[1.375] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(179.6deg, rgba(196,196,196,0.73) 37.75%, rgba(153,153,153,0.73) 170.01%)",
              }}
            >
              Building
            </p>
          </div>

          {/* wide top curve */}
          <Bleed
            src="/features/f1-curve-top.svg"
            inset="-103.6% -16.95%"
            className="absolute left-[-14.9px] top-[-36.9px] h-[96.5px] w-[590px] -scale-y-100"
          />

          {/* ambient glows */}
          <Bleed src="/features/f1-glow-a.svg" inset="-200%" className="absolute left-[221px] top-[53px] size-[100px]" />
          <Bleed src="/features/f1-glow-b.svg" inset="-235.29% -196.08%" className="absolute left-[313px] top-[267px] h-[85px] w-[102px]" />
          <Bleed src="/features/f1-glow-c.svg" inset="-322.58% -180.18%" className="absolute left-[404px] top-[4px] h-[62px] w-[111px]" />

          {/* diagram + its scroll-in flow animation (client component) */}
          <AgentsDiagram />
        </div>
      </div>
      </PosterViewport>
    </div>
  );
}


/* ---------------------------------------------------------------- section */

export default function Features() {
  return (
    <section className="px-5 pt-[71px] md:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Magic UI HyperText: scrambles 400ms after first scroll into view,
            one-shot (hover re-scramble off). */}
        <HyperText
          as="p"
          startOnView
          delay={400}
          duration={800}
          animateOnHover={false}
          className="font-mono text-indicator uppercase text-accent"
        >
          Features
        </HyperText>
        <h2 className="mt-3 text-heading-lg text-text-primary lg:text-display">
          Build faster.
          <br />
          Spend less. Stay in control.
        </h2>

        {/* flush bento: columns and rows touch; each card carries exactly
            the edges and corner radii the design gives it */}
        {/* three tiers. base: single stack, narrative order via order-N
            (the column wrappers dissolve to display:contents). md: the
            DESKTOP pairing — two flush columns (1+4 | 2+3), no gap, desktop
            corner scheme, only the posters scale. lg: the absolute bento
            canvas (wrappers dissolve again). */}
        {/* lg: the absolute bento canvas. Its width follows the viewport up
            to the 1200px design (1024 -> 944px); card widths and lefts are
            halves, heights stay the design's, the copy keeps its size and
            only each card's poster scales (see PosterViewport). */}
        <div className="mt-12 flex flex-col items-center gap-6 md:mt-[73px] md:flex-row md:items-stretch md:justify-center md:gap-0 lg:relative lg:mx-auto lg:block lg:h-[1074px] lg:w-full lg:max-w-[1200px]">
          <div className="contents md:flex md:w-1/2 md:max-w-[600px] md:flex-col lg:contents">
            <AgentsCard />
            <SecurityCard />
          </div>
          <div className="contents md:flex md:w-1/2 md:max-w-[600px] md:flex-col lg:contents">
            <TokensCard />
            <TerminalCard />
          </div>
        </div>
      </div>
    </section>
  );
}

