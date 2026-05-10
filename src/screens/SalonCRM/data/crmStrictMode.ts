/**
 * Strict mode controller.
 *
 * Strict mode is dev-only by default. It elevates structured failures
 * into thrown `CRMDomainError`s so bugs surface immediately during
 * development. Production keeps the calmer behaviour: actions return
 * `{ ok: false, error }`, validation only logs.
 *
 * Toggle via `setCRMStrictMode(...)` from tests, simulation, or a
 * developer console. Read via `getCRMStrictMode()` inside core
 * modules; never import this file from screens.
 */

import {
  CRMDomainError,
  DEFAULT_DEV_STRICT_MODE,
  DEFAULT_PROD_STRICT_MODE,
  type CRMError,
  type CRMStrictModeConfig,
} from "./crmContracts";

function detectDev(): boolean {
  // Vite replaces `process.env.NODE_ENV` statically at build time and
  // Jest / Node expose it natively. Both paths converge here without
  // needing `import.meta`, which would break Rollup's static parser.
  try {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    if (env && env.NODE_ENV) return env.NODE_ENV !== "production";
  } catch {
    // ignore
  }
  return false;
}

let currentConfig: CRMStrictModeConfig = detectDev()
  ? { ...DEFAULT_DEV_STRICT_MODE }
  : { ...DEFAULT_PROD_STRICT_MODE };

export function getCRMStrictMode(): CRMStrictModeConfig {
  return currentConfig;
}

export function setCRMStrictMode(patch: Partial<CRMStrictModeConfig>): void {
  currentConfig = { ...currentConfig, ...patch };
}

export function resetCRMStrictMode(): void {
  currentConfig = detectDev()
    ? { ...DEFAULT_DEV_STRICT_MODE }
    : { ...DEFAULT_PROD_STRICT_MODE };
}

/** Throw `CRMDomainError` if strict mode is configured to throw on
 *  action failures. Otherwise return silently. */
export function maybeThrowOnActionFailure(error: CRMError): void {
  if (currentConfig.throwOnActionFailure) {
    throw new CRMDomainError(error);
  }
}

/** Throw `CRMDomainError` if strict mode is configured to throw on
 *  invalid state. Otherwise return silently. */
export function maybeThrowOnInvalidState(error: CRMError): void {
  if (currentConfig.throwOnInvalidState) {
    throw new CRMDomainError(error);
  }
}

/** Emit a console warning if strict mode is configured to warn on
 *  adapter misuse. */
export function maybeWarnOnAdapterMisuse(message: string, details?: unknown): void {
  if (currentConfig.warnOnAdapterMisuse) {
    // eslint-disable-next-line no-console
    console.warn(`[CRM:strict] adapter misuse — ${message}`, details ?? "");
  }
}
