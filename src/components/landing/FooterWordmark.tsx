"use client";

import { useEffect, useRef } from "react";

/* THE WORDMARK at the page's end (Figma 16555:16756): "cocoding" in
   Montserrat Black, 250px at the design's width, blue fading to white,
   standing in a window 0.716em tall — the page ends across the middle
   of the letters (the footer's overflow clip cuts the rest).

   Two motions, both Jasper's (2026-09-07):
   1. Pulled into view it goes from dark to bright: its opacity follows
      the share of its window the viewport has uncovered, eased by a
      0.9s transition so a flick still reads as a gradual glow.
   2. At the page's end a hard pull (wheel down with nothing left to
      scroll) drags the word up out of its slot, showing the cut lower
      half — up to where the dot of the i would touch the link columns —
      and it snaps back when the pull lets go. Rubber band: the push
      decays while the wheel keeps coming (TAU), its reach saturates (K),
      a lightly damped spring follows; 90ms without a real wheel event
      (a trackpad's dwindling momentum tail counts as none) is the let-go
      and the spring settles in about half a second, dipping a little
      under the cut on the way. Wheel only; touch keeps the platform's
      own bounce. */

const TAU = 320; // ms — how long a push is remembered while the wheel keeps turning
const K = 300; // px of push for 63% of the reach
const MIN_STEP = 4; // smaller wheel deltas are a momentum tail, not a pull
const LET_GO = 90; // ms without a pull
const STIFFNESS = 260; // the spring toward the target, 1/s² (ω ≈ 16)
const DAMPING = 19; // ζ ≈ 0.6: a 10% overshoot

export default function FooterWordmark() {
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    if (!box || !word) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      word.style.opacity = "1";
      return;
    }

    /* 1. dark -> bright with the reveal */
    let reach = 0; // how far the word may be pulled up (px)
    const light = () => {
      const r = box.getBoundingClientRect();
      // +1: the footer's half-pixel border leaves its end 0.5px under the viewport's
      const t = Math.min(1, Math.max(0, (innerHeight - r.top + 1) / r.height));
      word.style.opacity = String(t);
      // the hidden part is 0.504em (1.22 line box - 0.716 window); the
      // highest ink — the dot of the i — starts 0.147em under the line
      // box's top (the d's ascender 0.226em) and the window sits 37px
      // under the columns: stop 4px short of them. 70px at the design's
      // 250: the o's bottoms clear the cut, the g's tail stays in it.
      const fs = parseFloat(getComputedStyle(box).fontSize);
      reach = Math.min(0.504 * fs, 0.147 * fs + 33);
    };
    light();
    addEventListener("scroll", light, { passive: true });
    addEventListener("resize", light);

    /* 2. the pull at the page's end */
    let push = 0; // accumulated wheel travel, decaying
    let pushedAt = 0; // when the wheel last pulled
    let pull = 0; // the spring's position (px up)
    let vel = 0;
    let last = 0;
    let raf = 0;
    const atEnd = () => {
      const d = document.scrollingElement ?? document.documentElement;
      return d.scrollTop + innerHeight >= d.scrollHeight - 1;
    };
    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 1000;
      last = now;
      if (now - pushedAt > LET_GO) push = 0;
      else push *= Math.exp(-(dt * 1000) / TAU);
      const target = reach * (1 - Math.exp(-push / K));
      vel += (STIFFNESS * (target - pull) - DAMPING * vel) * dt;
      pull += vel * dt;
      if (!push && Math.abs(pull) < 0.2 && Math.abs(vel) < 2) {
        pull = vel = 0;
        word.style.transform = "";
        raf = 0;
        return;
      }
      // the band has a stop at the columns; below the cut nothing shows anyway
      word.style.transform = `translateY(${-Math.min(pull, reach)}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      if (dy >= MIN_STEP && atEnd()) {
        push += dy;
        pushedAt = performance.now();
        if (!raf) {
          last = pushedAt;
          raf = requestAnimationFrame(tick);
        }
      } else if (dy < 0) {
        push = 0; // scrolling away lets go
      }
    };
    addEventListener("wheel", onWheel, { passive: true });

    return () => {
      removeEventListener("scroll", light);
      removeEventListener("resize", light);
      removeEventListener("wheel", onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="mt-[37px] h-[0.716em] text-center text-[min(250px,20.8vw)] leading-[1.22] font-black tracking-[-0.04em] select-none"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <span
        ref={wordRef}
        data-wordmark
        className="inline-block bg-clip-text text-transparent will-change-[transform,opacity]"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(13,56,177,0.75) 0%, #FFFFFF 79%)",
          transition: "opacity 0.9s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        cocoding
      </span>
    </div>
  );
}
