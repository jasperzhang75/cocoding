"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { HyperText } from "@/components/magicui/hyper-text";
import { EYEBROW_SCRAMBLE } from "./eyebrow";

/* PRICING, redesigned (Figma bHyNfFfV0ocgVPCHtOyYBp 4:8 in "MacBook Air -
   34", read 2026-10-12; was yFciEPejue3E2xhstXF0Wu 16660:18869). Eyebrow,
   48px heading in Title Case (the design's textCase TITLE), and three
   SEPARATE 386 x 586 cards 21 apart — no longer one shared hairline box:
   Starter | Pro | Enterprise. Placeholder content: the switch only flips,
   the credits picker only looks like one.

   Cards: radius 10, a 1px stroke INSIDE (white 6%; Pro a top-to-bottom
   gradient #4362BA 43% -> #8382A1 40% at paint opacity 34%), drawn as an
   inset shadow / a masked ring so the padding stays exact. Pro fills
   white 3% and carries Ellipse 21887, the blurred blue glow, now centered
   in the card. Content starts 37 from the top and 32 from the left; the
   buttons are 318 wide, which leaves 36 on the right, and end 34 above
   the bottom. Buttons: Starter white 10% with the whole button at 60%,
   Pro #4362BA, Enterprise white with #0A0A0A text. The Annual switch sits
   on the name row, 26 from the card's right edge, its pill #4D74E1.

   Below xl the cards keep this layout but the type steps down, per the
   Starter card Jasper set in the iPad frame (yFciEPejue3E2xhstXF0Wu
   17474:8038, 2026-09-07): plan name 14 / 137.5% (xl 16 / 100% / -1%),
   price 24 / 100% / -3% (the heading-md token; xl 36 / 137.5% / -4%, and
   "/mo" 16 for 24), blurb 14 / 137.5% (xl 16), list items 13 / 137.5%
   (xl 14). Buttons, the credits picker (14) and the Annual label (12)
   stay.

   Heights follow the content: the Pro card, the tallest with its credits
   picker, sets the row; the other two stretch to it and drop their
   buttons to the bottom (mt-auto), so the three buttons stay level. The
   gap from a list to what follows is the design's 59 at xl (Pro's list
   ends at 398, the picker starts at 457; the card comes out at 586) and
   40 below xl, where Jasper wanted the lists closer to the buttons
   (2026-09-07). The design has Enterprise's button 2px higher than the
   other two; level here. */

type Plan = {
  name: string;
  price: React.ReactNode;
  blurb: string;
  items: { text: string; plus?: boolean }[];
  cta: string;
};

const STARTER: Plan = {
  name: "Starter",
  price: "Free",
  blurb: "For exploring what’s possible",
  items: [
    { text: "7 days trial" },
    { text: "10 free credits/month" },
    { text: "3 projects max" },
    { text: "Live preview" },
    { text: "Basic sandbox" },
    { text: "Basic AI agents" },
    { text: "Community support" },
  ],
  cta: "Start for free",
};
const PRO: Plan = {
  name: "Pro",
  // "$18" at 36 / -4%, "/mo" at 24 / -3%, one 137.5% line; below xl 24 and 16
  price: (
    <>
      $18
      <span className="text-[1rem] tracking-[-0.03em] xl:text-[1.5rem]">/mo</span>
    </>
  ),
  blurb: "For commercial and professional builds",
  items: [
    { text: "Everything in Starter", plus: true },
    { text: "10 active projects" },
    { text: "Git integration" },
    { text: "2v CPU, 4GB RAM, 50GB storage" },
    { text: "Premium AI agents" },
    { text: "Full sandbox access" },
    { text: "Chat support" },
  ],
  cta: "Start with Pro",
};
const ENTERPRISE: Plan = {
  name: "Enterprise",
  price: "Custom",
  blurb: "For enterprise-grade security & controls",
  items: [
    { text: "Everything in Pro", plus: true },
    { text: "Unlimited projects" },
    { text: "Custom credits" },
    { text: "SSO/SAML support" },
    { text: "Premium AI agents" },
    { text: "24/7 support" },
    { text: "Custom SLA" },
  ],
  cta: "Talk to sales",
};

/* ---------------------------------------------------------------- icons */

/* lucide check / plus at 20px, #4E4E4E 0.9 round; chevron-down at 16px,
   #A1A1A1 0.9 square — the design's vectors at their positions */
function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M16.67 5 7.5 14.17 3.33 10" stroke="#4E4E4E" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Plus() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path d="M4.17 10h11.66M10 4.17v11.66" stroke="#4E4E4E" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="m4 6 4 4 4-4" stroke="#A1A1A1" strokeWidth="0.9" strokeLinecap="square" />
    </svg>
  );
}

/* ---------------------------------------------------------------- pieces */

