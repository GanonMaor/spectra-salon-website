/**
 * Match existing 47 TRUSS seed SKUs to PDF-derived records.
 * Priority: EAN > manufacturer id > TRS > line+name+size+shade.
 * Never merge on name similarity alone.
 */

"use strict";

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function seedBarcodes(seed) {
  const out = [];
  if (seed.barcode) out.push(String(seed.barcode));
  if (Array.isArray(seed.barcodes)) out.push(...seed.barcodes.map(String));
  return [...new Set(out.filter(Boolean))];
}

/**
 * @param {object[]} pdfRecords
 * @param {object[]} seedProducts from truss-professional.json
 */
function matchSeedToPdf(pdfRecords, seedProducts) {
  const byEan = new Map();
  const byTrs = new Map();
  for (const rec of pdfRecords) {
    if (rec.ean_barcode) byEan.set(rec.ean_barcode, rec);
    if (rec.trs_code) byTrs.set(rec.trs_code.toUpperCase(), rec);
  }

  const results = [];

  for (const seed of seedProducts) {
    const barcodes = seedBarcodes(seed);
    let match = null;
    let method = null;

    for (const ean of barcodes) {
      if (byEan.has(ean)) {
        match = byEan.get(ean);
        method = "exact_ean";
        break;
      }
    }

    if (!match && seed.catalogNo) {
      const catalog = String(seed.catalogNo).trim().toUpperCase();
      // Seed catalogNo is tp* style, not TRS — only exact TRS-like values count.
      if (/^TRS-?\d+$/i.test(catalog) && byTrs.has(catalog.replace(/^TRS/, "TRS").replace("TRS", "TRS-").replace("TRS--", "TRS-"))) {
        const trs = catalog.startsWith("TRS") ? catalog.replace(/^TRS-?/, "TRS-") : `TRS-${catalog}`;
        const normalizedTrs = trs.replace(/^TRS-?/, "TRS-");
        if (byTrs.has(normalizedTrs)) {
          match = byTrs.get(normalizedTrs);
          method = "exact_trs";
        }
      }
      // manufacturer identifier exact match against TRS digits only when catalog is pure digits mapped
      if (!match && /^TRS-\d+$/i.test(String(seed.manufacturerId || ""))) {
        const trs = String(seed.manufacturerId).toUpperCase();
        if (byTrs.has(trs)) {
          match = byTrs.get(trs);
          method = "exact_manufacturer_id";
        }
      }
    }

    // Composite fallback is intentionally strict and shade-bearing only.
    // Never merge care/treatment SKUs on similar names without EAN/TRS.
    if (!match && (seed.type === "color" || seed.type === "toner" || seed.type === "bleach")) {
      const seedLine = normalizeName(seed.series);
      const seedShade = String(seed.shade || "").trim();
      const seedSize = seed.materialWeight != null ? String(seed.materialWeight) : null;
      const shadeLooksCoded = /^\d{1,2}([.,-]\d+)?$/.test(seedShade);

      if (shadeLooksCoded && seedLine && seedSize) {
        for (const rec of pdfRecords) {
          if (!rec.product_line || !rec.shade_code) continue;
          const lineOk = normalizeName(rec.product_line) === seedLine;
          const shadeOk =
            String(rec.shade_code) === seedShade ||
            String(rec.shade_code).replace(".", "-") === seedShade.replace(".", "-") ||
            String(rec.shade_code).replace(".", ",") === seedShade.replace(".", ",");
          const sizeOk =
            String(rec.size_value) === seedSize ||
            (rec.size_unit === "G" && String(rec.size_value) === seedSize);
          if (lineOk && shadeOk && sizeOk) {
            match = rec;
            method = "line_name_size_shade";
            break;
          }
        }
      }
    }

    results.push({
      seed_id: seed.id,
      seed_catalog_no: seed.catalogNo || null,
      seed_barcodes: barcodes,
      seed_series: seed.series || null,
      seed_shade: seed.shade || null,
      seed_type: seed.type || null,
      match_status: match ? "matched" : "needs_review",
      match_method: method,
      matched_trs: match ? match.trs_code : null,
      matched_ean: match ? match.ean_barcode : null,
      matched_pdf_page: match ? match.source_pdf_page : null,
    });

    if (match) {
      match.seed_matches = match.seed_matches || [];
      match.seed_matches.push({
        seed_id: seed.id,
        method,
      });
    }
  }

  return {
    total_seed: seedProducts.length,
    matched: results.filter((r) => r.match_status === "matched").length,
    needs_review: results.filter((r) => r.match_status === "needs_review").length,
    results,
  };
}

module.exports = { matchSeedToPdf, normalizeName, seedBarcodes };
