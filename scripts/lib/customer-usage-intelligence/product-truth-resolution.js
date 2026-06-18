"use strict";

const { normalizeText } = require("./contracts");

async function resolveFactsWithProductTruth(sql, facts) {
  const componentFacts = facts.filter((f) => f.factLevel === "formula_component");
  if (!sql || componentFacts.length === 0) return facts;

  const uniqueKeys = [...new Set(componentFacts.map((f) => f.normalizedProductKey || normalizeText(f.rawProductValue)).filter(Boolean))];
  const mappings = new Map();

  for (const key of uniqueKeys) {
    const rows = await sql`
      SELECT
        pim.id AS mapping_id,
        pim.canonical_product_id,
        pim.match_method,
        pim.confidence,
        cp.canonical_name,
        cp.primary_product_type,
        cp.color_tone_family,
        cp.color_tone_code,
        cp.color_depth_level,
        cm.display_name AS manufacturer_name,
        cm.canonical_name AS manufacturer_canonical_name,
        pl.canonical_name AS product_line_name,
        pf.canonical_name AS product_family_name
      FROM product_identity_mappings pim
      LEFT JOIN canonical_products cp ON cp.id = pim.canonical_product_id
      LEFT JOIN canonical_manufacturers cm ON cm.id = cp.manufacturer_id
      LEFT JOIN product_lines pl ON pl.id = cp.product_line_id
      LEFT JOIN product_families pf ON pf.id = cp.product_family_id
      WHERE pim.normalized_raw_name = ${key}
        AND pim.active = true
        AND pim.mapping_type NOT IN ('rejected_match', 'keep_separate')
      ORDER BY
        CASE pim.confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        pim.assigned_at DESC NULLS LAST
      LIMIT 5
    `;
    if (rows.length === 1) {
      mappings.set(key, { status: "resolved", row: rows[0] });
    } else if (rows.length > 1) {
      mappings.set(key, { status: "suggested", candidates: rows });
    }
  }

  return facts.map((fact) => {
    if (fact.factLevel !== "formula_component") return fact;
    const key = fact.normalizedProductKey || normalizeText(fact.rawProductValue);
    const match = mappings.get(key);
    if (!match) return { ...fact, resolutionStatus: "unresolved", confidence: "none" };
    if (match.status === "suggested") {
      return {
        ...fact,
        resolutionStatus: "suggested",
        confidence: "medium",
        resolutionCandidates: match.candidates.map((c) => c.canonical_product_id).filter(Boolean),
      };
    }
    const row = match.row;
    return {
      ...fact,
      canonicalProductId: row.canonical_product_id,
      resolutionStatus: "resolved",
      confidence: row.confidence || "medium",
      resolvedProduct: {
        mappingId: row.mapping_id,
        canonicalProductId: row.canonical_product_id,
        canonicalName: row.canonical_name,
        primaryProductType: row.primary_product_type,
        colorToneFamily: row.color_tone_family,
        colorToneCode: row.color_tone_code,
        colorDepthLevel: row.color_depth_level,
        manufacturerName: row.manufacturer_name || row.manufacturer_canonical_name,
        productLineName: row.product_line_name,
        productFamilyName: row.product_family_name,
        matchMethod: row.match_method,
      },
    };
  });
}

module.exports = {
  resolveFactsWithProductTruth,
};
