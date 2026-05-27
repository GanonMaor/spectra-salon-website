/**
 * netlify/functions/product-catalog-import.js
 * ---------------------------------------------------------------
 * Backend for the Admin Dashboard "Catalog Import" surface.
 *
 *   POST /preview  - parse uploads, compare to DB export, decide statuses
 *   POST /enrich   - run automatic web/LLM enrichment for unresolved rows
 *   POST /export   - generate the final import-ready Excel workbook
 *
 * Auth: same X-Access-Code header the rest of the admin uses.
 *
 * Implementation notes
 * - Uploaded files are passed as base64 in JSON; the same convention
 *   the usage-import endpoint uses.
 * - Job state lives in memory only — the Netlify Function cold-starts
 *   between requests so the client must re-send rows on /export.
 * - All deterministic logic lives in scripts/lib/product-catalog/
 *   so it can be unit tested directly with Jest.
 */

"use strict";

const crypto = require("crypto");

const { parseExcelBuffer, looksLikeImportSchema } = require("../../scripts/lib/product-catalog/excel-parser");
const { parsePdfBuffer } = require("../../scripts/lib/product-catalog/pdf-parser");
const { matchRows } = require("../../scripts/lib/product-catalog/matcher");
const {
  parseBarcodesField,
  stringifyBarcodes,
  validateRow,
} = require("../../scripts/lib/product-catalog/schema");
const {
  patternEnrich,
  llmEnrich,
  applySuggestions,
} = require("../../scripts/lib/product-catalog/enrichment");
const { buildWorkbookBuffer } = require("../../scripts/lib/product-catalog/workbook-builder");
const { rowKey, normalizeBrand, normalizeSeries } = require("../../scripts/lib/product-catalog/normalizer");
const { parseRequestText } = require("../../scripts/lib/product-catalog/request-parser");
const { extractFromUrls } = require("../../scripts/lib/product-catalog/url-extractor");
const { extractFromImages } = require("../../scripts/lib/product-catalog/image-vision");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Code",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// In-memory job cache. Each preview call stores its decided rows
// keyed by jobId so /export can re-use them without re-uploading.
const JOB_CACHE = new Map();
const JOB_CACHE_TTL_MS = 30 * 60 * 1000;

