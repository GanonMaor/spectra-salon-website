/**
 * Marketing / customer-automation domain types.
 *
 * Everything here is local-first and simulated: no message ever leaves the
 * browser. The shapes intentionally mirror what the production service will
 * persist (see PRODUCTION_WIRING.md) so the UI can be wired to a real
 * repository without changing its contracts.
 */

export type MarketingMode = "demo" | "salon";

export type LanguageCode = "he" | "en";

export type AutomationKind =
  | "booking_confirmation"
  | "appointment_reminder"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "rebooking_invite";

export type MessageCategory = "transactional" | "marketing";

export type AutomationTiming =
  | { type: "immediate" }
  /** Local salon time on the calendar day before the appointment. */
  | { type: "day_before"; time: string }
  /** Days after a service was actually performed, sent at a local time. */
  | { type: "after_service"; intervalDays: number | null; time: string };

export interface ServiceOverride {
  serviceId: string;
  /** Absent fields inherit from the general version. */
  enabled?: boolean;
  bodies?: Partial<Record<LanguageCode, string>>;
  intervalDays?: number;
  /** Custom price shown in the message. `null` hides the price. */
  priceCents?: number | null;
}

export interface AutomationVersion {
  version: number;
  timing: AutomationTiming;
  bodies: Partial<Record<LanguageCode, string>>;
  serviceOverrides: Record<string, ServiceOverride>;
  updatedAt: string;
  updatedBy: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface Automation {
  kind: AutomationKind;
  category: MessageCategory;
  /** Activation is separate from content so it can require its own permission. */
  enabled: boolean;
  published: AutomationVersion;
  /** Unpublished edits. The published version keeps running until publish. */
  draft: AutomationVersion | null;
}

export type ConsentStatus = "granted" | "revoked" | "unknown";

export interface ConsentRecord {
  status: ConsentStatus;
  source?: string;
  recordedAt?: string;
}

export interface MarketingCustomer {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  language?: LanguageCode;
  consent: {
    transactional: ConsentRecord;
    marketing: ConsentRecord;
  };
  /** Demo-only: the simulated carrier rejects this handset after acceptance. */
  undeliverable?: boolean;
}

export interface MarketingService {
  id: string;
  name: string;
  /** `null`/absent means no stored price; never rendered as zero. */
  priceCents?: number | null;
  durationMinutes?: number;
  prepInstructions?: string;
}

export type MarketingAppointmentStatus = "confirmed" | "completed" | "cancelled" | "no-show";

export interface MarketingAppointment {
  id: string;
  customerId: string;
  serviceIds: string[];
  staffName?: string;
  startTime: string;
  endTime: string;
  status: MarketingAppointmentStatus;
  /** Price saved on the booking; preferred over the live catalog price. */
  priceCents?: number | null;
  createdAt: string;
  completedAt?: string;
}

export interface SalonProfile {
  name: string;
  phone?: string;
  address?: string;
  branchName?: string;
  timezone: string;
  /** `null` when online booking/management links do not exist yet. */
  bookingUrl?: string | null;
}

/** Customers, services and appointments the engine reasons about. */
export interface MarketingDataset {
  salon: SalonProfile;
  customers: MarketingCustomer[];
  services: MarketingService[];
  appointments: MarketingAppointment[];
}

export type SmsConnectionStatus = "not_connected" | "connected" | "error";

export interface SmsSettings {
  connection: SmsConnectionStatus;
  providerLabel: string;
  senderName: string;
  timezone: string;
  defaultLanguage: LanguageCode;
  enabledLanguages: LanguageCode[];
  /** Local HH:mm window in which marketing messages may be sent. */
  marketingWindow: { start: string; end: string };
  /** At most one marketing message per customer within this many days. */
  frequencyCapDays: number;
  monthlyMarketingBudgetCents: number;
  budgetAlertPercent: number;
  maxAttempts: number;
  /** Estimated provider price per billing unit (segment). */
  estimatedCostPerSegmentCents: number;
  onboardingCompletedAt?: string;
  testSentAt?: string;
}

export type MessageStatus =
  | "scheduled"
  | "deferred"
  | "paused"
  | "sent"
  | "delivered"
  | "unknown"
  | "failed"
  | "cancelled"
  | "skipped";

export type MessageReason =
  | "outside_send_window"
  | "frequency_cap"
  | "frequency_cap_expired"
  | "budget_cap"
  | "consent_marketing_missing"
  | "consent_opted_out"
  | "no_phone"
  | "missing_variable"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_passed"
  | "appointment_not_completed"
  | "reminder_window_passed"
  | "automation_disabled"
  | "future_booking_exists"
  | "superseded_by_new_visit"
  | "merged_into"
  | "provider_temporary_failure"
  | "provider_permanent_failure"
  | "delivery_failed"
  | "awaiting_provider_confirmation"
  | "sms_not_connected"
  | "service_excluded"
  | "manually_cancelled";

export type AttemptOutcome = "accepted" | "temporary_failure" | "permanent_failure" | "timeout";

export interface DeliveryAttempt {
  number: number;
  at: string;
  outcome: AttemptOutcome;
  providerMessageId?: string;
  /** How an unknown (timeout) attempt was later reconciled. */
  reconciledAs?: "delivered" | "not_received";
  reconciledAt?: string;
}

export interface ScheduledMessage {
  id: string;
  /** One logical message per trigger; retries never create a new one. */
  dedupeKey: string;
  automation: AutomationKind;
  category: MessageCategory;
  customerId: string;
  appointmentId?: string;
  serviceIds: string[];
  /** Original planned time, before any deferral. */
  plannedFor: string;
  /** Current time the engine will try next. */
  scheduledFor: string;
  status: MessageStatus;
  reason?: MessageReason;
  reasonDetail?: string;
  /** Trace only — re-rendered and re-validated right before sending. */
  scheduledSnapshot: {
    automationVersion: number;
    bodyPreview: string;
    marketingConsent: ConsentStatus;
  };
  /** Frozen at the moment of sending; never rewritten afterwards. */
  sentBody?: string;
  sentVersion?: number;
  language?: LanguageCode;
  segments?: number;
  estimatedCostCents?: number;
  actualCostCents?: number;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  attempts: DeliveryAttempt[];
  mergedInto?: string;
  mergedServiceIds?: string[];
  isTest?: boolean;
  testPhone?: string;
  /** Salon-mode projections only: why this message would be blocked if due now. */
  projectedBlock?: MessageReason;
  createdAt: string;
  updatedAt: string;
}

export type ProviderBehavior = "normal" | "temporary_failure" | "timeout" | "permanent_failure";

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action:
    | "draft_saved"
    | "draft_discarded"
    | "published"
    | "enabled"
    | "disabled"
    | "settings_updated"
    | "sms_connected"
    | "sms_disconnected"
    | "test_sent"
    | "message_cancelled"
    | "message_reconciled"
    | "message_resumed"
    | "demo_reset";
  target: string;
  detail?: string;
}

export type MarketingActorRole = "owner" | "manager_publisher" | "manager_editor" | "viewer";

export interface MarketingState {
  schemaVersion: 1;
  mode: MarketingMode;
  settings: SmsSettings;
  automations: Record<AutomationKind, Automation>;
  /** Persisted outbox + history. Demo only; salon mode projects instead. */
  messages: ScheduledMessage[];
  audit: AuditEvent[];
  /** Demo clock. Salon mode uses the real time. */
  clock?: string;
  /** Demo-only isolated dataset. Never mixed into salon data. */
  dataset?: MarketingDataset;
  /** Demo-only: outcome of the next provider call. */
  nextProviderOutcome?: ProviderBehavior;
  /** Demo-only: role the presenter is acting as. */
  actingRole?: MarketingActorRole;
  sequence: number;
}

export const AUTOMATION_ORDER: AutomationKind[] = [
  "booking_confirmation",
  "appointment_reminder",
  "appointment_rescheduled",
  "appointment_cancelled",
  "rebooking_invite",
];

export const PENDING_STATUSES: MessageStatus[] = ["scheduled", "deferred", "paused"];
export const TERMINAL_STATUSES: MessageStatus[] = ["delivered", "failed", "cancelled", "skipped"];
