import Image from "next/image";
import type { CSSProperties } from "react";

/* Features bento — Figma node 16555:17150, desktop (1280) only for now.
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
    <div className="relative h-[610px] w-[600px] overflow-hidden rounded-tl-xl border-l border-r border-t border-white/[0.06] bg-black">
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
    <div className="absolute top-[213px] flex flex-col gap-1.5 opacity-80" style={{ left: x }}>
      <p className="text-body-xs text-white/50">{label}</p>
      <div className="flex items-start">
        <p className="text-label-sm leading-[1.375] text-text-primary">{value}</p>
        {arrow && <Image src="/features/f2-arrow-up-right.svg" alt="" width={18} height={18} />}
      </div>
    </div>
  );
}

function TokensCard() {
  return (
    <div className="relative h-[462px] w-[600px] overflow-hidden rounded-tr-xl border-r border-t border-white/[0.06] bg-black">
      <CardHeader
        title="Less tokens, more builds"
        desc="Optimized call to LLMs and smart search in big code base to allow more efficient token usage."
        descWidth={370}
      />

      <p className="absolute left-[36.5px] top-[171px] font-mono text-[13px] uppercase leading-[1.375] text-text-primary">
        dashboard
      </p>

      <Stat label="Token used:" value="118K" x={36} />
      <Stat label="Build created:" value="174" x={126} arrow />

      <Bleed src="/features/f2-glow.svg" inset="-200% -92.17%" className="absolute left-[24px] top-[189px] h-[100px] w-[217px]" />
      <Bleed src="/features/f2-glow.svg" inset="-200% -92.17%" className="absolute left-[347px] top-[163px] h-[100px] w-[217px]" />

      <Bleed
        src="/features/f2-chart.svg"
        inset="-18.62% -11.69% -33.1% -22.27%"
        className="absolute left-[83px] top-[237px] h-[169px] w-[449px]"
      />

      {/* chart tooltip — gradient stroke ring; five of its seven Figma
          shadows are hidden and the two visible ones are ~0 alpha, so none
          are painted */}
      <div
        className="absolute left-[409px] top-[213px] w-[155px] rounded-md px-[18px] py-3 backdrop-blur-[1.75px]"
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
          <p className="text-body-xs text-white/50">12th July, 2026</p>
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
    <div className="relative h-[611px] w-[600px] overflow-hidden rounded-br-xl border-b border-r border-t border-white/[0.06] bg-black">
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

const SHIELD_MASK = "/features/f4-mask-shield.svg";
const SHIELD_MASK_SIZE = "603.961px 354.817px";

function SecurityCard() {
  return (
    <div
      className="relative h-[464px] w-[600px] overflow-hidden rounded-bl-xl border border-white/[0.06]"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)), linear-gradient(90deg, #000, #000)",
      }}
    >
      <div className="absolute left-8 top-[34px] w-[496px]">
        <p className="text-heading-sm text-text-primary">Built-in security, by default</p>
        <p className="mt-3 w-[394px] text-body-md text-text-body">
          With robust security safeguards already in place, your data and user information stay protected as you build.
        </p>
      </div>

      {/* both glows clipped to the shield silhouette */}
      {(["/features/f4-glow-a.svg", "/features/f4-glow-b.svg"] as const).map((src) => (
        <Bleed
          key={src}
          src={src}
          inset="-47.8% -31.69%"
          className="absolute left-[calc(50%-4.5px)] top-[76px] h-[523px] w-[789px] -translate-x-1/2"
          style={mask(SHIELD_MASK, SHIELD_MASK_SIZE, "93.5px 7.456px")}
        />
      ))}

      {/* shield glyph with its gradient "S" */}
      <div
        className="absolute left-1/2 top-[238px] size-20 -translate-x-1/2 overflow-hidden"
        style={mask(SHIELD_MASK, SHIELD_MASK_SIZE, "-265.5px -154.544px")}
      >
        <div className="absolute inset-[7.33%_15.67%_7.32%_15.67%]">
          <Image src="/features/f4-shield-outline.svg" alt="" fill className="max-w-none" />
        </div>
        <p
          className="absolute left-[calc(50%-5px)] top-[calc(50%-11px)] bg-clip-text font-mono text-[16px] font-medium uppercase leading-[1.375] tracking-[-0.16px] text-transparent"
          style={{
            backgroundImage: "linear-gradient(180deg, #D8C8FF 0%, #ECE3FF 50%, #FFFFFF 100%)",
          }}
        >
          S
        </p>
      </div>

      {/* security toggle, on */}
      <div className="absolute left-[calc(50%+244px)] top-[calc(50%-188px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
        <div className="flex h-[18px] w-[30px] items-center justify-end rounded-full bg-[#489C32] pl-[15px] pr-[3px]">
          <div className="size-3 rounded-full bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)]" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

export default function Features() {
  return (
    <section className="px-10 pt-[71px]">
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="font-mono text-indicator uppercase text-accent">Features</p>
        <h2 className="mt-3 text-display text-text-primary">
          Build faster.
          <br />
          Spend less. Stay in control.
        </h2>

        {/* flush bento: columns and rows touch; each card carries exactly the
            edges and corner radii the design gives it */}
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

