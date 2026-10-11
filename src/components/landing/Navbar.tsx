import Image from "next/image";
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
   this page (SectionLink, smooth, see page-nav); Documents is the docs
   site. */

const LINK_CLASS = "pointer-events-auto text-body-sm text-text-primary transition hover:text-text-body";
const SECTIONS = [
  { label: "Features", section: "features" },
  { label: "Pricing", section: "pricing" },
  { label: "Testimonial", section: "testimonial" },
];
const DOCS_URL = "https://docs.cocoding.ai/";

export default function Navbar() {
  return (
    <div className="px-5 pt-4 md:px-10">
      <header className="mx-auto flex h-8 w-full max-w-[1200px] items-center justify-between">
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
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm border border-[#2e2e2e] px-3 text-body-sm whitespace-nowrap text-text-primary transition hover:border-[#414141] hover:bg-white/10"
          >
            Log in
          </a>
          <a
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm bg-button-primary px-3 text-body-sm whitespace-nowrap text-[#0a0a0a] transition hover:bg-button-primary/70"
          >
            Sign up
          </a>
        </div>
      </header>
    </div>
  );
}
