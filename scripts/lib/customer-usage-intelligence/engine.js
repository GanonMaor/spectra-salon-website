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

const DEVELOPER_RE = /\b(developer|oxidant|oxydant|activator|vol|%)\b|חמצן/i;

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

function topFromMap(map, valueKey = "grams", limit = 10) {
  return [...map.entries()]
    .map(([label, rows]) => ({
      label,
      usageRows: rows.length,
      formulas: new Set(rows.map((r) => r.formulaId).filter(Boolean)).size,
      services: new Set(rows.map((r) => r.serviceEventId).filter(Boolean)).size,
      clients: new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size,
      grams: round(sum(rows, (r) => r.quantityGrams)),
      value: valueKey === "rows" ? rows.length : round(sum(rows, (r) => r.quantityGrams)),
    }))
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

function item({ analysisRunId, insightType, order, title, summary, metricValue, metricUnit, definition, numerator, denominator, confidence, supportStatus, unresolvedEffect, rows, payload }) {
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
  };
}

function enrichedProduct(fact) {
  const p = fact.resolvedProduct || {};
  return {
    brand: p.manufacturerName || p.brand || fact.rawBrand || "Unknown",
    line: p.productLineName || p.series || fact.rawProductLine || "Unknown",
    shade: p.shadeCode || p.displayShade || fact.rawProductValue || "Unknown",
    family: p.colorToneFamily || p.productFamilyName || p.primaryProductType || fact.serviceType || "Unknown",
    productType: p.primaryProductType || p.productType || fact.payload?.inferredProductType || "unknown",
  };
}

function buildMostUsedColorFamilies(ctx) {
  const components = ctx.components.filter((r) => !DEVELOPER_RE.test(`${r.rawProductValue || ""} ${r.rawProductLine || ""}`));
  const grouped = groupBy(components, (r) => enrichedProduct(r).family);
  const top = topFromMap(grouped, "grams");
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "most_used_color_families",
    order: 1,
    title: "Most Used Color Families",
    summary: top[0] ? `${top[0].label} is the leading detected family by material weight and formula usage.` : "No supported color-family usage was detected.",
    metricValue: top[0]?.grams || 0,
    metricUnit: "grams",
    definition: "Groups committed formula components by Product Truth color family or product type fallback, excluding developer-only rows.",
    numerator: top[0]?.grams || 0,
    denominator: sum(components, (r) => r.quantityGrams),
    confidence: ctx.quantitySupport === SUPPORT.SUPPORTED ? "high" : "medium",
    supportStatus: components.length ? ctx.quantitySupport : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: components,
    payload: { topFamilies: top },
  });
}

function buildTopShades(ctx) {
  const grouped = groupBy(ctx.components, (r) => {
    const p = enrichedProduct(r);
    return [p.brand, p.line, p.shade].filter(Boolean).join(" / ");
  });
  const top = topFromMap(grouped, "grams", 15);
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "top_shades_by_usage",
    order: 2,
    title: "Top Shades By Actual Usage",
    summary: top[0] ? `${top[0].label} is the top detected shade/material in committed formulas.` : "No shade-level usage was detected.",
    metricValue: top[0]?.usageRows || 0,
    metricUnit: "formula component rows",
    definition: "Ranks resolved and unresolved formula components by appearances, formulas, services, clients, and grams when available.",
    numerator: top[0]?.usageRows || 0,
    denominator: ctx.components.length,
    confidence: ctx.components.length ? "high" : "none",
    supportStatus: ctx.components.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { topShades: top },
  });
}

function buildShadesByServiceType(ctx) {
  const grouped = {};
  for (const row of ctx.components) {
    const service = row.serviceType || "other";
    const p = enrichedProduct(row);
    const shade = [p.brand, p.line, p.shade].filter(Boolean).join(" / ");
    grouped[service] = grouped[service] || {};
    grouped[service][shade] = grouped[service][shade] || { shade, usageRows: 0, grams: 0 };
    grouped[service][shade].usageRows += 1;
    grouped[service][shade].grams += Number(row.quantityGrams) || 0;
  }
  const byService = Object.fromEntries(Object.entries(grouped).map(([service, shades]) => [
    service,
    Object.values(shades).sort((a, b) => b.grams - a.grams || b.usageRows - a.usageRows).slice(0, 8),
  ]));
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "shades_by_service_type",
    order: 3,
    title: "Shades By Service Type",
    summary: "Shade usage is segmented by detected service context such as toner, highlights, root/grey coverage, color, and correction.",
    metricValue: Object.keys(byService).length,
    metricUnit: "service types",
    definition: "Uses parser service text and sheet context to classify each formula component by service type.",
    numerator: Object.keys(byService).length,
    denominator: ctx.serviceCount,
    confidence: "medium",
    supportStatus: ctx.components.length ? SUPPORT.PARTIAL : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { byService },
  });
}

