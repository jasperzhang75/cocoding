/* THE CLOSING CALL (Figma yFciEPejue3E2xhstXF0Wu 16555:16606, "MacBook
   Air - 140"): a 1280 x 832 screen with nothing but a two-line 48px
   heading and a white button, centered — 330 above and below on that
   screen — and a blue glow sitting just right of the words. The screen
   IS the section: it fills the viewport at every width (Jasper
   2026-09-07), the content centered in it. The design's outline "Log
   in" beside the button is hidden there, so it is not drawn. */

export default function FinalCta() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24 md:px-10">
      {/* Ellipse 21888: a 289 x 206 ellipse, radial #18365F -> #245292 ->
          #316FC5 at 52%, LAYER-BLURRED 300 (CSS blur at half the radius),
          its center 93.5 right of the page's and 31 above the section's
          middle — level with the heading */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[206px] w-[289px] rounded-full"
        style={{
          marginLeft: 93.5 - 144.5,
          marginTop: -31 - 103,
          opacity: 0.52,
          background: "radial-gradient(closest-side, #18365F 0%, #245292 50%, #316FC5 100%)",
          filter: "blur(150px)",
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
