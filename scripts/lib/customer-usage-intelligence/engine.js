"use strict";

const {
  FACT_LEVELS,
  INSIGHT_ENGINE_VERSION,
  INSIGHT_TYPES,
  SERVICE_CLASSIFIER_VERSION,
  SUPPORT,
  makeId,
  normalizeText,
  stableLabel,
} = require("./contracts");

// ── Product-role classification ──────────────────────────────────────────────

const DEVELOPER_RE = /\b(developer|oxidant|oxydant|activator|peroxide)\b|\b\d+\s*vol\b|\b\d+(?:\.\d+)?\s*%\s*(?:vol|ox|dev|$)|\bחמצן\b/i;
const LIGHTENER_RE = /\b(bleach|lightener|blondor|decolorant|plex\s*bleach|haaraufheller|powder|poudre)\b/i;
const TREATMENT_RE = /\b(shampoo|conditioner|mask|treatment|serum|oil|keratin|botox|gloss\s*treatment|care|repair)\b/i;

function classifyProductRole(fact) {
  const raw = `${fact.rawProductValue || ""} ${fact.rawProductLine || ""}`.toLowerCase();
  const p = fact.resolvedProduct || {};
  const ptType = (p.primaryProductType || p.productType || fact.payload?.inferredProductType || "").toLowerCase();

  if (DEVELOPER_RE.test(raw) || ptType === "developer_oxidant" || ptType === "developer") return "developer";
  if (LIGHTENER_RE.test(raw) || ptType === "lightener" || ptType === "bleach") return "lightener";
  if (TREATMENT_RE.test(raw) || ptType === "treatment" || ptType === "shampoo" || ptType === "conditioner") return "treatment_accessory_other";
  if (ptType === "hair_color_shade" || ptType === "permanent_color" || ptType === "semi_permanent" || ptType === "demi_permanent" || ptType === "toner" || ptType === "color_shade_inferred") return "shade_color";
  if (raw.match(/^\d+[./,]\d+/) || raw.match(/\b\d{1,2}[./]\d{1,2}\b/)) return "shade_color";
  return "shade_color";
}

// ── Color-family mapping ─────────────────────────────────────────────────────

const COLOR_FAMILY_RULES = [
  { family: "Blonde", re: /\bblond|level\s*(9|10|11|12)|ultra\s*light|high\s*lift|\b(9|10|11|12)[./]\d/i },
  { family: "Brunette", re: /\bbrunett|level\s*(4|5|6|7)|medium|dark\s*brown|\b[4-7][./]\d/i },
  { family: "Copper", re: /\bcopper|cuivr|kupfer|\.\d*4\b|\b\d+[./]4/i },
  { family: "Red", re: /\bred|rouge|rot|mahogan|auburn|\.\d*6\b|\b\d+[./]6/i },
  { family: "Fashion", re: /\bfashion|vivid|neon|pastel|pink|violet|blue|green|turquoise|purple/i },
  { family: "Natural / Neutral", re: /\bnatural|neutral|base|clear|\.\d*0\b|\b\d+[./]0/i },
];

function detectColorFamily(fact) {
  const p = fact.resolvedProduct || {};
  if (p.colorToneFamily && p.colorToneFamily !== "Unknown") {
    const fam = p.colorToneFamily.toLowerCase();
    if (fam.includes("blond")) return "Blonde";
    if (fam.includes("brunett") || fam.includes("brown")) return "Brunette";
    if (fam.includes("copper") || fam.includes("cuivr")) return "Copper";
    if (fam.includes("red") || fam.includes("mahogan")) return "Red";
    if (fam.includes("fashion") || fam.includes("vivid")) return "Fashion";
    if (fam.includes("natural") || fam.includes("neutral")) return "Natural / Neutral";
  }

  const shade = `${fact.rawProductValue || ""} ${p.shadeCode || ""}`;
  for (const rule of COLOR_FAMILY_RULES) {
    if (rule.re.test(shade)) return rule.family;
  }

  const depthMatch = shade.match(/\b(\d{1,2})[./,]/);
  if (depthMatch) {
    const level = parseInt(depthMatch[1], 10);
    if (level >= 9) return "Blonde";
    if (level >= 4) return "Brunette";
    if (level >= 1) return "Dark";
  }

  return "Unresolved";
}

// ── Utilities ────────────────────────────────────────────────────────────────

function round(value, digits = 2) {
  const n = Number(value || 0);
  return Number(n.toFixed(digits));
}

function factsByLevel(facts, level) {
  return facts.filter((f) => f.factLevel === level);
}

