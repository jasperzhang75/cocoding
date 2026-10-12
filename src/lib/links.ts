/* Where the site's off-page links go, in one place (the nav bar's
   Documents and the footer's Docs share the docs site). */
export const DOCS_URL = "https://docs.cocoding.ai/";

/* an integration's page on the docs site, by its slug (notion, stripe, ...)
   — the Infrastructure connectors link here */
export const integrationDocsUrl = (slug: string) => `${DOCS_URL}integrations/${slug}`;
