#!/usr/bin/env node
/**
 * Asset intake validator for the "Spectra Product & Vision" investor page.
 *
 * Compares the files under public/investor-vision/ against the expected assets
 * declared in src/screens/SpectraProductVision/assetManifest.ts and reports:
 *   - missing critical assets        (loud warning)
 *   - missing recommended assets     (warning)
 *   - missing optional assets        (info — never a failure)
 *   - unexpected extra files         (info)
 *   - wrong file extension           (warning — basename matches, ext differs)
 *
 * Exit code:
 *   0  by default (does NOT fail the build, even with missing criticals).
 *   1  only when run with --strict AND a critical asset is missing.
 *
 * Usage:
 *   node scripts/check-investor-assets.mjs
 *   node scripts/check-investor-assets.mjs --strict
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "src/screens/SpectraProductVision/assetManifest.ts");
const PUBLIC_DIR = path.join(ROOT, "public/investor-vision");

const STRICT = process.argv.includes("--strict");

// ── tiny ANSI helpers ──────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};
const tag = {
  ok: `${c.green}✓${c.reset}`,
  miss: `${c.red}✗${c.reset}`,
  warn: `${c.yellow}!${c.reset}`,
  info: `${c.cyan}·${c.reset}`,
};

// ── parse the manifest (no TS runtime needed) ──────────────────────────
function parseManifest(src) {
  const start = src.indexOf("export const ASSETS = {");
  const end = src.indexOf("} as const", start);
  if (start === -1 || end === -1) {
    throw new Error("Could not locate ASSETS block in manifest.");
  }
  const region = src.slice(start, end);

  // Each asset is `key: { ...no nested braces... }`.
  const blockRe = /(\w+):\s*\{([^}]*)\}/g;
  const field = (body, name) => {
    const m = body.match(new RegExp(`${name}:\\s*"([^"]+)"`));
    return m ? m[1] : undefined;
  };

  const assets = [];
  let m;
  while ((m = blockRe.exec(region)) !== null) {
    const body = m[2];
    const file = field(body, "file");
    const section = field(body, "section");
    if (!file || !section) continue; // skip anything that isn't an asset entry
    assets.push({
      id: field(body, "id") || m[1],
      section,
      file,
      priority: field(body, "priority") || "optional",
      file2x: field(body, "file2x"),
      poster: field(body, "poster"),
    });
  }
  return assets;
}

// ── walk shipped files ─────────────────────────────────────────────────
function walkPublic(dir) {
  /** @type {{section:string,file:string}[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const section of fs.readdirSync(dir)) {
    const sectionPath = path.join(dir, section);
    if (!fs.statSync(sectionPath).isDirectory()) continue;
    for (const file of fs.readdirSync(sectionPath)) {
      const filePath = path.join(sectionPath, file);
      if (fs.statSync(filePath).isFile() && !file.startsWith(".")) {
        out.push({ section, file });
      }
    }
  }
  return out;
}

const baseNoExt = (f) => f.replace(/\.[^.]+$/, "");

// ── run ─────────────────────────────────────────────────────────────────
function main() {
  const src = fs.readFileSync(MANIFEST, "utf8");
  const assets = parseManifest(src);

  // Expected set includes primary files + declared @2x / poster siblings.
  /** @type {Map<string,{priority:string,kind:'primary'|'sibling',id:string}>} */
  const expected = new Map();
  for (const a of assets) {
    expected.set(`${a.section}/${a.file}`, { priority: a.priority, kind: "primary", id: a.id });
    if (a.file2x) expected.set(`${a.section}/${a.file2x}`, { priority: "recommended", kind: "sibling", id: a.id });
    if (a.poster) expected.set(`${a.section}/${a.poster}`, { priority: a.priority, kind: "sibling", id: a.id });
  }

  const actual = walkPublic(PUBLIC_DIR);
  const actualSet = new Set(actual.map((x) => `${x.section}/${x.file}`));

  const missingCritical = [];
  const missingRecommended = [];
  const missingOptional = [];

  for (const a of assets) {
    const key = `${a.section}/${a.file}`;
    if (actualSet.has(key)) continue;
    if (a.priority === "critical") missingCritical.push(a);
    else if (a.priority === "recommended") missingRecommended.push(a);
    else missingOptional.push(a);
  }

  // Extra + wrong-extension detection.
  const expectedBasenames = new Map(); // `${section}/${base}` -> expectedFilename
  for (const key of expected.keys()) {
    const [section, file] = key.split("/");
    expectedBasenames.set(`${section}/${baseNoExt(file)}`, file);
  }
  const extras = [];
  const wrongExt = [];
  for (const { section, file } of actual) {
    const key = `${section}/${file}`;
    if (expected.has(key)) continue;
    const baseKey = `${section}/${baseNoExt(file)}`;
    if (expectedBasenames.has(baseKey)) {
      wrongExt.push({ section, file, expected: expectedBasenames.get(baseKey) });
    } else {
      extras.push({ section, file });
    }
  }

  // ── report ──
  const foundCount = assets.filter((a) => actualSet.has(`${a.section}/${a.file}`)).length;
  console.log("");
  console.log(`${c.bold}Spectra Product & Vision — asset check${c.reset}`);
  console.log(`${c.dim}manifest:${c.reset} ${path.relative(ROOT, MANIFEST)}`);
  console.log(`${c.dim}assets dir:${c.reset} ${path.relative(ROOT, PUBLIC_DIR)}${fs.existsSync(PUBLIC_DIR) ? "" : " (does not exist yet)"}`);
  console.log("");
  console.log(`${tag.ok} Primary assets found: ${c.bold}${foundCount}/${assets.length}${c.reset}`);

  const list = (label, arr, t) => {
    if (arr.length === 0) return;
    console.log("");
    console.log(`${t} ${c.bold}${label} (${arr.length})${c.reset}`);
    for (const a of arr) {
      const f = a.file ? `${a.section}/${a.file}` : `${a.section}/${a.expected}`;
      const extra = a.expected ? ` ${c.dim}(found ${a.file}, expected ${a.expected})${c.reset}` : "";
      console.log(`   ${f}${extra}`);
    }
  };

  list("Missing CRITICAL assets", missingCritical, tag.miss);
  list("Missing recommended assets", missingRecommended, tag.warn);
  list("Wrong file extension", wrongExt, tag.warn);
  list("Missing optional assets (not required yet)", missingOptional, tag.info);
  list("Unexpected extra files", extras, tag.info);

  console.log("");
  if (missingCritical.length === 0) {
    console.log(`${tag.ok} ${c.green}No critical assets missing.${c.reset}`);
  } else {
    console.log(
      `${tag.miss} ${c.red}${missingCritical.length} critical asset(s) missing.${c.reset} ` +
        `${c.dim}The page still renders cleanly (graceful fallback), but these are needed for the full experience.${c.reset}`,
    );
  }
  console.log(
    `${c.dim}Place files at public/investor-vision/<section>/<filename> — see investor-assets/ASSET_INTAKE_GUIDE.md${c.reset}`,
  );
  console.log("");

  if (STRICT && missingCritical.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(`${c.red}Asset check failed:${c.reset}`, err.message);
  // A parser/IO failure should not break the build by default.
  process.exit(STRICT ? 1 : 0);
}