function groupBy(rows, getKey) {
  const map = new Map();
  for (const row of rows) {
    const key = getKey(row) || "Unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

function sum(rows, getValue) {
  return rows.reduce((acc, row) => acc + (Number(getValue(row)) || 0), 0);
}

function pct(part, total) {
  if (!total) return 0;
  return round((part / total) * 100, 1);
}

function topFromMap(map, valueKey = "grams", limit = 10) {
  const totalGrams = [...map.values()].reduce((acc, rows) => acc + sum(rows, (r) => r.quantityGrams), 0);
  const totalRows = [...map.values()].reduce((acc, rows) => acc + rows.length, 0);
  return [...map.entries()]
    .map(([label, rows]) => {
      const grams = round(sum(rows, (r) => r.quantityGrams));
      return {
        label,
        usageRows: rows.length,
        formulas: new Set(rows.map((r) => r.formulaId).filter(Boolean)).size,
        services: new Set(rows.map((r) => r.serviceEventId).filter(Boolean)).size,
        clients: new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size,
        grams,
        shareByGrams: pct(grams, totalGrams),
        shareByRows: pct(rows.length, totalRows),
        value: valueKey === "rows" ? rows.length : grams,
      };
    })
    .sort((a, b) => b.value - a.value || b.usageRows - a.usageRows)
    .slice(0, limit);
}

function evidence(rows, limit = 20) {
  return rows.slice(0, limit).map((r) => ({
    factLevel: r.factLevel,
    factId: r.id,
    serviceEventId: r.serviceEventId,
    formulaId: r.formulaId,
    clientVisitId: r.clientVisitId,
    sourceRowIndex: r.sourceRowIndex,
  }));
}

function supportForQuantity(componentRows) {
  if (componentRows.length === 0) return SUPPORT.NOT_SUPPORTED;
  const withGrams = componentRows.filter((r) => Number(r.quantityGrams) > 0).length;
  if (withGrams === 0) return SUPPORT.NOT_SUPPORTED;
  return withGrams / componentRows.length >= 0.8 ? SUPPORT.SUPPORTED : SUPPORT.PARTIAL;
}

function enrichedProduct(fact) {
  const p = fact.resolvedProduct || {};
  return {
    brand: p.manufacturerName || p.brand || fact.rawBrand || "Unknown",
    line: p.productLineName || p.series || fact.rawProductLine || "Unknown",
    shade: p.shadeCode || p.displayShade || fact.rawProductValue || "Unknown",
    productType: p.primaryProductType || p.productType || fact.payload?.inferredProductType || "unknown",
  };
}

function item({ analysisRunId, insightType, order, title, summary, metricValue, metricUnit, definition, numerator, denominator, confidence, supportStatus, unresolvedEffect, rows, payload, businessHeadline, whyThisMatters }) {
  return {
    id: makeId("insight", `${analysisRunId}|${insightType}`),
    analysisRunId,
    insightType,
    title,
    summary,
    metricValue: metricValue == null ? null : round(metricValue, 4),
    metricUnit: metricUnit || null,
    calculationDefinition: definition,
    numerator: numerator == null ? null : round(numerator, 4),
    denominator: denominator == null ? null : round(denominator, 4),
    confidence: confidence || "medium",
    supportStatus,
    unresolvedDataEffect: unresolvedEffect,
    evidenceReferences: evidence(rows || []),
    drillDownReferences: evidence(rows || [], 50),
    payload: payload || {},
    displayOrder: order,
    businessHeadline: businessHeadline || title,
    whyThisMatters: whyThisMatters || "",
  };
}

// ── Insight builders ─────────────────────────────────────────────────────────

function buildMostUsedColorFamilies(ctx) {
  const shadeRows = ctx.shadeRows;
  const grouped = groupBy(shadeRows, (r) => r._colorFamily);
  const totalGrams = sum(shadeRows, (r) => r.quantityGrams);
  const chartData = [...grouped.entries()]
    .map(([family, rows]) => ({
      name: family,
      grams: round(sum(rows, (r) => r.quantityGrams)),
      share: pct(sum(rows, (r) => r.quantityGrams), totalGrams),
      formulas: new Set(rows.map((r) => r.formulaId)).size,
      services: new Set(rows.map((r) => r.serviceEventId)).size,
      clients: new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size,
    }))
    .sort((a, b) => b.grams - a.grams);

  const top = chartData[0];
  const headline = top ? `${top.name} dominates with ${top.share}% of color material usage` : "No color family data available";
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "most_used_color_families",
    order: 1,
    title: "Color Family Distribution",
    businessHeadline: headline,
    summary: top ? `${top.name} represents ${top.share}% of color usage by material weight, followed by ${chartData[1]?.name || "others"} at ${chartData[1]?.share || 0}%.` : "No supported color-family usage was detected.",
    whyThisMatters: "Color family distribution reveals salon specialization and primary manufacturer opportunities for blonde, brunette, and fashion color categories.",
    metricValue: top?.share || 0,
    metricUnit: "% of color usage",
    definition: "Groups shade-color products by tonal family (blonde, brunette, copper, red, fashion, natural/neutral). Developers, lighteners, and treatments are excluded.",
    numerator: top?.grams || 0,
    denominator: totalGrams,
    confidence: ctx.quantitySupport === SUPPORT.SUPPORTED ? "high" : "medium",
    supportStatus: shadeRows.length ? ctx.quantitySupport : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: shadeRows,
    payload: { chartData, topFamily: top?.name, topFamilyShare: top?.share },
  });
}

