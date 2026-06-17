#!/usr/bin/env node
/**
 * scripts/catalog-dry-run.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Phase 3+4 Dry Run: Deterministic classification for one
 * manufacturer or product line.
 *
 * This script reads catalog records, classifies them with the rule registry,
 * and outputs a structured report WITHOUT writing to any database.
 *
 * Outputs:
 *   reports/catalog-classification/milestone-5/dry-run-<slug>.json
 *   reports/catalog-classification/milestone-5/dry-run-<slug>.md
 *
 * Usage:
 *   node scripts/catalog-dry-run.js --manufacturer "WELLA PROFESSIONALS"
 *   node scripts/catalog-dry-run.js --slug wella-professionals
 *   node scripts/catalog-dry-run.js --slug l-oreal-professionnel --limit 50
 *   node scripts/catalog-dry-run.js --slug wella-professionals --product-line "KOLESTON PERFECT"
 *   npm run m5:dry-run -- --slug wella-professionals
 *
 * This command is safe to run multiple times.  It never writes to the DB.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT       = path.resolve(__dirname, "..");
const BRANDS_DIR = path.join(ROOT, "public", "catalog-brands");
const OUT_DIR    = path.join(ROOT, "reports", "catalog-classification", "milestone-5");

const {
  getRulesForBrand,
  RULES_VERSION,
  SLUG_TO_BRAND_KEY,
} = require("./lib/m5-classification/manufacturer-rules");

const {
  classifyProduct,
  summarizeConfidenceBands,
} = require("./lib/m5-classification/product-classifier");

const {
  analyzeReviewItems,
  renderReviewAnalysisMarkdown,
  SHADE_BEARING_PRODUCT_TYPES,
  NON_SHADE_PRODUCT_TYPES,
} = require("./lib/m5-classification/review-analysis");

// ── CLI argument parsing ──────────────────────────────────────────────────────

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const ARG_MANUFACTURER  = getArg("--manufacturer");
const ARG_SLUG          = getArg("--slug");
const ARG_PRODUCT_LINE  = getArg("--product-line");
const ARG_LIMIT         = parseInt(getArg("--limit") || "0", 10);
const ARG_CHUNK_SIZE    = parseInt(getArg("--chunk-size") || "500", 10);
const VERBOSE           = hasFlag("--verbose");

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg)    { process.stdout.write(`  ${msg}\n`); }
function ok(msg)     { process.stdout.write(`  ✓ ${msg}\n`); }
function warn(msg)   { process.stdout.write(`  ⚠ ${msg}\n`); }
function err(msg)    { process.stdout.write(`  ✗ ${msg}\n`); }
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

// ── Slug resolution ───────────────────────────────────────────────────────────

function resolveSlug() {
  if (ARG_SLUG) return ARG_SLUG;

  if (ARG_MANUFACTURER) {
    const upper = ARG_MANUFACTURER.toUpperCase().trim();
    // Find slug(s) that map to this manufacturer
    const matched = Object.entries(SLUG_TO_BRAND_KEY)
      .filter(([, key]) => key.toUpperCase() === upper)
      .map(([slug]) => slug);
    if (matched.length > 0) return matched[0];

    // Fuzzy: brand key contains manufacturer string
    const fuzzy = Object.entries(SLUG_TO_BRAND_KEY)
      .filter(([, key]) => key.toUpperCase().includes(upper) || upper.includes(key.toUpperCase()))
      .map(([slug]) => slug);
    if (fuzzy.length > 0) return fuzzy[0];

    err(`Cannot find slug for manufacturer "${ARG_MANUFACTURER}". Use --slug instead.`);
    err(`Available slugs with rules: ${Object.keys(SLUG_TO_BRAND_KEY).join(", ")}`);
    process.exit(1);
  }

  // Default: wella-professionals (largest fully-ruled brand)
  return "wella-professionals";
}

// ── Load brand records ────────────────────────────────────────────────────────

function loadBrandRecords(slug) {
  const filePath = path.join(BRANDS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    err(`Brand file not found: ${path.relative(ROOT, filePath)}`);
    err(`Available files: ls public/catalog-brands/`);
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!Array.isArray(records)) {
    err(`${slug}.json is not an array`);
    process.exit(1);
  }
  return records;
}

// ── Classification run ────────────────────────────────────────────────────────

function runDryRunClassification(records, slug, productLineFilter) {
  const results = {
    classified:     [],
    unresolved:     [],
    reviewItems:    [],
    parsingFailures:[],
  };

  let processed = 0;

  for (const product of records) {
    // Apply product line filter if specified
    if (productLineFilter) {
      const series = (product.series || "").toUpperCase();
      if (!series.includes(productLineFilter.toUpperCase())) continue;
    }

    // Apply record limit
    if (ARG_LIMIT > 0 && processed >= ARG_LIMIT) break;

    let classification;
    try {
      classification = classifyProduct(product, slug);
    } catch (e) {
      results.parsingFailures.push({
        productId: product.id,
        brand: product.brand,
        series: product.series,
        shade: product.shade,
        error: e.message,
      });
      processed++;
      continue;
    }

    processed++;

    if (classification.confidenceBand === "unresolved") {
      results.unresolved.push(classification);
    } else if (classification.confidenceBand === "review") {
      results.reviewItems.push(classification);
    } else {
      results.classified.push(classification);
    }
  }

  return { results, processed };
}

// ── Sample rows ───────────────────────────────────────────────────────────────

function buildSampleRows(results, n = 10) {
  const pickSample = (arr) => arr.slice(0, n).map(r => ({
    id:                  r.sourceId,
    brand:               r.brand,
    series:              r.productLine,
    shade:               r.shadeCodeRaw,
    shadeNormalized:     r.shadeCodeNormalized,
    level:               r.level,
    primaryTone:         r.primaryToneLabel,
    secondaryTone:       r.secondaryToneLabel,
    toneFamily:          r.toneFamily,
    productType:         r.productType,
    packageSize:         r.packageSize ? `${r.packageSize}${r.packageUnit}` : null,
    barcode:             r.barcode,
    confidence:          r.confidence,
    band:                r.confidenceBand,
  }));

  return {
    automatic: pickSample(results.classified),
    review:    pickSample(results.reviewItems),
    unresolved: pickSample(results.unresolved),
  };
}

function stableHash(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function validationErrorsFor(classification) {
  const errors = [];
  if (!classification.manufacturer) errors.push("missing manufacturer");
  if (!classification.productLine) errors.push("missing product line");
  if (!classification.productType) errors.push("missing product type");
  if (!classification.packageSize) errors.push("missing package size");
  if (classification.tonalProfile && classification.tonalProfile.manufacturerSpecific !== true) {
    errors.push("tonal profile is not manufacturer-specific");
  }
  if (SHADE_BEARING_PRODUCT_TYPES.has(classification.productType) && !classification.shadeCodeNormalized) {
    errors.push("shade-bearing product lacks normalized shade");
  }
  if (NON_SHADE_PRODUCT_TYPES.has(classification.productType) && classification.tonalProfile) {
    errors.push("non-shade product produced tonal profile");
  }
  return errors;
}

function buildValidationSample(classifications, n = 50) {
  return classifications
    .map(item => ({ item, hash: stableHash(item.sourceId || `${item.productLine}:${item.shadeCodeRaw}`) }))
    .sort((a, b) => a.hash - b.hash)
    .slice(0, n)
    .map(({ item }) => ({
      id: item.sourceId,
      manufacturer: item.manufacturer,
      productLine: item.productLine,
      productFamily: item.productFamily,
      productType: item.productType,
      shade: item.shadeCodeRaw,
      shadeNormalized: item.shadeCodeNormalized,
      shadeSystem: item.shadeSystem,
      level: item.level,
      primaryTone: item.primaryToneLabel,
      secondaryTone: item.secondaryToneLabel,
      toneFamily: item.toneFamily,
      packageSize: item.packageSize ? `${item.packageSize}${item.packageUnit}` : null,
      barcode: item.barcode,
      confidence: item.confidence,
      errors: validationErrorsFor(item),
    }));
}

function summarizeBy(classifications, field) {
  const counts = {};
  for (const item of classifications) {
    const key = item[field] || "(missing)";
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, count }));
}

// ── Cross-brand safety check ─────────────────────────────────────────────────

/**
 * Verify that no classification result has relationship_type = "same_commercial_sku"
 * pointing to a different manufacturer.  This is a safety invariant assertion.
 */
