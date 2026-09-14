import type { StartNowSeed } from "./types";

const HANDOFF_STORAGE_KEY = "spectra.startNow.handoff.v1";

export function saveStartNowHandoff(seed: StartNowSeed): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    /* Continue without prefill when storage is unavailable. */
  }
}

export function loadStartNowHandoff(): StartNowSeed | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_STORAGE_KEY);
    if (!raw) return undefined;
    const value = JSON.parse(raw) as StartNowSeed;
    return value && typeof value === "object" ? value : undefined;
  } catch {
    return undefined;
  }
}
