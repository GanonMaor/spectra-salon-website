/**
 * scripts/lib/product-catalog/image-vision.js
 * ---------------------------------------------------------------
 * OCR / Vision pipeline for screenshots customers send us:
 *   - Adore swatch charts and bottle rows
 *   - Pulp Riot / Danger Jones shelves
 *   - Paul Mitchell Color Ways
 *   - Ion Color Brilliance (boxes / brights row)
 *
 * Cost discipline:
 *   - Vision is only invoked on image files (never on text/PDF rows)
 *     and only at /enrich time when the operator opts in OR no other
 *     parser produced rows for that image.
 *   - The function ALWAYS short-circuits when OPENAI_API_KEY is
 *     missing, returning a deterministic placeholder row so the
 *     operator can still see "this screenshot is queued for vision".
 *   - Rows include `_evidence` provenance and `_visionRaw` so the
 *     export sheet shows what the model saw.
 */

"use strict";

const { normalizeBrand, normalizeSeries, normalizeShade, rowKey } =
  require("./normalizer");
const { stringifyBarcodes } = require("./schema");
const { detectBrand, detectSeries } = require("./request-parser");

const DEFAULT_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
const DEFAULT_MAX_IMAGES = 8;
const DEFAULT_TIMEOUT_MS = 30_000;

const VISION_SYSTEM_PROMPT =
  "You read salon hair-product photos / shade charts. Reply ONLY with strict JSON, no markdown. Never invent EAN-13 barcodes you have not seen printed on the product itself.";

const VISION_USER_PROMPT = `You are looking at a photo or screenshot from a salon owner.

Goal: list every distinct hair-product unit visible. For each unit return:
{
  "brand": "uppercase brand (e.g. ADORE)",
  "series": "uppercase product line (e.g. SEMI-PERMANENT)",
  "shade": "shade name OR shade code AS PRINTED",
  "shade_code": "numeric / short code if any",
  "type": "color | toner | developer | direct-dye | bleach | treatment | unknown",
  "barcodes": [],
  "confidence": "high | medium | low",
  "evidence": "what made you decide (visible text, swatch label, etc.)"
}

Schema:
{ "rows": [...] }

Rules:
- If you see a chart with multiple swatches, return ONE row per labelled swatch.
- For shelf photos, return ONE row per visible distinct package.
- Skip anything you cannot identify with at least "low" confidence.
- DO NOT invent shades or barcodes; leave fields blank if unsure.
`;

/**
 * Decide brand/series hints from filename so vision rows still
 * cluster correctly when the model is unsure.
 */
function inferHintFromName(name) {
  if (!name) return { brand: "", series: "" };
  const lower = String(name).toLowerCase().replace(/[-_]+/g, " ");
  const brand = detectBrand(lower);
  const series = detectSeries(lower, brand);
  return { brand, series };
}

function makeVisionRow({ source, brand, series, shade, type, confidence, evidence, raw }) {
  const row = {
    productId: null,
    brand: normalizeBrand(brand),
    series: normalizeSeries(series),
    familyShade: null,
    shade: normalizeShade(shade).canonical,
    image: source || null,
    catalogNo: null,
    hairColor: null,
    type: type || null,
    packingWeight: null,
    materialWeight: null,
    barcodes: stringifyBarcodes([]),
    ILS: null,
    _sourceFile: source || "image",
    _sourceKind: "vision",
    _quickAdd: false,
    _serviceContext: type || "unknown",
    _strength: null,
    _notes: evidence ? `vision: ${String(evidence).slice(0, 180)}` : null,
    _confidence: confidence || "low",
    _evidence: [
      {
        kind: "vision",
        detail: evidence || null,
        source: source || null,
        snippet: raw ? String(raw).slice(0, 220) : null,
        confidence: confidence || "low",
      },
    ],
  };
  row._rowKey = rowKey({ brand: row.brand, series: row.series, shade: row.shade });
  return row;
}

/**
 * Send one base64 image to OpenAI Vision and parse the strict-JSON
 * response. Returns rows or null (when API key missing / network fails).
 */
