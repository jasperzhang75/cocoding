"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/* A run of light along a pill's border — the hero badge's, once, on
   arrival (Jasper 2026-10-21: "只需要他转 1 圈").

   Why not a library beam: Magic UI's BorderBeam (tried the same day)
   rides a gradient SQUARE along the border on an offset-path, and on a
   pill whose end caps are tighter than the square (16px radius under a
   56px beam) the square covers a whole cap while its centre crawls round
   the arc — the light parks at both ends ("在 pill 两边的地方的速度会卡
   住"). This draws the beam as DASHES on the pill's own outline instead:
   an SVG rect with the pill's radius, stroked at the border's width, its
   dash offset tweened at one pace — so the light bends round the caps at
   the speed it runs the straights. The tail is four dashes stacked, all
   ending at the same head and shorter and brighter towards it. The
   whole thing fades in over its first tenth and out over its last. */
const TAIL = [
  { share: 1, opacity: 0.18 },
  { share: 0.62, opacity: 0.28 },
  { share: 0.32, opacity: 0.4 },
  { share: 0.12, opacity: 0.7 },
];

export default function BorderLight({
  width = 0.7,
  radius = 16,
  length = 56,
  lap = 4,
  delay = 0.6,
}: {
  /** the border's width — the stroke's */
  width?: number;
  /** the pill's corner radius (outer) */
  radius?: number;
  /** the beam's length along the border, px */
  length?: number;
  /** one lap, seconds */
  lap?: number;
  /** seconds after mount before it sets off */
  delay?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rects = Array.from(svg.querySelectorAll("rect"));
    const total = rects[0].getTotalLength();
    rects.forEach((r, i) => r.setAttribute("stroke-dasharray", `${TAIL[i].share * length} ${total}`));
    // the head runs from the start of the path all the way round and the
    // tail out after it; each dash starts its own length behind the head
    const run = { h: -length };
    const place = () => rects.forEach((r, i) => r.setAttribute("stroke-dashoffset", String(TAIL[i].share * length - run.h)));
    place();
    const tl = gsap.timeline({ delay });
    tl.to(run, { h: total + length, duration: lap * (total + 2 * length) / total, ease: "none", onUpdate: place }, 0);
    tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: lap * 0.1, ease: "power1.out" }, 0);
    tl.to(svg, { opacity: 0, duration: lap * 0.1, ease: "power1.in" }, tl.duration() - lap * 0.1);
    return () => {
      tl.kill();
    };
  }, [width, radius, length, lap, delay]);

  const half = width / 2;
  return (
    <svg ref={svgRef} aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-0">
      {TAIL.map((t, i) => (
        <rect
          key={i}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={t.opacity}
          strokeWidth={width}
          strokeLinecap="round"
          rx={radius - half}
          style={{ x: `${half}px`, y: `${half}px`, width: `calc(100% - ${width}px)`, height: `calc(100% - ${width}px)` }}
        />
      ))}
    </svg>
  );
}
