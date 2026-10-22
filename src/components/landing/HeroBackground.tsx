"use client";

import { useEffect, useRef } from "react";
import { preconnect, preload } from "react-dom";
import { loadSdk, onFirstFrame, UNICORN_SDK as SDK, type Scene } from "./unicorn";

/* THE FIRST SCREEN'S BACKGROUND: the Unicorn Studio scene "Cocoding.ai
   landing" (project hjz7dlZ2jZHar7bHXhfg — a white gradient under noise,
   circles, a tight vignette, a beam along the bottom edge, fog, caustics,
   glyph dither; all procedural, 89KB of JSON, no textures).

   It used to be an <iframe> of unicorn.studio's embed page, which showed
   nothing for about a second (its HTML, the 190KB SDK, the scene JSON —
   fetched uncached from Google Storage — then shader compilation) and then
   popped in. Jasper (2026-09-07): plan 1 + 4, CSS stand-in.
   1. The SDK runs in our page (one document less; the script is preloaded
      from the HTML head, the hosts preconnected; the loader lives in
      unicorn.ts since the closing call got a scene too, 2026-10-22). It ran with production:
      true, the JSON from Unicorn's CDN (assets.unicorn.studio), cached —
      until Jasper republished the scene (2026-10-19) and no browser saw
      it: that CDN keeps one copy per exact Accept-Encoding string, the
      one every browser sends ("gzip, deflate, br, zstd") still held the
      25 Aug scene after the publish, it may keep it for half a year
      (s-maxage 15811200), and it ignores query strings, so the SDK's
      "?update=" buster changes nothing. Now production: false — the SDK
      fetches the JSON from the bucket behind it
      (storage.googleapis.com/unicornstudio-production) with ?v=<now>,
      fresh on every load (~90KB, uncached; the stand-in covers the
      wait), and a publish shows at once, here and live.
   2. A stand-in paints from the first frame: Jasper's own still of the
      scene, exported from Unicorn Studio (assets/hero/, kept out of the
      served folder and out of git: stand-in-source.png 5760 x 3600 for
      the first scene; for the one with a beam along the top as well,
      stand-in-source-2026-10-19.webp 2880 x 1800 and then
      stand-in-source-2026-10-19b.webp 5760 x 3599 — PNGs despite the
      name),
      cut to 2x and 1x as AVIF and WebP in public/hero — a <picture>
      picks by pixel density, the 2x AVIF is preloaded from the head.
      Object-fit cover, bottom-anchored: a narrower screen gives up the
      sides, which the scene's horizontal bands can spare. A screen WIDER
      than the export's 16:10 (most 16:9 desktops) would lose the top
      instead, the top beam with it, and the live scene would then
      bring it in on the fade — there the still stretches to fill.
      A CSS gradient was the first stand-in; its navy-to-black run showed
      as 20px bands (a dozen 8-bit levels over 300px). A faint SVG
      fractal-noise tile stays above the still, screen-blended: +2 ±2
      levels in the dark, nothing in the light — the compression smooths
      the still's own noise away (row-to-row variation 0.45 -> 0.08
      levels), and this keeps its flats from banding.
   3. The live canvas sits above it at opacity 0 and fades in over 1.2s
      once the scene reports it has drawn (initialized + rendering); if
      that signal never comes but a canvas exists, it fades in after 6s;
      with no WebGL2 (the SDK's fallback object) or on any failure the
      stand-in simply stays.
   4. dpi 1.5 / fps 60 instead of the project's 2 / 120 — a 1440-wide
      canvas at 2x is 2880 x 1800 through thirteen full-screen passes.
   5. Both glows come up from dark in the scene itself: the bottom beam's
      appear animation (position, 1.7s easeInOutQuart) and, since
      2026-10-19, the top one's (beam1: position y -0.1 -> -0.148, 1s
      easeInOutQuad), which Jasper added in Unicorn Studio after a veil
      here had stood in for it for an afternoon.
   Reduced motion: the stand-in only, nothing loaded. */

const PROJECT = "hjz7dlZ2jZHar7bHXhfg";
const STILL = "/hero/stand-in";
const AVIF_SET = `${STILL}-1440.avif 1x, ${STILL}-2880.avif 2x`;
const WEBP_SET = `${STILL}-1440.webp 1x, ${STILL}-2880.webp 2x`;

/* a 240px tile of very dark fractal noise, opaque, 0-10 levels centred on
   2.5: screened onto the still it lifts the dark by ~2.5 levels and
   scatters ±2 around that, which is what keeps flats from banding */
const GRAIN =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
      "<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' seed='11'/>" +
      "<feColorMatrix values='0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0 0 0 0 1'/>" +
      "</filter><rect width='240' height='240' filter='url(#g)'/></svg>"
  );

export default function HeroBackground() {
  // in the server HTML's head: the fetches start with the page, not after hydration
  preconnect("https://www.unicorn.studio");
  preconnect("https://storage.googleapis.com");
  preload(SDK, { as: "script" });
  preload(`${STILL}-2880.avif`, { as: "image", type: "image/avif", imageSrcSet: AVIF_SET, fetchPriority: "high" });

  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let scene: Scene | null = null;
    let cancelPoll = () => {};
    let gone = false;
    const show = () => {
      host.style.opacity = "1";
    };
    loadSdk()
      .then((us) =>
        us.addScene({
          element: host,
          projectId: PROJECT,
          production: false, // fresh from the bucket every load (see 1.)
          dpi: 1.5,
          fps: 60,
          lazyLoad: false,
          interactivity: { mouse: { disableMobile: true } },
        })
      )
      .then((sc) => {
        if (gone) {
          sc.destroy?.();
          return;
        }
        scene = sc;
        if (sc.fallbackOnly) return; // no WebGL2: the stand-in is the background
        cancelPoll = onFirstFrame(sc, host, show);
      })
      .catch(() => {
        /* the stand-in stays */
      });
    return () => {
      gone = true;
      cancelPoll();
      scene?.destroy?.();
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0">
      {/* the still, then the grain screened onto it (isolate: the blend stays inside) */}
      <div data-stand-in className="absolute inset-0 isolate bg-black">
        <picture>
          <source type="image/avif" srcSet={AVIF_SET} />
          {/* a plain img: the assets are pre-cut, next/image would only re-encode them */}
          <img
            src={`${STILL}-1440.webp`}
            srcSet={WEBP_SET}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-bottom [@media(min-aspect-ratio:8/5)]:object-fill"
          />
        </picture>
        <div
          data-grain
          className="absolute inset-0 mix-blend-screen"
          style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "240px 240px" }}
        />
      </div>
      <div ref={hostRef} data-unicorn className="absolute inset-0 opacity-0 transition-opacity duration-[1200ms] ease-out" />
    </div>
  );
}
