"use client";

import { useState } from "react";
import { HyperText } from "@/components/magicui/hyper-text";

/* PRICING (Figma yFciEPejue3E2xhstXF0Wu 16660:18869). Eyebrow, 48px
   heading, and three 400 x 607 plan cards that share one rounded (8)
   hairline box: Starter | Pro | Enterprise. Pro is the dark one with the
   blue glow, the Annual switch, a credits picker and the accent button.
   Placeholder content: the switch only flips, the credits picker only
   looks like one. */

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
  // "$18" at 36 / -4%, "/mo" at 24 / -3%, one 137.5% line
  price: (
    <>
      $18
      <span className="text-[1.5rem] tracking-[-0.03em]">/mo</span>
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

/* the cards' 1px white 8% hairlines, inside their edges */
const HAIRLINE = "rgba(255,255,255,0.08)";
const HAIRLINE_ALL = `inset 0 0 0 1px ${HAIRLINE}`;
const HAIRLINE_TOP_BOTTOM = `inset 0 1px 0 ${HAIRLINE}, inset 0 -1px 0 ${HAIRLINE}`;
const HAIRLINE_SIDES = `inset 1px 0 0 ${HAIRLINE}, inset -1px 0 0 ${HAIRLINE}`;

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
        <li key={it.text} className="flex items-start gap-3 text-body-sm text-text-primary">
          {it.plus ? <Plus /> : <Check />}
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

function Header({ plan, aside }: { plan: Plan; aside?: React.ReactNode }) {
  return (
    <div className="relative">
      <p className="text-[1rem] leading-none tracking-[-0.01em] text-text-primary">{plan.name}</p>
      <p className="mt-3 text-[2.25rem] leading-[1.375] tracking-[-0.04em] text-text-primary">{plan.price}</p>
      <p className="mt-3 text-body-md text-text-body">{plan.blurb}</p>
      {aside}
    </div>
  );
}

/* the 328 x 40 button: white 10% for Starter and Enterprise, the accent
   at 87% for Pro */
function Cta({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-center rounded-sm px-3 text-body-sm text-text-primary transition-colors duration-300 ${
        accent ? "bg-[#648DFF]/[0.87] hover:bg-[#648DFF]" : "bg-white/10 hover:bg-white/[0.14]"
      }`}
    >
      {label}
    </button>
  );
}

/* the Annual switch: 30 x 18, accent 75% with a 12px white knob on the
   right when on (the design's state); off it dims and the knob slides
   left. Placeholder — nothing is priced differently yet. */
function AnnualSwitch() {
  const [on, setOn] = useState(true);
  return (
    <label className="absolute right-0 top-[48px] flex cursor-pointer items-center gap-2 select-none">
      <span className="text-[0.75rem] leading-[1.375] text-text-body">Annual</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`relative h-[18px] w-[30px] rounded-full transition-colors duration-300 ${on ? "bg-accent/75" : "bg-white/10"}`}
      >
        <span
          className={`absolute top-[3px] size-3 rounded-full bg-white shadow-[0_2px_24px_rgba(0,0,0,0.4)] transition-[left] duration-300 ${
            on ? "left-[15px]" : "left-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

/* the credits picker: 328 x 40 at 60%, white 10%, text left and a chevron
   right. Placeholder — it has one option and opens nothing yet. */
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

/* -------------------------------------------------------------- section */

export default function Pricing() {
  return (
    <section className="px-5 pt-24 md:px-10 xl:pt-[160px]">
      <div className="mx-auto w-full max-w-[1200px]">
        <HyperText
          as="p"
          startOnView
          delay={400}
          duration={800}
          animateOnHover={false}
          className="font-mono text-indicator uppercase text-accent"
        >
          Pricing
        </HyperText>
        <h2 className="mt-3 text-heading-lg text-text-primary xl:text-display">Start for free, scale when ready.</h2>

        {/* the three cards share one box: 1px white 8% hairlines drawn
            INSIDE (inset shadows, so the 36 padding stays exact), the
            outer corners rounded 8, the middle card keeping only its top
            and bottom edges (stacked below md: left and right instead).
            Each card: 36 padding, 56 under the button, the design's 607
            when the content is the design's. */}
        <div className="mt-[60px] grid grid-cols-1 md:grid-cols-3">
          <article
            className="flex min-h-[607px] flex-col rounded-t-[8px] p-9 pb-14 md:rounded-l-[8px] md:rounded-tr-none"
            style={{ boxShadow: HAIRLINE_ALL }}
          >
            <Header plan={STARTER} />
            <Features items={STARTER.items} />
            <div className="mt-auto pt-[37px]">
              <Cta label={STARTER.cta} />
            </div>
          </article>

          <article className="relative flex min-h-[607px] flex-col overflow-hidden bg-[#07080C] p-9 pb-14">
            {/* its two (stacked: side) hairlines ride above the glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 md:hidden" style={{ boxShadow: HAIRLINE_SIDES }} />
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden md:block" style={{ boxShadow: HAIRLINE_TOP_BOTTOM }} />
            {/* the 1% white wash and Ellipse 21887: a 348 x 249 radial
                #18365F -> #316FC5 at 43%, blurred 300 — drawn as a radial
                gradient twice its size, no filter. Jasper preferred this
                first rendering over the faithful blurred ellipse. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/[0.01]" />
            <div
              aria-hidden
              className="pointer-events-none absolute h-[498px] w-[696px]"
              style={{
                left: 140,
                top: -20,
                background:
                  "radial-gradient(closest-side, rgba(49,111,197,0.43), rgba(36,82,146,0.24) 45%, rgba(24,54,95,0) 100%)",
              }}
            />
            <div className="relative flex grow flex-col">
              <Header plan={PRO} aside={<AnnualSwitch />} />
              <Features items={PRO.items} />
              <div className="mt-auto pt-[37px]">
                <Credits />
                <div className="mt-[14px]">
                  <Cta label={PRO.cta} accent />
                </div>
              </div>
            </div>
          </article>

          <article
            className="flex min-h-[607px] flex-col rounded-b-[8px] p-9 pb-14 md:rounded-r-[8px] md:rounded-bl-none"
            style={{ boxShadow: HAIRLINE_ALL }}
          >
            <Header plan={ENTERPRISE} />
            <Features items={ENTERPRISE.items} />
            <div className="mt-auto pt-[37px]">
              <Cta label={ENTERPRISE.cta} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
