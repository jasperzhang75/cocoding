"use client";

import Image from "next/image";
import { Fragment, useEffect } from "react";
import { PARTNER_LOGOS } from "@/lib/trending-projects";
import { useInView, setLoopPlayState } from "@/lib/use-in-view";

/* Figma node 16710:20517 — 80px vertical padding, a 40px logo row, and a
   128px fade at each edge. The design's fade is #0a0a0a; it uses the page
   background token here so the two can never drift apart. Each logo keeps
   the size of its Figma export, centered in the row.

   The track holds two identical runs and slides exactly -50%, so the second
   run is in the first one's place when the loop restarts — no visible seam.
   That only holds while one run is at least as wide as the screen: a
   narrower run left an empty strip at the right edge just before each
   restart (388px at 1440 with the earlier six logos). So a run repeats the
   logo set COPIES times, enough to cover a 2560px screen, and the
   duration follows the run's length so the speed stays the 26px/s the
   earlier run had (1052px in 40s). Only the first set is named for
   assistive tech; every repeat is hidden from it. */

const GAP = 64; // gap-16, and the run's trailing pr-16
const SET_WIDTH = PARTNER_LOGOS.reduce((w, logo) => w + logo.width + GAP, 0);
const COPIES = Math.ceil(2560 / SET_WIDTH);
const SPEED = 1052 / 40; // px per second
const DURATION = (SET_WIDTH * COPIES) / SPEED;

function LogoRun({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-16 pr-16"
    >
      {Array.from({ length: COPIES }, (_, copy) => (
        <Fragment key={copy}>
          {PARTNER_LOGOS.map((logo) => (
            <li key={logo.id} className="flex h-10 shrink-0 items-center">
              {/* an empty alt takes a repeat out of the accessibility tree */}
              <Image
                src={logo.src}
                alt={ariaHidden || copy > 0 ? "" : logo.name}
                width={logo.width}
                height={logo.height}
              />
            </li>
          ))}
        </Fragment>
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
      <div data-loop className="marquee-track flex w-max" style={{ animationDuration: `${DURATION}s` }}>
        <LogoRun />
        <LogoRun ariaHidden />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent" />
    </section>
  );
}
