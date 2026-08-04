/**
 * Validate extracted TRUSS records: EAN, duplicates, variant conflicts.
 */

"use strict";

const { validateBarcode } = require("./ean");

function validateRecords(records) {
  const byEan = new Map();
  const byTrs = new Map();
  const byNameSize = new Map();
  const byFamilyShade = new Map();

  const issues = {
    missing_ean: [],
    invalid_ean: [],
    qr_decode_failed: [],
    duplicate_ean: [],
    duplicate_trs: [],
    same_name_different_size: [],
    same_family_shade_different_formula: [],
    missing_trs: [],
    missing_category: [],
    missing_product_line: [],
  };

  for (const rec of records) {
    if (!rec.trs_code) issues.missing_trs.push(rec.source_pdf_page);
    if (!rec.category) issues.missing_category.push(rec.source_pdf_page);
    if (!rec.product_line) issues.missing_product_line.push(rec.source_pdf_page);

    if (rec.qr_decoded === false) {
      issues.qr_decode_failed.push(rec.source_pdf_page);
    }

    const ean = rec.ean_barcode;
    if (!ean) {
      issues.missing_ean.push(rec.source_pdf_page);
      rec.ean_valid = false;
      if (rec.source_status !== "needs_review") rec.source_status = "needs_review";
    } else {
      const v = validateBarcode(ean);
      rec.ean_valid = v.ok;
      rec.ean_barcode_type = v.barcode_type;
      if (!v.ok) {
        issues.invalid_ean.push({
          page: rec.source_pdf_page,
          ean,
          reason: v.reason,
          trs: rec.trs_code,
        });
        rec.source_status = "needs_review";
      }
      if (!byEan.has(ean)) byEan.set(ean, []);
      byEan.get(ean).push(rec);
    }

    if (rec.trs_code) {
      if (!byTrs.has(rec.trs_code)) byTrs.set(rec.trs_code, []);
      byTrs.get(rec.trs_code).push(rec);
    }

    const nameKey = `${rec.normalized_product_name || ""}::${rec.size_display || ""}`;
    if (rec.normalized_product_name) {
      const baseName = rec.normalized_product_name;
      if (!byNameSize.has(baseName)) byNameSize.set(baseName, new Set());
      byNameSize.get(baseName).add(rec.size_display || "unknown");
    }

    if (rec.product_line && rec.shade_code) {
      const fsKey = `${rec.product_line}::${rec.shade_code}`;
      if (!byFamilyShade.has(fsKey)) byFamilyShade.set(fsKey, []);
      byFamilyShade.get(fsKey).push(rec);
    }

    // Track unused nameKey to avoid lint noise in some envs
    void nameKey;
  }

  for (const [ean, rows] of byEan) {
    if (rows.length > 1) {
      issues.duplicate_ean.push({
        ean,
        pages: rows.map((r) => r.source_pdf_page),
        trs_codes: rows.map((r) => r.trs_code),
      });
      for (const r of rows) r.source_status = "needs_review";
    }
  }

  for (const [trs, rows] of byTrs) {
    if (rows.length > 1) {
      issues.duplicate_trs.push({
        trs,
        pages: rows.map((r) => r.source_pdf_page),
        eans: rows.map((r) => r.ean_barcode),
      });
      for (const r of rows) r.source_status = "needs_review";
    }
  }

  for (const [name, sizes] of byNameSize) {
    if (sizes.size > 1) {
      issues.same_name_different_size.push({
        normalized_product_name: name,
        sizes: [...sizes],
      });
    }
  }

  for (const [key, rows] of byFamilyShade) {
    const formulas = new Set(
      rows.map((r) => `${r.permanent_type || ""}|${r.product_type || ""}|${r.trs_code || ""}`),
    );
    if (formulas.size > 1 && rows.length > 1) {
      // Only flag when multiple distinct TRS share shade+line (different formulas)
      const trsSet = new Set(rows.map((r) => r.trs_code).filter(Boolean));
      if (trsSet.size > 1) {
        issues.same_family_shade_different_formula.push({
          key,
          pages: rows.map((r) => r.source_pdf_page),
          trs_codes: [...trsSet],
        });
      }
    }
  }

  const approvedEligible = records.filter(
    (r) => r.ean_valid && r.trs_code && r.source_status === "extracted",
  );

  return {
    total: records.length,
    approved_eligible: approvedEligible.length,
    needs_review: records.filter((r) => r.source_status === "needs_review").length,
    issues,
  };
}

module.exports = { validateRecords };
