import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const DECK_PATH = "/investors/new-narrative-salon-ai-first";
const WIDTH = 1920;
const HEIGHT = 1080;
const DEFAULT_PORT = 4177;
const DEFAULT_OUTPUT = path.join("docs", "salon-ai-investor-deck.pdf");

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* server not up yet */
    }
    await sleep(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startVite(port) {
  const child = spawn(
    "npx",
    ["vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: process.cwd(),
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.on("data", (buf) => {
    if (hasFlag("--verbose")) process.stdout.write(String(buf));
  });
  child.stderr?.on("data", (buf) => {
    if (hasFlag("--verbose")) process.stderr.write(String(buf));
  });
  return child;
}

function chromePath() {
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(mac)) return mac;
  const macCanary = "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary";
  if (fs.existsSync(macCanary)) return macCanary;
  return undefined;
}

async function waitForDeckReady(page) {
  await page.waitForSelector("[data-pdf-export='1']", { timeout: 60000 });
  await page.waitForSelector("[data-pdf-slide]", { timeout: 30000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    try {
      await document.fonts.load("400 16px Inter");
      await document.fonts.load("300 48px Inter");
    } catch {
      /* Inter may already be ready */
    }
    const images = [...document.images];
    await Promise.all(
      images.map((img) =>
        img.complete
          ? null
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
      ),
    );
    const videos = [...document.querySelectorAll("video")];
    await Promise.all(
      videos.map(
        (video) =>
          video.readyState >= 2
            ? null
            : new Promise((resolve) => {
                const done = () => resolve(null);
                video.addEventListener("loadeddata", done, { once: true });
                video.addEventListener("error", done, { once: true });
                setTimeout(done, 3500);
              }),
      ),
    );
  });
  await sleep(1400);
}

async function captureDeck({ baseUrl, outputAbs }) {
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--font-render-hinting=none",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
    },
  });

  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.emulateMediaType("screen");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

    const url = `${baseUrl}${DECK_PATH}?pdf=1`;
    console.log(`Opening ${url}`);
    await page.goto(url, { waitUntil: "load", timeout: 120000 });
    await waitForDeckReady(page);

    const slideCount = await page.$$eval("[data-pdf-slide]", (nodes) => nodes.length);
    console.log(`Printing ${slideCount} vector pages at ${WIDTH}×${HEIGHT}`);

    fs.mkdirSync(path.dirname(outputAbs), { recursive: true });
    await page.pdf({
      path: outputAbs,
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}

const providedUrl = getArg("--url");
const output = path.resolve(process.cwd(), getArg("--output") ?? DEFAULT_OUTPUT);
const port = Number(getArg("--port") ?? DEFAULT_PORT);

let vite = null;

try {
  const baseUrl = providedUrl ? providedUrl.replace(/\/$/, "") : `http://127.0.0.1:${port}`;
  if (!providedUrl) {
    vite = startVite(port);
    await waitForHttp(baseUrl);
  } else {
    await waitForHttp(baseUrl);
  }

  await captureDeck({ baseUrl, outputAbs: output });
  const bytes = fs.statSync(output).size;
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  console.log(`Wrote PDF (${mb} MB): ${output}`);
} finally {
  if (vite) {
    vite.kill("SIGTERM");
    await sleep(400);
    if (vite.exitCode == null) vite.kill("SIGKILL");
  }
}
