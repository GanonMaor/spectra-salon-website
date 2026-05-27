/**
 * scripts/lib/product-catalog/matcher.js
 * ---------------------------------------------------------------
 * Compare candidate rows (parsed from uploads) against an existing
 * DB export and produce a status-tagged decision per row:
 *   new | update | duplicate-risk | missing-critical-data | needs-review
 */

"use strict";

const {
  applyShadeAlias,
  rowKey,
  normalizeShade,
  normalizeBrand,
  normalizeSeries,
} = require("./normalizer");
const {
  parseBarcodesField,
  stringifyBarcodes,
  validateRow,
  isValidBarcode,
} = require("./schema");

/**
 * Build an in-memory index of the existing DB export rows so the
 * matcher can do O(1) lookups by:
 *   - productId
 *   - any barcode
 *   - normalized brand+series+shade key (with alias support)
 */
function buildDbIndex(dbRows = []) {
  const byProductId = new Map();
  const byBarcode = new Map();
  const byKey = new Map();
  const brandSeries = new Map();

  for (const row of dbRows) {
    if (!row) continue;
    if (row.productId) byProductId.set(String(row.productId), row);
    const codes = parseBarcodesField(row.barcodes);
    for (const code of codes) {
      if (code) byBarcode.set(code, row);
    }
    const key = rowKey({ brand: row.brand, series: row.series, shade: row.shade });
    if (key) byKey.set(key, row);

    const b = normalizeBrand(row.brand);
    if (b) {
      if (!brandSeries.has(b)) brandSeries.set(b, new Set());
      const s = normalizeSeries(row.series);
      if (s) brandSeries.get(b).add(s);
    }
  }

  return {
    byProductId,
    byBarcode,
    byKey,
    brandSeries,
    rows: dbRows,
  };
}

/**
 * Look up a candidate row in the DB index. Returns
 *   { row, matchType }
 * or null when no match is found.
 *
 * matchType priority: productId > barcode > brand+series+shade > alias
 */
function findExistingRow(candidate, dbIndex) {
  if (candidate.productId && dbIndex.byProductId.has(candidate.productId)) {
    return { row: dbIndex.byProductId.get(candidate.productId), matchType: "productId" };
  }
  const codes = parseBarcodesField(candidate.barcodes);
  for (const code of codes) {
    if (dbIndex.byBarcode.has(code)) {
      return { row: dbIndex.byBarcode.get(code), matchType: "barcode" };
    }
  }
  const directKey = rowKey({
    brand: candidate.brand,
    series: candidate.series,
    shade: candidate.shade,
  });
  if (directKey && dbIndex.byKey.has(directKey)) {
    return { row: dbIndex.byKey.get(directKey), matchType: "brand-series-shade" };
  }
  // Try DB-typo aliases (e.g. "PLATINUM NACRE" → "PLATINIUM NACRE").
  const aliased = applyShadeAlias(candidate.shade);
  if (aliased.aliasApplied) {
    const aliasKey = rowKey({
      brand: candidate.brand,
      series: candidate.series,
      shade: aliased.canonical,
    });
    if (aliasKey && dbIndex.byKey.has(aliasKey)) {
      return {
        row: dbIndex.byKey.get(aliasKey),
        matchType: "alias",
        aliasNote: aliased.note || null,
      };
    }
  }
  return null;
}

/**
 * Determine the decision status for one candidate row.
 */
