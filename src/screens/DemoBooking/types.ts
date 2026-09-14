/**
 * Typed domain contracts for the demo booking flow.
 *
 * These types are the swap boundary for a future Netlify Function + Neon
 * implementation. The UI never talks to storage or HTTP directly.
 */

export const DEMO_BOOKING_STEPS = ["details", "schedule", "questions", "confirm"] as const;

export type DemoBookingStepId = (typeof DEMO_BOOKING_STEPS)[number];

export type DemoBookingStepIndex = 0 | 1 | 2 | 3;

export type StylistCountRange = "1" | "2-5" | "6-15" | "16+";

export type PhoneSystem = "fresha" | "glossgenius" | "vagaro" | "other" | "nothing";

export type ImprovementGoal =
  | "reduce-color-cost"
  | "save-formulas"
  | "inventory"
  | "salon-management"
  | "full-system";

export type YesNo = "yes" | "no";

export type DemoBookingStatus = "confirmed" | "rescheduled";

export type DemoBookingErrorCode =
  | "SLOT_UNAVAILABLE"
  | "VALIDATION"
  | "NOT_FOUND"
  | "STORAGE"
  | "NOT_IMPLEMENTED";

export interface DemoBookingError {
  code: DemoBookingErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type DemoBookingResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DemoBookingError };

export interface SalonDetails {
  salonName: string;
  contactName: string;
  workEmail: string;
  country: string;
  stylistCount: StylistCountRange | "";
}

export interface QualifyingAnswers {
  phoneSystem: PhoneSystem | "";
  improvementGoals: ImprovementGoal[];
  usesTabletInColorRoom: YesNo | "";
}

export interface TimeSlot {
  id: string;
  /** Calendar date in the booking timezone, YYYY-MM-DD. */
  dateKey: string;
  /** ISO 8601 start with numeric offset, e.g. 2026-09-17T10:30:00+03:00 */
  startIso: string;
  /** ISO 8601 end with numeric offset. */
  endIso: string;
  /** IANA timezone, e.g. Asia/Jerusalem */
  timezone: string;
  available: boolean;
}

export interface DemoMeeting {
  /** Placeholder join URL until a real conference provider is wired. */
  joinUrl: string;
  meetingId: string;
  passcode: string;
}

export interface DemoBooking {
  id: string;
  status: DemoBookingStatus;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  slot: TimeSlot;
  details: SalonDetails;
  questions: QualifyingAnswers;
  meeting: DemoMeeting;
}

export interface CreateDemoBookingInput {
  details: SalonDetails;
  slot: TimeSlot;
  questions: QualifyingAnswers;
  timezone: string;
}

export interface AvailabilityQuery {
  dateKey: string;
  timezone: string;
  /** When rescheduling, keep the current booking's slot selectable. */
  excludeBookingId?: string;
}

export interface DemoBookingRepository {
  readonly adapter: "local" | "netlify-neon";
  getAvailability(query: AvailabilityQuery): Promise<DemoBookingResult<TimeSlot[]>>;
  createBooking(input: CreateDemoBookingInput): Promise<DemoBookingResult<DemoBooking>>;
  getBooking(id: string): Promise<DemoBookingResult<DemoBooking | null>>;
  listBookings(): Promise<DemoBookingResult<DemoBooking[]>>;
  rescheduleBooking(id: string, slot: TimeSlot): Promise<DemoBookingResult<DemoBooking>>;
}

export interface FieldErrors {
  salonName?: string;
  contactName?: string;
  workEmail?: string;
  country?: string;
  stylistCount?: string;
  slot?: string;
  phoneSystem?: string;
  improvementGoals?: string;
  usesTabletInColorRoom?: string;
  form?: string;
}

export interface DemoBookingDraft {
  version: 1;
  step: DemoBookingStepIndex;
  status: "draft" | "confirmed" | "thankyou";
  details: SalonDetails;
  questions: QualifyingAnswers;
  selectedDateKey: string | null;
  selectedSlot: TimeSlot | null;
  bookingId: string | null;
  updatedAt: string;
}

export function emptySalonDetails(): SalonDetails {
  return {
    salonName: "",
    contactName: "",
    workEmail: "",
    country: "",
    stylistCount: "",
  };
}

export function emptyQualifyingAnswers(): QualifyingAnswers {
  return {
    phoneSystem: "",
    improvementGoals: [],
    usesTabletInColorRoom: "",
  };
}

export function isOk<T>(result: DemoBookingResult<T>): result is { ok: true; data: T } {
  return result.ok === true;
}

export function ok<T>(data: T): DemoBookingResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: DemoBookingErrorCode,
  message: string,
  details?: Record<string, unknown>,
): DemoBookingResult<T> {
  return { ok: false, error: { code, message, details } };
}
