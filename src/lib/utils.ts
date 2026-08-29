import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* tailwind-merge can't tell our custom type-scale utilities (text-display,
   text-body-sm, ...) from text-{color} classes, so without this it drops
   them whenever a text color is also present. Registering them in the
   font-size group makes them conflict with each other — not with colors. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-heading-lg",
        "text-heading-md",
        "text-heading-sm",
        "text-body-md",
        "text-body-sm",
        "text-body-xs",
        "text-label-sm",
        "text-indicator",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
