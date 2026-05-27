/**
 * scripts/lib/product-catalog/enrichment.js
 * ---------------------------------------------------------------
 * Automatic enrichment for rows that are missing critical fields
 * (barcodes, ILS, materialWeight, type). Two layers, in order of
 * cost:
 *
 *   1. Pattern-based deterministic guessing
 *      - If neighboring shades within the same brand+series have
 *        sequential EAN-13s (delta ≤ 16 in the trailing block),
 *        we predict the missing EAN by sequential interpolation
 *        and flag it with `low` confidence.
 *      - Cheapest layer; runs locally with no network.
 *
 *   2. LLM-based enrichment via OpenAI
 *      - One batch call per (brand, series) producing structured
 *        JSON for every row in that group at once.
 *      - Caching keyed by (brand, series, file-hash) so repeats
 *        are free.
 *      - Gracefully degrades when OPENAI_API_KEY is missing.
 *
 * The output is the same row shape extended with:
 *     enrichedFields: string[]
 *     enrichmentSources: CatalogEnrichmentSource[]
 *     _confidence: "high" | "medium" | "low"
 */

"use strict";

const {
  parseBarcodesField,
  stringifyBarcodes,
  isValidEan13,
  isValidBarcode,
} = require("./schema");

const cache = new Map();

function cacheKey({ brand, series, hash }) {
  return [brand || "", series || "", hash || ""].join("|");
}

/**
 * Deterministic pattern-based enrichment. Looks for sequential EAN
 * runs within the same brand+series and fills the gaps when the
 * surrounding values are dense and monotonic.
 */
function patternEnrich(rows) {
  const groups = groupByBrandSeries(rows);
  const filled = [];
  for (const [, list] of groups) {
    const codes = list
      .map((r) => parseBarcodesField(r.barcodes)[0])
      .map((c) => (c && /^\d{13}$/.test(c) && isValidEan13(c) ? c : null));

    // Find runs of valid EANs sharing the same 11-digit prefix.
    const prefixCounts = new Map();
    for (const c of codes) {
      if (!c) continue;
      const prefix = c.slice(0, 11);
      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
    }
    const dominantPrefix =
      [...prefixCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    if (!dominantPrefix || prefixCounts.get(dominantPrefix) < 3) {
      for (const r of list) filled.push({ ...r, _enrichedHere: false });
      continue;
    }

    const knownTails = new Set(
      codes
        .filter((c) => c && c.startsWith(dominantPrefix))
        .map((c) => parseInt(c.slice(11, 13), 10)),
    );

    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      const code = parseBarcodesField(row.barcodes)[0];
      if (code && /^\d{12,13}$/.test(code) && isValidBarcode(code)) {
        filled.push({ ...row, _enrichedHere: false });
        continue;
      }

      // Use the row's positional index inside the group to predict
      // a tail value when the surrounding rows have valid EANs.
      const prev = findNearbyValidEan(codes, i, -1);
      const next = findNearbyValidEan(codes, i, 1);
      let predicted = null;
      let reason = null;
      if (prev && next && prev.code.startsWith(dominantPrefix) && next.code.startsWith(dominantPrefix)) {
        const prevTail = parseInt(prev.code.slice(11, 13), 10);
        const nextTail = parseInt(next.code.slice(11, 13), 10);
        const delta = nextTail - prevTail;
        if (delta > 0 && delta <= 16 && delta === next.distance + prev.distance) {
          const candidateTail = prevTail + prev.distance;
          if (!knownTails.has(candidateTail)) {
            predicted = computeEan13(dominantPrefix + pad2(candidateTail));
            reason = `Sequential EAN run (${prev.code}→${next.code}); +${prev.distance} step.`;
          }
        }
      }

      if (predicted && isValidEan13(predicted)) {
        filled.push({
          ...row,
          barcodes: stringifyBarcodes([predicted]),
          enrichedFields: [...(row.enrichedFields || []), "barcodes"],
          enrichmentSources: [
            ...(row.enrichmentSources || []),
            {
              field: "barcodes",
              value: predicted,
              confidence: "low",
              domain: "pattern",
              reason,
            },
          ],
          _enrichedHere: true,
          _confidence: "low",
        });
      } else {
        filled.push({ ...row, _enrichedHere: false });
      }
    }
  }
  return filled;
}

