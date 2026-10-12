"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// before paint on the client (no frame of the new text before the flip
// starts); a plain effect on the server, where layout effects warn
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* SCRAMBLE ON CHANGE (Jasper 2026-10-12: "pricing 的 annual on and off 加上
   hypertext 效果"): the eyebrows' HyperText flip for text that CHANGES —
   the Pro price as Annual switches ("$180" <-> "$18", "/yr" <-> "/mo") or a
   credit pack is picked. When `text` changes, every character flips for
   LEAD ms, then they settle left to right over DURATION, one flip per
   frame like the eyebrows. Digits flip through digits and letters through
   letters, so a price reads like a price; "$", "/", "+" and spaces hold
   still. Nothing happens on mount (the server's text stays), and reduced
   motion just swaps the text.

   The flips are written straight into React's own text node (nodeValue),
   so the component does not re-render sixty times a second and React's
   next update still finds its node. The caller hides the flipping text
   from assistive tech and gives it the final value instead. */

const LEAD = 150;
const DURATION = 450;
const DIGITS = "0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
const flip = (c: string) =>
  /[0-9]/.test(c) ? pick(DIGITS) : /[a-z]/.test(c) ? pick(LOWER) : /[A-Z]/.test(c) ? pick(LOWER).toUpperCase() : c;

export default function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shownFor = useRef(text);

  useIsoLayoutEffect(() => {
    if (shownFor.current === text) return; // mount, or a re-render with the same text
    shownFor.current = text;
    const node = ref.current?.firstChild;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const progress = Math.max(0, (now - start - LEAD) / DURATION);
      const settled = Math.min(text.length, Math.floor(progress * text.length));
      node.nodeValue = progress < 1 ? [...text].map((c, i) => (i < settled ? c : flip(c))).join("") : text;
      if (progress < 1) raf = requestAnimationFrame(frame);
    };
    frame(start); // the first flip before this commit paints
    raf = requestAnimationFrame(frame);
    // only stop: by the time this runs for a NEW text, React has already
    // written that text into the node, and restoring ours would undo it
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return <span ref={ref}>{text}</span>;
}