function buildBrandShare(ctx) {
  const byBrand = groupBy(ctx.components, (r) => enrichedProduct(r).brand);
  const totalWeight = sum(ctx.components, (r) => r.quantityGrams);
  const share = [...byBrand.entries()].map(([brand, rows]) => ({
    brand,
    shareByUsageRows: round((rows.length / Math.max(ctx.components.length, 1)) * 100),
    shareByFormulaAppearances: round((new Set(rows.map((r) => r.formulaId)).size / Math.max(ctx.formulaCount, 1)) * 100),
    shareByServices: round((new Set(rows.map((r) => r.serviceEventId)).size / Math.max(ctx.serviceCount, 1)) * 100),
    shareByMaterialWeight: totalWeight > 0 ? round((sum(rows, (r) => r.quantityGrams) / totalWeight) * 100) : null,
    shareByUniqueClients: round((new Set(rows.map((r) => r.pseudonymousClientId).filter(Boolean)).size / Math.max(ctx.clientCount, 1)) * 100),
    grams: round(sum(rows, (r) => r.quantityGrams)),
  })).sort((a, b) => (b.shareByMaterialWeight || b.shareByUsageRows) - (a.shareByMaterialWeight || a.shareByUsageRows));
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "brand_share_of_bowl",
    order: 4,
    title: "Brand Share Of Bowl",
    summary: share[0] ? `${share[0].brand} leads the detected bowl share across available measures.` : "Brand share could not be calculated.",
    metricValue: share[0]?.shareByMaterialWeight ?? share[0]?.shareByUsageRows ?? 0,
    metricUnit: share[0]?.shareByMaterialWeight == null ? "% of rows" : "% of grams",
    definition: "Calculates brand share separately by rows, formula appearances, services, material weight, and unique clients. Weight share is only shown when grams exist.",
    numerator: share[0]?.grams || 0,
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
    return { mixed: mixed.length, total: arr.length, rate: round((mixed.length / Math.max(arr.length, 1)) * 100), examples: mixed.slice(0, 10).map((rows) => evidence(rows, 8)) };
  };
  const sameFormula = rate(formulaGroups);
  const sameService = rate(serviceGroups);
  const sameVisit = rate(visitGroups);
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "cross_brand_mixing",
    order: 5,
    title: "Cross-Brand Mixing",
    summary: `${sameFormula.rate}% of formulas use more than one detected brand; service and visit mixing are tracked separately.`,
    metricValue: sameFormula.rate,
    metricUnit: "% same-formula cross-brand",
    definition: "Calculates same-formula, same-service, and same-visit cross-brand mixing separately so different stages are not collapsed into one bowl.",
    numerator: sameFormula.mixed,
    denominator: sameFormula.total,
    confidence: "high",
    supportStatus: ctx.formulaCount ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { sameFormula, sameService, sameVisit },
  });
}

function buildProductLineAdoption(ctx) {
  const grouped = groupBy(ctx.components, (r) => {
    const p = enrichedProduct(r);
    return `${p.brand} / ${p.line}`;
  });
  const topLines = topFromMap(grouped, "grams", 15);
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "product_line_adoption",
    order: 6,
    title: "Product-Line Adoption",
    summary: topLines[0] ? `${topLines[0].label} has the strongest detected adoption in this report.` : "No product-line adoption could be calculated.",
    metricValue: topLines.length,
    metricUnit: "product lines",
    definition: "Counts formulas, services, unique clients, grams, and repeat appearances by detected Product Truth product line.",
    numerator: topLines.length,
    denominator: ctx.components.length,
    confidence: "medium",
    supportStatus: ctx.components.length ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { topProductLines: topLines },
  });
}

function buildFormulaComplexity(ctx) {
  const groups = [...groupBy(ctx.components, (r) => r.formulaId).values()];
  const sizes = groups.map((rows) => rows.length);
  const avg = sizes.length ? round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0;
  const buckets = {
    oneProduct: sizes.filter((n) => n === 1).length,
    twoProducts: sizes.filter((n) => n === 2).length,
    threePlusProducts: sizes.filter((n) => n >= 3).length,
  };
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "formula_complexity",
    order: 7,
    title: "Formula Complexity",
    summary: `Average detected formula complexity is ${avg} products per formula.`,
    metricValue: avg,
    metricUnit: "products per formula",
    definition: "Counts formula component rows under each parser-proven formula group.",
    numerator: sizes.reduce((a, b) => a + b, 0),
    denominator: sizes.length,
    confidence: "high",
    supportStatus: ctx.formulaCount ? SUPPORT.SUPPORTED : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { buckets },
  });
}