function findNearbyValidEan(codes, idx, direction) {
  let distance = 0;
  for (
    let i = idx + direction;
    i >= 0 && i < codes.length;
    i += direction
  ) {
    distance += 1;
    if (codes[i] && isValidEan13(codes[i])) {
      return { code: codes[i], distance };
    }
  }
  return null;
}

/** Compute EAN-13 from any 13-digit string by replacing the check digit. */
function computeEan13(seed13) {
  if (!/^\d{13}$/.test(seed13)) return null;
  const digits = seed13.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  return seed13.slice(0, 12) + String(check);
}

function pad2(n) {
  const s = String(n);
  return s.length === 1 ? "0" + s : s;
}

function groupByBrandSeries(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.brand || ""}|${row.series || ""}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

/**
 * LLM-based enrichment. One batch call per brand+series. Returns a
 * map from rowKey → suggestion, e.g.
 *   { "MONTIBELLO::ECLAT::1-1": { ILS: 28, materialWeight: 60 } }
 *
 * Gracefully returns an empty map when OPENAI_API_KEY is not set.
 */
async function llmEnrich(rows, opts = {}) {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  const model = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) {
    return { suggestions: {}, calls: 0, sources: [] };
  }

  const groups = groupByBrandSeries(rows);
  const suggestions = {};
  const sources = [];
  let calls = 0;

  for (const [key, list] of groups) {
    const [brand, series] = key.split("|");
    if (!brand || !series) continue;

    const missing = list.filter((r) => isRowMissingCritical(r));
    if (missing.length === 0) continue;

    const cacheK = cacheKey({ brand, series, hash: opts.fileHash });
    if (cache.has(cacheK)) {
      const hit = cache.get(cacheK);
      Object.assign(suggestions, hit.suggestions);
      sources.push(...hit.sources);
      continue;
    }

    const prompt = buildLlmPrompt({ brand, series, rows: missing });
    let resp;
    try {
      resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 2000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a hair-care product catalog assistant. Reply ONLY with strict JSON. Never invent EAN-13 barcodes you have not seen on real product packaging.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });
    } catch (e) {
      sources.push({
        rowKey: `${brand}::${series}`,
        field: "llm_call",
        value: "",
        confidence: "low",
        reason: `LLM fetch failed: ${e.message}`,
      });
      continue;
    }

    calls += 1;
    if (!resp.ok) {
      sources.push({
        rowKey: `${brand}::${series}`,
        field: "llm_call",
        value: String(resp.status),
        confidence: "low",
        reason: `LLM HTTP ${resp.status}`,
      });
      continue;
    }
    const json = await resp.json();
    const raw = (json.choices?.[0]?.message?.content || "").trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      sources.push({
        rowKey: `${brand}::${series}`,
        field: "llm_call",
        value: "",
        confidence: "low",
        reason: "LLM returned non-JSON response",
      });
      continue;
    }
    const groupSuggestions = mergeSuggestions(parsed.rows, brand, series);
    const groupSources = collectSources(parsed.rows, brand, series);
    Object.assign(suggestions, groupSuggestions);
    sources.push(...groupSources);
    cache.set(cacheK, { suggestions: groupSuggestions, sources: groupSources });
  }

  return { suggestions, calls, sources };
}

function isRowMissingCritical(row) {
  return (
    parseBarcodesField(row.barcodes).length === 0 ||
    row.ILS == null ||
    row.materialWeight == null
  );
}

function buildLlmPrompt({ brand, series, rows }) {
  const list = rows
    .map((r, i) => `${i + 1}. shade=${r.shade} type=${r.type || "color"}`)
    .join("\n");
  return `Brand: ${brand}
Series: ${series}
Below is a list of catalog rows that are missing one or more of: barcodes (EAN-13), ILS price, material weight (grams).

For EACH row, return a structured suggestion. Schema:
{
  "rows": [
    {
      "shade": "string",
      "barcodes": ["13-digit string"] | [],
      "ILS": number | null,
      "materialWeight": number | null,
      "packingWeight": number | null,
      "confidence": "high" | "medium" | "low",
      "rationale": "string",
      "sources": [{"url":"string","domain":"string"}]
    }
  ]
}
Rules:
- Only fill barcodes you can verify from your training data; otherwise return [].
- Use ILS prices in the typical Israeli retail range for the brand.
- materialWeight is the active formula weight (e.g. 60 for a 60ml/60g tube).
- packingWeight is the tube/packaging size (e.g. 77 for a 77g pack).
- confidence reflects whether barcodes/prices are likely correct.
- sources should list any reference URLs you have, even if generic.

Rows:
${list}`;
}

