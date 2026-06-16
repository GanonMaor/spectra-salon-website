/**
 * netlify/functions/product-truth-search.js
 * ─────────────────────────────────────────────────────────────────────────
 * Product Truth Search and Detail API.
 *
 * Endpoints:
 *   GET  ?action=search&q=<query>&type=<ptType>&page=<n>&limit=<n>
 *   GET  ?action=product&id=<canonicalId>
 *   GET  ?action=aliases&id=<canonicalId>
 *   GET  ?action=sources&id=<canonicalId>
 *   GET  ?action=review-items
 *   GET  ?action=funnel
 *
 * Auth: X-Access-Code header (same pattern as other admin functions).
 * Tenant scope: derived from session; this initial version uses a simple
 * access code while the auth system is being built.
 *
 * Security:
 *   - Read-only. No mutations accepted here.
 *   - All queries are scoped to the shared canonical product catalog.
 *   - No arbitrary file paths or SQL accepted from frontend.
 *   - Only approved actions accepted.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";
const ROOT        = path.join(__dirname, "../..");

// ── CORS headers ───────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// ── Approved actions allowlist ─────────────────────────────────────────────

const ALLOWED_ACTIONS = new Set([
  "search", "product", "aliases", "sources", "review-items", "funnel",
  "resolve-import",  // resolution metrics for a committed usage import
  "reprocess-info",  // what Product Truth version was used and what needs reprocessing
]);

// ── Data loading (module-level cache) ────────────────────────────────────

let _canonical = null;
let _aliases   = null;
let _sources   = null;
let _review    = null;
let _funnel    = null;
let _searchIndex = null;

function loadJson(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

function getCanonical() {
  if (!_canonical) _canonical = loadJson("src/data/product-truth-canonical.json") || [];
  return _canonical;
}

function getAliases() {
  if (!_aliases) _aliases = loadJson("src/data/product-truth-aliases.json") || [];
  return _aliases;
}

function getSources() {
  if (!_sources) _sources = loadJson("src/data/product-truth-sources.json") || [];
  return _sources;
}

function getReviewItems() {
  if (!_review) _review = loadJson("src/data/product-truth-review-items.json") || [];
  return _review;
}

function getFunnel() {
  if (!_funnel) _funnel = loadJson("src/data/product-truth-funnel.json") || {};
  return _funnel;
}

function getSearchIndex() {
  if (!_searchIndex) _searchIndex = loadJson("src/data/product-truth-search-index.json") || [];
  return _searchIndex;
}

// ── Search implementation ──────────────────────────────────────────────────

/**
 * Normalize a query string for matching.
 * Same normalization applied to both query and search tokens.
 */
