/**
 * scripts/lib/m5-classification/review-analysis.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Groups dry-run review classifications into repeatable exception patterns.
 *
 * This is intentionally read-only analysis: it does not change classifications,
 * thresholds, or write to the database. The output is used to decide which
 * patterns can be safely moved from review to automatic by deterministic rules.
 */

"use strict";

const SHADE_BEARING_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
]);

const NON_SHADE_PRODUCT_TYPES = new Set([
  "lightener",
  "lightener_bleach",
  "developer",
  "developer_oxidant",
  "treatment_care",
  "bond_builder",
  "other",
]);

function shadeFormat(classification) {
  const raw = classification.shadeCodeRaw || "";
  if (!raw) return "missing_shade";
  if (classification.shadeSystem) return classification.shadeSystem;
  if (/^\d{1,2}[A-Z]{1,4}$/i.test(raw.trim())) return "alpha_suffix_unparsed";
  if (/\d/.test(raw)) return "named_with_number_or_size";
  return "named_no_numeric_level";
}

function missingFields(classification) {
  const missing = [];
  if (!classification.productLine) missing.push("productLine");
  if (!classification.productFamily) missing.push("productFamily");
  if (!classification.shadeCodeNormalized) missing.push("shadeCodeNormalized");
  if (SHADE_BEARING_PRODUCT_TYPES.has(classification.productType) && classification.level == null) {
    missing.push("level");
  }
  if (!classification.packageSize) missing.push("packageSize");
  if (!classification.barcode) missing.push("barcode");
  if (!classification.catalogNumber) missing.push("catalogNumber");
  return missing;
}

function reviewReasons(classification) {
  const reasons = new Set();
  for (const entry of classification.evidence || []) {
    if (entry.issue) reasons.add(entry.issue);
  }

  const format = shadeFormat(classification);
  if (format === "alpha_suffix_unparsed") {
    reasons.add("alpha shade code not parsed");
  }
  if (!classification.shadeCodeNormalized) {
    reasons.add("shade not normalized");
  }
  if (SHADE_BEARING_PRODUCT_TYPES.has(classification.productType) && classification.level == null) {
    reasons.add("no numeric level for shade product");
  }
  if (NON_SHADE_PRODUCT_TYPES.has(classification.productType) && !classification.shadeCodeNormalized) {
    reasons.add("non-shade product variant/name treated as shade");
  }
  if (!classification.packageSize) {
    reasons.add("package ambiguity");
  }

  if (reasons.size === 0) {
    reasons.add("confidence below automatic: deterministic but not exact shade SKU");
  }

  return [...reasons];
}

function categoryFor(classification) {
  const type = classification.productType;
  const format = shadeFormat(classification);
  const line = (classification.productLine || "").toUpperCase();
  const shade = (classification.shadeCodeRaw || "").toUpperCase();

  if (type === "developer" || type === "developer_oxidant" || /DEVELOPER|WELLOXON|VOL\.?|%/.test(`${line} ${shade}`)) {
    return "developer";
  }
  if (type === "lightener" || type === "lightener_bleach" || /BLONDOR|MAGMA|BLEACH|LIGHTENER|BLONDE/.test(`${line} ${shade}`)) {
    return "lightener";
  }
  if (type === "treatment_care" || /SHAMPOO|CONDITIONER|MASK|MASQUE|REPAIR|TREATMENT|FUSION|BRILLIANCE/.test(`${line} ${shade}`)) {
    return "treatment_or_care";
  }
  if (type === "bond_builder") {
    return "bond_builder";
  }
  if (format === "alpha_suffix_unparsed") {
    return "alpha_shade_code";
  }
  if (type === "acidic_toner" || /TONER|TRUE GREY|INSTAMATIC|SHINEFINITY/.test(`${line} ${shade}`)) {
    return "named_toner";
  }
  if (SHADE_BEARING_PRODUCT_TYPES.has(type) && classification.level == null) {
    return "shade_product_without_numeric_level";
  }
  return "other_review_pattern";
}

function canResolveDeterministically(classification) {
  const category = categoryFor(classification);
  const format = shadeFormat(classification);

  if (category === "alpha_shade_code") {
    return {
      value: true,
      rationale: "Wella Color Charm alpha suffixes can be parsed with a brand-specific alpha reflection map.",
    };
  }
  if (["developer", "lightener", "treatment_or_care", "bond_builder"].includes(category)) {
    return {
      value: true,
      rationale: "This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map.",
    };
  }
  if (category === "named_toner") {
    return {
      value: "partial",
      rationale: "Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules.",
    };
  }
  if (format === "named_no_numeric_level") {
    return {
      value: false,
      rationale: "Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated.",
    };
  }
  return {
    value: false,
    rationale: "No repeatable deterministic rule identified yet.",
  };
}

function patternKey(classification) {
  return [
    categoryFor(classification),
    classification.productLine || "(missing-line)",
    classification.productType || "(missing-type)",
    shadeFormat(classification),
    missingFields(classification).join("+") || "(none-missing)",
  ].join(" | ");
}

function summarizeBy(items, fn) {
  const counts = new Map();
  for (const item of items) {
    const key = fn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([key, count]) => ({ key, count }));
}

function compactExample(classification) {
  return {
    id: classification.sourceId,
    productLine: classification.productLine,
    productFamily: classification.productFamily,
    productType: classification.productType,
    shade: classification.shadeCodeRaw,
    shadeFormat: shadeFormat(classification),
    normalizedShade: classification.shadeCodeNormalized,
    level: classification.level,
    primaryTone: classification.primaryToneLabel,
    packageSize: classification.packageSize ? `${classification.packageSize}${classification.packageUnit}` : null,
    barcode: classification.barcode,
    confidence: classification.confidence,
    missingFields: missingFields(classification),
    reviewReasons: reviewReasons(classification),
  };
}

