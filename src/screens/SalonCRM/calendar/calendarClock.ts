export interface SalonClockParts {
  dateKey: string;
  hour: number;
  minute: number;
  second: number;
  hourFloat: number;
  label: string;
}

const COUNTRY_DEFAULT_TIMEZONES: Readonly<Record<string, string>> = {
  IL: "Asia/Jerusalem",
  US: "America/New_York",
  GB: "Europe/London",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  CA: "America/Toronto",
  AU: "Australia/Sydney",
};

export function isValidIanaTimeZone(value: string | null | undefined): value is string {
  if (!value?.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function getDeviceTimeZone(): string | null {
  try {
    const value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimeZone(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Calendar timezone priority:
 * 1. Explicit persisted salon timezone.
 * 2. Country default for legacy UTC/missing records.
 * 3. Device IANA timezone.
 * 4. UTC as the deterministic final fallback.
 *
 * UTC is treated as a legacy placeholder when the salon has a supported
 * non-UTC country. None of the currently supported countries uses fixed UTC
 * year-round; their IANA zones are required for daylight-saving transitions.
 */
export function resolveSalonTimeZone(input: {
  configuredTimeZone?: string | null;
  countryCode?: string | null;
  deviceTimeZone?: string | null;
}): string {
  const configured = input.configuredTimeZone?.trim();
  const countryDefault = COUNTRY_DEFAULT_TIMEZONES[(input.countryCode ?? "").toUpperCase()];
  const configuredIsLegacyUtc = configured === "UTC" && Boolean(countryDefault);

  if (!configuredIsLegacyUtc && isValidIanaTimeZone(configured)) return configured;
  if (isValidIanaTimeZone(countryDefault)) return countryDefault;
  if (isValidIanaTimeZone(input.deviceTimeZone)) return input.deviceTimeZone;
  return "UTC";
}

export function getZonedNowParts(timeZone: string, instant: Date = new Date()): SalonClockParts {
  const safeTimeZone = isValidIanaTimeZone(timeZone) ? timeZone : "UTC";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  const hour = Number(value("hour"));
  const minute = Number(value("minute"));
  const second = Number(value("second"));

  return {
    dateKey: `${value("year")}-${value("month")}-${value("day")}`,
    hour,
    minute,
    second,
    hourFloat: hour + minute / 60 + second / 3600,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function calculateNowScrollTop(input: {
  hourFloat: number;
  hourStart: number;
  hourEnd: number;
  slotHeight: number;
  viewportHeight: number;
  headerOffset?: number;
  anchorRatio?: number;
}): number | null {
  if (input.hourFloat < input.hourStart || input.hourFloat > input.hourEnd) return null;
  const nowTop = (input.hourFloat - input.hourStart) * input.slotHeight;
  const headerOffset = input.headerOffset ?? 0;
  const anchorRatio = input.anchorRatio ?? 0.32;
  return Math.max(0, nowTop + headerOffset - input.viewportHeight * anchorRatio);
}
