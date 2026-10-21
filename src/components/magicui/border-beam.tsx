"use client";

import { cn } from "@/lib/utils";
import { motion, type MotionStyle, type Transition } from "motion/react";

/* Magic UI's Border Beam (magicui.design/docs/components/border-beam),
   brought in 2026-10-21 for the hero's announcement badge — Jasper found
   the hand-made conic sweep "不够丝滑". A gradient square rides the
   element's border on an `offset-path: rect(...)` — one pace all the way
   round, the motion library driving it — and a mask keeps only the
   border's width of it. Browsers without `offset-path: rect()` get
   nothing rather than a square stuck in a corner (the @supports guard);
   reduced motion hides it too. */
interface BorderBeamProps {
  /** the beam's length along the border */
  size?: number;
  /** one lap, in seconds */
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  /** where on the lap it starts, 0-100 */
  initialOffset?: number;
  /** the border's width, which is all of the beam that shows */
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden rounded-[inherit] border-(length:--border-beam-width) border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] supports-[offset-path:rect(0_auto_auto_0)]:block motion-reduce:hidden"
      style={{ "--border-beam-width": `${borderWidth}px` } as React.CSSProperties}
    >
      <motion.div
        className={cn("absolute aspect-square", "bg-gradient-to-l from-(--color-from) via-(--color-to) to-transparent", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse ? [`${100 - initialOffset}%`, `${-initialOffset}%`] : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay, ...transition }}
      />
    </div>
  );
};
