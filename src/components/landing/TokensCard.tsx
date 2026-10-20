"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import TodayDate from "./TodayDate";
import DashboardChart from "./DashboardChart";
import PosterViewport from "./PosterViewport";

/* Card 2 — the tokens dashboard, now a client component for three touches:
   - the chart's two LINES grow in from the left when the card scrolls into
     view, bursting — fast, then slowing as they near the end (a feathered
     mask on the line paths, see DashboardChart's reveal; REVEAL_T on
     REVEAL_EASE, from REVEAL_FROM to REVEAL_TO). The glowing areas under
     them are there from the start (Jasper, 2026-10-20);
   - the dated tooltip drifts a few px against page scroll (subtle parallax
     across the card's pass through the viewport — a plain scroll listener
     writing the transform synchronously, no ticker to go stale);
   - hovering the green arrow next to "174" redraws its stroke once.
   Both are skipped under prefers-reduced-motion. */

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

function Bleed({
  src,
  inset,
  className,
}: {
  src: string;
  inset: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="absolute" style={{ inset }}>
        <Image src={src} alt="" fill className="max-w-none" />
      </div>
    </div>
  );
}

function Stat({
  label,
  x,
  children,
}: {
  label: string;
  x: number;
  children: ReactNode;
}) {
  return (
    <div className="absolute top-[214px] flex flex-col gap-1.5 opacity-80" style={{ left: x }}>
      <p className="text-body-xs text-white/50">{label}</p>
      <div className="flex items-start">{children}</div>
    </div>
  );
}

export default function TokensCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    const tip = tipRef.current;
    if (!card || !tip) return;

    const RANGE = 10; // px each way
    let target = 0;
    let current = 0;
    let raf = 0;

    const measure = () => {
      const r = card.getBoundingClientRect();
      const total = window.innerHeight + r.height;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
      target = RANGE - 2 * RANGE * progress;
    };
    const tick = () => {
      // eased pursuit: the tooltip drifts after the scroll, which reads as
      // floating rather than being bolted to the page
      current += (target - current) * 0.08;
      tip.style.transform = `translateY(${current.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };
    measure();
    current = target;
    tip.style.willChange = "transform";
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* the chart's reveal: once, when the card arrives — unless it is already
     on screen when the page runs (a reload at this scroll position), then
     the chart stays as the HTML drew it. Reduced motion: as drawn. */
  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const solid = card.querySelector<SVGRectElement>("[data-reveal-solid]");
    const edge = card.querySelector<SVGRectElement>("[data-reveal-edge]");
    const grad = card.querySelector<SVGLinearGradientElement>("#dc-reveal-edge");
    if (!solid || !edge || !grad) return;
    const REVEAL_FROM = -60; // the feather's right end at the chart's left edge: nothing shows
    const REVEAL_TO = 620; // past the right edge: everything
    const REVEAL_T = 1.6;
    const REVEAL_EASE = "expo.out"; // the burst: most of the way in the first 0.3s, the tail creeping
    const set = (p: number) => {
      solid.setAttribute("width", String(p + 300));
      edge.setAttribute("x", String(p));
      grad.setAttribute("x1", String(p));
      grad.setAttribute("x2", String(p + 60));
    };
    const r = card.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already in view
    set(REVEAL_FROM);
    const state = { p: REVEAL_FROM };
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(state, { p: REVEAL_TO, duration: REVEAL_T, ease: REVEAL_EASE, onUpdate: () => set(state.p) });
      },
      { threshold: 0.35 }
    );
    io.observe(card);
    return () => {
      io.disconnect();
      tween?.kill();
      set(REVEAL_TO);
    };
  }, []);

  const drawArrow = () => {
    const svg = arrowRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    svg.querySelectorAll("path").forEach((p, i) => {
      const L = p.getTotalLength();
      gsap.fromTo(
        p,
        { strokeDasharray: L, strokeDashoffset: L },
        {
          strokeDashoffset: 0,
          duration: 0.4,
          delay: i * 0.12,
          ease: "power1.out",
          overwrite: true,
          onComplete: () => p.style.removeProperty("stroke-dasharray"),
        }
      );
    });
  };

  // touch devices never fire hover; draw the arrow once when the card
  // scrolls into view there
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          drawArrow();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);


  return (
    <div
      ref={cardRef}
      className="order-2 relative w-full max-w-[600px] overflow-hidden rounded-md border border-white/[0.06] bg-[#080707] md:rounded-none md:rounded-tr-xl md:border-b-0 md:border-l-0 xl:absolute xl:left-[600px] xl:top-0 xl:h-[462px] xl:w-[600px] xl:max-w-none"
    >
      <div className="flex flex-col gap-3 px-7 pb-6 pt-8 xl:absolute xl:left-[36px] xl:top-[35px] xl:w-[496px] xl:p-0">
        <p className="text-body-md text-text-primary xl:text-heading-sm">Less tokens, more builds</p>
        <p className="text-balance text-body-sm text-text-body xl:text-wrap xl:text-body-md xl:w-[370px]">
          Optimized call to LLMs and smart search in big code base to allow more efficient token usage.
        </p>
      </div>

      {/* Stacking follows the Figma layer order exactly:
          chart < tooltip < stats < dashboard label < the two #2E3046 glows,
          which sit ON TOP of everything and tint the whole dashboard. */}

      <PosterViewport designHeight={462} crop={150} className="xl:absolute xl:inset-0">
      {/* chart — data-driven inline SVG rebuilt from the Figma vectors
          (framer.com-style); see DashboardChart for the layer/mask map */}
      <DashboardChart />

      {/* tooltip — the redesign file's Frame 2609389 (1280:66, Jasper's
          2026-10-20 replacement): #19232D@15% under a #929292@4% wash
          (the earlier node was a #0A0A0B -> #0F0F0F diagonal at 95%, and
          before that #0D0E10@64% under #606060@4%); stroke the vertical
          white -> #646464 at 9% (ring below); the two visible drop shadows
          painted verbatim; Figma background blur 3.5 == backdrop blur
          1.75px. Five hidden shadows omitted as intended. The card itself
          is #080707 (was black). */}
      <div
        ref={tipRef}
        className="absolute left-[409px] top-[214px] w-max min-w-[155px] rounded-md px-[18px] py-3 backdrop-blur-[1.75px]"
        style={{
          background:
            "linear-gradient(0deg, rgba(146,146,146,0.04), rgba(146,146,146,0.04)), linear-gradient(0deg, rgba(25,35,45,0.15), rgba(25,35,45,0.15))",
          boxShadow:
            "0 86px 34px rgba(26,26,26,0.01), 0 134px 38px rgba(26,26,26,0)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-md"
          style={ring("linear-gradient(180deg, rgba(255,255,255,0.09), rgba(100,100,100,0.09))")}
        />
        <div className="flex flex-col gap-1.5">
          <p className="whitespace-nowrap text-body-xs text-white/50">
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

      <Stat label="Token used:" x={36}>
        <p className="whitespace-nowrap text-body-sm text-text-primary">118K</p>
      </Stat>
      <Stat label="Build created:" x={126}>
        <p className="whitespace-nowrap text-body-sm text-text-primary">174</p>
        {/* hover redraws the arrow's stroke once */}
        <svg
          ref={arrowRef}
          onMouseEnter={drawArrow}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
        >
          <path d="M5.25 12.75L12.75 5.25" stroke="#55F247" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.25 5.25H12.75V12.75" stroke="#55F247" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Stat>

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
      </PosterViewport>
    </div>
  );
}
