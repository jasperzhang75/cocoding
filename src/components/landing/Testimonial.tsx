"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCanMesh } from "@/lib/use-can-mesh";
import type { CSSProperties, PointerEvent, ReactNode, TouchEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { HyperText } from "@/components/magicui/hyper-text";
import { EYEBROW_SCRAMBLE } from "./eyebrow";
import { AirbnbLogo, DropboxLogo, RaycastLogo, StripeLogo, SupabaseLogo, VercelLogo } from "./testimonial-logos";
import { onArrival } from "./on-arrival";

/* THE MESH (Jasper 2026-10-21: `npx shaders install 4744333`, "add this
   mesh to the blue card in testimonial as background"): his shaders.com
   shader "hello world" — a six-point MeshGradient in #0f121f / #080880 /
   #007fff, drifting — installed by the CLI as
   src/components/shaders/HelloWorld.tsx and worn by the study card as its
   background. It renders through WebGPU, so: loaded on the client only,
   never under reduced motion or without WebGPU; until it reports ready,
   and wherever it cannot run, the design's two blurred glows stand in,
   so the card never goes flat. Every study card in the loop keeps its
   own canvas (the library pauses the ones off screen itself): mounting
   them only in view made the slider's settle jump — which swaps in
   another copy of the card — start a fresh canvas each time, and the
   card went dark for a beat (Jasper 2026-10-21: "mesh 那张卡片会暗一下然后
   又亮起来"). */
const Mesh = dynamic(() => import("@/components/shaders/HelloWorld"), { ssr: false });
/* may the mesh run here: WebGPU present and motion not reduced — false on
   the server, read once on the client (an external-store read, so no
   state is set from an effect) */

/* TESTIMONIAL (Figma yFciEPejue3E2xhstXF0Wu 16798:8090; the photos and
   the strokes per the redesign file bHyNfFfV0ocgVPCHtOyYBp 600:1892 —
   Jasper settled on it on 2026-10-21 after a day of either). A row of
   386 x 481 cards, 20px apart, that slides one card per arrow press
   (prev / next; the design's reset arrow was dropped) and loops without
   end;
   three fit the 1200 container and the neighbours peek out at its
   sides (the section clips at the viewport). The design draws three
   cards — a photo quote, a case study, a photo quote (OpenAI, Ramp and
   Notion in the design) — and Jasper asked for six to have something
   to slide, so the three repeat. Since 2026-10-23 each of the six wears
   its own company (testimonial-logos.tsx). Placeholder content. Besides the arrows: a
   touch swipe, and (Jasper 2026-09-07) a horizontal wheel gesture — a
   trackpad's two-finger left/right — anywhere over the section. */

const CARD_W = 386; // cards are 386 x 481
const GAP = 20;

/* the 0.9px stroke every card wears INSIDE its edge (600:1892): white at
   6% at rest, and under a hovering pointer it comes up to 15% (Jasper
   2026-10-21: the design's first card shows 24%, "hover 效果也是按照这个来",
   then "改为 15%")
   — a padding + mask ring whose opacity transitions. (The older file's
   0.7px corner-to-corner gradient at 9% is gone.) */
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
const RING_CLASS = "pointer-events-none absolute inset-0 rounded-sm opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.15]";

/* The photos: the card's own image fill at the design's opacity over
   the page's black — 80% for the OpenAI card, 70% for Notion (600:2052 /
   600:2079) — nothing else, no mask, no fill under them. (The older
   file masked them under a blurred ellipse; that version — masks
   rendered from the design's rotated ellipses — is in commit 56b2665.) */

/* logoW: the logo's design width over the card's 386, in cqw — so it
   scales with the card (111 / 96 / 82 wide at 386) */
type Card =
  | { kind: "quote"; logo: ReactNode; logoW: string; photo: string; photoOpacity: number; video?: string; name: string; text: string }
  | { kind: "study"; logo: ReactNode; logoW: string; stat: string; statLabel: string; kicker: string; title: string };

const vercel: Card = {
  kind: "quote",
  logo: <VercelLogo />,
  logoW: "29.02cqw", // 112 wide — its caps run taller than the others' at 128
  photo: "/testimonials/quote-openai-hd.png",
  photoOpacity: 0.8,
  video: "/testimonials/speak-openai.mp4",
  name: "Tom Whitaker, Engineer at Vercel",
  text: "“ It shipped our internal dashboard in an afternoon. ”",
};
const airbnb: Card = {
  kind: "study",
  logo: <AirbnbLogo />,
  logoW: "25.91cqw", // 100 wide
  stat: "4×",
  statLabel: "Faster to ship internal tools",
  kicker: "Case study",
  title: "How Airbnb ships internal tools in days, not quarters",
};
const stripe: Card = {
  kind: "quote",
  logo: <StripeLogo />,
  logoW: "18.65cqw", // 72 wide
  photo: "/testimonials/quote-notion-hd.png",
  photoOpacity: 0.7,
  video: "/testimonials/speak-notion.mp4",
  name: "Clara Lindqvist, Designer at Stripe",
  text: "“ It reads our Figma and comes back with the page I meant. ”",
};
/* the second half of the loop: the same three cards with two other
   people (Jasper 2026-10-21: "剩下几张图换些人"). Both portraits were
   redone 2026-10-22 as tight head-and-shoulders shots with a blurred
   office behind, like the first two (Jasper: "都是大头像 背景虚 ...
   去 ai 味"), and are taken from his redesign file, node 1327:62, which
   sets their FACING: the woman (Nano Banana Pro, candid-interview
   prompt) is mirrored there to look right, into the row; the man (same
   model, then Magnific's skin enhancer in its "transform to real" mode
   for pores and stubble) looks left. THE CROP IS THE DESIGN'S (Jasper:
   "我 figma 里的 design 是有特意放大图片的 你按照我 figma 1:1 放图片"): there
   each photo sits enlarged inside the 386 x 480 card — the woman at
   120.8% of it, shifted up 15.5%; the man at 125.8%, shifted left 8.7%
   and up 18.5% — so the files hold exactly that visible region, cut
   from the source at those percentages (scratchpad script design-crop
   .js in the memory note), 1444 x 1796 and 1544 x 1920, and object-cover
   shows them whole; the clips were generated from the same cut, so they
   match 1:1. The Notion card's photo is 90% there, hence the override.
   New file names, because the browser, Next's image optimizer and
   Vercel's image CDN all cache by URL and kept serving the old photo
   under the old one.
   THE WORDS (2026-10-23, Jasper: "生成一些合理化的评论 人名还有职位还有公司"):
   invented people with a title at the company whose mark the card wears
   (the photo files keep the design's openai / notion names),
   one short line each about what the product did for them (the name
   line kept to one line on a 375 phone, 84% card, 13px) — placeholder
   copy, nobody's real words; the companies are the design's. The clips
   were voiced with the earlier quotes and play muted, so the lips do not
   follow these. The study card gets a second edition for the loop's
   second half. */
const supabase: Card = {
  kind: "quote",
  logo: <SupabaseLogo />,
  logoW: "31.61cqw", // 122 wide
  photo: "/testimonials/quote-openai-b-crop.jpg",
  photoOpacity: 0.8,
  video: "/testimonials/speak-openai-b.mp4",
  name: "Grace Lin, Tech Lead at Supabase",
  text: "“ Half our prototypes now go straight to production. ”",
};
const dropbox: Card = {
  kind: "study",
  logo: <DropboxLogo />,
  logoW: "31.09cqw", // 120 wide
  stat: "62%",
  statLabel: "Less time on UI rework",
  kicker: "Case study",
  title: "How Dropbox keeps design and code in step",
};
const raycast: Card = {
  kind: "quote",
  logo: <RaycastLogo />,
  logoW: "27.98cqw", // 108 wide
  photo: "/testimonials/quote-notion-b-crop.jpg",
  photoOpacity: 0.9,
  video: "/testimonials/speak-notion-b.mp4",
  name: "Marcus Osei, Frontend Lead at Raycast",
  text: "“ Pixel-accurate first time. No more hand-tuned CSS. ”",
};
const CARDS: Card[] = [vercel, airbnb, stripe, supabase, dropbox, raycast];

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

/* THE TALKING HEAD (Jasper 2026-10-22: "给 Testimonial 的图片都生成一段简短的
   人物 speak 的视频 鼠标放上去的时候他在播放"): a short clip of the person
   speaking, made from the photo, laid over it and seen only while a mouse
   (or pen) rests on the card — never on touch, never under reduced
   motion. Muted: a hover is no user gesture, so the browser would refuse
   sound anyway. Nothing loads before the first hover (preload none). The
   clip's first frame is the photo, so it fades in over the still without
   a seam — once it is actually playing (onPlaying), not on the hover, or
   a clip still loading would flash blank. When it ends, or the pointer
   leaves, it fades back to the still, rewinds once hidden, and starts
   again if the pointer is still there: a loop that breathes through the
   still instead of cutting from the last frame to the first. The still
   and the clip share one wrapper that carries the design opacity (the
   rise-on-arrival), so the crossfade inside it keeps the card's
   brightness — a clip at 80% laid over a photo at 80% would have
   brightened it.
   THE CLIP'S FRAME: the clips (Magnific, OmniHuman) come 3:4 (1248 x
   1664), and the model centre-crops a wider photo's width, which would
   have left the clip a 7% zoom over the still, or 3% strips with a seam.
   So each photo was mirror-extended top and bottom to exactly 3:4
   before generation (sharp, see the memory note), and a clip's first
   frame holds the whole photo between two thin mirrored bands;
   object-cover on the 386:481 card crops those bands back off, and the
   clip's pixels land on the still's — verified frame against photo. */
function QuoteCard({ card }: { card: Extract<Card, { kind: "quote" }> }) {
  const video = useRef<HTMLVideoElement>(null);
  const hovered = useRef(false);
  const [showing, setShowing] = useState(false); // the clip is playing and faded in
  const play = () => {
    const v = video.current;
    if (!v || !hovered.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {}); // refused or interrupted: the still stays
  };
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    hovered.current = true;
    play();
  };
  const onLeave = () => {
    hovered.current = false;
    video.current?.pause();
    setShowing(false);
  };
  // the fade ran out: hidden again, so rewind — and go again if the pointer stayed
  const onFade = () => {
    const v = video.current;
    if (!v || showing) return;
    v.currentTime = 0;
    play();
  };
  return (
    <article className={`${CARD_CLASS} group`} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      {/* the photo comes up from dark as the row arrives (Jasper 2026-10-22:
          "划到这个 section 图片有一个从暗到明的动画"): rise-on-arrival to its
          design opacity (80% / 70%, the --lit), on the row's onArrival mark
          like the study card's glows — 1.6s ease, see globals.css */}
      <div className="rise-on-arrival absolute inset-0" style={{ "--lit": card.photoOpacity } as CSSProperties}>
        <Image
          src={card.photo}
          alt=""
          fill
          sizes="(min-width: 1280px) 386px, (min-width: 768px) 33vw, 84vw"
          className="object-cover"
        />
        {card.video && (
          <video
            ref={video}
            src={card.video}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden
            tabIndex={-1}
            onPlaying={() => setShowing(true)}
            onEnded={() => setShowing(false)}
            onTransitionEnd={onFade}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out ${showing ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      {/* the overlays (logo, words, ring) ask for layers of their own, as in
          StudyCard: the clip makes the photo wrapper a composited layer at
          80% / 70%, and while the track slides Safari folds un-layered
          overlays into the track's layer — UNDER that wrapper — so the words
          read dimmed through the photo for the whole slide (Jasper
          2026-10-23: "safari 的 Testimonial ... 左右切换的时候 文字层会暗一下";
          real Safari: 237 at rest, 113-138 mid-slide; 237 throughout with
          will-change). */}
      <div className="absolute will-change-transform [&>svg]:h-auto [&>svg]:w-full" style={{ left: PAD, top: PAD, width: card.logoW }}>
        {card.logo}
      </div>
      {/* Frame 2609435: 36 from the left, 308 wide, its bottom 36 above
          the card's — anchored there so a narrower card's extra line
          grows upward */}
      <div className="absolute w-[calc(100%-18.65cqw)] max-w-[79.8cqw] will-change-transform" style={{ left: PAD, bottom: PAD }}>
        <p className={NAME}>{card.name}</p>
        <p className={`${QUOTE} text-text-primary`}>{card.text}</p>
      </div>
      <div aria-hidden className={`${RING_CLASS} will-change-transform`} style={RING} />
    </article>
  );
}

function StudyCard({ card }: { card: Extract<Card, { kind: "study" }> }) {
  const mesh = useCanMesh();
  const [meshOn, setMeshOn] = useState(false); // has it reported ready
  return (
    <article className={`${CARD_CLASS} group bg-[#090A0E]`}>
      {mesh && (
        <Mesh className="absolute inset-0 size-full" onReady={() => setMeshOn(true)} onUnavailable={() => setMeshOn(false)} />
      )}
      {/* the glows: the stand-in, fading out once the mesh is drawing */}
      <div aria-hidden className={`absolute inset-0 transition-opacity duration-700 ${meshOn ? "opacity-0" : "opacity-100"}`}>
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
      </div>
      {/* SAFARI AND THE LAYERS OVER THE CANVAS (Jasper 2026-10-21: "在
          safari 左右切换的时候 mesh 这个卡片上的文字这一层会暗一下再变亮",
          Chrome fine; measured through safaridriver: the figure's white
          drops from 237 to 141 for the whole slide and is back the moment
          the track stops). The logo, the figure, the title and the ring
          sit over a WebGPU canvas, so at rest Safari composites each as a
          layer of its own above it; while the track's transform
          transition runs it drops those overlap layers and paints them
          into the moving track layer — under the canvas — so they show
          through the mesh. Asking for a layer outright (will-change)
          keeps them above it through the slide; the same on the article
          or on the track did not. A quote card's text has no canvas under
          it and never had this. */}
      <div className="absolute will-change-transform [&>svg]:h-auto [&>svg]:w-full" style={{ left: PAD, top: PAD, width: card.logoW }}>
        {card.logo}
      </div>
      {/* Frame 2609437 at 36 / 134: the figure (the display size, 48 at
          386, scaling with the card) and its label */}
      <div className="absolute top-[34.72cqw] will-change-transform" style={{ left: PAD }}>
        <p className="text-[12.44cqw] leading-none tracking-[-0.05em] text-white/90">{card.stat}</p>
        <p className="mt-1.5 text-body-sm text-[#868686] xl:text-body-md">{card.statLabel}</p>
      </div>
      <div className="absolute bottom-[8.81cqw] w-[calc(100%-18.65cqw)] max-w-[69.43cqw] will-change-transform" style={{ left: PAD }}>
        <p className={NAME}>{card.kicker}</p>
        <p className={`${QUOTE} text-white/90`}>{card.title}</p>
      </div>
      <div aria-hidden className={`${RING_CLASS} will-change-transform`} style={RING} />
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
