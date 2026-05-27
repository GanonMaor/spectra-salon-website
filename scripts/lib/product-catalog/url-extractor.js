/**
 * scripts/lib/product-catalog/url-extractor.js
 * ---------------------------------------------------------------
 * Fetches product / category URLs from a customer message and
 * extracts brand / series / shade candidates.
 *
 * Supports:
 *   • Shopify pages (JSON-LD + ProductJson + variant titles)
 *   • Generic pages with <title>, og:title, og:description meta
 *   • Embedded variant lists (option1/option2/option3)
 *
 * NEVER touches the network when called with `{ skipFetch: true }`
 * which the unit tests rely on. The Netlify function uses the real
 * fetch path with a 10s timeout per URL and a hard limit of N URLs.
 */

"use strict";

const { normalizeBrand, normalizeSeries, normalizeShade, rowKey } =
  require("./normalizer");
const { stringifyBarcodes } = require("./schema");
const { parseRequestText } = require("./request-parser");

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_FETCHES = 6;
const USER_AGENT =
  "Mozilla/5.0 (compatible; SpectraCatalogBot/1.0; +https://salonos.ai/contact)";

/**
 * Lightweight HTML fetcher with timeout. Returns
 * { ok, status, body, finalUrl, error } and never throws.
 */
async function fetchUrl(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  // Node 18+ has global fetch; fall back to a noop on older runtimes.
  if (typeof fetch !== "function") {
    return { ok: false, status: 0, body: "", finalUrl: url, error: "fetch_unavailable" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.7",
      },
    });
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      body,
      finalUrl: res.url || url,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: "",
      finalUrl: url,
      error: err && err.message ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Pull all <script type="application/ld+json"> blocks. */
function extractJsonLd(html) {
  if (!html) return [];
  const blocks = [];
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) != null) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // Try to extract objects greedily — Shopify sometimes embeds
      // multiple JSON blocks separated by HTML comments.
      const fragments = raw.split(/}\s*{/);
      if (fragments.length > 1) {
        try {
          for (let i = 0; i < fragments.length; i += 1) {
            const piece =
              (i === 0 ? "" : "{") + fragments[i] + (i === fragments.length - 1 ? "" : "}");
            const parsed = JSON.parse(piece);
            if (parsed) blocks.push(parsed);
          }
        } catch {
          /* ignore — best effort */
        }
      }
    }
  }
  return blocks;
}

/** Find a Shopify ProductJson script tag and parse it. */
function extractShopifyProductJson(html) {
  if (!html) return null;
  const re =
    /<script[^>]+id=["']ProductJson-[^"']+["'][^>]*>([\s\S]*?)<\/script>/i;
  const m = html.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function getMeta(html, name) {
  if (!html) return null;
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function getTitle(html) {
  if (!html) return null;
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function decodeHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)));
}

/**
 * Decide a brand for a URL. Domain hints win; fallback to scanning
 * the page title with the request-parser brand detector.
 */
function brandFromUrl(url) {
  const u = String(url || "").toLowerCase();
  if (u.includes("kenra")) return "KENRA";
  if (u.includes("paulmitchell") || u.includes("paul-mitchell")) return "PAUL MITCHELL";
  if (u.includes("framesi")) return "FRAMESI";
  if (u.includes("adore") || u.includes("creativeimage")) return "ADORE";
  if (u.includes("dangerjones") || u.includes("danger-jones")) return "DANGER JONES";
  if (u.includes("pulpriot") || u.includes("pulp-riot")) return "PULP RIOT";
  if (u.includes("supersisters")) return ""; // multi-brand retailer
  if (u.includes("sallybeauty")) return "";
  if (u.includes("amazon.")) return "";
  return "";
}

/**
 * Collect simple variant strings (Shopify variants, JSON-LD
 * hasVariant, or visible swatch text) that look like distinct shades.
 */
