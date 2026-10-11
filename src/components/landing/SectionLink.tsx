"use client";

import type { ComponentProps } from "react";
import { scrollToSection } from "./page-nav";

/* A link to a section of this page: a plain #anchor, so it works before
   the JS loads and opens in a new tab like any link, and a smooth jump
   (see page-nav) on an ordinary click. */
export default function SectionLink({
  section,
  ...props
}: { section: string } & Omit<ComponentProps<"a">, "href" | "onClick">) {
  return (
    <a
      href={`#${section}`}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (scrollToSection(section)) e.preventDefault();
      }}
      {...props}
    />
  );
}