function analyzeReviewItems(reviewItems) {
  const groups = new Map();

  for (const item of reviewItems) {
    const key = patternKey(item);
    if (!groups.has(key)) {
      const resolvable = canResolveDeterministically(item);
      groups.set(key, {
        pattern: key,
        category: categoryFor(item),
        reviewReason: reviewReasons(item),
        productLine: item.productLine,
        productType: item.productType,
        shadeFormat: shadeFormat(item),
        missingFields: missingFields(item),
        count: 0,
        canResolveDeterministically: resolvable.value,
        deterministicResolutionRationale: resolvable.rationale,
        examples: [],
      });
    }

    const group = groups.get(key);
    group.count += 1;
    if (group.examples.length < 8) {
      group.examples.push(compactExample(item));
    }
  }

  const groupedPatterns = [...groups.values()]
    .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern));

  return {
    totalReviewItems: reviewItems.length,
    groupedPatterns,
    countsByReviewReason: summarizeBy(reviewItems.flatMap(reviewReasons), x => x),
    countsByProductLine: summarizeBy(reviewItems, x => x.productLine || "(missing)"),
    countsByProductType: summarizeBy(reviewItems, x => x.productType || "(missing)"),
    countsByShadeFormat: summarizeBy(reviewItems, shadeFormat),
    countsByCategory: summarizeBy(reviewItems, categoryFor),
    safelyResolvableCount: reviewItems.filter(item => canResolveDeterministically(item).value === true).length,
    partiallyResolvableCount: reviewItems.filter(item => canResolveDeterministically(item).value === "partial").length,
    keepReviewCount: reviewItems.filter(item => canResolveDeterministically(item).value === false).length,
  };
}

function renderReviewAnalysisMarkdown({ title, generatedAt, analysis }) {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`**Generated:** ${generatedAt.slice(0, 10)}  `);
  lines.push(`**Review records analyzed:** ${analysis.totalReviewItems}`);
  lines.push("");
  lines.push("This report is read-only and does not authorize production writes.");
  lines.push("");

  lines.push("## Resolution Summary");
  lines.push("");
  lines.push("| Category | Count |");
  lines.push("|----------|-------|");
  lines.push(`| Safely resolvable with deterministic rules | ${analysis.safelyResolvableCount} |`);
  lines.push(`| Partially resolvable as separate toner/ontology work | ${analysis.partiallyResolvableCount} |`);
  lines.push(`| Keep in review | ${analysis.keepReviewCount} |`);
  lines.push("");

  lines.push("## Counts By Category");
  lines.push("");
  lines.push("| Category | Count |");
  lines.push("|----------|-------|");
  for (const row of analysis.countsByCategory) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Counts By Product Type");
  lines.push("");
  lines.push("| Product Type | Count |");
  lines.push("|--------------|-------|");
  for (const row of analysis.countsByProductType) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Counts By Product Line");
  lines.push("");
  lines.push("| Product Line | Count |");
  lines.push("|--------------|-------|");
  for (const row of analysis.countsByProductLine.slice(0, 30)) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Counts By Shade Format");
  lines.push("");
  lines.push("| Shade Format | Count |");
  lines.push("|--------------|-------|");
  for (const row of analysis.countsByShadeFormat) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Counts By Review Reason");
  lines.push("");
  lines.push("| Review Reason | Count |");
  lines.push("|---------------|-------|");
  for (const row of analysis.countsByReviewReason.slice(0, 40)) lines.push(`| ${row.key} | ${row.count} |`);
  lines.push("");

  lines.push("## Grouped Exception Patterns");
  lines.push("");
  lines.push("| Count | Category | Product Line | Type | Shade Format | Missing Fields | Deterministic? |");
  lines.push("|-------|----------|--------------|------|--------------|----------------|----------------|");
  for (const group of analysis.groupedPatterns.slice(0, 80)) {
    lines.push([
      group.count,
      group.category,
      group.productLine || "",
      group.productType || "",
      group.shadeFormat,
      group.missingFields.join(", ") || "(none)",
      `${group.canResolveDeterministically} - ${group.deterministicResolutionRationale}`,
    ].map(cell => `| ${String(cell).replace(/\|/g, "/")} `).join("") + "|");
  }
  lines.push("");

  lines.push("## Example Records By Pattern");
  lines.push("");
  for (const group of analysis.groupedPatterns.slice(0, 20)) {
    lines.push(`### ${group.category} / ${group.productLine || "(missing line)"} / ${group.shadeFormat}`);
    lines.push("");
    lines.push(`Count: ${group.count}`);
    lines.push("");
    lines.push("| ID | Type | Shade | Normalized | Missing | Confidence |");
    lines.push("|----|------|-------|------------|---------|------------|");
    for (const ex of group.examples) {
      lines.push(`| ${(ex.id || "").slice(-8)} | ${ex.productType || ""} | ${ex.shade || ""} | ${ex.normalizedShade || ""} | ${ex.missingFields.join(", ") || "(none)"} | ${ex.confidence} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

module.exports = {
  SHADE_BEARING_PRODUCT_TYPES,
  NON_SHADE_PRODUCT_TYPES,
  analyzeReviewItems,
  renderReviewAnalysisMarkdown,
  shadeFormat,
  reviewReasons,
  missingFields,
  categoryFor,
  canResolveDeterministically,
};
