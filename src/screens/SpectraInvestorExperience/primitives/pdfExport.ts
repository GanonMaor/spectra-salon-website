import { useMemo } from "react";

/** True when the deck is captured as a static investor PDF (`?pdf=1`). */
export function isPdfExportMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("pdf") === "1";
}

export function usePdfExportMode(): boolean {
  return useMemo(() => isPdfExportMode(), []);
}
