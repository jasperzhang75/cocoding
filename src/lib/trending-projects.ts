/**
 * Trending projects data.
 *
 * Everything the grid renders comes through `getTrendingProjects()`. When the
 * backend lands, replace that function's body with the real fetch — the
 * component reads only this shape and needs no changes.
 *
 * The entries below are placeholders until the API exists. Titles and
 * categories describe what each image shows (Jasper 2026-10-11: every card
 * had read "Frontend Engineer Portfolio"); view counts and links are
 * still made up.
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
  // a recruiting product's landing page: talent pipeline, hiring stats
  { id: "1", title: "Recruiting Platform Landing Page", category: "HR Tech", views: 176, imageUrl: "/projects/p1.png", href: "#" },
  // "Probe": a team workspace's product site, dashboards in each panel
  { id: "2", title: "Team Workspace Product Site", category: "SaaS", views: 99, imageUrl: "/projects/p2.png", href: "#" },
  // a builder's site: services, projects, team, testimonials
  { id: "3", title: "Construction Company Website", category: "Construction", views: 102, imageUrl: "/projects/p3.png", href: "#" },
  // a consultancy's case study with a big client quote
  { id: "4", title: "Agency Case Study Page", category: "Agency", views: 299, imageUrl: "/projects/p4.png", href: "#" },
  // a mockup-scene collection's project page
  { id: "5", title: "Mockup Collection Showcase", category: "Design", views: 85, imageUrl: "/projects/p5.png", href: "#" },
  // "Amber": a photographer's full-bleed portfolio
  { id: "6", title: "Photographer Portfolio", category: "Portfolio", views: 74, imageUrl: "/projects/p6.png", href: "#" },
  // a lawn-care company's services page
  { id: "7", title: "Lawn Care Services Website", category: "Local Business", views: 157, imageUrl: "/projects/p7.png", href: "#" },
  // "Clarity Global Ventures": a climate-focused investment firm
  { id: "8", title: "Climate Investment Firm Website", category: "Finance", views: 314, imageUrl: "/projects/p8.png", href: "#" },
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

/** Logos for the marquee: the five Jasper supplied (2026-10-11), in his
 *  order, each drawn at the size its Figma export has (heights 36-40). */
export type PartnerLogo = { id: string; name: string; src: string; width: number; height: number };

export const PARTNER_LOGOS: PartnerLogo[] = [
  { id: "ip-paris", name: "Institut Polytechnique de Paris", src: "/logos/ip-paris.svg", width: 158, height: 40 },
  { id: "google-for-startups", name: "Google for Startups", src: "/logos/google-for-startups.svg", width: 315, height: 38 },
  { id: "bpifrance", name: "Bpifrance", src: "/logos/bpifrance.svg", width: 139, height: 40 },
  { id: "imt-lille-douai", name: "IMT Lille Douai", src: "/logos/imt-lille-douai.svg", width: 68, height: 40 },
  { id: "station-f", name: "Station F", src: "/logos/station-f.svg", width: 201, height: 36 },
];
