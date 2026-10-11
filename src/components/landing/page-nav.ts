/* NAV-BAR JUMPS (Jasper 2026-10-11): Features, Pricing and Testimonial in
   the nav scroll smoothly to their sections, each section's eyebrow
   landing LAND px under the viewport's top whatever the section's own top
   padding (they differ: 71 / 96 / 120 / 160).

   Pricing and Testimonial lie past the Infrastructure, whose hold catches
   any scroll that crosses its runway's end, or is about to: a smooth jump
   would be caught halfway. While a jump is under way isNavigating() tells
   it to let the page through. The jump is over when the scroll goes quiet
   for QUIET ms or fires scrollend (Safari has no scrollend), when the user
   takes over (wheel, touch, key, pointer), or after MAX ms at most. */

const LAND = 80;
const QUIET = 150;
const MAX = 3000;
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

  const pad = parseFloat(getComputedStyle(section).paddingTop) || 0;
  const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY + pad - LAND);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let quiet = 0;
  const end = () => {
    navigating = false;
    stop = null;
    window.clearTimeout(quiet);
    window.clearTimeout(cap);
    removeEventListener("scroll", onScroll);
    removeEventListener("scrollend", end);
    for (const t of TAKEOVER) removeEventListener(t, end);
  };
  const onScroll = () => {
    window.clearTimeout(quiet);
    quiet = window.setTimeout(end, QUIET);
  };
  const cap = window.setTimeout(end, MAX);
  navigating = true;
  stop = end;
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("scrollend", end);
  for (const t of TAKEOVER) addEventListener(t, end, { passive: true });
  onScroll(); // a jump that does not move the page ends on its own

  history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
  return true;
}
