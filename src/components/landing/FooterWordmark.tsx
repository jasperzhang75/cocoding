"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/* THE WORDMARK at the page's end (Figma 16555:16756): "cocoding" in
   Montserrat Black, 250px at the design's width, blue fading to white,
   standing in a window 0.716em tall — the page ends across the middle
   of the letters (the footer's overflow clip cuts the rest).

   Two motions, both Jasper's (2026-09-07):
   1. Pulled into view it goes from dark to bright: its opacity follows
      the share of its window the viewport has uncovered, eased by a
      0.9s transition so a flick still reads as a gradual glow.
   2. At the page's end a hard pull (wheel down with nothing left to
      scroll) lifts the WHOLE footer — columns and word together, their
      spacing untouched — and the word's cut lower half rises from under
      the page's end. Nothing in flow can paint below the page's end
      without lengthening it (overflow-clip-margin does, clip-path does),
      so the hidden half is a second copy of the word in a FIXED strip at
      the viewport's bottom, the footer's width and type, its line box
      pulled up by the 0.716em window: the strip's top rides on the
      footer's bottom edge, so the copy's letters sit exactly under the
      real ones, and at rest the strip is wholly below the viewport. It
      is portaled to <body>: inside the footer, the footer's transform
      would become its containing block and move it twice.
      Rubber band as an IMPULSE, like the platform's own: the wheel travel
      of the first 200ms after the page's end is hit (IMPULSE) is the
      push, saturating (K) at the hidden half; what follows in the same
      stream — a trackpad's momentum tail runs for a second or two — is
      ignored, so 90ms after the window closes the pull lets go and a
      lightly damped spring brings the footer back in ~0.4s. A fresh
      flick inside the tail (a delta at least twice the last, 10px+) or a
      stream after 90ms of quiet is a new impulse; a stream that begins
      before the end starts its window at its first event AT the end.
      Without this the lift rode the whole tail and the footer hung open
      for seconds after a fast flick. The lift never goes under the rest:
      a footer pushed down by even a few px extends the page's scroll
      height (transforms count), the end is no longer the end, and the
      tail re-armed itself. Wheel only; touch keeps the platform's own
      bounce. */

const IMPULSE = 200; // ms of wheel travel that count as the push
const TAU = 320; // ms — the push's decay while it is still being fed
const K = 300; // px of push for 63% of the reach
const MIN_STEP = 4; // smaller wheel deltas are momentum crumbs, not a pull
const LET_GO = 90; // ms without a counted push
const STIFFNESS = 360; // the spring toward the target, 1/s² (ω ≈ 19)
const DAMPING = 23; // ζ ≈ 0.6: a 10% overshoot (clamped at the rest), settled in ~0.4s
const subscribeNothing = () => () => {};

export default function FooterWordmark() {
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  // false in the server render, true on the client: the portal needs document
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    const strip = stripRef.current;
    const footer = box?.closest("footer");
    if (!box || !word || !strip || !footer) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      word.style.opacity = "1";
      return;
    }

    /* 1. dark -> bright with the reveal */
    let reach = 0; // the hidden half: how far the footer may be pulled up (px)
    const light = () => {
      const r = box.getBoundingClientRect();
      // +1: the footer's half-pixel border leaves its end 0.5px under the viewport's
      const t = Math.min(1, Math.max(0, (innerHeight - r.top + 1) / r.height));
      word.style.opacity = String(t);
      // 0.504em: the 1.22 line box less the 0.716 window (126 at 250; the
      // g's tail ends 12 above the line box's bottom)
      reach = 0.504 * parseFloat(getComputedStyle(box).fontSize);
    };
    light();
    addEventListener("scroll", light, { passive: true });
    addEventListener("resize", light);

    /* 2. the pull at the page's end — the footer moves, the word with it */
    let push = 0; // accumulated wheel travel, decaying
    let pushedAt = 0; // when the wheel last pulled
    let streamAt = 0; // when this impulse began
    let lastAt = 0; // the last wheel event of any size that counts as the stream
    let lastDy = 0; // its delta, for the fresh-flick test
    let pull = 0; // the spring's position (px up)
    let vel = 0;
    let last = 0;
    let raf = 0;
    let seam = 0; // translate that puts the strip's top on the footer's resting bottom edge
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
        footer.style.transform = "";
        strip.style.transform = "translateY(100%)";
        raf = 0;
        return;
      }
      const lift = Math.max(pull, 0); // never under the rest (see above)
      footer.style.transform = `translateY(${-lift}px)`;
      strip.style.transform = `translateY(${seam - lift}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      if (dy < 0) {
        push = 0; // scrolling away lets go
        streamAt = 0;
        return;
      }
      if (dy < MIN_STEP) return; // a crumb: not part of any stream
      const t = performance.now();
      // the stream is timed from every event, at the end or not; quiet or a
      // fresh flick starts a new one, whose impulse begins at its first
      // event AT the end
      if (t - lastAt > LET_GO || dy >= Math.max(10, 2 * lastDy)) streamAt = 0;
      lastAt = t;
      lastDy = dy;
      if (!atEnd()) return;
      if (!streamAt) streamAt = t;
      if (t - streamAt > IMPULSE) return; // the tail: ignored
      push += dy;
      pushedAt = t;
      if (!raf) {
        last = pushedAt;
        // the strip's box rests at the viewport's bottom (bottom: 0), its
        // top one strip-height up; move it down so its top is the edge
        const r = strip.getBoundingClientRect();
        seam = footer.getBoundingClientRect().bottom - innerHeight + r.height;
        raf = requestAnimationFrame(tick);
      }
    };
    addEventListener("wheel", onWheel, { passive: true });

    return () => {
      removeEventListener("scroll", light);
      removeEventListener("resize", light);
      removeEventListener("wheel", onWheel);
      if (raf) cancelAnimationFrame(raf);
      footer.style.transform = "";
    };
  }, [mounted]);

  const type = "text-center text-[min(250px,20.8vw)] leading-[1.22] font-black tracking-[-0.04em] select-none";
  const gradient = "linear-gradient(180deg, rgba(13,56,177,0.75) 0%, #FFFFFF 79%)";
  return (
    <>
      <div ref={boxRef} aria-hidden className={`mt-[37px] h-[0.716em] ${type}`} style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
        <span
          ref={wordRef}
          data-wordmark
          className="inline-block bg-clip-text text-transparent will-change-[opacity]"
          style={{ backgroundImage: gradient, transition: "opacity 0.9s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
        >
          cocoding
        </span>
      </div>
      {/* the hidden half: a fixed strip 0.504em tall at the viewport's bottom,
          the footer's paddings and container so the copy lands under the
          original; off-screen (translateY 100%) until a pull rides it up.
          In <body>, not the footer (see above). */}
      {mounted &&
        createPortal(
          <div
            ref={stripRef}
            aria-hidden
            className={`pointer-events-none fixed inset-x-0 bottom-0 h-[0.504em] overflow-hidden px-5 md:px-10 ${type}`}
            style={{ fontFamily: "var(--font-montserrat), sans-serif", transform: "translateY(100%)" }}
          >
            <div className="mx-auto -mt-[0.716em] w-full max-w-[1200px]">
              <span data-wordmark-under className="inline-block bg-clip-text text-transparent" style={{ backgroundImage: gradient }}>
                cocoding
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
