"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode, TouchEvent } from "react";
import Image from "next/image";
import { HyperText } from "@/components/magicui/hyper-text";
import { EYEBROW_SCRAMBLE } from "./eyebrow";
import { NotionLogo, OpenAILogo, RampLogo } from "./testimonial-logos";
import { onArrival } from "./on-arrival";

/* TESTIMONIAL (Figma yFciEPejue3E2xhstXF0Wu 16798:8090; the photo
   treatment and the strokes from the redesign file bHyNfFfV0ocgVPCHtOyYBp
   600:1892 since 2026-10-21). A row of
   386 x 481 cards, 20px apart, that slides one card per arrow press
   (prev / next; the design's reset arrow was dropped) and loops without
   end;
   three fit the 1200 container and the neighbours peek out at its
   sides (the section clips at the viewport). The design draws three
   cards — a photo quote (OpenAI), a case study (Ramp), a photo quote
   (Notion) — and Jasper asked for six to have something to slide, so
   the three repeat. Placeholder content for now. Besides the arrows: a
   touch swipe, and (Jasper 2026-09-07) a horizontal wheel gesture — a
   trackpad's two-finger left/right — anywhere over the section. */

const CARD_W = 386; // cards are 386 x 481
const GAP = 20;

/* the 0.9px stroke every card wears INSIDE its edge (600:1892): white at
   6% at rest, and under a hovering pointer it comes up to the 24% the
   design's first card shows (Jasper 2026-10-21: "如果卡片被鼠标 hover 是会
   渐隐出现第一张卡片的 stroke") — a padding + mask ring whose opacity
   transitions. (Until then a 0.7px corner-to-corner gradient at 9%, from
   the older file.) */
const RING: CSSProperties = {
  padding: "0.9px",
  background: "#FFFFFF",
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
};
const RING_CLASS = "pointer-events-none absolute inset-0 rounded-sm opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.24]";

/* The photos: the card's own image fill at the design's opacity over
   the page's black — 80% for the OpenAI card, 70% for Notion (600:2052 /
   600:2079) — nothing else. The older file masked them under a blurred
   ellipse down to ~45% at the face and ~10% at the edges, which Jasper
   found too grey (2026-10-21: "之前那个太灰了"). */

/* logoW: the logo's design width over the card's 386, in cqw — so it
   scales with the card (111 / 96 / 82 wide at 386) */
type Card =
  | { kind: "quote"; logo: ReactNode; logoW: string; photo: string; photoOpacity: number; name: string; text: string }
  | { kind: "study"; logo: ReactNode; logoW: string; stat: string; statLabel: string; kicker: string; title: string };

const openai: Card = {
  kind: "quote",
  logo: <OpenAILogo />,
  logoW: "28.76cqw",
  photo: "/testimonials/quote-openai-hd.png",
  photoOpacity: 0.8,
  name: "Gabriel Peal, Frontend Developer",
  text: "“ It's the first AI tool that doesn't feel like a toy. ”",
};
const ramp: Card = {
  kind: "study",
  logo: <RampLogo />,
  logoW: "24.87cqw",
  stat: "90%",
  statLabel: "Learner satisfaction",
  kicker: "Case study",
  title: "How Ramp builds next-generation payment tools",
};
const notion: Card = {
  kind: "quote",
  logo: <NotionLogo />,
  logoW: "23.83cqw", // 92 wide — the wordmark overruns the design's 82 frame
  photo: "/testimonials/quote-notion-hd.png",
  photoOpacity: 0.7,
  name: "Gabriel Peal, Backend Developer",
  text: "“ Cocoding built a dashboard that actually looks good.”",
};
const CARDS: Card[] = [openai, ramp, notion, openai, ramp, notion];

/* ---------------------------------------------------------------- cards */

/* 386 x 481 at xl; a tablet shows three whole cards like the desktop,
   each a third of the container less the gaps (293 at 1000, 216 at
   768); a phone gets one card at 84% of the container, the next
   peeking past it (294 x 366 at 390 — Jasper 2026-09-08: the
   column-wide card was too big). Below xl the card SCALES (Jasper
   2026-09-07): its aspect holds, and everything inside is measured in
   cqw — hundredths of the card's width, so the design's px over 386 —
   except the type, which steps down one size: name / kicker body-xs
   (13), quote / title body-md (16), the stat's label body-sm. At xl a
   cqw is 3.86px and every value is the design's. */
const CARD_CLASS =
  "@container relative aspect-[386/481] w-[min(386px,84%)] shrink-0 overflow-hidden rounded-sm md:w-[calc((100%-40px)/3)] xl:w-[386px]";
const PAD = "9.33cqw"; // the design's 36
/* the text block: 36 from the left, its bottom 36 (quote) / 34 (study)
   above the card's, 308 / 268 wide at most */
const NAME = "text-body-xs text-text-body xl:text-body-sm";
const QUOTE = "mt-1.5 text-body-md xl:text-[1.25rem] xl:leading-[1.375] xl:tracking-[-0.012em]";

