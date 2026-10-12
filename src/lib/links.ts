/* Where the site's off-page links go, in one place (the nav bar's
   Documents and the footer's Docs share the docs site). */
export const DOCS_URL = "https://docs.cocoding.ai/";

/* the app's template gallery — "View all" over the trending projects */
export const TEMPLATES_URL = "https://app.new.cocoding.ai/templates";
/* the app itself — the footer's "Templates" (Jasper 2026-10-12) */
export const APP_URL = "https://app.new.cocoding.ai";

/* the company pages on cocoding.ai and the community, linked from the
   footer (Jasper 2026-10-12) */
export const ABOUT_URL = "https://cocoding.ai/about-us";
export const CAREERS_URL = "https://cocoding.ai/careers";
export const BLOG_URL = "https://cocoding.ai/blog/";
export const TERMS_URL = "https://cocoding.ai/terms-of-service";
export const PRIVACY_URL = "https://cocoding.ai/privacy-policy";
export const DISCORD_URL = "https://discord.com/invite/Xxnw3vqEVh";

/* an integration's page on the docs site, by its slug (notion, stripe, ...)
   — the Infrastructure connectors link here */
export const integrationDocsUrl = (slug: string) => `${DOCS_URL}integrations/${slug}`;
