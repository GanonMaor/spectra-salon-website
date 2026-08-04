#!/usr/bin/env node
/**
 * Build normalized TRUSS catalog JSON/CSV + data-quality report.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { validateRecords } = require("../lib/validate");
const { matchSeedToPdf } = require("../lib/match-seed");

const TRUSS_ROOT = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../../..");

function loadBestRecords() {
  const candidates = [
    "normalized/enriched-with-images.json",
    "normalized/enriched-records.json",
    "normalized/extracted-records.json",
  ];
  for (const rel of candidates) {
    const p = path.join(TRUSS_ROOT, rel);
    if (fs.existsSync(p)) return { path: p, records: JSON.parse(fs.readFileSync(p, "utf8")) };
  }
  throw new Error("No extracted/enriched records found. Run truss:extract first.");
}

function stableProductId(rec) {
  if (rec.trs_code) return `cprod-truss-${rec.trs_code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (rec.ean_barcode) return `cprod-truss-ean-${rec.ean_barcode}`;
  return `cprod-truss-page-${rec.source_pdf_page}`;
}

function approvalStatus(rec) {
  if (rec.ean_valid && rec.trs_code && rec.qr_decoded && !["needs_review", "rejected"].includes(rec.source_status)) {
    // Identity from PDF is solid; enrichment may still be incomplete
    if (rec.enrichment_status === "needs_review" && !rec.official_description) {
      return "approved"; // approved for identity/catalog listing; description optional
    }
    return "approved";
  }
  return "needs_review";
}

function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function main() {
  const { path: srcPath, records } = loadBestRecords();
  const validation = validateRecords(records);

  const seedPath = fs.existsSync(
    path.join(ROOT, "data/catalog-brands/truss-professional.legacy-seed-47.json"),
  )
    ? path.join(ROOT, "data/catalog-brands/truss-professional.legacy-seed-47.json")
    : path.join(ROOT, "data/catalog-brands/truss-professional.json");
  const seedProducts = fs.existsSync(seedPath)
    ? JSON.parse(fs.readFileSync(seedPath, "utf8"))
    : [];
  const seedMatch = matchSeedToPdf(records, seedProducts);

  const catalog = records.map((rec) => {
    const validation_status = approvalStatus(rec);
    return {
      id: stableProductId(rec),
      brand: "TRUSS",
      brand_slug: "truss-professional",
      division: rec.division,
      product_line: rec.product_line,
      product_line_slug: rec.product_line_slug,
      category: rec.category,
      product_name: rec.product_name,
      normalized_product_name: rec.normalized_product_name,
      display_name: rec.display_name,
      supplier_name: rec.supplier_name || rec.display_name,
      official_name: rec.official_name,
      product_type: rec.product_type,
      professional_or_retail: rec.professional_or_retail,
      shade_code: rec.shade_code,
      shade_name: rec.shade_name,
      color_level: rec.color_level,
      primary_tone: rec.primary_tone,
      permanent_type: rec.permanent_type,
      size_value: rec.size_value,
      size_unit: rec.size_unit,
      size_display: rec.size_display,
      trs_code: rec.trs_code,
      supplier_sku: rec.trs_code,
      ean_barcode: rec.ean_barcode,
      ean_valid: rec.ean_valid,
      official_description: rec.official_description,
      official_product_url: rec.official_product_url,
      primary_image_path: rec.primary_image_path,
      image_source_url: rec.image_source_url,
      image_status: rec.image_status,
      source_pdf_page: rec.source_pdf_page,
      source_status: rec.source_status,
      enrichment_status: rec.enrichment_status || "extracted",
      validation_status,
      source_domain: rec.source_domain,
      source_type: rec.source_type,
      source_checked_at: rec.source_checked_at,
      source_confidence: rec.source_confidence,
      seed_matches: rec.seed_matches || [],
      metadata: {
        division: rec.division,
        permanent_type: rec.permanent_type,
        qr_raw: rec.qr_raw,
        page_image_path: rec.page_image_path,
        description_source_url: rec.description_source_url,
      },
    };
  });

  fs.mkdirSync(path.join(TRUSS_ROOT, "normalized"), { recursive: true });
  fs.writeFileSync(
    path.join(TRUSS_ROOT, "normalized/truss-catalog.json"),
    JSON.stringify(catalog, null, 2),
  );

  const csvRows = catalog.map((c) => ({
    id: c.id,
    trs_code: c.trs_code,
    ean_barcode: c.ean_barcode,
    division: c.division,
    product_line: c.product_line,
    category: c.category,
    display_name: c.display_name,
    size_display: c.size_display,
    shade_code: c.shade_code,
    product_type: c.product_type,
    validation_status: c.validation_status,
    image_status: c.image_status,
    enrichment_status: c.enrichment_status,
    source_pdf_page: c.source_pdf_page,
  }));
  fs.writeFileSync(path.join(TRUSS_ROOT, "normalized/truss-catalog.csv"), toCsv(csvRows));

  const quality = {
    generated_at: new Date().toISOString(),
    source_records_path: path.relative(ROOT, srcPath),
    totals: {
      products: catalog.length,
      approved: catalog.filter((c) => c.validation_status === "approved").length,
      needs_review: catalog.filter((c) => c.validation_status === "needs_review").length,
      with_official_description: catalog.filter((c) => c.official_description).length,
      with_local_image: catalog.filter((c) => c.image_status === "official_local").length,
      missing_official_image: catalog.filter((c) => c.image_status === "missing_official_image").length,
    },
    divisions: {
      CARE: catalog.filter((c) => c.division === "CARE").length,
      COLOR: catalog.filter((c) => c.division === "COLOR").length,
    },
    product_lines: [...new Set(catalog.map((c) => c.product_line).filter(Boolean))].sort(),
    validation_issues: validation.issues,
    seed_match: {
      total_seed: seedMatch.total_seed,
      matched: seedMatch.matched,
      needs_review: seedMatch.needs_review,
    },
    manual_review_products: catalog
      .filter((c) => c.validation_status === "needs_review" || c.image_status === "missing_official_image" || !c.official_description)
      .map((c) => ({
        id: c.id,
        trs_code: c.trs_code,
        ean_barcode: c.ean_barcode,
        reasons: [
          c.validation_status === "needs_review" ? "validation_needs_review" : null,
          c.image_status === "missing_official_image" ? "missing_official_image" : null,
          !c.official_description ? "missing_official_description" : null,
        ].filter(Boolean),
      })),
    legacy_seed_unmatched: seedMatch.results.filter((r) => r.match_status === "needs_review"),
  };

  fs.writeFileSync(
    path.join(TRUSS_ROOT, "reports/data-quality-report.json"),
    JSON.stringify(quality, null, 2),
  );
  fs.writeFileSync(
    path.join(ROOT, "reports/truss-catalog/data-quality-report.json"),
    JSON.stringify(quality, null, 2),
  );
  fs.writeFileSync(
    path.join(TRUSS_ROOT, "reports/data-quality-report.csv"),
    toCsv(
      quality.manual_review_products.map((p) => ({
        id: p.id,
        trs_code: p.trs_code,
        ean_barcode: p.ean_barcode,
        reasons: p.reasons.join("|"),
      })),
    ),
  );

  // Brand-catalog JSON mirror for admin browser (approved PDF products only)
  const brandMirror = catalog
    .filter((c) => c.validation_status === "approved")
    .map((c) => ({
      id: c.id,
      brand: "TRUSS PROFESSIONAL",
      series: c.product_line,
      familyShade: c.category,
      shade: c.shade_code || c.display_name,
      type: c.product_type,
      rawType: c.product_type,
      productKind: c.category,
      catalogNo: c.trs_code,
      image: c.primary_image_path ? path.basename(c.primary_image_path) : null,
      hairColor: c.shade_code || "",
      packingWeight: null,
      materialWeight: c.size_unit === "G" ? c.size_value : null,
      barcode: c.ean_barcode,
      barcodes: c.ean_barcode ? [c.ean_barcode] : [],
      barcodeCount: c.ean_barcode ? 1 : 0,
      shadeDesc: c.shade_name || "",
      supplierSku: c.trs_code,
      division: c.division,
      sizeDisplay: c.size_display,
      officialDescription: c.official_description,
      primaryImagePath: c.primary_image_path,
      validationStatus: c.validation_status,
      sourcePdfPage: c.source_pdf_page,
    }));

  fs.writeFileSync(
    path.join(TRUSS_ROOT, "normalized/truss-professional.brand-mirror.json"),
    JSON.stringify(brandMirror, null, 2),
  );

  console.log(JSON.stringify(quality.totals, null, 2));
  console.log(`Lines: ${quality.product_lines.length}`);
  console.log(`Seed matched: ${seedMatch.matched}/${seedMatch.total_seed}`);
}

main();
