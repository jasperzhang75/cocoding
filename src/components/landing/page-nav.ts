/* NAV-BAR JUMPS (Jasper 2026-10-11): Features, Pricing and Testimonial in
   the nav scroll smoothly to their sections, each section's eyebrow
   landing LAND px under the viewport's top whatever the section's own top
   padding (they differ: 71 / 96 / 120 / 160) — 16px under the pinned nav
   bar since 2026-10-15.

   Pricing and Testimonial lie past the Infrastructure, whose hold catches
   any scroll that crosses its runway's end, or is about to: a smooth jump
   would be caught halfway. While a jump is under way isNavigating() tells
   it to let the page through.

   The jump is over when the page ARRIVES (within 2px of the target, or of
   the page's end when the target lies past it), when the browser fires
   scrollend (Safari has none), when the user takes over (wheel, touch,
   key, pointer), when nothing has scrolled for STALL ms (the scroll never
   started, or stopped short), or after MAX ms at most. The first version
   also ended after 150ms without a scroll event — and a busy page can
   take longer than that to start a smooth scroll (364ms measured in
   Chromium, 2026-10-15): the jump was over before it began and the hold
   caught it at the Infrastructure.
   Arrival (and scrollend) end it SETTLE ms later, not at once: the
   Infrastructure re-attaches its scroll listener from an
   IntersectionObserver whose callback runs a frame or more after the page
   lands, and that late check must still see the jump — in WebKit it came
   just after the end, read the leap from the page's top as a crossing and
   held the page (2026-10-15). A takeover still ends it at once. */

const LAND = 80;
const STALL = 1000;
const SETTLE = 300;
const MAX = 4000;
const TAKEOVER = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

let navigating = false;
let stop: (() => void) | null = null;

export const isNavigating = () => navigating;

/* false when there is no such section, so the caller leaves the link to
   the browser */
export function scrollToSection(id: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;
  stop?.();
  // the Infrastructure's hold releases the page first (a locked body
  // could not be scrolled at all)
  dispatchEvent(new Event("page-nav"));

  const pad = parseFloat(getComputedStyle(section).paddingTop) || 0;
  const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY + pad - LAND);
  const page = document.scrollingElement ?? document.documentElement;
  const target = Math.min(top, page.scrollHeight - window.innerHeight);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrived = () => Math.abs(window.scrollY - target) <= 2;

  let stall = 0;
  let settle = 0;
  const end = () => {
    navigating = false;
    stop = null;
    window.clearTimeout(stall);
    window.clearTimeout(settle);
    window.clearTimeout(cap);
    removeEventListener("scroll", onScroll);
    removeEventListener("scrollend", landed);
    for (const t of TAKEOVER) removeEventListener(t, end);
  };
  // the page is there: wind down after SETTLE (see above)
  const landed = () => {
    if (settle) return;
    window.clearTimeout(stall);
    settle = window.setTimeout(end, SETTLE);
  };
  const onScroll = () => {
    if (settle) return;
    window.clearTimeout(stall);
    if (arrived()) landed();
    else stall = window.setTimeout(end, STALL);
  };
  const cap = window.setTimeout(end, MAX);
  navigating = true;
  stop = end;
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("scrollend", landed);
  for (const t of TAKEOVER) addEventListener(t, end, { passive: true });
  stall = window.setTimeout(end, STALL);

  history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
  if (arrived()) landed(); // already there: nothing will scroll
  return true;
}
