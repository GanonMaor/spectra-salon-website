#!/usr/bin/env node
/**
 * scripts/build-catalog-verification-audit.js
 * ─────────────────────────────────────────────────────────────────
 * Builds a reproducible audit of the new catalog/intelligence pages.
 *
 * This does not verify products against the internet. It documents what
 * is currently known, what is inferred, and what still needs evidence.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "reports/catalog-verification-audit");

const PATHS = {
  catalogIndex: "src/data/catalog-truth-index.json",
  catalogBrands: "public/catalog-brands",
  beautyIndex: "src/data/beauty-intelligence/index.json",
  beautyBrands: "public/beauty-intelligence/brands.json",
  beautyMarketReports: "public/beauty-intelligence/market-reports.json",
  beautyShadesDir: "public/beauty-intelligence",
  productTruthSeed: "src/data/product-truth-seed.json",
  usageSummary: "src/data/pol-customer-usage-summary.json",
  colorPreviewData: "src/data/color-intelligence-preview-data.json",
};

const PAGE_SOURCE_MATRIX = [
  {
    feature: "Product Truth Center",
    route: "/admin → Product Truth tab",
    primaryFiles: [
      "src/screens/AdminDashboard/ProductTruthCenterPanel.tsx",
      "src/data/product-truth-seed.json",
    ],
    generation: [
      "scripts/build-product-truth-seed.js",
      "scripts/lib/product-catalog/product-identity.js",
    ],
    runtimeSource: "Static bundled JSON",
    api: null,
    neonDependency: "None at runtime",
    verificationState: "Observed usage grouping + identity heuristics; no external source verification.",
  },
  {
    feature: "Product Catalog Browser",
    route: "/admin → Product Catalog tab",
    primaryFiles: [
      "src/screens/AdminDashboard/CatalogBrowserPanel.tsx",
      "src/data/catalog-truth-index.json",
      "public/catalog-brands/*.json",
    ],
    generation: ["scripts/build-catalog-truth.js"],
    runtimeSource: "Static index plus per-brand JSON fetch",
    api: null,
    neonDependency: "None; full catalog is not in Neon",
    verificationState: "XLSX-derived catalog with heuristic classification and Google search URLs.",
  },
  {
    feature: "Beauty Intelligence Dictionary",
    route: "/admin → Beauty Intelligence tab",
    primaryFiles: [
      "src/screens/AdminDashboard/BeautyIntelligencePanel.tsx",
      "src/lib/beautyIntelligenceClient.ts",
      "netlify/functions/beauty-intelligence.js",
      "public/beauty-intelligence/*",
      "src/data/beauty-intelligence/index.json",
    ],
    generation: [
      "scripts/build-beauty-intelligence.js",
      "scripts/lib/beauty-intelligence/*",
    ],
    runtimeSource: "Netlify Function reading static JSON plus Neon inventory counts",
    api: "/.netlify/functions/beauty-intelligence/*",
    neonDependency: "usage_report_rows counts only",
    verificationState: "Observed usage + curated brand rules + classification heuristics.",
  },
  {
    feature: "Color Intelligence Preview",
    route: "/investors/color-intelligence-preview",
    primaryFiles: [
      "src/screens/ColorIntelligencePreview/*",
      "src/data/color-intelligence-preview-data.json",
    ],
    generation: ["No dedicated npm build script found"],
    runtimeSource: "Static bundled JSON plus hardcoded slide copy",
    api: null,
    neonDependency: "None",
    verificationState: "Presentation layer; not a verification workflow.",
  },
  {
    feature: "Israel Customer Usage Example",
    route: "/investors/israel-customer-usage-example",
    primaryFiles: [
      "src/screens/IsraelCustomerUsageExample/IsraelCustomerUsageExamplePage.tsx",
      "src/data/pol-customer-usage-summary.json",
    ],
    generation: ["scripts/process-pol-customer-usage.js"],
    runtimeSource: "Static bundled JSON plus hardcoded page constants",
    api: null,
    neonDependency: "None",
    verificationState: "Usage sample presentation; not a product verification workflow.",
  },
];

function readJson(relPath, fallback = null) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function listJsonFiles(relDir) {
  const full = path.join(ROOT, relDir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(full, name));
}

function rel(fullPath) {
  return path.relative(ROOT, fullPath);
}

function ratio(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

function classifyCatalogVerification(product) {
  if (product.flag === 1 || product.flag === 2 || product.flag === 3) return "needs-review";
  const hasOfficialEvidence = Array.isArray(product.sourceEvidence) && product.sourceEvidence.length > 0;
  if (hasOfficialEvidence) return "verified";
  if (product.verificationUrl) return "source-linked";
  return "heuristic-only";
}

function buildCatalogCoverage() {
  const index = readJson(PATHS.catalogIndex, { summary: {}, brands: [] });
  const files = listJsonFiles(PATHS.catalogBrands);
  const products = [];
  for (const file of files) {
    const rows = readJson(rel(file), []);
    if (Array.isArray(rows)) products.push(...rows);
  }

  const byVerificationStatus = {};
  const byType = {};
  const byFlag = {};
  const byBrand = {};
  const productKindCounts = {};
  const riskSamples = [];

  let withVerificationUrl = 0;
  let withSourceEvidence = 0;
  let withOfficialUrl = 0;
  let withImage = 0;
  let withBarcodes = 0;
  let withWeight = 0;
  let withShadeDescription = 0;
  let possibleCareMismatches = 0;
  let developerColorRisks = 0;

  for (const product of products) {
    const status = classifyCatalogVerification(product);
    byVerificationStatus[status] = (byVerificationStatus[status] || 0) + 1;
    byType[product.type || "unknown"] = (byType[product.type || "unknown"] || 0) + 1;
    byFlag[String(product.flag ?? "unknown")] = (byFlag[String(product.flag ?? "unknown")] || 0) + 1;
    byBrand[product.brand || "unknown"] = (byBrand[product.brand || "unknown"] || 0) + 1;
    productKindCounts[product.productKind || "unknown"] = (productKindCounts[product.productKind || "unknown"] || 0) + 1;

    if (product.verificationUrl) withVerificationUrl++;
    if (Array.isArray(product.sourceEvidence) && product.sourceEvidence.length > 0) withSourceEvidence++;
    if (product.officialUrl || product.sourceUrl) withOfficialUrl++;
    if (product.image) withImage++;
    if (Array.isArray(product.barcodes) && product.barcodes.length > 0) withBarcodes++;
    if (product.packingWeight || product.materialWeight) withWeight++;
    if (product.shadeDesc) withShadeDescription++;

    const joined = `${product.series || ""} ${product.familyShade || ""} ${product.shade || ""} ${product.productKind || ""}`.toLowerCase();
    const careWords = ["shampoo", "conditioner", "soap", "cleanser", "mask", "treatment"];
    const looksCare = careWords.some((word) => joined.includes(word));
    if (looksCare && product.type === "color") {
      possibleCareMismatches++;
      if (riskSamples.length < 25) riskSamples.push(sampleProduct(product, "care-word-classified-as-color"));
    }

    const looksDeveloper = /(\bdeveloper\b|\boxid|\bvol\.?\b|\d+[.,]?\d*\s*%)/i.test(joined);
    if (looksDeveloper && product.type === "color") {
      developerColorRisks++;
      if (riskSamples.length < 25) riskSamples.push(sampleProduct(product, "developer-word-classified-as-color"));
    }
  }

  return {
    generatedFrom: {
      index: PATHS.catalogIndex,
      brandDirectory: PATHS.catalogBrands,
    },
    summary: {
      indexTotalRows: index.summary?.totalRows || 0,
      productRowsLoaded: products.length,
      brandFiles: files.length,
      activeProducts: index.summary?.activeProducts || 0,
      deletedProducts: index.summary?.deletedProducts || 0,
      deprecatedProducts: index.summary?.deprecatedProducts || 0,
      barcodeConflicts: index.summary?.barcodeConflicts || 0,
      totalBrands: index.summary?.totalBrands || 0,
    },
    coverage: {
      withVerificationUrl,
      withVerificationUrlPct: ratio(withVerificationUrl, products.length),
      withSourceEvidence,
      withSourceEvidencePct: ratio(withSourceEvidence, products.length),
      withOfficialUrl,
      withOfficialUrlPct: ratio(withOfficialUrl, products.length),
      withImage,
      withImagePct: ratio(withImage, products.length),
      withBarcodes,
      withBarcodesPct: ratio(withBarcodes, products.length),
      withWeight,
      withWeightPct: ratio(withWeight, products.length),
      withShadeDescription,
      withShadeDescriptionPct: ratio(withShadeDescription, products.length),
    },
    byVerificationStatus,
    byType,
    byFlag,
    topBrands: topEntries(byBrand, 30, "brand", "count"),
    topProductKinds: topEntries(productKindCounts, 30, "productKind", "count"),
    risks: {
      possibleCareMismatches,
      developerColorRisks,
      sampleProducts: riskSamples,
    },
  };
}

function buildBeautyCoverage() {
  const index = readJson(PATHS.beautyIndex, { inventory: {} });
  const brands = readJson(PATHS.beautyBrands, { brands: [] });
  const marketReports = readJson(PATHS.beautyMarketReports, { categories: [] });
  const shadeFiles = listJsonFiles(PATHS.beautyShadesDir)
    .filter((file) => !path.basename(file).includes("index") && path.basename(file).startsWith("shades-"));

  const shades = [];
  for (const file of shadeFiles) {
    const rows = readJson(rel(file), []);
    if (Array.isArray(rows)) shades.push(...rows);
  }

  const byProductType = {};
  const byMarketCategory = {};
  const noMarketCategorySamples = [];
  const unknownSamples = [];

  let colorShades = 0;
  let developerCount = 0;
  let lightenerCount = 0;
  let withOfficialUrl = 0;
  let withMarketClassification = 0;
  let colorShadeMissingMarketCategory = 0;
  let unknownProductType = 0;

  for (const shade of shades) {
    const productType = shade.productKnowledge?.productType || "unknown";
    byProductType[productType] = (byProductType[productType] || 0) + 1;

    if (shade.isColorShade) colorShades++;
    if (shade.isDeveloper) developerCount++;
    if (shade.isLightener) lightenerCount++;
    if (shade.productKnowledge?.officialUrl) withOfficialUrl++;
    if (shade.marketClassification) withMarketClassification++;

    const category = shade.marketClassification?.marketCategory || null;
    if (category) byMarketCategory[category] = (byMarketCategory[category] || 0) + 1;

    if (shade.isColorShade && !category) {
      colorShadeMissingMarketCategory++;
      if (noMarketCategorySamples.length < 25) noMarketCategorySamples.push(sampleShade(shade));
    }

    if (productType === "unknown") {
      unknownProductType++;
      if (unknownSamples.length < 25) unknownSamples.push(sampleShade(shade));
    }
  }

  return {
    generatedFrom: {
      index: PATHS.beautyIndex,
      brands: PATHS.beautyBrands,
      marketReports: PATHS.beautyMarketReports,
      shadeFiles: shadeFiles.map(rel),
    },
    summary: {
      observedItems: index.inventory?.totalObservedItems || 0,
      shadeRecordsLoaded: shades.length,
      brands: brands.brands?.length || 0,
      series: index.seriesCount || 0,
      marketReportCategories: marketReports.categories?.length || 0,
      colorShades,
      developerCount,
      lightenerCount,
    },
    coverage: {
      withOfficialUrl,
      withOfficialUrlPct: ratio(withOfficialUrl, shades.length),
      withMarketClassification,
      withMarketClassificationPct: ratio(withMarketClassification, shades.length),
      colorShadeMissingMarketCategory,
      colorShadeMissingMarketCategoryPct: ratio(colorShadeMissingMarketCategory, colorShades),
      unknownProductType,
      unknownProductTypePct: ratio(unknownProductType, shades.length),
    },
    byProductType,
    byMarketCategory,
    noMarketCategorySamples,
    unknownSamples,
  };
}

function buildResearchGapAudit() {
  return {
    verdict: "The current system is a normalized and intelligence-enriched catalog, not an exhaustively verified external product catalog.",
    fieldProvenance: [
      {
        area: "Catalog identity",
        fields: ["brand", "series", "shade", "catalogNo", "productId", "familyShade"],
        provenance: "XLSX-derived",
        confidenceMeaning: "Matches the imported product export, but not externally validated.",
      },
      {
        area: "Catalog commercial data",
        fields: ["image", "price", "barcodes", "packingWeight", "materialWeight", "hairColor"],
        provenance: "XLSX-derived",
        confidenceMeaning: "Present when supplied by export; not checked against manufacturer sites or barcode databases.",
      },
      {
        area: "Product kind",
        fields: ["type", "productKind"],
        provenance: "XLSX-derived plus keyword heuristic",
        confidenceMeaning: "Good first-pass separation; needs review for care/color ambiguity.",
      },
      {
        area: "Shade description",
        fields: ["shadeDesc", "level", "reflectionPrimary", "marketCategory"],
        provenance: "Rule-based shade notation parser",
        confidenceMeaning: "Industry-informed heuristic; not manufacturer-certified per SKU.",
      },
      {
        area: "Brand and series knowledge",
        fields: ["technology", "description", "commonServices", "primaryMarketCategory", "officialUrl"],
        provenance: "Curated static dictionary for major brands",
        confidenceMeaning: "Useful professional knowledge layer; incomplete for long-tail brands and not fetched at build time.",
      },
      {
        area: "Usage intelligence",
        fields: ["rows", "grams", "customers", "topServices"],
        provenance: "Observed salon usage reports and Neon usage rows for inventory counts",
        confidenceMeaning: "Represents observed data, not official product truth.",
      },
      {
        area: "Verification",
        fields: ["verificationUrl"],
        provenance: "Generated Google search URL",
        confidenceMeaning: "Search starting point only; not evidence that the product was verified.",
      },
    ],
    missingCapabilities: [
      "Automated manufacturer/source fetching per product.",
      "Barcode/GTIN lookup and match scoring.",
      "Persisted source evidence with URL, title, matched fields, confidence, and timestamp.",
      "Human review queue that changes verification status.",
      "Neon-backed catalog and dictionary tables as the source of truth.",
      "Join between 32,937 catalog products and 624 observed usage identities.",
      "Single shared shade classification engine across catalog, product truth, and beauty intelligence.",
    ],
  };
}

function buildVerificationLayerPlan() {
  return {
    statuses: [
      {
        status: "verified",
        meaning: "Official/source evidence matches product identity strongly.",
        minimumEvidence: ["brand or manufacturer match", "series or product line match", "shade/name/barcode match"],
      },
      {
        status: "partially_verified",
        meaning: "Source evidence supports part of the identity, but one or more fields are missing.",
        minimumEvidence: ["brand match", "one of series, shade, product name, barcode"],
      },
      {
        status: "source_linked",
        meaning: "A search URL exists, but no source has been fetched or matched.",
        minimumEvidence: ["verificationUrl only"],
      },
      {
        status: "heuristic_only",
        meaning: "Classification comes from XLSX fields and local rules only.",
        minimumEvidence: ["no external source evidence"],
      },
      {
        status: "needs_review",
        meaning: "Conflicting barcode, deleted/replaced brand marker, ambiguous product kind, or missing critical classification.",
        minimumEvidence: ["risk flag or failed confidence threshold"],
      },
    ],
    evidenceSchema: {
      productId: "string",
      sourceKind: "official_site | barcode_lookup | distributor_catalog | google_result | manual_note",
      sourceUrl: "string",
      sourceDomain: "string",
      sourceTitle: "string",
      searchQuery: "string",
      matchedFields: ["brand", "series", "shade", "barcode", "productName", "image"],
      confidence: "high | medium | low",
      evidenceText: "string",
      checkedAt: "ISO timestamp",
      checkedBy: "system | user id",
    },
    recommendedPipeline: [
      "Seed every product as source_linked if it only has a Google query.",
      "Run official-source and barcode lookup jobs in batches by brand priority.",
      "Score source matches against brand, series, shade, product kind, and barcode.",
      "Store evidence separately from product truth.",
      "Promote status only when evidence meets thresholds.",
      "Surface low-confidence and conflict cases in Admin Needs Review.",
    ],
  };
}

function buildNeonTruthPlan() {
  return {
    principle: "Neon should own canonical truth; static JSON should become cache/build artifacts only.",
    tables: [
      {
        name: "beauty_product_catalog_items",
        purpose: "Global canonical catalog imported from XLSX and later official sources.",
        coreColumns: [
          "id", "source_product_id", "brand", "series", "shade", "family_shade", "product_type",
          "product_kind", "catalog_no", "image_url", "hair_color", "packing_weight", "material_weight",
          "price_ils", "barcodes jsonb", "status", "verification_status", "created_at", "updated_at",
        ],
      },
      {
        name: "beauty_observed_items",
        purpose: "Observed salon usage identities separated from catalog truth.",
        coreColumns: [
          "id", "brand", "series", "shade", "product_label", "product_type", "usage_rows",
          "grams", "customers", "top_services jsonb", "source_payload jsonb", "created_at",
        ],
      },
      {
        name: "beauty_series_dictionary",
        purpose: "Curated product knowledge by brand and series.",
        coreColumns: [
          "id", "brand", "series", "display_name", "product_type", "technology",
          "shade_system", "description", "common_services jsonb", "primary_market_category",
          "official_url", "verification_status", "updated_at",
        ],
      },
      {
        name: "beauty_shade_intelligence",
        purpose: "Shade-level market classification and observed evidence.",
        coreColumns: [
          "id", "catalog_item_id", "observed_item_id", "level", "reflection_primary",
          "reflection_secondary", "color_family", "market_category", "service_contexts jsonb",
          "confidence", "updated_at",
        ],
      },
      {
        name: "beauty_dictionary_sources",
        purpose: "Evidence layer for product and series verification.",
        coreColumns: [
          "id", "entity_type", "entity_id", "source_kind", "source_url", "source_domain",
          "source_title", "search_query", "matched_fields jsonb", "confidence", "evidence_text",
          "checked_at", "checked_by",
        ],
      },
      {
        name: "beauty_dictionary_audit_log",
        purpose: "Append-only record of edits/imports/status changes.",
        coreColumns: [
          "id", "entity_type", "entity_id", "action", "before jsonb", "after jsonb",
          "actor", "created_at",
        ],
      },
    ],
    importStrategy: [
      "Create tables with idempotent migrations.",
      "Bulk import current public/catalog-brands/*.json into beauty_product_catalog_items.",
      "Bulk import current public/beauty-intelligence/* into observed/series/shade intelligence tables.",
      "Keep existing JSON generation as fallback until Admin reads from Neon successfully.",
      "Switch Netlify beauty-intelligence routes to read from Neon first and static JSON only as fallback.",
    ],
  };
}

function buildMarkdownReport({ catalogCoverage, beautyCoverage, researchGapAudit, verificationLayerPlan, neonTruthPlan }) {
  return `# Catalog Research Verification Audit

Generated at: ${new Date().toISOString()}

## Verdict

The current system covers the imported catalog and observed usage data, but it has not yet exhausted internet/source verification. It should be treated as an enriched V1 catalog and intelligence dictionary, not a manufacturer-certified source of truth.

## Source Matrix

${PAGE_SOURCE_MATRIX.map((row) => `### ${row.feature}

- Route: ${row.route}
- Runtime source: ${row.runtimeSource}
- API: ${row.api || "None"}
- Neon dependency: ${row.neonDependency}
- Verification state: ${row.verificationState}
- Primary files: ${row.primaryFiles.map((file) => `\`${file}\``).join(", ")}
- Generation: ${row.generation.map((file) => `\`${file}\``).join(", ")}
`).join("\n")}

## Catalog Coverage

- Products loaded from brand files: ${catalogCoverage.summary.productRowsLoaded}
- XLSX rows in index: ${catalogCoverage.summary.indexTotalRows}
- Brand files: ${catalogCoverage.summary.brandFiles}
- Active products: ${catalogCoverage.summary.activeProducts}
- Deleted products: ${catalogCoverage.summary.deletedProducts}
- Deprecated products: ${catalogCoverage.summary.deprecatedProducts}
- Barcode conflicts: ${catalogCoverage.summary.barcodeConflicts}
- Products with Google verification URL: ${catalogCoverage.coverage.withVerificationUrl} (${catalogCoverage.coverage.withVerificationUrlPct}%)
- Products with actual source evidence: ${catalogCoverage.coverage.withSourceEvidence} (${catalogCoverage.coverage.withSourceEvidencePct}%)
- Products with image: ${catalogCoverage.coverage.withImage} (${catalogCoverage.coverage.withImagePct}%)
- Products with barcodes: ${catalogCoverage.coverage.withBarcodes} (${catalogCoverage.coverage.withBarcodesPct}%)
- Products with weight: ${catalogCoverage.coverage.withWeight} (${catalogCoverage.coverage.withWeightPct}%)
- Products with shade description: ${catalogCoverage.coverage.withShadeDescription} (${catalogCoverage.coverage.withShadeDescriptionPct}%)

Verification status counts:

${objectTable(catalogCoverage.byVerificationStatus, "status", "count")}

## Beauty Intelligence Coverage

- Observed items in index: ${beautyCoverage.summary.observedItems}
- Shade records loaded: ${beautyCoverage.summary.shadeRecordsLoaded}
- Brands: ${beautyCoverage.summary.brands}
- Series: ${beautyCoverage.summary.series}
- Color shades: ${beautyCoverage.summary.colorShades}
- Developers: ${beautyCoverage.summary.developerCount}
- Lighteners: ${beautyCoverage.summary.lightenerCount}
- Records with official URL: ${beautyCoverage.coverage.withOfficialUrl} (${beautyCoverage.coverage.withOfficialUrlPct}%)
- Records with market classification: ${beautyCoverage.coverage.withMarketClassification} (${beautyCoverage.coverage.withMarketClassificationPct}%)
- Color shades missing market category: ${beautyCoverage.coverage.colorShadeMissingMarketCategory} (${beautyCoverage.coverage.colorShadeMissingMarketCategoryPct}%)
- Unknown product type records: ${beautyCoverage.coverage.unknownProductType} (${beautyCoverage.coverage.unknownProductTypePct}%)

## Research Gap

${researchGapAudit.missingCapabilities.map((item) => `- ${item}`).join("\n")}

## Verification Layer

${verificationLayerPlan.statuses.map((status) => `- \`${status.status}\`: ${status.meaning}`).join("\n")}

## Neon Truth Plan

${neonTruthPlan.tables.map((table) => `- \`${table.name}\`: ${table.purpose}`).join("\n")}
`;
}

function objectTable(obj, keyLabel, valueLabel) {
  const rows = Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return "_None._";
  return [
    `| ${keyLabel} | ${valueLabel} |`,
    `| --- | ---: |`,
    ...rows.map(([key, value]) => `| ${key} | ${value} |`),
  ].join("\n");
}

function topEntries(obj, limit, keyName, valueName) {
  return Object.entries(obj || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ [keyName]: key, [valueName]: value }));
}

function sampleProduct(product, reason) {
  return {
    reason,
    id: product.id,
    brand: product.brand,
    series: product.series,
    shade: product.shade,
    type: product.type,
    productKind: product.productKind,
    flag: product.flag,
    barcode: product.barcode,
  };
}

function sampleShade(shade) {
  return {
    id: shade.id,
    brand: shade.brandDisplay,
    series: shade.seriesDisplay,
    shade: shade.shade,
    productType: shade.productKnowledge?.productType,
    marketCategory: shade.marketClassification?.marketCategory || null,
    level: shade.marketClassification?.level || null,
    reflectionPrimary: shade.marketClassification?.reflectionPrimary || null,
  };
}

function writeJson(name, data) {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Wrote ${path.relative(ROOT, file)}`);
}

function writeText(name, content) {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, content.trim() + "\n", "utf8");
  console.log(`Wrote ${path.relative(ROOT, file)}`);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const catalogCoverage = buildCatalogCoverage();
  const beautyCoverage = buildBeautyCoverage();
  const researchGapAudit = buildResearchGapAudit();
  const verificationLayerPlan = buildVerificationLayerPlan();
  const neonTruthPlan = buildNeonTruthPlan();

  const summary = {
    generatedAt: new Date().toISOString(),
    verdict: "not-exhaustively-verified",
    sourceMatrix: PAGE_SOURCE_MATRIX,
    catalogCoverage,
    beautyCoverage,
    researchGapAudit,
    verificationLayerPlan,
    neonTruthPlan,
  };

  writeJson("source-matrix.json", PAGE_SOURCE_MATRIX);
  writeJson("coverage-report.json", { catalogCoverage, beautyCoverage });
  writeJson("research-gap-audit.json", researchGapAudit);
  writeJson("verification-layer-plan.json", verificationLayerPlan);
  writeJson("neon-truth-plan.json", neonTruthPlan);
  writeJson("summary.json", summary);
  writeText("README.md", buildMarkdownReport(summary));

  console.log("\nCatalog verification audit complete.");
}

main();
