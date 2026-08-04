#!/usr/bin/env node
/**
 * Download official TRUSS packshots only from approved official_image_url hosts.
 * Writes originals + public web paths. Never generates AI images.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const crypto = require("crypto");

const TRUSS_ROOT = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../../..");
const IN_PATH = path.join(TRUSS_ROOT, "normalized/enriched-records.json");
const FALLBACK_IN = path.join(TRUSS_ROOT, "normalized/extracted-records.json");
const ORIG_DIR = path.join(TRUSS_ROOT, "media/originals");
const PUBLIC_DIR = path.join(ROOT, "public/catalog-products/truss-professional");
const REPORT_PATH = path.join(TRUSS_ROOT, "reports/image-source-report.json");

const ALLOWED_HOST_SUFFIXES = [
  "trussprofessional.com",
  "trussprofessional.ae",
  "cdn.shopify.com", // official Shopify CDN used by TRUSS storefronts
];

function productStableId(rec) {
  if (rec.trs_code) return `truss-${rec.trs_code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (rec.ean_barcode) return `truss-ean-${rec.ean_barcode}`;
  return `truss-page-${rec.source_pdf_page}`;
}

function hostAllowed(hostname) {
  const h = String(hostname || "").toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((s) => h === s || h.endsWith(`.${s}`));
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      {
        headers: { "User-Agent": "SpectraTRUSSCatalogBot/1.0" },
        timeout: 15000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          if (!hostAllowed(new URL(next).hostname)) {
            reject(new Error("redirect_blocked"));
            res.resume();
            return;
          }
          res.resume();
          download(next, destPath).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`http_${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          fs.writeFileSync(destPath, buf);
          resolve({ bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex") });
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

function extFromUrl(url) {
  const p = new URL(url).pathname.toLowerCase();
  if (p.endsWith(".png")) return ".png";
  if (p.endsWith(".webp")) return ".webp";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return ".jpg";
  return ".jpg";
}

async function main() {
  fs.mkdirSync(ORIG_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const inPath = fs.existsSync(IN_PATH) ? IN_PATH : FALLBACK_IN;
  const records = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const report = {
    generated_at: new Date().toISOString(),
    downloaded: 0,
    skipped_no_url: 0,
    blocked_host: 0,
    failed: 0,
    items: [],
  };

  for (const rec of records) {
    const id = productStableId(rec);
    if (!rec.official_image_url) {
      report.skipped_no_url += 1;
      rec.image_status = "missing_official_image";
      continue;
    }
    let host;
    try {
      host = new URL(rec.official_image_url).hostname;
    } catch {
      report.failed += 1;
      continue;
    }
    if (!hostAllowed(host)) {
      report.blocked_host += 1;
      rec.image_status = "missing_official_image";
      report.items.push({ id, status: "blocked_host", host });
      continue;
    }

    const ext = extFromUrl(rec.official_image_url);
    const origPath = path.join(ORIG_DIR, `${id}${ext}`);
    const publicRel = `catalog-products/truss-professional/${id}${ext}`;
    const publicPath = path.join(ROOT, "public", publicRel);

    try {
      const meta = await download(rec.official_image_url, origPath);
      fs.copyFileSync(origPath, publicPath);
      rec.primary_image_path = `/${publicRel}`;
      rec.image_source_url = rec.official_image_url;
      rec.image_status = "official_local";
      report.downloaded += 1;
      report.items.push({ id, status: "downloaded", bytes: meta.bytes, path: rec.primary_image_path });
    } catch (err) {
      report.failed += 1;
      rec.image_status = "missing_official_image";
      report.items.push({ id, status: "failed", error: String(err.message || err) });
    }
  }

  fs.writeFileSync(inPath, JSON.stringify(records, null, 2));
  // Also write a dedicated images-applied file
  fs.writeFileSync(
    path.join(TRUSS_ROOT, "normalized/enriched-with-images.json"),
    JSON.stringify(records, null, 2),
  );
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(ROOT, "reports/truss-catalog/image-source-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({
    downloaded: report.downloaded,
    skipped_no_url: report.skipped_no_url,
    blocked_host: report.blocked_host,
    failed: report.failed,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
