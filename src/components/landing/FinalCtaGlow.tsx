"use client";

import { useEffect, useRef } from "react";

/* THE GLOW beside the closing call — Ellipse 21888 in Figma 16555:16606:
   a 289 x 206 ellipse, radial #18365F -> #245292 -> #316FC5 at 52%,
   LAYER-BLURRED 300 (CSS blur at half the radius), its center 93.5 right
   of the page's and 31 above the section's middle — level with the
   heading. Jasper insisted on the real layer blur here (2026-09-06).

   It comes up as the section scrolls into view (Jasper 2026-09-08:
   "蓝色光晕进入视野以后要有渐显的效果"): dark until ARRIVED of the
   section is on screen, then its opacity rises to the design's over
   RISE. Once, like the eyebrows' scramble: the observer fires and is
   dropped, and scrolling back finds it lit. The check is the ratio,
   not isIntersecting — an observer reports its current state as soon
   as it is attached, threshold or not, and a section a few px into the
   viewport would have lit the glow at once. Reduced motion: lit. */

const OPACITY = 0.52; // the design's
const ARRIVED = 0.3; // the share of the section on screen that starts the rise
const RISE = "1.6s";

export default function FinalCtaGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const section = glow?.closest("section");
    if (!glow || !section) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      glow.style.transition = "none";
      glow.style.opacity = String(OPACITY);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < ARRIVED) return;
        glow.style.opacity = String(OPACITY);
        observer.disconnect();
      },
      { threshold: ARRIVED }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-[206px] w-[289px] rounded-full"
      style={{
        marginLeft: 93.5 - 144.5,
        marginTop: -31 - 103,
        opacity: 0,
        background: "radial-gradient(closest-side, #18365F 0%, #245292 50%, #316FC5 100%)",
        filter: "blur(150px)",
        transition: `opacity ${RISE} cubic-bezier(0.25, 0.1, 0.25, 1)`,
      }}
    />
  );
}
