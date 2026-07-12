/**
 * netlify/functions/beauty-intelligence.js
 * ───────────────────────────────────────────────────────────────────────────
 * Beauty Intelligence Dictionary API.
 *
 * Routes:
 *   GET  /inventory-report       – observed truth counts from Neon + local fallback
 *   GET  /brand-dictionary        – curated brand/series knowledge
 *   GET  /series-intelligence     – series-level usage intelligence
 *   GET  /shade-intelligence      – shade-level classification + usage
 *   GET  /market-reports          – category-level market analysis
 *
 * Future (Phase 8):
 *   PATCH /shade-intelligence/:id/classification
 *   PATCH /series-dictionary/:id/knowledge
 *   POST  /sources
 *   POST  /rebuild-from-observed-data
 *
 * Auth: X-Access-Code header, same pattern as usage-import.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { createClient, hasDatabaseUrl } = require("./_db");

const ACCESS_CODE  = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

// ── Local data fallbacks ─────────────────────────────────────────────────────

function loadLocal(relPath) {
  try {
    const full = path.join(__dirname, "../..", relPath);
    if (fs.existsSync(full)) {
      return JSON.parse(fs.readFileSync(full, "utf8"));
    }
  } catch {/* ignore */}
  return null;
}

// ── Response helpers ─────────────────────────────────────────────────────────

function ok(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

function err(status, message) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: message }),
  };
}

function getHeader(headers, name) {
  const key = Object.keys(headers || {}).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : null;
}

// ── Neon client ──────────────────────────────────────────────────────────────

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

// ── Route: inventory-report ──────────────────────────────────────────────────

async function inventoryReport() {
  let neonData = null;

  if (hasDatabaseUrl()) {
    let client;
    try {
      client = await getClient();

      // Count from usage_report_rows
      const rowsResult = await client.query(`
        SELECT
          COUNT(*) AS total_rows,
          COUNT(DISTINCT brand) AS unique_brands
        FROM usage_report_rows
      `).catch(() => null);

      // Brand breakdown from usage_report_rows
      const brandsResult = await client.query(`
        SELECT brand, COUNT(*) AS rows
        FROM usage_report_rows
        GROUP BY brand
        ORDER BY rows DESC
        LIMIT 30
      `).catch(() => null);

      // Try to get series breakdown from payload
      const seriesResult = await client.query(`
        SELECT
          payload->>'series' AS series,
          brand,
          COUNT(*) AS rows
        FROM usage_report_rows
        WHERE payload->>'series' IS NOT NULL
        GROUP BY brand, payload->>'series'
        ORDER BY rows DESC
        LIMIT 100
      `).catch(() => null);

      if (rowsResult) {
        neonData = {
          source: "neon",
          totalRows: parseInt(rowsResult.rows[0]?.total_rows || 0, 10),
          uniqueBrands: parseInt(rowsResult.rows[0]?.unique_brands || 0, 10),
          brandBreakdown: (brandsResult?.rows || []).map(r => ({ brand: r.brand, rows: parseInt(r.rows, 10) })),
          seriesBreakdown: (seriesResult?.rows || []).map(r => ({ brand: r.brand, series: r.series, rows: parseInt(r.rows, 10) })),
        };
      }
    } catch (e) {
      console.error("Neon inventory error:", e.message);
    } finally {
      if (client) await client.end().catch(() => {});
    }
  }

  // Always include local fallback (pre-computed intelligence layer)
  const localIndex = loadLocal("src/data/beauty-intelligence/index.json");

  return ok({
    neon: neonData,
    local: localIndex,
    summary: neonData ? {
      source: "neon+local",
      totalNeonRows: neonData.totalRows,
      uniqueNeonBrands: neonData.uniqueBrands,
      localObservedItems: localIndex?.inventory?.totalObservedItems || 0,
      localColorShades: localIndex?.inventory?.colorShadesCount || 0,
      localDevelopers: localIndex?.inventory?.developerCount || 0,
      localSeries: localIndex?.seriesCount || 0,
    } : {
      source: "local-only",
      localObservedItems: localIndex?.inventory?.totalObservedItems || 0,
      localColorShades: localIndex?.inventory?.colorShadesCount || 0,
      localDevelopers: localIndex?.inventory?.developerCount || 0,
      localSeries: localIndex?.seriesCount || 0,
      byProductType: localIndex?.inventory?.byProductType || {},
    },
  });
}

// ── Route: brand-dictionary ──────────────────────────────────────────────────

