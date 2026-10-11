/**
 * Sample data for previews and test sends. Prefers a real upcoming visit from
 * the active dataset; otherwise builds a clearly fictional example.
 */

import { renderMessage, type RenderedMessage } from "./engine";
import { addMinutes, atLocalTimeAfterDays, isBefore } from "./time";
import type {
  AutomationKind,
  AutomationVersion,
  LanguageCode,
  MarketingAppointment,
  MarketingCustomer,
  MarketingDataset,
  SmsSettings,
} from "./types";

export interface PreviewSample {
  customer: MarketingCustomer;
  appointment?: MarketingAppointment;
  serviceIds: string[];
  isFictional: boolean;
  label: string;
}

const SAMPLE_SERVICE_ID = "sample-service";

export function listSamples(dataset: MarketingDataset, kind: AutomationKind, now: string): PreviewSample[] {
  const wantsCompleted = kind === "rebooking_invite";
  const samples: PreviewSample[] = [];
  for (const appointment of dataset.appointments) {
    const customer = dataset.customers.find((item) => item.id === appointment.customerId);
    if (!customer || !appointment.serviceIds.length) continue;
    const fits = wantsCompleted
      ? appointment.status === "completed"
      : appointment.status !== "completed" && appointment.status !== "no-show" && isBefore(now, appointment.startTime);
    if (!fits) continue;
    const names = appointment.serviceIds
      .map((id) => dataset.services.find((service) => service.id === id)?.name)
      .filter(Boolean)
      .join(" + ");
    samples.push({
      customer,
      appointment,
      serviceIds: wantsCompleted ? [appointment.serviceIds[0]] : appointment.serviceIds,
      isFictional: false,
      label: `${customer.firstName} · ${names}`,
    });
  }
  return samples.slice(0, 12);
}

export function fictionalSample(
  dataset: MarketingDataset,
  kind: AutomationKind,
  lang: LanguageCode,
  now: string,
  timeZone: string,
): { sample: PreviewSample; dataset: MarketingDataset } {
  const service = dataset.services[0] ?? {
    id: SAMPLE_SERVICE_ID,
    name: lang === "he" ? "תספורת" : "Haircut",
    durationMinutes: 60,
    priceCents: null,
  };
  const start = atLocalTimeAfterDays(now, timeZone, kind === "rebooking_invite" ? -40 : 1, "11:00");
  const end = addMinutes(start, service.durationMinutes ?? 60);
  const customer: MarketingCustomer = {
    id: "sample-customer",
    firstName: lang === "he" ? "נועה" : "Noa",
    phone: "050-000-0000",
    language: lang,
    consent: { transactional: { status: "granted" }, marketing: { status: "granted" } },
  };
  const appointment: MarketingAppointment = {
    id: "sample-appointment",
    customerId: customer.id,
    serviceIds: [service.id],
    staffName: lang === "he" ? "דנה" : "Dana",
    startTime: start,
    endTime: end,
    status: kind === "rebooking_invite" ? "completed" : kind === "appointment_cancelled" ? "cancelled" : "confirmed",
    createdAt: now,
    completedAt: kind === "rebooking_invite" ? end : undefined,
  };
  return {
    sample: { customer, appointment, serviceIds: [service.id], isFictional: true, label: lang === "he" ? "דוגמה" : "Example" },
    dataset: {
      ...dataset,
      salon: { ...dataset.salon, name: dataset.salon.name || (lang === "he" ? "הסלון שלך" : "Your salon") },
      services: dataset.services.length ? dataset.services : [service],
      customers: [customer],
      appointments: [appointment],
    },
  };
}

export function renderPreview(
  dataset: MarketingDataset,
  settings: SmsSettings,
  kind: AutomationKind,
  version: AutomationVersion,
  lang: LanguageCode,
  sample: PreviewSample,
): RenderedMessage {
  const previewSettings: SmsSettings = {
    ...settings,
    enabledLanguages: [lang],
    defaultLanguage: settings.enabledLanguages.includes(settings.defaultLanguage) ? settings.defaultLanguage : lang,
  };
  const scoped: MarketingDataset = {
    ...dataset,
    customers: [{ ...sample.customer, language: lang }],
    appointments: sample.appointment ? [sample.appointment] : [],
  };
  return renderMessage(
    { dataset: scoped, settings: { ...previewSettings, enabledLanguages: [lang, previewSettings.defaultLanguage] } },
    {
      id: "preview",
      automation: kind,
      category: kind === "rebooking_invite" ? "marketing" : "transactional",
      customerId: sample.customer.id,
      appointmentId: sample.appointment?.id,
      serviceIds: sample.serviceIds,
    },
    version,
  );
}
