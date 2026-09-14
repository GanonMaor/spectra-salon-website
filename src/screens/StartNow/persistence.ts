import { DEFAULT_EQUIPMENT, DRAFT_STORAGE_KEY, ORDERS_STORAGE_KEY } from "./constants";
import { createIdempotencyKey } from "./ids";
import {
  emptyAccountDetails,
  emptyShippingAddress,
  type StartNowDraft,
  type StartNowOrder,
} from "./types";

function canUseSessionStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
}

function readSessionJson<T>(key: string): T | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeSessionJson(key: string, value: unknown): boolean {
  if (!canUseSessionStorage()) return false;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function createEmptyDraft(): StartNowDraft {
  return {
    version: 1,
    step: 0,
    status: "draft",
    idempotencyKey: createIdempotencyKey(),
    demoBookingId: null,
    account: emptyAccountDetails(),
    equipment: [...DEFAULT_EQUIPMENT],
    device: "",
    shipping: emptyShippingAddress(),
    paymentMethod: "",
    orderId: null,
    passwordSet: false,
    updatedAt: new Date().toISOString(),
  };
}

function isDraft(value: unknown): value is StartNowDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as StartNowDraft;
  return draft.version === 1 && typeof draft.idempotencyKey === "string" && !!draft.account;
}

function stripDraftPii(draft: StartNowDraft): StartNowDraft {
  if (!draft.orderId) return draft;
  return {
    ...draft,
    account: emptyAccountDetails(),
    shipping: emptyShippingAddress(),
    equipment: [],
    device: "",
    paymentMethod: "",
  };
}

export function loadDraft(): StartNowDraft {
  if (!canUseSessionStorage()) return createEmptyDraft();
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as unknown) : null;
    return isDraft(stored) ? stored : createEmptyDraft();
  } catch {
    return createEmptyDraft();
  }
}

export function saveDraft(draft: StartNowDraft): void {
  if (!canUseSessionStorage()) return;
  try {
    const payload = {
      ...stripDraftPii(draft),
      updatedAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
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

export function loadOrders(): StartNowOrder[] {
  const stored = readSessionJson<StartNowOrder[]>(ORDERS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function saveOrders(orders: StartNowOrder[]): boolean {
  return writeSessionJson(ORDERS_STORAGE_KEY, orders);
}
