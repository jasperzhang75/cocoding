"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PosterViewport from "./PosterViewport";
import { setLoopPlayState } from "@/lib/use-in-view";

/* Card 4 — built-in security, now interactive. Two states, both read from
   Figma (ON: 16629:18699, OFF: 17175:8667):

   ON  — green-gradient shield; a blue inner shadow (the design's
         inset 0 0 50px 4px #4B86AE/90 since 2026-10-20; #9CD8FF/29 from
         2026-10-12, green #3AFF4D before) breathes slowly at the
         card edge.
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

/* the glow pair's box in the card's design space (600 x 464): Frame
   2609391's two blur-250 ellipses, as the xl classes place them */
const GLOW_BOX = { x: -99, y: 77, w: 789, h: 523 };

/* the code field while hidden: masked out everywhere (see applyMask) */
const HIDDEN_MASK = "linear-gradient(transparent, transparent)";

const CODE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const randChar = () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
const randCode = () =>
  `${Array.from({ length: 7 }, randChar).join("")} ${Array.from({ length: 7 }, randChar).join("")}`;

export default function SecurityCard() {
  const [on, setOn] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
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

  /* BELOW XL THE GLOWS FOLLOW THE PICTURE (Jasper 2026-10-16: "暗处的中心
     是在文字的上方的 ... 让人觉得那个文字没有居中"). They stay card-level
     (the poster's top crop would clip them) but are placed where the
     scaled, cropped poster puts the design's glow box — so the dark heart
     between the two ellipses lands where it does on desktop, 62% down the
     code field, not at its top edge as when they simply covered the card
     (2-7% on phones and tablets). Read off the code layer's own box (the
     poster stage, as scaled and shifted by PosterViewport); at xl the
     classes hold the design's geometry and the inline box is cleared. */
  useEffect(() => {
    const card = rootRef.current;
    const glow = glowRef.current;
    const stage = matrixRef.current;
    if (!card || !glow || !stage) return;
    const xl = window.matchMedia("(min-width: 1280px)");
    let raf = 0;
    const place = () => {
      raf = 0;
      if (xl.matches) {
        glow.removeAttribute("style");
        return;
      }
      const c = card.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      const k = s.width / 600;
      Object.assign(glow.style, {
        left: `${s.left - c.left - card.clientLeft + GLOW_BOX.x * k}px`,
        top: `${s.top - c.top - card.clientTop + GLOW_BOX.y * k}px`,
        width: `${GLOW_BOX.w * k}px`,
        height: `${GLOW_BOX.h * k}px`,
        translate: "none",
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(card);
    xl.addEventListener("change", schedule);
    return () => {
      ro.disconnect();
      xl.removeEventListener("change", schedule);
      cancelAnimationFrame(raf);
    };
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
       hides by shrinking it back — the radii scale with k in [0,1].
       Fully shrunk there is no ellipse at all: a 0 x 0 radial-gradient is
       a degenerate shape that engines may paint differently, and Safari
       showed the whole code field with the switch on (Jasper 2026-10-12;
       Chrome and Playwright's WebKit hid it). So at k = 0 the mask is all
       transparent and the layer's opacity is 0 besides — opacity, not
       visibility, which would tear the layer down (see the breathe note
       below) — and on the way the ellipse never goes under 1px. */
    const applyMask = () => {
      const { k } = maskProg.current;
      const shown = k > 0.001;
      const img = shown
        ? `radial-gradient(ellipse ${Math.max(1, 250 * k)}px ${Math.max(1, 138 * k)}px at 296px 279px, black 58%, transparent 96%)`
        : HIDDEN_MASK;
      maskEl.style.maskImage = img;
      maskEl.style.webkitMaskImage = img;
      matrix.style.opacity = shown ? "1" : "0";
    };

    const stopScramble = () => {
      if (scrambleId.current) {
        clearInterval(scrambleId.current);
        scrambleId.current = null;
      }
    };

    if (on) {
      gsap.to(breathe, { opacity: 1, duration: dur ?? 0.6 });
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
      gsap.to(breathe, { opacity: 0, duration: dur ?? 1.1, ease: "power1.out" });
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
      className="order-4 relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-md border border-white/[0.06] md:grow md:rounded-none md:rounded-bl-xl xl:block xl:grow-0 xl:absolute xl:left-0 xl:top-[610px] xl:h-[464px] xl:w-[600px] xl:max-w-none"
      style={{
        background:
          "#0D0D0D", // Jasper 2026-10-21, every Features card the same; the design's black under a 2% white wash before
      }}
    >
      {/* the pair of blur-250 glows — the card's blue field. Card-level (not
          in the poster) so the mobile top-crop can't clip them: at xl they
          sit at the design geometry; below it they follow the scaled poster
          (see the effect above) — the classes' centered, card-covering box
          only holds until it runs. Pinned to its own compositor layer so
          the blurred SVGs rasterize once and stay put while the states
          animate. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-md will-change-transform md:rounded-none md:rounded-bl-xl xl:overflow-visible">
        <div ref={glowRef} className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 xl:left-[-99px] xl:top-[77px] xl:h-[523px] xl:w-[789px] xl:translate-x-0 xl:translate-y-0">
          {(["/features/f4-glow-a.svg", "/features/f4-glow-b.svg"] as const).map((src) => (
            <div key={src} className="absolute inset-0">
              <div className="absolute" style={{ inset: "-47.8% -31.69%" }}>
                <Image src={src} alt="" fill className="max-w-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* relative: in flow below xl it must still paint above the glows (a
          positioned layer earlier in the card), which tinted it blue */}
      <div className="relative px-7 pb-6 pt-8 xl:absolute xl:left-[33px] xl:top-[35px] xl:w-[496px] xl:p-0">
        <p className="pr-12 text-body-md text-text-primary xl:pr-0 xl:text-heading-sm">Built-in security, by default</p>
        <p className="mt-3 text-balance text-body-sm text-text-body xl:text-wrap xl:text-body-md xl:w-[394px]">
          With robust security safeguards already in place, your data and user information stay protected as you build.
        </p>
      </div>

      <PosterViewport designHeight={464} crop={130} className="md:mt-auto xl:mt-0 xl:absolute xl:inset-0">
      {/* scrambling pass-codes, clipped to the design's soft blob (OFF).
          Outer div = show/hide (animated); inner keeps the design's 80%. */}
      <div ref={matrixRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 will-change-transform">
        <div
          ref={maskRef}
          className="absolute inset-0 opacity-80"
          style={{ maskImage: HIDDEN_MASK, WebkitMaskImage: HIDDEN_MASK }}
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

      {/* breathing inner shadow at the card's edge (ON state). The fade lives on this
          wrapper — the inner CSS breathe animation owns its own opacity and
          would override a fade applied to the same element, which is what
          made the glow vanish in a snap. It fades by opacity only and keeps
          its own compositor layer: toggling visibility tore the layer down
          and made Chrome re-rasterize the blurred glows at a different
          scale — the blue field jumped the moment the toggle was pressed.
          Drawn ABOVE the glows and the poster, as a Figma inner shadow
          sits over its frame's children; underneath them the blue washed
          it out to a fraction of the design's 29%. Jasper took it down to
          20% (2026-09-07: "还是要淡一些") and back to the design's value a
          month later (2026-10-11: "按照 figma 原来的设计"). Then he made it
          BLUE in the design (2026-10-12: "我改了下 features 的蓝色光晕"):
          Frame 2609391's visible INNER_SHADOW became #9CD8FF 29%, blur 50,
          spread 4 (it was #3AFF4D; the #19C12D one under it stays hidden),
          and on 2026-10-20 a deeper, far stronger #4B86AE 90% ("光晕请使用
          这个 design 里的颜色 4B86AE 90%"), same blur and spread. The
          breath's shape is unchanged. */}
      <div ref={breatheRef} aria-hidden className="pointer-events-none absolute inset-0 will-change-[opacity]">
        <div
          data-loop
          className="security-breathe absolute inset-0 rounded-md md:rounded-none md:rounded-bl-xl"
          style={{ boxShadow: "inset 0 0 50px 4px rgba(75,134,174,0.9)" }}
        />
      </div>

      {/* security toggle — card-level: in the header row at every size
          (right-anchored at base, the design's absolute spot from md up) */}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Toggle security"
        onClick={() => setOn((v) => !v)}
        className="absolute right-7 top-[33px] block xl:left-[529px] xl:right-auto xl:top-[35px]"
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