function cors(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}
function err(code, msg, extra) {
  return cors(code, { error: msg, ...(extra || {}) });
}
function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const k of Object.keys(headers || {})) {
    if (k.toLowerCase() === lower) return headers[k];
  }
  return "";
}
function decodeBase64(b64) {
  if (!b64) throw new Error("Missing file payload");
  const cleaned = String(b64).replace(/^data:[^;]+;base64,/i, "");
  return Buffer.from(cleaned, "base64");
}
function hashBuffer(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function pruneCache() {
  const now = Date.now();
  for (const [id, job] of JOB_CACHE) {
    if (now - job.createdAt > JOB_CACHE_TTL_MS) JOB_CACHE.delete(id);
  }
}

function detectFileKind(name = "") {
  const lower = name.toLowerCase();
  if (/\.(xlsx|xls)$/i.test(lower)) return "excel";
  if (/\.pdf$/i.test(lower)) return "pdf";
  if (/\.(png|jpe?g|webp|gif|bmp)$/i.test(lower)) return "image";
  return "unknown";
}

/**
 * Parse a single uploaded file. Returns canonical rows + warnings.
 */
async function parseUpload(file, options) {
  const buffer = decodeBase64(file.content);
  const kind = detectFileKind(file.name);
  const fileHash = hashBuffer(buffer);
  const baseOpts = {
    fileName: file.name,
    defaultBrand: options.brand,
    defaultSeries: options.series,
    defaultType: options.defaultType,
    defaultPackingWeight: options.defaultPackingWeight,
    defaultMaterialWeight: options.defaultMaterialWeight,
    defaultIls: options.defaultIls,
  };

  if (kind === "excel") {
    const result = parseExcelBuffer(buffer, baseOpts);
    return {
      rows: result.rows,
      warnings: result.warnings,
      kind,
      format: result.format,
      fileHash,
    };
  }
  if (kind === "pdf") {
    const result = await parsePdfBuffer(buffer, baseOpts);
    return {
      rows: result.rows,
      warnings: result.warnings,
      kind,
      format: result.format,
      fileHash,
      eanCandidates: result.eanCandidates,
    };
  }
  if (kind === "image") {
    const mime = file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")
      ? "image/jpeg"
      : file.name.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : file.name.toLowerCase().endsWith(".gif")
          ? "image/gif"
          : "image/png";
    return {
      rows: [],
      kind,
      format: "image",
      fileHash,
      image: {
        name: file.name,
        mime,
        base64: String(file.content || "").replace(/^data:[^;]+;base64,/i, ""),
      },
      warnings: [
        {
          code: "IMAGE_UPLOAD",
          severity: "info",
          message: `Image "${file.name}" queued for vision extraction. Run Enrich with vision enabled.`,
          source: file.name,
        },
      ],
    };
  }
  return {
    rows: [],
    kind,
    format: "unknown",
    fileHash,
    warnings: [
      {
        code: "UNSUPPORTED_FILE",
        severity: "high",
        message: `Unsupported file extension: ${file.name}`,
        source: file.name,
      },
    ],
  };
}

function buildDbContext(dbRows, fileName) {
  const brands = new Set();
  const seriesByBrand = {};
  for (const r of dbRows) {
    const b = normalizeBrand(r.brand);
    if (!b) continue;
    brands.add(b);
    const s = normalizeSeries(r.series);
    if (!s) continue;
    if (!seriesByBrand[b]) seriesByBrand[b] = new Set();
    seriesByBrand[b].add(s);
  }
  const out = {
    fileName: fileName || null,
    rowCount: dbRows.length,
    brands: [...brands].sort(),
    seriesByBrand: {},
  };
  for (const [k, v] of Object.entries(seriesByBrand)) {
    out.seriesByBrand[k] = [...v].sort();
  }
  return out;
}

function attachIssuesToCandidates(rows) {
  // Map decided rows to the public CandidateRow shape.
  return rows.map((r) => ({
    rowKey: rowKey({ brand: r.brand, series: r.series, shade: r.shade }),
    productId: r.productId || null,
    brand: r.brand || "",
    series: r.series || "",
    familyShade: r.familyShade ?? null,
    shade: r.shade || "",
    image: r.image ?? null,
    catalogNo: r.catalogNo ?? null,
    hairColor: r.hairColor ?? null,
    type: r.type ?? null,
    packingWeight: r.packingWeight ?? null,
    materialWeight: r.materialWeight ?? null,
    barcodes: stringifyBarcodes(parseBarcodesField(r.barcodes)),
    ILS: r.ILS ?? null,
    sources: Array.from(
      new Set([r._sourceFile, ...(Array.isArray(r.sources) ? r.sources : [])].filter(Boolean)),
    ),
    sourceKind: r._sourceKind || r.sourceKind || undefined,
    matchedProductId: r._matchedProductId || r.matchedProductId || null,
    matchType: r._matchType || r.matchType || null,
    status: r._status || r.status || "needs-review",
    confidence: r._confidence || r.confidence || "medium",
    issues: r._issues || r.issues || [],
    enrichedFields: r.enrichedFields || [],
    enrichmentSources: r.enrichmentSources || [],
    extractionEvidence:
      Array.isArray(r._evidence) && r._evidence.length > 0
        ? r._evidence
        : Array.isArray(r.extractionEvidence) && r.extractionEvidence.length > 0
          ? r.extractionEvidence
          : undefined,
    quickAdd:
      r._quickAdd === true || r.quickAdd === true ? true : undefined,
    serviceContext:
      (r._serviceContext && r._serviceContext !== "unknown" && r._serviceContext) ||
      (r.serviceContext && r.serviceContext !== "unknown" && r.serviceContext) ||
      undefined,
    notes: r._aliasNote || r._notes || r.notes || undefined,
  }));
}

function deriveSummary(candidates) {
  const summary = {
    totalUploads: 0,
    parsedRows: candidates.length,
    newRows: 0,
    updateRows: 0,
    duplicateRiskRows: 0,
    needsReviewRows: 0,
    missingBarcode: 0,
    missingPrice: 0,
    missingMaterialWeight: 0,
    missingType: 0,
    missingPackingWeight: 0,
    uniqueBrands: [],
    uniqueSeries: [],
    textRows: 0,
    urlRows: 0,
    imageRows: 0,
    quickAddRows: 0,
    linkCount: 0,
  };
  const brands = new Set();
  const series = new Set();
  for (const r of candidates) {
    if (r.brand) brands.add(r.brand);
    if (r.series) series.add(r.series);
    if (r.status === "new") summary.newRows += 1;
    else if (r.status === "update") summary.updateRows += 1;
    else if (r.status === "duplicate-risk") summary.duplicateRiskRows += 1;
    else summary.needsReviewRows += 1;
    if (parseBarcodesField(r.barcodes).length === 0) summary.missingBarcode += 1;
    if (r.ILS == null) summary.missingPrice += 1;
    if (r.materialWeight == null) summary.missingMaterialWeight += 1;
    if (r.packingWeight == null) summary.missingPackingWeight += 1;
    if (!r.type) summary.missingType += 1;
    if (r.sourceKind === "text") summary.textRows += 1;
    else if (r.sourceKind === "url") summary.urlRows += 1;
    else if (r.sourceKind === "image" || r.sourceKind === "vision")
      summary.imageRows += 1;
    if (r.quickAdd === true) summary.quickAddRows += 1;
  }
  summary.uniqueBrands = [...brands].sort();
  summary.uniqueSeries = [...series].sort();
  return summary;
}

async function handlePreview(body) {
  const files = Array.isArray(body.files) ? body.files : [];
  const options = body.options || {};
  const requestText = typeof options.requestText === "string" ? options.requestText : "";
  const explicitLinks = Array.isArray(options.links) ? options.links : [];
  const maxLinkFetches = Number(options.maxLinkFetches) || 6;
  if (files.length === 0 && !requestText && explicitLinks.length === 0) {
    return err(400, "files[], options.requestText, or options.links is required");
  }

  const allWarnings = [];
  const parsedFiles = [];
  const pendingImages = [];
  let dbRows = [];
  let dbFileName = null;
  for (const f of files) {
    if (!f || !f.content || !f.name) {
      allWarnings.push({
        code: "INVALID_FILE",
        severity: "high",
        message: "File entry missing name or content; skipped.",
      });
      continue;
    }
    if (f.role === "db-export") {
      const parsed = await parseUpload(f, options);
      dbRows = parsed.rows;
      dbFileName = f.name;
      allWarnings.push(...(parsed.warnings || []));
      continue;
    }
    const parsed = await parseUpload(f, options);
    parsedFiles.push({ name: f.name, parsed });
    allWarnings.push(...(parsed.warnings || []));
    if (parsed.kind === "image" && parsed.image) {
      pendingImages.push(parsed.image);
    }
  }

  const candidates = [];
  for (const { parsed } of parsedFiles) {
    for (const row of parsed.rows) candidates.push(row);
  }

  // Pasted customer message → deterministic candidate rows.
  let requestParse = null;
  if (requestText && requestText.trim().length > 0) {
    requestParse = parseRequestText(requestText, {
      defaultBrand: options.brand,
      defaultSeries: options.series,
      defaultType: options.defaultType,
    });
    candidates.push(...requestParse.rows);
    allWarnings.push(...(requestParse.warnings || []));
  }

  // URLs (explicit + auto-detected from the pasted text).
  const linkSet = new Set([...explicitLinks, ...((requestParse && requestParse.links) || [])]
    .map((u) => String(u || "").trim())
    .filter(Boolean));
  let urlExtraction = null;
  if (linkSet.size > 0) {
    urlExtraction = await extractFromUrls([...linkSet], {
      maxFetches: maxLinkFetches,
    });
    candidates.push(...(urlExtraction.rows || []));
    allWarnings.push(...(urlExtraction.warnings || []));
  }

  const decided = matchRows(candidates, dbRows);

  // Run pattern-based enrichment first (no network cost).
  const patterned = patternEnrich(decided);

  // Re-run matcher state if pattern fill produced new barcodes that
  // collide with existing DB rows.
  const reDecided = matchRows(patterned, dbRows);

  const candidatesPublic = attachIssuesToCandidates(reDecided);
  const summary = deriveSummary(candidatesPublic);
  summary.totalUploads = parsedFiles.length;
  summary.linkCount = linkSet.size;

  const jobId = hashBuffer(
    Buffer.from(JSON.stringify({ files: files.map((f) => f.name), opts: { ...options, requestText: requestText.slice(0, 64) }, ts: Date.now() })),
  ).slice(0, 24);

  pruneCache();
  JOB_CACHE.set(jobId, {
    createdAt: Date.now(),
    rows: candidatesPublic,
    dbRows,
    dbContext: buildDbContext(dbRows, dbFileName),
    options,
    parsedFiles: parsedFiles.map((p) => ({ name: p.name, fileHash: p.parsed.fileHash })),
    requestText,
    requestParse: requestParse
      ? {
          bullets: requestParse.bullets,
          links: requestParse.links,
          detectedBrands: requestParse.detectedBrands,
          quickAddIntents: requestParse.quickAddIntents,
        }
      : null,
    pendingImages,
    urlEvidence: urlExtraction
      ? urlExtraction.results.map((r) => ({
          url: r.url,
          ok: r.ok,
          reason: r.reason,
          title: r.evidence && r.evidence.title,
          snippet: r.evidence && r.evidence.snippet,
          variantCount: r.evidence && r.evidence.variantCount,
        }))
      : [],
  });

  const requestContext = requestParse
    ? {
        text: requestText,
        bulletCount: requestParse.bullets.length,
        detectedBrands: requestParse.detectedBrands,
        detectedLinks: [...linkSet],
        quickAddIntents: requestParse.quickAddIntents,
      }
    : null;

  return cors(200, {
    jobId,
    summary,
    rows: candidatesPublic,
    warnings: allWarnings,
    dbContext: JOB_CACHE.get(jobId).dbContext,
    requestContext,
  });
}

async function handleEnrich(body) {
  const jobId = body.jobId;
  if (!jobId || !JOB_CACHE.has(jobId)) {
    return err(404, "Unknown jobId — call /preview first");
  }
  const job = JOB_CACHE.get(jobId);
  const targetKeys = Array.isArray(body.rowKeys) && body.rowKeys.length > 0
    ? new Set(body.rowKeys)
    : null;

  const subset = targetKeys
    ? job.rows.filter((r) => targetKeys.has(r.rowKey))
    : job.rows;

  // Pattern enrichment is idempotent; running again is cheap.
  const patterned = patternEnrich(subset);

  const llmResult = body.enableLLM === false
    ? { suggestions: {}, calls: 0, sources: [] }
    : await llmEnrich(patterned, {
        fileHash: job.parsedFiles.map((f) => f.fileHash).join(","),
      });

  const { rows: enriched } = applySuggestions(patterned, llmResult.suggestions, llmResult.sources);
  const reDecided = matchRows(enriched, job.dbRows);
  const updatedPublic = attachIssuesToCandidates(reDecided);

  const warnings = [];
  let visionRowsPublic = [];
  let visionCalls = 0;

  if (body.enableVision !== false && Array.isArray(job.pendingImages) && job.pendingImages.length > 0) {
    const visionOut = await extractFromImages(job.pendingImages, {});
    visionCalls = visionOut.visionCalls || 0;
    warnings.push(...(visionOut.warnings || []));
    if (Array.isArray(visionOut.rows) && visionOut.rows.length > 0) {
      const visionDecided = matchRows(visionOut.rows, job.dbRows);
      visionRowsPublic = attachIssuesToCandidates(visionDecided);
    }
    // Don't double-process the same images on subsequent /enrich calls.
    job.pendingImages = [];
  }

  // Merge enriched rows back into the job cache (preserve untouched).
  const enrichedKeys = new Set(updatedPublic.map((r) => r.rowKey));
  const visionKeys = new Set(visionRowsPublic.map((r) => r.rowKey));
  job.rows = [
    ...updatedPublic,
    ...visionRowsPublic.filter((r) => !enrichedKeys.has(r.rowKey)),
    ...job.rows.filter(
      (r) => !enrichedKeys.has(r.rowKey) && !visionKeys.has(r.rowKey),
    ),
  ];

  return cors(200, {
    jobId,
    enriched: [...updatedPublic, ...visionRowsPublic],
    warnings,
    llmCalls: llmResult.calls,
    webCalls: 0,
    visionCalls,
    cacheHits: 0,
  });
}

async function handleExport(body) {
  const jobId = body.jobId;
  if (!jobId || !JOB_CACHE.has(jobId)) {
    return err(404, "Unknown jobId — call /preview first");
  }
  const job = JOB_CACHE.get(jobId);
  const rows = Array.isArray(body.rows) && body.rows.length > 0 ? body.rows : job.rows;

  // Re-shape public rows into the "decided" shape buildWorkbookBuffer expects.
  const decided = rows.map((r) => ({
    productId: r.productId,
    brand: r.brand,
    series: r.series,
    familyShade: r.familyShade,
    shade: r.shade,
    image: r.image,
    catalogNo: r.catalogNo,
    hairColor: r.hairColor,
    type: r.type,
    packingWeight: r.packingWeight,
    materialWeight: r.materialWeight,
    barcodes: stringifyBarcodes(parseBarcodesField(r.barcodes)),
    ILS: r.ILS,
    _status: r.status,
    _issues: r.issues || [],
    sources: r.sources || [],
    _sourceKind: r.sourceKind || null,
    _quickAdd: r.quickAdd === true,
    _serviceContext: r.serviceContext || null,
    _evidence: Array.isArray(r.extractionEvidence) ? r.extractionEvidence : [],
    _notes: r.notes || null,
    enrichedFields: r.enrichedFields || [],
    enrichmentSources: r.enrichmentSources || [],
  }));

  const enrichmentSources = decided.flatMap((r) =>
    (r.enrichmentSources || []).map((s) => ({ ...s, rowKey: rowKey(r) })),
  );

  const requestBullets = job.requestParse ? job.requestParse.bullets || [] : [];
  const detectedLinks = job.requestParse ? job.requestParse.links || [] : [];
  const urlEvidence = job.urlEvidence || [];

  const buffer = await buildWorkbookBuffer({
    rows: decided,
    options: job.options,
    enrichmentSources,
    jobId,
    dbContext: job.dbContext,
    requestText: job.requestText || "",
    requestBullets,
    detectedLinks,
    urlEvidence,
  });

  const filename = (body.filenameHint || "catalog_import_audit") + `-${jobId.slice(0, 8)}.xlsx`;
  return cors(200, {
    jobId,
    filename,
    workbook: buffer.toString("base64"),
    byteSize: buffer.length,
    rowCounts: {
      new: decided.filter((r) => r._status === "new").length,
      updates: decided.filter((r) => r._status === "update").length,
      barcodeGaps: decided.filter((r) => parseBarcodesField(r.barcodes).length === 0).length,
      sources: enrichmentSources.length,
      quickAdds: decided.filter((r) => r._quickAdd === true).length,
      requestBullets: requestBullets.length,
      evidence: decided.reduce((acc, r) => acc + (r._evidence ? r._evidence.length : 0), 0),
    },
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== ACCESS_CODE) return err(401, "Unauthorized");

  const rawPath = event.path || event.rawUrl || "";
  const cleanPath =
    rawPath.replace(/.*\/\.netlify\/functions\/product-catalog-import/, "") || "/";
  const seg = cleanPath.split("/").filter(Boolean);
  const method = event.httpMethod;

  let body = {};
  if (event.body) {
    try {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
      body = JSON.parse(raw);
    } catch {
      return err(400, "Invalid JSON body");
    }
  }

  try {
    if (method === "POST" && seg[0] === "preview" && seg.length === 1) {
      return await handlePreview(body);
    }
    if (method === "POST" && seg[0] === "enrich" && seg.length === 1) {
      return await handleEnrich(body);
    }
    if (method === "POST" && seg[0] === "export" && seg.length === 1) {
      return await handleExport(body);
    }
    return err(404, "Endpoint not found", { path: cleanPath, method });
  } catch (e) {
    console.error("product-catalog-import error:", e);
    return err(500, e.message || "Internal error");
  }
};

// Exposed for tests.
exports._private = {
  parseUpload,
  buildDbContext,
  attachIssuesToCandidates,
  deriveSummary,
  JOB_CACHE,
};
