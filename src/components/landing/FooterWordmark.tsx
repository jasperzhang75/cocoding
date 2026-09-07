"use client";

import { useEffect, useRef } from "react";

/* THE WORDMARK at the page's end (Figma 16555:16756): "cocoding" in
   Montserrat Black, 250px at the design's width (--wordmark-size, set on
   the clipper in Footer: 20.8% of the container), blue fading to white,
   whole in the footer's flow — the page ends 0.716em into its 1.22em
   line box, across the middle of the letters (the clipper around the
   footer does the cutting, see Footer).

   Two motions, both Jasper's (2026-09-07):
   1. Pulled into view it goes from dark to bright: its opacity follows
      the share of its 0.716em window the viewport has uncovered, eased
      by a 0.9s transition so a flick still reads as a gradual glow.
   2. At the page's end a hard pull (wheel down with nothing left to
      scroll) lifts the WHOLE footer — columns and word together, their
      spacing untouched — inside the clipper, and the word's cut lower
      half rises from under the page's end. One element, one word: an
      earlier version showed the lower half from a second copy in a fixed
      strip, and the platform's own rubber band moved the page and the
      strip apart — the word split. Nothing in flow can paint below the
      page's end without lengthening it (overflow-clip-margin does,
      clip-path does); folding the footer's bottom under a clipping
      parent is what works.
      Rubber band, like the platform's own (Jasper 2026-09-07: "正常惯性的
      拉上去然后又松开恢复正常"): while the wheel keeps pushing at the end
      the footer follows it — the push (decaying over TAU while fed)
      saturates into the lift (K), so it gets harder the further it is —
      and it lets go the moment the stream turns into momentum: a
      trackpad's tail is a run of strictly decreasing deltas (MOMENTUM_RUN
      of them, counted from the first event at the end so a flick that
      arrives mid-tail still gets its bounce), while fingers still pushing
      jitter and mouse notches repeat. Let go, the push fades over
      TAU_RELEASE rather than vanishing, so the spring finishes its rise
      before it turns — the impulse's own amplitude, then the return —
      and the rest of the tail is ignored until a fresh flick (a delta at
      least twice the last, 10px+) or 90ms of quiet; 90ms with no push at
      all also lets go, the same way. The spring
      is lively on the way up (ζ 0.5, so it overshoots a touch into the
      clipper's headroom) and near-critically damped on the way back
      (ζ 0.9: a soft landing at the rest, never under it — a footer pushed
      down even a few px extends the page's scroll height, transforms
      count, and the end stops being the end). The reach is a little past
      the hidden half, so a hard pull shows a sliver of dark under the
      word. Wheel only; touch keeps the platform's own bounce. */

const REACH_EM = 0.654; // how far the footer may be pulled: the hidden 0.504em and 0.15em of dark
const HEADROOM_EM = 0.72; // the clipper's headroom (Footer): the reach and the spring's overshoot
const TAU = 320; // ms — the push's decay while it is still being fed
const TAU_RELEASE = 90; // ms — its fade once let go
const K = 230; // px of push for 63% of the reach
const MIN_STEP = 4; // smaller wheel deltas are momentum crumbs, not a pull
const MOMENTUM_RUN = 5; // strictly decreasing deltas in a row at the end = momentum: let go
const LET_GO = 90; // ms without a push
const STIFFNESS = 480; // the spring toward the target, 1/s² (ω ≈ 22)
const ZETA_UP = 0.5; // damping ratio rising: lively, a small overshoot
const ZETA_DOWN = 0.9; // damping ratio returning: a soft landing

export default function FooterWordmark() {
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    const footer = box?.closest("footer");
    if (!box || !word || !footer) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      word.style.opacity = "1";
      return;
    }

    /* 1. dark -> bright with the reveal */
    let reach = 0; // how far the footer may be pulled up (px)
    let headroom = 0; // and how far it may overshoot
    const light = () => {
      const fs = parseFloat(getComputedStyle(box).fontSize);
      const r = box.getBoundingClientRect();
      // the window is the top 0.716em of the line box; +1 for the footer's
      // half-pixel border, which leaves the page's end 0.5px under the viewport's
      const t = Math.min(1, Math.max(0, (innerHeight - r.top + 1) / (0.716 * fs)));
      word.style.opacity = String(t);
      // the hidden half is 0.504em (the 1.22 line box less the 0.716
      // window: 126 at 250; the g's tail ends 12 above the line box's
      // bottom); the reach goes 0.15em past it, the headroom past that
      reach = REACH_EM * fs;
      headroom = HEADROOM_EM * fs;
    };
    light();
    addEventListener("scroll", light, { passive: true });
    addEventListener("resize", light);

    /* 2. the pull at the page's end — the footer moves, the word with it */
    let push = 0; // accumulated wheel travel, decaying
    let pushedAt = 0; // when the wheel last pulled
    let lastAt = 0; // the last wheel event of the stream, tail included
    let lastDy = 0; // its delta
    let runDown = 0; // strictly decreasing deltas in a row, at the end
    let released = false; // let go: the rest of this stream is momentum
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
      push *= Math.exp(-(dt * 1000) / (released || now - pushedAt > LET_GO ? TAU_RELEASE : TAU));
      if (push < 1) push = 0;
      const target = reach * (1 - Math.exp(-push / K));
      const damping = 2 * (target > pull ? ZETA_UP : ZETA_DOWN) * Math.sqrt(STIFFNESS);
      vel += (STIFFNESS * (target - pull) - damping * vel) * dt;
      pull += vel * dt;
      if (!push && Math.abs(pull) < 0.2 && Math.abs(vel) < 2) {
        pull = vel = 0;
        footer.style.transform = "";
        raf = 0;
        return;
      }
      // never under the rest (see above), never past the clipper's headroom
      const lift = Math.min(Math.max(pull, 0), headroom);
      footer.style.transform = `translateY(${-lift}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      if (dy < 0) {
        push = 0; // scrolling away lets go at once
        released = false;
        runDown = 0;
        return;
      }
      if (dy < MIN_STEP) return; // a crumb: not part of any stream
      const t = performance.now();
      const prevDy = lastDy;
      const quiet = t - lastAt > LET_GO; // a new stream
      lastAt = t;
      lastDy = dy;
      if (quiet) {
        released = false;
        runDown = 0;
      }
      if (!atEnd()) {
        runDown = 0; // the run that counts starts at the end
        return;
      }
      if (released) {
        if (dy < Math.max(10, 2 * prevDy)) return; // the tail: ignored
        released = false; // a fresh flick inside it
        runDown = 0;
      }
      runDown = !quiet && dy < prevDy ? runDown + 1 : 0;
      if (runDown >= MOMENTUM_RUN) {
        released = true; // momentum: let go (the push fades in tick)
        return;
      }
      push += dy;
      pushedAt = t;
      if (!raf) {
        last = pushedAt;
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
  }, []);

  return (
    /* the whole 1.22em line box; the clipper around the footer shows its top
       0.716em. Left-aligned: the design sets the word's box on the
       container's left edge, in line with the mark and the copyright
       (Jasper 2026-09-07 — it had been centered) */
    <div
      ref={boxRef}
      aria-hidden
      className="mt-[37px] text-left text-(length:--wordmark-size) leading-[1.22] font-black tracking-[-0.04em] select-none"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <span
        ref={wordRef}
        data-wordmark
        className="inline-block bg-clip-text text-transparent will-change-[opacity]"
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