function Features({ items }: { items: Plan["items"] }) {
  return (
    <ul className="mt-[37px] flex flex-col gap-3">
      {items.map((it) => (
        <li key={it.text} className="flex items-start gap-3 text-body-xs text-text-primary xl:text-body-sm">
          {it.plus ? <Plus /> : <Check />}
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

function Header({ plan }: { plan: Plan }) {
  return (
    <div>
      <p className="text-body-sm text-text-primary xl:text-[1rem] xl:leading-none xl:tracking-[-0.01em]">{plan.name}</p>
      <p className="mt-3 text-heading-md text-text-primary xl:text-[2.25rem] xl:leading-[1.375] xl:tracking-[-0.04em]">{plan.price}</p>
      <p className="mt-3 text-body-sm text-text-body xl:text-body-md">{plan.blurb}</p>
    </div>
  );
}

/* the 318 x 40 buttons, r6, 14px: Starter white 10% with the whole button
   at 60% (text included), Pro #4362BA, Enterprise white with #0A0A0A */
const CTA_STYLE = {
  starter: "bg-white/10 text-white opacity-60 hover:opacity-80 transition-opacity",
  pro: "bg-[#4362BA] text-white hover:bg-[#5070C8] transition-colors",
  enterprise: "bg-white text-[#0A0A0A] hover:bg-[#EDEDED] transition-colors",
} as const;

function Cta({ label, kind }: { label: string; kind: keyof typeof CTA_STYLE }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-center rounded-sm px-3 text-body-sm duration-300 ${CTA_STYLE[kind]}`}
    >
      {label}
    </button>
  );
}

/* the Annual switch: 30 x 18, #4D74E1 with a 12px white knob on the right
   when on (the design's state; its shadow 0 4 24 black 20%); off it dims
   and the knob slides left. "Annual" 12 / 137.5% #A1A1A1, 8 before it. On
   the name row, 37 from the card's top and 26 from its right edge.
   Placeholder — nothing is priced differently yet. */
function AnnualSwitch() {
  const [on, setOn] = useState(true);
  return (
    <label className="absolute right-[26px] top-[37px] z-10 flex h-[18px] cursor-pointer items-center gap-2 select-none">
      <span className="text-[0.75rem] leading-[1.375] text-text-body">Annual</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`relative h-[18px] w-[30px] rounded-full transition-colors duration-300 ${on ? "bg-[#4D74E1]" : "bg-white/10"}`}
      >
        <span
          className={`absolute top-[3px] size-3 rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-[left] duration-300 ${
            on ? "left-[15px]" : "left-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

/* the credits picker: the button's size, white 10% at 60%, text left and a
   chevron right. Placeholder — it has one option and opens nothing yet. */
function Credits() {
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      className="flex h-10 w-full items-center justify-between rounded-sm bg-white/10 px-3 text-body-sm text-text-primary opacity-60 transition-opacity duration-300 hover:opacity-80"
    >
      <span>100 credits - $22/mo</span>
      <Chevron />
    </button>
  );
}

/* ---------------------------------------------------------------- cards */

/* the card box: radius 10, the design's padding (37 top, 32 left, 36 right,
   34 bottom), a column so the buttons can sit at the bottom */
const CARD = "relative flex flex-col overflow-hidden rounded-[10px] pb-[34px] pl-8 pr-9 pt-[37px] xl:min-h-[586px]";
/* Starter and Enterprise: the 1px white 6% stroke inside */
const PLAIN_STROKE: CSSProperties = { boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" };
/* Pro: the gradient stroke inside, a 1px ring cut out of a gradient fill
   by two masks (a box-shadow cannot take a gradient), at the paint's 34% */
const PRO_RING: CSSProperties = {
  padding: "1px",
  background: "linear-gradient(180deg, rgba(67,98,186,0.43), rgba(131,130,161,0.4))",
  opacity: 0.34,
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
};
/* the CTA block: the list's gap above it (59 at xl, 40 below) */
const CTA_BLOCK = "mt-auto pt-10 xl:pt-[59px]";

/* -------------------------------------------------------------- section */

export default function Pricing() {
  return (
    <section id="pricing" className="px-5 pt-24 md:px-10 xl:pt-[160px]">
      <div className="mx-auto w-full max-w-[1200px]">
        <HyperText
          as="p"
          {...EYEBROW_SCRAMBLE}
          className="font-mono text-indicator-lg uppercase text-accent"
        >
          Pricing
        </HyperText>
        {/* Title Case, as the design sets this layer (textCase TITLE) */}
        <h2 className="mt-3 text-heading-lg capitalize text-text-primary xl:text-display">Start for free, scale when ready.</h2>

        <div className="mt-[60px] grid grid-cols-1 gap-[21px] md:grid-cols-3">
          <article className={CARD} style={PLAIN_STROKE}>
            <Header plan={STARTER} />
            <Features items={STARTER.items} />
            <div className={CTA_BLOCK}>
              <Cta label={STARTER.cta} kind="starter" />
            </div>
          </article>

          <article className={`${CARD} bg-white/[0.03]`}>
            {/* Ellipse 21887: a 348 x 249 ellipse turned -90°, so a 249 x
                348 box, centered in the card; radial #18365F -> #316FC5 at
                43%, LAYER-BLURRED 300 (CSS blur 150), clipped by the card.
                The design's layer order puts it above the texts; it stays
                under them here — a glow is a background. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[348px] w-[249px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                opacity: 0.43,
                background: "radial-gradient(closest-side, #18365F 0%, #316FC5 100%)",
                filter: "blur(150px)",
              }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[10px]" style={PRO_RING} />
            <AnnualSwitch />
            <div className="relative flex grow flex-col">
              <Header plan={PRO} />
              <Features items={PRO.items} />
              <div className={CTA_BLOCK}>
                <Credits />
                <div className="mt-[15px]">
                  <Cta label={PRO.cta} kind="pro" />
                </div>
              </div>
            </div>
          </article>

          <article className={CARD} style={PLAIN_STROKE}>
            <Header plan={ENTERPRISE} />
            <Features items={ENTERPRISE.items} />
            <div className={CTA_BLOCK}>
              <Cta label={ENTERPRISE.cta} kind="enterprise" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
