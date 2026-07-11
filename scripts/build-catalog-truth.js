#!/usr/bin/env node
/**
 * scripts/build-catalog-truth.js
 * ─────────────────────────────────────────────────────────────────
 * Processes data/products_1781528628322.xlsx into a deduplicated,
 * normalized, shade-described product catalog for the Admin UI.
 *
 * Outputs:
 *   src/data/catalog-truth-index.json — brands/series navigation + stats
 *   data/catalog-brands/*.json        — one on-demand product file per brand
 *
 * Run:
 *   node scripts/build-catalog-truth.js
 *   npm run build:catalog-truth
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const XLSX_FILE   = path.resolve(__dirname, "../data/products_1781528628322.xlsx");
const OUT_DIR     = path.resolve(__dirname, "../src/data");
const INDEX_FILE   = path.join(OUT_DIR, "catalog-truth-index.json");
const BRANDS_DIR   = path.resolve(__dirname, "../data/catalog-brands");

// ─── Type normalisation ───────────────────────────────────────────────────────

const TYPE_MAP = {
  developer:    "developer",
  developers:   "developer",
  color:        "color",
  permanent:    "color",
  toner:        "toner",
  bleach:       "bleach",
  decolorizer:  "bleach",
  treatment:    "treatment",
  treatmant:    "treatment",
  plex:         "plex",
  straightening:"straightening",
  Straightening:"straightening",
  perm:         "perm",
  retail:       "retail",
  foil:         "accessory",
  water:        "treatment",
  controller:   "treatment",
};

const CARE_PRODUCT_KEYWORDS = [
  "shampoo",
  "conditioner",
  "mask",
  "soap",
  "cream",
  "serum",
  "oil",
  "spray",
  "lotion",
  "balm",
  "cleanser",
  "water",
  "treatment",
  "repair",
  "hydrate",
  "volume",
  "smooth",
];

// ─── Brand normalisation ──────────────────────────────────────────────────────

const BRAND_MERGES = {
  "BEAUTYCO":        "BEAUTY-CO",
  "SECUrity":        "SECURITY",
};

function normBrand(raw) {
  const merged = BRAND_MERGES[raw];
  if (merged) return merged;
  return raw;
}

function parseBarcodes(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
}

function numericOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildVerificationUrl({ brand, series, shade, barcode }) {
  const query = barcode
    ? `"${barcode}" ${brand} ${series} ${shade}`
    : `${brand} ${series} ${shade} professional salon product`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function inferProductKind({ type, series, familyShade, shade }) {
  const joined = `${series || ""} ${familyShade || ""} ${shade || ""}`.toLowerCase();
  if (type === "developer") return "Developer / oxidant";
  if (type === "bleach") return "Lightener / bleach";
  if (type === "plex") return "Bond builder / plex";
  if (type === "perm") return "Perm / texture";
  if (type === "straightening") return "Straightening";
  if (type === "toner") return "Toner";
  if (type === "color") {
    if (joined.includes("mask")) return "Color mask";
    if (joined.includes("gloss")) return "Color gloss";
    if (joined.includes("clear")) return "Clear / gloss shade";
    return "Professional color shade";
  }
  if (type === "treatment" || type === "retail") {
    const matched = CARE_PRODUCT_KEYWORDS.find((word) => joined.includes(word));
    if (matched === "shampoo") return "Shampoo";
    if (matched === "conditioner") return "Conditioner";
    if (matched === "soap" || matched === "cleanser") return "Cleanser / soap";
    if (matched === "mask") return "Mask";
    if (matched === "serum") return "Serum";
    if (matched === "oil") return "Oil";
    if (matched === "spray") return "Spray";
    if (matched) return "Care / treatment";
  }
  return type || "Other";
}

// ─── Deprecated / deleted flag ────────────────────────────────────────────────
// 0 = active, 1 = deleted (TO DEL.), 2 = deprecated (TO REPLACE), 3 = duplicate-barcode

function entryFlag(row, barcodeConflictSet) {
  if (row.brand === "TO DEL." || row.brand.startsWith("TO DEL.")) return 1;
  if (row.brand.toUpperCase().includes("TO REPLACE"))             return 2;
  if (barcodeConflictSet.has(row.productId))                       return 3;
  return 0;
}

// ─── Shade classification (multi-brand) ──────────────────────────────────────

// L'Oréal / INOA / Majirel / Dia – dot-system  5.35  6.0  8.13
const LOREAL_LEVELS = {
  1:"Black", 2:"Very dark brown", 3:"Dark brown", 4:"Brown",
  5:"Light brown", 6:"Dark blonde", 7:"Blonde", 8:"Light blonde",
  9:"Very light blonde", 10:"Lightest blonde", 11:"Ultra light blonde",
  12:"High-lift blonde",
};
const LOREAL_REFLECTS = {
  "0":"Natural","1":"Ash / blue","2":"Iridescent / violet","3":"Gold",
  "4":"Copper","5":"Mahogany / red-violet","6":"Red","7":"Green / matte",
  "8":"Mocha","9":"Pearl",
};

// Wella / Koleston / Color Touch – slash-system  5/0  10/36  0/89
const WELLA_REFLECTS = {
  "0":"Natural","1":"Ash","2":"Matte / green","3":"Gold","4":"Red / warm",
  "5":"Mahogany","6":"Violet","7":"Brown","8":"Pearl","9":"Cendre",
};

// Schwarzkopf – dash-system  6-16  5-1  9-1
const SKP_REFLECTS = {
  "0":"Natural","1":"Ash / cool","2":"Ash cool","3":"Gold",
  "4":"Beige / copper","5":"Gold mahogany","6":"Scarlet / vibrant red",
  "7":"Russet / brunette","8":"Pearl / silver","9":"Violet",
};

// Redken – alpha-numeric suffix  6CR  8MO  10NA  010NP
const REDKEN_SUFFIX = {
  "N":"Natural","NW":"Natural warm","NA":"Natural ash","NP":"Natural pale",
  "A":"Ash","AA":"Deep ash","B":"Beige","BR":"Brown","C":"Copper",
  "CR":"Copper red","G":"Gold","GR":"Gold red","MO":"Mocha",
  "R":"Red","RR":"Intense red","V":"Violet","RO":"Rose","BO":"Boho",
};

// International / generic – same as L'Oréal
const INTERNATIONAL_REFLECTS = LOREAL_REFLECTS;

/**
 * Returns a human-readable shade description string.
 * Works for the most common brand shade notation systems.
 */
