"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import BorderLight from "./BorderLight";
import Menu from "./Menu";

/* Landing-only values: #3f3f3f/56 badge border, #6A91FC "New" pill (its own
   special blue, intentionally NOT the Accent token), #131516 text on accent,
   #121212 prompt surface, #929292/50 placeholder, 12px badge label size.
   Opacity variants of system colors use token/NN.

   Motion:
   - the badge's border light (BorderLight, 2026-10-21): a BEAM-long run
     of white light round the pill's 0.7px border, once, BEAM_LAP seconds
     a lap, BEAM_DELAY after the page arrives — dashes on the pill's own
     outline, so it keeps one pace round the end caps (the one-time conic
     sweep before it read as not smooth to Jasper, and Magic UI's
     BorderBeam parked at the caps; see BorderLight.tsx)
   - .prompt-ring-rest / -focus (globals.css): the two strokes cross-fade over
     150ms — resting is a near-invisible 4%, focus the design's flat 12%
   - voice chip: idle is white/61, with input text it goes fully white and the
     audio-lines glyph morphs into a rightward send arrow via GSAP MorphSVG
     (compound paths). The glyph is #000000, matching the Figma vector.

   The box's controls (2026-10-23, Jasper: "auto 下面增加 website、keynote、
   animation 然后那个+添加可以添加文件的 Gemini3.0 那个改成最新的模型和下拉添加
   一些最新的模型名称"): the mode and the model are Menu listboxes (MODES,
   MODELS; the design's label + chevron as the trigger, Pricing's menu
   under it), and the paperclip opens the file picker — the chosen files
   stand as chips above the bottom row, each with its own remove. Nothing
   is sent anywhere: this is the landing page's picture of the product. */

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
const TYPE_MS = 34; // per character typed, plus up to TYPE_JITTER (55 + 40 until 2026-10-21, Jasper: "更快一点")
const TYPE_JITTER = 26; // ms of randomness per character, so it reads as typing
const DELETE_MS = 16; // per character deleted (25 before)
const HOLD_MS = 2000; // a finished prompt stays this long (2200 before)
const GAP_MS = 300; // the bare lead stays this long before the next one starts (350 before)

/* the badge's light: its length along the border, the seconds for its one
   lap, and how long after the page arrives it sets off */
const BEAM = 56;
const BEAM_LAP = 2.4; // slower round the caps, see BorderLight (3.4 for an hour; Jasper: "再快一点")
const BEAM_DELAY = 0.6;

/* what the box can make (Auto first, the design's label) and which model
   makes it (the newest first; the design showed "Gemini 3.0") */
const MODES = ["Auto", "Website", "Keynote", "Animation"] as const;
const MODELS = ["Claude Opus 5.5", "Claude Sonnet 5.5", "Claude Haiku 5.5", "Claude Fable 5.1", "GPT-5.2", "Gemini 3.1 Pro"] as const;

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
      <BorderLight width={0.7} radius={16} length={BEAM} lap={BEAM_LAP} delay={BEAM_DELAY} />
      <span className="flex h-[22px] items-center justify-center rounded-full bg-[#6A91FC] px-2 text-[12px] leading-[14px] text-[#131516]">
        New
      </span>
      <p className="flex items-center gap-1.5 text-body-xs text-text-primary">
        Claude Opus 5.5 now available
        <ArrowRight className="text-text-body/60" />
      </p>
    </div>
  );
}

function Cross() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function PromptBox() {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<string>(MODES[0]);
  const [model, setModel] = useState<string>(MODELS[0]);
  const [files, setFiles] = useState<string[]>([]);
  const hasText = value.trim().length > 0;
  const morphRef = useRef<SVGPathElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // the paperclip's files, by name; the same name twice is one chip
  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const names = Array.from(list, (f) => f.name);
    setFiles((prev) => [...prev, ...names.filter((n) => !prev.includes(n))]);
  };

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
      className="group pointer-events-auto relative h-[150px] w-full rounded-2xl"
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
        className={`pointer-events-auto h-full w-full resize-none rounded-2xl bg-transparent px-5 pt-[21px] text-body-md text-text-primary outline-none placeholder:text-[#929292]/50 md:text-body-sm ${
          files.length ? "pb-[88px]" : "pb-14"
        }`}
      />

      {/* the attached files, above the bottom row */}
      {files.length > 0 && (
        <ul className="pointer-events-auto absolute inset-x-0 bottom-14 flex flex-wrap gap-1.5 px-5">
          {files.map((name) => (
            <li
              key={name}
              className="flex h-6 items-center gap-1 rounded-sm bg-white/[0.06] pl-2 pr-1 text-body-xs text-text-body"
            >
              <span className="max-w-40 truncate">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => setFiles((prev) => prev.filter((n) => n !== name))}
                className="flex size-4 items-center justify-center rounded-xs text-text-body/60 transition-colors duration-150 hover:text-text-primary"
              >
                <Cross />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            tabIndex={-1}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = ""; // the same file again is a choice again
            }}
          />
          <button
            type="button"
            aria-label="Attach a file"
            onClick={() => fileRef.current?.click()}
            className="pointer-events-auto relative size-4 overflow-hidden"
          >
            <Image
              src="/icons/paperclip.svg"
              alt=""
              fill
              className="scale-150"
            />
          </button>
          <Menu
            label="What to create"
            options={MODES}
            value={mode}
            onChange={setMode}
            buttonClassName="pointer-events-auto flex h-8 items-center gap-1 rounded-md py-1.5 pl-3 pr-2"
            labelClassName="text-body-sm text-text-body"
          />
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Menu
            label="Model"
            options={MODELS}
            value={model}
            onChange={setModel}
            align="right"
            buttonClassName="pointer-events-auto flex items-center gap-[3px]"
            labelClassName="text-body-xs text-text-body"
          />
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
