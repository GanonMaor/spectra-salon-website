/**
 * Typed domain contracts for the Start Now onboarding / order flow.
 *
 * These types are the swap boundary for a future Netlify Function + Neon
 * implementation. The UI never talks to storage or HTTP directly.
 *
 * Sensitive-data rules:
 * - Raw card PAN, expiry, CVC, and PayPal credentials are never modeled.
 * - Passwords never appear on this domain object, drafts, or repository input.
 * - PII in the local preview remains session-scoped.
 */

export const START_NOW_STEPS = [
  "account",
  "equipment",
  "device",
  "shipping",
  "delivery",
  "payment",
  "confirmed",
  "password",
  "allset",
  "next",
] as const;

export type StartNowStepId = (typeof START_NOW_STEPS)[number];

export type StartNowStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type StylistCountRange = "1" | "2-5" | "6-15" | "16+";

export type EquipmentId = "precision-scale" | "tablet-stand" | "online-setup";

export type DeviceChoice = "ipad" | "android" | "need-recommendation";

export type PaymentMethod = "card" | "paypal";

export type StartNowOrderStatus = "confirmed" | "password_set" | "complete";

export type StartNowDraftStatus = "draft" | StartNowOrderStatus;

export type StartNowErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "STORAGE"
  | "IMMUTABLE"
  | "NOT_IMPLEMENTED";

export interface StartNowError {
  code: StartNowErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type StartNowResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: StartNowError };

export interface AccountDetails {
  salonName: string;
  contactName: string;
  workEmail: string;
  country: string;
  stylistCount: StylistCountRange | "";
}

export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface DeliveryEstimate {
  minBusinessDays: 3;
  maxBusinessDays: 5;
  label: string;
  destinationSummary: string;
  computedAt: string;
}

export interface PaymentAuthorization {
  method: PaymentMethod;
  /** Always true in this module. Authorization is simulated locally. */
  simulated: true;
  authorizedAt: string;
}

export interface StartNowOrder {
  id: string;
  idempotencyKey: string;
  status: StartNowOrderStatus;
  createdAt: string;
  updatedAt: string;
  demoBookingId: string | null;
  account: AccountDetails;
  equipment: EquipmentId[];
  device: DeviceChoice;
  shipping: ShippingAddress;
  delivery: DeliveryEstimate;
  payment: PaymentAuthorization;
  passwordSet: boolean;
}

export interface CreateStartNowOrderInput {
  idempotencyKey: string;
  demoBookingId?: string | null;
  account: AccountDetails;
  equipment: EquipmentId[];
  device: DeviceChoice;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface StartNowRepository {
  readonly adapter: "local" | "netlify-neon";
  authorizeAndCreateOrder(input: CreateStartNowOrderInput): Promise<StartNowResult<StartNowOrder>>;
  getOrder(id: string): Promise<StartNowResult<StartNowOrder | null>>;
  getOrderByIdempotencyKey(key: string): Promise<StartNowResult<StartNowOrder | null>>;
  listOrders(): Promise<StartNowResult<StartNowOrder[]>>;
  markPasswordSet(id: string): Promise<StartNowResult<StartNowOrder>>;
  markComplete(id: string): Promise<StartNowResult<StartNowOrder>>;
}

export interface FieldErrors {
  salonName?: string;
  contactName?: string;
  workEmail?: string;
  country?: string;
  stylistCount?: string;
  equipment?: string;
  device?: string;
  fullName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  shippingCountry?: string;
  phone?: string;
  paymentMethod?: string;
  form?: string;
}

export interface PasswordFieldErrors {
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
}

export interface StartNowDraft {
  version: 1;
  step: StartNowStepIndex;
  status: StartNowDraftStatus;
  idempotencyKey: string;
  demoBookingId: string | null;
  account: AccountDetails;
  equipment: EquipmentId[];
  device: DeviceChoice | "";
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod | "";
  orderId: string | null;
  passwordSet: boolean;
  updatedAt: string;
}

/**
 * Optional, query-compatible seed from a prior demo booking.
 * Keep this loose. Do not import DemoBooking internals.
 */
export interface StartNowSeed {
  demoBookingId?: string;
  salonName?: string;
  contactName?: string;
  workEmail?: string;
  country?: string;
  stylistCount?: StylistCountRange | "";
}

export interface StartNowSeedSource {
  getSeed?(demoBookingId: string): Promise<StartNowSeed | null> | StartNowSeed | null;
}

export type StartNowAnalyticsName =
  | "start_now_view"
  | "start_now_step_view"
  | "start_now_continue"
  | "start_now_back"
  | "start_now_validation_error"
  | "start_now_order_authorized"
  | "start_now_password_set"
  | "start_now_complete";

export interface StartNowAnalyticsMetadata {
  adapter?: "local" | "netlify-neon";
  groupId?: string;
  deviceChoice?: DeviceChoice;
  equipmentCount?: number;
  paymentMethod?: PaymentMethod;
  countryCode?: string;
  stylistCount?: StylistCountRange;
  hasDemoBooking?: boolean;
  localOnly?: true;
}

export interface StartNowAnalyticsEvent {
  name: StartNowAnalyticsName;
  stepId: StartNowStepId;
  stepIndex: StartNowStepIndex;
  metadata: StartNowAnalyticsMetadata;
}

export function emptyAccountDetails(): AccountDetails {
  return {
    salonName: "",
    contactName: "",
    workEmail: "",
    country: "",
    stylistCount: "",
  };
}

export function emptyShippingAddress(): ShippingAddress {
  return {
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  };
}

export function isOk<T>(result: StartNowResult<T>): result is { ok: true; data: T } {
  return result.ok === true;
}

export function ok<T>(data: T): StartNowResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: StartNowErrorCode,
  message: string,
  details?: Record<string, unknown>,
): StartNowResult<T> {
  return { ok: false, error: { code, message, details } };
}

export function isLockedAfterCheckout(status: StartNowDraftStatus | "authorizing"): boolean {
  return status === "confirmed" || status === "password_set" || status === "complete";
}
