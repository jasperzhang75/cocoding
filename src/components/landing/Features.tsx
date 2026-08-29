import Image from "next/image";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import TodayDate from "./TodayDate";
import DashboardChart from "./DashboardChart";

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

const CHIP =
  "absolute flex h-8 items-center justify-center rounded-sm text-label-sm text-text-primary";
const AGENT_STROKE =
  "linear-gradient(180deg, rgba(76,139,233,0.7) 0%, rgba(103,103,103,0.7) 100%)";

function PlainChip({ label, x, y, w, border }: { label: string; x: number; y: number; w?: number; border: string }) {
  return (
    <div className={CHIP} style={{ left: x, top: y, width: w, border: `0.9px solid ${border}`, padding: w ? undefined : "6px 12px" }}>
      {label}
    </div>
  );
}

function AgentChip({ label, x, active }: { label: string; x: number; active?: boolean }) {
  return (
    <div
      className={`${CHIP} w-[71px]`}
      style={
        active
          ? {
              left: x,
              top: 299,
              border: "0.9px solid rgba(76,139,233,0.7)",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06)), linear-gradient(90deg, rgba(67,117,237,0.22), rgba(67,117,237,0.22))",
            }
          : { left: x, top: 299 }
      }
    >
      {!active && (
        <div aria-hidden className="absolute inset-0 rounded-sm" style={ring(AGENT_STROKE)} />
      )}
      {label}
    </div>
  );
}

