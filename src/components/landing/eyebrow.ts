/* The section eyebrows' scramble (FEATURES, INFRASTRUCTURE, TESTIMONIAL,
   PRICING), tuned in one place. Jasper 2026-10-11 found it too easy to
   miss: it began only once the label reached mid-screen, 0.4s later, the
   letters changed every frame (a blur, not a flip) and the first one
   never scrambled. Now it starts as the label scrolls in, every letter
   flips for a moment, and the flips are slow enough to read.
   Was: delay 400, duration 800, every frame, mid-screen 40% band. */
export const EYEBROW_SCRAMBLE = {
  startOnView: true,
  viewMargin: "0px 0px -20% 0px", // starts once the label is above the screen's bottom fifth
  delay: 150, // ms after that
  lead: 300, // ms of every letter flipping before any settles
  duration: 900, // ms over which they settle, left to right
  tick: 60, // ms between flips
  animateOnHover: false,
} as const;
