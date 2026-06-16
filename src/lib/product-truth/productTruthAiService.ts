/**
 * src/lib/product-truth/productTruthAiService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Client-side wrapper for the secure Product Truth AI endpoint.
 *
 * Wraps: /.netlify/functions/product-truth-ai
 * Only allowlisted operations accepted — no generic prompt proxy.
 */

import type { AIOperation, AIOperationParams, AIResult } from "../types/productTruth";
import { PRODUCT_TRUTH_ACCESS_CODE } from "./productTruthRepository";

const AI_FN = "/.netlify/functions/product-truth-ai";

export interface AIResponse {
  result: AIResult;
  requestId: string;
  operation: AIOperation;
}

export async function runAIOperation(params: AIOperationParams): Promise<AIResponse> {
  const res = await fetch(AI_FN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Code": PRODUCT_TRUTH_ACCESS_CODE,
    },
    body: JSON.stringify({
      operation: params.operation,
      // Only allowed fields — no prompts, model names, or SQL
      ...(params.productId   ? { productId: params.productId }     : {}),
      ...(params.candidateId ? { candidateId: params.candidateId } : {}),
      ...(params.query       ? { query: params.query }             : {}),
      ...(params.question    ? { question: params.question }       : {}),
      ...(params.reportId    ? { reportId: params.reportId }       : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(body.error || `AI API error ${res.status}`);
  }

  return res.json() as Promise<AIResponse>;
}

export async function checkAIAvailability(): Promise<boolean> {
  try {
    const res = await fetch(AI_FN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": PRODUCT_TRUTH_ACCESS_CODE,
      },
      body: JSON.stringify({ operation: "search_products", query: "ping" }),
    });
    return res.status !== 503;
  } catch {
    return false;
  }
}
