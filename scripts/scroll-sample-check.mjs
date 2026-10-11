import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = "http://localhost:3000/investors/2026-external?lang=en";
const OUT = path.resolve("/tmp/scroll-sample");
fs.mkdirSync(OUT, { recursive: true });

// Slide 6 was downgraded from a pinned stage to a plain reveal slide (see
// task 45), so it no longer has a [data-scroll-stage] wrapper to sample.
const SECTIONS = ["web-deck-israel-solution", "web-deck-bowl-data", "web-deck-salon-ai-expansion"];

const FRACTIONS = [0, 0.15, 0.35, 0.55, 0.75, 0.95, 1.05];

async function main() {
  const browser = await chromium.launch();

  for (const id of SECTIONS) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    page.on("pageerror", (e) => console.log(`PAGEERROR [${id}]:`, e.message));
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector("[data-investor-presentation]", { timeout: 30000 });
    await page.waitForTimeout(600);

    const metrics = await page.evaluate((sectionId) => {
      const section = document.getElementById(sectionId);
      const wrapper = section?.closest("[data-scroll-stage]");
      if (!wrapper) return null;
      const rect = wrapper.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const wrapperHeight = wrapper.offsetHeight;
      return { top, wrapperHeight, viewport: window.innerHeight };
    }, id);

    if (!metrics) {
      console.log(`MISSING wrapper for ${id}`);
      await page.close();
      continue;
    }

    const pinnedRange = Math.max(0, metrics.wrapperHeight - metrics.viewport);
    for (const frac of FRACTIONS) {
      const y = Math.round(metrics.top + frac * pinnedRange);
      await page.evaluate((yy) => window.scrollTo({ top: yy, left: 0, behavior: "instant" }), y);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT, `${id}__frac${Math.round(frac * 100)}.png`) });
    }
    await page.close();
  }

  await browser.close();
  console.log("Wrote screenshots to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
