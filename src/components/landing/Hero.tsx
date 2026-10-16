"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

/* Landing-only values: #3f3f3f/56 badge border, #6A91FC "New" pill (its own
   special blue, intentionally NOT the Accent token), #131516 text on accent,
   #121212 prompt surface, #929292/50 placeholder, 12px badge label size.
   Opacity variants of system colors use token/NN.

   Motion:
   - .badge-sweep (globals.css): one-time border light sweep on first load
   - .prompt-ring-rest / -focus (globals.css): the two strokes cross-fade over
     150ms — resting is a near-invisible 4%, focus the design's flat 12%
   - voice chip: idle is white/61, with input text it goes fully white and the
     audio-lines glyph morphs into a rightward send arrow via GSAP MorphSVG
     (compound paths). The glyph is #000000, matching the Figma vector. */

gsap.registerPlugin(MorphSVGPlugin);

/* Compound path data at the icon set's 16px / 0.9-stroke spec.
   AUDIO is exactly public/icons/audio-lines.svg's path. */
const AUDIO_D =
  "M1.33333 6.66667V8.66667M4 4V11.3333M6.66667 2V14M9.33333 5.33333V10M12 3.33333V12M14.6667 6.66667V8.66667";
const SEND_D = "M3.5 8H12.5M8.5 4L12.5 8L8.5 12";

/* THE PLACEHOLDER TYPES (Jasper 2026-10-16: "提前预设的 Prompt ... 按照打字机
   打出来又删除"): "I want to create a " stays; the rest is typed out a
   character at a time, held, deleted back to the lead, and the next one
   typed. The first is the design's own placeholder, so the page renders
   (and the server sends) exactly the design until the first deletion.
   It is the textarea's real placeholder, written straight to the DOM —
   no overlay to keep aligned, and it vanishes the moment anything is
   typed like any placeholder. Paused while the box is off screen;
   reduced motion keeps the design's placeholder still. Each ending reads
   after "a" (no vowel sounds). */
const PROMPT_LEAD = "I want to create a ";
const PROMPT_TAILS = [
  "furniture marketing website...",
  "booking app for my yoga studio...",
  "portfolio site for my photography...",
  "SaaS dashboard with team billing...",
  "recipe app that plans my week...",
  "landing page for my coffee brand...",
];
const TYPE_MS = 55; // per character typed, plus up to TYPE_JITTER
const TYPE_JITTER = 40; // ms of randomness per character, so it reads as typing
const DELETE_MS = 25; // per character deleted
const HOLD_MS = 2200; // a finished prompt stays this long
const GAP_MS = 350; // the bare lead stays this long before the next one starts

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M3.5 8H12.5M8.5 4L12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnnouncementBadge() {
  return (
    <div className="relative flex h-8 items-center justify-center gap-2 rounded-full border-[0.7px] border-[#3f3f3f]/56 py-1.5 pl-1.5 pr-2.5">
      {/* one-time attention sweep along the border, then gone */}
      <div aria-hidden className="badge-sweep pointer-events-none absolute inset-0 rounded-full" />
      <span className="flex h-[22px] items-center justify-center rounded-full bg-[#6A91FC] px-2 text-[12px] leading-[14px] text-[#131516]">
        New
      </span>
      <p className="flex items-center gap-1.5 text-body-xs text-text-primary">
        Claude Opus 4.7 now available
        <ArrowRight className="text-text-body/60" />
      </p>
    </div>
  );
}

