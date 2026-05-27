/**
 * scripts/lib/product-catalog/pdf-parser.js
 * ---------------------------------------------------------------
 * Best-effort, pure-JS PDF text extraction. Pulls shade-like tokens
 * from text-based catalog PDFs. Image-only PDFs return zero rows
 * and a warning so the AI/web layer can pick them up.
 *
 * This intentionally does NOT shell out to `pdftotext` — Netlify
 * Functions ship without that binary.
 */

"use strict";

const zlib = require("zlib");

const {
  normalizeShade,
  normalizeBrand,
  normalizeSeries,
  rowKey,
} = require("./normalizer");
const { parseBarcodesField, stringifyBarcodes } = require("./schema");

let pdfParseLib = null;
try {
  // Optional dep: when installed it gives us robust CID-font support;
  // otherwise we fall back to the regex-based extractor below.
  // eslint-disable-next-line global-require
  pdfParseLib = require("pdf-parse/lib/pdf-parse.js");
} catch (_) {
  pdfParseLib = null;
}

const SHADE_REGEX =
  /\b\d{1,2}[\.\-\/](?:\d{1,2})(?:[\.\-\/]\d{1,2}){0,2}\b/g;

/**
 * Extract every printable text token from a PDF buffer.
 *
 * - Handles uncompressed `(string)` / `<hex>` literals directly.
 * - Inflates FlateDecode-compressed `stream … endstream` blocks
 *   (the dominant case for modern PDFs) with zlib.inflateSync.
 * - Naïvely ignores other filters (CCITTFaxDecode/DCTDecode →
 *   image-only catalogs return zero text and a warning).
 *
 * Returns the joined text and a (best-effort) list of pages.
 */
function extractRawText(buffer) {
  if (!buffer || !buffer.length) return { text: "", pages: [] };
  const tokens = [];

  const fullStr = buffer.toString("latin1");
  pullStringTokens(fullStr, tokens);

  // Inflate every FlateDecode stream we find and pull strings out
  // of the inflated content.
  const streamRe = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m;
  while ((m = streamRe.exec(fullStr))) {
    const dict = m[1];
    if (!/\/FlateDecode/.test(dict)) continue;
    const start = m.index + m[0].indexOf("stream") + "stream".length;
    // skip the EOL after `stream`
    let dataStart = start;
    if (buffer[dataStart] === 0x0d) dataStart += 1; // CR
    if (buffer[dataStart] === 0x0a) dataStart += 1; // LF
    const dataEnd = m.index + m[0].lastIndexOf("endstream");
    let chunk = buffer.slice(dataStart, dataEnd);
    // PDF puts a trailing newline before `endstream` that we don't
    // want fed to zlib.
    while (
      chunk.length > 0 &&
      (chunk[chunk.length - 1] === 0x0a || chunk[chunk.length - 1] === 0x0d)
    ) {
      chunk = chunk.slice(0, chunk.length - 1);
    }
    let inflated;
    try {
      inflated = zlib.inflateSync(chunk).toString("latin1");
    } catch (_) {
      try {
        inflated = zlib.inflateRawSync(chunk).toString("latin1");
      } catch (_2) {
        continue;
      }
    }
    pullStringTokens(inflated, tokens);
  }

  const text = tokens.join(" ");
  return { text, pages: [text] };
}

function pullStringTokens(str, tokens) {
  // Pull literal strings `(...)` (with nested escapes).
  const literalRe = /\(((?:\\.|[^()\\])*)\)/g;
  let m;
  while ((m = literalRe.exec(str))) {
    const cleaned = m[1]
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\\([0-9]{1,3})/g, (_match, oct) => {
        const code = parseInt(oct, 8);
        return code >= 0x20 && code < 0x7f ? String.fromCharCode(code) : " ";
      });
    if (cleaned && /[A-Za-z0-9]/.test(cleaned)) tokens.push(cleaned);
  }
  // Pull hex strings `<...>`.
  const hexRe = /<([0-9A-Fa-f\s]+)>/g;
  while ((m = hexRe.exec(str))) {
    const hex = m[1].replace(/\s+/g, "");
    if (hex.length % 2 !== 0 || hex.length < 2) continue;
    let s = "";
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.slice(i, i + 2), 16);
      if (code >= 0x20 && code < 0x7f) s += String.fromCharCode(code);
    }
    if (s && /[A-Za-z0-9]/.test(s)) tokens.push(s);
  }
}

/**
 * Series → parent brand fallback used when the brand isn't visible
 * in the extracted text (e.g. the PDF only mentions CROMATONE).
 */
const SERIES_TO_BRAND = {
  CROMATONE: "MONTIBELLO",
  DENUEE: "MONTIBELLO",
  ECLAT: "MONTIBELLO",
  CROMATONE_REFLECTION: "MONTIBELLO",
  DECODE: "MONTIBELLO",
  LUMISHINE: "JOICO",
  MAJIREL: "LOREAL",
  "DIA RICHESSE": "LOREAL",
  "DIA COLORUR": "LOREAL",
  INOA: "LOREAL",
  "BEAUTY FUSION": "ARTEGO",
};

