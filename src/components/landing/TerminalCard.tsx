"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import PosterViewport from "./PosterViewport";

/* Card 3 — the error auto-fix terminal, animated per Jasper's spec and the
   updated Figma frame (17175:8367).

   Structure (panel coords, panel = 562x435 at card 36,182):
   - PROCESSING/ and the top curve sit OUTSIDE the log window now, directly
     under the outer ellipse fade; PROCESSING's gradient slides left→right
     forever (background feel).
   - Rectangle 2610 is a fixed blurred WINDOW (y 143..339, feathered edges,
     rebuilt as a CSS gradient mask). The three log blocks ride a vertical
     STRIP behind it at design offsets 0 / 151 / 281; the strip translates
     +151 → 0 → -130 so each block takes the stage while the previous one
     ghosts out through the feathered top — exactly the mid-state Jasper
     staged in Figma (building's last row faintly visible above error-check).

   Sequence (one-shot on scroll into view; the PROCESSING shimmer loops):
   1. BUILDING at the window: "42 files" counts up fast while the four
      checkmarks land one by one.
   2. The strip slides up WHILE error-check fades in and plays: "3 issues"
      counts 0→3, three error rows appear tac-tac-tac.
   3. FIXING plays at the window's lower edge — "3 fixed" counts up as its
      rows appear with green checks — then the strip slides up again;
      error-check ghosts into the feather, building is gone.
   Dates in all three headers are today (short form to fit), same source of
   truth as the dashboard tooltip. prefers-reduced-motion shows the final
   state. */

const mask = (url: string, size: string, position: string): CSSProperties => ({
  maskImage: `url(${url})`,
  maskSize: size,
  maskPosition: position,
  maskRepeat: "no-repeat",
  WebkitMaskImage: `url(${url})`,
  WebkitMaskSize: size,
  WebkitMaskPosition: position,
  WebkitMaskRepeat: "no-repeat",
});

/* The blurred-rect window as a vertical gradient mask (Figma blur r50). */
const windowMask: CSSProperties = {
  maskImage:
    "linear-gradient(180deg, transparent 103px, black 190px, black 339px, transparent 405px)",
  WebkitMaskImage:
    "linear-gradient(180deg, transparent 103px, black 190px, black 339px, transparent 405px)",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ordinal = (n: number) => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};
