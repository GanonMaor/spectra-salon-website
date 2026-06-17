#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const RAW_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/pol-customer-usage.raw.json");
const SHADE_MAP_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/pol-shade-map.json");
const OUTPUT_DIR = path.resolve(__dirname, "../reports/pol-customer-usage/color-intelligence-dictionary");

const EXCLUDED_PRODUCT_TYPES = new Set(["developer_oxidant"]);
const COLOR_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
  "lightener_bleach",
  "mixer_corrector",
  "bond_builder",
]);

const BRAND_REFERENCE = {
  "L'OREAL PROFESSIONNEL": {
    brandDisplay: "L'Oréal Professionnel",
    chartUrl: "https://us.lorealprofessionnel.com/pro-resources/shade-charts",
    productReferenceUrl: "https://us.lorealprofessionnel.com/all-products/hair-color",
    visualNote: "Use L'Oréal shade charts for INOA, Majirel, Dia Light, Dia Color, Dia Richesse, Luo Color, and Blond Studio.",
  },
  SCHWARZKOPF: {
    brandDisplay: "Schwarzkopf Professional",
    chartUrl: "https://www.schwarzkopf-professional.com/gb/en/colour/igora/royal.html",
    productReferenceUrl: "https://www.schwarzkopf-professional.com/gb/en/colour.html",
    visualNote: "Use IGORA Royal/Vibrance and BlondMe references for shade families and lightening products.",
  },
  WELLA: {
    brandDisplay: "Wella Professionals",
    chartUrl: "https://blog.wella.com/us/color-charts",
    productReferenceUrl: "https://www.wella.com/professional",
    visualNote: "Use Wella Color Touch, Koleston, Blondor, and Welloxon references.",
  },
  MATRIX: {
    brandDisplay: "Matrix",
    chartUrl: "https://www.matrix.com/professional-hair-color/color-charts",
    productReferenceUrl: "https://www.matrix.com/professional-hair-color",
    visualNote: "Use Matrix SoColor, SoColor Sync, Super Sync, and Tonal Control references.",
  },
  KEUNE: {
    brandDisplay: "Keune",
    chartUrl: "https://www.keune.com/education/color-charts/",
    productReferenceUrl: "https://www.keune.com/pro/",
    visualNote: "Use Keune Tinta Color and Semi Color references.",
  },
};

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value).toUpperCase().replace(/\s+/g, " ");
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function addCounter(map, key, amount = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + amount);
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round(value) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function slugify(value) {
  const hebrewMap = {
    א: "a",
    ב: "b",
    ג: "g",
    ד: "d",
    ה: "h",
    ו: "v",
    ז: "z",
    ח: "ch",
    ט: "t",
    י: "y",
    כ: "k",
    ך: "k",
    ל: "l",
    מ: "m",
    ם: "m",
    נ: "n",
    ן: "n",
    ס: "s",
    ע: "a",
    פ: "p",
    ף: "p",
    צ: "tz",
    ץ: "tz",
    ק: "k",
    ר: "r",
    ש: "sh",
    ת: "t",
  };
  const transliterated = clean(value)
    .split("")
    .map((char) => hebrewMap[char] || char)
    .join("");
  const slug = transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "unknown";
}

function formulaKey(row) {
  return [
    row.sourceCustomer,
    row.sourceYear,
    row.profile,
    row.date,
    row.time,
    row.client,
    row.service,
  ].join("|||");
}

function shadeMapKey(brand, series, shade) {
  return [clean(brand), clean(series), clean(shade)].join("|||");
}

function loadInputs() {
  const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));
  const shadeMap = JSON.parse(fs.readFileSync(SHADE_MAP_FILE, "utf8"));
  const enrichments = new Map(
    shadeMap.entries.map((entry) => [shadeMapKey(entry.brand, entry.series, entry.shade), entry]),
  );
  return { rows: raw.rows, shadeMap, enrichments };
}