/**
 * Heuristically detect the brand/series mentioned in the document
 * to anchor extracted rows. Returns null when we can't tell.
 */
function inferBrandSeries(text, fileName = "") {
  if (!text) return { brand: null, series: null };
  const t = text.toUpperCase();
  const haystack = `${t} ${String(fileName).toUpperCase()}`;
  const brandHit = [
    "MONTIBELLO",
    "ARTEGO",
    "ITS COLOR",
    "JOICO",
    "WELLA",
    "L'OREAL",
    "LOREAL",
    "MATRIX",
    "REDKEN",
    "SCHWARZKOPF",
  ].find((b) => haystack.includes(b)) || null;
  const seriesHit =
    [
      "CROMATONE",
      "DENUEE",
      "ECLAT",
      "LUMISHINE",
      "MAJIREL",
      "DIA RICHESSE",
      "DIA COLORUR",
      "INOA",
      "BEAUTY FUSION",
    ].find((s) => haystack.includes(s)) || null;

  let brand = brandHit;
  if (!brand && seriesHit && SERIES_TO_BRAND[seriesHit]) {
    brand = SERIES_TO_BRAND[seriesHit];
  }
  return {
    brand: brand ? normalizeBrand(brand) : null,
    series: seriesHit ? normalizeSeries(seriesHit) : null,
  };
}

/**
 * Try a high-quality extraction using `pdf-parse` (pdf.js underneath)
 * which understands CID fonts. Falls back to the regex-based extractor
 * when the optional dep is unavailable or throws.
 */
async function extractTextRobust(buffer) {
  if (pdfParseLib) {
    try {
      const result = await pdfParseLib(buffer);
      if (result && typeof result.text === "string" && result.text.length > 50) {
        return result.text;
      }
    } catch (_) {
      // fall through
    }
  }
  return extractRawText(buffer).text || "";
}

/**
 * Extract a list of canonical product rows from a PDF buffer.
 * Each shade token becomes one candidate row. EAN13 barcodes
 * found in the same document are NOT linked to rows here — that's
 * left to the matcher / enrichment layer.
 */
async function parsePdfBuffer(buffer, opts = {}) {
  const text = await extractTextRobust(buffer);
  const warnings = [];
  if (!text || text.length < 100) {
    warnings.push({
      code: "PDF_NO_TEXT",
      severity: "high",
      message:
        "PDF appears to be image-only or scanned; no text could be extracted. Send to AI/OCR enrichment.",
      source: opts.fileName,
    });
    return { rows: [], format: "pdf", warnings, text: "" };
  }

  const inferred = inferBrandSeries(text, opts.fileName || "");
  const brand = opts.defaultBrand
    ? normalizeBrand(opts.defaultBrand)
    : inferred.brand || "";
  const series = opts.defaultSeries
    ? normalizeSeries(opts.defaultSeries)
    : inferred.series || "";

  const seenShades = new Set();
  const rows = [];
  let m;
  const re = new RegExp(SHADE_REGEX.source, "g");
  while ((m = re.exec(text))) {
    const shade = normalizeShade(m[0]);
    if (!shade.canonical || seenShades.has(shade.key)) continue;
    seenShades.add(shade.key);
    const out = {
      productId: null,
      brand,
      series,
      familyShade: null,
      shade: shade.canonical,
      image: null,
      catalogNo: null,
      hairColor: null,
      type: opts.defaultType || "color",
      packingWeight: opts.defaultPackingWeight || null,
      materialWeight: opts.defaultMaterialWeight || null,
      barcodes: stringifyBarcodes([]),
      ILS: opts.defaultIls || null,
      _sourceFile: opts.fileName || null,
      _rowIndex: rows.length,
    };
    out._rowKey = rowKey({ brand, series, shade: shade.canonical });
    rows.push(out);
  }

  // Pull EAN-13 candidates so the matcher can opportunistically
  // attach them to the first matching shade. Shipped to the caller
  // as a flat list because positional info is unreliable.
  const eanCandidates = [];
  const eanRe = /\b\d{12,13}\b/g;
  while ((m = eanRe.exec(text))) {
    const code = m[0];
    if (code.length === 13 || code.length === 12) eanCandidates.push(code);
  }

  if (rows.length === 0) {
    warnings.push({
      code: "PDF_NO_SHADES",
      severity: "medium",
      message: "PDF text was extracted but no shade-like tokens were found.",
      source: opts.fileName,
    });
  }

  return {
    rows,
    format: "pdf",
    warnings,
    text,
    eanCandidates,
    inferred,
  };
}

module.exports = {
  parsePdfBuffer,
  extractRawText,
  extractTextRobust,
  inferBrandSeries,
  SHADE_REGEX,
};
