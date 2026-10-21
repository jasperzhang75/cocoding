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
   dash offset driven along the path — so the light bends round the caps.

   The tail: LAYERS dashes stacked, all ending at the same head, each one
   LAYERS-th of the length longer than the last, with per-layer opacities
   solved so that what you SEE — the stacked result — falls off smoothly
   from PEAK at the head to nothing at the tail's end along a power curve
   (TAIL_POW). Four stacked dashes read as four steps (Jasper: "能看得出
   来他是四段"); two dozen do not.

   The pace: not even. It runs the straights at full speed and the corner
   arcs at CORNER of that, easing between over BLEND px either side of
   each arc — a thing sliding round a bend (Jasper: "绕过 pill 的时候慢一
   点 模拟真实的物理感觉"). The time for each pixel of the outline is
   integrated once, the lap's seconds spread over it, and each frame
   looks the head's position up from that table. The whole thing fades
   in over its first tenth and out over its last. */
const LAYERS = 24;
const PEAK = 0.95; // the head's brightness
const TAIL_POW = 1.7; // the fall-off: brightness = PEAK * (1 - d / length) ^ TAIL_POW
const CORNER = 0.45; // speed round a corner arc, relative to a straight
const BLEND = 22; // px of a straight, either side of an arc, over which the speed eases

/* the opacity each stacked layer needs so the stack shows the target
   curve: layer j covers the tail's first j/LAYERS; at a point under
   layers j..N the stack's alpha is 1 - prod(1 - a_i), which must equal
   the target there */
const layerAlphas = () => {
  const target = (j: number) => (j > LAYERS ? 0 : PEAK * Math.pow(1 - (j - 0.5) / LAYERS, TAIL_POW));
  return Array.from({ length: LAYERS }, (_, k) => {
    const j = k + 1;
    return 1 - (1 - target(j)) / (1 - target(j + 1));
  });
};
const ALPHAS = layerAlphas();

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
    rects.forEach((r, i) => r.setAttribute("stroke-dasharray", `${((i + 1) / LAYERS) * length} ${total}`));

    /* the outline as the rect path runs it — from the top edge's left end,
       clockwise: straight, arc, straight, arc... — and the speed at each
       point of it */
    const box = rects[0].getBBox();
    const R = radius - width / 2;
    const arc = (Math.PI * R) / 2;
    const pieces: { len: number; arc: boolean }[] = [];
    for (const straight of [box.width - 2 * R, box.height - 2 * R, box.width - 2 * R, box.height - 2 * R]) {
      pieces.push({ len: Math.max(0, straight), arc: false }, { len: arc, arc: true });
    }
    const smooth = (x: number) => x * x * (3 - 2 * x);
    const speedAt = (s: number) => {
      let at = 0;
      for (const p of pieces) {
        if (s < at + p.len) {
          if (p.arc) return CORNER;
          const d = Math.min(s - at, at + p.len - s); // distance to the nearer arc
          return d >= BLEND ? 1 : CORNER + (1 - CORNER) * smooth(d / BLEND);
        }
        at += p.len;
      }
      return CORNER;
    };
    // the time to reach each pixel of the outline, scaled to the lap
    const n = Math.ceil(total);
    const timeAt = new Float64Array(n + 1);
    for (let k = 0; k < n; k++) timeAt[k + 1] = timeAt[k] + 1 / speedAt(k + 0.5);
    const scale = lap / timeAt[n];
    const headAt = (t: number) => {
      const target = t / scale;
      let lo = 0;
      let hi = n;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (timeAt[mid] <= target) lo = mid;
        else hi = mid;
      }
      const span = timeAt[hi] - timeAt[lo] || 1;
      return Math.min(total, lo + (target - timeAt[lo]) / span);
    };

    const run = { t: 0 };
    const place = () => {
      const h = headAt(run.t);
      rects.forEach((r, i) => r.setAttribute("stroke-dashoffset", String(((i + 1) / LAYERS) * length - h)));
    };
    place();
    const tl = gsap.timeline({ delay });
    tl.to(run, { t: lap, duration: lap, ease: "none", onUpdate: place }, 0);
    tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: lap * 0.1, ease: "power1.out" }, 0);
    tl.to(svg, { opacity: 0, duration: lap * 0.1, ease: "power1.in" }, lap * 0.9);
    return () => {
      tl.kill();
    };
  }, [width, radius, length, lap, delay]);

  const half = width / 2;
  return (
    <svg ref={svgRef} aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-0">
      {ALPHAS.map((a, i) => (
        <rect
          key={i}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={a}
          strokeWidth={width}
          strokeLinecap="round"
          rx={radius - half}
          style={{ x: `${half}px`, y: `${half}px`, width: `calc(100% - ${width}px)`, height: `calc(100% - ${width}px)` }}
        />
      ))}
    </svg>
  );
}
