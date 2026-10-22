import { AUTH_URL } from "@/lib/links";
import UnicornScene from "./UnicornScene";

/* THE CLOSING CALL (Figma yFciEPejue3E2xhstXF0Wu 16555:16606, "MacBook
   Air - 140"): a 1280 x 832 screen with nothing but a two-line 48px
   heading and a white button, centered — 330 above and below on that
   screen — and, until 2026-10-22, a blue glow sitting just right of the
   words; now a Unicorn Studio scene fills the screen behind them instead
   (Jasper: "背景去掉那个蓝色的光晕 加上这个 unicorn studio"). The screen
   IS the section: it fills the viewport at every width (Jasper
   2026-09-07), the content centered in it. The design's outline "Log
   in" beside the button is hidden there, so it is not drawn.
   data-footer-pull: a hard pull at the page's end lifts this section with
   the footer (FooterWordmark, RIDERS), so the footer never rides over the
   button. */

export default function FinalCta() {
  return (
    <section data-footer-pull className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24 md:px-10">
      {/* the scene — a ring of blue particles on black, the heading inside it —
          in-page, faded in once it has drawn (see UnicornScene) */}
      <UnicornScene projectId="nIdbg7lN6sjZNFMeY5IY" />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <h2 className="text-center text-heading-lg text-text-primary xl:text-display">
          Build the future.
          <br />
          Ship it today.
        </h2>
        {/* Frame 2609112: 119 x 40, white, r6, 18 side padding, 36 under the heading */}
        <a
          href={AUTH_URL}
          className="mt-9 flex h-10 items-center justify-center rounded-sm bg-white px-[18px] text-body-sm text-[#0A0A0A] transition-colors duration-300 hover:bg-[#EDEDED]"
        >
          Start for free
        </a>
      </div>
    </section>
  );
}
