import Image from "next/image";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import AgentsDiagram from "./AgentsDiagram";
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
  descWidth,
  left = 36,
}: {
  title: string;
  desc: string;
  descWidth: number;
  left?: number;
}) {
  return (
    <div
      className="absolute top-[35px] flex flex-col gap-3"
      style={{ left, width: 496 }}
    >
      <p className="text-heading-sm text-text-primary">{title}</p>
      <p className="text-body-md text-text-body" style={{ width: descWidth }}>
        {desc}
      </p>
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
    <div className="relative h-[610px] w-[600px] overflow-hidden rounded-tl-xl bg-black">
      <CardHeader
        left={35}
        title="Go faster with parallel agents"
        desc="Multiple agents run in parallel to handle tasks simultaneously and speed up every build."
        descWidth={332}
      />

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

      {/* inside stroke — overlay ring above the content (Figma strokeAlign INSIDE) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-tl-xl border-l border-r border-t border-white/[0.08]" />
    </div>
  );
}


/* ---------------------------------------------------------------- section */

export default function Features() {
  return (
    <section className="px-10 pt-[71px]">
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
        <h2 className="mt-3 text-display text-text-primary">
          Build faster.
          <br />
          Spend less. Stay in control.
        </h2>

        {/* flush bento: columns and rows touch; each card carries exactly
            the edges and corner radii the design gives it */}
        <div className="mt-[73px] flex justify-center">
          <div className="flex flex-col">
            <AgentsCard />
            <SecurityCard />
          </div>
          <div className="flex flex-col">
            <TokensCard />
            <TerminalCard />
          </div>
        </div>
      </div>
    </section>
  );
}

