"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* The mobile strategy for the Features cards ("text + poster"): every
   card's artwork lives in a fixed 600px-wide coordinate space — masks,
   vectors and animations are all pinned to it — so instead of refloating
   anything we scale the whole stage.

   Pass-through is decided by POSITIONING, not width: at lg the className
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
        /* desktop: the wrapper fills the card. From lg to xl the card is
           narrower than the 600px design while its copy keeps its size, so
           the art alone scales down, anchored to the card's bottom-left:
           its bottom and side edges stay on the card's, and the room it
           gives up opens between the copy and the art. */
        wrap.style.removeProperty("height");
        // measure the CARD (the wrapper's offset parent): the wrapper sits
        // inside the card's 1px border, so its own width is 598 at the
        // 600px design and would read as a scale of 0.997
        const card = wrap.offsetParent as HTMLElement | null;
        const kd = (card ? card.offsetWidth : wrap.clientWidth) / 600;
        if (kd >= 0.999) {
          stage.style.removeProperty("transform");
          stage.style.removeProperty("transform-origin");
        } else {
          stage.style.transformOrigin = "left bottom";
          stage.style.transform = `scale(${kd})`;
        }
        return;
      }
      stage.style.removeProperty("transform-origin");
      const k = wrap.clientWidth / 600;
      /* The crop trims the design's headroom so a shrunken poster still
         reads. It must FADE OUT as the stage approaches 1:1 — at ~600px
         wide (a single base column on a large phone/small tablet) the art
         is essentially full size, and cropping 120-150px off the top there
         would slice away the subject. */
      const cropK = crop * Math.min(1, Math.max(0, (1 - k) / 0.25));
      wrap.style.height = `${(designHeight - cropK) * k}px`;
      stage.style.transform = `translateY(${-cropK * k}px) scale(${k})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    /* crossing lg flips the wrapper between flow and absolute without
       necessarily changing its width, which ResizeObserver would miss */
    const mq = window.matchMedia("(min-width: 1024px)");
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