function buildTopShades(ctx) {
  const shadeRows = ctx.shadeRows;
  const grouped = groupBy(shadeRows, (r) => {
    const p = enrichedProduct(r);
    return [p.brand, p.line, p.shade].filter((s) => s && s !== "Unknown").join(" / ");
  });
  const totalGrams = sum(shadeRows, (r) => r.quantityGrams);
  const top = topFromMap(grouped, "grams", 20);
  const top20share = pct(top.reduce((s, t) => s + t.grams, 0), totalGrams);
  const headline = top.length ? `The top ${Math.min(20, top.length)} shades generate ${top20share}% of all color usage` : "No shade usage detected";

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "top_shades_by_usage",
    order: 2,
    title: "Most Used Shades",
    businessHeadline: headline,
    summary: top[0] ? `${top[0].label} is the most used shade with ${top[0].shareByGrams}% of material weight across ${top[0].formulas} formulas.` : "No shade-level usage was detected.",
    whyThisMatters: "A concentrated shade assortment reveals which specific products drive salon activity and where manufacturer distribution efforts have the highest ROI.",
    metricValue: top20share,
    metricUnit: "% concentrated in top 20",
    definition: "Ranks shade-color products only (developers, lighteners, and treatments excluded) by grams, formulas, services, and unique clients.",
    numerator: top.reduce((s, t) => s + t.grams, 0),
    denominator: totalGrams,
    confidence: shadeRows.length ? "high" : "none",
    supportStatus: shadeRows.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: shadeRows,
    payload: { topShades: top, top20share },
  });
}

function buildShadesByServiceType(ctx) {
  const shadeRows = ctx.shadeRows;
  const byService = {};
  for (const row of shadeRows) {
    const service = row.serviceType || "other";
    const p = enrichedProduct(row);
    const shade = [p.brand, p.line, p.shade].filter((s) => s && s !== "Unknown").join(" / ");
    byService[service] = byService[service] || {};
    byService[service][shade] = byService[service][shade] || { shade, usageRows: 0, grams: 0 };
    byService[service][shade].usageRows += 1;
    byService[service][shade].grams += Number(row.quantityGrams) || 0;
  }
  const chartData = Object.fromEntries(Object.entries(byService).map(([service, shades]) => [
    service,
    Object.values(shades).sort((a, b) => b.grams - a.grams || b.usageRows - a.usageRows).slice(0, 8),
  ]));
  const serviceNames = Object.keys(chartData);
  const headline = `Shade usage analyzed across ${serviceNames.length} service categories`;

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "shades_by_service_type",
    order: 3,
    title: "Shades by Service Type",
    businessHeadline: headline,
    summary: `Root/grey coverage, highlights, toner, and full color each show distinct shade preferences from natural base levels to cool high-lift blondes.`,
    whyThisMatters: "Understanding which shades are chosen for each service type helps manufacturers align product-line recommendations to real salon workflows.",
    metricValue: serviceNames.length,
    metricUnit: "service categories",
    definition: "Segments shade-color products by detected service context (root, highlights, toner, color, correction). Developers excluded from shade rankings.",
    numerator: serviceNames.length,
    denominator: ctx.serviceCount,
    confidence: "medium",
    supportStatus: shadeRows.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: shadeRows,
    payload: { byService: chartData },
  });
}

