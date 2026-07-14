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
  exp?: number;
  devMode?: boolean;
  loggedInAt?: string;
}

let authRedirectStarted = false;

// ── Session change notifications ──────────────────────────────────
//
// The CRM data layer needs a single, authoritative signal for "the salon
// identity backing this browser session changed" (login, logout, tenant
// replacement, cross-tab storage edit). Subscribers re-scope caches and
// re-run bootstrap under the new identity instead of silently serving
// another tenant's state.

type SalonSessionListener = () => void;

const sessionListeners = new Set<SalonSessionListener>();
const cacheCleaners = new Set<() => void>();
let storageListenerAttached = false;

function notifySalonSessionChange(): void {
  for (const listener of Array.from(sessionListeners)) {
    try {
      listener();
    } catch (err) {
      console.warn("[salonSession] session listener failed", err);
    }
  }
}

function runSalonCacheCleaners(): void {
  for (const cleaner of Array.from(cacheCleaners)) {
    try {
      cleaner();
    } catch (err) {
      console.warn("[salonSession] cache cleaner failed", err);
    }
  }
}

function ensureStorageListener(): void {
  if (storageListenerAttached || typeof window === "undefined") return;
  storageListenerAttached = true;
  window.addEventListener("storage", (event) => {
    // Only react to our own keys so unrelated storage writes do not churn
    // the CRM bootstrap. A null key means storage.clear() — always react.
    if (
      event.key === null
      || event.key === SALON_SESSION_TOKEN_KEY
      || event.key === SALON_LOGIN_STATE_KEY
    ) {
      notifySalonSessionChange();
    }
  });
}

/**
 * Subscribe to salon-session identity changes. Returns an unsubscribe fn.
 * Fires on login, logout, token replacement, and cross-tab storage edits.
 */
export function subscribeSalonSession(listener: SalonSessionListener): () => void {
  ensureStorageListener();
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

/**
 * Register a scoped-cache cleaner run on logout / auth failure, while the
 * outgoing salon scope is still resolvable. Returns an unregister fn.
 */
export function registerSalonCacheCleaner(cleaner: () => void): () => void {
  cacheCleaners.add(cleaner);
  return () => {
    cacheCleaners.delete(cleaner);
  };
}

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1";
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
  const token = getSalonSessionToken();
  if (token) return true;

  const state = getSalonLoginState();
  // Tokenless sessions are only valid for local dev fallback. A stale
  // production loginState without a bearer token must not unlock /crm/*.
  return Boolean(state?.devMode && isLocalDevHost());
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

/**
 * A fingerprint that changes whenever the salon identity backing the current
 * session changes: it encodes salon + user + token. Bootstrap/hydration
 * captures this before fetching and rejects any response that resolves under a
 * different fingerprint, so a stale request from a previous login can never
 * overwrite the current tenant's state.
 */
export function getSalonSessionFingerprint(): string {
  const state = getSalonLoginState();
  const token = getSalonSessionToken();
  const salonId = state?.salonId || "anonymous";
  const userId = state?.userId || "user";
  // The token identifies the authenticated principal; for tokenless local dev
  // sessions fall back to a stable dev marker so logout still flips the value.
  const tokenPart = token ? `t:${token}` : state?.devMode ? "dev" : "none";
  return `${salonId}::${userId}::${tokenPart}`;
}

/**
 * Persist the salon login state and notify subscribers. Centralizes the
 * login / session-replacement transition so identity changes always emit a
 * single change signal to the data layer.
 */
export function setSalonLoginState(state: SalonLoginState | null): void {
  if (typeof window === "undefined") return;
  ensureStorageListener();
  try {
    if (state) {
      window.localStorage.setItem(SALON_LOGIN_STATE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(SALON_LOGIN_STATE_KEY);
    }
  } catch {
    /* ignore storage failures */
  }
  notifySalonSessionChange();
}

/** Clear the entire salon session (token + login state). Used on logout. */
export function clearSalonSession(): void {
  if (typeof window === "undefined") return;
  // Run cache cleaners BEFORE removing storage so the outgoing salon scope is
  // still resolvable and each cleaner drops the correct tenant's cache.
  runSalonCacheCleaners();
  try {
    window.localStorage.removeItem(SALON_SESSION_TOKEN_KEY);
    window.localStorage.removeItem(SALON_LOGIN_STATE_KEY);
  } catch {
    /* ignore storage failures */
  }
  notifySalonSessionChange();
}

export function canCallSalonRuntimeApi(): boolean {
  const state = getSalonLoginState();
  if (state?.devMode && isLocalDevHost()) return false;
  return hasActiveSalonSession();
}

export function handleSalonAuthFailure(status?: number): void {
  if (status !== 401 || typeof window === "undefined" || authRedirectStarted) return;
  if (!window.location.pathname.startsWith("/crm")) return;
  const state = getSalonLoginState();
  // Local Vite demo sessions intentionally have no bearer token. Runtime API
  // calls may still hit/proxy production and return 401; that must not clear
  // the local demo session or bounce the user back to login.
  if (state?.devMode && isLocalDevHost()) return;

  authRedirectStarted = true;
  clearSalonSession();
  const redirect = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/user-login?redirect=${encodeURIComponent(redirect)}`);
}

export function setSalonSessionToken(token: string | null): void {
  if (typeof window === "undefined") return;
  ensureStorageListener();
  try {
    if (token) window.localStorage.setItem(SALON_SESSION_TOKEN_KEY, token);
    else window.localStorage.removeItem(SALON_SESSION_TOKEN_KEY);
  } catch {
    /* ignore storage failures */
  }
  notifySalonSessionChange();
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
