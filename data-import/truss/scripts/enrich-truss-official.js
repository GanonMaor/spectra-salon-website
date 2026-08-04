#!/usr/bin/env node
/**
 * Enrich TRUSS extracted records from official first-party domains only.
 * Never invents descriptions or claims. Missing data → incomplete / needs_review.
 *
 * Allowed hosts:
 *   - trussprofessional.com
 *   - trussprofessional.ae
 *   - www.trussprofessional.com
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const { slugify } = require("../lib/parse-page");

const TRUSS_ROOT = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../../..");
const IN_PATH = path.join(TRUSS_ROOT, "normalized/extracted-records.json");
const OUT_PATH = path.join(TRUSS_ROOT, "normalized/enriched-records.json");
const REPORT_PATH = path.join(TRUSS_ROOT, "reports/enrichment-report.json");

const ALLOWED_HOSTS = new Set([
  "trussprofessional.com",
  "www.trussprofessional.com",
  "trussprofessional.ae",
  "www.trussprofessional.ae",
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchText(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "SpectraTRUSSCatalogBot/1.0 (+internal catalog enrichment)",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          const host = new URL(next).hostname;
          if (!ALLOWED_HOSTS.has(host)) {
            reject(new Error(`redirect_blocked:${host}`));
            return;
          }
          res.resume();
          fetchText(next, timeoutMs).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`http_${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      },
    );
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", reject);
  });
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html, property) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i",
  );
  const m = html.match(re) || html.match(re2);
  return m ? m[1].trim() : null;
}

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (m) return stripHtml(m[1]).slice(0, 200) || null;
  return extractMeta(html, "og:title");
}

function extractDescription(html) {
  // Prefer product description block when present; never synthesize.
  const descBlock =
    html.match(
      /<div[^>]*class=["'][^"']*(?:product__description|product-single__description|rte)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    ) ||
    html.match(/itemprop=["']description["'][^>]*>([\s\S]*?)<\//i);
  if (descBlock) {
    const text = stripHtml(descBlock[1]);
    if (text && text.length > 40) return text.slice(0, 4000);
  }
  const meta = extractMeta(html, "og:description") || extractMeta(html, "description");
  return meta && meta.length > 20 ? meta.slice(0, 4000) : null;
}

function candidateSlugs(record) {
  const names = [
    record.product_name,
    record.display_name,
    record.display_name && record.display_name.replace(SIZE_RE_GLOBAL, "").trim(),
  ].filter(Boolean);

  const slugs = new Set();
  for (const name of names) {
    let base = String(name)
      .replace(/\b\d+(?:[.,]\d+)?\s*(ML|G|KG|L|OZ)\b/gi, "")
      .replace(/\bSEMI-?PERMANENT\b/gi, "semi-permanent")
      .replace(/\bPERMANENT\b/gi, "permanent")
      .replace(/\bTONER\b/gi, "toner")
      .trim();
    // Drop shade numeric titles for color — official pages rarely use shade SKUs as handle
    if (record.division === "COLOR" && record.shade_code) {
      // Skip speculative shade URLs — too many false positives
      continue;
    }
    const s = slugify(base);
    if (s && s.length > 3) slugs.add(s);
    // Common TRUSS handle variants
    if (s.endsWith("-conditioner") || s.endsWith("-shampoo") || s.endsWith("-mask")) {
      slugs.add(s);
    }
  }

  // Line + category heuristic for care
  if (record.division === "CARE" && record.product_line && record.category) {
    slugs.add(slugify(`${record.product_line} ${record.category}`));
    slugs.add(slugify(`${record.product_line}-${record.category}`));
  }

  return [...slugs];
}

const SIZE_RE_GLOBAL = /\b\d+(?:[.,]\d+)?\s*(ML|G|KG|L|OZ)\b/gi;

async function enrichOne(record, stats) {
  const checkedAt = new Date().toISOString();
  const slugs = candidateSlugs(record);
  if (!slugs.length) {
    stats.skipped_no_slug += 1;
    return {
      ...record,
      enrichment_status: "needs_review",
      source_checked_at: checkedAt,
      source_confidence: record.ean_valid ? "identity_only" : "low",
    };
  }

  const hosts = ["trussprofessional.com", "trussprofessional.ae"];
  for (const host of hosts) {
    for (const slug of slugs.slice(0, 3)) {
      const url = `https://${host}/products/${slug}`;
      try {
        const html = await fetchText(url);
        const official_name = extractTitle(html);
        const official_description = extractDescription(html);
        const official_image_url = extractMeta(html, "og:image");
        if (!official_name && !official_description && !official_image_url) {
          stats.empty_page += 1;
          continue;
        }
        stats.enriched += 1;
        return {
          ...record,
          official_name: official_name || record.official_name,
          official_description: official_description || null,
          official_product_url: url,
          official_image_url: official_image_url || null,
          description_source_url: official_description ? url : null,
          image_source_url: official_image_url || null,
          source_domain: host,
          source_type: "official_website",
          source_checked_at: checkedAt,
          source_confidence: official_description ? "high" : "medium",
          enrichment_status: official_description ? "enriched" : "needs_review",
          image_status: official_image_url ? "official_remote" : record.image_status,
        };
      } catch {
        stats.fetch_miss += 1;
      }
      await sleep(120);
    }
  }

  stats.unmatched += 1;
  return {
    ...record,
    enrichment_status: "needs_review",
    source_checked_at: checkedAt,
    source_confidence: record.ean_valid ? "identity_only" : "low",
    source_type: record.source_type || "pdf_catalog",
  };
}

async function main() {
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : null;
  const records = JSON.parse(fs.readFileSync(IN_PATH, "utf8"));
  const stats = {
    total: records.length,
    enriched: 0,
    unmatched: 0,
    skipped_no_slug: 0,
    empty_page: 0,
    fetch_miss: 0,
  };

  const out = [];
  const slice = limit ? records.slice(0, limit) : records;
  for (let i = 0; i < slice.length; i++) {
    process.stdout.write(`\rEnrich ${i + 1}/${slice.length}`);
    out.push(await enrichOne(slice[i], stats));
  }
  // Append untouched if limited
  if (limit) out.push(...records.slice(limit));

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  const report = {
    generated_at: new Date().toISOString(),
    ...stats,
    with_official_description: out.filter((r) => r.official_description).length,
    with_official_image_url: out.filter((r) => r.official_image_url).length,
    allowed_hosts: [...ALLOWED_HOSTS],
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(ROOT, "reports/truss-catalog/enrichment-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(`\nWrote ${OUT_PATH}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
