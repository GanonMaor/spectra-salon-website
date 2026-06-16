/**
 * src/lib/product-truth/usageResolverClient.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Client-side hooks for usage import resolution against Product Truth.
 *
 * Bridges the existing usageImportClient with canonical Product Truth
 * resolution metrics so the admin can see:
 *   - how many rows resolved automatically
 *   - how many resolved via alias
 *   - suggested matches needing review
 *   - unresolved items routed to Review Queue
 */

import type { UsageResolutionSummary, UsageProductResolution } from "../types/productTruth";
import { PRODUCT_TRUTH_ACCESS_CODE } from "./productTruthRepository";

const RESOLVE_FN = "/.netlify/functions/product-truth-search";

// ── Per-import resolution metrics ──────────────────────────────────────────

export interface ImportResolutionResult {
  importId: string | number;
  summary: UsageResolutionSummary;
  unresolvedItems: { rawProductName: string; normalizedName: string; candidates?: string[] }[];
}

/**
 * Request resolution metrics for a committed usage import.
 * The server loads the import's raw product names and resolves them
 * against the current canonical Product Truth artifacts.
 */
export async function resolveImportProducts(importId: string | number): Promise<ImportResolutionResult> {
  const params = new URLSearchParams({
    action: "resolve-import",
    importId: String(importId),
  });
  const res = await fetch(`${RESOLVE_FN}?${params}`, {
    headers: { "X-Access-Code": PRODUCT_TRUTH_ACCESS_CODE },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resolution API ${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json() as Promise<ImportResolutionResult>;
}

// ── Usage analytics by canonical product ──────────────────────────────────

export interface CanonicalUsageSummary {
  reportId: string | null;
  totalUsageRows: number;
  uniqueRawProductNames: number;
  resolvedUsageRows: number;
  resolutionRate: number;
  uniqueCanonicalProducts: number;
  usageByBrand: [string, number][];
  usageByProductType: [string, number][];
  usageByCanonicalProduct: {
    canonicalId: string;
    brand: string;
    series: string;
    shade: string;
    productType: string;
    count: number;
  }[];
}

// ── Local resolution summary calculation ──────────────────────────────────

/**
 * Calculate a resolution summary from an array of already-resolved rows.
 * Used by UsageImportPanel when the server returns enriched rows.
 */
export function calcResolutionSummary(
  rows: UsageProductResolution[],
  reportId: string | null = null
): UsageResolutionSummary {
  const unique = new Set(rows.map((r) => r.rawProductName).filter(Boolean));
  let resolvedAuto = 0;
  let resolvedAlias = 0;
  let suggested = 0;
  let unresolved = 0;

  for (const r of rows) {
    const st = r.reviewStatus;
    const method = r.matchMethod || "";
    if (st === "unresolved" || st === "empty") {
      unresolved++;
    } else if (st === "suggested_match") {
      suggested++;
    } else if (method.startsWith("alias:")) {
      resolvedAlias++;
    } else {
      resolvedAuto++;
    }
  }

  const resolved = resolvedAuto + resolvedAlias;
  const rate = unique.size > 0 ? Math.round((resolved / unique.size) * 100 * 10) / 10 : 0;

  return {
    reportId,
    totalUsageRows: rows.length,
    uniqueRawProductNames: unique.size,
    resolvedUsageRows: resolved,
    resolvedAuto,
    resolvedAlias,
    suggestedMatches: suggested,
    unresolvedUsageRows: unresolved,
    resolutionRate: rate,
    uniqueCanonicalProducts: new Set(rows.map((r) => r.canonicalProductId).filter(Boolean)).size,
  };
}
