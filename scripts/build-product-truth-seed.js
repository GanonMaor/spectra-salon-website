#!/usr/bin/env node
/**
 * scripts/build-product-truth-seed.js
 * ---------------------------------------------------------------
 * Generates src/data/product-truth-seed.json — the compact UI-ready
 * data file powering the Admin Product Truth Center tab.
 *
 * Sources (evidence only, not final truth):
 *   - reports/pol-customer-usage/pol-shade-map.json
 *   - reports/pol-customer-usage/shade-inventory.json
 *   - reports/pol-customer-usage/color-intelligence-dictionary/index.json
 *
 * Run:
 *   npm run build:product-truth-seed
 *   node scripts/build-product-truth-seed.js
 */

"use strict";

const fs = require("fs");
const path = require("path");

const {
  groupIntoIdentities,
  computeSummary,
  PRODUCT_TYPES,
  REVIEW_STATUS,
} = require("./lib/product-catalog/product-identity");

const ROOT = path.resolve(__dirname, "..");
const SHADE_MAP_FILE = path.join(ROOT, "reports/pol-customer-usage/pol-shade-map.json");
const INVENTORY_FILE = path.join(ROOT, "reports/pol-customer-usage/shade-inventory.json");
const DICT_INDEX_FILE = path.join(ROOT, "reports/pol-customer-usage/color-intelligence-dictionary/index.json");
const OUTPUT_FILE = path.join(ROOT, "src/data/product-truth-seed.json");

function main() {
  // ── 1. Load source data ────────────────────────────────────────────────
  console.log("Loading shade map...");
  const shadeMap = JSON.parse(fs.readFileSync(SHADE_MAP_FILE, "utf8"));
  const entries = shadeMap.entries || [];
  console.log(`  ${entries.length} shade map entries loaded.`);

  // ── 2. Group into canonical identities ────────────────────────────────
  console.log("Grouping into canonical identities...");
  const identities = groupIntoIdentities(entries);
  console.log(`  ${identities.length} canonical identities created.`);

  // ── 3. Compute summary ────────────────────────────────────────────────
  const summary = computeSummary(identities);
  console.log("Summary:", summary);

  // ── 4. Collect product type breakdown ─────────────────────────────────
  const byProductType = {};
  for (const id of identities) {
    byProductType[id.productType] = (byProductType[id.productType] || 0) + 1;
  }

  // ── 5. Review status breakdown ────────────────────────────────────────
  const byReviewStatus = {};
  for (const id of identities) {
    byReviewStatus[id.reviewStatus] = (byReviewStatus[id.reviewStatus] || 0) + 1;
  }

  // ── 6. Brand breakdown ────────────────────────────────────────────────
  const brandTotals = {};
  for (const id of identities) {
    const b = id.canonicalBrand;
    if (!brandTotals[b]) brandTotals[b] = { usageCount: 0, identities: 0 };
    brandTotals[b].usageCount += id.usageEvidence.usageCount;
    brandTotals[b].identities++;
  }
  const brandBreakdown = Object.entries(brandTotals)
    .map(([brand, v]) => ({ brand, ...v }))
    .sort((a, b) => b.usageCount - a.usageCount);

  // ── 7. Load dictionary meta for source traceability ───────────────────
  let dictMeta = null;
  try {
    const dict = JSON.parse(fs.readFileSync(DICT_INDEX_FILE, "utf8"));
    dictMeta = {
      generatedAt: dict.generatedAt,
      rule: dict.rule,
      totals: dict.totals,
    };
  } catch (e) {
    console.warn("  Could not load dictionary index:", e.message);
  }

  // ── 8. Strip heavy fields for compact UI file ─────────────────────────
  // Keep each identity readable but not redundant. rawVariants is kept
  // only when there are aliases to show in the detail drawer.
  const compactIdentities = identities.map((id) => ({
    canonicalId: id.canonicalId,
    canonicalBrand: id.canonicalBrand,
    canonicalSeries: id.canonicalSeries,
    canonicalShade: id.canonicalShade,
    rawBrand: id.rawBrand,
    rawSeries: id.rawSeries,
    rawShade: id.rawShade,
    productType: id.productType,
    productTypeLabel: id.productTypeLabel,
    allProductTypes: id.allProductTypes,
    inShadeIntelligence: id.inShadeIntelligence,
    isDevOxidant: id.isDevOxidant,
    isSupportingProduct: id.isSupportingProduct,
    usageEvidence: id.usageEvidence,
    shadeDecoding: id.shadeDecoding,
    aliases: id.aliases,
    rawVariants: id.groupSize > 1 ? id.rawVariants : undefined,
    confidence: id.confidence,
    duplicateRisk: id.duplicateRisk,
    reviewStatus: id.reviewStatus,
    suggestedAction: id.suggestedAction,
    groupSize: id.groupSize,
  }));

  // ── 9. Write output ───────────────────────────────────────────────────
  const output = {
    generatedAt: new Date().toISOString(),
    sourceShadeMap: "reports/pol-customer-usage/pol-shade-map.json",
    sourceInventory: "reports/pol-customer-usage/shade-inventory.json",
    dictionaryMeta: dictMeta,
    summary,
    byProductType,
    byReviewStatus,
    brandBreakdown,
    identities: compactIdentities,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + "\n", "utf8");

  const sizeKb = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`\nWritten: ${OUTPUT_FILE}`);
  console.log(`Size: ${sizeKb} KB`);
  console.log("\nProduct type breakdown:", byProductType);
  console.log("Review status breakdown:", byReviewStatus);
  console.log(`\nTop brands:`);
  brandBreakdown.slice(0, 8).forEach((b) =>
    console.log(`  ${b.brand}: ${b.usageCount.toLocaleString()} usages, ${b.identities} identities`),
  );
}

main();
