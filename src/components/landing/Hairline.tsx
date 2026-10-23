/* Two pieces the Pricing cards and the hero's menus share: a 0.8px white
   6% hairline drawn as an SVG stroke over a rounded box (CSS borders
   cannot be sub-pixel; clicks pass through), and the 16px tick that marks
   the chosen entry of a listbox. Lived in Pricing.tsx until 2026-10-23. */

import type { ReactNode } from "react";

export function Hairline({
  radius,
  width = 0.8,
  opacity = 0.06,
  stroke = "#FFFFFF",
  children,
}: {
  radius: number;
  width?: number;
  opacity?: number;
  stroke?: string;
  children?: ReactNode;
}) {
  const half = width / 2;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
      {children && <defs>{children}</defs>}
      <rect
        rx={radius - half}
        fill="none"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={width}
        style={{ x: `${half}px`, y: `${half}px`, width: `calc(100% - ${width}px)`, height: `calc(100% - ${width}px)` }}
      />
    </svg>
  );
}

export function Tick() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M13.33 4 6 11.33 2.67 8" stroke="#EDEDED" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
