import {
  calculateNowScrollTop,
  getZonedNowParts,
  isValidIanaTimeZone,
  resolveSalonTimeZone,
} from "../calendarClock";

describe("calendar clock", () => {
  it("prefers an explicit valid salon timezone", () => {
    expect(resolveSalonTimeZone({
      configuredTimeZone: "Europe/Paris",
      countryCode: "IL",
      deviceTimeZone: "Asia/Jerusalem",
    })).toBe("Europe/Paris");
  });

  it("repairs legacy UTC salon records from their country", () => {
    expect(resolveSalonTimeZone({
      configuredTimeZone: "UTC",
      countryCode: "IL",
      deviceTimeZone: "America/New_York",
    })).toBe("Asia/Jerusalem");
  });

  it("falls back to the device timezone when salon metadata is unavailable", () => {
    expect(resolveSalonTimeZone({
      configuredTimeZone: "not-a-zone",
      deviceTimeZone: "America/Los_Angeles",
    })).toBe("America/Los_Angeles");
    expect(isValidIanaTimeZone("not-a-zone")).toBe(false);
  });

  it("uses IANA daylight-saving rules for Jerusalem", () => {
    const summer = getZonedNowParts("Asia/Jerusalem", new Date("2026-07-15T08:15:00.000Z"));
    const winter = getZonedNowParts("Asia/Jerusalem", new Date("2026-01-15T08:15:00.000Z"));

    expect(summer.dateKey).toBe("2026-07-15");
    expect(summer.label).toBe("11:15");
    expect(winter.label).toBe("10:15");
  });

  it("derives the salon day independently of the device timezone", () => {
    const parts = getZonedNowParts("America/New_York", new Date("2026-07-15T02:30:00.000Z"));
    expect(parts.dateKey).toBe("2026-07-14");
    expect(parts.label).toBe("22:30");
  });

  it("calculates a scroll target that places now below the sticky header", () => {
    expect(calculateNowScrollTop({
      hourFloat: 11.25,
      hourStart: 7,
      hourEnd: 24,
      slotHeight: 160,
      viewportHeight: 700,
      headerOffset: 100,
    })).toBe(556);
    expect(calculateNowScrollTop({
      hourFloat: 3,
      hourStart: 7,
      hourEnd: 24,
      slotHeight: 160,
      viewportHeight: 700,
    })).toBeNull();
  });
});
