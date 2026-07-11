import { normalizeSnapshot } from "../../SalonCRM/data/CRMDataProvider";
import { DEFAULT_CRM_SEED } from "../../SalonCRM/data/crmSeedData";
import {
  ALICE_SUGGESTIONS,
  ALICE_TONE,
  respondToSuggestion,
  respondToUserInput,
  summarizeActionOutcome,
} from "../aliceAssistant";
import type { CRMActions } from "../../SalonCRM/data/crmHooks";

const state = normalizeSnapshot(DEFAULT_CRM_SEED);

// Alice's local-suggestion paths never hit `actions`, but the schedule
// command path will. Tests below exercise the local paths only; we
// pass a permissive stub purely to satisfy the type contract.
const stubActions: CRMActions = {} as unknown as CRMActions;

describe("Alice tone & contract", () => {
  it("ALICE_TONE is warm, short, supportive, not robotic", () => {
    expect(ALICE_TONE.warmth).toBe("warm");
    expect(ALICE_TONE.brevity).toBe("short");
    expect(ALICE_TONE.style).toBe("supportive");
    expect(ALICE_TONE.robotic).toBe(false);
    expect(ALICE_TONE.chatty).toBe(false);
  });

  it("exposes the three required suggestion chips", () => {
    expect(ALICE_SUGGESTIONS.map((s) => s.key).sort()).toEqual([
      "optimizeSchedule",
      "showLowStock",
      "topStylistToday",
    ]);
  });
});

describe("respondToUserInput", () => {
  it("clarifies when input is empty", async () => {
    const r = await respondToUserInput("   ", state, stubActions);
    expect(r.tone).toBe("clarify");
    expect(r.actions).toBeUndefined();
  });

  it("routes inventory questions to the low-stock answer", async () => {
    const r = await respondToUserInput("show me low stock", state, stubActions);
    expect(r.tone).toBe("answer");
    expect(r.actions?.[0]?.actionKey).toBe("navigate.inventory");
  });

  it("routes top-stylist questions to performance", async () => {
    const r = await respondToUserInput("who is the top stylist?", state, stubActions);
    expect(r.actions?.[0]?.actionKey).toBe("navigate.staff");
  });

  it("falls back to clarification on unknown input", async () => {
    const r = await respondToUserInput("what is the meaning of life", state, stubActions);
    expect(r.tone).toBe("clarify");
  });

  it("returns short messages (<=140 chars)", async () => {
    const r = await respondToUserInput("show low stock", state, stubActions);
    expect(r.message.length).toBeLessThanOrEqual(140);
  });
});

describe("respondToSuggestion", () => {
  it("returns at most one primary CTA per suggestion", () => {
    for (const s of ALICE_SUGGESTIONS) {
      const r = respondToSuggestion(s.key, state);
      const primaries = (r.actions ?? []).filter((a) => a.primary);
      expect(primaries.length).toBeLessThanOrEqual(1);
    }
  });

  it("answers low-stock with an inventory navigation CTA", () => {
    const r = respondToSuggestion("showLowStock", state);
    expect(r.tone).toBe("answer");
    expect(r.actions?.find((a) => a.primary)?.actionKey).toBe("navigate.inventory");
  });
});

describe("summarizeActionOutcome", () => {
  it("confirms success without claiming more than it did", () => {
    const r = summarizeActionOutcome("Moved the appointment", { ok: true });
    expect(r.tone).toBe("confirm");
    expect(r.message).toMatch(/Done\./i);
  });

  it("reports failure plainly with the underlying error", () => {
    const r = summarizeActionOutcome("Move the appointment", {
      ok: false,
      error: { message: "Time slot is taken" },
    });
    expect(r.tone).toBe("fail");
    expect(r.confirmation).toBe("Time slot is taken");
  });
});
