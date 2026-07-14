/**
 * Shared salon-runtime API client.
 *
 * Netlify salon functions that return the `{ ok, data, meta }` envelope
 * (professional-roles, invitations, …) share the same auth/error contract:
 *   * The bearer token is attached lazily (never a salon id — the server is
 *     the sole tenant authority).
 *   * A `{ ok: false, error }` body or a non-2xx status raises `SalonApiError`
 *     carrying the stable server error code + details so the UI can react
 *     precisely (e.g. surface REQUIRES_OWNER_APPROVAL vs a generic failure).
 *   * A 204 resolves to `undefined` data.
 *
 * This centralizes the boilerplate that `crmServicesApi` established so new
 * adapters stay thin and consistent.
 */

import { canCallSalonRuntimeApi, handleSalonAuthFailure, salonAuthHeaders } from "./salonSession";

export class SalonApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "SalonApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface SalonApiResult<T> {
  data: T;
  meta: Record<string, unknown>;
}

/**
 * Call a salon Netlify function that returns the `{ ok, data, meta }` envelope
 * and unwrap it. Throws `SalonApiError` on failure.
 */
export async function callSalonJson<T>(
  functionName: string,
  path: string,
  init?: RequestInit,
): Promise<SalonApiResult<T>> {
  if (!canCallSalonRuntimeApi()) {
    throw new SalonApiError("NO_SESSION", "A salon session is required for this action.", 401);
  }

  const res = await fetch(`/.netlify/functions/${functionName}${path}`, {
    ...init,
    headers: salonAuthHeaders(init?.body ? { "Content-Type": "application/json" } : undefined),
  });

  if (res.status === 204) {
    return { data: undefined as unknown as T, meta: {} };
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new SalonApiError(
      "NON_JSON",
      text.trim().startsWith("<")
        ? "Netlify Functions are not available on this URL. Open the app through Netlify Dev."
        : `${functionName} returned a non-JSON response (${res.status}).`,
      res.status,
    );
  }

  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; data?: T; meta?: Record<string, unknown>; error?: { code?: string; message?: string; details?: unknown } }
    | null;

  if (!res.ok || (body && body.ok === false)) {
    handleSalonAuthFailure(res.status);
    const err = body?.error ?? {};
    throw new SalonApiError(
      typeof err.code === "string" ? err.code : "REQUEST_FAILED",
      typeof err.message === "string" ? err.message : `${functionName} request failed (${res.status}).`,
      res.status,
      err.details,
    );
  }

  return { data: (body?.data ?? (body as unknown as T)) as T, meta: body?.meta ?? {} };
}

/** Convert any thrown value into a human-friendly message. */
export function salonApiErrorMessage(error: unknown): string {
  if (error instanceof SalonApiError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}
