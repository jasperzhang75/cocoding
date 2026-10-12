import { useSyncExternalStore } from "react";

/* THE VIEWER'S CLOCK, to the minute: null while rendering on the server
   (and while hydrating), the browser's time right after.

   The page is prerendered at build time, so a date computed during render
   freezes the build machine's day and time into the HTML — and hydration
   keeps that text. The Features terminal card showed Vercel's build time
   instead of the viewer's (Jasper 2026-10-12); on localhost the dev server
   renders per request on his own machine, which hid it. Here the server
   snapshot is null and the client's is the current minute, so React
   renders the placeholder to match the HTML, then re-renders with the
   viewer's time at once. A number, so a snapshot read twice in one minute
   compares equal. */
const subscribe = () => () => {};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinute = () => null;

export function useNowMinute(): number | null {
  return useSyncExternalStore(subscribe, currentMinute, noMinute);
}

/* the Date `offsetMin` minutes after the given minute */
export const minuteToDate = (minute: number, offsetMin = 0) => new Date((minute + offsetMin) * 60_000);
