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
   - .prompt-focus-ring (globals.css): brighter stroke fades in over 150ms
     while the textarea is focused
   - voice chip: idle is white/61, with input text it goes fully white and the
     audio-lines glyph morphs into a rightward send arrow via GSAP MorphSVG
     (compound paths). The glyph is #000000, matching the Figma vector. */

gsap.registerPlugin(MorphSVGPlugin);

/* Compound path data at the icon set's 16px / 0.9-stroke spec.
   AUDIO is exactly public/icons/audio-lines.svg's path. */
const AUDIO_D =
  "M1.33333 6.66667V8.66667M4 4V11.3333M6.66667 2V14M9.33333 5.33333V10M12 3.33333V12M14.6667 6.66667V8.66667";
const SEND_D = "M3.5 8H12.5M8.5 4L12.5 8L8.5 12";

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
  const mounted = useRef(false);

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
      className="group pointer-events-auto relative h-[150px] w-full overflow-hidden rounded-2xl border-[0.7px] border-transparent"
      style={{
        /* Read from Figma node 16568:18077 via the Plugin API — its CSS export
           flattens this stroke to `solid #FFF`, which is wrong.
           Fills: #171717 under #000000 @ 20%.
           Stroke: the only visible paint of three is a linear gradient,
           #FFFFFF a=1 → #999999 a=0, at 12% layer opacity. Its transform
           (t = 0.2557·y + 0.1475) makes it vertical and samples just
           t≈0.148→0.403 of the ramp, giving these two endpoints.
           padding-box/border-box layering paints both, radius intact. */
        background: [
          "linear-gradient(0deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.20) 100%) padding-box",
          "linear-gradient(0deg, #171717 0%, #171717 100%) padding-box",
          "linear-gradient(180deg, rgba(240,240,240,0.102) 0%, rgba(214,214,214,0.072) 100%) border-box",
        ].join(", "),
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="I want to create a furniture marketing website..."
        className="pointer-events-auto h-full w-full resize-none bg-transparent px-5 pb-14 pt-[21px] text-body-sm text-text-primary outline-none placeholder:text-[#929292]/50"
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

        <div className="flex items-center gap-6">
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

      {/* focused stroke: the brighter sampled gradient, fading in over 150ms */}
      <div
        aria-hidden
        className="prompt-focus-ring pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150 group-focus-within:opacity-100"
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="flex justify-center px-10 pt-[15vh]">
      <div className="flex w-full max-w-[660px] flex-col items-center gap-9">
        <div className="flex flex-col items-center gap-6">
          <AnnouncementBadge />
          <h1 className="whitespace-nowrap text-display text-text-primary">
            What do you want to build?
          </h1>
          <p className="text-center text-body-md leading-none text-text-body/60">
            Create secure apps and websites that work from day one.
          </p>
        </div>
        <PromptBox />
      </div>
    </section>
  );
}
