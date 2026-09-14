import { useCallback } from "react";
import { STEP_GROUPS, stepIdAt } from "./constants";
import type {
  StartNowAnalyticsEvent,
  StartNowAnalyticsMetadata,
  StartNowAnalyticsName,
  StartNowStepIndex,
} from "./types";

const ALLOWED_METADATA_KEYS = new Set<keyof StartNowAnalyticsMetadata>([
  "adapter",
  "groupId",
  "deviceChoice",
  "equipmentCount",
  "paymentMethod",
  "countryCode",
  "stylistCount",
  "hasDemoBooking",
  "localOnly",
]);

const BLOCKED_KEYS = [
  "email",
  "workemail",
  "phone",
  "address",
  "address1",
  "address2",
  "fullname",
  "contactname",
  "salonname",
  "password",
  "confirmpassword",
  "card",
  "pan",
  "cvc",
  "cvv",
  "expiry",
  "postal",
  "postalcode",
  "name",
];

function isBlockedKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  return BLOCKED_KEYS.some((blocked) => normalized.includes(blocked));
}

export function groupIdForStep(step: StartNowStepIndex): string {
  const stepId = stepIdAt(step);
  return STEP_GROUPS.find((group) => (group.stepIds as readonly string[]).includes(stepId))?.id ?? "account";
}

export function sanitizeAnalytics(event: StartNowAnalyticsEvent): StartNowAnalyticsEvent {
  const metadata: StartNowAnalyticsMetadata = { localOnly: true };
  (Object.keys(event.metadata) as Array<keyof StartNowAnalyticsMetadata>).forEach((key) => {
    if (!ALLOWED_METADATA_KEYS.has(key) || isBlockedKey(String(key))) return;
    const value = event.metadata[key];
    if (value !== undefined) {
      (metadata as Record<string, unknown>)[key] = value;
    }
  });

  return {
    name: event.name,
    stepId: event.stepId,
    stepIndex: event.stepIndex,
    metadata,
  };
}

export function buildAnalyticsEvent(
  name: StartNowAnalyticsName,
  step: StartNowStepIndex,
  metadata: StartNowAnalyticsMetadata = {},
): StartNowAnalyticsEvent {
  return sanitizeAnalytics({
    name,
    stepId: stepIdAt(step),
    stepIndex: step,
    metadata: {
      ...metadata,
      groupId: metadata.groupId ?? groupIdForStep(step),
      localOnly: true,
    },
  });
}

export function emitStartNowAnalytics(
  event: StartNowAnalyticsEvent,
  onAnalytics?: (event: StartNowAnalyticsEvent) => void,
): void {
  const safe = sanitizeAnalytics(event);
  onAnalytics?.(safe);

  if (typeof window === "undefined") return;

  const payload: { event: string; stepId: string; stepIndex: number } & Record<string, unknown> = {
    event: safe.name,
    stepId: safe.stepId,
    stepIndex: safe.stepIndex,
    ...safe.metadata,
  };

  Object.keys(payload).forEach((key) => {
    if (key !== "event" && isBlockedKey(key)) {
      delete payload[key];
    }
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function useStartNowAnalytics(onAnalytics?: (event: StartNowAnalyticsEvent) => void) {
  return useCallback(
    (event: StartNowAnalyticsEvent) => {
      emitStartNowAnalytics(event, onAnalytics);
    },
    [onAnalytics],
  );
}
