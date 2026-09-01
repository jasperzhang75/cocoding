"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* The mobile strategy for the Features cards ("text + poster"): every
   card's artwork lives in a fixed 600px-wide coordinate space — masks,
   vectors and animations are all pinned to it — so instead of refloating
   anything we scale the whole stage.

   - md and up: this wrapper is a pass-through (md:absolute md:inset-0 via
     className); the stage sits unscaled at the card's own size, so the
     desktop geometry is byte-identical to before.
   - below md: the wrapper joins the flow at full width, measures itself,
     and scales the stage by width/600 (origin top-left), shifting it up by
     `crop` to trim the design's empty headroom. Wrapper height follows,
     so the card wraps the scaled art exactly. */

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

    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      if (mq.matches) {
        wrap.style.removeProperty("height");
        stage.style.removeProperty("transform");
        return;
      }
      const k = wrap.clientWidth / 600;
      wrap.style.height = `${(designHeight - crop) * k}px`;
      stage.style.transform = `translateY(${-crop * k}px) scale(${k})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    mq.addEventListener("change", apply);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", apply);
    };
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