function decideStatus(candidate, match, options = {}) {
  const issues = [];

  if (match) {
    // existing product
    const dbCodes = parseBarcodesField(match.row.barcodes);
    const cCodes = parseBarcodesField(candidate.barcodes);
    const newCodes = cCodes.filter((c) => !dbCodes.includes(c));

    // Barcode that already belongs to a different product → duplicate-risk.
    if (
      cCodes.some(
        (c) =>
          options.dbIndex &&
          options.dbIndex.byBarcode.has(c) &&
          options.dbIndex.byBarcode.get(c).productId !== match.row.productId,
      )
    ) {
      issues.push({
        code: "BARCODE_BELONGS_TO_OTHER_PRODUCT",
        severity: "critical",
        message:
          "One or more barcodes already belong to a different product in the DB.",
      });
      return { status: "duplicate-risk", issues };
    }

    // Barcode-only match where the candidate disagrees with the DB
    // about which shade it represents → duplicate-risk so the user
    // can review before clobbering.
    if (
      match.matchType === "barcode" &&
      candidate.shade &&
      match.row.shade &&
      String(candidate.shade).toUpperCase() !== String(match.row.shade).toUpperCase()
    ) {
      issues.push({
        code: "BARCODE_SHADE_MISMATCH",
        severity: "critical",
        message: `Barcode ${cCodes.join(", ")} is on DB shade "${match.row.shade}" but the upload claims shade "${candidate.shade}".`,
      });
      return { status: "duplicate-risk", issues };
    }

    if (newCodes.length === 0 && !candidate.ILS && !candidate.materialWeight) {
      // Nothing new to write; keep as a no-op update so the user
      // can still review it.
      return { status: "update", issues };
    }
    return { status: "update", issues };
  }

  // brand-new candidate
  for (const issue of validateRow(candidate, "new")) {
    issues.push(issue);
  }

  // Reject candidates that have a barcode that already exists in DB.
  const cCodes = parseBarcodesField(candidate.barcodes);
  for (const code of cCodes) {
    if (options.dbIndex && options.dbIndex.byBarcode.has(code)) {
      issues.push({
        code: "BARCODE_COLLIDES_DB",
        severity: "critical",
        message: `Barcode "${code}" already exists in the DB but the candidate doesn't match the existing product.`,
      });
      return { status: "duplicate-risk", issues };
    }
  }

  const criticals = issues.filter((i) => i.severity === "critical");
  if (criticals.length > 0) return { status: "needs-review", issues };

  const missingFields = [];
  if (!cCodes.length) missingFields.push("barcodes");
  if (candidate.ILS == null) missingFields.push("ILS");
  if (candidate.materialWeight == null) missingFields.push("materialWeight");

  if (missingFields.length > 0) {
    issues.push({
      code: "MISSING_CRITICAL_DATA",
      severity: "medium",
      message: `Row is missing: ${missingFields.join(", ")}.`,
    });
    return { status: "missing-critical-data", issues };
  }

  return { status: "new", issues };
}

/**
 * Run the matcher for a list of candidate rows.
 */
function matchRows(candidates, dbRows, options = {}) {
  const dbIndex = buildDbIndex(dbRows);
  const decided = [];
  const seenBarcodes = new Map(); // intra-batch dedupe

  for (const cand of candidates) {
    const match = findExistingRow(cand, dbIndex);
    const decision = decideStatus(cand, match, { ...options, dbIndex });

    // Detect duplicate barcodes inside this same upload batch.
    const cCodes = parseBarcodesField(cand.barcodes);
    for (const code of cCodes) {
      if (!code) continue;
      const prev = seenBarcodes.get(code);
      if (prev) {
        decision.issues.push({
          code: "BARCODE_DUPLICATE_IN_BATCH",
          severity: "high",
          message: `Barcode "${code}" appears on multiple uploaded rows.`,
        });
        if (decision.status !== "duplicate-risk") {
          decision.status = "duplicate-risk";
        }
      } else {
        seenBarcodes.set(code, cand);
      }
    }

    const matchedProductId = match ? match.row.productId : null;
    decided.push({
      ...cand,
      productId: matchedProductId || cand.productId || null,
      // Carry over canonical fields from DB on update so the user
      // can review without losing existing values.
      familyShade: match ? match.row.familyShade ?? cand.familyShade : cand.familyShade,
      image: match ? match.row.image ?? cand.image : cand.image,
      catalogNo: match ? match.row.catalogNo ?? cand.catalogNo : cand.catalogNo,
      hairColor: match ? match.row.hairColor ?? cand.hairColor : cand.hairColor,
      packingWeight:
        cand.packingWeight ?? (match ? match.row.packingWeight : null),
      materialWeight:
        cand.materialWeight ?? (match ? match.row.materialWeight : null),
      ILS: cand.ILS ?? (match ? match.row.ILS : null),
      type: cand.type || (match ? match.row.type : null),
      barcodes: mergeBarcodes(
        match ? match.row.barcodes : "[]",
        cand.barcodes,
      ),
      _matchedProductId: matchedProductId,
      _matchType: match ? match.matchType : null,
      _aliasNote: match ? match.aliasNote || null : null,
      _status: decision.status,
      _issues: decision.issues,
      _confidence: decision.status === "new" ? "medium" : "high",
    });
  }

  return decided;
}

function mergeBarcodes(existing, incoming) {
  const a = parseBarcodesField(existing);
  const b = parseBarcodesField(incoming);
  const merged = [];
  const seen = new Set();
  for (const code of [...a, ...b]) {
    if (!code || seen.has(code)) continue;
    seen.add(code);
    merged.push(code);
  }
  return stringifyBarcodes(merged);
}

module.exports = {
  buildDbIndex,
  findExistingRow,
  decideStatus,
  matchRows,
  mergeBarcodes,
};
