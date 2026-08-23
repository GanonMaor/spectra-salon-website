/**
 * Exports the external investor story as a designed slide presentation.
 *
 * The web route stays a continuous editorial page. `?pdf=1` renders a separate
 * deck of fixed 16:9 canvases, so page breaks are composed rather than produced
 * by browser pagination. This script captures that deck three ways and runs the
 * presentation QA gate:
 *
 *   docs/investor-presentation/spectra-investor-presentation.pdf
 *   docs/investor-presentation/slides/01..17-<slug>.png   (1920x1080 each)
 *   docs/investor-presentation/spectra-investor-presentation-contact-sheet.png
 *   docs/investor-presentation/qa-report.json
 *
 *   node scripts/export-external-investor-pdf.mjs [--lang en|he] [--url ...] [--out-dir ...]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROUTE = "/investors/2026-external";
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;
/** Same canvas expressed physically, so Chromium never rescales the PDF. */
const PAGE_WIDTH_IN = 20;
const PAGE_HEIGHT_IN = 11.25;
const EXPECTED_SLIDES = 17;
const DEFAULT_PORT = 4178;
/** Sub-pixel line-box rounding that a fitting composition still reports. */
const SCROLL_TOLERANCE_PX = 4;

const SLIDE_SLUGS = [
  "cover",
  "origin",
  "color-intelligence",
  "turning-point",
  "data-layer",
  "six-salon-evidence",
  "decision-booking",
  "salon-economics",
  "owner-mobile",
  "client-mobile",
  "ai-bridge",
  "salon-ai",
  "opportunity",
  "team-backers",
  "gtm-expansion",
  "raise",
  "closing",
];

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

/** Blocks until fonts, every image and the slide DOM have all settled. */
async function waitForDeck(page) {
  await page.waitForSelector("[data-investor-presentation]", { timeout: 60000 });
  await page.waitForFunction(
    (expected) => document.querySelectorAll("[data-pdf-slide]").length === expected,
    EXPECTED_SLIDES,
    { timeout: 60000 },
  );

  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decoding = "sync";
    });
    await Promise.all([
      document.fonts.load('400 108px "Playfair Display"'),
      document.fonts.load('italic 400 54px "Playfair Display"'),
      document.fonts.load('400 54px "Frank Ruhl Libre"'),
      document.fonts.load('300 20px "Assistant"'),
    ]).catch(() => {});
    await document.fonts.ready;
  });

  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 60000 },
  );
  await page.waitForTimeout(1500);
}

/** Presentation QA gate: geometry, overflow, clipping and asset integrity. */
async function auditDeck(page) {
  return page.evaluate(
    ({ slideWidth, slideHeight, SCROLL_TOLERANCE_PX }) => {
      const slides = Array.from(document.querySelectorAll("[data-pdf-slide]"));
      const report = slides.map((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const content = slide.querySelector("[data-slide-content]");
        const contentRect = content?.getBoundingClientRect();

        // Two independent signals. `childOverflow` is the composition gate: any
        // element crossing the safe area is a real clipping risk. `scrollOverflow`
        // is a coarser backstop that carries a few px of sub-pixel line-box
        // rounding even on compositions that fit, so it gets a small tolerance.
        let scrollOverflow = 0;
        let childOverflow = 0;
        let overflowInline = 0;
        let offender = null;
        if (content && contentRect) {
          scrollOverflow = Math.max(0, content.scrollHeight - content.clientHeight);
          overflowInline = Math.max(0, content.scrollWidth - content.clientWidth);

          for (const child of Array.from(content.querySelectorAll("*"))) {
            const childRect = child.getBoundingClientRect();
            if (childRect.width === 0 && childRect.height === 0) continue;
            const past = Math.round(childRect.bottom - contentRect.bottom);
            if (past > childOverflow) {
              childOverflow = past;
              offender = `${child.tagName.toLowerCase()} "${(child.textContent || "").trim().slice(0, 48)}"`;
            }
          }
        }

        const brokenImages = Array.from(slide.querySelectorAll("img"))
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src"));

        const bands =
          (childOverflow > 1 || scrollOverflow > SCROLL_TOLERANCE_PX) && content
            ? Array.from(content.children).map((child) => ({
                tag: child.tagName.toLowerCase(),
                height: Math.round(child.getBoundingClientRect().height),
                text: (child.textContent || "").trim().slice(0, 32),
              }))
            : undefined;

        return {
          index: index + 1,
          bands,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          correctSize: Math.round(rect.width) === slideWidth && Math.round(rect.height) === slideHeight,
          scrollOverflow,
          childOverflow,
          overflowInline,
          offender,
          brokenImages,
        };
      });

      return {
        slideCount: slides.length,
        documentOverflowX: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
        slides: report,
      };
    },
    { slideWidth: SLIDE_WIDTH, slideHeight: SLIDE_HEIGHT, SCROLL_TOLERANCE_PX },
  );
}