function mergeSuggestions(rows, brand, series) {
  const map = {};
  if (!Array.isArray(rows)) return map;
  for (const r of rows) {
    if (!r || !r.shade) continue;
    const key = `${brand}::${series}::${normalizeKey(r.shade)}`;
    map[key] = {
      barcodes: Array.isArray(r.barcodes)
        ? r.barcodes.filter((b) => isValidBarcode(String(b)))
        : [],
      ILS: typeof r.ILS === "number" ? r.ILS : null,
      materialWeight: typeof r.materialWeight === "number" ? r.materialWeight : null,
      packingWeight: typeof r.packingWeight === "number" ? r.packingWeight : null,
      confidence: r.confidence === "high" || r.confidence === "low" ? r.confidence : "medium",
      rationale: r.rationale || "",
    };
  }
  return map;
}

function collectSources(rows, brand, series) {
  const out = [];
  if (!Array.isArray(rows)) return out;
  for (const r of rows) {
    if (!r || !r.shade) continue;
    const key = `${brand}::${series}::${normalizeKey(r.shade)}`;
    const fields = [];
    if (Array.isArray(r.barcodes) && r.barcodes.length) fields.push("barcodes");
    if (typeof r.ILS === "number") fields.push("ILS");
    if (typeof r.materialWeight === "number") fields.push("materialWeight");
    if (typeof r.packingWeight === "number") fields.push("packingWeight");
    const refs =
      Array.isArray(r.sources) && r.sources.length
        ? r.sources
        : [{ url: null, domain: "openai-completion" }];
    for (const f of fields) {
      for (const src of refs) {
        out.push({
          rowKey: key,
          field: f,
          value: f === "barcodes" ? (r.barcodes || []).join(",") : String(r[f]),
          confidence: r.confidence || "medium",
          domain: src.domain || null,
          url: src.url || null,
          reason: r.rationale || "",
        });
      }
    }
  }
  return out;
}

function normalizeKey(shade) {
  return String(shade)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[\.\/]/g, "-");
}

/**
 * Apply LLM suggestions to candidate rows that lack the relevant
 * fields. Never overwrites existing valid data.
 */
function applySuggestions(rows, suggestions, sources) {
  if (!suggestions || Object.keys(suggestions).length === 0) {
    return { rows, applied: 0 };
  }
  let applied = 0;
  const out = rows.map((row) => {
    const key = `${row.brand}::${row.series}::${normalizeKey(row.shade)}`;
    const sug = suggestions[key];
    if (!sug) return row;
    const enrichedFields = [...(row.enrichedFields || [])];
    let next = { ...row };

    if (parseBarcodesField(row.barcodes).length === 0 && sug.barcodes.length > 0) {
      next.barcodes = stringifyBarcodes(sug.barcodes);
      enrichedFields.push("barcodes");
      applied += 1;
    }
    if (next.ILS == null && sug.ILS != null) {
      next.ILS = sug.ILS;
      enrichedFields.push("ILS");
      applied += 1;
    }
    if (next.materialWeight == null && sug.materialWeight != null) {
      next.materialWeight = sug.materialWeight;
      enrichedFields.push("materialWeight");
      applied += 1;
    }
    if (next.packingWeight == null && sug.packingWeight != null) {
      next.packingWeight = sug.packingWeight;
      enrichedFields.push("packingWeight");
      applied += 1;
    }

    if (enrichedFields.length > 0) {
      next.enrichedFields = enrichedFields;
      next.enrichmentSources = [
        ...(row.enrichmentSources || []),
        ...(sources || []).filter((s) => s.rowKey === key),
      ];
      next._confidence = sug.confidence || "medium";
    }
    return next;
  });
  return { rows: out, applied };
}

function clearCache() {
  cache.clear();
}

module.exports = {
  patternEnrich,
  llmEnrich,
  applySuggestions,
  clearCache,
  isRowMissingCritical,
  computeEan13,
};
