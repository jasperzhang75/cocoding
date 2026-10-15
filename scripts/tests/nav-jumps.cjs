/* The in-page jumps (nav bar and footer links) with REAL smooth scrolling,
   in Chromium and WebKit, three runs each (2026-10-15). Needs the dev
   server on :3000. Run from the repo root: node scripts/tests/nav-jumps.cjs
   Each jump must land its section's eyebrow 80px from the top (under the
   pinned nav bar) and must not be held by the Infrastructure — the first
   version ended a jump 150ms after the click, before a busy page had even
   started scrolling, and the hold caught it. Prints the eyebrow's top per
   run, HELD(...) when the hold caught the page. */
const pw = require("playwright");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const name of ["chromium", "webkit"]) {
    const browser = await pw[name].launch();
    const tally = {};
    for (let run = 0; run < 3; run++) {
      for (const label of ["Features", "Testimonial", "Pricing"]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        await page.goto("http://localhost:3000/", { waitUntil: "load" }); await sleep(1800);
        await page.locator(".group\\/nav").getByRole("link", { name: label }).click();
        await sleep(3000);
        const r = await page.evaluate((id) => ({ e: Math.round(document.getElementById(id).querySelector("p").getBoundingClientRect().top), h: document.documentElement.style.overflow === "hidden" }), label.toLowerCase());
        (tally[`top->${label}`] = tally[`top->${label}`] || []).push(r.h ? `HELD(${r.e})` : r.e);
        await page.close();
      }
      for (const label of ["Features", "Pricing"]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        await page.goto("http://localhost:3000/#testimonial", { waitUntil: "load" }); await sleep(1500);
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
        await page.locator("footer").getByRole("link", { name: label }).click();
        await sleep(3000);
        const r = await page.evaluate((id) => ({ e: Math.round(document.getElementById(id).querySelector("p").getBoundingClientRect().top), h: document.documentElement.style.overflow === "hidden" }), label.toLowerCase());
        (tally[`footer->${label}`] = tally[`footer->${label}`] || []).push(r.h ? `HELD(${r.e})` : r.e);
        await page.close();
      }
    }
    console.log(name, JSON.stringify(tally));
    await browser.close();
  }
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
