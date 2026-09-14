import { DEMO_DURATION_MINUTES, DEMO_SLOT_MINUTES } from "./constants";
import { createSlotId } from "./ids";
import {
  addDaysToDateKey,
  isPastSlot,
  isWeekendDateKey,
  wallClockToIso,
} from "./time";
import type { DemoBooking, TimeSlot } from "./types";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isDeterministicallyHeld(dateKey: string, minutes: number): boolean {
  return hashString(`${dateKey}:${minutes}`) % 7 === 0;
}

export function buildMockSlots(
  dateKey: string,
  timezone: string,
  bookings: DemoBooking[],
  now = new Date(),
): TimeSlot[] {
  if (isWeekendDateKey(dateKey)) return [];

  const reserved = new Set(
    bookings
      .filter((booking) => booking.slot.dateKey === dateKey)
      .map((booking) => booking.slot.id),
  );

  return DEMO_SLOT_MINUTES.map((minutes) => {
    const startIso = wallClockToIso(dateKey, minutes, timezone);
    const endIso = wallClockToIso(dateKey, minutes + DEMO_DURATION_MINUTES, timezone);
    const id = createSlotId(dateKey, minutes, timezone);
    const available =
      !reserved.has(id) &&
      !isDeterministicallyHeld(dateKey, minutes) &&
      !isPastSlot(startIso, now);

    return {
      id,
      dateKey,
      startIso,
      endIso,
      timezone,
      available,
    };
  });
}

export function findNextOpenDateKey(
  fromDateKey: string,
  timezone: string,
  bookings: DemoBooking[],
  now = new Date(),
  searchDays = 28,
): string | null {
  for (let i = 0; i < searchDays; i += 1) {
    const dateKey = addDaysToDateKey(fromDateKey, i);
    const open = buildMockSlots(dateKey, timezone, bookings, now).some((slot) => slot.available);
    if (open) return dateKey;
  }
  return null;
}
