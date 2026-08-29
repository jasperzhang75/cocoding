/**
 * Trending projects data.
 *
 * Everything the grid renders comes through `getTrendingProjects()`. When the
 * backend lands, replace that function's body with the real fetch — the
 * component reads only this shape and needs no changes.
 *
 * The entries below are placeholders (titles, categories, view counts and
 * images all repeat) and are not meant to ship.
 */

export type TrendingProject = {
  /** Stable key, and the id the API will return. */
  id: string;
  title: string;
  /** Free-form tag shown under the title, e.g. "Website", "Health". */
  category: string;
  /** Raw count; the UI formats it. */
  views: number;
  /** Any URL — /public path today, remote/CDN once the API is wired. */
  imageUrl: string;
  /** Where the card and its "View" button link to. */
  href: string;
};

const PLACEHOLDER_PROJECTS: TrendingProject[] = [
  { id: "1", title: "Frontend Engineer Portfolio", category: "Website", views: 176, imageUrl: "/projects/p1.png", href: "#" },
  { id: "2", title: "Frontend Engineer Portfolio", category: "Health", views: 99, imageUrl: "/projects/p2.png", href: "#" },
  { id: "3", title: "Frontend Engineer Portfolio", category: "Health", views: 102, imageUrl: "/projects/p3.png", href: "#" },
  { id: "4", title: "Frontend Engineer Portfolio", category: "Health", views: 299, imageUrl: "/projects/p4.png", href: "#" },
  { id: "5", title: "Frontend Engineer Portfolio", category: "Health", views: 85, imageUrl: "/projects/p5.png", href: "#" },
  { id: "6", title: "Frontend Engineer Portfolio", category: "Health", views: 74, imageUrl: "/projects/p6.png", href: "#" },
  { id: "7", title: "Frontend Engineer Portfolio", category: "Health", views: 157, imageUrl: "/projects/p7.png", href: "#" },
  { id: "8", title: "Frontend Engineer Portfolio", category: "Health", views: 314, imageUrl: "/projects/p8.png", href: "#" },
];

/** Swap the body for a real fetch; the signature already returns a Promise. */
export async function getTrendingProjects(): Promise<TrendingProject[]> {
  return PLACEHOLDER_PROJECTS;
}

/** 1200 -> "1.2K". Keeps long counts from widening the card's meta row. */
export function formatViews(views: number): string {
  if (views < 1000) return String(views);
  const thousands = views / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1)}K`;
}

/** Logos for the marquee — same story, replace when there is a real source. */
export type PartnerLogo = { id: string; name: string; src: string; width: number };

export const PARTNER_LOGOS: PartnerLogo[] = [
  { id: "l1", name: "Stripe", src: "/logos/logo-1.svg", width: 95 },
  { id: "l2", name: "Pinterest", src: "/logos/logo-2.svg", width: 40 },
  { id: "l3", name: "Brex", src: "/logos/logo-3.svg", width: 151 },
  { id: "l4", name: "Klaviyo", src: "/logos/logo-4.svg", width: 131 },
  { id: "l5", name: "Mercado Libre", src: "/logos/logo-5.svg", width: 148 },
  { id: "l6", name: "Vanta", src: "/logos/logo-6.svg", width: 103 },
];
