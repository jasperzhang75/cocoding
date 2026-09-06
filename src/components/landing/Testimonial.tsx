"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode, TouchEvent } from "react";
import Image from "next/image";
import { HyperText } from "@/components/magicui/hyper-text";
import { NotionLogo, OpenAILogo, RampLogo } from "./testimonial-logos";

/* TESTIMONIAL (Figma yFciEPejue3E2xhstXF0Wu 16798:8090). A row of
   386 x 481 cards, 20px apart, that slides one card per arrow press
   (prev / next; the design's reset arrow was dropped) and loops without
   end;
   three fit the 1200 container and the neighbours peek out at its
   sides (the section clips at the viewport). The design draws three
   cards — a photo quote (OpenAI), a case study (Ramp), a photo quote
   (Notion) — and Jasper asked for six to have something to slide, so
   the three repeat. Placeholder content for now. */

const CARD_W = 386; // cards are 386 x 481
const GAP = 20;

/* the 0.7px hairline every card wears, INSIDE its edge: a gradient from
   the card's own light grey at the top-left corner to #636363 toward the
   bottom-right, painted at 9% (Figma: strokeAlign INSIDE, paint opacity
   0.09, gradientTransform corner to corner) */
const hairline = (top: string, angle = "142deg", end = "100%"): CSSProperties => ({
  padding: "0.7px",
  background: `linear-gradient(${angle}, ${top} 0%, #636363 ${end})`,
  opacity: 0.09,
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
});

/* The photo sits under a soft elliptical mask in the design (a 300-blur
   gradient ellipse masks the image group), which is what makes the card
   read dark: the face shows at ~45% in the middle, the edges fall to
   ~10%. A radial mask with those stops. */
const PHOTO_MASK =
  "radial-gradient(farthest-corner at 58% 46%, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0.33) 35%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.1) 100%)";

type Card =
  | { kind: "quote"; logo: ReactNode; photo: string; name: string; text: string; top: string; fill: string }
  | { kind: "study"; logo: ReactNode; stat: string; statLabel: string; kicker: string; title: string; top: string };

const openai: Card = {
  kind: "quote",
  logo: <OpenAILogo />,
  photo: "/testimonials/quote-openai.png",
  name: "Gabriel Peal, Frontend Developer",
  text: "“ It's the first AI tool that doesn't feel like a toy. ”",
  top: "#BEBEBE",
  fill: "rgba(255,255,255,0.02)",
};
const ramp: Card = {
  kind: "study",
  logo: <RampLogo />,
  stat: "90%",
  statLabel: "Learner satisfaction",
  kicker: "Case study",
  title: "How Ramp builds next-generation payment tools",
  top: "#DFDFDF",
};
const notion: Card = {
  kind: "quote",
  logo: <NotionLogo />,
  photo: "/testimonials/quote-notion.png",
  name: "Gabriel Peal, Backend Developer",
  text: "“ Cocoding built a dashboard that actually looks good.”",
  top: "#A6A6A6",
  fill: "rgba(255,255,255,0.03)",
};
const CARDS: Card[] = [openai, ramp, notion, openai, ramp, notion];

/* ---------------------------------------------------------------- cards */

/* 386 x 481 at xl. A tablet shows two whole cards: from 768 the width
   is what two of them and a gap need, until 386 fits twice (792); a
   phone gets the column. The height never changes. */
const CARD_CLASS =
  "relative h-[481px] w-[min(386px,100%)] shrink-0 overflow-hidden rounded-sm md:w-[min(386px,calc((100%-20px)/2))] xl:w-[386px]";

function QuoteCard({ card }: { card: Extract<Card, { kind: "quote" }> }) {
  return (
    <article className={CARD_CLASS} style={{ background: card.fill }}>
      <Image
        src={card.photo}
        alt=""
        fill
        sizes="386px"
        className="object-cover"
        style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }}
      />
      <div className="absolute left-9 top-9">{card.logo}</div>
      {/* Frame 2609435: 36 from the left, 308 wide, its bottom 36 above
          the card's — anchored there so a narrower card's extra line
          grows upward */}
      <div className="absolute bottom-9 left-9 w-[calc(100%-72px)] max-w-[308px]">
        <p className="text-body-sm text-text-body">{card.name}</p>
        <p className="mt-1.5 text-[1.25rem] leading-[1.375] tracking-[-0.012em] text-text-primary">{card.text}</p>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-sm" style={hairline(card.top)} />
    </article>
  );
}

