#!/usr/bin/env node
/**
 * scripts/catalog-review-exceptions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Review Exception Analysis
 *
 * Re-runs deterministic dry-run classification for a single catalog brand and
 * groups review records by repeatable exception pattern. This is read-only.
 *
 * Usage:
 *   node scripts/catalog-review-exceptions.js --slug wella-professionals
 *   node scripts/catalog-review-exceptions.js --slug wella-professionals --tag before-wella-rules
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BRANDS_DIR = path.join(ROOT, "data", "catalog-brands");
const OUT_DIR = path.join(ROOT, "reports", "catalog-classification", "milestone-5");

const { classifyProduct } = require("./lib/m5-classification/product-classifier");
const {
  analyzeReviewItems,
  renderReviewAnalysisMarkdown,
} = require("./lib/m5-classification/review-analysis");

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  return idx === -1 ? fallback : (process.argv[idx + 1] || fallback);
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  process.stdout.write(`  ✓ Wrote ${path.relative(ROOT, filePath)}\n`);
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  process.stdout.write(`  ✓ Wrote ${path.relative(ROOT, filePath)}\n`);
}

function main() {
  const slug = getArg("--slug", "wella-professionals");
  const tag = getArg("--tag", "current");
  const filePath = path.join(BRANDS_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Brand file not found: ${path.relative(ROOT, filePath)}`);
  }

  const records = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const classifications = records.map(record => classifyProduct(record, slug));
  const reviewItems = classifications.filter(item => item.confidenceBand === "review");
  const analysis = analyzeReviewItems(reviewItems);
  const generatedAt = new Date().toISOString();
  const safeName = `${slug}-${tag}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  const report = {
    generatedAt,
    slug,
    tag,
    processedCount: records.length,
    automaticCount: classifications.filter(item => item.confidenceBand === "automatic").length,
    reviewCount: reviewItems.length,
    unresolvedCount: classifications.filter(item => item.confidenceBand === "unresolved").length,
    analysis,
  };

  writeJson(path.join(OUT_DIR, `review-exceptions-${safeName}.json`), report);
  writeText(
    path.join(OUT_DIR, `review-exceptions-${safeName}.md`),
    renderReviewAnalysisMarkdown({
      title: `Milestone 5 — Review Exception Report: ${slug} (${tag})`,
      generatedAt,
      analysis,
    })
  );

  process.stdout.write(`\nSummary\n───────\n`);
  process.stdout.write(`  Automatic: ${report.automaticCount}\n`);
  process.stdout.write(`  Review:    ${report.reviewCount}\n`);
  process.stdout.write(`  Unresolved:${report.unresolvedCount}\n`);
  process.stdout.write(`  Safely resolvable: ${analysis.safelyResolvableCount}\n`);
  process.stdout.write(`  Partially resolvable: ${analysis.partiallyResolvableCount}\n`);
  process.stdout.write(`  Keep review: ${analysis.keepReviewCount}\n`);
}

main();
