import Image from "next/image";
import FooterWordmark from "./FooterWordmark";

/* FOOTER (Figma yFciEPejue3E2xhstXF0Wu 16555:16756, "MacBook Air - 141").
   A 0.5px hairline across the page, then 72 below it the mark on the
   left with the copyright under it, five link columns on the right, and
   37 under those the giant "cocoding" — Montserrat Black 250px, blue
   fading toward white — cut off by the page's end so only its top 179px
   show. The word is whole inside the footer; a CLIPPER around the footer
   does the cutting: the footer's negative bottom margin (the hidden
   0.504em) folds the word's lower half under the clipper's end, which is
   the page's end, and overflow-clip keeps that fold from lengthening the
   page. The clipper also begins the same 0.504em ABOVE the footer, so a
   hard pull at the page's end can lift the whole footer that far inside
   it — the lower half rising from under the page — without the footer's
   top being cut (FooterWordmark drives the lift). Placeholder links. */

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

/* the wordmark's hidden half: its 1.22 line box less the 0.716 window,
   at min(250px, 20.8vw) — 126px at the design's width */
const HIDDEN = "0.504 * min(250px, 20.8vw)";

export default function Footer() {
  return (
    <div
      className="overflow-clip"
      style={{
        marginTop: `calc(-1 * (${HIDDEN}))`,
        paddingTop: `calc(${HIDDEN})`,
      }}
    >
      <footer
        className="border-t-[0.5px] border-white/[0.12] px-5 md:px-10"
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
                    {col.links.map((label) => (
                      <li key={label}>
                        <a
                          href="#"
                          className="text-text-body transition-colors duration-300 hover:text-text-primary"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
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
