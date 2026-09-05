"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PosterViewport from "./PosterViewport";
import { setLoopPlayState } from "@/lib/use-in-view";

/* Card 4 — built-in security, now interactive. Two states, both read from
   Figma (ON: 16629:18699, OFF: 17175:8667):

   ON  — green-gradient shield; a light-green inner shadow
         (inset 0 0 30px 3px #7BFFD3/25) breathes slowly at the card edge.
   OFF — the toggle knob slides left and the pill grays out (#B5B5B5/50);
         the shield fades to #65686D/82 (same silhouette, recolored through
         a mask); the breathing glow drains away; and behind the shield a
         soft-masked field of scrambling pass-codes appears (Geist Mono 14,
         #596684/40, group at 80%, clipped to the design's blurred blob).
         Codes are randomly generated, mixed-case + digits, in the design's
         "XXXXXXX XXXXXXX" shape, and keep scrambling while off.

   The blue glows stay in both states, per the layer trees. Reduced motion:
   no breathing, no scrambling, state switches are instant. */

const CELLS: Array<[number, number]> = [
  [69, 176], [224, 176], [379, 176], [534, 176],
  [24, 210], [179, 210], [334, 210], [489, 210],
  [41, 242], [196, 242], [351, 242], [506, 242],
  [6, 276], [161, 276], [316, 276], [471, 276],
  [-29, 310], [124, 310], [277, 310], [430, 310],
  [-64, 344], [91, 344], [246, 344], [401, 344],
  [-99, 378], [56, 378], [211, 378], [366, 378],
  [20, 412], [175, 412], [330, 412], [485, 412],
  [-54, 446], [101, 446], [256, 446], [411, 446],
];

const CODE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const randChar = () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
const randCode = () =>
  `${Array.from({ length: 7 }, randChar).join("")} ${Array.from({ length: 7 }, randChar).join("")}`;

