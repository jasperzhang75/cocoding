import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

/* the page's name and pitch (the hero's line) for the tab, search results
   and link previews; the icons and the share image are the app/ files
   (favicon.ico, icon.png, apple-icon.png, opengraph-image.tsx) */
export const metadata: Metadata = {
  // absolute URLs for the share image: the deployment's production domain
  // on Vercel (cocoding.ai once it is attached), localhost elsewhere
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "Cocoding",
  description: "Create secure apps and websites that work from day one.",
  openGraph: {
    title: "Cocoding",
    description: "Create secure apps and websites that work from day one.",
    siteName: "Cocoding",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