function collectVariantTitles(jsonLd, productJson, html) {
  const variants = new Set();
  const addIfShade = (title) => {
    if (!title) return;
    const cleaned = String(title).trim();
    if (!cleaned || cleaned.length > 80) return;
    if (/^default(\stitle)?$/i.test(cleaned)) return;
    variants.add(cleaned);
  };

  for (const node of jsonLd) {
    if (!node || typeof node !== "object") continue;
    const items = []
      .concat(node.hasVariant || [])
      .concat(node.offers && node.offers.itemOffered ? node.offers.itemOffered : [])
      .concat(Array.isArray(node["@graph"]) ? node["@graph"] : []);
    for (const v of items) {
      if (!v || typeof v !== "object") continue;
      addIfShade(v.name || v.title || v.color || v.itemName);
    }
  }

  if (productJson && Array.isArray(productJson.variants)) {
    for (const variant of productJson.variants) {
      const parts = [variant.option1, variant.option2, variant.option3]
        .filter(Boolean)
        .join(" / ");
      addIfShade(parts || variant.title || variant.name);
    }
  }

  // Last-resort: pull "data-value" or "data-shade" swatch attributes.
  if (html) {
    const swatchRe =
      /data-(?:value|shade|color|variant-name)=["']([^"']{1,80})["']/gi;
    let m;
    while ((m = swatchRe.exec(html)) != null) addIfShade(decodeHtml(m[1]));
  }

  return [...variants];
}

/** Extract barcodes/skus/gtin from JSON-LD/ProductJson. */
function collectBarcodes(jsonLd, productJson) {
  const out = new Set();
  const consider = (val) => {
    if (!val) return;
    const s = String(val).replace(/\D+/g, "");
    if (s.length === 8 || s.length === 12 || s.length === 13) out.add(s);
  };
  for (const node of jsonLd) {
    if (!node) continue;
    consider(node.gtin13);
    consider(node.gtin12);
    consider(node.gtin8);
    consider(node.gtin);
    consider(node.barcode);
    consider(node.sku);
    if (Array.isArray(node.hasVariant)) {
      for (const v of node.hasVariant) {
        consider(v && (v.gtin13 || v.gtin12 || v.gtin8 || v.gtin || v.barcode || v.sku));
      }
    }
  }
  if (productJson && Array.isArray(productJson.variants)) {
    for (const v of productJson.variants) consider(v.barcode || v.sku);
  }
  return [...out];
}

/**
 * Build candidate rows from one already-fetched HTML body. Pure /
 * test-friendly; no network access.
 */
function parseUrlPayload({ url, html, hint = {} } = {}) {
  if (!html) {
    return {
      url,
      ok: false,
      reason: "empty_body",
      rows: [],
      evidence: { url, snippet: null, title: null },
    };
  }
  const jsonLd = extractJsonLd(html);
  const productJson = extractShopifyProductJson(html);
  const ogTitle = getMeta(html, "og:title") || getTitle(html);
  const ogDesc = getMeta(html, "og:description") || getMeta(html, "description");
  const titleSnippet = decodeHtml(ogTitle || "");
  const descSnippet = decodeHtml(ogDesc || "");

  const brand =
    hint.brand ||
    brandFromUrl(url) ||
    (titleSnippet ? require("./request-parser").detectBrand(titleSnippet) : "") ||
    "";
  let series = hint.series || "";
  if (!series) {
    const text = `${titleSnippet} ${descSnippet}`;
    series = require("./request-parser").detectSeries(text, brand);
  }

  const variantTitles = collectVariantTitles(jsonLd, productJson, html);
  const barcodes = collectBarcodes(jsonLd, productJson);

  const rows = [];
  if (variantTitles.length === 0) {
    // Use the page title as a single anchor candidate.
    const title = titleSnippet || url;
    rows.push(makeUrlRow({
      url,
      brand: brand || "",
      series: series || title,
      shade: "",
      title,
      snippet: descSnippet || titleSnippet,
      barcodes,
    }));
  } else {
    for (const variant of variantTitles) {
      rows.push(makeUrlRow({
        url,
        brand: brand || "",
        series: series || titleSnippet || "",
        shade: variant,
        title: titleSnippet,
        snippet: descSnippet,
        barcodes,
      }));
    }
  }

  return {
    url,
    ok: true,
    reason: null,
    rows,
    evidence: {
      url,
      title: titleSnippet || null,
      snippet: descSnippet || null,
      variantCount: variantTitles.length,
      barcodeCandidates: barcodes,
    },
  };
}

