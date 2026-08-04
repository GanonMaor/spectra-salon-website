import {
  getDefaultRange,
  hasActivityInRange,
  rangeCoveringActivity,
  rangeFromPreset,
} from "../analyticsDateRange";

describe("analyticsDateRange calendar presets", () => {
  const now = new Date("2026-08-04T12:00:00");
  const maorVisits = [
    "2022-05-30T10:00:00.000Z",
    "2022-12-31T15:00:00.000Z",
  ];

  it("year is calendar YTD: Jan 1 → today", () => {
    const range = rangeFromPreset("year", [], now);
    expect(range.preset).toBe("year");
    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(0);
    expect(range.from.getDate()).toBe(1);
    expect(range.to.getFullYear()).toBe(2026);
    expect(range.to.getMonth()).toBe(7);
    expect(range.to.getDate()).toBe(4);
  });

  it("month is MTD and week is last 7 days through today", () => {
    const month = rangeFromPreset("month", [], now);
    expect(month.from.getFullYear()).toBe(2026);
    expect(month.from.getMonth()).toBe(7);
    expect(month.from.getDate()).toBe(1);

    const week = rangeFromPreset("week", [], now);
    expect(week.from.getDate()).toBe(29); // Aug 4 - 6 days
    expect(week.to.getDate()).toBe(4);
  });

  it("default range is YTD", () => {
    expect(getDefaultRange(now).preset).toBe("year");
    expect(getDefaultRange(now).from.getMonth()).toBe(0);
  });

  it("all covers visit history only (not stretched to today)", () => {
    const all = rangeCoveringActivity(maorVisits);
    expect(all.preset).toBe("all");
    expect(all.from.getFullYear()).toBe(2022);
    expect(all.to.getFullYear()).toBe(2022);
    expect(hasActivityInRange(maorVisits, rangeFromPreset("year", [], now))).toBe(false);
    expect(hasActivityInRange(maorVisits, all)).toBe(true);
  });
});