function describeShade(shade, brand, series) {
  if (!shade) return "";
  const s   = String(shade).trim();
  const bUP = String(brand || "").toUpperCase();
  const seUP= String(series || "").toUpperCase();

  // Developers – simple % notation  e.g. "6%   20 Vol." or "6%"
  const devMatch = s.match(/^([\d.]+)%/);
  if (devMatch) {
    const pct = parseFloat(devMatch[1]);
    const vol = Math.round(pct * 10 / 3);
    return `Developer ${pct}% – ${vol} Vol.`;
  }

  // Pure named shades (CLEAR, NATURAL, etc.)
  if (/^(clear|natural|neutral|transparent|extra bleach|white|black)$/i.test(s.replace(/\s+/g, " ")))
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  // L'Oréal Cool Cover prefix  CC10  CC4  CC10.1
  const ccMatch = s.match(/^CC(\d+)(?:\.(\d)(\d*))?$/i);
  if (ccMatch) {
    const lvl  = parseInt(ccMatch[1]);
    const r1   = ccMatch[2] || "0";
    const r2   = ccMatch[3] || "";
    const lvlName = LOREAL_LEVELS[lvl] || `Level ${lvl}`;
    const r1Name  = LOREAL_REFLECTS[r1]  || r1;
    const r2Name  = r2 ? (LOREAL_REFLECTS[r2] || r2) : "";
    return `Cool Cover – ${lvlName}${r1 !== "0" ? ` – ${r1Name}${r2Name ? " / " + r2Name : ""}` : ""}`;
  }

  // Fraction level notation  "10 1/2.1"  → Level 10.5 Ash
  const fracMatch = s.match(/^(\d+)\s+1\/2(?:\.(\d)(\d*))?$/);
  if (fracMatch) {
    const lvl  = parseInt(fracMatch[1]) + 0.5;
    const r1   = fracMatch[2] || null;
    const r2   = fracMatch[3] || "";
    const lvlName = `Level ${lvl} (ultra-light)`;
    if (!r1) return lvlName;
    const r1Name  = LOREAL_REFLECTS[r1] || r1;
    const r2Name  = r2 ? (LOREAL_REFLECTS[r2] || r2) : "";
    return `${lvlName} – ${r1Name}${r2Name ? " / " + r2Name : ""}`;
  }

  // Redken
  if (bUP === "REDKEN") {
    const m = s.match(/^(\d+)\s*([A-Z]{1,3})(\d*[A-Z]*)$/i);
    if (m) {
      const lvl = parseInt(m[1]);
      const suf = m[2].toUpperCase() + (m[3] || "").toUpperCase();
      const lvlName = LOREAL_LEVELS[lvl] || `Level ${lvl}`;
      const sufName = REDKEN_SUFFIX[suf] || suf;
      return `${lvlName} – ${sufName}`;
    }
  }

  // Schwarzkopf  N-1.0  6-16  5-65
  if (bUP.includes("SCHWARZKOPF") || seUP.includes("IGORA") || seUP.includes("ESSENSITY")) {
    const m = s.match(/^(\d+(?:\.\d+)?)-(\d)(\d*)$/);
    if (m) {
      const lvl  = parseInt(m[1]);
      const r1   = m[2];
      const r2   = m[3] || "";
      const lvlName = LOREAL_LEVELS[lvl] || `Level ${lvl}`;
      const r1Name  = SKP_REFLECTS[r1]  || r1;
      const r2Name  = r2 ? (SKP_REFLECTS[r2] || r2) : "";
      return r2Name ? `${lvlName} – ${r1Name} / ${r2Name}` : `${lvlName} – ${r1Name}`;
    }
  }

  // Wella slash-system  5/0  10/36  0/89
  if (bUP.includes("WELLA") || seUP.includes("KOLESTON") || seUP.includes("COLOR TOUCH") || seUP.includes("COLOR FRESH")) {
    const m = s.match(/^(\d+)\/(\d)(\d*)$/);
    if (m) {
      const lvl  = parseInt(m[1]);
      const r1   = m[2];
      const r2   = m[3] || "";
      const lvlName = LOREAL_LEVELS[lvl] || (lvl === 0 ? "Intensifier / mixer" : `Level ${lvl}`);
      const r1Name  = WELLA_REFLECTS[r1]  || r1;
      const r2Name  = r2 ? (WELLA_REFLECTS[r2] || r2) : "";
      return r2Name ? `${lvlName} – ${r1Name} / ${r2Name}` : `${lvlName} – ${r1Name}`;
    }
  }

  // L'Oréal dot-system  5.35  6.0  8.13  (also INOA, Majirel, Dia, Richesse)
  if (
    bUP.includes("L'OREAL") || bUP.includes("LOREAL") ||
    seUP.includes("INOA") || seUP.includes("MAJIREL") ||
    seUP.includes("DIA ") || seUP.includes("RICHESSE") || seUP.includes("CASTING")
  ) {
    const m = s.match(/^(\d+)\.(\d)(\d*)$/);
    if (m) {
      const lvl  = parseInt(m[1]);
      const r1   = m[2];
      const r2   = m[3] || "";
      const lvlName = LOREAL_LEVELS[lvl] || `Level ${lvl}`;
      const r1Name  = LOREAL_REFLECTS[r1]  || r1;
      const r2Name  = r2 ? (LOREAL_REFLECTS[r2] || r2) : "";
      return r2Name ? `${lvlName} – ${r1Name} / ${r2Name}` : `${lvlName} – ${r1Name}`;
    }
    // e.g. "8.13" where reflects are given
    const m2 = s.match(/^(\d+)$/);
    if (m2) return LOREAL_LEVELS[parseInt(m2[1])] || `Level ${m2[1]}`;
  }

  // Generic international dot-system fallback (e.g. PURE IDENTITY, KOLESTON)
  const mDot = s.match(/^(\d+)[./](\d)(\d*)$/);
  if (mDot) {
    const lvl  = parseInt(mDot[1]);
    const r1   = mDot[2];
    const r2   = mDot[3] || "";
    const lvlName = LOREAL_LEVELS[lvl] || (lvl === 0 ? "Intensifier / mixer" : `Level ${lvl}`);
    const r1Name  = INTERNATIONAL_REFLECTS[r1]  || r1;
    const r2Name  = r2 ? (INTERNATIONAL_REFLECTS[r2] || r2) : "";
    return r2Name ? `${lvlName} – ${r1Name} / ${r2Name}` : `${lvlName} – ${r1Name}`;
  }

  // Pure level number  "6"  "10"
  const mLvl = s.match(/^(\d{1,2})$/);
  if (mLvl) {
    const lvl = parseInt(mLvl[1]);
    if (lvl >= 1 && lvl <= 12) return LOREAL_LEVELS[lvl] || "";
  }

  // Nothing matched – return as-is (will show shade label without extra description)
  return "";
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

function slug(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("Reading XLSX:", XLSX_FILE);
  const wb   = XLSX.readFile(XLSX_FILE);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  console.log(`  ${rawRows.length} raw rows loaded.`);

  // ── Pass 1: build barcode → productId map to detect conflicts ─────────────
  const barcodeToIds = new Map();
  for (const r of rawRows) {
    if (!r.barcodes) continue;
    let bcs;
    try { bcs = JSON.parse(r.barcodes); } catch { continue; }
    for (const bc of bcs) {
      if (!barcodeToIds.has(bc)) barcodeToIds.set(bc, []);
      barcodeToIds.get(bc).push({ id: r.productId, brand: r.brand });
    }
  }

  // Barcodes shared across different brands (excluding deprecated brands)
  const barcodeConflictIds = new Set();
  for (const [bc, entries] of barcodeToIds) {
    const activeBrands = entries.filter(
      (e) => e.brand !== "TO DEL." && !e.brand.toUpperCase().includes("TO REPLACE"),
    );
    const uniqueBrands = new Set(activeBrands.map((e) => e.brand));
    if (uniqueBrands.size > 1) {
      // Mark all active duplicates
      for (const e of activeBrands) barcodeConflictIds.add(e.id);
    }
    // Same brand, same barcode on different shades – also flag
    const sameBrandEntries = {};
    for (const e of activeBrands) {
      sameBrandEntries[e.brand] = sameBrandEntries[e.brand] || [];
      sameBrandEntries[e.brand].push(e.id);
    }
    for (const ids of Object.values(sameBrandEntries)) {
      if (ids.length > 1) ids.forEach((id) => barcodeConflictIds.add(id));
    }
  }

  // ── Pass 2: process each row ──────────────────────────────────────────────
  const products = [];

  for (const r of rawRows) {
    const brand  = normBrand(r.brand);
    const series = r.series || "";
    const shade  = r.shade  || "";
    const rawType = String(r.type || "").trim();
    const type   = TYPE_MAP[rawType] || rawType || "other";
    const flag   = entryFlag(r, barcodeConflictIds);

    // Generate shade description for color/toner products
    let shadeDesc = "";
    if (type === "color" || type === "toner") {
      shadeDesc = describeShade(shade, brand, series);
    } else if (type === "developer") {
      shadeDesc = describeShade(shade, brand, series);
    }

    // Parse barcodes
    const barcodes = parseBarcodes(r.barcodes);
    const productKind = inferProductKind({
      type,
      series,
      familyShade: r.familyShade || "",
      shade,
    });

    products.push({
      id:     r.productId,
      brand,
      series,
      familyShade: r.familyShade || "",
      shade,
      type,
      rawType,
      productKind,
      catalogNo: r.catalogNo || "",
      image: r.image || "",
      hairColor: r.hairColor || "",
      packingWeight: numericOrNull(r.packingWeight),
      materialWeight: numericOrNull(r.materialWeight),
      price: typeof r.ILS === "number" ? r.ILS : 0,
      barcodeCount: barcodes.length,
      barcode: barcodes[0] || "",
      barcodes,
      verificationUrl: buildVerificationUrl({
        brand,
        series,
        shade,
        barcode: barcodes[0] || "",
      }),
      flag,       // 0=active 1=deleted 2=deprecated 3=barcode-conflict
      shadeDesc,
    });
  }

  console.log(`  ${products.length} products processed.`);
  console.log(`  Deleted (TO DEL.):     ${products.filter((p) => p.flag === 1).length}`);
  console.log(`  Deprecated (TO REPL.): ${products.filter((p) => p.flag === 2).length}`);
  console.log(`  Barcode conflicts:     ${products.filter((p) => p.flag === 3).length}`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const activeProducts = products.filter((p) => p.flag === 0);
  const activeBrandsSet = new Set(activeProducts.map((p) => p.brand));
  const typeBreakdown = {};
  for (const p of activeProducts) typeBreakdown[p.type] = (typeBreakdown[p.type] || 0) + 1;

  // ── Brand index (for sidebar navigation) ─────────────────────────────────
  // Build per-brand, per-series counts from active + flagged products (all shown)
  const brandMap = new Map();
  for (const p of products) {
    if (!brandMap.has(p.brand)) brandMap.set(p.brand, new Map());
    const seriesMap = brandMap.get(p.brand);
    if (!seriesMap.has(p.series)) seriesMap.set(p.series, 0);
    seriesMap.set(p.series, seriesMap.get(p.series) + 1);
  }

  const brandIndex = [...brandMap.entries()]
    .map(([brand, seriesMap]) => {
      const totalCount = [...seriesMap.values()].reduce((s, v) => s + v, 0);
      const seriesList = [...seriesMap.entries()]
        .map(([series, count]) => ({ series, count }))
        .sort((a, b) => b.count - a.count);
      return { brand, slug: slug(brand), totalCount, series: seriesList };
    })
    .sort((a, b) => b.totalCount - a.totalCount);

  // ── Write output ──────────────────────────────────────────────────────────
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(BRANDS_DIR, { recursive: true });

  const indexPayload = {
    generatedAt:   new Date().toISOString(),
    sourceFile:    "data/products_1781528628322.xlsx",
    summary: {
      totalRows:          products.length,
      activeProducts:     activeProducts.length,
      deletedProducts:    products.filter((p) => p.flag === 1).length,
      deprecatedProducts: products.filter((p) => p.flag === 2).length,
      barcodeConflicts:   products.filter((p) => p.flag === 3).length,
      totalBrands:        activeBrandsSet.size,
      typeBreakdown,
    },
    brands: brandIndex,
  };

  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexPayload, null, 2) + "\n", "utf8");
  console.log(`\nIndex written: ${INDEX_FILE} (${(fs.statSync(INDEX_FILE).size / 1024).toFixed(1)} KB)`);

  // Products — per-brand files for on-demand loading
  products.sort((a, b) => {
    const bb = a.brand.localeCompare(b.brand);
    if (bb !== 0) return bb;
    const bs = a.series.localeCompare(b.series);
    if (bs !== 0) return bs;
    return a.shade.localeCompare(b.shade);
  });

  const productsByBrand = new Map();
  for (const p of products) {
    const key = slug(p.brand);
    if (!productsByBrand.has(key)) productsByBrand.set(key, []);
    productsByBrand.get(key).push(p);
  }

  let totalBrandFiles = 0;
  for (const [brandSlug, prods] of productsByBrand) {
    const file = path.join(BRANDS_DIR, `${brandSlug}.json`);
    fs.writeFileSync(file, JSON.stringify(prods, null, 0) + "\n", "utf8");
    totalBrandFiles++;
  }
  console.log(`Per-brand files written: ${totalBrandFiles} files → ${BRANDS_DIR}`);

  console.log(`\nTop 10 brands by product count:`);
  brandIndex.slice(0, 10).forEach((b) =>
    console.log(`  ${b.brand}: ${b.totalCount} products, ${b.series.length} series`),
  );
}

main();