function AgentsCard() {
  return (
    <div className="relative h-[610px] w-[600px] overflow-hidden rounded-tl-xl border-l border-r border-t border-white/[0.08] bg-black">
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
            borderLeft: "0.9px solid rgba(224,224,224,0.13)",
            borderTop: "0.9px solid rgba(224,224,224,0.13)",
            background:
              "linear-gradient(90deg, rgba(46,46,46,0.27), rgba(46,46,46,0.27)), linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(90deg, #030303, #030303)",
          }}
        >
          {/* BUILDING header */}
          <div className="absolute left-[35px] top-[35px] flex items-center gap-2 mix-blend-plus-lighter">
            <Image src="/features/f1-logo-mark.svg" alt="" width={17} height={9} />
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

          {/* diagram, inner-masked once as a group */}
          <div
            className="absolute inset-0 opacity-80 mix-blend-plus-lighter"
            style={mask("/features/f1-mask-inner.svg", "686px 489px", "-49px 4px")}
          >
            <PlainChip label="Prompt" x={235} y={102} border="#313131" />
            <PlainChip label="Design" x={76} y={206} w={71} border="#2A2A2A" />
            <PlainChip label="Plan" x={180} y={206} w={71} border="#2A2A2A" />
            <PlainChip label="Data" x={289} y={206} w={71} border="#2A2A2A" />
            <PlainChip label="Cloud" x={394} y={206} w={71} border="#2A2A2A" />

            <AgentChip label="Agent 1" x={76} />
            <AgentChip label="Agent 2" x={177} active />
            <AgentChip label="Agent 3" x={288} />
            <AgentChip label="Agent 4" x={394} />

            {/* prompt -> function connectors */}
            <Bleed src="/features/f1-conn-2.svg" inset="-0.15% -0.31% -0.24% -0.29%" className="absolute left-[112px] top-[135px] h-[70px] w-[142px]" />
            <Bleed src="/features/f1-conn-3.svg" inset="-0.14% -0.84% 0 -0.86%" className="absolute left-[214px] top-[135px] h-[70px] w-[52px]" />
            <Bleed src="/features/f1-conn-4.svg" inset="-0.14% -0.84% 0 -0.86%" className="absolute left-[274px] top-[135px] h-[70px] w-[52px] -scale-x-100" />
            <Bleed src="/features/f1-conn-1.svg" inset="-0.15% -0.31% -0.24% -0.29%" className="absolute left-[286px] top-[135px] h-[70px] w-[142px] -scale-x-100" />

            {/* function -> agent verticals */}
            {[
              { x: 111, src: "/features/f1-line-a.svg" },
              { x: 213, src: "/features/f1-line-b.svg" },
              { x: 325, src: "/features/f1-line-c.svg" },
              { x: 428, src: "/features/f1-line-b.svg" },
            ].map(({ x, src }) => (
              <div key={x} className="absolute top-[239px] h-[59px] w-px" style={{ left: x }}>
                <Image src={src} alt="" fill className="max-w-none object-fill" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ---------------------------------------------------------------- card 2 */

function Stat({ label, value, x, arrow }: { label: string; value: string; x: number; arrow?: boolean }) {
  return (
    <div className="absolute top-[214px] flex flex-col gap-1.5 opacity-80" style={{ left: x }}>
      <p className="text-body-xs text-white/50">{label}</p>
      <div className="flex items-start">
        <p className="whitespace-nowrap text-body-sm text-text-primary">{value}</p>
        {arrow && (
          <Image src="/features/f2-arrow-up-right.svg" alt="" width={18} height={18} />
        )}
      </div>
    </div>
  );
}

function TokensCard() {
  return (
    <div className="relative h-[462px] w-[600px] overflow-hidden rounded-tr-xl border-r border-t border-white/[0.08] bg-black">
      <CardHeader
        title="Less tokens, more builds"
        desc="Optimized call to LLMs and smart search in big code base to allow more efficient token usage."
        descWidth={370}
      />

      {/* Stacking follows the Figma layer order exactly:
          chart < tooltip < stats < dashboard label < the two #2E3046 glows,
          which sit ON TOP of everything and tint the whole dashboard. */}

      {/* chart — data-driven inline SVG rebuilt from the Figma vectors
          (framer.com-style); see DashboardChart for the layer/mask map */}
      <DashboardChart />

      {/* tooltip — stroke read off the node: vertical linear
          #FFFFFF -> #646464 at 9% layer opacity (t = y in its
          gradientTransform). Five of seven shadows are hidden and the two
          visible ones are ~0 alpha, so none are painted. */}
      <div
        className="absolute left-[409px] top-[214px] h-[90px] w-[155px] rounded-md px-[18px] py-3 backdrop-blur-[1.75px]"
        style={{
          background:
            "linear-gradient(-38.45deg, rgba(10,10,11,0.95) 56.39%, rgba(15,15,15,0.95) 95.42%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-md"
          style={ring("linear-gradient(180deg, rgba(255,255,255,0.09), rgba(100,100,100,0.09))")}
        />
        <div className="flex flex-col gap-1.5">
          <p className="text-body-xs text-white/50">
            <TodayDate />
          </p>
          <div className="flex items-center gap-3">
            <Image src="/features/f2-dot-build.svg" alt="" width={5} height={5} />
            <p className="text-body-xs text-text-primary">Build: 6</p>
          </div>
          <div className="flex items-center gap-3">
            <Image src="/features/f2-dot-usage.svg" alt="" width={5} height={5} />
            <p className="text-body-xs text-text-primary">Usage: 1.12K</p>
          </div>
        </div>
      </div>

      <Stat label="Token used:" value="118K" x={36} />
      <Stat label="Build created:" value="174" x={126} arrow />

      <p className="absolute left-[36px] top-[172px] font-mono text-[13px] uppercase leading-[1.375] text-text-primary">
        dashboard
      </p>

      {/* topmost: the pair of #2E3046 glows tinting the dashboard below */}
      <Bleed
        src="/features/f2-glow.svg"
        inset="-200% -92.17%"
        className="pointer-events-none absolute left-[24px] top-[190px] h-[100px] w-[217px]"
      />
      <Bleed
        src="/features/f2-glow.svg"
        inset="-200% -92.17%"
        className="pointer-events-none absolute left-[347px] top-[164px] h-[100px] w-[217px]"
      />
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

        {/* flush bento — rebuilt card by card with Jasper; cards 3 and 4
            still to come */}
        <div className="mt-[73px] flex justify-center">
          <AgentsCard />
          <TokensCard />
        </div>
      </div>
    </section>
  );
}

