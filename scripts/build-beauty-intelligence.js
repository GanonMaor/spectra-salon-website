#!/usr/bin/env node
/**
 * scripts/build-beauty-intelligence.js
 * ─────────────────────────────────────────────────────────────────────────
 * Generates the Beauty Intelligence Dictionary static data files from
 * local observed-data sources (pol-shade-map.json).
 *
 * Outputs:
 *   src/data/beauty-intelligence/index.json       – lightweight overview (< 50KB)
 *   public/beauty-intelligence/brands.json        – all brands & series list
 *   public/beauty-intelligence/series/            – per-series intelligence
 *   public/beauty-intelligence/shades.json        – shade intelligence flat list
 *   public/beauty-intelligence/market-reports.json – market category summaries
 *
 * Run: node scripts/build-beauty-intelligence.js
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SHADE_MAP_PATH = path.join(ROOT, "reports/pol-customer-usage/pol-shade-map.json");

const {
  BRAND_DICTIONARY,
  MARKET_CATEGORIES,
  COLOR_FAMILIES,
  normalizeBrandKey,
  getBrandKnowledge,
  getSeriesKnowledge,
} = require("./lib/beauty-intelligence/brand-dictionary");

const { classifyEntry, labelForProductType } = require("./lib/beauty-intelligence/classification-engine");
const { buildSeriesIntelligence }            = require("./lib/beauty-intelligence/series-intelligence");

// ── Load source data ─────────────────────────────────────────────────────────

if (!fs.existsSync(SHADE_MAP_PATH)) {
  console.error("❌  Shade map not found:", SHADE_MAP_PATH);
  process.exit(1);
}

const shadeMap = JSON.parse(fs.readFileSync(SHADE_MAP_PATH, "utf8"));
const entries  = shadeMap.entries || [];
console.log(`✓  Loaded ${entries.length} entries from pol-shade-map.json`);

// ── Classify all entries ─────────────────────────────────────────────────────

const classified = entries.map(e => ({ ...e, _cls: classifyEntry(e) }));

// ── Build shade intelligence flat list ───────────────────────────────────────

const shadeIntelligence = classified.map(e => {
  const bKey   = normalizeBrandKey(e.brand);
  const bDef   = getBrandKnowledge(e.brand);
  const sk     = getSeriesKnowledge(e.brand, e.series);
  const cls    = e._cls;

  return {
    id: makeId(e.brand, e.series, e.shade),
    brand: bKey,
    brandDisplay: bDef?.displayName || e.brand,
    series: String(e.series || "").toUpperCase().trim(),
    seriesDisplay: sk?.displayName || e.series,
    shade: e.shade,
    // Observed truth
    observedTruth: {
      rows: e.rows || 0,
      grams: Math.round(e.grams || 0),
      customers: e.customers || 0,
      topServices: (e.topServices || []).slice(0, 5),
    },
    // Product knowledge
    productKnowledge: {
      productType: cls.productType,
      productTypeLabel: cls.productTypeLabel,
      technology: sk?.technology || null,
      seriesDescription: cls.seriesDescription,
      officialUrl: cls.officialUrl || null,
    },
    // Market classification
    marketClassification: cls.isColorShade ? {
      level: cls.level,
      levelName: cls.levelName,
      reflectionPrimary: cls.reflectionPrimary,
      reflectionSecondary: cls.reflectionSecondary,
      colorFamily: cls.colorFamily,
      colorFamilyDot: cls.colorFamilyDot,
      marketCategory: cls.marketCategory,
      serviceContexts: cls.serviceContexts,
      isCC: cls.isCC || false,
    } : null,
    // Flags
    isDeveloper: cls.isDeveloper,
    isLightener: cls.isLightener,
    isColorShade: cls.isColorShade,
  };
});

console.log(`✓  Classified ${shadeIntelligence.length} shade entries`);

// ── Build series intelligence ────────────────────────────────────────────────

const seriesIntelligence = buildSeriesIntelligence(entries);
console.log(`✓  Built ${seriesIntelligence.length} series intelligence records`);

// ── Build market reports ─────────────────────────────────────────────────────

const marketReports = buildMarketReports(shadeIntelligence, seriesIntelligence);
console.log(`✓  Built market reports for ${marketReports.categories.length} categories`);

// ── Build brand list ─────────────────────────────────────────────────────────

const brandsReport = buildBrandsReport(shadeIntelligence, seriesIntelligence);
console.log(`✓  Built brand list: ${brandsReport.brands.length} brands`);

// ── Build inventory summary ──────────────────────────────────────────────────

const inventorySummary = buildInventorySummary(shadeIntelligence, seriesIntelligence);

// ── Build needs-review list ──────────────────────────────────────────────────

const needsReview = shadeIntelligence.filter(s =>
  !s.isColorShade && !s.isDeveloper && !s.isLightener && s.productKnowledge.productType === "unknown"
  || (s.isColorShade && s.marketClassification?.level === null)
);

// ── Write output files ───────────────────────────────────────────────────────

const outDir = path.join(ROOT, "src/data/beauty-intelligence");
const pubDir = path.join(ROOT, "public/beauty-intelligence");
const seriesDir = path.join(pubDir, "series");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(pubDir, { recursive: true });
fs.mkdirSync(seriesDir, { recursive: true });

// Index (lightweight, imported statically in the UI)
const indexPayload = {
  generatedAt: new Date().toISOString(),
  sourceEntries: entries.length,
  inventory: inventorySummary,
  seriesCount: seriesIntelligence.length,
  brandsCount: brandsReport.brands.length,
  needsReviewCount: needsReview.length,
  references: shadeMap.references || [],
};
write(path.join(outDir, "index.json"), indexPayload);

// Brands list (for brand/series navigation sidebar)
write(path.join(pubDir, "brands.json"), brandsReport);

// Series intelligence – one file per brand-slug for dynamic loading
const seriesByBrand = {};
for (const si of seriesIntelligence) {
  const slug = slugify(si.brandKey);
  if (!seriesByBrand[slug]) seriesByBrand[slug] = [];
  seriesByBrand[slug].push(si);
}
for (const [slug, series] of Object.entries(seriesByBrand)) {
  write(path.join(seriesDir, `${slug}.json`), series);
}

// Market reports
write(path.join(pubDir, "market-reports.json"), marketReports);

// All shades (full flat list – chunked by brand slug for on-demand loading)
const shadesByBrand = {};
for (const sh of shadeIntelligence) {
  const slug = slugify(sh.brand);
  if (!shadesByBrand[slug]) shadesByBrand[slug] = [];
  shadesByBrand[slug].push(sh);
}
write(path.join(pubDir, "shades-index.json"), {
  generatedAt: new Date().toISOString(),
  totalShades: shadeIntelligence.length,
  brandSlugs: Object.keys(shadesByBrand),
});
for (const [slug, shades] of Object.entries(shadesByBrand)) {
  write(path.join(pubDir, `shades-${slug}.json`), shades);
}

console.log("✅  Beauty Intelligence Dictionary build complete.");
console.log(`   → src/data/beauty-intelligence/index.json`);
console.log(`   → public/beauty-intelligence/brands.json`);
console.log(`   → public/beauty-intelligence/series/{brand-slug}.json (${Object.keys(seriesByBrand).length} files)`);
console.log(`   → public/beauty-intelligence/market-reports.json`);
console.log(`   → public/beauty-intelligence/shades-{brand-slug}.json (${Object.keys(shadesByBrand).length} files)`);

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildInventorySummary(shadeIntel, seriesIntel) {
  const byType = {};
  for (const s of shadeIntel) {
    const t = s.productKnowledge.productType;
    byType[t] = (byType[t] || 0) + 1;
  }

  const totalRows  = shadeIntel.reduce((sum, s) => sum + (s.observedTruth.rows || 0), 0);
  const totalGrams = shadeIntel.reduce((sum, s) => sum + (s.observedTruth.grams || 0), 0);

  const uniqueBrands = new Set(shadeIntel.map(s => s.brand)).size;
  const uniqueSeries = new Set(shadeIntel.map(s => `${s.brand}::${s.series}`)).size;
  const uniqueShades = new Set(shadeIntel.map(s => s.shade)).size;

  return {
    totalObservedItems: shadeIntel.length,
    totalRows,
    totalGramsKg: Math.round(totalGrams / 1000),
    uniqueBrands,
    uniqueSeries,
    uniqueShades,
    byProductType: byType,
    colorShadesCount: shadeIntel.filter(s => s.isColorShade).length,
    developerCount:   shadeIntel.filter(s => s.isDeveloper).length,
    lightenerCount:   shadeIntel.filter(s => s.isLightener).length,
  };
}

function buildBrandsReport(shadeIntel, seriesIntel) {
  const brandMap = {};

  for (const sh of shadeIntel) {
    if (!brandMap[sh.brand]) {
      const bDef = getBrandKnowledge(sh.brand);
      brandMap[sh.brand] = {
        brandKey: sh.brand,
        brandDisplay: sh.brandDisplay,
        country: bDef?.country || null,
        shadeSystem: bDef?.shadeSystem || null,
        rows: 0,
        grams: 0,
        shadeCount: 0,
        colorShadeCount: 0,
        seriesList: [],
      };
    }
    const b = brandMap[sh.brand];
    b.rows += sh.observedTruth.rows;
    b.grams += sh.observedTruth.grams;
    b.shadeCount++;
    if (sh.isColorShade) b.colorShadeCount++;
  }

  // Add series to each brand
  for (const si of seriesIntel) {
    const b = brandMap[si.brandKey];
    if (!b) continue;
    b.seriesList.push({
      seriesKey: si.seriesKey,
      seriesRaw: si.seriesRaw,
      seriesDisplay: si.seriesDisplay,
      productType: si.productType,
      isDeveloper: si.isDeveloper,
      isLightener: si.isLightener,
      rows: si.usage.rows,
      grams: si.usage.grams,
      shadeCount: si.usage.shadeCount,
      primaryMarketCategory: si.primaryMarketCategory,
    });
  }

  const brands = Object.values(brandMap)
    .sort((a, b) => b.rows - a.rows)
    .map(b => ({ ...b, grams: Math.round(b.grams) }));

  return { generatedAt: new Date().toISOString(), brands };
}

function buildMarketReports(shadeIntel, seriesIntel) {
  const catMap = {};

  for (const sh of shadeIntel) {
    if (!sh.isColorShade) continue;
    const cat = sh.marketClassification?.marketCategory;
    if (!cat) continue;

    if (!catMap[cat]) {
      catMap[cat] = {
        category: cat,
        totalRows: 0,
        totalGrams: 0,
        brands: {},
        series: {},
        topShades: [],
        levelDistribution: {},
      };
    }
    const c = catMap[cat];
    c.totalRows += sh.observedTruth.rows;
    c.totalGrams += sh.observedTruth.grams;
    c.brands[sh.brandDisplay] = (c.brands[sh.brandDisplay] || 0) + sh.observedTruth.rows;
    c.series[sh.seriesDisplay] = (c.series[sh.seriesDisplay] || 0) + sh.observedTruth.rows;
    c.topShades.push({ shade: sh.shade, brand: sh.brandDisplay, series: sh.seriesDisplay, rows: sh.observedTruth.rows });
    const lvl = sh.marketClassification?.level;
    if (lvl) c.levelDistribution[Math.round(lvl)] = (c.levelDistribution[Math.round(lvl)] || 0) + sh.observedTruth.rows;
  }

  const categories = MARKET_CATEGORIES.map(cat => {
    const c = catMap[cat];
    if (!c) return { category: cat, totalRows: 0, totalGrams: 0, topBrands: [], topSeries: [], topShades: [] };

    const topBrands = Object.entries(c.brands).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([b,r])=>({ brand:b, rows:r }));
    const topSeries = Object.entries(c.series).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,r])=>({ series:s, rows:r }));
    const topShades = c.topShades.sort((a,b)=>b.rows-a.rows).slice(0,10);

    return {
      category: cat,
      totalRows: c.totalRows,
      totalGrams: Math.round(c.totalGrams),
      topBrands,
      topSeries,
      topShades,
      levelDistribution: c.levelDistribution,
    };
  }).filter(c => c.totalRows > 0).sort((a,b) => b.totalRows - a.totalRows);

  // Summary totals
  const totalColorRows = shadeIntel.filter(s => s.isColorShade).reduce((sum, s) => sum + s.observedTruth.rows, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalColorRows,
    categories,
  };
}

function makeId(brand, series, shade) {
  return slugify(`${brand}-${series}-${shade}`);
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function write(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  const kb = Math.round(fs.statSync(filePath).size / 1024);
  console.log(`   ↳ ${path.relative(ROOT, filePath)} (${kb}KB)`);
}
