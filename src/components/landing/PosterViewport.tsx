"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* The mobile strategy for the Features cards ("text + poster"): every
   card's artwork lives in a fixed 600px-wide coordinate space — masks,
   vectors and animations are all pinned to it — so instead of refloating
   anything we scale the whole stage.

   Pass-through is decided by POSITIONING, not width: at xl the className
   makes this wrapper `absolute inset-0` over the card's fixed 600x-H box,
   so the stage sits unscaled and the desktop geometry is byte-identical.
   Anywhere else the wrapper is in flow, and the stage scales by width/600
   (origin top-left), shifted up by `crop` to trim the design's headroom,
   with the wrapper's height following the scaled art.

   Width alone is NOT a safe test: at ~1270-1279px (and ~637-767px) the
   flowed wrapper measures 596-599px, which any near-600 threshold reads
   as "desktop" — it would then drop the explicit height and collapse the
   poster to zero. */

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
      if (getComputedStyle(wrap).position === "absolute") {
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
    /* crossing xl flips the wrapper between flow and absolute without
       necessarily changing its width, which ResizeObserver would miss */
    const mq = window.matchMedia("(min-width: 1280px)");
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