function buildBrandShare(ctx) {
  const byBrand = groupBy(ctx.components, (r) => enrichedProduct(r).brand);
  const totalWeight = sum(ctx.components, (r) => r.quantityGrams);
  const share = [...byBrand.entries()].map(([brand, rows]) => {
    const grams = round(sum(rows, (r) => r.quantityGrams));
    return {
      brand,
      shareByMaterialWeight: pct(grams, totalWeight),
      shareByFormulas: pct(new Set(rows.map((r) => r.formulaId)).size, ctx.formulaCount),
      shareByServices: pct(new Set(rows.map((r) => r.serviceEventId)).size, ctx.serviceCount),
      shareByClients: pct(new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size, ctx.clientCount),
      grams,
      formulas: new Set(rows.map((r) => r.formulaId)).size,
      services: new Set(rows.map((r) => r.serviceEventId)).size,
      clients: new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size,
    };
  }).sort((a, b) => (b.shareByMaterialWeight || 0) - (a.shareByMaterialWeight || 0));

  const top = share[0];
  const headline = top ? `${top.brand} represents ${top.shareByMaterialWeight}% of material usage but appears in ${top.shareByServices}% of services` : "Brand share unavailable";

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "brand_share_of_bowl",
    order: 4,
    title: "Brand Share of Bowl",
    businessHeadline: headline,
    summary: top ? `${top.brand} leads with ${top.shareByMaterialWeight}% by weight. ${share[1]?.brand || "Other"} follows at ${share[1]?.shareByMaterialWeight || 0}%.` : "Brand share could not be calculated.",
    whyThisMatters: "Weight share, formula presence, and client reach each tell a different story. A brand may dominate material weight but have limited client reach if concentrated in few formulas.",
    metricValue: top?.shareByMaterialWeight || 0,
    metricUnit: "% of material weight",
    definition: "Calculates brand share across material weight (grams), formula appearances, services, and unique clients separately.",
    numerator: top?.grams || 0,
    denominator: totalWeight || ctx.components.length,
    confidence: ctx.quantitySupport === SUPPORT.SUPPORTED ? "high" : "medium",
    supportStatus: ctx.components.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { brandShare: share },
  });
}

function buildCrossBrandMixing(ctx) {
  const formulaGroups = groupBy(ctx.components, (r) => r.formulaId);
  const serviceGroups = groupBy(ctx.components, (r) => r.serviceEventId);
  const visitGroups = groupBy(ctx.components, (r) => r.clientVisitId);
  const rate = (groups) => {
    const arr = [...groups.values()];
    const mixed = arr.filter((rows) => new Set(rows.map((r) => enrichedProduct(r).brand).filter(Boolean)).size > 1);
    return { mixed: mixed.length, total: arr.length, rate: round((mixed.length / Math.max(arr.length, 1)) * 100, 1) };
  };
  const sameFormula = rate(formulaGroups);
  const sameService = rate(serviceGroups);
  const sameVisit = rate(visitGroups);

  const brandCombos = {};
  for (const rows of formulaGroups.values()) {
    const brands = [...new Set(rows.map((r) => enrichedProduct(r).brand).filter(Boolean))].sort();
    if (brands.length >= 2) {
      const key = brands.slice(0, 2).join(" + ");
      brandCombos[key] = (brandCombos[key] || 0) + 1;
    }
  }
  const topCombos = Object.entries(brandCombos).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([combo, count]) => ({ combo, count }));

  const headline = `${sameFormula.rate}% of formulas combine products from more than one manufacturer`;
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "cross_brand_mixing",
    order: 5,
    title: "Cross-Brand Mixing",
    businessHeadline: headline,
    summary: `Same-formula mixing: ${sameFormula.rate}%. Same-service: ${sameService.rate}%. Same-visit: ${sameVisit.rate}%. Top combination: ${topCombos[0]?.combo || "N/A"}.`,
    whyThisMatters: "Cross-brand mixing reveals competitive dynamics: whether stylists are committed to one brand ecosystem or routinely combine products from multiple manufacturers.",
    metricValue: sameFormula.rate,
    metricUnit: "% same-formula cross-brand",
    definition: "Calculates same-formula, same-service, and same-visit cross-brand mixing separately. A toner from one brand and color from another in different stages is same-service mixing, not same-formula.",
    numerator: sameFormula.mixed,
    denominator: sameFormula.total,
    confidence: "high",
    supportStatus: ctx.formulaCount ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { sameFormula, sameService, sameVisit, topCombos },
  });
}

