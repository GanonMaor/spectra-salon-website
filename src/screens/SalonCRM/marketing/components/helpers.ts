import { createContext, useContext } from "react";
import { useCrmLocale } from "../../i18n/CrmLocale";
import { resolveIntervalDays } from "../engine";
import type { MarketingCopy } from "../i18n";
import type { MarketingAlert } from "../metrics";
import { resolveToken, VARIABLES } from "../templates";
import { formatDateTime } from "../time";
import type {
  Automation,
  AutomationKind,
  AutomationVersion,
  LanguageCode,
  MarketingDataset,
  MessageReason,
  SmsSettings,
} from "../types";
import { fmt } from "./ui";

export function useMarketingCopy(): { m: MarketingCopy; lang: LanguageCode; isRTL: boolean } {
  const { t, lang, isRTL } = useCrmLocale();
  return { m: t.marketing, lang, isRTL };
}

export type MarketingView = "home" | "history";

export interface MarketingUi {
  view: MarketingView;
  goHome: () => void;
  openHistory: (filters?: Record<string, string | null>) => void;
  editKind: AutomationKind | null;
  openEditor: (kind: AutomationKind | null) => void;
  openMessage: (id: string) => void;
  openSettings: () => void;
  notify: (text: string, tone?: "good" | "bad" | "info") => void;
}

export const MarketingUiContext = createContext<MarketingUi | null>(null);

export function useMarketingUi(): MarketingUi {
  const ctx = useContext(MarketingUiContext);
  if (!ctx) throw new Error("useMarketingUi must be used inside MarketingUiContext");
  return ctx;
}

export function languageName(m: MarketingCopy, lang: LanguageCode): string {
  return lang === "he" ? m.settings.he : m.settings.en;
}

export function variableLabel(key: string, lang: LanguageCode): string {
  const resolved = resolveToken(key);
  const definition = VARIABLES.find((variable) => variable.key === (resolved ?? key));
  return definition ? definition.labels[lang] : key;
}

export function reasonText(
  m: MarketingCopy,
  reason: MessageReason | undefined,
  detail: string | undefined,
  settings: SmsSettings,
  lang: LanguageCode,
): string {
  if (!reason) return "";
  const readableDetail = detail
    ? detail
        .split(",")
        .map((part) => variableLabel(part.trim(), lang))
        .join(", ")
    : "—";
  return fmt(m.reasons[reason], {
    start: settings.marketingWindow.start,
    end: settings.marketingWindow.end,
    days: settings.frequencyCapDays,
    detail: readableDetail,
  });
}

export function describeTiming(m: MarketingCopy, kind: AutomationKind, version: AutomationVersion): string {
  const timing = version.timing;
  if (kind === "appointment_reminder" && timing.type === "day_before") {
    return fmt(m.kinds[kind].trigger, { time: timing.time });
  }
  if (kind === "rebooking_invite") {
    const days = resolveIntervalDays(version, "__general__");
    if (!days) return m.rebookingNoInterval;
    return fmt(m.kinds[kind].trigger, { days, time: timing.type === "after_service" ? timing.time : "10:00" });
  }
  return m.kinds[kind].trigger;
}

/** Alerts that need the owner to do something; everything else lives in history. */
const ACTION_ALERTS: MarketingAlert["kind"][] = ["sms_not_connected", "budget_paused", "failed_recent", "missing_variables"];

export function actionAlert(alerts: MarketingAlert[]): MarketingAlert | null {
  for (const kind of ACTION_ALERTS) {
    const alert = alerts.find((item) => item.kind === kind);
    if (alert) return alert;
  }
  return null;
}

export function rebookingNeedsSetup(automation: Automation): boolean {
  return automation.kind === "rebooking_invite" && !resolveIntervalDays(automation.published, "__general__");
}

export function customerName(dataset: MarketingDataset, id: string, fallback: string): string {
  const customer = dataset.customers.find((item) => item.id === id);
  if (!customer) return fallback;
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}

export function serviceNames(dataset: MarketingDataset, ids: string[]): string {
  return ids
    .map((id) => dataset.services.find((service) => service.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

export function when(iso: string | undefined, timeZone: string, lang: LanguageCode): string {
  return iso ? formatDateTime(iso, timeZone, lang) : "—";
}
