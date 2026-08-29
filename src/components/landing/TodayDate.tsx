"use client";

/* The dashboard tooltip's date is live — "12th July, 2026" in the design is
   a placeholder for today. Rendered on the client so it is the viewer's
   today; suppressHydrationWarning absorbs the rare midnight-boundary
   mismatch with the server-rendered value. */

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
  const now = new Date();
  return (
    <span suppressHydrationWarning>
      {`${ordinal(now.getDate())} ${MONTHS[now.getMonth()]}, ${now.getFullYear()}`}
    </span>
  );
}
