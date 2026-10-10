import { Geist, Geist_Mono, Montserrat } from "next/font/google";

/* The site's fonts, defined once (Next's "font definitions file") so the
   root layout and the Storybook preview load the same instances. The
   variables are set on <html>; globals.css maps them to Tailwind's
   font-sans / font-mono. */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* the footer's giant wordmark only (Figma: Montserrat Black) */
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: "900",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* the classes the root layout puts on <html> */
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${montserrat.variable}`;
