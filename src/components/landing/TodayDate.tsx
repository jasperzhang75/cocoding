"use client";

import { minuteToDate, useNowMinute } from "@/lib/use-now";

/* The dashboard tooltip's date is live — "12th July, 2026" in the design is
   a placeholder for today. The viewer's today: read from the browser once
   the page runs (useNowMinute), never computed during render — the page is
   prerendered at build time, and a date computed then froze the build's day
   into the HTML (Jasper 2026-10-12). Empty in the prerendered HTML, which
   sits below the fold. */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

export default function TodayDate() {
  const minute = useNowMinute();
  if (minute === null) return <span />;
  const now = minuteToDate(minute);
  return <span>{`${ordinal(now.getDate())} ${MONTHS[now.getMonth()]}, ${now.getFullYear()}`}</span>;
}
