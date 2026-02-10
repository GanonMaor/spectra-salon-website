import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const input = getArg("--input");
const output = getArg("--output");

if (!input || !output) {
  console.error(
    "Usage: node scripts/render-pdf.mjs --input <htmlPath> --output <pdfPath>"
  );
  process.exit(1);
}

const inputAbs = path.resolve(process.cwd(), input);
const outputAbs = path.resolve(process.cwd(), output);

if (!fs.existsSync(inputAbs)) {
  console.error(`Input file not found: ${inputAbs}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputAbs), { recursive: true });

const chromeMac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath = fs.existsSync(chromeMac) ? chromeMac : undefined;

const browser = await puppeteer.launch({
  executablePath,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.emulateMediaType("screen");

  const u = new URL(pathToFileURL(inputAbs));
  u.searchParams.set("v", String(Date.now()));
  await page.goto(u.toString(), { waitUntil: "load" });

  await page.pdf({
    path: outputAbs,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "12mm",
      right: "12mm",
    },
  });

  console.log(`Wrote PDF: ${outputAbs}`);
} finally {
  await browser.close();
}
