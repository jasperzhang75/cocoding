/* THE CLOSING CALL (Figma yFciEPejue3E2xhstXF0Wu 16555:16606, "MacBook
   Air - 140"): a 1280 x 832 screen with nothing but a two-line 48px
   heading and a white button, centered — 330 above and below — and a
   blue glow sitting just right of the words. The design's outline
   "Log in" beside the button is hidden there, so it is not drawn. */

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden px-5 py-40 md:px-10 xl:py-[330px]">
      {/* Ellipse 21888: 289 x 206 radial #18365F -> #245292 -> #316FC5 at
          52%, layer-blurred 300, its center 93 right of the page's and
          level with the heading — a radial gradient twice its size, no
          filter */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[412px] w-[578px] -translate-y-1/2"
        style={{
          marginLeft: 93 - 289,
          marginTop: -31,
          background:
            "radial-gradient(closest-side, rgba(49,111,197,0.52), rgba(36,82,146,0.34) 50%, rgba(24,54,95,0) 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <h2 className="text-center text-heading-lg text-text-primary xl:text-display">
          Build the future.
          <br />
          Ship it today.
        </h2>
        {/* Frame 2609112: 119 x 40, white, r6, 18 side padding, 36 under the heading */}
        <a
          href="#"
          className="mt-9 flex h-10 items-center justify-center rounded-sm bg-white px-[18px] text-body-sm text-[#0A0A0A] transition-colors duration-300 hover:bg-[#EDEDED]"
        >
          Start for free
        </a>
      </div>
    </section>
  );
}