function makeUrlRow({ url, brand, series, shade, title, snippet, barcodes }) {
  const row = {
    productId: null,
    brand: normalizeBrand(brand),
    series: normalizeSeries(series),
    familyShade: null,
    shade: normalizeShade(shade).canonical,
    image: null,
    catalogNo: null,
    hairColor: null,
    type: null,
    packingWeight: null,
    materialWeight: null,
    barcodes: stringifyBarcodes(barcodes && barcodes.length ? [barcodes[0]] : []),
    ILS: null,
    _sourceFile: url,
    _sourceKind: "url",
    _quickAdd: false,
    _serviceContext: "unknown",
    _strength: null,
    _notes: title ? `from URL: ${title.slice(0, 120)}` : `from URL: ${url}`,
    _evidence: [
      {
        kind: "url",
        detail: title || null,
        source: url,
        snippet: snippet ? snippet.slice(0, 220) : null,
        confidence: shade ? "medium" : "low",
      },
    ],
  };
  row._rowKey = rowKey({ brand: row.brand, series: row.series, shade: row.shade });
  return row;
}

/**
 * Fetch a list of URLs (capped) and return parsed candidate rows.
 *
 * @param {string[]} urls
 * @param {object} opts  { timeoutMs, maxFetches, hint, skipFetch, fetchImpl }
 *   When `skipFetch === true`, the caller MUST supply `opts.htmlByUrl`
 *   so unit tests can run without network access.
 */
async function extractFromUrls(urls, opts = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxFetches = DEFAULT_MAX_FETCHES,
    hint = {},
    skipFetch = false,
    htmlByUrl = {},
    fetchImpl = fetchUrl,
  } = opts;

  const list = Array.isArray(urls) ? urls.slice(0, maxFetches) : [];
  const results = [];
  const warnings = [];
  let webCalls = 0;

  for (const url of list) {
    let html = "";
    if (skipFetch || htmlByUrl[url]) {
      html = htmlByUrl[url] || "";
    } else {
      const fetched = await fetchImpl(url, { timeoutMs });
      webCalls += 1;
      if (!fetched.ok) {
        warnings.push({
          code: "URL_FETCH_FAILED",
          severity: "low",
          message: `Could not fetch ${url}: ${fetched.error || fetched.status}`,
          source: url,
        });
        results.push({
          url,
          ok: false,
          reason: fetched.error || `status_${fetched.status}`,
          rows: [],
          evidence: { url, title: null, snippet: null },
        });
        continue;
      }
      html = fetched.body;
    }
    results.push(parseUrlPayload({ url, html, hint }));
  }

  const allRows = results.flatMap((r) => r.rows);
  return { results, rows: allRows, warnings, webCalls };
}

/**
 * Convenience wrapper that mirrors the request parser API: pass a
 * raw text block and optional URL list, get rows + bullets back.
 *
 * The text path is just `parseRequestText`; we re-export it so
 * callers don't have to import two modules.
 */
function parseRequestWithUrls({ text, links } = {}) {
  const requestParse = parseRequestText(text || "");
  const detectedLinks = new Set([...(links || []), ...requestParse.links]);
  return {
    rows: requestParse.rows,
    bullets: requestParse.bullets,
    detectedLinks: [...detectedLinks],
    detectedBrands: requestParse.detectedBrands,
    quickAddIntents: requestParse.quickAddIntents,
    warnings: requestParse.warnings,
  };
}

module.exports = {
  extractFromUrls,
  parseUrlPayload,
  parseRequestWithUrls,
  fetchUrl,
  extractJsonLd,
  extractShopifyProductJson,
  collectVariantTitles,
  collectBarcodes,
  brandFromUrl,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_FETCHES,
};