function buildProductLineAdoption(ctx) {
  const colorRows = ctx.shadeRows;
  const grouped = groupBy(colorRows, (r) => {
    const p = enrichedProduct(r);
    return [p.brand, p.line].filter((s) => s && s !== "Unknown").join(" / ");
  });
  const topLines = topFromMap(grouped, "grams", 15);
  const totalGrams = sum(colorRows, (r) => r.quantityGrams);
  const top3share = pct(topLines.slice(0, 3).reduce((s, l) => s + l.grams, 0), totalGrams);
  const headline = topLines.length >= 3 ? `Three product lines account for ${top3share}% of all professional color usage` : "Product-line adoption analysis";

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "product_line_adoption",
    order: 6,
    title: "Product-Line Adoption",
    businessHeadline: headline,
    summary: topLines[0] ? `${topLines[0].label} leads adoption with ${topLines[0].shareByGrams}% share across ${topLines[0].clients} clients.` : "No product-line adoption could be calculated.",
    whyThisMatters: "Distinguishing strong adoption from trial usage helps manufacturers identify which product lines have earned real loyalty vs. which are only being sampled.",
    metricValue: top3share,
    metricUnit: "% in top 3 lines",
    definition: "Ranks color product lines by grams, formulas, services, and repeat client usage. Developer and treatment lines are excluded.",
    numerator: topLines.slice(0, 3).reduce((s, l) => s + l.grams, 0),
    denominator: totalGrams,
    confidence: "medium",
    supportStatus: colorRows.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: colorRows,
    payload: { topProductLines: topLines, top3share },
  });
}

function buildFormulaComplexity(ctx) {
  const groups = [...groupBy(ctx.components, (r) => r.formulaId).values()];
  const sizes = groups.map((rows) => rows.length);
  const avg = sizes.length ? round(sizes.reduce((a, b) => a + b, 0) / sizes.length, 1) : 0;
  const buckets = {
    oneProduct: sizes.filter((n) => n === 1).length,
    twoProducts: sizes.filter((n) => n === 2).length,
    threePlusProducts: sizes.filter((n) => n >= 3).length,
  };
  const chartData = [
    { name: "1 product", value: buckets.oneProduct, share: pct(buckets.oneProduct, sizes.length) },
    { name: "2 products", value: buckets.twoProducts, share: pct(buckets.twoProducts, sizes.length) },
    { name: "3+ products", value: buckets.threePlusProducts, share: pct(buckets.threePlusProducts, sizes.length) },
  ];
  const headline = `Average formula uses ${avg} products per bowl`;

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "formula_complexity",
    order: 7,
    title: "Formula Complexity",
    businessHeadline: headline,
    summary: `${chartData[2].share}% of formulas use 3+ products, suggesting complex multi-step color work is common in this salon.`,
    whyThisMatters: "Higher formula complexity means more product per service, increasing consumption per visit and creating opportunities for complementary product placement.",
    metricValue: avg,
    metricUnit: "avg products per formula",
    definition: "Counts components per formula group. Includes all product types (color, developer, lightener) to show true bowl complexity.",
    numerator: sizes.reduce((a, b) => a + b, 0),
    denominator: sizes.length,
    confidence: "high",
    supportStatus: ctx.formulaCount ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { buckets, chartData, averageComplexity: avg },
  });
}

function buildDeveloperBehavior(ctx) {
  const developerRows = ctx.developerRows;
  const totalDevGrams = sum(developerRows, (r) => r.quantityGrams);
  const byStrength = groupBy(developerRows, (r) => {
    const text = `${r.rawProductValue || ""} ${r.rawProductLine || ""}`;
    const pctMatch = text.match(/\b(\d+(?:\.\d+)?)\s*%/);
    const volMatch = text.match(/\b(\d+)\s*vol\b/i);
    if (pctMatch) return `${pctMatch[1]}%`;
    if (volMatch) return `${volMatch[1]} Vol`;
    return "Unknown strength";
  });
  const chartData = [...byStrength.entries()]
    .map(([strength, rows]) => ({
      name: strength,
      grams: round(sum(rows, (r) => r.quantityGrams)),
      share: pct(sum(rows, (r) => r.quantityGrams), totalDevGrams),
      formulas: new Set(rows.map((r) => r.formulaId)).size,
    }))
    .sort((a, b) => b.grams - a.grams);

  const top = chartData[0];
  const headline = top ? `${top.name} is the dominant developer strength, representing ${top.share}% of developer usage` : "Developer behavior not available";

  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "developer_behavior",
    order: 8,
    title: "Developer Behavior",
    businessHeadline: headline,
    summary: top ? `${top.name} accounts for ${top.share}% of developer grams across ${top.formulas} formulas. ${chartData[1]?.name || "Other"} follows at ${chartData[1]?.share || 0}%.` : "Developer behavior is not supported by this dataset.",
    whyThisMatters: "Developer distribution reveals the salon's processing preferences and indicates whether services lean toward gentle deposit-only work or higher-lift transformations.",
    metricValue: top?.share || 0,
    metricUnit: "% dominant strength",
    definition: "Groups developer/oxidant components by concentration. Presented here, never in shade or color-family rankings.",
    numerator: top?.grams || 0,
    denominator: totalDevGrams,
    confidence: developerRows.length ? "high" : "none",
    supportStatus: developerRows.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: developerRows,
    payload: { chartData, totalDeveloperGrams: totalDevGrams },
  });
}

