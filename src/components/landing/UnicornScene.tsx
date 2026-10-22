"use client";

import { useEffect, useRef } from "react";
import { loadSdk, onFirstFrame, type Scene } from "./unicorn";

/* A UNICORN STUDIO SCENE AS A BACKGROUND: the closing call's (Jasper
   2026-10-22: "build the future 那个 section 背景去掉那个蓝色的光晕 加上这个
   unicorn studio") and the Infrastructure panel's (the same day, in place
   of its ambient glow), run in-page by the SDK the hero loads once
   (unicorn.ts). The host fills its positioned parent; it is black-on-
   nothing until the scene has drawn, then the canvas fades in over 1.2s
   (the glows these replace came up on arrival much the same way). The
   scene is created only once the host is within a viewport of the screen
   (an observer here, not the SDK's lazyLoad, so the hero's first-frame
   logic applies), so a scene far down the page costs nothing while the
   top is being read; dpi 1.5 like the hero by default, and a scene may
   ask for a lighter canvas on touch devices (`dpiTouch`: a phone's GPU
   renders every pass at that pixel ratio, and a soft blob needs no 3x
   sharpness — Jasper 2026-10-22: "infrastructure 部分的动画有点卡 尤其是到了
   integration 部分"); fps per scene. `?noscene` in the URL loads no scene
   at all, for telling a scene's cost apart on a device by hand. Reduced
   motion: nothing loads, the parent's own fill stays. */

const NEAR = "100% 0px"; // start a viewport early

export default function UnicornScene({
  projectId,
  fps = 60,
  dpi = 1.5,
  dpiTouch,
  className = "",
}: {
  projectId: string;
  fps?: number;
  dpi?: number;
  dpiTouch?: number; // on a coarse-pointer device (phone, tablet) instead of dpi
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (new URLSearchParams(location.search).has("noscene")) return;
    const pixelRatio = dpiTouch !== undefined && matchMedia("(pointer: coarse)").matches ? dpiTouch : dpi;
    let scene: Scene | null = null;
    let cancelPoll = () => {};
    let gone = false;
    const start = () => {
      loadSdk()
        .then((us) =>
          us.addScene({
            element: host,
            projectId,
            production: false, // fresh from the bucket every load (see HeroBackground, 1.)
            dpi: pixelRatio,
            fps,
            lazyLoad: false,
            interactivity: { mouse: { disableMobile: true } },
          })
        )
        .then((sc) => {
          if (gone) {
            sc.destroy?.();
            return;
          }
          scene = sc;
          if (sc.fallbackOnly) return; // no WebGL2: the parent's fill stays
          cancelPoll = onFirstFrame(sc, host, () => {
            host.style.opacity = "1";
          });
        })
        .catch(() => {
          /* the parent's fill stays */
        });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        start();
      },
      { rootMargin: NEAR }
    );
    io.observe(host);
    return () => {
      gone = true;
      io.disconnect();
      cancelPoll();
      scene?.destroy?.();
    };
  }, [projectId, fps, dpi, dpiTouch]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      data-unicorn
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[1200ms] ease-out ${className}`}
    />
  );
}
