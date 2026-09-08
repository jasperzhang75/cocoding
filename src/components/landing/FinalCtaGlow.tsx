"use client";

import { useEffect, useRef } from "react";
import { onArrival } from "./on-arrival";

/* THE GLOW beside the closing call — Ellipse 21888 in Figma 16555:16606:
   a 289 x 206 ellipse, radial #18365F -> #245292 -> #316FC5 at 52%,
   LAYER-BLURRED 300 (CSS blur at half the radius), its center 93.5 right
   of the page's and 31 above the section's middle — level with the
   heading. Jasper insisted on the real layer blur here (2026-09-06).

   It comes up as the section scrolls into view (Jasper 2026-09-08:
   "蓝色光晕进入视野以后要有渐显的效果"): dark until 30% of the section
   is on screen, then 1.6s to the design's 52% — rise-on-arrival with
   --lit 0.52, the section marked by onArrival (see both). */

export default function FinalCtaGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    return section ? onArrival(section) : undefined;
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="rise-on-arrival pointer-events-none absolute left-1/2 top-1/2 h-[206px] w-[289px] rounded-full [--lit:0.52]"
      style={{
        marginLeft: 93.5 - 144.5,
        marginTop: -31 - 103,
        background: "radial-gradient(closest-side, #18365F 0%, #245292 50%, #316FC5 100%)",
        filter: "blur(150px)",
      }}
    />
  );
}
