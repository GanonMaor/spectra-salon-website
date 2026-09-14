import { createBookingId, createMeetingCredentials } from "./ids";
import { buildMockSlots } from "./mockAvailability";
import { loadBookings, saveBookings } from "./persistence";
import { dateKeyFromIso } from "./time";
import {
  fail,
  ok,
  type AvailabilityQuery,
  type CreateDemoBookingInput,
  type DemoBooking,
  type DemoBookingRepository,
  type DemoBookingResult,
  type TimeSlot,
} from "./types";

function slotStillOpen(slot: TimeSlot, bookings: DemoBooking[], now = new Date()): boolean {
  const dateKey = slot.dateKey || dateKeyFromIso(slot.startIso, slot.timezone);
  const live = buildMockSlots(dateKey, slot.timezone, bookings, now);
  return live.some((candidate) => candidate.id === slot.id && candidate.available);
}

function buildBooking(input: CreateDemoBookingInput, now = new Date()): DemoBooking {
  const id = createBookingId();
  const meeting = createMeetingCredentials(id);
  const createdAt = now.toISOString();

  return {
    id,
    status: "confirmed",
    createdAt,
    updatedAt: createdAt,
    timezone: input.timezone,
    slot: { ...input.slot, available: true },
    details: input.details,
    questions: input.questions,
    meeting: {
      joinUrl: `https://spectra.salon/demo-call/${id}`,
      meetingId: meeting.meetingId,
      passcode: meeting.passcode,
    },
  };
}

export function createLocalDemoBookingRepository(): DemoBookingRepository {
  return {
    adapter: "local",

    async getAvailability(query: AvailabilityQuery) {
      const bookings = loadBookings().filter((item) => item.id !== query.excludeBookingId);
      return ok(buildMockSlots(query.dateKey, query.timezone, bookings));
    },

    async createBooking(input: CreateDemoBookingInput) {
      const bookings = loadBookings();
      if (!slotStillOpen(input.slot, bookings)) {
        return fail(
          "SLOT_UNAVAILABLE",
          "That time is no longer available. Please choose another slot.",
          { slotId: input.slot.id },
        );
      }

      const booking = buildBooking(input);
      const written = saveBookings([...bookings, booking]);
      if (!written) {
        return fail("STORAGE", "We could not save this booking in this browser.");
      }
      return ok(booking);
    },

    async getBooking(id: string) {
      const booking = loadBookings().find((item) => item.id === id) ?? null;
      return ok(booking);
    },

    async listBookings() {
      return ok(loadBookings());
    },

    async rescheduleBooking(id: string, slot: TimeSlot) {
      const bookings = loadBookings();
      const index = bookings.findIndex((item) => item.id === id);
      if (index < 0) {
        return fail("NOT_FOUND", "We could not find that booking.");
      }

      const others = bookings.filter((item) => item.id !== id);
      if (!slotStillOpen(slot, others)) {
        return fail(
          "SLOT_UNAVAILABLE",
          "That time is no longer available. Please choose another slot.",
          { slotId: slot.id },
        );
      }

      const updated: DemoBooking = {
        ...bookings[index],
        status: "rescheduled",
        slot: { ...slot, available: true },
        timezone: slot.timezone,
        updatedAt: new Date().toISOString(),
      };
      const next = [...bookings];
      next[index] = updated;
      const written = saveBookings(next);
      if (!written) {
        return fail("STORAGE", "We could not update this booking in this browser.");
      }
      return ok(updated);
    },
  };
}

/**
 * Reserved adapter for a future Netlify Function + Neon Postgres implementation.
 *
 * This factory never reads environment secrets and never opens a database
 * connection. Swap it in through `createDemoBookingRepository("netlify-neon")`
 * once the function exists.
 *
 * Expected future contract:
 *   GET  /.netlify/functions/demo-booking-availability?date=&tz=
 *   POST /.netlify/functions/demo-booking
 *   GET  /.netlify/functions/demo-booking/:id
 *   POST /.netlify/functions/demo-booking/:id/reschedule
 */
export function createNetlifyNeonDemoBookingRepository(): DemoBookingRepository {
  const notImplemented = <T>(): DemoBookingResult<T> =>
    fail(
      "NOT_IMPLEMENTED",
      "The Netlify/Neon demo booking adapter is not wired yet. Use the local adapter.",
    );

  return {
    adapter: "netlify-neon",
    async getAvailability() {
      return notImplemented();
    },
    async createBooking() {
      return notImplemented();
    },
    async getBooking() {
      return notImplemented();
    },
    async listBookings() {
      return notImplemented();
    },
    async rescheduleBooking() {
      return notImplemented();
    },
  };
}

export type DemoBookingAdapterKind = "local" | "netlify-neon";

export function createDemoBookingRepository(
  kind: DemoBookingAdapterKind = "local",
): DemoBookingRepository {
  if (kind === "netlify-neon") {
    return createNetlifyNeonDemoBookingRepository();
  }
  return createLocalDemoBookingRepository();
}
