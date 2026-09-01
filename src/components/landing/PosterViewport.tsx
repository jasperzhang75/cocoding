"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* The mobile strategy for the Features cards ("text + poster"): every
   card's artwork lives in a fixed 600px-wide coordinate space — masks,
   vectors and animations are all pinned to it — so instead of refloating
   anything we scale the whole stage.

   Purely measurement-driven — no breakpoints in here:
   - container >= 600px wide (the xl bento, where className places it
     absolute inset-0 over the fixed card): pass-through, desktop geometry
     byte-identical.
   - container < 600px (base single column and the md two-up grid): the
     stage scales by width/600 (origin top-left), shifted up by `crop` to
     trim the design's headroom; wrapper height follows the scaled art. */

export default function PosterViewport({
  designHeight,
  crop = 0,
  className,
  children,
}: {
  /** full design height of the card's coordinate space */
  designHeight: number;
  /** how much of the design's top to trim on mobile */
  crop?: number;
  className?: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const apply = () => {
      const k = wrap.clientWidth / 600;
      /* at xl the wrapper is inset-0 INSIDE the card's 1px borders, so it
         measures 598 — treat near-1 as pass-through or the desktop bento
         would get a phantom 0.997 scale and its crop applied */
      if (k >= 0.99) {
        wrap.style.removeProperty("height");
        stage.style.removeProperty("transform");
        return;
      }
      wrap.style.height = `${(designHeight - crop) * k}px`;
      stage.style.transform = `translateY(${-crop * k}px) scale(${k})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [designHeight, crop]);

  return (
    <div ref={wrapRef} className={cn("relative w-full overflow-hidden", className)}>
      <div
        ref={stageRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 600, height: designHeight }}
      >
        {children}
      </div>
    </div>
  );
}
