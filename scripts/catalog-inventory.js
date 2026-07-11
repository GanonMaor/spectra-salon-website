#!/usr/bin/env node
/**
 * scripts/catalog-inventory.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Phase 1: Catalog Inventory
 *
 * Reads all catalog records from data/catalog-brands/*.json and produces a
 * detailed inventory report WITHOUT modifying any production data.
 *
 * Outputs:
 *   reports/catalog-classification/milestone-5/inventory.json
 *   reports/catalog-classification/milestone-5/inventory.md
 *
 * Usage:
 *   node scripts/catalog-inventory.js
 *   node scripts/catalog-inventory.js --verbose
 *   npm run m5:inventory
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT      = path.resolve(__dirname, "..");
const BRANDS_DIR = path.join(ROOT, "data", "catalog-brands");
const OUT_DIR    = path.join(ROOT, "reports", "catalog-classification", "milestone-5");

const {
  getRulesForBrand,
  getRegisteredSlugs,
  getRegisteredManufacturers,
  RULES_VERSION,
} = require("./lib/m5-classification/manufacturer-rules");

const VERBOSE = process.argv.includes("--verbose");

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg)    { process.stdout.write(`  ${msg}\n`); }
function ok(msg)     { process.stdout.write(`  ✓ ${msg}\n`); }
function warn(msg)   { process.stdout.write(`  ⚠ ${msg}\n`); }
function header(msg) { process.stdout.write(`\n${msg}\n${"─".repeat(Math.min(msg.length, 72))}\n`); }

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  ok(`Wrote ${path.relative(ROOT, filePath)}`);
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  ok(`Wrote ${path.relative(ROOT, filePath)}`);
}

// ── Load all catalog records ──────────────────────────────────────────────────

function loadAllCatalogRecords() {
  const files = fs.readdirSync(BRANDS_DIR)
    .filter(f => f.endsWith(".json"))
    .sort();

  const allRecords = [];
  const byBrand = {};
  const warnings = [];
  let malformedCount = 0;

  for (const file of files) {
    const slug = file.replace(".json", "");
    const filePath = path.join(BRANDS_DIR, file);
    let records;

    try {
      records = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      warnings.push({ file, issue: `JSON parse error: ${e.message}` });
      malformedCount++;
      continue;
    }

    if (!Array.isArray(records)) {
      warnings.push({ file, issue: "not an array" });
      malformedCount++;
      continue;
    }

    for (const rec of records) {
      rec._brandSlug = slug;
      allRecords.push(rec);
    }

    byBrand[slug] = records;
  }

  return { allRecords, byBrand, files, warnings, malformedCount };
}

// ── Core inventory computation ────────────────────────────────────────────────

function computeInventory(allRecords, byBrand) {
  // Total and status counts
  let totalProducts = 0;
  let activeProducts = 0;
  let deletedProducts = 0;
  let deprecatedProducts = 0;
  let barcodeConflicts = 0;

  // Completeness counters
  let productsWithBarcode = 0;
  let productsWithCatalogNumber = 0;
  let productsWithShadeCode = 0;
  let productsWithNumericShade = 0;
  let productsWithPackageSize = 0;
  let productsWithSeries = 0;
  let productsWithFamilyShade = 0;

  // Resolution gaps
  let unresolvedManufacturer = 0;
  let unresolvedProductLine = 0;
  let unresolvedShade = 0;
  let unresolvedPackage = 0;

  // Per-manufacturer breakdown
  const productsByManufacturer = {};  // brand display name → count
  const productsByBrandSlug = {};     // slug → count
  const productsByProductLine = {};   // "brand / series" → count
  const productsByType = {};

  // Manufacturer rule coverage
  const registeredSlugs = new Set(getRegisteredSlugs());
  let withRules = 0;
  let withoutRules = 0;
  const slugsWithoutRules = new Set();

  // Shade format distribution
  const shadeFormats = {};

  const SHADE_CODE_RE = /^[\d][./\-][\d]|^[\d]{1,2}[A-Z]{1,3}$|^\/\d/;

  for (const rec of allRecords) {
    totalProducts++;

    const flag = rec.flag ?? 0;
    if (flag === 0) activeProducts++;
    else if (flag === 1) deletedProducts++;
    else if (flag === 2) deprecatedProducts++;
    else if (flag === 3) barcodeConflicts++;

    const slug = rec._brandSlug || "";
    const brand = (rec.brand || "").trim();
    const series = (rec.series || "").trim();
    const shade = (rec.shade || "").trim();
    const rawType = (rec.type || "other").toLowerCase();

    // Manufacturer resolution
    const brandKey = brand
      ? (getRulesForBrand(slug)?.displayName || getRulesForBrand(brand)?.displayName || brand)
      : null;

    if (!brand) {
      unresolvedManufacturer++;
    } else {
      const hasRules = registeredSlugs.has(slug);
      if (hasRules) withRules++;
      else {
        withoutRules++;
        slugsWithoutRules.add(slug);
      }
    }

    // Manufacturer aggregation
    const mfrKey = brandKey || "(unknown)";
    productsByManufacturer[mfrKey] = (productsByManufacturer[mfrKey] || 0) + 1;
    productsByBrandSlug[slug] = (productsByBrandSlug[slug] || 0) + 1;

    // Product line aggregation
    if (!series) {
      unresolvedProductLine++;
    } else {
      const lineKey = `${mfrKey} / ${series}`;
      productsByProductLine[lineKey] = (productsByProductLine[lineKey] || 0) + 1;
      productsWithSeries++;
    }

    // Type aggregation
    productsByType[rawType] = (productsByType[rawType] || 0) + 1;

    // FamilyShade
    if (rec.familyShade && rec.familyShade.trim()) productsWithFamilyShade++;

    // Barcode / catalog number
    const barcode = rec.barcode || (rec.barcodes && rec.barcodes[0]) || null;
    if (barcode) productsWithBarcode++;

    if (rec.catalogNo && rec.catalogNo.trim()) productsWithCatalogNumber++;

    // Shade
    if (shade) {
      productsWithShadeCode++;
      if (SHADE_CODE_RE.test(shade)) {
        productsWithNumericShade++;
        // Detect shade format
        let fmt = "other_numeric";
        if (/^\d{1,2}\.\d/.test(shade))   fmt = "dot_notation";
        else if (/^\d{1,2}\//.test(shade) || /^\/\d/.test(shade)) fmt = "slash_notation";
        else if (/^\d{1,2}-\d/.test(shade)) fmt = "dash_notation";
        else if (/^\d{1,2}[A-Z]/.test(shade)) fmt = "alpha_suffix";
        shadeFormats[fmt] = (shadeFormats[fmt] || 0) + 1;
      } else {
        shadeFormats["named_shade"] = (shadeFormats["named_shade"] || 0) + 1;
      }
    } else if (rawType === "color" || rawType === "toner") {
      unresolvedShade++;
    }

    // Package size
    const sizeValue = rec.materialWeight || rec.packingWeight;
    if (sizeValue && sizeValue > 0) {
      productsWithPackageSize++;
    } else {
      unresolvedPackage++;
    }
  }

  // Sort manufacturer breakdown by count descending
  const manufacturerBreakdown = Object.entries(productsByManufacturer)
    .sort((a, b) => b[1] - a[1])
    .map(([manufacturer, count]) => ({ manufacturer, count }));

  const slugBreakdown = Object.entries(productsByBrandSlug)
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({
      slug,
      count,
      hasRules: registeredSlugs.has(slug),
    }));

  // Top 20 product lines
  const topProductLines = Object.entries(productsByProductLine)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([line, count]) => ({ line, count }));

  return {
    generatedAt: new Date().toISOString(),
    rulesVersion: RULES_VERSION,
    source: "data/catalog-brands/*.json",

    // Phase 1 inventory fields
    totalProducts,
    activeProducts,
    deletedProducts,
    deprecatedProducts,
    barcodeConflicts,

    productsWithBarcode,
    productsWithCatalogNumber,
    productsWithShadeCode,
    productsWithNumericShade,
    productsWithPackageSize,
    productsWithSeries,
    productsWithFamilyShade,

    unresolvedManufacturer,
    unresolvedProductLine,
    unresolvedShade,
    unresolvedPackage,

    // Completeness percentages
    completeness: {
      barcode:       pct(productsWithBarcode, totalProducts),
      catalogNumber: pct(productsWithCatalogNumber, totalProducts),
      shadeCode:     pct(productsWithShadeCode, totalProducts),
      numericShade:  pct(productsWithNumericShade, totalProducts),
      packageSize:   pct(productsWithPackageSize, totalProducts),
      series:        pct(productsWithSeries, totalProducts),
    },

    // Rule coverage
    rulesCoverage: {
      registeredManufacturers: getRegisteredManufacturers().length,
      registeredBrandSlugs:    registeredSlugs.size,
      productsWithRules:       withRules,
      productsWithoutRules:    withoutRules,
      coveragePct:             pct(withRules, totalProducts),
      slugsWithoutRules:       [...slugsWithoutRules].sort(),
    },

    // Breakdowns
    productsByManufacturer:  manufacturerBreakdown,
    productsByBrandSlug:     slugBreakdown,
    productsByType,
    topProductLines,
    shadeFormats,

    // Source files
    totalBrandFiles: Object.keys(byBrand).length,
  };
}

function pct(n, total) {
  if (!total) return 0;
  return parseFloat(((n / total) * 100).toFixed(1));
}

// ── Markdown report ───────────────────────────────────────────────────────────

function buildMarkdownReport(inv) {
  const lines = [];

  lines.push(`# Milestone 5 — Catalog Inventory Report`);
  lines.push(``);
  lines.push(`**Generated:** ${inv.generatedAt.slice(0,10)}  `);
  lines.push(`**Rules version:** ${inv.rulesVersion}  `);
  lines.push(`**Source:** \`data/catalog-brands/*.json\` (${inv.totalBrandFiles} files)`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total products | ${inv.totalProducts.toLocaleString()} |`);
  lines.push(`| Active | ${inv.activeProducts.toLocaleString()} |`);
  lines.push(`| Deleted | ${inv.deletedProducts.toLocaleString()} |`);
  lines.push(`| Deprecated | ${inv.deprecatedProducts.toLocaleString()} |`);
  lines.push(`| Barcode conflicts | ${inv.barcodeConflicts.toLocaleString()} |`);
  lines.push(``);

  lines.push(`## Completeness`);
  lines.push(``);
  lines.push(`| Field | Count | % of Total |`);
  lines.push(`|-------|-------|------------|`);
  lines.push(`| Has barcode | ${inv.productsWithBarcode.toLocaleString()} | ${inv.completeness.barcode}% |`);
  lines.push(`| Has catalog number | ${inv.productsWithCatalogNumber.toLocaleString()} | ${inv.completeness.catalogNumber}% |`);
  lines.push(`| Has shade code | ${inv.productsWithShadeCode.toLocaleString()} | ${inv.completeness.shadeCode}% |`);
  lines.push(`| Has numeric shade | ${inv.productsWithNumericShade.toLocaleString()} | ${inv.completeness.numericShade}% |`);
  lines.push(`| Has package size | ${inv.productsWithPackageSize.toLocaleString()} | ${inv.completeness.packageSize}% |`);
  lines.push(`| Has product line (series) | ${inv.productsWithSeries.toLocaleString()} | ${inv.completeness.series}% |`);
  lines.push(``);

  lines.push(`## Resolution Gaps`);
  lines.push(``);
  lines.push(`| Gap | Count |`);
  lines.push(`|-----|-------|`);
  lines.push(`| Unresolved manufacturer | ${inv.unresolvedManufacturer.toLocaleString()} |`);
  lines.push(`| Unresolved product line | ${inv.unresolvedProductLine.toLocaleString()} |`);
  lines.push(`| Unresolved shade (color products only) | ${inv.unresolvedShade.toLocaleString()} |`);
  lines.push(`| Missing package size | ${inv.unresolvedPackage.toLocaleString()} |`);
  lines.push(``);

  lines.push(`## Rule Registry Coverage`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Registered manufacturers | ${inv.rulesCoverage.registeredManufacturers} |`);
  lines.push(`| Registered brand slugs | ${inv.rulesCoverage.registeredBrandSlugs} |`);
  lines.push(`| Products with rules | ${inv.rulesCoverage.productsWithRules.toLocaleString()} (${inv.rulesCoverage.coveragePct}%) |`);
  lines.push(`| Products without rules | ${inv.rulesCoverage.productsWithoutRules.toLocaleString()} |`);
  lines.push(``);

  lines.push(`## Products by Type`);
  lines.push(``);
  lines.push(`| Type | Count |`);
  lines.push(`|------|-------|`);
  for (const [type, count] of Object.entries(inv.productsByType).sort((a,b)=>b[1]-a[1])) {
    lines.push(`| ${type} | ${count.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Shade Code Formats`);
  lines.push(``);
  lines.push(`| Format | Count |`);
  lines.push(`|--------|-------|`);
  for (const [fmt, count] of Object.entries(inv.shadeFormats).sort((a,b)=>b[1]-a[1])) {
    lines.push(`| ${fmt} | ${count.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Top 20 Manufacturers by Product Count`);
  lines.push(``);
  lines.push(`| Rank | Manufacturer | Products |`);
  lines.push(`|------|-------------|----------|`);
  inv.productsByManufacturer.slice(0, 20).forEach((m, i) => {
    lines.push(`| ${i+1} | ${m.manufacturer} | ${m.count.toLocaleString()} |`);
  });
  lines.push(``);

  lines.push(`## Top 40 Product Lines`);
  lines.push(``);
  lines.push(`| Product Line | Count |`);
  lines.push(`|-------------|-------|`);
  for (const { line, count } of inv.topProductLines) {
    lines.push(`| ${line} | ${count.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Brand Files Without Registered Rules`);
  lines.push(``);
  if (inv.rulesCoverage.slugsWithoutRules.length === 0) {
    lines.push(`All brand files have registered rules.`);
  } else {
    lines.push(`${inv.rulesCoverage.slugsWithoutRules.length} brand slugs have no manufacturer rules registered:`);
    lines.push(``);
    for (const slug of inv.rulesCoverage.slugsWithoutRules.slice(0, 50)) {
      lines.push(`- \`${slug}\``);
    }
    if (inv.rulesCoverage.slugsWithoutRules.length > 50) {
      lines.push(`- ... and ${inv.rulesCoverage.slugsWithoutRules.length - 50} more`);
    }
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`## Next Steps`);
  lines.push(``);
  lines.push(`1. Review the top manufacturers and confirm rule registry is correct for each.`);
  lines.push(`2. Run \`npm run m5:dry-run -- --manufacturer "L'OREAL PROFESSIONNEL"\` for the first manufacturer dry-run.`);
  lines.push(`3. Inspect dry-run report and approve rules before any production writes.`);
  lines.push(``);

  return lines.join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  header("Milestone 5 — Catalog Inventory");
  log(`Source: ${path.relative(ROOT, BRANDS_DIR)}`);

  log("Loading catalog records...");
  const { allRecords, byBrand, warnings, malformedCount } = loadAllCatalogRecords();
  log(`Loaded ${allRecords.length.toLocaleString()} records from ${Object.keys(byBrand).length} brand files`);

  if (warnings.length > 0) {
    for (const w of warnings) warn(`${w.file}: ${w.issue}`);
  }

  header("Computing inventory...");
  const inventory = computeInventory(allRecords, byBrand);

  if (VERBOSE) {
    log(`Active products:           ${inventory.activeProducts.toLocaleString()}`);
    log(`Products with barcode:     ${inventory.productsWithBarcode.toLocaleString()} (${inventory.completeness.barcode}%)`);
    log(`Products with shade code:  ${inventory.productsWithShadeCode.toLocaleString()} (${inventory.completeness.shadeCode}%)`);
    log(`Products with package:     ${inventory.productsWithPackageSize.toLocaleString()} (${inventory.completeness.packageSize}%)`);
    log(`Rules coverage:            ${inventory.rulesCoverage.coveragePct}% (${inventory.rulesCoverage.productsWithRules.toLocaleString()} products)`);
    log(`Unresolved manufacturer:   ${inventory.unresolvedManufacturer.toLocaleString()}`);
    log(`Unresolved shade (colors): ${inventory.unresolvedShade.toLocaleString()}`);
  }

  header("Writing reports...");
  const jsonPath = path.join(OUT_DIR, "inventory.json");
  const mdPath   = path.join(OUT_DIR, "inventory.md");

  writeJson(jsonPath, inventory);
  writeText(mdPath, buildMarkdownReport(inventory));

  header("Done");
  log(`Total products inventoried: ${inventory.totalProducts.toLocaleString()}`);
  log(`Brand files processed:      ${inventory.totalBrandFiles}`);
  log(`Rule coverage:              ${inventory.rulesCoverage.coveragePct}%`);
  log(`Unresolved shades:          ${inventory.unresolvedShade.toLocaleString()}`);
  log(``);
  log(`Reports written to: reports/catalog-classification/milestone-5/`);
  log(`To run manufacturer dry-run: npm run m5:dry-run -- --manufacturer "WELLA PROFESSIONALS"`);
}

main().catch(err => {
  process.stderr.write(`ERROR: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