function StudyCard({ card }: { card: Extract<Card, { kind: "study" }> }) {
  return (
    <article className={`${CARD_CLASS} bg-[#090A0E]`}>
      {/* Ellipse 21888 / 21891: two 289 x 206 blue glows, layer-blurred
          300 in the design — drawn as radial gradients twice their size so
          nothing needs a filter */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-[412px] w-[578px]"
        style={{
          left: 55,
          top: 147,
          background:
            "radial-gradient(closest-side, rgba(49,111,197,0.55), rgba(36,82,146,0.32) 45%, rgba(24,54,95,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute h-[412px] w-[578px]"
        style={{
          left: -276,
          top: -41,
          background:
            "radial-gradient(closest-side, rgba(49,111,197,0.35), rgba(36,82,146,0.2) 45%, rgba(24,54,95,0) 100%)",
        }}
      />
      <div className="absolute left-9 top-9">{card.logo}</div>
      {/* Frame 2609437 at 36 / 134: the figure and its label */}
      <div className="absolute left-9 top-[134px]">
        <p className="text-display text-white/90">{card.stat}</p>
        <p className="mt-1.5 text-body-md text-[#868686]">{card.statLabel}</p>
      </div>
      <div className="absolute bottom-[34px] left-9 w-[calc(100%-72px)] max-w-[268px]">
        <p className="text-body-sm text-text-body">{card.kicker}</p>
        <p className="mt-1.5 text-[1.25rem] leading-[1.375] tracking-[-0.012em] text-white/90">{card.title}</p>
      </div>
      {/* this card's gradient runs steeper and settles by mid-card */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-sm" style={hairline(card.top, "146deg", "55%")} />
    </article>
  );
}

/* ------------------------------------------------------------- controls */

/* lucide arrow-left / arrow-right at 20px, the design's #A1A1A1 60%
   hairline strokes (0.9px, round caps) */
const ICON = {
  prev: ["M19 12H5", "m12 19-7-7 7-7"],
  next: ["M5 12h14", "m12 5 7 7-7 7"],
};

function Control({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: keyof typeof ICON;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group flex size-5 items-center justify-center transition-opacity duration-300 disabled:opacity-30"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#A1A1A1"
        strokeOpacity="0.6"
        strokeWidth="1.08"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-[stroke-opacity] duration-300 group-hover:[stroke-opacity:1] group-disabled:group-hover:[stroke-opacity:0.6]"
        aria-hidden
      >
        {ICON[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </button>
  );
}

/* -------------------------------------------------------------- section */

/* THE LOOP. The six cards are laid out three times over — a copy on
   each side of the real set — and the window stays over the middle
   copy: after any slide that leaves it, the track jumps by exactly six
   cards to the same picture in the middle copy with the transition off,
   which no eye can see. So prev and next never run out. */
const N = CARDS.length;
const LOOP = [...CARDS, ...CARDS, ...CARDS];
const SLIDE = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Testimonial() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pos = useRef(N); // the window's first card, as an index into LOOP
  const step = useRef(CARD_W + GAP); // a card and its gap (the card is narrower on a phone)
  const visible = useRef(3); // whole cards the container shows
  const touchX = useRef<number | null>(null);

  // put the track at pos, sliding there or not
  const place = (slide: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.style.transition = slide && !reduced ? SLIDE : "none";
    track.style.transform = `translateX(${-pos.current * step.current}px)`;
  };
  // back over the middle copy, unseen: the same cards six further along
  const settle = () => {
    if (pos.current >= N && pos.current < 2 * N) return;
    pos.current += pos.current < N ? N : -N;
    place(false);
  };
  const go = (dir: 1 | -1) => {
    // a quick run of presses can reach the copies' ends: settle first
    const next = pos.current + dir;
    if (next < 1 || next > LOOP.length - visible.current - 1) settle();
    pos.current += dir;
    void trackRef.current?.offsetWidth; // the settled position must be seen before the slide
    place(true);
  };

  useIsoLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const card = track.querySelector<HTMLElement>("article");
      const w = card ? card.offsetWidth : CARD_W;
      step.current = w + GAP;
      visible.current = Math.max(1, Math.floor((viewport.clientWidth + GAP) / (w + GAP)));
      place(false);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    const onEnd = (e: TransitionEvent) => {
      if (e.target === track && e.propertyName === "transform") settle();
    };
    track.addEventListener("transitionend", onEnd);
    return () => {
      ro.disconnect();
      track.removeEventListener("transitionend", onEnd);
    };
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <section className="overflow-x-clip px-5 pt-24 pb-24 md:px-10 xl:pt-[120px] xl:pb-[120px]">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* the same one-shot scramble as the other eyebrows */}
        <HyperText
          as="p"
          startOnView
          delay={400}
          duration={800}
          animateOnHover={false}
          className="font-mono text-indicator uppercase text-accent"
        >
          Testimonial
        </HyperText>
        {/* heading and the arrows share a bottom edge (Figma: 147-167
            against 119-167); on a phone the arrows drop under the heading
            so it keeps its two lines */}
        <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between md:gap-6">
          <h2 className="text-heading-lg text-text-primary xl:text-display">Loved by builders. Trusted by pros.</h2>
          <div className="mt-5 flex shrink-0 items-center gap-3 self-end md:mt-0 md:self-auto">
            <Control icon="prev" label="Previous" onClick={() => go(-1)} />
            <Control icon="next" label="Next" onClick={() => go(1)} />
          </div>
        </div>

        {/* the track: cards slide one step per press; the neighbours show
            past the container's sides, out to the viewport's edges */}
        <div ref={viewportRef} className="mt-[60px]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div
            ref={trackRef}
            className="flex gap-5"
            style={{ transform: `translateX(${-N * (CARD_W + GAP)}px)` }}
          >
            {LOOP.map((card, i) =>
              card.kind === "quote" ? <QuoteCard key={i} card={card} /> : <StudyCard key={i} card={card} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