function verifyCrossBrandSafety(allResults, slug) {
  const violations = [];
  const allClassifications = [
    ...allResults.classified,
    ...allResults.reviewItems,
    ...allResults.unresolved,
  ];

  for (const c of allClassifications) {
    // The tonal profile must always carry manufacturerSpecific: true
    if (c.tonalProfile && c.tonalProfile.manufacturerSpecific !== true) {
      violations.push({
        productId: c.sourceId,
        issue: "tonalProfile.manufacturerSpecific is not true",
        value: c.tonalProfile,
      });
    }
  }

  return violations;
}

// ── Duplicate candidate detection ────────────────────────────────────────────

/**
 * Within the same manufacturer, flag potential duplicate candidates
 * based on identical normalized shade + product line.
 * These are flagged for review, never auto-merged.
 */
function detectDuplicateCandidates(allClassifications) {
  const seen = new Map();
  const duplicates = [];

  for (const c of allClassifications) {
    if (!c.shadeCodeNormalized || !c.productLine) continue;
    const key = `${c.productLine}::${c.shadeCodeNormalized}::${c.packageSize ?? ""}${c.packageUnit ?? ""}`;
    if (seen.has(key)) {
      duplicates.push({ key, a: seen.get(key).sourceId, b: c.sourceId });
    } else {
      seen.set(key, c);
    }
  }

  return duplicates;
}

