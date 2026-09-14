import type { AccountDetails, StartNowSeed, StylistCountRange } from "./types";

const STYLIST_VALUES = new Set<StylistCountRange>(["1", "2-5", "6-15", "16+"]);

export type StartNowSearch = string | URLSearchParams | Record<string, string | undefined> | null;

function asParams(search: StartNowSearch): URLSearchParams {
  if (!search) return new URLSearchParams();
  if (typeof search === "string") {
    const trimmed = search.startsWith("?") ? search.slice(1) : search;
    return new URLSearchParams(trimmed);
  }
  if (search instanceof URLSearchParams) return search;
  const params = new URLSearchParams();
  Object.entries(search).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
}

function readStylistCount(value: string | null): StylistCountRange | "" {
  if (!value) return "";
  return STYLIST_VALUES.has(value as StylistCountRange) ? (value as StylistCountRange) : "";
}

/**
 * Query-compatible seed parser.
 * Accepts demoBookingId and optional account fields. Callers should avoid
 * putting PII in the URL when a props seed is available.
 */
export function parseStartNowSearch(search?: StartNowSearch): StartNowSeed {
  const params = asParams(search ?? null);
  const stylistCount = readStylistCount(params.get("stylistCount"));

  return {
    demoBookingId: params.get("demoBookingId")?.trim() || undefined,
    salonName: params.get("salonName")?.trim() || undefined,
    contactName: params.get("contactName")?.trim() || undefined,
    workEmail: params.get("workEmail")?.trim() || undefined,
    country: params.get("country")?.trim() || undefined,
    stylistCount: stylistCount || undefined,
  };
}

export function applyAccountSeed(account: AccountDetails, seed?: StartNowSeed | null): AccountDetails {
  if (!seed) return account;
  return {
    salonName: account.salonName || seed.salonName || "",
    contactName: account.contactName || seed.contactName || "",
    workEmail: account.workEmail || seed.workEmail || "",
    country: account.country || seed.country || "",
    stylistCount: account.stylistCount || seed.stylistCount || "",
  };
}

export function resolveSearch(search?: StartNowSearch): StartNowSearch {
  if (search !== undefined && search !== null) return search;
  if (typeof window !== "undefined") return window.location.search;
  return "";
}