function buildClientJourney(ctx) {
  const shadeRows = ctx.shadeRows.filter((r) => r.pseudonymousClientId);
  const byClient = groupBy(shadeRows, (r) => r.pseudonymousClientId);
  const journeys = [...byClient.entries()].map(([clientId, rows]) => {
    const sorted = rows.slice().sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
    const visits = [...groupBy(sorted, (r) => r.clientVisitId).entries()].map(([visitId, visitRows]) => ({
      visitId,
      date: visitRows[0]?.eventDate || null,
      serviceTypes: [...new Set(visitRows.map((r) => r.serviceType))],
      formulas: [...new Set(visitRows.map((r) => r.formulaId))].length,
      detectedShades: [...new Set(visitRows.map((r) => enrichedProduct(r).shade).filter(Boolean))].slice(0, 8),
      colorFamily: visitRows[0]?._colorFamily || "Unknown",
    }));
    return { clientId, visits, transitionCount: Math.max(visits.length - 1, 0) };
  }).filter((j) => j.visits.length > 1).sort((a, b) => b.visits.length - a.visits.length).slice(0, 25);

  const headline = journeys.length ? `${journeys.length} clients show detectable shade journeys across repeat visits` : "Client journeys require repeat-visit data";
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "client_shade_journey",
    order: 9,
    title: "Client Shade Journey",
    businessHeadline: headline,
    summary: journeys.length ? `${journeys.length} pseudonymous clients show formula transitions over time. Identity is based on exact normalized name within the same profile.` : "Client journeys are not supported by this dataset.",
    whyThisMatters: "Client journeys reveal whether the salon's clientele is shifting toward lighter, cooler, or more complex formulas over time — key intelligence for predicting future product demand.",
    metricValue: journeys.length,
    metricUnit: "client journeys detected",
    definition: "Connects visits by exact normalized client identity within the same profile. Describes formula movement, not guaranteed visible hair outcome.",
    numerator: journeys.length,
    denominator: ctx.clientCount,
    confidence: journeys.length ? "medium" : "none",
    supportStatus: journeys.length ? SUPPORT.PARTIAL : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: shadeRows,
    payload: { journeys },
  });
}

function buildTrends(ctx) {
  const shadeRows = ctx.shadeRows;
  const monthKey = (date) => date ? date.slice(0, 7) : "unknown";
  const byMonth = [...groupBy(shadeRows, (r) => monthKey(r.eventDate)).entries()].map(([month, rows]) => {
    const groups = [...groupBy(rows, (r) => r.formulaId).values()];
    const mixed = groups.filter((g) => new Set(g.map((r) => enrichedProduct(r).brand)).size > 1).length;
    return {
      month,
      services: new Set(rows.map((r) => r.serviceEventId)).size,
      formulas: new Set(rows.map((r) => r.formulaId)).size,
      grams: round(sum(rows, (r) => r.quantityGrams)),
      brands: new Set(rows.map((r) => enrichedProduct(r).brand)).size,
      crossBrandRate: round((mixed / Math.max(groups.length, 1)) * 100, 1),
      blondeShare: pct(rows.filter((r) => r._colorFamily === "Blonde").length, rows.length),
      brunetteShare: pct(rows.filter((r) => r._colorFamily === "Brunette").length, rows.length),
    };
  }).sort((a, b) => a.month.localeCompare(b.month));

  let trendNote = "";
  if (byMonth.length >= 2) {
    const first = byMonth[0];
    const last = byMonth[byMonth.length - 1];
    if (last.blondeShare > first.blondeShare + 5) trendNote = "Blonde usage is trending upward.";
    else if (last.brunetteShare > first.brunetteShare + 5) trendNote = "Brunette usage is trending upward.";
    else trendNote = "Color family distribution is stable across the period.";
  }

  const headline = byMonth.length > 1 ? `${byMonth.length} months of trend data available` : "Trend analysis needs more than one month";
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "trends_over_time",
    order: 10,
    title: "Trends Over Time",
    businessHeadline: headline,
    summary: byMonth.length > 1 ? `${trendNote} Cross-brand mixing moved from ${byMonth[0]?.crossBrandRate || 0}% to ${byMonth[byMonth.length - 1]?.crossBrandRate || 0}% over the period.` : "Trend analysis needs more than one date period.",
    whyThisMatters: "Month-over-month changes in color direction, brand share, and mixing behavior signal market shifts that manufacturers can act on before competitors.",
    metricValue: byMonth.length,
    metricUnit: "months tracked",
    definition: "Aggregates shade-color components by month for color-family trends, brand share movement, and cross-brand mixing changes.",
    numerator: byMonth.length,
    denominator: shadeRows.length,
    confidence: byMonth.length > 1 ? "medium" : "low",
    supportStatus: byMonth.length > 1 ? SUPPORT.SUPPORTED : SUPPORT.PARTIAL,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: shadeRows,
    payload: { monthlyTrends: byMonth },
  });
}