function groupFormulas(rows, enrichments) {
  const groups = new Map();

  for (const row of rows) {
    const key = formulaKey(row);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        stylist: row.sourceCustomer,
        year: row.sourceYear || row.year,
        profile: row.profile,
        date: row.date,
        monthKey: row.monthKey,
        time: row.time,
        client: row.client,
        service: row.service,
        serviceTotalGrams: 0,
        serviceTotalCost: 0,
        products: [],
      });
    }

    const group = groups.get(key);
    if (row.rowType === "service_total") {
      group.serviceTotalGrams += Number(row.grams || 0);
      group.serviceTotalCost += Number(row.cost || 0);
      continue;
    }

    const enrichment = enrichments.get(shadeMapKey(row.brand, row.series, row.shade));
    const productType = enrichment?.productType || "unknown";
    if (EXCLUDED_PRODUCT_TYPES.has(productType)) continue;
    if (!COLOR_PRODUCT_TYPES.has(productType)) continue;

    group.products.push({
      brand: row.brand,
      series: row.series,
      shade: row.shade,
      grams: Number(row.grams || 0),
      cost: Number(row.cost || 0),
      enrichment,
    });
  }

  return [...groups.values()].filter((formula) => formula.products.length > 0);
}

function summarizeShade(shadeKey, rows, allFormulaCount) {
  const first = rows[0];
  const enrichment = first.enrichment || {};
  const formulaIds = new Set(rows.map((row) => row.formulaId));
  const clients = new Set(rows.map((row) => row.client).filter(Boolean));
  const stylists = new Set(rows.map((row) => row.stylist).filter(Boolean));
  const services = new Map();
  const companions = new Map();
  const companionBrands = new Map();

  for (const row of rows) {
    addCounter(services, row.service);
    for (const companion of row.companionShades) addCounter(companions, companion);
    for (const brand of row.companionBrands) addCounter(companionBrands, brand);
  }

  return {
    key: shadeKey,
    brand: first.brand,
    series: first.series,
    shade: first.shade,
    productType: enrichment.productType,
    productTypeLabel: enrichment.productTypeLabel,
    colorLine: enrichment.colorLine,
    colorTechnology: enrichment.colorTechnology,
    shadeSystem: enrichment.shadeSystem,
    level: enrichment.level ?? null,
    levelName: enrichment.levelName ?? null,
    family: enrichment.colorFamily || inferFamily(enrichment),
    temperature: inferTemperature(enrichment),
    reflection: describeReflects(enrichment),
    humanDescription: enrichment.meaning || "No description available",
    confidence: enrichment.confidence || "low",
    usageCount: rows.length,
    formulaCount: formulaIds.size,
    formulaSharePct: allFormulaCount > 0 ? round((formulaIds.size / allFormulaCount) * 100, 1) : 0,
    clientCount: clients.size,
    salonCount: stylists.size,
    totalGrams: round(rows.reduce((sum, row) => sum + row.grams, 0)),
    totalCost: round(rows.reduce((sum, row) => sum + row.cost, 0)),
    mostCommonServices: topEntries(services, 8),
    mostCommonCompanionShades: topEntries(companions, 8),
    mostCommonCompanionBrands: topEntries(companionBrands, 8),
  };
}

function inferFamily(enrichment) {
  if (enrichment.productType === "lightener_bleach") return "Blonde / lightening";
  if (enrichment.productType === "mixer_corrector") return "Fashion / corrective tone";
  if (enrichment.productType === "bond_builder") return "Bond support";
  return null;
}

function describeReflects(enrichment) {
  if (Array.isArray(enrichment.reflects) && enrichment.reflects.length > 0) {
    return enrichment.reflects.map((reflect) => reflect.tone).join(" + ");
  }
  if (enrichment.productType === "lightener_bleach") return "Lightening / decolorizing";
  if (enrichment.productType === "mixer_corrector") return "Corrective / direct tone";
  if (enrichment.productType === "bond_builder") return "Bond support";
  return "Unknown";
}

function inferTemperature(enrichment) {
  const text = `${describeReflects(enrichment)} ${enrichment.meaning || ""}`.toLowerCase();
  if (/ash|blue|violet|pearl|cendre|matte|green|cool/.test(text)) return "Cool";
  if (/gold|copper|red|warm|mahogany|mocha|chocolate/.test(text)) return "Warm";
  if (/natural|neutral/.test(text)) return "Neutral";
  if (enrichment.productType === "lightener_bleach") return "Neutral";
  return "Unknown";
}

