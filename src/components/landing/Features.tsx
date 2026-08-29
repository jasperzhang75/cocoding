import Image from "next/image";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import TodayDate from "./TodayDate";
import DashboardChart from "./DashboardChart";
import AgentsDiagram from "./AgentsDiagram";

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

          {/* diagram + its scroll-in flow animation (client component) */}
          <AgentsDiagram />
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

/* ---------------------------------------------------------------- card 3 */

type LogRow = { text: string; status: "check" | "check-lit" } | { text: string; error: string };

function LogBlock({
  y,
  icon,
  title,
  titleClass,
  meta,
  metaX,
  time,
  rows,
}: {
  y: number;
  icon: string;
  title: string;
  titleClass: string;
  meta: string;
  metaX: number;
  time: string;
  rows: LogRow[];
}) {
  return (
    <div className="absolute left-[36px] w-[480px]" style={{ top: y }}>
      <Image src={icon} alt="" width={32} height={32} className="absolute left-0 top-0" />
      <p className={`absolute left-[56px] top-[7px] font-mono text-[13px] uppercase leading-[1.375] ${titleClass}`}>
        {title}
      </p>
      <p className="absolute top-[7px] whitespace-pre font-mono text-[13px] uppercase text-[#EBEBEB]/20" style={{ left: metaX }}>
        {meta}
      </p>
      <p className="absolute left-[363px] top-[7px] whitespace-pre font-mono text-[13px] uppercase text-[#EBEBEB]/20">
        {time}
      </p>
      <div className="absolute left-[56px] top-[37px] flex flex-col gap-1.5 opacity-80">
        {rows.map((row) => (
          <div key={row.text} className="flex items-center gap-3">
            <p
              className={`whitespace-pre text-[13px] leading-[1.375] ${
                "error" in row ? "text-text-body/60" : "status" in row && row.status === "check-lit" ? "text-text-body" : "text-text-body/60"
              }`}
            >
              {row.text}
            </p>
            {"error" in row ? (
              <p className="text-label-sm leading-[1.375] text-[#A34545]/[0.39]">{row.error}</p>
            ) : (
              <Image
                src={row.status === "check-lit" ? "/features/f3-check-lit.svg" : "/features/f3-check-dim.svg"}
                alt=""
                width={14}
                height={14}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorFixCard() {
  return (
    <div className="relative h-[611px] w-[600px] overflow-hidden rounded-br-xl border-b border-r border-t border-white/[0.08] bg-black">
      <CardHeader
        title="Error auto-fix as you move forward"
        desc="Dedicated debugging agent checks and fixes errors automatically during production."
        descWidth={359}
      />

      <div
        className="absolute inset-0"
        style={mask("/features/f3-mask-outer.svg", "980px 811px", "-233px -61px")}
      >
        <Bleed
          src="/features/f3-glow-wide.svg"
          inset="-71.77% -48.94%"
          className="absolute left-[-60px] top-[151px] h-[418px] w-[613px]"
        />

        <div
          className="absolute left-[36px] top-[182px] h-[435px] w-[562px] overflow-hidden rounded-tl-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          style={{
            borderLeft: "0.9px solid rgba(224,224,224,0.13)",
            borderTop: "0.9px solid rgba(224,224,224,0.13)",
            background:
              "linear-gradient(90deg, rgba(50,50,50,0.24), rgba(50,50,50,0.24)), linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(90deg, #030303, #030303)",
          }}
        >
          <Bleed src="/features/f3-glow-a.svg" inset="-200% -196.08%" className="absolute left-[-24.9px] top-[-50.9px] h-[100px] w-[102px]" />
          <Bleed src="/features/f3-glow-b.svg" inset="-166.67% -139.86%" className="absolute left-[239px] top-[-7.9px] h-[120px] w-[143px]" />
          <Bleed src="/features/f3-glow-a.svg" inset="-200% -196.08%" className="absolute left-[79px] top-[205px] h-[100px] w-[102px]" />

          <div
            className="absolute inset-0"
            style={mask("/features/f3-mask-inner.svg", "669px 425px", "-66px -35px")}
          >
            <p
              className="absolute left-[35.5px] top-[35px] bg-clip-text font-mono text-[13px] uppercase leading-[1.375] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFFFFF 0%, #595959 50%, #FFFFFF 100%)",
              }}
            >
              Processing/
            </p>

            <Bleed
              src="/features/f3-curve-top.svg"
              inset="-68.09% -9.6%"
              className="absolute left-[-35.9px] top-[-30.9px] h-[89px] w-[631px] -scale-y-100"
            />

            <LogBlock
              y={138}
              icon="/features/f3-code-1.svg"
              title="building"
              titleClass="text-text-primary/80"
              meta="42 files"
              metaX={143}
              time={"May 18th  20:10"}
              rows={[
                { text: "Generating routes ", status: "check" },
                { text: "Linking auth state", status: "check" },
                { text: "Checking data hooks", status: "check" },
                { text: "Bundling frontend", status: "check" },
              ]}
            />
            <LogBlock
              y={289}
              icon="/features/f3-code-2.svg"
              title="error-check"
              titleClass="text-text-primary/80"
              meta="3 issues"
              metaX={166}
              time={"May 18th  20:11"}
              rows={[
                { text: "auth.ts   :   9", error: "undefined ref" },
                { text: "api/users.ts   :   121", error: "type mismatch" },
                { text: "hooks/useData.ts   :   174", error: "missing dep" },
              ]}
            />
            <LogBlock
              y={419}
              icon="/features/f3-code-3.svg"
              title="fixing"
              titleClass="text-text-primary"
              meta="3 fixed"
              metaX={166}
              time={"May 18th  20:12"}
              rows={[
                { text: "auth.ts   :   9", status: "check-lit" },
                { text: "api/users.ts   :   121", status: "check-lit" },
                { text: "hooks/useData.ts   :   174", status: "check-lit" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


/* ---------------------------------------------------------------- card 4 */

function SecurityCard() {
  return (
    <div
      className="relative h-[464px] w-[600px] overflow-hidden rounded-bl-xl border border-white/[0.08]"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)), linear-gradient(90deg, #000, #000)",
      }}
    >
      {/* Re-read from Figma after Jasper's redesign (node 16629:18699):
          the shield is now a solid green-gradient glyph, the two big
          blur-250 glows paint OVER it unmasked, and the toggle sits in the
          header row, above everything and NOT masked. Paint order per the
          layer tree: header < shield < glows < toggle. */}
      <div className="absolute left-[33px] top-[35px] w-[496px]">
        <p className="text-heading-sm text-text-primary">Built-in security, by default</p>
        <p className="mt-3 w-[394px] text-body-md text-text-body">
          With robust security safeguards already in place, your data and user information stay protected as you build.
        </p>
      </div>

      {/* shield glyph with its gradient "S" */}
      <div className="absolute left-[260px] top-[239px] size-20">
        <Image
          src="/features/f4-shield.svg"
          alt=""
          width={55}
          height={68}
          className="absolute left-[12.5px] top-[5.9px] h-[68.3px] w-[54.9px] max-w-none"
        />
        <p
          className="absolute left-[35px] top-[29px] bg-clip-text font-mono text-[16px] font-medium uppercase leading-[1.375] tracking-[-0.16px] text-transparent"
          style={{
            backgroundImage: "linear-gradient(180deg, #D8C8FF 0%, #ECE3FF 50%, #FFFFFF 100%)",
          }}
        >
          S
        </p>
      </div>

      {/* the pair of blur-250 glows, unmasked, over the shield */}
      <Bleed
        src="/features/f4-glow-a.svg"
        inset="-47.8% -31.69%"
        className="pointer-events-none absolute left-[-99px] top-[77px] h-[523px] w-[789px]"
      />
      <Bleed
        src="/features/f4-glow-b.svg"
        inset="-47.8% -31.69%"
        className="pointer-events-none absolute left-[-99px] top-[77px] h-[523px] w-[789px]"
      />

      {/* security toggle, on — header row, topmost, unmasked */}
      <div className="absolute left-[529px] top-[35px] flex h-[18px] w-[30px] items-center justify-end rounded-full bg-[#489C32] pl-[15px] pr-[3px]">
        <div className="size-3 rounded-full bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)]" />
      </div>
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
            <ErrorFixCard />
          </div>
        </div>
      </div>
    </section>
  );
}