function buildUnsupportedInventoryNote(analysisRunId) {
  return {
    id: makeId("insight", `${analysisRunId}|unsupported_inventory_purchase_metrics`),
    analysisRunId,
    insightType: "unsupported_inventory_purchase_metrics",
    title: "Inventory & Purchasing",
    businessHeadline: "Inventory and purchasing metrics are not available from usage data alone",
    whyThisMatters: "",
    summary: "This report analyzes actual salon usage only. Purchased-vs-used, dead stock, stock-out predictions, and reorder recommendations require separate inventory datasets.",
    metricValue: null,
    metricUnit: null,
    calculationDefinition: "Guardrail: no inventory or purchasing metric is calculated from usage files.",
    numerator: null,
    denominator: null,
    confidence: "none",
    supportStatus: SUPPORT.NOT_SUPPORTED,
    unresolvedDataEffect: "Not related to resolution; source dataset does not contain inventory or purchasing facts.",
    evidenceReferences: [],
    drillDownReferences: [],
    payload: { excludedMetrics: ["products purchased vs used", "dead stock", "stock-out forecast", "reorder recommendations", "inventory turnover"] },
    displayOrder: 99,
  };
}

// ── Executive findings ───────────────────────────────────────────────────────

function buildExecutiveFindings(ctx, insightItems) {
  const findings = [];

  const colorFamilyItem = insightItems.find((i) => i.insightType === "most_used_color_families");
  if (colorFamilyItem?.payload?.topFamily) {
    findings.push(`${colorFamilyItem.payload.topFamily} represents ${colorFamilyItem.payload.topFamilyShare}% of color activity, making it the primary manufacturer opportunity.`);
  }

  const shadesItem = insightItems.find((i) => i.insightType === "top_shades_by_usage");
  if (shadesItem?.payload?.top20share) {
    findings.push(`The top 20 shade products generate ${shadesItem.payload.top20share}% of all color usage, indicating a concentrated core assortment.`);
  }

  const devItem = insightItems.find((i) => i.insightType === "developer_behavior");
  if (devItem?.payload?.chartData?.[0]) {
    findings.push(`${devItem.payload.chartData[0].name} is the dominant developer strength, representing ${devItem.payload.chartData[0].share}% of developer usage.`);
  }

  const mixItem = insightItems.find((i) => i.insightType === "cross_brand_mixing");
  if (mixItem?.metricValue) {
    findings.push(`${mixItem.metricValue}% of formulas combine products from more than one manufacturer, showing real cross-brand bowl behavior.`);
  }

  const trendsItem = insightItems.find((i) => i.insightType === "trends_over_time");
  if (trendsItem?.payload?.monthlyTrends?.length > 1) {
    const months = trendsItem.payload.monthlyTrends;
    const first = months[0];
    const last = months[months.length - 1];
    if (Math.abs(last.blondeShare - first.blondeShare) > 3) {
      const dir = last.blondeShare > first.blondeShare ? "increased" : "decreased";
      findings.push(`Blonde color usage ${dir} from ${first.blondeShare}% to ${last.blondeShare}% over the reporting period.`);
    }
  }

  return findings.slice(0, 5);
}

// ── Main packet builder ──────────────────────────────────────────────────────

