/* UNICORN STUDIO, IN-PAGE: the one SDK load every scene on the page shares
   (the first screen's background in HeroBackground, the closing call's in
   FinalCtaBackground). The script is injected once and the promise kept on
   window, so a second scene never loads it twice — and a scene created by
   a component that unmounted first still finds the SDK ready.
   The story of why the SDK runs in our page at all (the embed iframe that
   popped in a second late) and of the CDN that went stale (hence
   production: false on every addScene) is told in HeroBackground. */

export const UNICORN_SDK = "https://www.unicorn.studio/unicornStudio.umd.js";

export type Scene = { initialized?: boolean; rendering?: boolean; fallbackOnly?: boolean; destroy?: () => void };
export type UnicornStudio = { addScene: (options: Record<string, unknown>) => Promise<Scene> };

declare global {
  interface Window {
    UnicornStudio?: UnicornStudio;
    __unicornSdk?: Promise<UnicornStudio>;
  }
}

export const loadSdk = () =>
  (window.__unicornSdk ??= new Promise<UnicornStudio>((resolve, reject) => {
    if (window.UnicornStudio?.addScene) return resolve(window.UnicornStudio);
    const s = document.createElement("script");
    s.src = UNICORN_SDK;
    s.async = true;
    s.onload = () =>
      window.UnicornStudio?.addScene ? resolve(window.UnicornStudio) : reject(new Error("UnicornStudio loaded without addScene"));
    s.onerror = () => reject(new Error(`Unable to load ${UNICORN_SDK}`));
    document.head.appendChild(s);
  }));

/* addScene resolves before the first frame (right after it kicks off the
   planes); the scene then reports `initialized` and, once its loop has
   drawn, `rendering`. Call `drawn` one frame after both — or, if the flags
   never come but a canvas exists, after 6s. Returns the cancel. */
export function onFirstFrame(scene: Scene, host: HTMLElement, drawn: () => void): () => void {
  let raf = 0;
  let gone = false;
  const started = performance.now();
  const poll = () => {
    if (gone) return;
    if (scene.initialized && scene.rendering) {
      raf = requestAnimationFrame(drawn); // one drawn frame later
      return;
    }
    if (performance.now() - started > 6000) {
      if (host.querySelector("canvas")) drawn();
      return;
    }
    raf = requestAnimationFrame(poll);
  };
  poll();
  return () => {
    gone = true;
    cancelAnimationFrame(raf);
  };
}
