"use client";

import { useEffect, useRef } from "react";
import { preconnect, preload } from "react-dom";

/* THE FIRST SCREEN'S BACKGROUND: the Unicorn Studio scene "Cocoding.ai
   landing" (project hjz7dlZ2jZHar7bHXhfg — a white gradient under noise,
   circles, a tight vignette, a beam along the bottom edge, fog, caustics,
   glyph dither; all procedural, 89KB of JSON, no textures).

   It used to be an <iframe> of unicorn.studio's embed page, which showed
   nothing for about a second (its HTML, the 190KB SDK, the scene JSON —
   fetched uncached from Google Storage — then shader compilation) and then
   popped in. Jasper (2026-09-07): plan 1 + 4, CSS stand-in.
   1. The SDK runs in our page (one document less; the script is preloaded
      from the HTML head, the two hosts preconnected) with production:
      true, so the JSON comes from Unicorn's CDN and caches.
   2. A CSS stand-in paints from the first frame: the scene's settled look
      sampled from a headless render — black, a white-blue line along the
      bottom edge fading up into navy, a wider bloom at bottom center —
      under a film of grain: the navy-to-black run spans some 300px on a
      dozen 8-bit levels, and Chrome draws such a gradient as 20px bands
      (Jasper saw the stripes); a faint SVG fractal-noise tile blended
      in screen mode adds ±2 levels of dither in the dark — a fixed
      amplitude, unlike overlay's tone-proportional grain, which came
      out ±12 levels in the navy — and nothing in the light.
   3. The live canvas sits above it at opacity 0 and fades in over 1.2s
      once the scene reports it has drawn (initialized + rendering); if
      that signal never comes but a canvas exists, it fades in after 6s;
      with no WebGL2 (the SDK's fallback object) or on any failure the
      stand-in simply stays.
   4. dpi 1.5 / fps 60 instead of the project's 2 / 120 — a 1440-wide
      canvas at 2x is 2880 x 1800 through thirteen full-screen passes.
   Reduced motion: the stand-in only, nothing loaded. */

const SDK = "https://www.unicorn.studio/unicornStudio.umd.js";
const PROJECT = "hjz7dlZ2jZHar7bHXhfg";

/* the stand-in, from the render's center column (px above the bottom edge:
   rgb) 0: 245,247,249 · 11: 217,226,248 · 29: 148,161,217 · 59: 76,85,137 ·
   99: 37,41,72 · 159: 17,19,34 · 249: 8,9,16 · then black — with the edges
   at half the center's brightness 30px up, so a uniform line plus a
   center-weighted bloom */
const GRADIENTS = [
  "radial-gradient(ellipse 100% 30% at 50% 100%, rgba(120,134,220,0.5) 0%, rgba(90,102,180,0.32) 35%, rgba(40,46,90,0.18) 65%, rgba(0,0,0,0) 100%)",
  "linear-gradient(to top, rgb(228,236,252) 0px, rgb(196,207,246) 12px, rgb(86,96,156) 29px, rgb(48,54,92) 50px, rgb(26,30,53) 79px, rgb(12,14,26) 130px, rgb(4,5,9) 200px, rgb(0,0,0) 300px)",
];
/* a 240px tile of very dark fractal noise, opaque, 0-10 levels centred on
   2.5: screened onto the gradients it lifts the dark by ~2.5 levels and
   scatters ±2 around that, which is what breaks the bands */
const GRAIN =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
      "<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' seed='11'/>" +
      "<feColorMatrix values='0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0.06 0 0 0 -0.02  0 0 0 0 1'/>" +
      "</filter><rect width='240' height='240' filter='url(#g)'/></svg>"
  );
const STAND_IN: React.CSSProperties = {
  backgroundImage: [`url("${GRAIN}")`, ...GRADIENTS].join(", "),
  backgroundBlendMode: "screen, normal, normal",
  backgroundSize: "240px 240px, auto, auto",
  backgroundRepeat: "repeat, no-repeat, no-repeat",
  backgroundColor: "#000",
};

type Scene = { initialized?: boolean; rendering?: boolean; fallbackOnly?: boolean; destroy?: () => void };
type UnicornStudio = { addScene: (options: Record<string, unknown>) => Promise<Scene> };
declare global {
  interface Window {
    UnicornStudio?: UnicornStudio;
    __unicornSdk?: Promise<UnicornStudio>;
  }
}

const loadSdk = () =>
  (window.__unicornSdk ??= new Promise<UnicornStudio>((resolve, reject) => {
    if (window.UnicornStudio?.addScene) return resolve(window.UnicornStudio);
    const s = document.createElement("script");
    s.src = SDK;
    s.async = true;
    s.onload = () =>
      window.UnicornStudio?.addScene ? resolve(window.UnicornStudio) : reject(new Error("UnicornStudio loaded without addScene"));
    s.onerror = () => reject(new Error(`Unable to load ${SDK}`));
    document.head.appendChild(s);
  }));

export default function HeroBackground() {
  // in the server HTML's head: the fetches start with the page, not after hydration
  preconnect("https://www.unicorn.studio");
  preconnect("https://assets.unicorn.studio");
  preload(SDK, { as: "script" });

  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let scene: Scene | null = null;
    let raf = 0;
    let gone = false;
    const show = () => {
      host.style.opacity = "1";
    };
    loadSdk()
      .then((us) =>
        us.addScene({
          element: host,
          projectId: PROJECT,
          production: true,
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
        const started = performance.now();
        const poll = () => {
          if (gone) return;
          if (sc.initialized && sc.rendering) {
            raf = requestAnimationFrame(show); // one drawn frame later
            return;
          }
          if (performance.now() - started > 6000) {
            if (host.querySelector("canvas")) show();
            return;
          }
          raf = requestAnimationFrame(poll);
        };
        poll();
      })
      .catch(() => {
        /* the stand-in stays */
      });
    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      scene?.destroy?.();
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0">
      <div data-stand-in className="absolute inset-0" style={STAND_IN} />
      <div ref={hostRef} data-unicorn className="absolute inset-0 opacity-0 transition-opacity duration-[1200ms] ease-out" />
    </div>
  );
}
