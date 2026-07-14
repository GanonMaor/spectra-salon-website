import {
  MINIMUM_SAMPLE,
  resolveMetricState,
  type MetricStateInput,
} from "../index";

/**
 * The state contract turns (classification + guard + sample + coverage) into
 * the mandatory UI state. These tests pin the resolution order and the guard
 * thresholds so a missing source can never render as `0`.
 */

function input(overrides: Partial<MetricStateInput>): MetricStateInput {
  return {
    classification: "operational",
    guard: "none",
    minimumSample: 1,
    sampleSize: 1,
    hasSource: true,
    hasActivity: true,
    ...overrides,
  };
}

describe("resolveMetricState", () => {
  it("returns source_not_connected for unavailable metrics", () => {
    expect(resolveMetricState(input({ classification: "unavailable" }))).toBe("source_not_connected");
  });

  it("returns source_not_connected when no source is connected", () => {
    expect(resolveMetricState(input({ hasSource: false }))).toBe("source_not_connected");
  });

  it("returns no_activity when the source is connected but the range is empty", () => {
    expect(resolveMetricState(input({ hasActivity: false, sampleSize: 0 }))).toBe("no_activity");
    expect(resolveMetricState(input({ sampleSize: 0 }))).toBe("no_activity");
  });

  it("returns incomplete for incomplete classification with activity", () => {
    expect(resolveMetricState(input({ classification: "incomplete" }))).toBe("incomplete");
  });

  it("returns ready for a healthy operational metric", () => {
    expect(resolveMetricState(input({}))).toBe("ready");
  });

  describe("comparison guard", () => {
    it("needs activity in two periods", () => {
      expect(resolveMetricState(input({ guard: "comparison", periodsWithActivity: 1 }))).toBe("insufficient_data");
      expect(
        resolveMetricState(
          input({ guard: "comparison", periodsWithActivity: MINIMUM_SAMPLE.comparisonPeriods }),
        ),
      ).toBe("ready");
    });
  });

  describe("ranking / staff_comparison guard", () => {
    it("needs a reported sample of at least MINIMUM_SAMPLE.ranking", () => {
      expect(
        resolveMetricState(input({ guard: "ranking", classification: "estimated", sampleSize: 1, minimumSample: 1 })),
      ).toBe("insufficient_data");
      expect(
        resolveMetricState(input({ guard: "ranking", classification: "estimated", sampleSize: 2, minimumSample: 2 })),
      ).toBe("ready");
    });

    it("gates staff comparison on the staff sample", () => {
      expect(
        resolveMetricState(input({ guard: "staff_comparison", sampleSize: 1, minimumSample: 2 })),
      ).toBe("insufficient_data");
      expect(
        resolveMetricState(input({ guard: "staff_comparison", sampleSize: 2, minimumSample: 2 })),
      ).toBe("ready");
    });
  });

  describe("anomaly guard", () => {
    it("needs a baseline of prior periods", () => {
      expect(resolveMetricState(input({ guard: "anomaly", baselineMonths: 2 }))).toBe("insufficient_data");
      expect(
        resolveMetricState(input({ guard: "anomaly", baselineMonths: MINIMUM_SAMPLE.anomalyBaselineMonths })),
      ).toBe("ready");
    });
  });

  it("applies the generic minimum-sample gate after guards", () => {
    expect(resolveMetricState(input({ minimumSample: 5, sampleSize: 3 }))).toBe("insufficient_data");
    expect(resolveMetricState(input({ minimumSample: 5, sampleSize: 5 }))).toBe("ready");
  });
});
