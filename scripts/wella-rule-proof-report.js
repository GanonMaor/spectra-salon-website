#!/usr/bin/env node
/**
 * scripts/wella-rule-proof-report.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 Wella proof report.
 *
 * Purpose:
 *   Prove whether the original Wella review volume was caused by true Wella
 *   shade parsing gaps or by non-shade/product-type routing before accepting
 *   any Wella shade rule changes.
 *
 * This script is read-only. It does not write to the database.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "reports", "catalog-classification", "milestone-5");
const WELLA_PATH = path.join(ROOT, "public", "catalog-brands", "wella-professionals.json");

const {
  RULES_VERSION,
  WELLA_REFLECTIONS,
  SHADE_CODE_PATTERNS,
} = require("./lib/m5-classification/manufacturer-rules");
const { classifyProduct } = require("./lib/m5-classification/product-classifier");

const SHADE_TYPES = new Set(["hair_color_shade", "permanent_color", "demi_permanent", "acidic_toner", "direct_dye"]);
const NON_SHADE_TYPES = new Set(["lightener", "lightener_bleach", "developer", "developer_oxidant", "treatment_care", "bond_builder", "other"]);

const HYPOTHETICAL_WELLA_ALPHA_REFLECTIONS = {
  N: { label: "Natural", toneFamily: "natural" },
  NN: { label: "Intense Natural", toneFamily: "natural" },
  A: { label: "Ash", toneFamily: "cool" },
  AA: { label: "Intense Ash", toneFamily: "cool" },
  NA: { label: "Natural Ash", toneFamily: "cool" },
  G: { label: "Gold", toneFamily: "warm" },
  NG: { label: "Natural Gold", toneFamily: "warm" },
  WG: { label: "Warm Gold", toneFamily: "warm" },
  W: { label: "Warm", toneFamily: "warm" },
  WV: { label: "Warm Violet", toneFamily: "violet" },
  B: { label: "Brown", toneFamily: "neutral" },
  BB: { label: "Blue Brown", toneFamily: "cool" },
  BBL: { label: "Blue Black", toneFamily: "cool" },
  R: { label: "Red", toneFamily: "warm" },
  RR: { label: "Intense Red", toneFamily: "warm" },
  "RR+": { label: "Extra Intense Red", toneFamily: "warm" },
  V: { label: "Violet", toneFamily: "violet" },
  VV: { label: "Intense Violet", toneFamily: "violet" },
  RG: { label: "Red Gold", toneFamily: "warm" },
};

const BASELINE_WELLA_LINE_RULES = {
  "KOLESTON PERFECT": { productType: "permanent_color", technology: "ME+" },
  "COLOR TOUCH": { productType: "demi_permanent", technology: "demi_no_ammonia" },
  "ILLUMINA COLOR": { productType: "permanent_color", technology: "micro_light" },
  "SHINEFINITY": { productType: "acidic_toner", technology: "zero_lift_gloss" },
  "BLONDOR": { productType: "lightener", technology: "multi_blonde" },
  "WELLOXON PERFECT": { productType: "developer", technology: "cream_developer" },
  "MAGMA": { productType: "lightener", technology: "bond_lightener" },
};

const EXTENDED_WELLA_LINE_RULES = {
  ...BASELINE_WELLA_LINE_RULES,
  "KOLESTONE": { productType: "permanent_color", technology: "ME+", aliasOf: "KOLESTON PERFECT" },
  "KOLESTONE COLOR EXPRESS": { productType: "permanent_color", technology: "rapid_color" },
  "COLOR TOUCH PLUS": { productType: "demi_permanent", technology: "demi_no_ammonia_plus" },
  "COLOR FRESH": { productType: "demi_permanent", technology: "temporary_color_mask" },
  "ILLUMINA": { productType: "permanent_color", technology: "micro_light", aliasOf: "ILLUMINA COLOR" },
  "TRUE GREY": { productType: "acidic_toner", technology: "grey_toning" },
  "INSTAMATIC": { productType: "acidic_toner", technology: "muted_toning" },
  "BLONDOR BLEACH": { productType: "lightener", technology: "multi_blonde" },
  "BLONDOR DEVELOPERS": { productType: "developer", technology: "freelights_developer" },
  "WELLOXON DEVELOPERS": { productType: "developer", technology: "cream_developer" },
  "GALON DEVELOPERS": { productType: "developer", technology: "cream_developer" },
  "CHARM COLOR DEMI": { productType: "demi_permanent", technology: "color_charm_demi" },
  "CHARM COLOR PERMANENT LIQUID COLOR": { productType: "permanent_color", technology: "color_charm_liquid" },
  "CHARM COLOR PERMANENT": { productType: "permanent_color", technology: "color_charm_permanent" },
  "CHARM COLOR VIVIDS": { productType: "direct_dye", technology: "color_charm_vivids" },
  "ULTIMATE REPAIR": { productType: "treatment_care", technology: "repair_care" },
  "FUSION": { productType: "treatment_care", technology: "fusion_repair" },
  "BRILLIANCE": { productType: "treatment_care", technology: "color_care" },
};

const TYPE_MAP = {
  color: "hair_color_shade",
  toner: "hair_color_shade",
  developer: "developer_oxidant",
  bleach: "lightener_bleach",
  plex: "bond_builder",
  treatment: "treatment_care",
  straightening: "treatment_care",
  perm: "treatment_care",
  retail: "retail/home-care",
  accessory: "accessory",
};

const NAMED_TONES = {
  natural: { primaryToneLabel: "Natural", toneFamily: "natural" },
  "natural gold": { primaryToneLabel: "Natural Gold", toneFamily: "warm" },
  "golden blonde": { primaryToneLabel: "Gold", toneFamily: "warm" },
  "warm beige": { primaryToneLabel: "Beige", toneFamily: "warm" },
  "copper red": { primaryToneLabel: "Copper Red", toneFamily: "warm" },
  pearl: { primaryToneLabel: "Pearl", toneFamily: "cool" },
  silver: { primaryToneLabel: "Pearl", toneFamily: "cool" },
  gold: { primaryToneLabel: "Gold", toneFamily: "warm" },
  copper: { primaryToneLabel: "Copper", toneFamily: "warm" },
  red: { primaryToneLabel: "Red", toneFamily: "warm" },
  violet: { primaryToneLabel: "Violet", toneFamily: "violet" },
};

function detectProductType(product, lineRules) {
  const rawType = String(product.type || "").toLowerCase();
  const series = String(product.series || "").toUpperCase().trim();
  const allText = `${series} ${product.shade || ""} ${product.familyShade || ""}`.toLowerCase();
  let productType = TYPE_MAP[rawType] || "unknown";
  let source = `catalog:${rawType || "missing"}`;

  const exact = lineRules[series];
  if (exact) return { productType: exact.productType, source: `line:${series}` };

  for (const [line, rule] of Object.entries(lineRules)) {
    if (series.includes(line) || line.includes(series)) {
      return { productType: rule.productType, source: `partial_line:${line}` };
    }
  }

  if (["welloxon", "developer", "vol", "oxidant", "creme"].some(kw => allText.includes(kw))) {
    productType = "developer_oxidant";
    source = "keyword:developer";
  } else if (["blondor", "magma", "blond me", "blondme", "bleach"].some(kw => allText.includes(kw))) {
    productType = "lightener";
    source = "keyword:lightener";
  }

  return { productType, source };
}

function parseNamedTone(shade) {
  const lower = String(shade || "").toLowerCase().trim();
  if (!lower) return null;
  if (NAMED_TONES[lower]) return { ...NAMED_TONES[lower], normalized: String(shade).toUpperCase(), exact: true };
  for (const [key, value] of Object.entries(NAMED_TONES)) {
    if (lower.includes(key)) return { ...value, normalized: String(shade).toUpperCase(), exact: false };
  }
  return null;
}

function parseShade(shade, allowAlpha) {
  const raw = String(shade || "").trim();
  if (!raw) return null;

  const slash = raw.match(SHADE_CODE_PATTERNS.WELLA_SLASH.regex);
  if (slash) {
    const level = slash[1] ? Number(slash[1]) : null;
    const toneRaw = slash[2];
    const primary = toneRaw[0];
    const secondary = toneRaw.length > 1 ? toneRaw[1] : null;
    const primaryEntry = WELLA_REFLECTIONS[primary];
    const secondaryEntry = secondary && secondary !== "0" ? WELLA_REFLECTIONS[secondary] : null;
    return {
      shadeCodeNormalized: `${level == null ? "" : level}/${toneRaw}`,
      shadeSystem: "slash",
      level,
      primaryTone: primary,
      primaryToneLabel: primaryEntry?.label || null,
      secondaryTone: secondary,
      secondaryToneLabel: secondaryEntry?.label || null,
      toneFamily: primaryEntry?.toneFamily || null,
    };
  }

  if (allowAlpha) {
    const alpha = raw.match(/^(\d{1,2})([A-Z]{1,3}\+?)$/);
    if (alpha) {
      const entry = HYPOTHETICAL_WELLA_ALPHA_REFLECTIONS[alpha[2]];
      return {
        shadeCodeNormalized: `${alpha[1]}${alpha[2]}`,
        shadeSystem: "alpha",
        level: Number(alpha[1]),
        primaryTone: alpha[2],
        primaryToneLabel: entry?.label || alpha[2],
        secondaryTone: null,
        secondaryToneLabel: null,
        toneFamily: entry?.toneFamily || null,
      };
    }
  }

  const numeric = raw.match(/^(\d{1,2})$/);
  if (numeric) {
    return {
      shadeCodeNormalized: raw,
      shadeSystem: null,
      level: Number(raw),
      primaryTone: null,
      primaryToneLabel: null,
      secondaryTone: null,
      secondaryToneLabel: null,
      toneFamily: null,
    };
  }

  const named = parseNamedTone(raw);
  if (named) {
    return {
      shadeCodeNormalized: named.normalized,
      shadeSystem: "named",
      level: null,
      primaryTone: named.primaryToneLabel,
      primaryToneLabel: named.primaryToneLabel,
      secondaryTone: null,
      secondaryToneLabel: null,
      toneFamily: named.toneFamily,
      namedExact: named.exact,
    };
  }

  return null;
}

function extractPackage(product) {
  if (product.materialWeight || product.packingWeight) return `${product.materialWeight || product.packingWeight}g`;
  const text = `${product.shade || ""} ${product.series || ""} ${product.familyShade || ""}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(g|ml|oz)\b/i);
  return match ? `${match[1]}${match[2].toLowerCase()}` : null;
}

function classify(product, scenario) {
  const type = detectProductType(product, scenario.extendedProductLines ? EXTENDED_WELLA_LINE_RULES : BASELINE_WELLA_LINE_RULES);
  let confidence = 0.97;
  const shade = parseShade(product.shade, scenario.alphaShadeParsing);
  const packageSize = extractPackage(product);
  const barcode = product.barcode || product.barcodes?.[0] || null;
  const evidence = [{ field: "productType", source: type.source, value: type.productType }];

  let shadeCodeNormalized = null;
  let level = null;
  let primaryToneLabel = null;
  let shadeSystem = null;
  let toneFamily = null;
  let tonalProfile = null;
  let issue = null;

  if (shade) {
    shadeCodeNormalized = shade.shadeCodeNormalized;
    level = shade.level;
    primaryToneLabel = shade.primaryToneLabel;
    shadeSystem = shade.shadeSystem;
    toneFamily = shade.toneFamily;
    if (shade.namedExact === false) confidence -= 0.05;
  } else if (scenario.excludeNonShadeFromShadeAnalysis && NON_SHADE_TYPES.has(type.productType)) {
    shadeCodeNormalized = String(product.shade || "").toUpperCase().trim() || null;
    evidence.push({ field: "shade", source: "non_shade_variant", note: "Excluded from shade ontology" });
  } else if (product.shade) {
    issue = `unparseable shade code "${product.shade}"`;
    confidence -= 0.10;
    evidence.push({ field: "shade", issue, impact: -0.10 });
  } else if (SHADE_TYPES.has(type.productType)) {
    issue = "missing shade for color product";
    confidence -= 0.15;
    evidence.push({ field: "shade", issue, impact: -0.15 });
  }

  if (!packageSize) confidence -= 0.03;
  if (barcode || product.catalogNo) confidence = Math.min(1, confidence + 0.02);

  if (shade && shade.level != null && SHADE_TYPES.has(type.productType)) {
    tonalProfile = { level, primaryToneLabel, toneFamily, manufacturerSpecific: true };
  }

  confidence = Number(Math.max(0, Math.min(1, confidence)).toFixed(4));
  const band = confidence >= 0.95 ? "automatic" : confidence >= 0.80 ? "review" : "unresolved";

  return {
    sourceId: product.id,
    brand: product.brand,
    productLine: product.series || null,
    productFamily: product.familyShade || null,
    productType: type.productType,
    productTypeSource: type.source,
    shadeCodeRaw: product.shade || null,
    shadeCodeNormalized,
    shadeSystem,
    level,
    primaryToneLabel,
    toneFamily,
    packageSize,
    barcode,
    confidence,
    confidenceBand: band,
    evidence,
    issue,
    tonalProfile,
    active: (product.flag ?? 0) === 0,
  };
}

function runScenario(records, scenario) {
  const results = records.map(record => classify(record, scenario));
  return {
    name: scenario.name,
    automatic: results.filter(r => r.confidenceBand === "automatic"),
    review: results.filter(r => r.confidenceBand === "review"),
    unresolved: results.filter(r => r.confidenceBand === "unresolved"),
    results,
  };
}

function typeBucket(result) {
  switch (result.productType) {
    case "permanent_color": return "permanent color";
    case "demi_permanent": return "demi/semi color";
    case "acidic_toner":
    case "hair_color_shade": return /TONER|TRUE GREY|INSTAMATIC|SHINEFINITY/i.test(`${result.productLine} ${result.shadeCodeRaw}`) ? "toner" : "permanent color";
    case "direct_dye": return "demi/semi color";
    case "lightener":
    case "lightener_bleach": return "lightener";
    case "developer":
    case "developer_oxidant": return "developer";
    case "treatment_care":
    case "bond_builder": return "treatment";
    case "retail/home-care": return "retail/home-care";
    case "accessory": return "accessory";
    default: return "unknown";
  }
}

function countBy(items, fn) {
  const counts = {};
  for (const item of items) counts[fn(item)] = (counts[fn(item)] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count }));
}

function keyResult(result) {
  return {
    productLine: result.productLine,
    productType: result.productType,
    shadeCodeNormalized: result.shadeCodeNormalized,
    shadeSystem: result.shadeSystem,
    level: result.level,
    primaryToneLabel: result.primaryToneLabel,
    packageSize: result.packageSize,
    confidenceBand: result.confidenceBand,
    confidence: result.confidence,
  };
}

function diffResults(a, b) {
  const bMap = new Map(b.map(item => [item.sourceId, item]));
  const changed = [];
  for (const before of a) {
    const after = bMap.get(before.sourceId);
    if (!after) continue;
    const beforeKey = keyResult(before);
    const afterKey = keyResult(after);
    if (JSON.stringify(beforeKey) !== JSON.stringify(afterKey)) {
      changed.push({ id: before.sourceId, before: beforeKey, after: afterKey, raw: { series: before.productLine, shade: before.shadeCodeRaw } });
    }
  }
  return changed;
}

function validationErrors(result) {
  const errors = [];
  if (!result.productLine) errors.push("missing product line");
  if (!result.productType) errors.push("missing product type");
  if (!result.packageSize) errors.push("missing package");
  if (SHADE_TYPES.has(result.productType) && !result.shadeCodeNormalized) errors.push("shade product lacks normalized shade");
  if (NON_SHADE_TYPES.has(result.productType) && result.tonalProfile) errors.push("non-shade product has tonal profile");
  if (result.tonalProfile && result.tonalProfile.manufacturerSpecific !== true) errors.push("cross-brand safety flag missing");
  return errors;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const ch of String(value || "")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sample50(items) {
  return items
    .map(item => ({ item, hash: stableHash(item.sourceId) }))
    .sort((a, b) => a.hash - b.hash)
    .slice(0, 50)
    .map(({ item }) => ({
      id: item.sourceId,
      productLine: item.productLine,
      productType: item.productType,
      shade: item.shadeCodeRaw,
      normalized: item.shadeCodeNormalized,
      level: item.level,
      primaryTone: item.primaryToneLabel,
      packageSize: item.packageSize,
      confidence: item.confidence,
      errors: validationErrors(item),
    }));
}

function markdown(report) {
  const lines = [];
  lines.push("# Milestone 5 — Wella Rule Proof Report");
  lines.push("");
  lines.push(`**Generated:** ${report.generatedAt.slice(0, 10)}  `);
  lines.push(`**Frozen baseline rulesVersion:** ${report.rulesVersion}  `);
  lines.push("**Mode:** dry-run only, no database writes");
  lines.push("");

  lines.push("## Baseline Freeze");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|--------|-------|");
  lines.push(`| Baseline automatic | ${report.baseline.counts.automatic} |`);
  lines.push(`| Baseline review | ${report.baseline.counts.review} |`);
  lines.push(`| Baseline unresolved | ${report.baseline.counts.unresolved} |`);
  lines.push("");

  lines.push("## Baseline Review Records By Product Type");
  lines.push("");
  lines.push("| Product Type Bucket | Count | Shade-Level? |");
  lines.push("|---------------------|-------|--------------|");
  for (const row of report.baseline.reviewByTypeBucket) {
    const shadeLevel = ["permanent color", "demi/semi color", "toner"].includes(row.key) ? "yes" : "no";
    lines.push(`| ${row.key} | ${row.count} | ${shadeLevel} |`);
  }
  lines.push("");
  lines.push(`Actual baseline review records requiring shade-level classification: **${report.baseline.shadeLevelReviewCount}**.`);
  lines.push("");

  lines.push("## Proposed Changes Evaluation");
  lines.push("");
  lines.push("| Change | Automatic | Review | Unresolved | Improved Records | Baseline Automatic Changed | Regressions |");
  lines.push("|--------|-----------|--------|------------|------------------|----------------------------|-------------|");
  for (const row of report.proposedChanges) {
    lines.push(`| ${row.name} | ${row.counts.automatic} | ${row.counts.review} | ${row.counts.unresolved} | ${row.improvedFromReviewToAutomatic} | ${row.baselineAutomaticChanged} | ${row.regressions.length} |`);
  }
  lines.push("");

  lines.push("## Rule Change Justification");
  lines.push("");
  for (const rule of report.ruleJustifications) {
    lines.push(`### ${rule.name}`);
    lines.push("");
    lines.push(`- Pattern fixed: ${rule.pattern}`);
    lines.push(`- Why current result is wrong: ${rule.whyCurrentWrong}`);
    lines.push(`- Why manufacturer-correct: ${rule.whyManufacturerCorrect}`);
    lines.push(`- Records improved: ${rule.recordsImproved}`);
    lines.push(`- Existing records that could regress: ${rule.recordsCouldRegress}`);
    lines.push("");
    lines.push("| Product Line | Shade | Type |");
    lines.push("|--------------|-------|------|");
    for (const ex of rule.examples) lines.push(`| ${ex.productLine} | ${ex.shade} | ${ex.productType} |`);
    lines.push("");
  }

  lines.push("## Baseline Automatic Field Changes Under Combined Proposed Change");
  lines.push("");
  if (report.combinedBaselineAutomaticChanges.length === 0) {
    lines.push("No baseline automatic classifications changed field-by-field.");
  } else {
    lines.push(`${report.combinedBaselineAutomaticChanges.length} baseline automatic classifications changed:`);
    lines.push("");
    lines.push("| ID | Series | Shade | Before Type | After Type | Before Shade | After Shade | Before Confidence | After Confidence |");
    lines.push("|----|--------|-------|-------------|------------|--------------|-------------|-------------------|------------------|");
    for (const change of report.combinedBaselineAutomaticChanges.slice(0, 80)) {
      lines.push(`| ${change.id.slice(-8)} | ${change.raw.series || ""} | ${change.raw.shade || ""} | ${change.before.productType || ""} | ${change.after.productType || ""} | ${change.before.shadeCodeNormalized || ""} | ${change.after.shadeCodeNormalized || ""} | ${change.before.confidence} | ${change.after.confidence} |`);
    }
  }
  lines.push("");

  lines.push("## Results By Product Type And Product Line");
  lines.push("");
  lines.push("### Final Combined By Product Type");
  lines.push("");
  lines.push("| Product Type | Count |");
  lines.push("|--------------|-------|");
  for (const row of report.combined.byProductType) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");
  lines.push("### Final Combined By Product Line");
  lines.push("");
  lines.push("| Product Line | Count |");
  lines.push("|--------------|-------|");
  for (const row of report.combined.byProductLine.slice(0, 40)) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Random Validation Sample: 50 Automatic Classifications");
  lines.push("");
  lines.push("| ID | Product Line | Type | Shade | Normalized | Level | Package | Errors |");
  lines.push("|----|--------------|------|-------|------------|-------|---------|--------|");
  for (const item of report.validationSample50) {
    lines.push(`| ${item.id.slice(-8)} | ${item.productLine || ""} | ${item.productType || ""} | ${item.shade || ""} | ${item.normalized || ""} | ${item.level ?? ""} | ${item.packageSize || ""} | ${item.errors.join("; ") || ""} |`);
  }
  lines.push("");
  lines.push("## Classification Errors Found In Sample");
  lines.push("");
  const sampleErrors = report.validationSample50.flatMap(item => item.errors.map(error => ({ id: item.id, error })));
  if (sampleErrors.length === 0) lines.push("No machine-detected classification errors found in the 50-record automatic sample.");
  else for (const err of sampleErrors) lines.push(`- ${err.id.slice(-8)}: ${err.error}`);
  lines.push("");

  lines.push("## Decision");
  lines.push("");
  lines.push(report.decision);
  lines.push("");
  return lines.join("\n");
}

function main() {
  const records = JSON.parse(fs.readFileSync(WELLA_PATH, "utf8"));
  const realBaselineResults = records.map(record => classifyProduct(record, "wella-professionals"));
  const baseline = {
    name: "frozen real baseline",
    automatic: realBaselineResults.filter(item => item.confidenceBand === "automatic"),
    review: realBaselineResults.filter(item => item.confidenceBand === "review"),
    unresolved: realBaselineResults.filter(item => item.confidenceBand === "unresolved"),
    results: realBaselineResults,
  };

  const baselineAutoIds = new Set(baseline.automatic.map(item => item.sourceId));

  const report = {
    generatedAt: new Date().toISOString(),
    rulesVersion: RULES_VERSION,
    baseline: {
      counts: {
        automatic: baseline.automatic.length,
        review: baseline.review.length,
        unresolved: baseline.unresolved.length,
      },
      fullAutomaticResults: baseline.automatic,
      fullReviewResults: baseline.review,
      reviewByTypeBucket: countBy(baseline.review, typeBucket),
      reviewByProductType: countBy(baseline.review, item => item.productType),
      reviewByProductLine: countBy(baseline.review, item => item.productLine || "(missing)"),
      shadeLevelReviewCount: baseline.review.filter(item => ["permanent color", "demi/semi color", "toner"].includes(typeBucket(item))).length,
      nonShadeReviewCount: baseline.review.filter(item => !["permanent color", "demi/semi color", "toner"].includes(typeBucket(item))).length,
    },
    proposedChanges: [
      {
        name: "No Wella rule change accepted",
        counts: {
          automatic: baseline.automatic.length,
          review: baseline.review.length,
          unresolved: baseline.unresolved.length,
        },
        improvedFromReviewToAutomatic: 0,
        baselineAutomaticChanged: 0,
        regressions: [],
        note: "Provisional Wella changes were reverted. Exact rule proof must be implemented test-first before any change is accepted.",
      },
    ],
    ruleJustifications: [
      {
        name: "Provisional Wella product-type routing and non-shade separation (reverted)",
        pattern: "Repeat Wella product lines such as BLONDOR DEVELOPERS, ULTIMATE REPAIR, BRILLIANCE, FUSION, WELLOXON DEVELOPERS are non-shade products but were penalized as shade parse failures.",
        whyCurrentWrong: "Not accepted yet. The baseline proves 73 of 385 review records are non-shade products, but the exact rule change must be tested independently before acceptance.",
        whyManufacturerCorrect: "Likely correct for Wella developer/lightener/care lines, but not accepted without exact regression comparison.",
        recordsImproved: 0,
        recordsCouldRegress: "Unknown until exact test-first comparison is implemented.",
        examples: baseline.review.filter(item => !["permanent color", "demi/semi color", "toner"].includes(typeBucket(item))).slice(0, 8).map(item => ({ productLine: item.productLine, shade: item.shadeCodeRaw, productType: item.productType })),
      },
      {
        name: "Provisional Wella Color Charm alpha suffix parsing (reverted)",
        pattern: "Color Charm alpha shade codes like 10A, 8N, 8G, 7RR, 2BBL.",
        whyCurrentWrong: "Not accepted yet. The baseline shows recurring alpha-like Color Charm records, but each needs manufacturer-correct evidence and tests before parser changes.",
        whyManufacturerCorrect: "Potentially Wella-scoped, but not accepted in code.",
        recordsImproved: 0,
        recordsCouldRegress: "Unknown until exact test-first comparison is implemented.",
        examples: baseline.review.filter(item => /^\d{1,2}[A-Z]{1,4}\+?$/i.test(item.shadeCodeRaw || "")).slice(0, 8).map(item => ({ productLine: item.productLine, shade: item.shadeCodeRaw, productType: item.productType })),
      },
      {
        name: "Provisional Wella product line aliases (reverted)",
        pattern: "KOLESTONE, COLOR TOUCH PLUS, ILLUMINA, COLOR FRESH, TRUE GREY, INSTAMATIC and Color Charm line names recur as known Wella lines.",
        whyCurrentWrong: "Not accepted yet. The baseline breakdown suggests routing gaps, but aliases must be proven line-by-line.",
        whyManufacturerCorrect: "Potentially Wella-scoped, but not accepted in code.",
        recordsImproved: 0,
        recordsCouldRegress: "Unknown until exact test-first comparison is implemented.",
        examples: baseline.review.filter(item => /CHARM|KOLESTONE|COLOR TOUCH PLUS|ILLUMINA|TRUE GREY|INSTAMATIC|COLOR FRESH/i.test(item.productLine || "")).slice(0, 8).map(item => ({ productLine: item.productLine, shade: item.shadeCodeRaw, productType: item.productType })),
      },
    ],
    combinedBaselineAutomaticChanges: [],
    combined: {
      counts: {
        automatic: baseline.automatic.length,
        review: baseline.review.length,
        unresolved: baseline.unresolved.length,
      },
      byProductType: countBy(baseline.results, item => item.productType),
      byProductLine: countBy(baseline.results, item => item.productLine || "(missing)"),
    },
    validationSample50: sample50(baseline.automatic),
    rulesAdded: [],
    rulesReverted: [
      "Provisional Wella Color Charm alpha parsing",
      "Provisional extended Wella product-line routing",
      "Provisional non-shade product variant exclusion from shade ontology",
    ],
    decision: "The real Wella baseline has been restored and frozen at 406 automatic / 385 review / 0 unresolved. No Wella shade-rule change is accepted in this report. The next safe step is manual review of the baseline review-by-type breakdown and then isolated, test-first proof for any Wella-only rule change.",
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "wella-rule-proof-report.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "wella-rule-proof-report.md"), markdown(report));
  process.stdout.write(`Wrote reports/catalog-classification/milestone-5/wella-rule-proof-report.[json|md]\n`);
  process.stdout.write(`Baseline: ${baseline.automatic.length} automatic / ${baseline.review.length} review / ${baseline.unresolved.length} unresolved\n`);
  process.stdout.write(`Accepted after-state: unchanged baseline (provisional Wella changes reverted)\n`);
  process.stdout.write(`Baseline review shade-level count: ${report.baseline.shadeLevelReviewCount}\n`);
  process.stdout.write(`Baseline review non-shade count: ${report.baseline.nonShadeReviewCount}\n`);
}

main();
