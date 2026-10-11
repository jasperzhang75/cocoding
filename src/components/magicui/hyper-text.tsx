"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { AnimatePresence, motion, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

/* Magic UI HyperText (magicui.design/docs/components/hyper-text), vendored
   shadcn-style. Characters cycle through a random set and settle left to
   right; rAF-driven against `duration`. Supports startOnView with a delay,
   and re-scrambles on hover.

   Three additions (Jasper 2026-10-11: the section eyebrows' scramble was
   too easy to miss): `lead`, a first phase where EVERY letter scrambles
   before any settles (the original settled the first letter at once);
   `tick`, how often the unsettled letters change, so each random letter
   is legible like a split-flap board instead of a per-frame blur; and
   `viewMargin`, the observer's root margin, so it can start as the text
   scrolls in rather than once it reaches mid-screen. The defaults keep
   the original behaviour. */

type CharacterSet = string[] | readonly string[];

interface HyperTextProps extends MotionProps {
  /** The text content to be animated */
  children: string;
  /** Optional className for styling */
  className?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before animation starts (in milliseconds) */
  delay?: number;
  /** Component to render as - defaults to div */
  as?: ElementType;
  /** Whether to start animation when element comes into view */
  startOnView?: boolean;
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean;
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet;
  /** All letters scramble this long (ms) before the first one settles */
  lead?: number;
  /** Unsettled letters change every `tick` ms; 0 = every frame */
  tick?: number;
  /** The view observer's rootMargin (startOnView) */
  viewMargin?: string;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  lead = 0,
  tick = 0,
  viewMargin = "-30% 0px -30% 0px",
  ...props
}: HyperTextProps) {
  const MotionComponent = motion.create(Component);

  const [displayText, setDisplayText] = useState<string[]>(() =>
    children.split("")
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) setIsAnimating(true);
  };

  // Handle animation start based on view or delay
  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => setIsAnimating(true), delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsAnimating(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: viewMargin }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [delay, startOnView, viewMargin]);

  // Handle scramble animation: `lead` ms of every letter scrambling, then
  // the letters settle left to right over `duration`, letter i once
  // (i + 1) / length of it has passed; the rest change every `tick` ms
  useEffect(() => {
    if (!isAnimating) return;

    const length = children.length;
    const startTime = performance.now();
    let lastTick = -Infinity;
    let lastSettled = -1;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const progress = Math.max(0, (currentTime - startTime - lead) / duration);
      const settled = Math.min(length, Math.floor(progress * length));
      const reroll = currentTime - lastTick >= tick;

      // re-render only when a letter settles or the tick comes round
      if (reroll || settled !== lastSettled) {
        if (reroll) lastTick = currentTime;
        lastSettled = settled;
        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            children[index] === " " || index < settled
              ? children[index]
              : reroll
                ? characterSet[getRandomInt(characterSet.length)]
                : letter
          )
        );
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(children.split(""));
        setIsAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [children, duration, isAnimating, characterSet, lead, tick]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(className)}
      onMouseEnter={handleAnimationTrigger}
      {...props}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span key={index} className={cn(letter === " " ? "w-3" : "")}>
            {letter.toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
}
