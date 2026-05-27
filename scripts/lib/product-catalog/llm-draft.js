/**
 * scripts/lib/product-catalog/llm-draft.js
 * ---------------------------------------------------------------
 * LLM classifier that turns ambiguous customer-request bullets into
 * structured product candidate rows.
 *
 * Cost discipline:
 *   - Only invoked for bullets that the deterministic parser
 *     could NOT resolve to explicit shades.
 *   - One call per request (all unresolved bullets in a single
 *     prompt) so we never make many small LLM calls.
 *   - When OPENAI_API_KEY is missing, this module is a no-op and
 *     leaves the deterministic anchor rows in place.
 *
 * The classifier is asked to enumerate distinct product variants
 * mentioned in each bullet (brand, series, shade) but is explicitly
 * forbidden from inventing barcodes or prices — those come from the
 * separate web-enrichment step that runs only on operator confirmation.
 */

"use strict";

const { normalizeBrand, normalizeSeries, normalizeShade, rowKey } =
  require("./normalizer");
const { stringifyBarcodes } = require("./schema");

const DEFAULT_MODEL = process.env.OPENAI_LLM_DRAFT_MODEL ||
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT =
  "You are a hair-care catalog classifier. Reply ONLY with strict JSON. " +
  "Never invent EAN-13 barcodes, prices, or material weights — those will be " +
  "filled later. Your only job is to enumerate distinct hair product variants " +
  "(brand + product line + shade or variant name) referenced in each input bullet.";

function buildPrompt(bullets) {
  const numbered = bullets
    .map((b, i) => `${i + 1}. ${String(b).slice(0, 400)}`)
    .join("\n");
  return `Customer bullets that the deterministic parser could not fully resolve:

${numbered}

For each bullet, list every distinct product variant the customer is asking about.

Schema:
{
  "bullets": [
    {
      "input_index": 1,
      "rows": [
        {
          "brand": "UPPERCASE BRAND",
          "series": "UPPERCASE PRODUCT LINE",
          "shade": "shade name OR shade code AS PRINTED",
          "type": "color | toner | developer | direct-dye | bleach | treatment | unknown",
          "service_context": "color | toner | pre-toner | developer | direct-dye | unknown",
          "quick_add": true | false,
          "rationale": "string"
        }
      ]
    }
  ]
}

Rules:
- If the bullet says "all <foo>", you may list the typical visible variants you are sure of.
- If the bullet only mentions a brand without specific variants, return ONE row with shade="".
- Use uppercase for brand and series so they match canonical DB spelling.
- DO NOT include any field other than the schema above. Specifically: NO barcodes, NO prices.`;
}

async function callOpenAI({ apiKey, model, prompt, timeoutMs, fetchImpl }) {
  if (!apiKey) return { ok: false, reason: "no_api_key" };
  const fetchFn = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!fetchFn) return { ok: false, reason: "fetch_unavailable" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetchFn("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!resp.ok) return { ok: false, reason: `http_${resp.status}` };
    const json = await resp.json();
    const raw = (json.choices?.[0]?.message?.content || "").trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, reason: "non_json", raw };
    }
    return { ok: true, parsed, raw };
  } catch (err) {
    return {
      ok: false,
      reason: err && err.message ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function makeDraftRow({ brand, series, shade, type, serviceContext, quickAdd, rationale, bullet }) {
  const row = {
    productId: null,
    brand: normalizeBrand(brand || ""),
    series: normalizeSeries(series || ""),
    familyShade: null,
    shade: normalizeShade(shade || "").canonical,
    image: null,
    catalogNo: null,
    hairColor: null,
    type: type || null,
    packingWeight: null,
    materialWeight: null,
    barcodes: stringifyBarcodes([]),
    ILS: null,
    _sourceFile: "request_text",
    _sourceKind: "text",
    _quickAdd: !!quickAdd,
    _serviceContext: serviceContext || "unknown",
    _strength: null,
    _notes: rationale ? `llm draft: ${String(rationale).slice(0, 180)}` : null,
    _evidence: [
      {
        kind: "text",
        detail: rationale || null,
        source: "llm_draft",
        snippet: bullet ? String(bullet).slice(0, 220) : null,
        confidence: "low",
      },
    ],
    _draftFromLLM: true,
  };
  row._rowKey = rowKey({ brand: row.brand, series: row.series, shade: row.shade });
  return row;
}

/**
 * Classify a list of unresolved bullets via OpenAI.
 *
 * @param {string[]} bullets    raw bullet strings
 * @param {object}   opts       { apiKey, model, timeoutMs, fetchImpl }
 * @returns {Promise<{rows, calls, warnings, raw}>}
 */
async function classifyAmbiguousBullets(bullets, opts = {}) {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  const model = opts.model || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const out = { rows: [], calls: 0, warnings: [], raw: null };
  if (!Array.isArray(bullets) || bullets.length === 0) return out;
  if (!apiKey) {
    out.warnings.push({
      code: "LLM_DRAFT_DISABLED",
      severity: "info",
      message: "OPENAI_API_KEY is not set — skipping LLM draft classification.",
    });
    return out;
  }

  const prompt = buildPrompt(bullets);
  const result = await callOpenAI({
    apiKey,
    model,
    prompt,
    timeoutMs,
    fetchImpl: opts.fetchImpl,
  });
  out.calls = 1;
  if (!result.ok) {
    out.warnings.push({
      code: "LLM_DRAFT_FAILED",
      severity: "low",
      message: `LLM draft classification failed: ${result.reason || "unknown"}`,
    });
    return out;
  }
  out.raw = result.raw || null;
  const arr = Array.isArray(result.parsed && result.parsed.bullets)
    ? result.parsed.bullets
    : [];
  for (const item of arr) {
    if (!item || !Array.isArray(item.rows)) continue;
    const idx = Number.isFinite(item.input_index) ? item.input_index - 1 : -1;
    const sourceBullet = idx >= 0 && idx < bullets.length ? bullets[idx] : null;
    for (const r of item.rows) {
      if (!r || (!r.brand && !r.series && !r.shade)) continue;
      out.rows.push(
        makeDraftRow({
          brand: r.brand,
          series: r.series,
          shade: r.shade,
          type: r.type,
          serviceContext: r.service_context,
          quickAdd: r.quick_add,
          rationale: r.rationale,
          bullet: sourceBullet,
        }),
      );
    }
  }
  return out;
}

module.exports = {
  classifyAmbiguousBullets,
  buildPrompt,
  SYSTEM_PROMPT,
  DEFAULT_MODEL,
};
