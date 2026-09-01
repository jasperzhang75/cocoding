"use client";

import Image from "next/image";
import { useEffect } from "react";
import { PARTNER_LOGOS } from "@/lib/trending-projects";
import { useInView, setLoopPlayState } from "@/lib/use-in-view";

/* Figma node 16710:20517 — 80px vertical padding, 40px logo height, and a
   128px fade at each edge. The design's fade is #0a0a0a; it uses the page
   background token here so the two can never drift apart.

   The track holds two identical runs and slides exactly -50%, so the second
   run is in the first one's place when the loop restarts — no visible seam. */

function LogoRun({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-16 pr-16"
    >
      {PARTNER_LOGOS.map((logo) => (
        <li key={logo.id} className="flex h-10 shrink-0 items-center">
          <Image
            src={logo.src}
            alt={ariaHidden ? "" : logo.name}
            width={logo.width}
            height={40}
            className="h-10 w-auto"
          />
        </li>
      ))}
    </ul>
  );
}

export default function LogoMarquee() {
  const { ref, inView } = useInView<HTMLElement>();
  useEffect(() => {
    setLoopPlayState(ref.current, inView);
  }, [ref, inView]);

  return (
    <section ref={ref} className="relative overflow-hidden py-20">
      <div data-loop className="marquee-track flex w-max">
        <LogoRun />
        <LogoRun ariaHidden />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent" />
    </section>
  );
}