function QuoteCard({ card }: { card: Extract<Card, { kind: "quote" }> }) {
  return (
    <article className={`${CARD_CLASS} group`}>
      <Image
        src={card.photo}
        alt=""
        fill
        sizes="(min-width: 1280px) 386px, (min-width: 768px) 33vw, 84vw"
        className="object-cover"
        style={{ opacity: card.photoOpacity }}
      />
      <div className="absolute [&>svg]:h-auto [&>svg]:w-full" style={{ left: PAD, top: PAD, width: card.logoW }}>
        {card.logo}
      </div>
      {/* Frame 2609435: 36 from the left, 308 wide, its bottom 36 above
          the card's — anchored there so a narrower card's extra line
          grows upward */}
      <div className="absolute w-[calc(100%-18.65cqw)] max-w-[79.8cqw]" style={{ left: PAD, bottom: PAD }}>
        <p className={NAME}>{card.name}</p>
        <p className={`${QUOTE} text-text-primary`}>{card.text}</p>
      </div>
      <div aria-hidden className={RING_CLASS} style={RING} />
    </article>
  );
}

function StudyCard({ card }: { card: Extract<Card, { kind: "study" }> }) {
  return (
    <article className={`${CARD_CLASS} group bg-[#090A0E]`}>
      {/* Ellipse 21888 / 21891 as the design draws them (16798:8285 /
          8286, read 2026-10-12): two 289 x 206 ellipses, #18365F ->
          #245292 -> #316FC5 at 52%, LAYER-BLURRED 300 (CSS blur 150) —
          21888 radial at 200 / 250, 21891 linear top to bottom at -131 /
          62 — clipped by the card. Every length in cqw (px / 3.86, the
          blur too) so a smaller card keeps the same picture. Jasper had
          preferred wider unblurred gradient stand-ins (2026-09-06) and
          went back to the design (2026-10-12: "现在的这个蓝和别的 section
          不搭"); the other blue glows on the page are blurred ellipses
          like these. They come up as the cards scroll into view
          (2026-09-08): rise-on-arrival to the design's 52%, the row
          marked by onArrival in the section below. The two hidden
          ellipses (21890 / 21892) stay out. */}
      <div
        aria-hidden
        className="rise-on-arrival pointer-events-none absolute left-[51.81cqw] top-[64.77cqw] h-[53.37cqw] w-[74.87cqw] rounded-full [--lit:0.52]"
        style={{
          background: "radial-gradient(closest-side, #18365F 0%, #245292 50%, #316FC5 100%)",
          filter: "blur(38.86cqw)",
        }}
      />
      <div
        aria-hidden
        className="rise-on-arrival pointer-events-none absolute left-[-33.94cqw] top-[16.06cqw] h-[53.37cqw] w-[74.87cqw] rounded-full [--lit:0.52]"
        style={{
          background: "linear-gradient(180deg, #18365F 0%, #245292 50%, #316FC5 100%)",
          filter: "blur(38.86cqw)",
        }}
      />
      <div className="absolute [&>svg]:h-auto [&>svg]:w-full" style={{ left: PAD, top: PAD, width: card.logoW }}>
        {card.logo}
      </div>
      {/* Frame 2609437 at 36 / 134: the figure (the display size, 48 at
          386, scaling with the card) and its label */}
      <div className="absolute top-[34.72cqw]" style={{ left: PAD }}>
        <p className="text-[12.44cqw] leading-none tracking-[-0.05em] text-white/90">{card.stat}</p>
        <p className="mt-1.5 text-body-sm text-[#868686] xl:text-body-md">{card.statLabel}</p>
      </div>
      <div className="absolute bottom-[8.81cqw] w-[calc(100%-18.65cqw)] max-w-[69.43cqw]" style={{ left: PAD }}>
        <p className={NAME}>{card.kicker}</p>
        <p className={`${QUOTE} text-white/90`}>{card.title}</p>
      </div>
      <div aria-hidden className={RING_CLASS} style={RING} />
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
  const sectionRef = useRef<HTMLElement>(null);
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

    /* HORIZONTAL WHEEL over the section: one card per gesture. A gesture
       is one continuous stream of horizontal-dominant wheel events; it
       ends after 120ms of quiet, and a fresh flick inside its momentum
       tail (a delta at least twice the last, 10px+) is a new one — the
       Infrastructure's rules, so a trackpad's tail never slides a second
       card. 30px of travel is a step; deltaX > 0 (fingers moving left)
       is the next card, as with horizontal scrolling. Vertical scrolling
       passes through untouched; the horizontal events are prevented so
       Chrome's swipe-to-go-back never fires. Native listener: React's
       onWheel is passive and could not prevent it. */
    const section = sectionRef.current;
    let acc = 0;
    let lastAt = 0;
    let lastAx = 0;
    let stepped = false;
    const onWheel = (e: WheelEvent) => {
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax < 2 || ax <= ay) return;
      e.preventDefault();
      const t = performance.now();
      if (t - lastAt > 120 || (stepped && ax >= Math.max(10, 2 * lastAx))) {
        acc = 0;
        stepped = false;
      }
      lastAt = t;
      lastAx = ax;
      if (stepped) return;
      acc += e.deltaX;
      if (Math.abs(acc) >= 30) {
        go(acc > 0 ? 1 : -1);
        stepped = true;
      }
    };
    section?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      track.removeEventListener("transitionend", onEnd);
      section?.removeEventListener("wheel", onWheel);
    };
  }, []);

  // the study cards' glows come up once 30% of the row is on screen
  useEffect(() => {
    const viewport = viewportRef.current;
    return viewport ? onArrival(viewport) : undefined;
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
    <section ref={sectionRef} id="testimonial" className="overflow-x-clip px-5 pt-24 md:px-10 xl:pt-[120px]">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* the same one-shot scramble as the other eyebrows */}
        <HyperText
          as="p"
          {...EYEBROW_SCRAMBLE}
          className="font-mono text-indicator-lg uppercase text-accent"
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
