import Image from "next/image";
import { DOCS_URL } from "@/lib/links";
import FooterWordmark from "./FooterWordmark";
import SectionLink from "./SectionLink";

/* FOOTER (Figma yFciEPejue3E2xhstXF0Wu 16555:16756, "MacBook Air - 141").
   A 0.5px hairline across the page, then 72 below it the mark on the
   left with the copyright under it, five link columns on the right, and
   37 under those the giant "cocoding" — Montserrat Black 250px, blue
   fading toward white — cut off by the page's end so only its top 179px
   show. The word is whole inside the footer; a CLIPPER around the footer
   does the cutting: the footer's negative bottom margin (the hidden
   0.504em) folds the word's lower half under the clipper's end, which is
   the page's end, and overflow-clip keeps that fold from lengthening the
   page. The clipper also begins 0.72em ABOVE the footer (headroom), so a
   hard pull at the page's end can lift the whole footer that far inside
   it — the lower half rising from under the page, then a little dark
   beneath it — without the footer's top being cut (FooterWordmark drives
   the lift; its reach is 0.654em, the rest is for the spring's
   overshoot). The clipper takes no pointer events: its headroom overlaps
   the section above. Links: Features and Pricing jump to their sections
   like the nav bar's, Docs opens the docs site (Jasper 2026-10-11); the
   rest are placeholders. */

/* the links that go somewhere: a section of this page or a URL */
const TARGETS: Record<string, { section: string } | { href: string }> = {
  Features: { section: "features" },
  Pricing: { section: "pricing" },
  Docs: { href: DOCS_URL },
};
const LINK_CLASS = "text-text-body transition-colors duration-300 hover:text-text-primary";

const COLUMNS: { title: string; width: string; links: string[] }[] = [
  {
    title: "Product",
    width: "xl:w-[70px]",
    links: ["Features", "Pricing", "Live demo", "Templates", "Changelog"],
  },
  {
    title: "Developers",
    width: "xl:w-[86px]",
    links: [
      "Docs",
      "API reference",
      "CLI",
      "Self-host",
      "Integrations",
      "Status",
    ],
  },
  {
    title: "Company",
    width: "xl:w-[70px]",
    links: ["About", "Careers", "Blog", "Customers", "Brand kit", "Contact"],
  },
  {
    title: "Connect",
    width: "xl:w-[77px]",
    links: [
      "X (Twitter)",
      "Discord",
      "Facebook",
      "Instagram",
      "Linkedin",
      "Youtube",
    ],
  },
  {
    title: "Legal",
    width: "xl:w-[77px]",
    links: ["Terms", "Privacy", "Security", "DPA", "Cookies"],
  },
];

/* the wordmark's size lives in --wordmark-size (globals.css,
   .footer-wordmark-size): 20.8% of its container — the viewport less the
   footer's side padding, 1200 at most — so 250px at the design's width
   and the word always 98% of the container, 1% clear each side (sized by
   the viewport it overflowed the tablet's narrower container and lost
   its right margin). The hidden half is 0.504 of it (its 1.22 line box
   less the 0.716 window; 126px at the design's width), the headroom the
   footer may rise into 0.72 (180px there). */
const HIDDEN = "0.504 * var(--wordmark-size)";
const HEADROOM = "0.72 * var(--wordmark-size)";

export default function Footer() {
  return (
    <div
      className="footer-wordmark-size pointer-events-none overflow-clip"
      style={{
        marginTop: `calc(-1 * (${HEADROOM}))`,
        paddingTop: `calc(${HEADROOM})`,
      }}
    >
      <footer
        className="pointer-events-auto border-t-[0.5px] border-white/[0.12] px-5 md:px-10"
        style={{ marginBottom: `calc(-1 * (${HIDDEN}))` }}
      >
        <div className="mx-auto w-full max-w-[1200px] pt-[72px]">
          <div className="flex flex-col gap-12 xl:flex-row xl:justify-between xl:gap-0">
            {/* the mark, and the line at the foot of the column block */}
            <div className="relative xl:h-[217px] xl:w-[105px]">
              <Image
                src="/logo-mark.svg"
                alt="Cocoding"
                width={26}
                height={15}
                className="mt-[7.5px] xl:mt-0 xl:translate-y-[7.5px]"
              />
              <p className="mt-6 text-[0.75rem] leading-[1.375] font-medium text-[#4E4E4E] xl:absolute xl:top-[204px] xl:mt-0 xl:whitespace-nowrap">
                © 2026 • COCODING&nbsp;&nbsp;INC.
              </p>
            </div>

            {/* Frame 2609375: five columns 84 apart, the design's widths;
              14px titles, 24 under them, 14px links 12 apart */}
            <nav className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-3 xl:flex xl:gap-x-[84px]">
              {COLUMNS.map((col) => (
                <div key={col.title} className={col.width}>
                  <p className="text-body-sm text-text-primary">{col.title}</p>
                  {/* the list carries the type size so each row is one 19px line */}
                  <ul className="mt-6 flex flex-col gap-3 text-body-sm">
                    {col.links.map((label) => {
                      const to = TARGETS[label];
                      return (
                        <li key={label}>
                          {to && "section" in to ? (
                            <SectionLink section={to.section} className={LINK_CLASS}>
                              {label}
                            </SectionLink>
                          ) : (
                            <a href={to ? to.href : "#"} className={LINK_CLASS}>
                              {label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* the wordmark: 250px at the design's width, scaling down with
            the viewport; its line box is 1.22em and the page ends 0.716em
            in, exactly where the design's frame cuts it */}
          <FooterWordmark />
        </div>
      </footer>
    </div>
  );
}
