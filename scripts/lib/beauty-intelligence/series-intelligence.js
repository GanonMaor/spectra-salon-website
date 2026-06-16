/**
 * scripts/lib/beauty-intelligence/series-intelligence.js
 * ────────────────────────────────────────────────────────────────
 * Builds Series Intelligence from a collection of shade-map entries.
 *
 * For every brand+series combination, computes:
 *   - salons using the series (distinct customer count)
 *   - total services/rows
 *   - total grams consumed
 *   - top shades (by rows)
 *   - weak shades (low usage)
 *   - top services (aggregated from all shades)
 *   - dominant product types
 *   - primary market category
 *   - suggested business interpretation
 */

"use strict";

const { normalizeBrandKey, getBrandKnowledge, getSeriesKnowledge, BRAND_DICTIONARY } = require("./brand-dictionary");
const { classifyEntry } = require("./classification-engine");

/**
 * Builds a series intelligence map from shade-map entries.
 * @param {Array} entries – from pol-shade-map.json
 * @returns {Array} seriesIntelligence records
 */
function buildSeriesIntelligence(entries) {
  const seriesMap = {};

  for (const entry of entries) {
    const brandKey = normalizeBrandKey(entry.brand);
    const seriesKey = `${brandKey}::${String(entry.series || "").toUpperCase().trim()}`;

    if (!seriesMap[seriesKey]) {
      seriesMap[seriesKey] = {
        brandKey,
        brandRaw: entry.brand,
        brandDisplay: getBrandKnowledge(entry.brand)?.displayName || entry.brand,
        seriesRaw: entry.series,
        seriesDisplay: null,
        productType: null,
        technology: null,
        description: null,
        primaryMarketCategory: null,
        officialUrl: null,
        commonServices: null,
        rows: 0,
        grams: 0,
        customers: 0,
        shades: [],
        serviceAggregate: {},
        productTypes: new Set(),
        marketCategories: {},
      };
    }

    const s = seriesMap[seriesKey];
    s.rows += entry.rows || 0;
    s.grams += entry.grams || 0;
    s.customers += entry.customers || 0;

    // Classify this entry
    const cls = classifyEntry(entry);
    s.productTypes.add(cls.productType);

    if (cls.marketCategory) {
      s.marketCategories[cls.marketCategory] = (s.marketCategories[cls.marketCategory] || 0) + (entry.rows || 0);
    }

    // Aggregate top services
    for (const svc of (entry.topServices || [])) {
      const name = normalizeServiceName(svc.name);
      s.serviceAggregate[name] = (s.serviceAggregate[name] || 0) + svc.value;
    }

    // Collect shade
    s.shades.push({
      shade: entry.shade,
      rows: entry.rows || 0,
      grams: entry.grams || 0,
      classification: cls,
    });

    // Enrich with series knowledge
    const sk = getSeriesKnowledge(entry.brand, entry.series);
    if (sk && !s.seriesDisplay) {
      s.seriesDisplay = sk.displayName;
      s.productType = sk.productType;
      s.technology = sk.technology;
      s.description = sk.description;
      s.primaryMarketCategory = sk.primaryMarketCategory;
      s.officialUrl = sk.officialUrl || null;
      s.commonServices = sk.commonServices || null;
    }
  }

  // Finalize each series
  const result = [];
  for (const [key, s] of Object.entries(seriesMap)) {
    const sortedShades = s.shades.sort((a, b) => b.rows - a.rows);
    const topShades = sortedShades.slice(0, 8).map(sh => ({
      shade: sh.shade,
      rows: sh.rows,
      grams: sh.grams,
      marketCategory: sh.classification.marketCategory,
      level: sh.classification.level,
      reflectionPrimary: sh.classification.reflectionPrimary,
    }));
    const weakShades = sortedShades.filter(sh => sh.rows <= 3 && sh.rows > 0).slice(0, 5).map(sh => sh.shade);

    const topServices = Object.entries(s.serviceAggregate)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Dominant market category
    const topCat = Object.entries(s.marketCategories).sort((a, b) => b[1] - a[1])[0];
    const dominantCategory = s.primaryMarketCategory || (topCat ? topCat[0] : null);

    const isDeveloper = [...s.productTypes].every(pt => pt === "developer");
    const isLightener = [...s.productTypes].every(pt => pt === "lightener");
    const isMixed = s.productTypes.size > 1;

    result.push({
      seriesKey: key,
      brandKey: s.brandKey,
      brandDisplay: s.brandDisplay,
      seriesRaw: s.seriesRaw,
      seriesDisplay: s.seriesDisplay || s.seriesRaw,
      productType: s.productType || [...s.productTypes][0] || "unknown",
      technology: s.technology,
      description: s.description,
      primaryMarketCategory: dominantCategory,
      officialUrl: s.officialUrl,
      commonServices: s.commonServices || topServices.slice(0, 3).map(sv => sv.name),
      isDeveloper,
      isLightener,
      isMixed,
      usage: {
        rows: s.rows,
        grams: Math.round(s.grams),
        customers: s.customers,
        shadeCount: s.shades.length,
      },
      topServices,
      topShades,
      weakShades,
      marketCategories: s.marketCategories,
    });
  }

  return result.sort((a, b) => b.usage.rows - a.usage.rows);
}

function normalizeServiceName(name) {
  const n = String(name || "").toLowerCase().trim();
  if (n.includes("root")) return "Root Coverage";
  if (n.includes("full head color") || n.includes("full color")) return "Global Color";
  if (n.includes("color length")) return "Global Color";
  if (n.includes("toner") || n.includes("gloss")) return "Toning";
  if (n.includes("ombre") || n.includes("balyage") || n.includes("balayage")) return "Balayage";
  if (n.includes("highlight") || n.includes("foil")) return "Highlights";
  if (n.includes("correct")) return "Color Correction";
  return titleCase(name);
}

function titleCase(str) {
  return String(str || "").replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

module.exports = { buildSeriesIntelligence };