export default function SecurityCard() {
  const [on, setOn] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const breatheRef = useRef<HTMLDivElement>(null);
  const grayShieldRef = useRef<HTMLDivElement>(null);
  const greenShieldRef = useRef<HTMLImageElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const maskProg = useRef({ k: 0 });
  const knobRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const scrambleId = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScramble = () => {
    const matrix = matrixRef.current;
    if (!matrix || scrambleId.current) return;
    const cells = [...matrix.querySelectorAll<HTMLElement>("[data-code]")];
    scrambleId.current = setInterval(() => {
      cells.forEach((el) => {
        let t = el.textContent ?? "";
        if (!t) return;
        for (let n = 0; n < 2; n++) {
          const i = Math.floor(Math.random() * t.length);
          if (t[i] === " ") continue;
          t = t.slice(0, i) + randChar() + t.slice(i + 1);
        }
        el.textContent = t;
      });
    }, 45);
  };

  // populate codes after mount (random content can't be server-rendered)
  useEffect(() => {
    matrixRef.current
      ?.querySelectorAll("[data-code]")
      .forEach((el) => (el.textContent = randCode()));
  }, []);

  // pause the breathing shimmer (and any active scramble) while off-screen
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setLoopPlayState(root, entry.isIntersecting);
        if (!entry.isIntersecting && scrambleId.current) {
          clearInterval(scrambleId.current);
          scrambleId.current = null;
        } else if (entry.isIntersecting && !on && !scrambleId.current) {
          startScramble();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [on]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0 : undefined;
    const breathe = breatheRef.current;
    const matrix = matrixRef.current;
    const maskEl = maskRef.current;
    if (!breathe || !matrix || !maskEl) return;

    /* the code field reveals by GROWING its soft mask from the center and
       hides by shrinking it back — the radii scale with k in [0,1] */
    const applyMask = () => {
      const { k } = maskProg.current;
      const img = `radial-gradient(ellipse ${250 * k}px ${138 * k}px at 296px 279px, black 58%, transparent 96%)`;
      maskEl.style.maskImage = img;
      maskEl.style.webkitMaskImage = img;
    };

    const stopScramble = () => {
      if (scrambleId.current) {
        clearInterval(scrambleId.current);
        scrambleId.current = null;
      }
    };

    if (on) {
      gsap.to(breathe, { autoAlpha: 1, duration: dur ?? 0.6 });
      gsap.to(grayShieldRef.current, { opacity: 0, duration: dur ?? 0.8 });
      gsap.to(greenShieldRef.current, { opacity: 1, duration: dur ?? 0.8 });
      // keep scrambling while the mask swallows the codes; stop only once
      // they are fully hidden (if the user flips back mid-shrink, the
      // overwrite kills this tween and the interval just keeps running)
      gsap.to(maskProg.current, {
        k: 0, duration: dur ?? 0.45, ease: "power2.in", overwrite: true,
        onUpdate: applyMask, onComplete: stopScramble,
      });
      gsap.to(knobRef.current, { x: 0, duration: dur ?? 0.25, ease: "power2.out" });
      gsap.to(pillRef.current, { backgroundColor: "#489C32", duration: dur ?? 0.25 });
    } else {
      gsap.to(breathe, { autoAlpha: 0, duration: dur ?? 1.1, ease: "power1.out" });
      gsap.to(grayShieldRef.current, { opacity: 1, duration: dur ?? 0.8 });
      gsap.to(greenShieldRef.current, { opacity: 0, duration: dur ?? 0.8 });
      gsap.to(maskProg.current, {
        k: 1, duration: dur ?? 0.6, ease: "power2.out", delay: reduced ? 0 : 0.1, overwrite: true, onUpdate: applyMask,
      });
      gsap.to(knobRef.current, { x: -12, duration: dur ?? 0.25, ease: "power2.out" });
      gsap.to(pillRef.current, { backgroundColor: "rgba(181,181,181,0.5)", duration: dur ?? 0.25 });
      if (!reduced) startScramble();
    }
  }, [on]);

  // unmount only — per-toggle stopping is handled by the shrink tween
  useEffect(() => () => {
    if (scrambleId.current) clearInterval(scrambleId.current);
  }, []);

  return (
    <div
      ref={rootRef}
      className="order-4 relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-md border border-white/[0.08] md:grow md:rounded-none md:rounded-bl-lg lg:block lg:grow-0 lg:absolute lg:left-0 lg:top-[610px] lg:h-[464px] lg:w-1/2 lg:max-w-none"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)), linear-gradient(90deg, #000, #000)",
      }}
    >
      {/* breathing light-green inner shadow (ON state). The fade lives on
          this wrapper — the inner CSS breathe animation owns its own
          opacity and would override a fade applied to the same element,
          which is what made the glow vanish in a snap. */}
      <div ref={breatheRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div
          data-loop
          className="security-breathe absolute inset-0 rounded-md md:rounded-none md:rounded-bl-xl"
          style={{ boxShadow: "inset 0 0 30px 3px rgba(123,255,211,0.45)" }}
        />
      </div>

      {/* the pair of blur-250 glows — the card's blue field. Card-level (not
          in the poster) so the mobile top-crop can't clip them: at base they
          cover the whole card; from md up they sit at the design geometry. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-md md:rounded-none md:rounded-bl-lg lg:overflow-visible">
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 lg:left-[-99px] lg:top-[77px] lg:h-[523px] lg:w-[789px] lg:translate-x-0 lg:translate-y-0">
          {(["/features/f4-glow-a.svg", "/features/f4-glow-b.svg"] as const).map((src) => (
            <div key={src} className="absolute inset-0">
              <div className="absolute" style={{ inset: "-47.8% -31.69%" }}>
                <Image src={src} alt="" fill className="max-w-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-7 pb-6 pt-8 lg:absolute lg:left-[33px] lg:right-[71px] lg:top-[35px] lg:p-0">
        <p className="pr-12 text-body-md text-text-primary lg:pr-0 lg:text-heading-sm">Built-in security, by default</p>
        <p className="mt-3 text-balance text-body-sm text-text-body lg:max-w-full lg:text-wrap lg:text-body-md lg:w-[394px]">
          With robust security safeguards already in place, your data and user information stay protected as you build.
        </p>
      </div>

      <PosterViewport designHeight={464} crop={130} className="md:mt-auto lg:mt-0 lg:absolute lg:inset-0">
      {/* scrambling pass-codes, clipped to the design's soft blob (OFF).
          Outer div = show/hide (animated); inner keeps the design's 80%. */}
      <div ref={matrixRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div
          ref={maskRef}
          className="absolute inset-0 opacity-80"
          style={{
            maskImage:
              "radial-gradient(ellipse 0px 0px at 296px 279px, black 58%, transparent 96%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 0px 0px at 296px 279px, black 58%, transparent 96%)",
          }}
        >
          {CELLS.map(([x, y], i) => (
            <p
              key={i}
              data-code
              suppressHydrationWarning
              className="absolute whitespace-pre font-mono text-[14px] leading-[1.375] text-[#596684]/40"
              style={{ left: x, top: y }}
            />
          ))}
        </div>
      </div>

      {/* shield glyph: green (ON) crossfading with gray (OFF) */}
      <div className="absolute left-[260px] top-[239px] size-20">
        <Image
          ref={greenShieldRef}
          src="/features/f4-shield.svg"
          alt=""
          width={55}
          height={68}
          className="absolute left-[12.5px] top-[5.9px] h-[68.3px] w-[54.9px] max-w-none"
        />
        {/* same silhouette recolored through a mask — OFF fill #65686D/82 */}
        <div
          ref={grayShieldRef}
          aria-hidden
          className="absolute left-[12.5px] top-[5.9px] h-[68.3px] w-[54.9px] opacity-0"
          style={{
            backgroundColor: "rgba(101,104,109,0.82)",
            maskImage: "url(/features/f4-shield.svg)",
            maskSize: "100% 100%",
            WebkitMaskImage: "url(/features/f4-shield.svg)",
            WebkitMaskSize: "100% 100%",
          }}
        />
        <p
          className="absolute left-[35px] top-[29px] bg-clip-text font-mono text-[16px] font-medium uppercase leading-[1.375] tracking-[-0.16px] text-transparent"
          style={{
            backgroundImage: "linear-gradient(180deg, #D8C8FF 0%, #ECE3FF 50%, #FFFFFF 100%)",
          }}
        >
          S
        </p>
      </div>

      </PosterViewport>

      {/* security toggle — card-level: in the header row at every size
          (right-anchored at base, the design's absolute spot from md up) */}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Toggle security"
        onClick={() => setOn((v) => !v)}
        className="absolute right-7 top-[33px] block lg:right-[41px] lg:top-[35px]"
      >
        <div
          ref={pillRef}
          className="flex h-[18px] w-[30px] items-center justify-end rounded-full bg-[#489C32] pl-[15px] pr-[3px]"
        >
          <div ref={knobRef} className="size-3 rounded-full bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)]" />
        </div>
      </button>
    </div>
  );
}