function buildReport(stylist, year, formulas) {
  const flattened = [];
  const formulaBrandCombos = new Map();
  const formulaShadeCombos = new Map();
  const brandGrams = new Map();
  const seriesGrams = new Map();
  const shadeGrams = new Map();
  const familyFormulaCounts = new Map();
  const temperatureFormulaCounts = new Map();
  const serviceCounts = new Map();
  const serviceShadeCounts = new Map();
  const monthFormulaCounts = new Map();
  const clientSet = new Set();
  const multiBrandFormulaCount = formulas.filter((formula) => new Set(formula.products.map((product) => product.brand)).size > 1).length;
  const multiShadeFormulaCount = formulas.filter((formula) => new Set(formula.products.map((product) => product.shade)).size > 1).length;

  for (const formula of formulas) {
    if (formula.client) clientSet.add(formula.client);
    addCounter(serviceCounts, formula.service);
    addCounter(monthFormulaCounts, formula.monthKey);

    const brandsInFormula = [...new Set(formula.products.map((product) => product.brand).filter(Boolean))].sort();
    const shadesInFormula = [...new Set(formula.products.map((product) => product.shade).filter(Boolean))].sort();
    if (brandsInFormula.length > 1) addCounter(formulaBrandCombos, brandsInFormula.join(" + "));
    if (shadesInFormula.length > 1) addCounter(formulaShadeCombos, shadesInFormula.join(" + "));

    for (const product of formula.products) {
      const enrichment = product.enrichment || {};
      addCounter(brandGrams, product.brand, product.grams);
      addCounter(seriesGrams, product.series, product.grams);
      addCounter(shadeGrams, `${product.brand} | ${product.series} | ${product.shade}`, product.grams);
      addCounter(familyFormulaCounts, inferFamily(enrichment) || enrichment.colorFamily || "Unknown");
      addCounter(temperatureFormulaCounts, inferTemperature(enrichment));
      addCounter(serviceShadeCounts, `${formula.service} → ${product.shade}`);

      flattened.push({
        formulaId: formula.key,
        stylist,
        year,
        client: formula.client,
        service: formula.service,
        brand: product.brand,
        series: product.series,
        shade: product.shade,
        grams: product.grams,
        cost: product.cost,
        enrichment,
        companionShades: shadesInFormula.filter((shade) => shade !== product.shade),
        companionBrands: brandsInFormula.filter((brand) => brand !== product.brand),
      });
    }
  }

  const shadeGroups = new Map();
  for (const item of flattened) {
    const key = shadeMapKey(item.brand, item.series, item.shade);
    if (!shadeGroups.has(key)) shadeGroups.set(key, []);
    shadeGroups.get(key).push(item);
  }

  const uniqueShades = [...shadeGroups.entries()]
    .map(([key, rows]) => summarizeShade(key, rows, formulas.length))
    .sort((a, b) => b.totalGrams - a.totalGrams || b.usageCount - a.usageCount);

  return {
    metadata: {
      stylist,
      year,
      generatedAt: new Date().toISOString(),
      rule: "Developers / oxidants are excluded. Analysis includes color shades, lighteners, mixers/correctors, and bond/color support products.",
    },
    totals: {
      formulas: formulas.length,
      productUsages: flattened.length,
      uniqueClients: clientSet.size,
      uniqueBrands: new Set(flattened.map((item) => item.brand).filter(Boolean)).size,
      uniqueSeries: new Set(flattened.map((item) => item.series).filter(Boolean)).size,
      uniqueShades: uniqueShades.length,
      multiBrandFormulas: multiBrandFormulaCount,
      multiBrandFormulaPct: formulas.length > 0 ? round((multiBrandFormulaCount / formulas.length) * 100, 1) : 0,
      multiShadeFormulas: multiShadeFormulaCount,
      multiShadeFormulaPct: formulas.length > 0 ? round((multiShadeFormulaCount / formulas.length) * 100, 1) : 0,
      totalColorGrams: round(flattened.reduce((sum, item) => sum + item.grams, 0)),
      totalColorCost: round(flattened.reduce((sum, item) => sum + item.cost, 0)),
    },
    stylistProfile: createStylistProfile(stylist, year, formulas, {
      topBrands: topEntries(brandGrams, 6),
      topSeries: topEntries(seriesGrams, 6),
      topFamilies: topEntries(familyFormulaCounts, 6),
      topServices: topEntries(serviceCounts, 6),
      multiBrandFormulaPct: formulas.length > 0 ? round((multiBrandFormulaCount / formulas.length) * 100, 1) : 0,
      multiShadeFormulaPct: formulas.length > 0 ? round((multiShadeFormulaCount / formulas.length) * 100, 1) : 0,
    }),
    marketIntelligence: {
      mostUsedBrands: topEntries(brandGrams, 12),
      mostUsedSeries: topEntries(seriesGrams, 12),
      mostUsedShades: topEntries(shadeGrams, 20),
      mostUsedShadeFamilies: topEntries(familyFormulaCounts, 12),
      mostUsedTemperatures: topEntries(temperatureFormulaCounts, 8),
      mostCommonServices: topEntries(serviceCounts, 12),
      mostCommonCrossBrandCombinations: topEntries(formulaBrandCombos, 15),
      mostCommonMultiShadeFormulas: topEntries(formulaShadeCombos, 15),
      mostCommonServiceToShadeRelationships: topEntries(serviceShadeCounts, 20),
      shadeTrendsByMonth: topEntries(monthFormulaCounts, 24),
    },
    uniqueShades,
    visualReferences: buildVisualReferences(uniqueShades),
  };
}

