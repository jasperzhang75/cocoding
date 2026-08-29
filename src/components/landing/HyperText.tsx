"use client";

import { useEffect, useRef, useState } from "react";

/* Magic UI-style HyperText (magicui.design/docs/components/hyper-text),
   implemented locally: on first scroll into view each character cycles
   through random capitals and settles left to right. One-shot; skipped
   under prefers-reduced-motion. Monospace text keeps the width stable
   while scrambling. */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function HyperText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLParagraphElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (played.current || !entries.some((e) => e.isIntersecting)) return;
        played.current = true;
        io.disconnect();

        let settled = 0;
        interval = setInterval(() => {
          settled += 1 / 3; // ~90ms per character at a 30ms tick
          setDisplay(
            text
              .split("")
              .map((ch, i) =>
                ch === " " || i < settled
                  ? ch
                  : LETTERS[Math.floor(Math.random() * LETTERS.length)]
              )
              .join("")
          );
          if (settled >= text.length && interval) clearInterval(interval);
        }, 30);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}
