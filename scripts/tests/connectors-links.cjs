/* The Infrastructure connectors' docs links, end to end (2026-10-12).
   Needs the dev server on :3000 (`npm run dev`). Run from the repo root:
     node scripts/tests/connectors-links.cjs
   Opens the Integrations frame, switches to CONNECTORS, then: mouse hover +
   click on a card, a click on its legend, a click where a hidden legend
   sits (must open nothing), and on touch tap-to-light then tap-to-open.
   Clicks are recorded by a window listener and cancelled, so the page
   never leaves; "opened" lists the links the site let through. */
const { chromium } = require("playwright");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const run = async (label, ctxOpts, body) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...ctxOpts });
    const page = await ctx.newPage();
    const hits = [];
    await page.route("https://docs.cocoding.ai/**", (route) => { hits.push(route.request().url().replace("https://docs.cocoding.ai", "")); route.abort(); });
    // every click: which link it was on and whether the site let it open; then cancel it, so the page stays
    await page.addInitScript(() => {
      window.__opened = [];
      addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest("a");
        if (a && !e.defaultPrevented) window.__opened.push(a.getAttribute("href").replace("https://docs.cocoding.ai", ""));
        e.preventDefault();
      });
    });
    await page.goto("http://localhost:3000/", { waitUntil: "load" });
    await sleep(1500);
    // bring the Infrastructure into view and open the Integrations frame from its title
    await page.evaluate(() => document.querySelector('[data-item-title="integrations"]').scrollIntoView({ block: "center" }));
    await sleep(800);
    await page.click('[data-item-title="integrations"]');
    await sleep(3500);
    // the CONNECTORS tab
    const tab = page.locator("svg text", { hasText: /^CONNECTORS$/ }).first();
    await tab.click({ force: true });
    await sleep(2500);
    const state = () => page.evaluate(() => {
      const lit = [...document.querySelectorAll('[data-callout^="connectors:"]')].filter((g) => getComputedStyle(g).opacity > 0.5).map((g) => g.getAttribute("data-callout").split(":")[1]);
      const clickable = [...document.querySelectorAll('[data-callout^="connectors:"]')].filter((g) => getComputedStyle(g).pointerEvents !== "none").map((g) => g.getAttribute("data-callout").split(":")[1]);
      return { shownLegend: lit.join(","), clickableLegends: clickable.join(","), url: location.pathname };
    });
    const out = { label, start: await state() };
    await body(page, hits, out, state);
    out.opened = await page.evaluate(() => window.__opened); out.networkHits = hits;
    console.log(JSON.stringify(out, null, 1));
    await ctx.close();
  };

  // MOUSE: hover lights, one click opens; the lit legend opens; a hidden legend does not
  await run("mouse", {}, async (page, hits, out, state) => {
    await page.hover('[data-card="connectors:stripe"]');
    await sleep(600);
    out.afterHoverStripe = await state();
    await page.click('[data-card="connectors:stripe"]');
    await sleep(500);
    out.openedAfterCardClick = await page.evaluate(() => [...window.__opened]);
    await page.click('[data-callout="connectors:stripe"] a');
    await sleep(500);
    out.openedAfterLegendClick = await page.evaluate(() => [...window.__opened]);
    // where the (hidden) TELEGRAM legend's label sits — next to STRIPE's
    const box = await page.locator('[data-callout="connectors:telegram"] text').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(300);
    out.hoverOverHiddenLegend = await state();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(500);
    out.openedAfterHiddenLegendClick = await page.evaluate(() => [...window.__opened]);
    // all nine links
    out.cardLinks = await page.evaluate(() => [...document.querySelectorAll('[data-card^="connectors:"] > a')].map((a) => a.getAttribute("href").replace("https://docs.cocoding.ai", "")).sort().join(" "));
    out.legendLinks = await page.evaluate(() => [...document.querySelectorAll('[data-callout^="connectors:"] a')].map((a) => a.getAttribute("href").replace("https://docs.cocoding.ai", "")).sort().join(" "));
    out.buildinLinks = await page.evaluate(() => document.querySelectorAll('[data-card^="buildin:"] a, [data-callout^="buildin:"] a').length);
  });

  // TOUCH: the first tap on an unlit card lights it, a tap on the lit one opens
  await run("touch", { hasTouch: true }, async (page, hits, out, state) => {
    await page.tap('[data-card="connectors:slack"]');
    await sleep(700);
    out.afterFirstTap = { ...(await state()), opened: await page.evaluate(() => [...window.__opened]) };
    await page.tap('[data-card="connectors:slack"]');
    await sleep(500);
    out.afterSecondTap = { opened: await page.evaluate(() => [...window.__opened]) };
    await page.tap('[data-callout="connectors:slack"] a');
    await sleep(500);
    out.afterLegendTap = { opened: await page.evaluate(() => [...window.__opened]) };
  });
  await browser.close();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