function normalizeQuery(q) {
  return String(q || "")
    .toLowerCase()
    .replace(/[,\/\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Score a search index entry against query terms.
 * Returns a numeric score: higher = better match.
 * Returns 0 if no match found.
 */
function scoreEntry(entry, queryTerms) {
  const tokens = entry.tokens || [];
  let score = 0;
  let matched = 0;

  for (const term of queryTerms) {
    if (!term || term.length < 2) continue;
    let termMatched = false;
    for (const token of tokens) {
      if (token === term) {
        score += 3; // exact match
        termMatched = true;
        break;
      } else if (token.startsWith(term)) {
        score += 2; // prefix match
        termMatched = true;
        break;
      } else if (token.includes(term)) {
        score += 1; // substring match
        termMatched = true;
        break;
      }
    }
    if (termMatched) matched++;
  }

  // Require at least one term to match
  if (matched === 0) return 0;
  // Bonus if all terms matched
  if (matched === queryTerms.length) score += 2;

  return score;
}

/**
 * Search the product truth index for a given query.
 * Returns { results, total, page, limit }.
 */
function search({ q, ptType, validationStatus, page = 1, limit = 50 }) {
  const searchIndex = getSearchIndex();
  if (!searchIndex.length) {
    return { results: [], total: 0, page, limit };
  }

  const normalizedQ = normalizeQuery(q || "");
  const queryTerms = normalizedQ.split(" ").filter((t) => t.length >= 1);
  const hasQuery = queryTerms.length > 0 && normalizedQ.trim().length >= 1;

  let scored = [];

  for (const entry of searchIndex) {
    // Filter by product type
    if (ptType && entry.display?.productType !== ptType) continue;
    // Filter by validation status
    if (validationStatus && entry.display?.validationStatus !== validationStatus) continue;

    if (hasQuery) {
      const score = scoreEntry(entry, queryTerms);
      if (score > 0) {
        scored.push({ entry, score });
      }
    } else {
      // No query: return all (paginated)
      scored.push({ entry, score: 1 });
    }
  }

  // Sort by score descending, then by active status
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aActive = a.entry.display?.active ? 1 : 0;
    const bActive = b.entry.display?.active ? 1 : 0;
    return bActive - aActive;
  });

  const total = scored.length;
  const startIdx = (page - 1) * limit;
  const pageResults = scored.slice(startIdx, startIdx + limit).map((s) => ({
    id: s.entry.id,
    score: s.score,
    ...s.entry.display,
  }));

  return { results: pageResults, total, page, limit };
}

// ── Handler ────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Auth check
  const accessCode = event.headers?.["x-access-code"] || event.queryStringParameters?.code;
  if (accessCode !== ACCESS_CODE) {
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || "search";

  // Allowlist check — reject unknown actions
  if (!ALLOWED_ACTIONS.has(action)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Unknown action", allowedActions: [...ALLOWED_ACTIONS] }),
    };
  }

  try {
    let data;

    switch (action) {
      case "search": {
        const page  = Math.max(1, parseInt(params.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(params.limit, 10) || 50));
        data = search({
          q:                params.q || "",
          ptType:           params.type || "",
          validationStatus: params.status || "",
          page,
          limit,
        });
        break;
      }

      case "product": {
        const id = params.id;
        if (!id) {
          return {
            statusCode: 400,
            headers: CORS,
            body: JSON.stringify({ error: "Missing id parameter" }),
          };
        }
        const canonical = getCanonical();
        const product = canonical.find((p) => p.canonicalId === id);
        if (!product) {
          return {
            statusCode: 404,
            headers: CORS,
            body: JSON.stringify({ error: "Product not found", id }),
          };
        }
        // Also attach alias count and source count
        const aliases = getAliases().filter((a) => a.canonicalProductId === id);
        const sources = getSources().filter((s) => s.canonicalProductId === id);
        data = { product, aliasCount: aliases.length, sourceCount: sources.length };
        break;
      }

      case "aliases": {
        const id = params.id;
        if (!id) {
          return {
            statusCode: 400,
            headers: CORS,
            body: JSON.stringify({ error: "Missing id parameter" }),
          };
        }
        const aliases = getAliases().filter((a) => a.canonicalProductId === id);
        data = { id, aliases };
        break;
      }

      case "sources": {
        const id = params.id;
        if (!id) {
          return {
            statusCode: 400,
            headers: CORS,
            body: JSON.stringify({ error: "Missing id parameter" }),
          };
        }
        const sources = getSources().filter((s) => s.canonicalProductId === id);
        data = { id, sources };
        break;
      }

      case "review-items": {
        const severity = params.severity;
        let items = getReviewItems();
        if (severity) items = items.filter((i) => i.severity === severity);
        const page  = Math.max(1, parseInt(params.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(params.limit, 10) || 100));
        const total = items.length;
        const startIdx = (page - 1) * limit;
        data = {
          items: items.slice(startIdx, startIdx + limit),
          total,
          page,
          limit,
        };
        break;
      }

      case "funnel": {
        data = getFunnel();
        break;
      }

      case "resolve-import": {
        // Placeholder: resolve the product names from a committed import
        // against the current canonical Product Truth artifacts.
        // Full implementation requires querying usage import rows from Neon DB.
        // This endpoint returns a scaffold response indicating the pipeline
        // is ready to be connected when Neon persistence is available.
        const importId = params.importId;
        const funnel = getFunnel();
        data = {
          importId: importId || null,
          status: "pipeline_ready",
          message:
            "Product Truth resolution pipeline is ready. Connect Neon usage import rows " +
            "to enable per-import resolution metrics.",
          productTruthVersion: {
            generatedAt: funnel.generatedAt,
            canonicalProductsCreated: funnel.canonicalProductsCreated || 0,
            approvedCanonicalProducts: funnel.approvedCanonicalProducts || 0,
          },
          summary: {
            reportId: importId || null,
            totalUsageRows: 0,
            uniqueRawProductNames: 0,
            resolvedUsageRows: 0,
            resolvedAuto: 0,
            resolvedAlias: 0,
            suggestedMatches: 0,
            unresolvedUsageRows: 0,
            resolutionRate: 0,
            uniqueCanonicalProducts: 0,
          },
          unresolvedItems: [],
        };
        break;
      }

      case "reprocess-info": {
        // Returns current Product Truth version info so callers can determine
        // which imports need to be reprocessed after a Product Truth rebuild.
        const funnel = getFunnel();
        data = {
          currentProductTruthVersion: {
            generatedAt: funnel.generatedAt || null,
            canonicalProductsCreated: funnel.canonicalProductsCreated || 0,
            approvedCanonicalProducts: funnel.approvedCanonicalProducts || 0,
            totalAliases: funnel.totalAliases || 0,
            totalSources: funnel.totalSources || 0,
            totalReviewItems: funnel.totalReviewItems || 0,
          },
          reprocessingStatus: {
            description:
              "Reprocessing affected usage resolutions after a Product Truth rebuild " +
              "is available via the Data Intelligence > Usage Imports panel. " +
              "When Product Truth is connected to Neon, this endpoint will return " +
              "the list of affected import IDs and resolution counts.",
            affectedImports: [],
            affectedResolutions: 0,
            requiresManualTrigger: true,
          },
        };
        break;
      }

      default:
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: "Unknown action" }),
        };
    }

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("product-truth-search error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