function buildInsightPacket({ analysisRunId, uploadIds, organizationId, customerAccountId, salonId, parserProfileId, parsed, resolvedFacts, productTruthVersion = "live", reportStatus = "draft" }) {
  const components = factsByLevel(resolvedFacts, FACT_LEVELS.FORMULA_COMPONENT);

  // Classify product roles and attach color family
  for (const fact of components) {
    fact._productRole = classifyProductRole(fact);
    fact._colorFamily = fact._productRole === "shade_color" ? detectColorFamily(fact) : null;
  }

  const shadeRows = components.filter((f) => f._productRole === "shade_color");
  const developerRows = components.filter((f) => f._productRole === "developer");

  const unresolvedRecords = components
    .filter((f) => f.resolutionStatus !== "resolved")
    .map((f) => ({
      id: makeId("unresolved", `${analysisRunId}|${f.id}`),
      sourceRowIndex: f.sourceRowIndex,
      rawProductName: [f.rawBrand, f.rawProductLine, f.rawProductValue].filter(Boolean).join(" / "),
      normalizedRawName: f.normalizedProductKey || normalizeText(f.rawProductValue),
      reason: f.resolutionStatus === "suggested" ? "suggested_match_requires_review" : "unresolved_product_truth_match",
      effect: "Included in usage counts under raw fallback buckets; precision may be reduced.",
      candidateCount: f.resolutionCandidates?.length || 0,
      payload: { serviceEventId: f.serviceEventId, formulaId: f.formulaId },
    }));
  const resolvedCount = components.filter((f) => f.resolutionStatus === "resolved").length;
  const unresolvedCount = unresolvedRecords.length;
  const unresolvedEffect = unresolvedCount
    ? `${unresolvedCount} rows used raw fallback classification.`
    : "All rows fully resolved against Product Truth.";
  const quantitySupport = supportForQuantity(components);
  const serviceCount = new Set(resolvedFacts.filter((f) => f.factLevel === FACT_LEVELS.SERVICE).map((f) => f.serviceEventId)).size;
  const formulaCount = new Set(components.map((f) => f.formulaId)).size;
  const visitCount = new Set(resolvedFacts.filter((f) => f.factLevel === FACT_LEVELS.CLIENT_VISIT).map((f) => f.clientVisitId)).size;
  const clientCount = new Set(components.map((f) => f.pseudonymousClientId).filter(Boolean)).size;
  const brandCount = new Set(components.map((f) => enrichedProduct(f).brand).filter(Boolean)).size;
  const colorFamilyCount = new Set(shadeRows.map((f) => f._colorFamily).filter(Boolean)).size;

  const ctx = {
    analysisRunId,
    components,
    shadeRows,
    developerRows,
    serviceCount,
    formulaCount,
    visitCount,
    clientCount,
    quantitySupport,
    unresolvedEffect,
  };

  const insightItems = [
    buildMostUsedColorFamilies(ctx),
    buildTopShades(ctx),
    buildShadesByServiceType(ctx),
    buildBrandShare(ctx),
    buildCrossBrandMixing(ctx),
    buildProductLineAdoption(ctx),
    buildFormulaComplexity(ctx),
    buildDeveloperBehavior(ctx),
    buildClientJourney(ctx),
    buildTrends(ctx),
    buildUnsupportedInventoryNote(analysisRunId),
  ];

  const executiveFindings = buildExecutiveFindings(ctx, insightItems);

  const supportStatuses = Object.fromEntries(INSIGHT_TYPES.map((type) => [
    type,
    insightItems.find((i) => i.insightType === type)?.supportStatus || SUPPORT.NOT_SUPPORTED,
  ]));

  return {
    analysisRunId,
    uploadIds,
    organizationId: makeId("orgref", organizationId),
    customerAccountId: makeId("customerref", customerAccountId),
    salonId: makeId("salonref", salonId),
    pseudonymousCustomerLabel: stableLabel("Customer Account", customerAccountId),
    pseudonymousSalonLabel: stableLabel("Salon", salonId),
    productTruthVersion,
    serviceClassifierVersion: SERVICE_CLASSIFIER_VERSION,
    insightEngineVersion: INSIGHT_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    status: "completed",
    reportStatus,
    dateRange: parsed.summary.dateRange,
    sourceRowCount: parsed.summary.sourceRowCount,
    acceptedRowCount: parsed.summary.acceptedRowCount,
    rejectedRowCount: parsed.summary.rejectedRowCount,
    resolvedProductCount: resolvedCount,
    unresolvedProductCount: unresolvedCount,
    serviceCount,
    formulaCount,
    visitCount,
    clientCount,
    brandCount,
    colorFamilyCount,
    totalMaterialGrams: round(sum(components, (r) => r.quantityGrams)),
    executiveFindings,
    dataQuality: {
      warnings: parsed.dataQuality.warnings,
      parserProfileId,
      rowCounts: parsed.dataQuality.rowCounts,
    },
    supportStatuses,
    insightItems,
    unresolvedRecords,
  };
}

module.exports = {
  buildInsightPacket,
  buildUnsupportedInventoryNote,
  classifyProductRole,
  detectColorFamily,
};
