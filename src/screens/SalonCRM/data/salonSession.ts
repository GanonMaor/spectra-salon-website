/**
 * Salon session helper (frontend).
 *
 * Salon-runtime APIs derive `salon_id` from an authenticated session on the
 * server (see netlify/functions/_salon-context.js). The frontend therefore
 * only carries an opaque bearer token — it must NEVER send a salon id to the
 * server. This module centralizes reading/writing that token and building the
 * Authorization header used by the salon-scoped API client.
 */

const SALON_SESSION_TOKEN_KEY = "spectra.salonSessionToken";
const SALON_LOGIN_STATE_KEY = "spectra.salonLoginState";

export interface SalonLoginState {
  salonId: string;
  userId: string;
  role?: string;
  devMode?: boolean;
  loggedInAt?: string;
}

export function getSalonSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SALON_SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getSalonLoginState(): SalonLoginState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SALON_LOGIN_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SalonLoginState;
    if (!parsed || typeof parsed !== "object" || !parsed.salonId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * A CRM session is active when we hold a signed bearer token (production) or a
 * local dev login state (local dev issues no token). The route guard uses this
 * to decide whether `/crm/*` is accessible without silently loading a default
 * tenant.
 */
export function hasActiveSalonSession(): boolean {
  return Boolean(getSalonSessionToken()) || getSalonLoginState() !== null;
}

/**
 * A stable per-session scope key used to namespace client-side caches so one
 * salon/user can never read another's cached CRM state from the same browser.
 */
export function getSalonScopeKey(): string {
  const state = getSalonLoginState();
  if (state?.salonId) return `${state.salonId}:${state.userId || "user"}`;
  return "anonymous";
}

/** Clear the entire salon session (token + login state). Used on logout. */
export function clearSalonSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SALON_SESSION_TOKEN_KEY);
    window.localStorage.removeItem(SALON_LOGIN_STATE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

export function setSalonSessionToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(SALON_SESSION_TOKEN_KEY, token);
    else window.localStorage.removeItem(SALON_SESSION_TOKEN_KEY);
  } catch {
    /* ignore storage failures */
  }
}

/**
 * Build request headers for salon-scoped API calls. Only ever adds the bearer
 * token — deliberately never a salon id — so the server stays the sole
 * authority over tenant scoping.
 */
export function salonAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extra ?? {}),
  };
  const token = getSalonSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
