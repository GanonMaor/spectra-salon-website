import { BOOKINGS_STORAGE_KEY, DRAFT_STORAGE_KEY } from "./constants";
import {
  emptyQualifyingAnswers,
  emptySalonDetails,
  type DemoBooking,
  type DemoBookingDraft,
} from "./types";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function canUseSessionStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function createEmptyDraft(): DemoBookingDraft {
  return {
    version: 1,
    step: 0,
    status: "draft",
    details: emptySalonDetails(),
    questions: emptyQualifyingAnswers(),
    selectedDateKey: null,
    selectedSlot: null,
    bookingId: null,
    updatedAt: new Date().toISOString(),
  };
}

function isDraft(value: unknown): value is DemoBookingDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as DemoBookingDraft;
  return draft.version === 1 && !!draft.details && !!draft.questions;
}

export function loadDraft(): DemoBookingDraft {
  let stored: DemoBookingDraft | null = null;
  if (canUseSessionStorage()) {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as DemoBookingDraft) : null;
    } catch {
      stored = null;
    }
  }
  return isDraft(stored) ? stored : createEmptyDraft();
}

export function saveDraft(draft: DemoBookingDraft): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore quota / private-mode failures */
  }
}

export function clearDraft(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore quota / private-mode failures */
  }
}

export function loadBookings(): DemoBooking[] {
  const stored = readJson<DemoBooking[]>(BOOKINGS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function saveBookings(bookings: DemoBooking[]): boolean {
  return writeJson(BOOKINGS_STORAGE_KEY, bookings);
}
