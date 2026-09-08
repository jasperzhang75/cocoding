/* ARRIVAL: mark `target` data-arrived once `share` of it is on screen —
   once, like the eyebrows' scramble (HyperText startOnView): the
   observer fires and is dropped, and scrolling back finds the mark
   still there. Elements inside it with .rise-on-arrival (globals.css)
   come up on the mark: the closing call's glow, the Testimonial study
   cards' (Jasper 2026-09-08, "进入视野以后要有渐显的效果"). The check
   is the ratio, not isIntersecting — an observer reports its current
   state as soon as it is attached, threshold or not, and a target a
   few px into the viewport would have counted at once. With reduced
   motion the mark is set at once (the CSS drops the transition).
   Returns the cleanup. */
export function onArrival(target: HTMLElement, share = 0.3): () => void {
  const arrive = () => {
    target.dataset.arrived = "";
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    arrive();
    return () => {};
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.intersectionRatio < share) return;
      arrive();
      observer.disconnect();
    },
    { threshold: share }
  );
  observer.observe(target);
  return () => observer.disconnect();
}
