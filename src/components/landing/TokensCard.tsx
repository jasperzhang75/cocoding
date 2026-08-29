"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TodayDate from "./TodayDate";
import DashboardChart from "./DashboardChart";

gsap.registerPlugin(ScrollTrigger);

/* Card 2 — the tokens dashboard, now a client component for two touches:
   - the dated tooltip drifts a few px against page scroll (subtle parallax,
     scrubbed by ScrollTrigger across the card's pass through the viewport);
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
    const tween = gsap.fromTo(
      tipRef.current,
      { y: 9 },
      {
        y: -9,
        ease: "none",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
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

  return (
    <div
      ref={cardRef}
      className="relative h-[462px] w-[600px] overflow-hidden rounded-tr-xl border-r border-t border-white/[0.08] bg-black"
    >
      <div className="absolute left-[36px] top-[35px] flex flex-col gap-3" style={{ width: 496 }}>
        <p className="text-heading-sm text-text-primary">Less tokens, more builds</p>
        <p className="w-[370px] text-body-md text-text-body">
          Optimized call to LLMs and smart search in big code base to allow more efficient token usage.
        </p>
      </div>

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
        ref={tipRef}
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
    </div>
  );
}
