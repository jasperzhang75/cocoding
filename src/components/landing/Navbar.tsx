"use client";

import Image from "next/image";
import { useState } from "react";

/* Values verified against the Figma nodes themselves (the CSS export claimed
   #dedcdc for all of these; only the logo wordmark actually is).
   Landing-only: #DEDCDC logo, #2e2e2e "Log in" border, #0a0a0a on white.

   Hover (per design direction):
   - logo: no change
   - nav links: Text/Primary -> Text/Body
   - Log in: fill white/10, stroke -> #414141
   - Sign up: white -> white/70
   Timing is Tailwind's default `transition`, 150ms cubic-bezier(.4,0,.2,1).

   Responsive: below md the inline links collapse into a hamburger that opens
   a full-width sheet under the bar; the hamburger swaps to an X while open. */

const links = ["Features", "Pricing", "Testimonial", "Documents"];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {open ? (
        <path
          d="M4 4L12 12M12 4L4 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative px-5 pt-4 md:px-10">
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
            {links.map((label) => (
              <a
                key={label}
                href="#"
                className="pointer-events-auto text-body-sm text-text-primary transition hover:text-text-body"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm border border-[#2e2e2e] px-3 text-body-sm whitespace-nowrap text-text-primary transition hover:border-[#414141] hover:bg-white/10"
          >
            Log in
          </a>
          {/* v0's own Sign Up shows no hover change; this restrained dim is ours. */}
          <a
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm bg-button-primary px-3 text-body-sm whitespace-nowrap text-[#0a0a0a] transition hover:bg-button-primary/70"
          >
            Sign up
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="pointer-events-auto flex size-8 items-center justify-center rounded-sm text-text-primary transition hover:text-text-body md:hidden"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </header>

      {open && (
        <nav className="pointer-events-auto absolute inset-x-0 top-full z-20 mt-2 flex flex-col border-y border-[#2e2e2e] bg-[#0a0a0a]/95 px-5 py-2 backdrop-blur-md md:hidden">
          {links.map((label) => (
            <a
              key={label}
              href="#"
              onClick={() => setOpen(false)}
              className="py-3 text-body-sm text-text-primary transition hover:text-text-body"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
