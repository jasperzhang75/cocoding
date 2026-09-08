import { ImageResponse } from "next/og";

/* THE SHARE IMAGE (og:image / twitter:image), prerendered at build: the
   site's black ground, a blue glow at the right like the closing call's,
   the mark and "Cocoding" beside it, and the hero's line under them.
   Satori draws it with the Geist that next/og bundles (regular only);
   the mark is public/logo-mark.svg's two paths inline. The glow is an
   SVG radialGradient in an <img> (resvg draws it faithfully) — Satori's
   own radial-gradient with alpha stops came out as a ring around a
   black hole. */

const GLOW = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="540" viewBox="0 0 620 540"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#316FC5" stop-opacity="0.55"/><stop offset="0.45" stop-color="#245292" stop-opacity="0.28"/><stop offset="1" stop-color="#18365F" stop-opacity="0"/></radialGradient></defs><ellipse cx="310" cy="270" rx="310" ry="270" fill="url(#g)"/></svg>`;

export const alt = "Cocoding — create secure apps and websites that work from day one.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#010101",
          color: "#FFFFFF",
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori, not the DOM */}
        <img
          src={`data:image/svg+xml,${encodeURIComponent(GLOW)}`}
          width={620}
          height={540}
          alt=""
          style={{ position: "absolute", right: -60, top: 40 }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="84" height="48" viewBox="0 0 25.8834 14.7341" fill="none">
            <path
              d="M18.1173 0.0432456C18.828 -0.0216594 19.8889 0.0961276 20.5591 0.298175C22.4728 0.867606 24.0802 2.17682 25.025 3.93557C25.9293 5.63739 26.1281 7.62656 25.5788 9.47375C24.4246 13.2723 20.3998 15.6001 16.5478 14.4305C15.6353 14.1572 14.7871 13.7031 14.0536 13.0952C13.9299 12.993 13.7133 12.7564 13.5973 12.6404C13.7133 12.5244 15.2763 10.9624 15.507 10.7014C15.6725 10.8063 15.8457 10.9593 16.0093 11.0775C17.4099 12.0891 19.376 12.1961 20.8426 11.2446C21.1092 11.0858 21.2509 10.9874 21.4865 10.7809C22.3967 9.99633 22.951 8.87682 23.0228 7.67725C23.1006 6.42825 22.7219 5.30902 21.8889 4.37015C21.1186 3.49025 20.0298 2.95333 18.8628 2.87808C16.3819 2.73916 15.4876 4.13054 13.9167 5.722C12.9026 6.66573 11.898 7.7543 10.8748 8.66714C10.2644 8.05194 9.64983 7.44086 9.03117 6.83398C9.8684 5.92148 10.7591 5.04878 11.6112 4.15725C13.6097 2.06636 14.9723 0.226184 18.1173 0.0432456Z"
              fill="#4D74E1"
            />
            <path
              d="M7.76615 14.6909C7.0554 14.7558 5.99451 14.638 5.3243 14.4359C3.41067 13.8665 1.80323 12.5573 0.858419 10.7985C-0.0459064 9.09671 -0.244646 7.10754 0.304664 5.26036C1.45883 1.46182 5.48363 -0.865994 9.33567 0.303579C10.2482 0.576926 11.0964 1.03104 11.8298 1.63891C11.9536 1.74112 12.1701 1.97773 12.2861 2.0937C12.1701 2.20967 10.6071 3.77169 10.3765 4.03269C10.2109 3.92784 10.0378 3.77477 9.87417 3.65659C8.47354 2.64502 6.50747 2.538 5.04083 3.48955C4.7742 3.64827 4.63249 3.74673 4.39696 3.95322C3.48671 4.73778 2.93247 5.85729 2.86062 7.05686C2.78286 8.30585 3.16157 9.42509 3.99455 10.364C4.76482 11.2439 5.85366 11.7808 7.02059 11.856C9.50152 11.9949 10.3711 10.4972 11.9668 9.01211C12.9808 8.06838 13.9854 6.97981 15.0086 6.06697C15.619 6.68217 16.2336 7.29325 16.8523 7.90013C16.015 8.81263 15.1243 9.68533 14.2722 10.5769C12.2738 12.6677 10.9111 14.5079 7.76615 14.6909Z"
              fill="#DEDCDC"
            />
          </svg>
          <div style={{ marginLeft: 28, fontSize: 72, letterSpacing: -2 }}>Cocoding</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, lineHeight: 1.3, color: "#A1A1A1", maxWidth: 760 }}>
          Create secure apps and websites that work from day one.
        </div>
      </div>
    ),
    { ...size }
  );
}
