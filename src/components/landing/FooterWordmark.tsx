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
      the footer follows it — the push (decaying only slowly, over TAU,
      while fed, so for the first half second it is simply the finger's
      travel; a 320ms memory made the lift ramp for 0.4s and feel draggy)
      stretches a rubber band (see BAND below), so it gets harder the
      further it is — and it lets go the moment the stream turns into momentum: a
      trackpad's tail is a run of strictly decreasing deltas (MOMENTUM_RUN
      of them, counted from the first event at the end so a flick that
      arrives mid-tail still gets its bounce), while fingers still pushing
      jitter and mouse notches repeat. Let go, the push fades over
      TAU_RELEASE rather than vanishing, so the spring finishes its rise
      before it turns — the impulse's own amplitude, then the return —
      and the rest of the tail is ignored until a fresh flick (a delta at
      least twice the last, 10px+) or 90ms of quiet; 90ms with no push at
      all also lets go, the same way. The spring is stiff (ω ≈ 35: on
      the finger within a tenth of a second — Jasper found the ω 22 /
      ζ 0.5 version draggy and slow to follow), damped 0.7 on the way up
      (a hair of overshoot into the clipper's headroom) and 0.9 on the
      way back (a soft landing at the rest, never under it — a footer
      pushed down even a few px extends the page's scroll height,
      transforms count, and the end stops being the end).
      BAND (Jasper 2026-10-15: "允许这个部分还能被拉的更高一些 ... 不是很
      符合真实的物理手感"): the lift is the platforms' own rubber-band
      curve, band * (1 - 1 / (1 + give * pull / band)) — it follows GIVE
      of the first pixels and less the further it goes, tending to the
      band's limit (BAND_VH of the viewport) without a wall. It was an
      exponential saturating at 0.654em (163px at 250, 48 on a phone),
      the hidden half and a sliver: past about 300px of pull nothing
      moved, which read as hitting a stop. Small pulls are as before (a
      mouse notch 48, a gentle swipe ~70); a hard pull goes on giving,
      the dark under the word growing. Same day, "还要加强": the band
      went from 0.45 of the viewport to 0.8 and the push's memory while
      fed from 800ms to 1500, so a long pull keeps building — at 1280 x
      800 a hard trackpad swipe lifts ~308 (159 before the band, 218 at
      0.45), a long hard pull ~357 (161, 233); a phone's 400px drag 166
      (47, 139). MAX_STEP came down to 70 so a mouse notch stays 48.
      RIDERS: pulls that high would carry the footer's columns over the
      closing call's button (only 364px of room at 1440 x 900), so the
      closing section ([data-footer-pull]) rides up with the footer —
      the bottom of the page stretches as one, like the platform's own
      bounce, and only the word's lower half and the dark under it are
      new. Its top is above the viewport at the page's end at every
      size, so what it slides over is never on screen.
      Touch (Jasper 2026-09-08, "mobile 上向上拉他下半部分不显示"): a drag
      that STARTS at the page's end and moves up is ours — its first
      touchmove is cancelled — and the lift follows the finger through
      the same band (GIVE_TOUCH, iOS's 0.55: a finger travels far) into
      the same spring; letting go springs back. A drag down with nothing
      lifted is left to the platform.
      THE ONE BOUNCE (2026-10-22, Jasper: "拖动始终很奇怪 不像是自然的有惯
      性的 ... 被拖上来然后又回弹回去 ... 流畅感优先"): until now the
      platform's own rubber band ran UNDER all this — a trackpad or a
      finger at the end bounced the whole page the platform's way while
      the footer bounced its own way on top, two springs with two
      timings, and on a phone a swipe reaching the end mid-flight got
      the platform's bounce (no lower half) where a drag got ours. The
      root's overscroll-behavior is none now (globals.css), so this is
      the page's only bounce, and it covers what the platform used to:
      ARRIVING WITH SPEED — a flick whose momentum carries the page to
      the end with no wheel stream behind it (a finger's flick; wheel
      momentum already feeds the push event by event) leaves a push of
      ARRIVAL ms of its arriving speed, so it lifts and springs back
      like the platform's bounce did; and a finger that reaches the end
      mid-drag is taken from there (the page simply stops under it
      otherwise). The reveal fade (1.) was suspected and is innocent:
      its opacity only moves with scroll events and reads 1 whenever the
      footer is lifted. */

/* 2026-10-22, with the one bounce in place (Jasper: "现在手感是对的 但是我要求
   他能拉到的高度要比现在高70%"): the band and both gives are 1.7x what they
   were (0.8 / 0.8 / 0.55) — scaling both scales every lift by exactly
   1.7 with the curve's shape, i.e. the feel, unchanged: a notch ~82 (48),
   a hard trackpad swipe ~520 at 1280 x 800 (306), a hard flick's bounce
   ~310 (181), a phone's 400px drag ~280 (166). */
const BAND_VH = 1.36; // the band's limit: the lift tends to this share of the viewport's height and never reaches it
const GIVE = 1.36; // how much of the wheel's first pixels the footer follows (the slope at rest)
const GIVE_TOUCH = 0.935; // a finger's (1.7x iOS's own rubber-band coefficient, 0.55)
const TAU = 1500; // ms — the push's decay while it is still being fed: long, so a pull reads as finger travel and a long one keeps building
const TAU_RELEASE = 40; // ms — its fade once let go (the spring is fast enough now to finish a flick's rise first)
const MIN_STEP = 4; // smaller wheel deltas are momentum crumbs, not a pull
const MAX_STEP = 70; // one event counts at most this much: a mouse notch (100) lifts ~48px, not 58 (Jasper)
const MOMENTUM_RUN = 5; // strictly decreasing deltas in a row at the end = momentum: let go
const LET_GO = 90; // ms without a push
const STIFFNESS = 1200; // the spring toward the target, 1/s² (ω ≈ 35: on the finger within ~0.1s)
const ZETA_UP = 0.7; // damping ratio rising: quick, a hair of overshoot
const ZETA_DOWN = 0.9; // damping ratio returning: a soft landing
const ARRIVAL = 150; // ms — a flick arriving at the end keeps pushing for this long of its speed (1 px/ms -> a 150px push)
const ARRIVAL_MIN = 0.3; // px/ms — slower arrivals (a drag easing to a stop) leave no push

export default function FooterWordmark() {
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    const footer = box?.closest("footer");
    const clipper = footer?.parentElement;
    if (!box || !word || !footer || !clipper) return;
    // what the pull lifts: the footer, and the closing call above it (RIDERS)
    const riders = [footer, ...document.querySelectorAll<HTMLElement>("[data-footer-pull]")];
    const lift = (px: number) => {
      for (const el of riders) el.style.transform = px ? `translateY(${-px}px)` : "";
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      word.style.opacity = "1";
      return;
    }

    /* 1. dark -> bright with the reveal */
    let band = 0; // the lift's limit (px)
    let headroom = 0; // the clipper's room above the footer: the band and the spring's overshoot
    const light = () => {
      const fs = parseFloat(getComputedStyle(box).fontSize);
      const r = box.getBoundingClientRect();
      // the window is the top 0.716em of the line box; +1 for the footer's
      // half-pixel border, which leaves the page's end 0.5px under the viewport's
      const t = Math.min(1, Math.max(0, (innerHeight - r.top + 1) / (0.716 * fs)));
      word.style.opacity = String(t);
      band = BAND_VH * innerHeight;
      headroom = parseFloat(getComputedStyle(clipper).paddingTop) || 0;
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
    let touchY0 = 0; // where a drag at the end began
    let touching = false; // a finger is down
    let touchPulling = false; // this drag is ours
    let touchTarget = 0; // the lift the finger asks for (px)
    let pull = 0; // the spring's position (px up)
    let vel = 0;
    let last = 0;
    let raf = 0;
    /* the rubber band: the lift for x px of pull, following `give` of it at
       first and less the further it goes, tending to the band's limit */
    const stretch = (x: number, give: number) => band * (1 - 1 / (1 + (give * x) / band));
    const atEnd = () => {
      const d = document.scrollingElement ?? document.documentElement;
      return d.scrollTop + innerHeight >= d.scrollHeight - 1;
    };
    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 1000;
      last = now;
      push *= Math.exp(-(dt * 1000) / (released || now - pushedAt > LET_GO ? TAU_RELEASE : TAU));
      if (push < 1) push = 0;
      const target = Math.max(stretch(push, GIVE), touchTarget);
      const damping = 2 * (target > pull ? ZETA_UP : ZETA_DOWN) * Math.sqrt(STIFFNESS);
      // a stiff spring wants small steps: integrate in ≤ 8ms substeps
      const n = Math.ceil(dt / 0.008);
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        vel += (STIFFNESS * (target - pull) - damping * vel) * h;
        pull += vel * h;
      }
      if (!push && !touchTarget && Math.abs(pull) < 0.2 && Math.abs(vel) < 2) {
        pull = vel = 0;
        lift(0);
        raf = 0;
        return;
      }
      // never under the rest (see above), never past the clipper's headroom
      const up = Math.min(Math.max(pull, 0), headroom);
      lift(up);
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
      push += Math.min(dy, MAX_STEP);
      pushedAt = t;
      start();
    };
    addEventListener("wheel", onWheel, { passive: true });

    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY0 = e.touches[0].clientY;
      touching = true;
      touchPulling = atEnd();
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (!touchPulling) {
        // a drag that reaches the end mid-gesture: the page stops under
        // the finger (the platform's bounce is off), so take it from here
        if (atEnd() && y < touchY0) {
          touchPulling = true;
          touchY0 = y;
        }
        return;
      }
      const d = touchY0 - y; // finger up = positive
      if (d <= 0 && pull < 0.5) {
        touchPulling = false; // a drag down from rest: the platform scrolls
        return;
      }
      e.preventDefault();
      touchTarget = stretch(Math.max(0, d), GIVE_TOUCH);
      start();
    };
    const onTouchEnd = () => {
      touching = false;
      touchPulling = false;
      touchTarget = 0; // let go: the spring returns
      start();
    };
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("touchend", onTouchEnd);
    addEventListener("touchcancel", onTouchEnd);

    /* 3. arriving at the end with speed (see THE ONE BOUNCE): a flick's
       momentum, with no wheel stream behind it and no finger down */
    let scrollY0 = window.scrollY;
    let scrollT0 = performance.now();
    let vPrev = 0; // the speed over the interval before the last: the last step into the end is cut short by the end itself
    let wasAtEnd = atEnd();
    const onScroll = () => {
      const t = performance.now();
      const v = (window.scrollY - scrollY0) / Math.max(1, t - scrollT0); // px/ms, down positive
      scrollY0 = window.scrollY;
      scrollT0 = t;
      const end = atEnd();
      const speed = Math.max(v, vPrev);
      vPrev = v;
      if (end && !wasAtEnd && speed >= ARRIVAL_MIN && !touching && t - lastAt > LET_GO) {
        push += speed * ARRIVAL;
        pushedAt = t;
        start();
      }
      wasAtEnd = end;
    };
    addEventListener("scroll", onScroll, { passive: true });

    return () => {
      removeEventListener("scroll", light);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", light);
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("touchcancel", onTouchEnd);
      if (raf) cancelAnimationFrame(raf);
      lift(0);
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