function createStylistProfile(stylist, year, formulas, stats) {
  const topService = stats.topServices[0]?.name || "Color services";
  const topFamily = stats.topFamilies[0]?.name || "Mixed color families";
  const topBrands = stats.topBrands.slice(0, 3).map((item) => item.name);
  const topSeries = stats.topSeries.slice(0, 4).map((item) => item.name);
  const serviceProfile = stats.topServices.slice(0, 5).map((item) => item.name);
  const primaryFocus =
    /highlight|toner|balayage|ombre/i.test(topService) ? "Blonde and lightening services" :
    /root|color/i.test(topService) ? "Color maintenance and coverage services" :
    topService;
  const signatureBehavior =
    stats.multiBrandFormulaPct >= 20
      ? "Frequent multi-brand formulation, suggesting practical product mixing across available color systems."
      : stats.multiShadeFormulaPct >= 60
        ? "Heavy multi-shade formulation, suggesting nuanced tone adjustment within services."
        : "Concentrated formulation behavior around a smaller set of repeatable color choices.";

  return {
    title: `${stylist} – ${year}`,
    primaryFocus,
    mostUsedBrands: topBrands,
    mostUsedSeries: topSeries,
    mostCommonShadeFamily: topFamily,
    serviceProfile,
    signatureBehavior,
    summary: `${stylist} in ${year} is primarily oriented around ${primaryFocus.toLowerCase()}, with ${topBrands.join(", ") || "multiple brands"} driving most recorded color usage.`,
    formulaCount: formulas.length,
  };
}