function PromptBox() {
  const [value, setValue] = useState("");
  const hasText = value.trim().length > 0;
  const morphRef = useRef<SVGPathElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const mounted = useRef(false);

  // the typing placeholder (see PROMPT_TAILS)
  useEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0; // the ending on screen
    let shown = PROMPT_TAILS[0].length; // how much of it
    let phase: "hold" | "delete" | "type" = "hold";
    let timer = 0;
    const next = (ms: number) => {
      timer = window.setTimeout(step, ms);
    };
    const step = () => {
      timer = 0;
      if (phase === "hold") {
        phase = "delete";
        next(DELETE_MS);
        return;
      }
      if (phase === "delete") {
        shown -= 1;
        el.placeholder = PROMPT_LEAD + PROMPT_TAILS[i].slice(0, shown);
        if (shown > 0) return next(DELETE_MS);
        i = (i + 1) % PROMPT_TAILS.length;
        phase = "type";
        return next(GAP_MS);
      }
      shown += 1;
      el.placeholder = PROMPT_LEAD + PROMPT_TAILS[i].slice(0, shown);
      if (shown < PROMPT_TAILS[i].length) return next(TYPE_MS + Math.random() * TYPE_JITTER);
      phase = "hold";
      next(HOLD_MS);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        window.clearTimeout(timer);
        timer = 0;
      } else if (!timer) {
        next(phase === "hold" ? HOLD_MS : TYPE_MS);
      }
    });
    io.observe(box);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!morphRef.current) return;
    if (!mounted.current) {
      mounted.current = true; // initial render already shows AUDIO_D
      return;
    }
    gsap.to(morphRef.current, {
      morphSVG: hasText ? SEND_D : AUDIO_D,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }, [hasText]);

  return (
    <div
      ref={boxRef}
      className="group pointer-events-auto relative h-[150px] w-full overflow-hidden rounded-2xl"
      style={{
        /* Fills read from Figma node 16568:18077: #171717 under #000000 @ 20%.
           The stroke is NOT here — it lives in the two .prompt-ring overlays
           below so the resting and focused states can cross-fade instead of
           compositing on top of each other. */
        background:
          "linear-gradient(0deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.20) 100%), linear-gradient(0deg, #171717 0%, #171717 100%)",
      }}
    >
      <textarea
        ref={textRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Describe what you want to build"
        placeholder={PROMPT_LEAD + PROMPT_TAILS[0]}
        className="pointer-events-auto h-full w-full resize-none bg-transparent px-5 pb-14 pt-[21px] text-body-md text-text-primary outline-none placeholder:text-[#929292]/50 md:text-body-sm"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Attach a file"
            className="pointer-events-auto relative size-4 overflow-hidden"
          >
            <Image
              src="/icons/paperclip.svg"
              alt=""
              fill
              className="scale-150"
            />
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-8 items-center gap-1 rounded-md py-1.5 pl-3 pr-2"
          >
            <span className="text-body-sm text-text-body">Auto</span>
            <Image
              src="/icons/chevron-down.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button type="button" className="pointer-events-auto flex items-center gap-[3px]">
            <span className="text-body-xs text-text-body">Gemini 3.0</span>
            <Image
              src="/icons/chevron-down.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
          <button
            type="button"
            aria-label={hasText ? "Send" : "Voice input"}
            className={`pointer-events-auto flex size-8 items-center justify-center rounded-md text-black transition-colors duration-150 ${
              hasText ? "bg-button-primary" : "bg-button-primary/61"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                ref={morphRef}
                d={AUDIO_D}
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Resting and focused strokes cross-fade over 150ms — see .prompt-ring */}
      <div
        aria-hidden
        className="prompt-ring prompt-ring-rest pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-150 group-focus-within:opacity-0"
      />
      <div
        aria-hidden
        className="prompt-ring prompt-ring-focus pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150 group-focus-within:opacity-100"
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="flex justify-center px-5 pt-[15svh] md:px-10">
      <div className="flex w-full max-w-[660px] flex-col items-center gap-9">
        <div className="flex flex-col items-center gap-6">
          <AnnouncementBadge />
          {/* on a phone both wrap; balanced, so the lines break evenly
              ("What do you want / to build?", "... websites / that work
              from day one.") instead of leaving one word alone on the
              second line (Jasper, iPhone, 2026-09-08) */}
          <h1 className="text-center text-balance text-heading-lg leading-[1.1] text-text-primary md:whitespace-nowrap md:text-display md:leading-none">
            What do you want to build?
          </h1>
          <p className="text-center text-balance text-body-md text-text-body/60 md:leading-none">
            Create secure apps and websites that work from day one.
          </p>
        </div>
        <PromptBox />
      </div>
    </section>
  );
}
