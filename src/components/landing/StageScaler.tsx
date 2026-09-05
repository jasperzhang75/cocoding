"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* The desktop bento is laid out in a fixed 1200x1074 coordinate space.
   From lg (1024) the desktop rules apply, but the viewport is narrower
   than the design until xl, so the whole stage scales down to the width
   available — the same move PosterViewport makes for a single card's
   art, applied to the entire canvas. At and above the design width the
   stage is untouched and centers itself. Below lg the tablet layout is
   in flow and nothing here applies. */
export default function StageScaler({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number;
  designHeight: number;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = wrap?.firstElementChild as HTMLElement | null;
    if (!wrap || !stage) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      const k = wrap.clientWidth / designWidth;
      if (!mq.matches || k >= 1) {
        wrap.style.removeProperty("height");
        stage.style.removeProperty("transform");
        stage.style.removeProperty("transform-origin");
        return;
      }
      wrap.style.height = `${designHeight * k}px`;
      stage.style.transformOrigin = "top left";
      stage.style.transform = `scale(${k})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    mq.addEventListener("change", apply);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, [designWidth, designHeight]);

  return <div ref={wrapRef}>{children}</div>;
}
