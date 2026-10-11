import { createDemoState, DEMO_NOW } from "../demoSeed";
import { periodMetrics } from "../metrics";
import { createLocalMarketingRepository, modeStorageKey, stateStorageKey } from "../repository";
import type { MarketingState } from "../types";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const FALLBACK = { timezone: "Asia/Jerusalem", now: "2026-10-11T07:00:00.000Z", actor: "Owner" };

describe("local marketing repository", () => {
  it("defaults to salon mode with a truly empty salon", () => {
    const repo = createLocalMarketingRepository("salon-1:user-1", memoryStorage());
    expect(repo.loadMode()).toBe("salon");
    const salon = repo.load("salon", FALLBACK);
    expect(salon.mode).toBe("salon");
    expect(salon.messages).toHaveLength(0);
    expect(salon.dataset).toBeUndefined();
    expect(salon.clock).toBeUndefined();
    expect(salon.settings.connection).toBe("not_connected");
    expect(salon.automations.rebooking_invite.enabled).toBe(false);
  });

  it("keeps demo and salon data under separate scoped keys", () => {
    const storage = memoryStorage();
    const repo = createLocalMarketingRepository("salon-1:user-1", storage);
    repo.load("salon", FALLBACK);
    repo.load("demo", FALLBACK);
    expect(storage.map.has(stateStorageKey("salon", "salon-1:user-1"))).toBe(true);
    expect(storage.map.has(stateStorageKey("demo", "salon-1:user-1"))).toBe(true);

    const other = createLocalMarketingRepository("salon-2:user-9", storage);
    expect(other.load("salon", FALLBACK).settings.senderName).toBe("");
    expect(other.loadMode()).toBe("salon");
  });

  it("never persists demo fields or demo messages into the salon namespace", () => {
    const storage = memoryStorage();
    const repo = createLocalMarketingRepository("s:u", storage);
    const demo = createDemoState();
    const leaked: MarketingState = { ...demo, mode: "salon" };
    repo.save(leaked);
    const stored = JSON.parse(storage.map.get(stateStorageKey("salon", "s:u"))!) as MarketingState;
    expect(stored.dataset).toBeUndefined();
    expect(stored.clock).toBeUndefined();
    expect(stored.actingRole).toBeUndefined();
    expect(stored.messages.every((message) => message.isTest)).toBe(true);
  });

  it("persists across reloads", () => {
    const storage = memoryStorage();
    const repo = createLocalMarketingRepository("s:u", storage);
    const salon = repo.load("salon", FALLBACK);
    salon.settings.senderName = "StudioNoa";
    salon.automations.appointment_reminder.draft = {
      ...salon.automations.appointment_reminder.published,
      version: 2,
      timing: { type: "day_before", time: "12:00" },
    };
    repo.save(salon);
    repo.saveMode("demo");

    const reloaded = createLocalMarketingRepository("s:u", storage);
    expect(reloaded.loadMode()).toBe("demo");
    const again = reloaded.load("salon", FALLBACK);
    expect(again.settings.senderName).toBe("StudioNoa");
    expect(again.automations.appointment_reminder.draft?.timing).toEqual({ type: "day_before", time: "12:00" });
  });

  it("resets only the demo namespace", () => {
    const storage = memoryStorage();
    const repo = createLocalMarketingRepository("s:u", storage);
    const salon = repo.load("salon", FALLBACK);
    salon.settings.senderName = "Mine";
    repo.save(salon);
    const demo = repo.load("demo", FALLBACK);
    demo.settings.senderName = "Changed";
    demo.messages = [];
    repo.save(demo);
    storage.setItem("crm_cache", "untouched");

    const fresh = repo.resetDemo();
    expect(fresh.settings.senderName).toBe("StudioNoa");
    expect(fresh.messages.length).toBeGreaterThan(20);
    expect(repo.load("salon", FALLBACK).settings.senderName).toBe("Mine");
    expect(storage.getItem("crm_cache")).toBe("untouched");
    expect(storage.getItem(modeStorageKey("s:u"))).toBeNull();
  });

  it("recovers from corrupt stored state", () => {
    const storage = memoryStorage();
    storage.setItem(stateStorageKey("salon", "s:u"), "{not json");
    const repo = createLocalMarketingRepository("s:u", storage);
    expect(repo.load("salon", FALLBACK).schemaVersion).toBe(1);
  });
});

describe("metrics", () => {
  it("counts delivered and failed as stages of sent, not on top of it", () => {
    const state = createDemoState();
    const metrics = periodMetrics(state.messages, DEMO_NOW, 30);
    expect(metrics.delivered + metrics.awaiting).toBeLessThanOrEqual(metrics.sent);
    const sentIds = state.messages.filter((message) => !message.isTest && message.sentAt).length;
    expect(metrics.sent).toBeLessThanOrEqual(sentIds);
    expect(metrics.notSent).toBeGreaterThan(0);
  });

  it("excludes test sends from the KPIs", () => {
    const state = createDemoState();
    const base = periodMetrics(state.messages, DEMO_NOW, 30);
    const withTest = [
      ...state.messages,
      { ...state.messages.find((message) => message.status === "delivered")!, id: "t1", isTest: true },
    ];
    expect(periodMetrics(withTest, DEMO_NOW, 30)).toEqual(base);
  });
});