async function buildContactSheet(page, slideFiles, outPath) {
  const columns = 4;
  const thumbWidth = 440;
  const thumbHeight = Math.round((thumbWidth * SLIDE_HEIGHT) / SLIDE_WIDTH);
  const gap = 22;
  const pad = 40;
  const rows = Math.ceil(slideFiles.length / columns);
  const sheetWidth = pad * 2 + columns * thumbWidth + (columns - 1) * gap;
  const sheetHeight = pad * 2 + rows * (thumbHeight + 30) + (rows - 1) * gap;

  const items = slideFiles
    .map(
      (file, index) => `
      <figure style="margin:0">
        <img src="file://${file}" width="${thumbWidth}" height="${thumbHeight}"
             style="display:block;width:${thumbWidth}px;height:${thumbHeight}px;border:1px solid rgba(43,34,27,0.18)" />
        <figcaption style="margin-top:8px;font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;
             text-transform:uppercase;color:rgba(43,34,27,.5)">
          ${String(index + 1).padStart(2, "0")} · ${SLIDE_SLUGS[index] ?? ""}
        </figcaption>
      </figure>`,
    )
    .join("");

  // Chromium refuses file:// subresources from an http page, so the sheet is
  // assembled from its own file:// document alongside the exported frames.
  const scratch = path.join(path.dirname(outPath), ".contact-sheet.html");
  fs.writeFileSync(
    scratch,
    `<!doctype html><html><body style="margin:0;background:#efe7dd">
       <div style="padding:${pad}px;display:grid;grid-template-columns:repeat(${columns},${thumbWidth}px);gap:${gap}px">
         ${items}
       </div>
     </body></html>`,
  );

  await page.setViewportSize({ width: sheetWidth, height: sheetHeight });
  await page.goto(`file://${scratch}`, { waitUntil: "load" });
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 60000 },
  );
  await page.screenshot({ path: outPath, fullPage: true });
  fs.rmSync(scratch, { force: true });
}

async function main() {
  const lang = getArg("--lang", "en");
  const explicitUrl = getArg("--url");
  const outDir = path.resolve(getArg("--out-dir", path.join("docs", "investor-presentation")));
  const slidesDir = path.join(outDir, "slides");
  const pdfPath = path.join(outDir, `spectra-investor-presentation${lang === "en" ? "" : `-${lang}`}.pdf`);
  const sheetPath = path.join(outDir, "spectra-investor-presentation-contact-sheet.png");
  const reportPath = path.join(outDir, "qa-report.json");

  fs.mkdirSync(slidesDir, { recursive: true });
  for (const file of fs.readdirSync(slidesDir)) {
    if (file.endsWith(".png")) fs.rmSync(path.join(slidesDir, file));
  }

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
    viewport: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });

  const failures = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && /\.(png|jpg|jpeg|webp|mp4|woff2?)$/i.test(res.url())) {
      failures.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto(`${origin}${ROUTE}?pdf=1`, { waitUntil: "networkidle", timeout: 120000 });

  if (lang === "he") {
    await page.evaluate(() => {
      const root = document.querySelector("[data-pdf-export]");
      if (root) root.setAttribute("dir", "rtl");
    });
  }

  await waitForDeck(page);

  const audit = await auditDeck(page);

  // 1. PDF, one physical 16:9 page per composed slide.
  await page.pdf({
    path: pdfPath,
    width: `${PAGE_WIDTH_IN}in`,
    height: `${PAGE_HEIGHT_IN}in`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  // 2. One PNG per slide, straight off the same DOM the PDF used.
  const slideFiles = [];
  const handles = await page.$$("[data-pdf-slide]");
  for (let index = 0; index < handles.length; index += 1) {
    const slug = SLIDE_SLUGS[index] ?? `slide-${index + 1}`;
    const file = path.join(slidesDir, `${String(index + 1).padStart(2, "0")}-${slug}.png`);
    await handles[index].screenshot({ path: file });
    slideFiles.push(file);
  }

  // 3. Contact sheet, generated from the exported frames so it cannot drift.
  await buildContactSheet(page, slideFiles, sheetPath);

  await browser.close();
  if (vite) vite.kill("SIGTERM");

  const problems = [];
  if (audit.slideCount !== EXPECTED_SLIDES) {
    problems.push(`expected ${EXPECTED_SLIDES} slides, found ${audit.slideCount}`);
  }
  if (audit.documentOverflowX > 0) problems.push(`document overflows horizontally by ${audit.documentOverflowX}px`);
  for (const slide of audit.slides) {
    if (!slide.correctSize) problems.push(`slide ${slide.index}: ${slide.width}x${slide.height}`);
    if (slide.childOverflow > 1) {
      problems.push(
        `slide ${slide.index}: ${slide.childOverflow}px past the safe area (${slide.offender ?? "unknown"})`,
      );
    }
    if (slide.scrollOverflow > SCROLL_TOLERANCE_PX) {
      problems.push(`slide ${slide.index}: composition is ${slide.scrollOverflow}px too tall`);
    }
    if (slide.overflowInline > 1) problems.push(`slide ${slide.index}: inline overflow ${slide.overflowInline}px`);
    if (slide.brokenImages.length) problems.push(`slide ${slide.index}: broken media ${slide.brokenImages.join(", ")}`);
  }

  const report = { lang, generatedAt: new Date().toISOString(), audit, problems, failures: [...new Set(failures)] };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const bytes = fs.statSync(pdfPath).size;
  console.log(`PDF          ${pdfPath} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Slides       ${slideFiles.length} PNG frames in ${slidesDir}`);
  console.log(`Contact      ${sheetPath}`);
  console.log(`QA report    ${reportPath}`);
  if (problems.length) {
    console.log("\nQA problems:");
    for (const problem of problems) console.log(`  - ${problem}`);
  } else {
    console.log("\nQA: all slides pass geometry, overflow and media checks.");
  }
  if (report.failures.length) {
    console.log("\nRuntime issues:");
    for (const failure of report.failures) console.log(`  - ${failure}`);
  }
  if (problems.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
