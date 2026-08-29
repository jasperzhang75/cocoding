"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/* One-time billboard flip: direct children start face-down (rotated away on
   the X axis) and swing upright with a stagger the first time the block
   scrolls into view. Skipped entirely under prefers-reduced-motion. */
export default function BillboardReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(el.children) as HTMLElement[];
    gsap.set(el, { perspective: 900 });
    gsap.set(items, { rotationX: -90, opacity: 0, transformOrigin: "50% 50%" });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          gsap.to(items, {
            rotationX: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.14,
          });
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
