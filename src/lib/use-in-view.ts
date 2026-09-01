"use client";

import { useEffect, useRef, useState } from "react";

/* Tracks whether a node is on screen, so looping animations can pause when
   scrolled away — the agents timeline (heavy blur + mix-blend), the CSS
   marquees/shimmers, and the code scramble all keep burning cycles and
   battery otherwise. A generous rootMargin keeps a just-off-screen card
   live so nothing visibly "starts" as it scrolls in.

   Returns a ref to attach and the current in-view boolean. */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "200px"
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/* Toggle a CSS animation's play state on an element's `.style`. Elements
   with `data-loop` inside `root` are paused/resumed together. */
export function setLoopPlayState(root: HTMLElement | null, running: boolean) {
  if (!root) return;
  const value = running ? "running" : "paused";
  root.querySelectorAll<HTMLElement>("[data-loop]").forEach((el) => {
    el.style.animationPlayState = value;
  });
}
