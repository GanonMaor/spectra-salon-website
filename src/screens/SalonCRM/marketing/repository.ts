/**
 * Local persistence for the marketing mock.
 *
 * Demo and salon state live under separate keys, scoped to the signed-in
 * salon/user, so demo fixtures can never leak into a real salon and a demo
 * reset never touches salon settings or the CRM cache.
 */

import { createDefaultAutomations, createDefaultSettings } from "./engine";
import { createDemoState } from "./demoSeed";
import type { MarketingMode, MarketingState } from "./types";

export const MARKETING_STORAGE_PREFIX = "spectra.marketing.v1";

export function stateStorageKey(mode: MarketingMode, scopeKey: string): string {
  return `${MARKETING_STORAGE_PREFIX}:${mode}:${scopeKey}`;
}

export function modeStorageKey(scopeKey: string): string {
  return `${MARKETING_STORAGE_PREFIX}:mode:${scopeKey}`;
}

export function createSalonState(timezone: string, now: string, actor: string): MarketingState {
  return {
    schemaVersion: 1,
    mode: "salon",
    settings: createDefaultSettings(timezone || "Asia/Jerusalem"),
    automations: createDefaultAutomations(now, actor),
    messages: [],
    audit: [],
    sequence: 0,
  };
}

export interface MarketingRepository {
  loadMode(): MarketingMode;
  saveMode(mode: MarketingMode): void;
  load(mode: MarketingMode, fallback: { timezone: string; now: string; actor: string }): MarketingState;
  save(state: MarketingState): void;
  /** Only ever resets the demo namespace. */
  resetDemo(): MarketingState;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function safeStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function isValidState(value: unknown, mode: MarketingMode): value is MarketingState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<MarketingState>;
  return (
    state.schemaVersion === 1
    && state.mode === mode
    && Boolean(state.settings)
    && Boolean(state.automations)
    && Array.isArray(state.messages)
  );
}

/**
 * Salon state must never carry demo-only fields. Its upcoming messages are
 * projections from the CRM, so only simulated test sends are persisted.
 */
function sanitizeSalonState(state: MarketingState): MarketingState {
  const { dataset: _dataset, clock: _clock, nextProviderOutcome: _outcome, actingRole: _role, ...rest } = state;
  return { ...rest, mode: "salon", messages: state.messages.filter((message) => message.isTest) };
}

export function createLocalMarketingRepository(scopeKey: string, storage: StorageLike | null = safeStorage()): MarketingRepository {
  const memory = new Map<string, string>();
  const read = (key: string): string | null => (storage ? storage.getItem(key) : memory.get(key) ?? null);
  const write = (key: string, value: string) => {
    try {
      if (storage) storage.setItem(key, value);
      else memory.set(key, value);
    } catch (error) {
      console.warn("[marketing] could not persist state", error);
    }
  };

  return {
    loadMode() {
      const raw = read(modeStorageKey(scopeKey));
      return raw === "demo" ? "demo" : "salon";
    },
    saveMode(mode) {
      write(modeStorageKey(scopeKey), mode);
    },
    load(mode, fallback) {
      const raw = read(stateStorageKey(mode, scopeKey));
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (isValidState(parsed, mode)) return mode === "salon" ? sanitizeSalonState(parsed) : parsed;
        } catch {
          // Corrupt state falls through to a fresh one.
        }
      }
      const fresh = mode === "demo" ? createDemoState() : createSalonState(fallback.timezone, fallback.now, fallback.actor);
      write(stateStorageKey(mode, scopeKey), JSON.stringify(fresh));
      return fresh;
    },
    save(state) {
      const toStore = state.mode === "salon" ? sanitizeSalonState(state) : state;
      write(stateStorageKey(state.mode, scopeKey), JSON.stringify(toStore));
    },
    resetDemo() {
      const fresh = createDemoState();
      if (storage) storage.removeItem(stateStorageKey("demo", scopeKey));
      write(stateStorageKey("demo", scopeKey), JSON.stringify(fresh));
      return fresh;
    },
  };
}