const todayShort = () => {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`;
};
/* the three log lines run a minute apart, anchored to the viewer's clock */
const timeAt = (offsetMin: number) => {
  const d = new Date(Date.now() + offsetMin * 60_000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function Bleed({ src, inset, className }: { src: string; inset: string; className?: string }) {
  return (
    <div className={className}>
      <div className="absolute" style={{ inset }}>
        <Image src={src} alt="" fill className="max-w-none" />
      </div>
    </div>
  );
}

type Row =
  | { text: string; check: "dim" | "lit" }
  | { text: string; error: string };

function LogBlock({
  y,
  icon,
  title,
  titleClass,
  countLabel,
  countTo,
  metaX,
  time,
  rows,
  blockRef,
}: {
  y: number;
  icon: string;
  title: string;
  titleClass: string;
  countLabel: string;
  countTo: number;
  metaX: number;
  time: string;
  rows: Row[];
  blockRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={blockRef} className="absolute left-0 w-[480px]" style={{ top: y }}>
      <Image src={icon} alt="" width={32} height={32} className="absolute left-0 top-0" />
      <p className={`absolute left-[56px] top-[7px] font-mono text-[13px] uppercase leading-[1.375] ${titleClass}`}>
        {title}
      </p>
      <p
        className="absolute top-[7px] whitespace-pre font-mono text-[13px] uppercase text-[#EBEBEB]/20"
        style={{ left: metaX }}
      >
        <span data-count data-count-to={countTo}>{countTo}</span>
        {countLabel}
      </p>
      <p className="absolute left-[363px] top-[7px] whitespace-pre font-mono text-[13px] uppercase text-[#EBEBEB]/20" suppressHydrationWarning>
        {`${todayShort()}  ${time}`}
      </p>
      <div className="absolute left-[56px] top-[37px] flex flex-col gap-1.5 opacity-80">
        {rows.map((row) => (
          <div key={row.text} data-row className="flex items-center gap-3">
            <p
              className={`whitespace-pre text-[13px] leading-[1.375] ${
                "check" in row && row.check === "lit" ? "text-text-body" : "text-text-body/60"
              }`}
            >
              {row.text}
            </p>
            {"error" in row ? (
              <p className="text-label-sm leading-[1.375] text-[#A34545]/[0.39]">{row.error}</p>
            ) : (
              <Image
                data-check
                src={row.check === "lit" ? "/features/f3-check-lit.svg" : "/features/f3-check-dim.svg"}
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

/* strip offsets (design): building 0, error 151, fixing 281.
   strip translateY: +151 (building on stage) -> 0 -> -130. */
const STRIP_STAGE = [151, 0, -130];

export default function TerminalCard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  useEffect(() => {
    const root = rootRef.current;
    const strip = stripRef.current;
    const replay = replayRef.current;
    if (!root || !strip || !replay) return;
    const [building, errorB, fixing] = blockRefs.current;
    if (!building || !errorB || !fixing) return;

    const counts = [...root.querySelectorAll<HTMLElement>("[data-count]")];
    const rowsOf = (b: HTMLElement) => [...b.querySelectorAll<HTMLElement>("[data-row]")];
    const checksOf = (b: HTMLElement) => [...b.querySelectorAll<HTMLElement>("[data-check]")];

    const setCount = (el: HTMLElement, v: number) => {
      el.textContent = String(Math.round(v));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(strip, { y: STRIP_STAGE[2] });
      gsap.set([errorB, fixing], { opacity: 1 });
      gsap.set(replay, { autoAlpha: 0 });
      return;
    }

    // arm: strip below, future blocks invisible, checks/rows/counts at zero
    gsap.set(strip, { y: STRIP_STAGE[0] });
    gsap.set(replay, { autoAlpha: 0 });
    gsap.set([errorB, fixing], { opacity: 0 });
    gsap.set([...checksOf(building), ...checksOf(fixing)], { opacity: 0 });
    gsap.set([...rowsOf(errorB), ...rowsOf(fixing)], { opacity: 0 });
    counts.forEach((c) => setCount(c, 0));

    const countTween = (el: HTMLElement, to: number, duration: number) => {
      const state = { v: 0 };
      return gsap.to(state, {
        v: to,
        duration,
        ease: "power1.out",
        onUpdate: () => setCount(el, state.v),
      });
    };

    let tl: gsap.core.Timeline | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        tl = gsap.timeline();
        tlRef.current = tl;
        const shimmer = root.querySelector<HTMLElement>(".processing-shimmer");
        tl.call(() => { if (shimmer) shimmer.style.animationPlayState = "running"; }, [], 0);
        // ---- phase 1: BUILDING on stage -------------------------------
        tl.add(countTween(counts[0], 42, 0.9), 0);
        tl.to(
          checksOf(building),
          { opacity: 1, duration: 0.15, stagger: 0.3, ease: "power2.out" },
          0.15
        );

        // ---- phase 2: slide up WHILE error-check plays ----------------
        const tE = 1.7;
        tl.to(strip, { y: STRIP_STAGE[1], duration: 0.8, ease: "power2.inOut" }, tE);
        tl.to(errorB, { opacity: 1, duration: 0.3 }, tE);
        tl.add(countTween(counts[1], 3, 0.5), tE + 0.35);
        tl.to(
          rowsOf(errorB),
          { opacity: 1, duration: 0.25, stagger: 0.35, ease: "power2.out" },
          tE + 0.5
        );

        // ---- phase 3: the strip slides up AS fixing starts, so the main
        // view during its typing is fixing itself ---------------------
        const tF = tE + 1.9;
        tl.to(strip, { y: STRIP_STAGE[2], duration: 0.8, ease: "power2.inOut" }, tF);
        tl.to(fixing, { opacity: 1, duration: 0.3 }, tF);
        tl.add(countTween(counts[2], 3, 0.5), tF + 0.35);
        tl.to(
          rowsOf(fixing),
          { opacity: 1, duration: 0.25, stagger: 0.35, ease: "power2.out" },
          tF + 0.5
        );
        // each green check lands a beat after its own row
        tl.fromTo(
          checksOf(fixing),
          { opacity: 0 },
          { opacity: 1, duration: 0.2, stagger: 0.35, ease: "power2.out" },
          tF + 0.85
        );

        // ---- done: shimmer parks, the restart control spins in --------
        // a clockwise entrance spin to catch the eye as it appears
        tl.set(replay, { autoAlpha: 0 }, 0);
        tl.fromTo(
          replay,
          { rotation: -270 },
          { rotation: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          tF + 1.7
        );
        tl.call(() => { if (shimmer) shimmer.style.animationPlayState = "paused"; }, [], tF + 1.7);
      },
      { threshold: 0.4 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tl?.kill();
      tlRef.current = null;
    };
  }, []);

  const replaySequence = () => tlRef.current?.restart();

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-[600px] overflow-hidden rounded-xl border border-white/[0.08] bg-black md:h-[611px] md:w-[600px] md:max-w-none xl:absolute xl:left-[600px] xl:top-[462px] xl:rounded-none xl:rounded-br-xl xl:border-l-0"
    >
      <div className="flex flex-col gap-3 px-7 pb-6 pt-8 md:absolute md:left-[36px] md:top-[35px] md:w-[496px] md:p-0">
        <p className="text-heading-sm text-text-primary">Error auto-fix as you move forward</p>
        <p className="text-body-md text-text-body md:w-[359px]">
          Dedicated debugging agent checks and fixes errors automatically during production.
        </p>
      </div>

      <PosterViewport designHeight={611} crop={150} className="md:absolute md:inset-0">
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

          {/* top curve — outside the log window in the updated design */}
          <Bleed
            src="/features/f3-curve-top.svg"
            inset="-68.09% -9.6%"
            className="absolute left-[-35.9px] top-[-30.9px] h-[89px] w-[631px] -scale-y-100"
          />

          {/* PROCESSING/ — its gradient slides left to right, forever */}
          <p className="processing-shimmer absolute left-[35.5px] top-[35px] bg-clip-text font-mono text-[13px] uppercase leading-[1.375] text-transparent">
            Processing/
          </p>
          {/* replay — appears once the sequence finishes (Figma
              lucide/rotate-ccw at panel 125.5,39) */}
          <button
            ref={replayRef}
            type="button"
            aria-label="Replay"
            onClick={replaySequence}
            className="absolute left-[123px] top-[35.5px] flex size-[17px] items-center justify-center text-text-body/80 opacity-0 transition-colors hover:text-text-body"
          >
            {/* Figma bakes a 30-deg rotation into the glyph and flips the
                frame vertically; rotate innermost, then flip */}
            <svg
              width="12.5"
              height="12.5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              style={{ transform: "scaleY(-1) rotate(30deg)" }}
            >
              <path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* the log window: feathered band, with the strip sliding behind.
              pointer-events-none — its full-panel hit area was swallowing
              clicks meant for the replay control underneath the mask */}
          <div className="pointer-events-none absolute inset-0" style={windowMask}>
            <div ref={stripRef} className="absolute left-[36px] top-[42px] h-full w-[480px]">
              <LogBlock
                blockRef={(el) => { blockRefs.current[0] = el; }}
                y={0}
                icon="/features/f3-code-1.svg"
                title="building"
                titleClass="text-text-primary/80"
                countLabel=" files"
                countTo={42}
                metaX={143}
                time={timeAt(0)}
                rows={[
                  { text: "Generating routes ", check: "dim" },
                  { text: "Linking auth state", check: "dim" },
                  { text: "Checking data hooks", check: "dim" },
                  { text: "Bundling frontend", check: "dim" },
                ]}
              />
              <LogBlock
                blockRef={(el) => { blockRefs.current[1] = el; }}
                y={151}
                icon="/features/f3-code-2.svg"
                title="error-check"
                titleClass="text-text-primary/80"
                countLabel=" issues"
                countTo={3}
                metaX={166}
                time={timeAt(1)}
                rows={[
                  { text: "auth.ts   :   9", error: "undefined ref" },
                  { text: "api/users.ts   :   121", error: "type mismatch" },
                  { text: "hooks/useData.ts   :   174", error: "missing dep" },
                ]}
              />
              <LogBlock
                blockRef={(el) => { blockRefs.current[2] = el; }}
                y={281}
                icon="/features/f3-code-3.svg"
                title="fixing"
                titleClass="text-text-primary"
                countLabel=" fixed"
                countTo={3}
                metaX={166}
                time={timeAt(2)}
                rows={[
                  { text: "auth.ts   :   9", check: "lit" },
                  { text: "api/users.ts   :   121", check: "lit" },
                  { text: "hooks/useData.ts   :   174", check: "lit" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      </PosterViewport>
    </div>
  );
}
