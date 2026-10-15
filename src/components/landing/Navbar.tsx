"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { AUTH_URL, DOCS_URL } from "@/lib/links";
import SectionLink from "./SectionLink";

/* Values verified against the Figma nodes themselves (the CSS export claimed
   #dedcdc for all of these; only the logo wordmark actually is).
   Landing-only: #DEDCDC logo, #2e2e2e "Log in" border, #0a0a0a on white.

   Hover (per design direction):
   - logo: no change
   - nav links: Text/Primary -> Text/Body
   - Log in: fill white/10, stroke -> #414141
   - Sign up: white -> white/70
   Timing is Tailwind's default `transition`, 150ms cubic-bezier(.4,0,.2,1).

   Responsive: below md the links drop out entirely — no hamburger — leaving
   the logo and the two auth buttons.

   Targets (Jasper 2026-10-11): the first three jump to their sections on
   this page (SectionLink, smooth, see page-nav), Testimonial before
   Pricing as on the page; Documents is the docs site.

   PINNED (Jasper 2026-10-15: "navbar 在向下划的时候保持置顶"): a fixed bar,
   NAV_HEIGHT (64) tall like the redesign's navbar frame — the 32px row 16
   from the top as before, 16 under it. At the very top it is transparent
   and lineless, as the design draws it over the hero, and it lets the
   pointer through to the hero's interactive scene (only its controls take
   clicks). Once the page has scrolled, a backdrop (the page's #010101 at
   70% with a 12px blur — no design for it; the design's own fill and blur
   are hidden) and the bottom line he specified, #FFFFFF 8% 0.9px, fade in
   over 200ms. The line is an SVG fill: a 0.9px CSS edge would snap to
   whole device pixels (see Hairline in Pricing). The page keeps a 48px
   spacer where the bar used to sit in the hero's flow, so nothing moved. */

const LINK_CLASS = "pointer-events-auto text-body-sm text-text-primary transition hover:text-text-body";
const SECTIONS = [
  { label: "Features", section: "features" },
  { label: "Testimonial", section: "testimonial" },
  { label: "Pricing", section: "pricing" },
];

// scrolled at all? false on the server and while hydrating
const subscribe = (onChange: () => void) => {
  addEventListener("scroll", onChange, { passive: true });
  return () => removeEventListener("scroll", onChange);
};
const isScrolled = () => window.scrollY > 0;
const notScrolled = () => false;

export default function Navbar() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, notScrolled);
  return (
    <div
      data-scrolled={scrolled || undefined}
      className="group/nav pointer-events-none fixed inset-x-0 top-0 z-50 h-16 px-5 data-[scrolled]:pointer-events-auto md:px-10"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[#010101]/70 opacity-0 backdrop-blur-md transition-opacity duration-200 group-data-[scrolled]/nav:opacity-100"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-200 group-data-[scrolled]/nav:opacity-100"
      >
        <rect fill="#FFFFFF" fillOpacity="0.08" className="[y:calc(100%-0.9px)] h-[0.9px] w-full" />
      </svg>
      <header className="relative mx-auto flex h-full w-full max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="pointer-events-auto flex items-center gap-[7px]"
          >
            <Image
              src="/logo-mark.svg"
              alt="Cocoding logo"
              width={26}
              height={15}
            />
            <span className="text-[16px] font-semibold leading-none tracking-[-0.01em] text-[#DEDCDC]">
              Cocoding
            </span>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {SECTIONS.map(({ label, section }) => (
              <SectionLink key={section} section={section} className={LINK_CLASS}>
                {label}
              </SectionLink>
            ))}
            <a href={DOCS_URL} className={LINK_CLASS}>
              Documents
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={AUTH_URL}
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm border border-[#2e2e2e] px-3 text-body-sm whitespace-nowrap text-text-primary transition hover:border-[#414141] hover:bg-white/10"
          >
            Log in
          </a>
          <a
            href={AUTH_URL}
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm bg-button-primary px-3 text-body-sm whitespace-nowrap text-[#0a0a0a] transition hover:bg-button-primary/70"
          >
            Sign up
          </a>
        </div>
      </header>
    </div>
  );
}
