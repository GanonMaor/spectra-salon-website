/**
 * Exports the Founder Story investor deck as a 16:9 PDF.
 *
 *   node scripts/export-founder-story-pdf.mjs
 *     [--lang en|he]
 *     [--variant september|short]
 *     [--url http://127.0.0.1:4179]
 *     [--output path/to/file.pdf]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const VARIANTS = {
  september: {
    route: "/investors/september-2026",
    file: "spectra-founder-story-september-2026",
    slides: 17,
  },
  short: {
    route: "/investors/founder-story-short",
    file: "spectra-founder-story-short",
    slides: 12,
  },
};
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;
const PAGE_WIDTH_IN = 20;
const PAGE_HEIGHT_IN = 11.25;
const DEFAULT_PORT = 4181;

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? fallback : (process.argv[idx + 1] ?? fallback);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHttp(url, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await sleep(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startVite(port) {
  const child = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: process.cwd(),
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function waitForDeck(page, expectedSlides) {
  await page.waitForSelector("[data-pdf-export='1']", { timeout: 60000 });
  await page.waitForFunction(
    (expected) => document.querySelectorAll("[data-pdf-slide]").length === expected,
    expectedSlides,
    { timeout: 60000 },
  );
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    try {
      await Promise.all([
        document.fonts.load("400 16px Inter"),
        document.fonts.load("400 48px 'Playfair Display'"),
        document.fonts.load("400 16px Assistant"),
        document.fonts.load("400 48px 'Frank Ruhl Libre'"),
      ]);
    } catch {
      /* fonts may already be ready */
    }
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
      ),
    );
  });
  await sleep(800);
}

async function main() {
  const lang = getArg("--lang", "en");
  const variantKey = getArg("--variant", "september");
  const variant = VARIANTS[variantKey];
  if (!variant) {
    throw new Error(`Unknown variant "${variantKey}". Use september or short.`);
  }
  if (lang !== "en" && lang !== "he") {
    throw new Error(`Unknown lang "${lang}". Use en or he.`);
  }

  const defaultName = `${variant.file}${lang === "en" ? "" : `-${lang}`}.pdf`;
  const output = path.resolve(process.cwd(), getArg("--output", path.join("docs", "investor-presentation", defaultName)));
  const explicitUrl = getArg("--url");

  let vite = null;
  let origin = explicitUrl;
  if (!origin) {
    const port = Number(getArg("--port", String(DEFAULT_PORT)));
    origin = `http://127.0.0.1:${port}`;
    vite = startVite(port);
    await waitForHttp(`${origin}${variant.route}`);
  } else {
    origin = origin.replace(/\/$/, "");
    await waitForHttp(`${origin}${variant.route}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });

  const url = `${origin}${variant.route}?pdf=1&lang=${lang}`;
  console.log(`Opening ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await waitForDeck(page, variant.slides);

  const slideCount = await page.$$eval("[data-pdf-slide]", (nodes) => nodes.length);
  if (slideCount !== variant.slides) {
    throw new Error(`Expected ${variant.slides} slides, found ${slideCount}`);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  await page.pdf({
    path: output,
    width: `${PAGE_WIDTH_IN}in`,
    height: `${PAGE_HEIGHT_IN}in`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await browser.close();
  if (vite) {
    vite.kill("SIGTERM");
    await sleep(400);
    if (vite.exitCode == null) vite.kill("SIGKILL");
  }

  const bytes = fs.statSync(output).size;
  console.log(`PDF  ${output} (${(bytes / 1024 / 1024).toFixed(2)} MB, ${slideCount} slides)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
