import Image from "next/image";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import { EYEBROW_SCRAMBLE } from "./eyebrow";
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
     card 1: outer 970x777 @ (-223,-69) on the card (Rectangle 2612,
             570x377 blurred 200 — 414 tall until 2026-10-19); the card's
             1px border is inside the design's frame, so card-level
             positions are the design's minus 1 (the header's 35 is the
             design's 36, the panel's 35/171 its 36/172 — since 2026-10-19;
             it sat at 36/172, a px low and right, before),
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
  leftClass = "xl:left-[36px]",
}: {
  title: string;
  desc: string;
  /** e.g. "xl:w-[332px]" — the design's fixed copy width at xl */
  descWidthClass: string;
  leftClass?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 px-7 pb-6 pt-8 xl:absolute xl:top-[35px] xl:w-[496px] xl:p-0 ${leftClass}`}
    >
      <p className="text-body-md text-text-primary xl:text-heading-sm">{title}</p>
      <p className={`text-balance text-body-sm text-text-body xl:text-wrap xl:text-body-md ${descWidthClass}`}>{desc}</p>
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

/* Revised by Jasper 2026-10-19 (Figma 16555:17598 re-read): the card is
   #0A0A0A with a white 3% edge (was black, 6%); a new wide, faint glow
   (Ellipse 21903: 752x70 at 0/107, #5D7ABE 5%, blur 150) lies under the
   panel's top edge, outside the mask; the big ellipse behind the panel
   (Ellipse 21892) is 604x357 at 13/168 (was 990x394 at 35/130); the
   mask above it is 377 tall (was 414); the panel's edge is #E0E0E0 13%
   (was 17%); the top curve is #3A4780 44% (was #9CAAF1 12%), glow-c
   #3A4780 (was #5C689D); BUILDING is solid #C4C4C4 (was a gradient) and
   cap-trimmed, so its cap top sits at the design's 36; the diagram
   moved 2px right (AgentsDiagram). The animation is untouched.
   Later that day ("尽量减少渐变的重叠"): Ellipse 21892 moved out from
   under the mask — it lies below the mask layer now, so only the panel
   is masked and the ellipse's blur is no longer multiplied by the
   mask's blurred alpha. The panel's top curve (Vector 25,
   f1-curve-top.svg) was hidden for an evening and is back (2026-10-20). */
function AgentsCard() {
  return (
    <div data-agents-card className="order-1 relative w-full max-w-[600px] overflow-hidden rounded-md border border-white/[0.03] bg-[#0a0a0a] md:rounded-none md:rounded-tl-xl md:border-b-0 xl:absolute xl:left-0 xl:top-0 xl:h-[610px] xl:w-[600px] xl:max-w-none">
      <CardHeader
        leftClass="xl:left-[35px]"
        title="Go faster with parallel agents"
        desc="Multiple agents run in parallel to handle tasks simultaneously and speed up every build."
        descWidthClass="xl:w-[332px]"
      />

      <PosterViewport designHeight={610} crop={120} className="xl:absolute xl:inset-0">
      {/* Ellipse 21903: the faint band under the panel's top edge — below
          the mask in the design, so unmasked; -1 for the card's border */}
      <Bleed
        src="/features/f1-glow-top.svg"
        inset="-214.29% -19.95%"
        className="absolute left-[-1px] top-[106px] h-[70px] w-[752px]"
      />
      {/* Ellipse 21892: #0C1B2A blurred 300, the dark blue behind the
          panel — unmasked since 2026-10-19 */}
      <Bleed
        src="/features/f1-glow-wide.svg"
        inset="-84.03% -49.67%"
        className="absolute left-[12px] top-[167px] h-[357px] w-[604px]"
      />
      <div
        className="absolute inset-0"
        style={mask("/features/f1-mask-outer.svg", "970px 777px", "-224px -70px")}
      >
        <div
          className="absolute left-[35px] top-[171px] h-[444px] w-[563px] overflow-hidden rounded-tl-lg"
          style={{
            borderLeft: "0.9px solid rgba(224,224,224,0.13)",
            borderTop: "0.9px solid rgba(224,224,224,0.13)",
            background:
              "linear-gradient(90deg, rgba(46,46,46,0.27), rgba(46,46,46,0.27)), linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(90deg, #030303, #030303)",
          }}
        >
          {/* wide top curve (Vector 25: #3A4780 44%, blurred 100) */}
          <Bleed
            src="/features/f1-curve-top.svg"
            inset="-103.6% -16.95%"
            className="absolute left-[-14.9px] top-[-36.9px] h-[96.5px] w-[590px] -scale-y-100"
          />

          {/* BUILDING header — the mark slowly cycles the Figma gradient
              (#FFFFFF / #ACACAC 25% / #595959) back and forth, "running".
              The design's row (Frame 2609249) is 9.43 tall: the label is
              cap-trimmed (text-box-trim), its cap top on the row's top at
              36, the mark as tall as the caps. The row is fixed to that
              height so browsers without text-box-trim still center the
              line box on it, a px or two off at most. */}
          <div className="absolute left-[35px] top-[35px] flex h-[9.43px] items-center gap-2 mix-blend-plus-lighter">
            <div
              aria-hidden
              data-loop
              className="building-mark h-[9.43px] w-[16.56px]"
              style={{
                maskImage: "url(/features/f1-logo-mark.svg)",
                maskSize: "100% 100%",
                WebkitMaskImage: "url(/features/f1-logo-mark.svg)",
                WebkitMaskSize: "100% 100%",
              }}
            />
            <p className="font-mono text-[13px] uppercase leading-[1.375] text-[#C4C4C4] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
              Building
            </p>
          </div>

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
    <section id="features" className="px-5 pt-[71px] md:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Magic UI HyperText: scrambles 400ms after first scroll into view,
            one-shot (hover re-scramble off). */}
        <HyperText
          as="p"
          {...EYEBROW_SCRAMBLE}
          className="font-mono text-indicator-lg uppercase text-accent"
        >
          Features
        </HyperText>
        <h2 className="mt-3 text-heading-lg text-text-primary xl:text-display">
          Build faster.
          <br />
          Spend less. Stay in control.
        </h2>

        {/* flush bento: columns and rows touch; each card carries exactly
            the edges and corner radii the design gives it */}
        {/* three tiers. base: single stack, narrative order via order-N
            (the column wrappers dissolve to display:contents). md: the
            DESKTOP pairing — two flush columns (1+4 | 2+3), no gap, desktop
            corner scheme, only the posters scale. xl: the absolute bento
            canvas (wrappers dissolve again). */}
        <div className="mt-12 flex flex-col items-center gap-6 md:mt-[73px] md:flex-row md:items-stretch md:justify-center md:gap-0 xl:relative xl:mx-auto xl:block xl:h-[1074px] xl:w-[1200px]">
          <div className="contents md:flex md:w-1/2 md:max-w-[600px] md:flex-col xl:contents">
            <AgentsCard />
            <SecurityCard />
          </div>
          <div className="contents md:flex md:w-1/2 md:max-w-[600px] md:flex-col xl:contents">
            <TokensCard />
            <TerminalCard />
          </div>
        </div>
      </div>
    </section>
  );
}

