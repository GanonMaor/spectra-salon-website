/**
 * Exports the external investor story as a sendable PDF.
 *
 * The page is an editorial feature rather than a slide deck. It is printed
 * landscape (16:9) at desktop width with chapter-level page breaks.
 *
 *   node scripts/export-external-investor-pdf.mjs [--lang en|he] [--url ...] [--out ...]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROUTE = "/investors/2026-external";
const PAGE_WIDTH_PX = 1920;
const PAGE_HEIGHT_PX = 1080;
const DEFAULT_PORT = 4178;

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
  const log = (buf) => {
    if (process.argv.includes("--verbose")) process.stdout.write(String(buf));
  };
  child.stdout?.on("data", log);
  child.stderr?.on("data", log);
  return child;
}

async function main() {
  const lang = getArg("--lang", "en");
  const explicitUrl = getArg("--url");
  const out = path.resolve(
    getArg("--out", path.join("docs", `spectra-investor-story-${lang}.pdf`)),
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });

  let vite = null;
  let origin = explicitUrl;
  if (!origin) {
    const port = Number(getArg("--port", String(DEFAULT_PORT)));
    origin = `http://127.0.0.1:${port}`;
    vite = startVite(port);
    await waitForHttp(`${origin}${ROUTE}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });

  const failures = [];
  page.on("pageerror", (error) => failures.push(String(error.message)));
  page.on("response", (res) => {
    if (res.status() >= 400 && /\.(png|jpg|jpeg|webp|mp4|woff2?)$/i.test(res.url())) {
      failures.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto(`${origin}${ROUTE}?pdf=1`, { waitUntil: "networkidle", timeout: 120000 });

  if (lang === "he") {
    await page.getByRole("button", { name: /עברית/ }).click();
    await page.waitForTimeout(600);
  }

  // Fonts and lazy media must settle before the print snapshot.
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decoding = "sync";
    });
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 60000 },
  );

  await page.addStyleTag({
    content: `
      @page { size: ${PAGE_WIDTH_PX}px ${PAGE_HEIGHT_PX}px; margin: 0; }
      @media print {
        html, body { width: ${PAGE_WIDTH_PX}px !important; }
        .investor-update-page > header { display: none !important; }
      }
    `,
  });

  await page.pdf({
    path: out,
    width: `${PAGE_WIDTH_PX}px`,
    height: `${PAGE_HEIGHT_PX}px`,
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await browser.close();
  if (vite) vite.kill("SIGTERM");

  const bytes = fs.statSync(out).size;
  console.log(`PDF written: ${out} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  if (failures.length) {
    console.log("Issues during capture:");
    for (const failure of [...new Set(failures)]) console.log(`  - ${failure}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
