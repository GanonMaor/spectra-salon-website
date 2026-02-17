import {
  startOfWeek,
  addDays,
  isSameDay,
  getWeekDays,
  formatDayLabel,
  formatTime,
  formatTimeRange,
  isToday,
  HOUR_START,
  HOUR_END,
  SLOT_HEIGHT,
  appointmentTop,
  appointmentHeight,
  getAppointmentsForDay,
  getHourSlots,
  formatHourLabel,
  snapMinutes,
  dateToMinutes,
  buildDateWithMinutes,
  clampToWorkingWindow,
  validateAppointment,
  validateSegments,
  checkOverlap,
} from "../calendarUtils";
import type { Appointment } from "../calendarTypes";

// ── Date helpers ────────────────────────────────────────────────────

describe("startOfWeek", () => {
  it("returns Sunday for a Wednesday", () => {
    const wed = new Date(2026, 1, 18); // Wed Feb 18
    const result = startOfWeek(wed);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(15);
  });

  it("returns same day if already Sunday", () => {
    const sun = new Date(2026, 1, 15); // Sun Feb 15
    const result = startOfWeek(sun);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("addDays", () => {
  it("adds positive days", () => {
    const d = new Date(2026, 0, 1);
    expect(addDays(d, 5).getDate()).toBe(6);
  });

  it("subtracts days with negative", () => {
    const d = new Date(2026, 0, 10);
    expect(addDays(d, -3).getDate()).toBe(7);
  });
});

describe("isSameDay", () => {
  it("returns true for same date", () => {
    expect(isSameDay(new Date(2026, 1, 10), new Date(2026, 1, 10))).toBe(true);
  });

  it("returns false for different dates", () => {
    expect(isSameDay(new Date(2026, 1, 10), new Date(2026, 1, 11))).toBe(false);
  });
});

describe("getWeekDays", () => {
  it("returns 7 days starting from Sunday", () => {
    const days = getWeekDays(new Date(2026, 1, 18));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(0);
    expect(days[6].getDay()).toBe(6);
  });
});

describe("formatTime", () => {
  it("formats morning time in 24h", () => {
    const d = new Date(2026, 0, 1, 9, 30);
    expect(formatTime(d)).toBe("09:30");
  });

  it("formats afternoon time in 24h", () => {
    const d = new Date(2026, 0, 1, 14, 0);
    expect(formatTime(d)).toBe("14:00");
  });

  it("formats noon in 24h", () => {
    const d = new Date(2026, 0, 1, 12, 15);
    expect(formatTime(d)).toBe("12:15");
  });
});

// ── Appointment positioning ─────────────────────────────────────────

function makeAppt(startH: number, startM: number, endH: number, endM: number): Appointment {
  const start = new Date(2026, 1, 16, startH, startM);
  const end = new Date(2026, 1, 16, endH, endM);
  return {
    id: "test",
    employeeId: "e1",
    clientName: "Test",
    serviceName: "Test Service",
    serviceCategory: "Other",
    start,
    end,
    status: "confirmed",
  };
}

describe("appointmentTop", () => {
  it("returns 0 for appointment starting at HOUR_START", () => {
    const appt = makeAppt(HOUR_START, 0, HOUR_START + 1, 0);
    expect(appointmentTop(appt)).toBe(0);
  });

  it("returns correct offset for 10:30 AM", () => {
    const appt = makeAppt(10, 30, 11, 30);
    const expected = (10.5 - HOUR_START) * SLOT_HEIGHT;
    expect(appointmentTop(appt)).toBe(expected);
  });
});

describe("appointmentHeight", () => {
  it("returns correct height for 1 hour", () => {
    const appt = makeAppt(9, 0, 10, 0);
    expect(appointmentHeight(appt)).toBe(SLOT_HEIGHT);
  });

  it("returns minimum 20px for very short appointments", () => {
    const appt = makeAppt(9, 0, 9, 5);
    expect(appointmentHeight(appt)).toBeGreaterThanOrEqual(20);
  });
});

describe("getAppointmentsForDay", () => {
  const appts = [
    makeAppt(9, 0, 10, 0),
    { ...makeAppt(9, 0, 10, 0), id: "a2", employeeId: "e2" },
  ];

  it("returns all appointments for day without employee filter", () => {
    expect(getAppointmentsForDay(appts, new Date(2026, 1, 16))).toHaveLength(2);
  });

  it("filters by employee", () => {
    expect(getAppointmentsForDay(appts, new Date(2026, 1, 16), "e1")).toHaveLength(1);
  });

  it("returns empty for different day", () => {
    expect(getAppointmentsForDay(appts, new Date(2026, 1, 17))).toHaveLength(0);
  });
});

// ── Snap & Clamp ────────────────────────────────────────────────────

describe("snapMinutes", () => {
  it("snaps to nearest 15 minutes", () => {
    expect(snapMinutes(7)).toBe(0);
    expect(snapMinutes(8)).toBe(15);
    expect(snapMinutes(22)).toBe(15);
    expect(snapMinutes(23)).toBe(30);
  });
});

describe("dateToMinutes", () => {
  it("converts 10:30 to 630", () => {
    expect(dateToMinutes(new Date(2026, 0, 1, 10, 30))).toBe(630);
  });
});

describe("buildDateWithMinutes", () => {
  it("builds correct date", () => {
    const base = new Date(2026, 1, 16);
    const result = buildDateWithMinutes(base, 630);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
  });
});

describe("clampToWorkingWindow", () => {
  it("clamps start before HOUR_START", () => {
    const result = clampToWorkingWindow(6 * 60, 10 * 60);
    expect(result.start).toBe(HOUR_START * 60);
  });

  it("clamps end after HOUR_END", () => {
    const result = clampToWorkingWindow(19 * 60, 23 * 60);
    expect(result.end).toBe(HOUR_END * 60);
  });

  it("enforces minimum duration", () => {
    const result = clampToWorkingWindow(9 * 60, 9 * 60 + 5);
    expect(result.end - result.start).toBeGreaterThanOrEqual(15);
  });

  it("fixes inverted range", () => {
    const result = clampToWorkingWindow(10 * 60, 9 * 60);
    expect(result.end).toBeGreaterThan(result.start);
  });
});

// ── Validation ──────────────────────────────────────────────────────

describe("validateAppointment", () => {
  it("passes for valid appointment", () => {
    const errors = validateAppointment({
      clientName: "Jane Doe",
      serviceName: "Color",
      employeeId: "e1",
      start: new Date(2026, 1, 16, 9, 0),
      end: new Date(2026, 1, 16, 10, 0),
    });
    expect(errors).toHaveLength(0);
  });

  it("fails for missing client name", () => {
    const errors = validateAppointment({
      clientName: "",
      serviceName: "Color",
      employeeId: "e1",
      start: new Date(2026, 1, 16, 9, 0),
      end: new Date(2026, 1, 16, 10, 0),
    });
    expect(errors.some((e) => e.field === "clientName")).toBe(true);
  });

  it("fails for end before start", () => {
    const errors = validateAppointment({
      clientName: "Jane",
      serviceName: "Color",
      employeeId: "e1",
      start: new Date(2026, 1, 16, 10, 0),
      end: new Date(2026, 1, 16, 9, 0),
    });
    expect(errors.some((e) => e.field === "time")).toBe(true);
  });

  it("fails for duration < 15 min", () => {
    const errors = validateAppointment({
      clientName: "Jane",
      serviceName: "Color",
      employeeId: "e1",
      start: new Date(2026, 1, 16, 9, 0),
      end: new Date(2026, 1, 16, 9, 10),
    });
    expect(errors.some((e) => e.message.includes("15 minutes"))).toBe(true);
  });
});

describe("validateSegments", () => {
  it("fails for less than 2 segments", () => {
    const errors = validateSegments([
      { start: new Date(2026, 1, 16, 9, 0), end: new Date(2026, 1, 16, 10, 0), sortOrder: 0 },
    ]);
    expect(errors.some((e) => e.field === "segments")).toBe(true);
  });

  it("passes for valid segments", () => {
    const errors = validateSegments([
      { start: new Date(2026, 1, 16, 9, 0), end: new Date(2026, 1, 16, 9, 30), sortOrder: 0 },
      { start: new Date(2026, 1, 16, 9, 30), end: new Date(2026, 1, 16, 10, 0), sortOrder: 1 },
    ]);
    expect(errors).toHaveLength(0);
  });

  it("fails for segment with end <= start", () => {
    const errors = validateSegments([
      { start: new Date(2026, 1, 16, 9, 30), end: new Date(2026, 1, 16, 9, 0), sortOrder: 0 },
      { start: new Date(2026, 1, 16, 10, 0), end: new Date(2026, 1, 16, 10, 30), sortOrder: 1 },
    ]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("fails for segment < 5 min", () => {
    const errors = validateSegments([
      { start: new Date(2026, 1, 16, 9, 0), end: new Date(2026, 1, 16, 9, 3), sortOrder: 0 },
      { start: new Date(2026, 1, 16, 9, 3), end: new Date(2026, 1, 16, 10, 0), sortOrder: 1 },
    ]);
    expect(errors.some((e) => e.message.includes("5 minutes"))).toBe(true);
  });
});

describe("checkOverlap", () => {
  const existing: Appointment[] = [
    makeAppt(9, 0, 10, 30),
  ];

  it("detects overlap", () => {
    expect(
      checkOverlap(existing, "e1", new Date(2026, 1, 16, 10, 0), new Date(2026, 1, 16, 11, 0))
    ).toBe(true);
  });

  it("no overlap for adjacent times", () => {
    expect(
      checkOverlap(existing, "e1", new Date(2026, 1, 16, 10, 30), new Date(2026, 1, 16, 11, 30))
    ).toBe(false);
  });

  it("no overlap for different employee", () => {
    expect(
      checkOverlap(existing, "e2", new Date(2026, 1, 16, 9, 0), new Date(2026, 1, 16, 10, 0))
    ).toBe(false);
  });

  it("excludes by id", () => {
    expect(
      checkOverlap(existing, "e1", new Date(2026, 1, 16, 9, 0), new Date(2026, 1, 16, 10, 0), "test")
    ).toBe(false);
  });
});