function buildDeveloperBehavior(ctx) {
  const developerRows = ctx.components.filter((r) => DEVELOPER_RE.test(`${r.rawProductValue || ""} ${r.rawProductLine || ""} ${enrichedProduct(r).productType}`));
  const byStrength = groupBy(developerRows, (r) => {
    const text = `${r.rawProductValue || ""} ${r.rawProductLine || ""}`;
    const pct = text.match(/\b\d+(?:\.\d+)?\s*%/);
    const vol = text.match(/\b\d+\s*vol\b/i);
    return pct?.[0] || vol?.[0] || "unknown strength";
  });
  const topStrengths = topFromMap(byStrength, "grams", 12);
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "developer_behavior",
    order: 8,
    title: "Developer Behavior",
    summary: developerRows.length ? "Developer concentration usage is detected and separated from shade identity." : "Developer behavior is not supported by this dataset.",
    metricValue: developerRows.length,
    metricUnit: "developer rows",
    definition: "Detects developer/oxidant components and groups by percent or volume tokens where present.",
    numerator: developerRows.length,
    denominator: ctx.components.length,
    confidence: developerRows.length ? "medium" : "none",
    supportStatus: developerRows.length ? SUPPORT.PARTIAL : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: developerRows,
    payload: { topStrengths },
  });
}

function buildClientJourney(ctx) {
  const byClient = groupBy(ctx.components.filter((r) => r.pseudonymousClientId), (r) => r.pseudonymousClientId);
  const journeys = [...byClient.entries()].map(([clientId, rows]) => {
    const sorted = rows.slice().sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
    const visits = [...groupBy(sorted, (r) => r.clientVisitId).entries()].map(([visitId, visitRows]) => ({
      visitId,
      date: visitRows[0]?.eventDate || null,
      serviceTypes: [...new Set(visitRows.map((r) => r.serviceType))],
      formulas: [...new Set(visitRows.map((r) => r.formulaId))].length,
      detectedShades: [...new Set(visitRows.map((r) => enrichedProduct(r).shade).filter(Boolean))].slice(0, 8),
    }));
    return {
      clientId,
      identityMethod: "normalized_exact_name_within_same_profile",
      clientIdentityConfidence: "medium",
      visits,
      transitionCount: Math.max(visits.length - 1, 0),
      transitionLabel: visits.length > 1 ? "Detected formula and shade journey across repeat visits." : "Single detected visit.",
    };
  }).filter((j) => j.visits.length > 0).sort((a, b) => b.visits.length - a.visits.length).slice(0, 25);
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "client_shade_journey",
    order: 9,
    title: "Client Shade Journey",
    summary: journeys.length ? `${journeys.length} pseudonymous client journeys are available with medium identity confidence.` : "Client journeys are not supported by this dataset.",
    metricValue: journeys.length,
    metricUnit: "pseudonymous journeys",
    definition: "Connects visits only by exact normalized client identity within the same profile; describes formula movement, not guaranteed visible hair outcome.",
    numerator: journeys.length,
    denominator: ctx.clientCount,
    confidence: journeys.length ? "medium" : "none",
    supportStatus: journeys.length ? SUPPORT.PARTIAL : SUPPORT.NOT_SUPPORTED,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components.filter((r) => r.pseudonymousClientId),
    payload: { journeys },
  });
}