async function brandDictionary(query) {
  // Load from pre-built static files
  const brands = loadLocal("public/beauty-intelligence/brands.json");
  if (!brands) return err(503, "Brand dictionary not yet generated. Run: node scripts/build-beauty-intelligence.js");

  // Optionally filter by brand slug
  const slug = query?.brand;
  if (slug) {
    const brand = brands.brands?.find(b => slugify(b.brandKey) === slug || slugify(b.brandDisplay) === slug);
    return brand ? ok(brand) : err(404, "Brand not found");
  }

  return ok(brands);
}

// ── Route: series-intelligence ───────────────────────────────────────────────

async function seriesIntelligence(query) {
  const brandSlug = query?.brand;
  if (!brandSlug) {
    // Return summary across all brands
    const index = loadLocal("src/data/beauty-intelligence/index.json");
    if (!index) return err(503, "Intelligence data not generated. Run: node scripts/build-beauty-intelligence.js");
    const brands = loadLocal("public/beauty-intelligence/brands.json");
    const allSeries = [];
    for (const b of (brands?.brands || [])) {
      const slug = slugify(b.brandKey);
      const seriesData = loadLocal(`public/beauty-intelligence/series/${slug}.json`);
      if (seriesData) allSeries.push(...seriesData);
    }
    return ok({ total: allSeries.length, series: allSeries.sort((a, b) => b.usage.rows - a.usage.rows) });
  }

  const seriesData = loadLocal(`public/beauty-intelligence/series/${brandSlug}.json`);
  if (!seriesData) return err(404, "Series not found for brand: " + brandSlug);
  return ok(seriesData);
}

// ── Route: shade-intelligence ────────────────────────────────────────────────

async function shadeIntelligence(query) {
  const brandSlug = query?.brand;
  const searchTerm = (query?.search || "").toLowerCase().trim();
  const filterType = query?.type;
  const filterCategory = query?.category;
  const colorOnly = query?.colorOnly === "true";

  if (!brandSlug) {
    // Return index
    const index = loadLocal("public/beauty-intelligence/shades-index.json");
    return ok(index || { error: "Shades not generated. Run: node scripts/build-beauty-intelligence.js" });
  }

  let shades = loadLocal(`public/beauty-intelligence/shades-${brandSlug}.json`) || [];

  // Filters
  if (colorOnly) shades = shades.filter(s => s.isColorShade);
  if (filterType) shades = shades.filter(s => s.productKnowledge.productType === filterType);
  if (filterCategory) shades = shades.filter(s => s.marketClassification?.marketCategory === filterCategory);
  if (searchTerm) {
    shades = shades.filter(s =>
      s.shade?.toLowerCase().includes(searchTerm) ||
      s.seriesDisplay?.toLowerCase().includes(searchTerm) ||
      s.marketClassification?.marketCategory?.toLowerCase().includes(searchTerm)
    );
  }

  return ok({ brand: brandSlug, total: shades.length, shades });
}

// ── Route: market-reports ────────────────────────────────────────────────────

async function marketReports(query) {
  const reports = loadLocal("public/beauty-intelligence/market-reports.json");
  if (!reports) return err(503, "Market reports not generated. Run: node scripts/build-beauty-intelligence.js");

  const category = query?.category;
  if (category) {
    const cat = reports.categories?.find(c => c.category === category);
    return cat ? ok(cat) : err(404, "Category not found");
  }

  return ok(reports);
}

// ── Main handler ─────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      },
      body: "",
    };
  }

  // Auth
  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== ACCESS_CODE) {
    return err(401, "Unauthorized");
  }

  const rawPath = (event.path || "").replace("/.netlify/functions/beauty-intelligence", "").replace(/^\/+/, "");
  const [route, ...subParts] = rawPath.split("/").filter(Boolean);
  const query = event.queryStringParameters || {};

  try {
    switch (route) {
      case "inventory-report":
        return await inventoryReport();
      case "brand-dictionary":
        return await brandDictionary(query);
      case "series-intelligence":
        return await seriesIntelligence(query);
      case "shade-intelligence":
        return await shadeIntelligence(query);
      case "market-reports":
        return await marketReports(query);
      default:
        return err(404, `Unknown route: ${route || "(root)"}. Available: inventory-report, brand-dictionary, series-intelligence, shade-intelligence, market-reports`);
    }
  } catch (e) {
    console.error("beauty-intelligence error:", e);
    return err(500, e.message);
  }
};

// ── Util ─────────────────────────────────────────────────────────────────────

function slugify(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