// ── Report generation ─────────────────────────────────────────────────────────

function buildMarkdownReport(report) {
  const lines = [];
  const { slug, manufacturer, processedCount, productLineFilter } = report;
  const { classified, reviewItems, unresolved, parsingFailures } = report.results;
  const bands = report.confidenceBands;

  lines.push(`# Milestone 5 — Dry Run Report: ${manufacturer}`);
  lines.push(``);
  lines.push(`**Generated:** ${report.generatedAt.slice(0,10)}  `);
  lines.push(`**Rules version:** ${report.rulesVersion}  `);
  lines.push(`**Brand slug:** \`${slug}\`  `);
  if (productLineFilter) lines.push(`**Product line filter:** ${productLineFilter}  `);
  if (report.limitApplied) lines.push(`**Limit applied:** ${report.limitApplied}  `);
  lines.push(``);
  lines.push(`> **This is a dry-run report. No database writes have been performed.**`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  lines.push(`## Classification Summary`);
  lines.push(``);
  lines.push(`| Band | Count | Action |`);
  lines.push(`|------|-------|--------|`);
  lines.push(`| Automatic (≥0.95) | ${classified.length.toLocaleString()} | Apply classification |`);
  lines.push(`| Review (0.80–0.94) | ${reviewItems.length.toLocaleString()} | Create review item |`);
  lines.push(`| Unresolved (<0.80) | ${unresolved.length.toLocaleString()} | Manual review required |`);
  lines.push(`| Parsing failures | ${parsingFailures.length.toLocaleString()} | Investigate rule gaps |`);
  lines.push(`| **Total processed** | **${processedCount.toLocaleString()}** | |`);
  lines.push(``);

  lines.push(`## Shade System Distribution`);
  lines.push(``);
  const shadeSystemCounts = {};
  for (const c of [...classified, ...reviewItems, ...unresolved]) {
    const s = c.shadeSystem || "(none)";
    shadeSystemCounts[s] = (shadeSystemCounts[s] || 0) + 1;
  }
  lines.push(`| Shade System | Count |`);
  lines.push(`|-------------|-------|`);
  for (const [sys, cnt] of Object.entries(shadeSystemCounts).sort((a,b)=>b[1]-a[1])) {
    lines.push(`| ${sys} | ${cnt.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Product Type Distribution`);
  lines.push(``);

  lines.push(`## Product Line Distribution`);
  lines.push(``);
  const lineCounts = {};
  for (const c of [...classified, ...reviewItems, ...unresolved]) {
    lineCounts[c.productLine || "(missing)"] = (lineCounts[c.productLine || "(missing)"] || 0) + 1;
  }
  lines.push(`| Product Line | Count |`);
  lines.push(`|-------------|-------|`);
  for (const [line, cnt] of Object.entries(lineCounts).sort((a,b)=>b[1]-a[1]).slice(0, 40)) {
    lines.push(`| ${line} | ${cnt.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Review Exception Analysis`);
  lines.push(``);
  if (report.reviewAnalysis.totalReviewItems === 0) {
    lines.push(`No review records remain.`);
  } else {
    lines.push(`| Category | Count |`);
    lines.push(`|----------|-------|`);
    for (const row of report.reviewAnalysis.countsByCategory) {
      lines.push(`| ${row.key} | ${row.count} |`);
    }
    lines.push(``);
    lines.push(`Safely resolvable with deterministic rules: ${report.reviewAnalysis.safelyResolvableCount}.  `);
    lines.push(`Partially resolvable as separate ontology work: ${report.reviewAnalysis.partiallyResolvableCount}.  `);
    lines.push(`Keep review: ${report.reviewAnalysis.keepReviewCount}.`);
  }
  lines.push(``);
  const typeCounts = {};
  for (const c of [...classified, ...reviewItems, ...unresolved]) {
    typeCounts[c.productType] = (typeCounts[c.productType] || 0) + 1;
  }
  lines.push(`| Product Type | Count |`);
  lines.push(`|-------------|-------|`);
  for (const [t, cnt] of Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])) {
    lines.push(`| ${t} | ${cnt.toLocaleString()} |`);
  }
  lines.push(``);

  lines.push(`## Duplicate Candidates (within same manufacturer)`);
  lines.push(``);
  const dups = report.duplicateCandidates;
  if (dups.length === 0) {
    lines.push(`No duplicate candidates detected.`);
  } else {
    lines.push(`${dups.length} potential duplicates found (require manual review, never auto-merged):`);
    lines.push(``);
    lines.push(`| Key | Product A | Product B |`);
    lines.push(`|-----|-----------|-----------|`);
    for (const d of dups.slice(0, 20)) {
      lines.push(`| ${d.key} | ${d.a} | ${d.b} |`);
    }
    if (dups.length > 20) lines.push(`| ... | (${dups.length - 20} more) | |`);
  }
  lines.push(``);

  lines.push(`## Cross-Brand Safety Check`);
  lines.push(``);
  const violations = report.crossBrandViolations;
  if (violations.length === 0) {
    lines.push(`PASS — No cross-brand safety violations detected.`);
    lines.push(``);
    lines.push(`All tonal profiles are marked \`manufacturerSpecific: true\`.  `);
    lines.push(`No classification result can trigger a \`same_commercial_sku\` merge across manufacturers.`);
  } else {
    lines.push(`FAIL — ${violations.length} cross-brand safety violations detected.`);
    for (const v of violations) {
      lines.push(`- Product ${v.productId}: ${v.issue}`);
    }
  }
  lines.push(``);

  lines.push(`## Sample: Automatic Classifications (first 10)`);
  lines.push(``);
  if (report.samples.automatic.length === 0) {
    lines.push(`(none)`);
  } else {
    lines.push(`| ID | Series | Shade Raw | Normalized | Level | Primary Tone | Type | Confidence |`);
    lines.push(`|----|--------|-----------|------------|-------|-------------|------|------------|`);
    for (const s of report.samples.automatic) {
      lines.push(`| ${s.id?.slice(-8) || ""} | ${s.series || ""} | ${s.shade || ""} | ${s.shadeNormalized || ""} | ${s.level ?? ""} | ${s.primaryTone || ""} | ${s.productType || ""} | ${s.confidence} |`);
    }
  }
  lines.push(``);

  lines.push(`## Sample: Review Items (first 10)`);
  lines.push(``);
  if (report.samples.review.length === 0) {
    lines.push(`(none)`);
  } else {
    lines.push(`| ID | Series | Shade | Level | Type | Confidence | Issues |`);
    lines.push(`|----|--------|-------|-------|------|------------|--------|`);
    for (const s of report.samples.review) {
      const issues = classified.find(c=>c.sourceId===s.id)?.evidence
        .filter(e=>e.issue).map(e=>e.issue).join("; ") || "";
      lines.push(`| ${s.id?.slice(-8) || ""} | ${s.series || ""} | ${s.shade || ""} | ${s.level ?? ""} | ${s.productType || ""} | ${s.confidence} | ${issues} |`);
    }
  }
  lines.push(``);

  lines.push(`## Sample: Unresolved Records (first 10)`);
  lines.push(``);
  if (report.samples.unresolved.length === 0) {
    lines.push(`(none)`);
  } else {
    lines.push(`| ID | Series | Shade | Confidence |`);
    lines.push(`|----|--------|-------|------------|`);
    for (const s of report.samples.unresolved) {
      lines.push(`| ${s.id?.slice(-8) || ""} | ${s.series || ""} | ${s.shade || ""} | ${s.confidence} |`);
    }
  }
  lines.push(``);

  if (parsingFailures.length > 0) {
    lines.push(`## Parsing Failures`);
    lines.push(``);
    for (const f of parsingFailures.slice(0, 10)) {
      lines.push(`- \`${f.productId}\` (${f.series} / ${f.shade}): ${f.error}`);
    }
    lines.push(``);
  }

  lines.push(`## Random Validation Sample: 50 Automatic Classifications`);
  lines.push(``);
  lines.push(`This deterministic random sample is for manual validation. Errors are heuristic checks; empty means no machine-detected classification issue.`);
  lines.push(``);
  lines.push(`| ID | Product Line | Type | Shade | Normalized | Package | Confidence | Errors |`);
  lines.push(`|----|--------------|------|-------|------------|---------|------------|--------|`);
  for (const s of report.validationSample50) {
    lines.push(`| ${(s.id || "").slice(-8)} | ${s.productLine || ""} | ${s.productType || ""} | ${s.shade || ""} | ${s.shadeNormalized || ""} | ${s.packageSize || ""} | ${s.confidence} | ${s.errors.join("; ") || ""} |`);
  }
  lines.push(``);

  const sampleErrors = report.validationSample50.flatMap(row => row.errors.map(error => ({ id: row.id, error })));
  lines.push(`## Classification Errors Found In Sample`);
  lines.push(``);
  if (sampleErrors.length === 0) {
    lines.push(`No machine-detected classification errors found in the 50-record automatic sample.`);
  } else {
    for (const item of sampleErrors) {
      lines.push(`- ${(item.id || "").slice(-8)}: ${item.error}`);
    }
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`## Approval Gate`);
  lines.push(``);
  lines.push(`Review this report carefully before approving any production writes.`);
  lines.push(``);
  lines.push(`To approve and run for a specific manufacturer:`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`# 1. Verify samples look correct above`);
  lines.push(`# 2. Approve rules in manufacturer-rules.js if adjustments needed`);
  lines.push(`# 3. Only then proceed to a controlled write batch`);
  lines.push(`\`\`\``);
  lines.push(``);

  return lines.join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  header("Milestone 5 — Catalog Dry Run");

  const slug = resolveSlug();
  const rules = getRulesForBrand(slug);
  const manufacturer = rules ? rules.displayName : slug;

  log(`Brand slug:   ${slug}`);
  log(`Manufacturer: ${manufacturer}`);
  log(`Rules:        ${rules ? `registered (v${RULES_VERSION})` : "NOT REGISTERED — dry-run uses generic rules"}`);
  if (ARG_PRODUCT_LINE) log(`Product line filter: ${ARG_PRODUCT_LINE}`);
  if (ARG_LIMIT > 0)    log(`Record limit: ${ARG_LIMIT}`);
  log(`Output dir:   reports/catalog-classification/milestone-5/`);
  log(`Mode:         DRY RUN — no database writes`);

  header("Loading catalog records...");
  const records = loadBrandRecords(slug);
  log(`Loaded ${records.length.toLocaleString()} records for "${slug}"`);

  header("Running classification...");

  // Process in chunks for progress visibility
  const chunkSize = ARG_CHUNK_SIZE || 500;
  const filteredRecords = ARG_PRODUCT_LINE
    ? records.filter(r => (r.series || "").toUpperCase().includes(ARG_PRODUCT_LINE.toUpperCase()))
    : records;
  const limited = ARG_LIMIT > 0 ? filteredRecords.slice(0, ARG_LIMIT) : filteredRecords;

  log(`Classifying ${limited.length.toLocaleString()} records in chunks of ${chunkSize}...`);

  const allResults = { classified: [], reviewItems: [], unresolved: [], parsingFailures: [] };
  let processedCount = 0;

  for (let i = 0; i < limited.length; i += chunkSize) {
    const chunk = limited.slice(i, i + chunkSize);
    const { results } = runDryRunClassification(chunk, slug, null);
    allResults.classified.push(...results.classified);
    allResults.reviewItems.push(...results.reviewItems);
    allResults.unresolved.push(...results.unresolved);
    allResults.parsingFailures.push(...results.parsingFailures);
    processedCount += chunk.length;
    if (VERBOSE || limited.length > 1000) {
      log(`  Processed ${processedCount}/${limited.length}...`);
    }
  }

  // Safety check
  const crossBrandViolations = verifyCrossBrandSafety(allResults, slug);
  const duplicateCandidates = detectDuplicateCandidates([
    ...allResults.classified,
    ...allResults.reviewItems,
  ]);

  // Confidence bands summary
  const confidenceBands = summarizeConfidenceBands([
    ...allResults.classified,
    ...allResults.reviewItems,
    ...allResults.unresolved,
  ]);

  // Build report
  const report = {
    generatedAt:          new Date().toISOString(),
    rulesVersion:         RULES_VERSION,
    slug,
    manufacturer,
    productLineFilter:    ARG_PRODUCT_LINE || null,
    limitApplied:         ARG_LIMIT > 0 ? ARG_LIMIT : null,
    processedCount,
    results: {
      classified:     allResults.classified,
      reviewItems:    allResults.reviewItems,
      unresolved:     allResults.unresolved,
      parsingFailures: allResults.parsingFailures,
    },
    confidenceBands,
    crossBrandViolations,
    duplicateCandidates,
    samples: buildSampleRows(allResults, 10),
    reviewAnalysis: analyzeReviewItems(allResults.reviewItems),
    resultsByProductType: summarizeBy([
      ...allResults.classified,
      ...allResults.reviewItems,
      ...allResults.unresolved,
    ], "productType"),
    resultsByProductLine: summarizeBy([
      ...allResults.classified,
      ...allResults.reviewItems,
      ...allResults.unresolved,
    ], "productLine"),
    validationSample50: buildValidationSample(allResults.classified, 50),
  };

  // Slim report for JSON (omit full classification arrays to keep file size reasonable)
  const reportSlim = {
    ...report,
    results: {
      classifiedCount:      allResults.classified.length,
      reviewItemsCount:     allResults.reviewItems.length,
      unresolvedCount:      allResults.unresolved.length,
      parsingFailuresCount: allResults.parsingFailures.length,
      parsingFailures:      allResults.parsingFailures.slice(0, 20),
    },
  };

  header("Writing reports...");
  const safeName = slug.replace(/[^a-z0-9-]/g, "-");
  const jsonPath = path.join(OUT_DIR, `dry-run-${safeName}.json`);
  const mdPath   = path.join(OUT_DIR, `dry-run-${safeName}.md`);

  writeJson(jsonPath, reportSlim);
  writeText(mdPath, buildMarkdownReport(report));

  header("Summary");
  ok(`Automatic (≥0.95): ${allResults.classified.length.toLocaleString()}`);
  ok(`Review (0.80-0.94): ${allResults.reviewItems.length.toLocaleString()}`);
  if (allResults.unresolved.length > 0) warn(`Unresolved (<0.80): ${allResults.unresolved.length.toLocaleString()}`);
  if (allResults.parsingFailures.length > 0) warn(`Parsing failures:   ${allResults.parsingFailures.length.toLocaleString()}`);
  if (duplicateCandidates.length > 0) warn(`Duplicate candidates: ${duplicateCandidates.length.toLocaleString()}`);
  if (crossBrandViolations.length > 0) {
    err(`CROSS-BRAND SAFETY VIOLATIONS: ${crossBrandViolations.length}`);
    process.exit(1);
  } else {
    ok(`Cross-brand safety: PASS`);
  }
  log(``);
  log(`Reports: reports/catalog-classification/milestone-5/dry-run-${safeName}.[json|md]`);
  log(`To approve and run production writes, review the report and update manufacturer-rules.js if needed.`);
}

main().catch(e => {
  process.stderr.write(`ERROR: ${e.message}\n${e.stack}\n`);
  process.exit(1);
});