function brandReferenceFor(brand, series) {
  const text = `${normalize(brand)} ${normalize(series)}`;
  if (/L'OREAL|LOREAL|DIA|MAJIREL|INOA|LUO|BLOND STUDIO/.test(text)) return BRAND_REFERENCE["L'OREAL PROFESSIONNEL"];
  if (/SCHWARZKOPF|IGORA|VIBRANCE|CHROMA|BLONDME/.test(text)) return BRAND_REFERENCE.SCHWARZKOPF;
  if (/WELLA|COLOR TOUCH|BLONDOR|WELLOXON/.test(text)) return BRAND_REFERENCE.WELLA;
  if (/MATRIX|SOCOLOR|SO COLOR|SYNC|TONAL CONTROL/.test(text)) return BRAND_REFERENCE.MATRIX;
  if (/KEUNE|TINTA/.test(text)) return BRAND_REFERENCE.KEUNE;
  return {
    brandDisplay: brand || "Unknown brand",
    chartUrl: null,
    productReferenceUrl: null,
    visualNote: "No official visual reference attached yet. Review brand/product manually.",
  };
}

function buildVisualReferences(uniqueShades) {
  const combos = new Map();
  for (const shade of uniqueShades) {
    const key = `${shade.brand}|||${shade.series}`;
    if (!combos.has(key)) {
      const ref = brandReferenceFor(shade.brand, shade.series);
      combos.set(key, {
        brand: shade.brand,
        brandDisplay: ref.brandDisplay,
        series: shade.series,
        productTubeImage: null,
        packagingImage: null,
        officialColorChart: ref.chartUrl,
        productReferenceUrl: ref.productReferenceUrl,
        visualNote: ref.visualNote,
        shadeFamilyExamples: new Map(),
      });
    }
    const combo = combos.get(key);
    addCounter(combo.shadeFamilyExamples, shade.family || "Unknown", shade.totalGrams);
  }

  return [...combos.values()].map((combo) => ({
    ...combo,
    shadeFamilyExamples: topEntries(combo.shadeFamilyExamples, 8),
  }));
}

function reportToMarkdown(report) {
  const lines = [];
  const profile = report.stylistProfile;
  lines.push(`# ${profile.title}`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(profile.summary);
  lines.push("");
  lines.push(`- Formulas analyzed: ${report.totals.formulas}`);
  lines.push(`- Product/color usages analyzed: ${report.totals.productUsages}`);
  lines.push(`- Unique clients: ${report.totals.uniqueClients}`);
  lines.push(`- Unique brands: ${report.totals.uniqueBrands}`);
  lines.push(`- Unique series: ${report.totals.uniqueSeries}`);
  lines.push(`- Unique shades/products: ${report.totals.uniqueShades}`);
  lines.push(`- Multi-brand formulas: ${report.totals.multiBrandFormulaPct}%`);
  lines.push("");
  lines.push("## Stylist Profile");
  lines.push("");
  lines.push(`- Primary focus: ${profile.primaryFocus}`);
  lines.push(`- Most used brands: ${profile.mostUsedBrands.join(", ") || "n/a"}`);
  lines.push(`- Most used series: ${profile.mostUsedSeries.join(", ") || "n/a"}`);
  lines.push(`- Most common shade family: ${profile.mostCommonShadeFamily}`);
  lines.push(`- Service profile: ${profile.serviceProfile.join(", ") || "n/a"}`);
  lines.push(`- Signature behavior: ${profile.signatureBehavior}`);
  lines.push("");
  lines.push("## Market Intelligence");
  lines.push("");
  appendList(lines, "Most used brands", report.marketIntelligence.mostUsedBrands);
  appendList(lines, "Most used series", report.marketIntelligence.mostUsedSeries);
  appendList(lines, "Most used shade families", report.marketIntelligence.mostUsedShadeFamilies);
  appendList(lines, "Most common services", report.marketIntelligence.mostCommonServices);
  appendList(lines, "Cross-brand combinations", report.marketIntelligence.mostCommonCrossBrandCombinations);
  appendList(lines, "Service-to-shade relationships", report.marketIntelligence.mostCommonServiceToShadeRelationships.slice(0, 10));
  lines.push("## Top Shade Intelligence");
  lines.push("");
  for (const shade of report.uniqueShades.slice(0, 20)) {
    lines.push(`### ${shade.brand} / ${shade.series} / ${shade.shade}`);
    lines.push("");
    lines.push(`- Description: ${shade.humanDescription}`);
    lines.push(`- Family: ${shade.family || "Unknown"}`);
    lines.push(`- Temperature: ${shade.temperature}`);
    lines.push(`- Reflection: ${shade.reflection}`);
    lines.push(`- Usage count: ${shade.usageCount}`);
    lines.push(`- Formula count: ${shade.formulaCount}`);
    lines.push(`- Clients: ${shade.clientCount}`);
    lines.push(`- Most common services: ${shade.mostCommonServices.map((item) => item.name).join(", ") || "n/a"}`);
    lines.push(`- Companion shades: ${shade.mostCommonCompanionShades.map((item) => item.name).join(", ") || "n/a"}`);
    lines.push(`- Companion brands: ${shade.mostCommonCompanionBrands.map((item) => item.name).join(", ") || "n/a"}`);
    lines.push("");
  }
  lines.push("## Visual References");
  lines.push("");
  for (const ref of report.visualReferences.slice(0, 12)) {
    lines.push(`- ${ref.brandDisplay} / ${ref.series}: ${ref.officialColorChart || "manual reference needed"}`);
  }
  lines.push("");
  lines.push("## Method Note");
  lines.push("");
  lines.push(report.metadata.rule);
  lines.push("This dictionary is a market-intelligence layer generated from real salon usage behavior. It is not a manufacturer-certified technical chart.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function appendList(lines, title, items) {
  lines.push(`### ${title}`);
  lines.push("");
  if (items.length === 0) {
    lines.push("- n/a");
  } else {
    for (const item of items.slice(0, 10)) lines.push(`- ${item.name}: ${item.value}`);
  }
  lines.push("");
}

function buildAll() {
  const { rows, shadeMap, enrichments } = loadInputs();
  const formulas = groupFormulas(rows, enrichments);
  const byStylistYear = new Map();

  for (const formula of formulas) {
    const key = `${formula.stylist}|||${formula.year}`;
    if (!byStylistYear.has(key)) byStylistYear.set(key, []);
    byStylistYear.get(key).push(formula);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const reports = [];

  for (const [key, groupFormulasForReport] of [...byStylistYear.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const [stylist, year] = key.split("|||");
    const report = buildReport(stylist, Number(year), groupFormulasForReport);
    const baseName = `${slugify(stylist)}-${year}`;
    const jsonPath = path.join(OUTPUT_DIR, `${baseName}.json`);
    const markdownPath = path.join(OUTPUT_DIR, `${baseName}.md`);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    fs.writeFileSync(markdownPath, reportToMarkdown(report), "utf8");
    reports.push({
      stylist,
      year: Number(year),
      formulas: report.totals.formulas,
      productUsages: report.totals.productUsages,
      uniqueBrands: report.totals.uniqueBrands,
      uniqueSeries: report.totals.uniqueSeries,
      uniqueShades: report.totals.uniqueShades,
      multiBrandFormulaPct: report.totals.multiBrandFormulaPct,
      json: path.relative(path.resolve(__dirname, ".."), jsonPath),
      markdown: path.relative(path.resolve(__dirname, ".."), markdownPath),
    });
  }

  const index = {
    generatedAt: new Date().toISOString(),
    sourceRaw: path.relative(path.resolve(__dirname, ".."), RAW_FILE),
    sourceShadeMap: path.relative(path.resolve(__dirname, ".."), SHADE_MAP_FILE),
    outputDirectory: path.relative(path.resolve(__dirname, ".."), OUTPUT_DIR),
    rule: "Developers / oxidants are excluded from all analysis.",
    sourceShadeMapCoverage: shadeMap.summary,
    totals: {
      reports: reports.length,
      formulas: reports.reduce((sum, report) => sum + report.formulas, 0),
      productUsages: reports.reduce((sum, report) => sum + report.productUsages, 0),
    },
    reports,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), indexToMarkdown(index), "utf8");

  console.log(`Generated ${reports.length} stylist-year dictionary reports`);
  console.log(`Output: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  console.log(JSON.stringify(index.totals, null, 2));
}

function indexToMarkdown(index) {
  const lines = [];
  lines.push("# Color Intelligence Dictionary");
  lines.push("");
  lines.push("This output translates raw salon color formulas into a market-intelligence dictionary.");
  lines.push("");
  lines.push("Developers / oxidants are excluded from all analysis. Reports include actual color shades, lighteners, mixers/correctors, and bond/color support products.");
  lines.push("");
  lines.push("## Reports");
  lines.push("");
  for (const report of index.reports) {
    lines.push(`- ${report.stylist} – ${report.year}: ${report.formulas} formulas, ${report.productUsages} product usages, ${report.uniqueShades} unique shades/products`);
  }
  lines.push("");
  lines.push("## Final Goal");
  lines.push("");
  lines.push("Connect Brand → Series → Shade → Service → Stylist Behavior → Market Insight.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

buildAll();