async function callVision({ apiKey, model, base64, mime, filename, hint, timeoutMs }) {
  if (!apiKey) return { ok: false, reason: "no_api_key", rows: [] };
  if (typeof fetch !== "function") {
    return { ok: false, reason: "fetch_unavailable", rows: [] };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const dataUrl = `data:${mime || "image/png"};base64,${base64}`;
    const userText = hint?.brand || hint?.series
      ? `${VISION_USER_PROMPT}\nHINT brand=${hint.brand || ""} series=${hint.series || ""} filename=${filename || ""}`
      : `${VISION_USER_PROMPT}\nfilename=${filename || ""}`;
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 2200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: VISION_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });
    if (!resp.ok) {
      return { ok: false, reason: `http_${resp.status}`, rows: [] };
    }
    const json = await resp.json();
    const content = (json.choices?.[0]?.message?.content || "").trim();
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: "non_json", rows: [], raw: content };
    }
    const rawRows = Array.isArray(parsed.rows) ? parsed.rows : [];
    const rows = rawRows
      .filter((r) => r && (r.brand || r.series || r.shade))
      .map((r) =>
        makeVisionRow({
          source: filename || null,
          brand: r.brand || hint?.brand || "",
          series: r.series || hint?.series || "",
          shade: r.shade || r.shade_code || "",
          type: r.type || null,
          confidence: r.confidence || "low",
          evidence: r.evidence || null,
          raw: JSON.stringify(r),
        }),
      );
    return { ok: true, rows, raw: content };
  } catch (err) {
    return {
      ok: false,
      reason: err && err.message ? err.message : String(err),
      rows: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run the vision pipeline over a list of image inputs.
 *
 * @param {Array<{name, base64, mime, hint?}>} images
 * @param {object} opts  { apiKey, model, maxImages, timeoutMs, fetchImpl }
 *   - When `fetchImpl` is provided, vision calls go through it
 *     (used by unit tests with mocked OpenAI responses).
 */
async function extractFromImages(images, opts = {}) {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  const model = opts.model || DEFAULT_MODEL;
  const maxImages = opts.maxImages || DEFAULT_MAX_IMAGES;
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const list = Array.isArray(images) ? images.slice(0, maxImages) : [];
  const rows = [];
  const warnings = [];
  let visionCalls = 0;

  for (const image of list) {
    if (!image || !image.base64) {
      warnings.push({
        code: "VISION_EMPTY_IMAGE",
        severity: "low",
        message: `Skipping empty image (${image?.name || "unnamed"})`,
        source: image?.name || "image",
      });
      continue;
    }
    const hint = image.hint || inferHintFromName(image.name);
    if (!apiKey) {
      // Cost gate: register a placeholder row but do not call OpenAI.
      rows.push(
        makeVisionRow({
          source: image.name || "image",
          brand: hint.brand || "",
          series: hint.series || "",
          shade: "",
          type: null,
          confidence: "low",
          evidence: "vision queued — OPENAI_API_KEY not set",
          raw: null,
        }),
      );
      warnings.push({
        code: "VISION_DISABLED",
        severity: "info",
        message: `Vision disabled (no OPENAI_API_KEY) — skipping ${image.name || "image"}`,
        source: image.name || "image",
      });
      continue;
    }

    let result;
    if (typeof opts.fetchImpl === "function") {
      result = await opts.fetchImpl({
        apiKey,
        model,
        base64: image.base64,
        mime: image.mime,
        filename: image.name,
        hint,
        timeoutMs,
      });
    } else {
      result = await callVision({
        apiKey,
        model,
        base64: image.base64,
        mime: image.mime,
        filename: image.name,
        hint,
        timeoutMs,
      });
    }
    visionCalls += 1;
    if (!result.ok) {
      warnings.push({
        code: "VISION_FAILED",
        severity: "low",
        message: `Vision failed for ${image.name || "image"}: ${result.reason || "unknown"}`,
        source: image.name || "image",
      });
      // Still add a placeholder so the operator sees the screenshot.
      rows.push(
        makeVisionRow({
          source: image.name || "image",
          brand: hint.brand || "",
          series: hint.series || "",
          shade: "",
          type: null,
          confidence: "low",
          evidence: `vision failed: ${result.reason || "unknown"}`,
          raw: null,
        }),
      );
      continue;
    }
    if (Array.isArray(result.rows) && result.rows.length > 0) {
      rows.push(...result.rows);
    } else {
      rows.push(
        makeVisionRow({
          source: image.name || "image",
          brand: hint.brand || "",
          series: hint.series || "",
          shade: "",
          type: null,
          confidence: "low",
          evidence: "vision returned 0 rows — manual review",
          raw: result.raw || null,
        }),
      );
    }
  }

  return { rows, warnings, visionCalls };
}

module.exports = {
  extractFromImages,
  callVision,
  inferHintFromName,
  VISION_SYSTEM_PROMPT,
  VISION_USER_PROMPT,
  DEFAULT_MAX_IMAGES,
};