function buildTrends(ctx) {
  const monthKey = (date) => date ? date.slice(0, 7) : "unknown";
  const byMonth = [...groupBy(ctx.components, (r) => monthKey(r.eventDate)).entries()].map(([month, rows]) => ({
    month,
    services: new Set(rows.map((r) => r.serviceEventId)).size,
    formulas: new Set(rows.map((r) => r.formulaId)).size,
    grams: round(sum(rows, (r) => r.quantityGrams)),
    brands: new Set(rows.map((r) => enrichedProduct(r).brand)).size,
    crossBrandFormulaRate: (() => {
      const groups = [...groupBy(rows, (r) => r.formulaId).values()];
      const mixed = groups.filter((g) => new Set(g.map((r) => enrichedProduct(r).brand)).size > 1).length;
      return round((mixed / Math.max(groups.length, 1)) * 100);
    })(),
  })).sort((a, b) => a.month.localeCompare(b.month));
  return item({
    analysisRunId: ctx.analysisRunId,
    insightType: "trends_over_time",
    order: 10,
    title: "Trends Over Time",
    summary: byMonth.length > 1 ? `${byMonth.length} time periods are available for trend detection.` : "Trend analysis needs more than one date period.",
    metricValue: byMonth.length,
    metricUnit: "periods",
    definition: "Aggregates committed formula components by month for service mix, product-line adoption, brand share, and cross-brand usage trends.",
    numerator: byMonth.length,
    denominator: ctx.components.length,
    confidence: byMonth.length > 1 ? "medium" : "low",
    supportStatus: byMonth.length > 1 ? SUPPORT.SUPPORTED : SUPPORT.PARTIAL,
    unresolvedEffect: ctx.unresolvedEffect,
    rows: ctx.components,
    payload: { monthlyTrends: byMonth },
  });
}

function buildUnsupportedInventoryNote(analysisRunId) {
  return {
    id: makeId("insight", `${analysisRunId}|unsupported_inventory_purchase_metrics`),
    analysisRunId,
    insightType: "unsupported_inventory_purchase_metrics",
    title: "Inventory And Purchasing Claims Excluded",
    summary: "This report intentionally excludes purchased-versus-used, dead stock, stock-out forecasting, reorder, and inventory turnover claims because those datasets were not uploaded.",
    metricValue: null,
    metricUnit: null,
    calculationDefinition: "Guardrail note only; no inventory or purchasing metric is calculated from usage files.",
    numerator: null,
    denominator: null,
    confidence: "none",
    supportStatus: SUPPORT.NOT_SUPPORTED,
    unresolvedDataEffect: "Not related to Product Truth resolution; source dataset does not contain inventory or purchasing facts.",
    evidenceReferences: [],
    drillDownReferences: [],
    payload: { excludedMetrics: ["products purchased vs used", "dead stock", "stock-out forecast", "reorder recommendations", "inventory turnover"] },
    displayOrder: 99,
  };
}

function buildInsightPacket({ analysisRunId, uploadIds, organizationId, customerAccountId, salonId, parserProfileId, parsed, resolvedFacts, productTruthVersion = "live", reportStatus = "draft" }) {
  const components = factsByLevel(resolvedFacts, FACT_LEVELS.FORMULA_COMPONENT);
  const unresolvedRecords = components
    .filter((f) => f.resolutionStatus !== "resolved")
    .map((f) => ({
      id: makeId("unresolved", `${analysisRunId}|${f.id}`),
      sourceRowIndex: f.sourceRowIndex,
      rawProductName: [f.rawBrand, f.rawProductLine, f.rawProductValue].filter(Boolean).join(" / "),
      normalizedRawName: f.normalizedProductKey || normalizeText(f.rawProductValue),
      reason: f.resolutionStatus === "suggested" ? "suggested_match_requires_review" : "unresolved_product_truth_match",
      effect: "Included in usage counts under raw fallback buckets; Product Truth-specific family/line/shade precision may be reduced.",
      candidateCount: f.resolutionCandidates?.length || 0,
      payload: { serviceEventId: f.serviceEventId, formulaId: f.formulaId },
    }));
  const resolvedCount = components.filter((f) => f.resolutionStatus === "resolved").length;
  const unresolvedCount = unresolvedRecords.length;
  const unresolvedEffect = unresolvedCount
    ? `${unresolvedCount} component rows used raw fallback buckets where Product Truth resolution was unavailable.`
    : "No unresolved Product Truth rows materially affect this insight.";
  const quantitySupport = supportForQuantity(components);
  const serviceCount = new Set(resolvedFacts.filter((f) => f.factLevel === FACT_LEVELS.SERVICE).map((f) => f.serviceEventId)).size;
  const formulaCount = new Set(components.map((f) => f.formulaId)).size;
  const visitCount = new Set(resolvedFacts.filter((f) => f.factLevel === FACT_LEVELS.CLIENT_VISIT).map((f) => f.clientVisitId)).size;
  const clientCount = new Set(components.map((f) => f.pseudonymousClientId).filter(Boolean)).size;
  const ctx = {
    analysisRunId,
    components,
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
  const supportStatuses = Object.fromEntries(INSIGHT_TYPES.map((type) => [
    type,
    insightItems.find((item) => item.insightType === type)?.supportStatus || SUPPORT.NOT_SUPPORTED,
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
};
