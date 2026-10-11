import type { Appointment } from "../calendarTypes";
import {
  buildFlowRows,
  layoutFlowBar,
  layoutNowLine,
  resolveFlowTemporalState,
  resolveFlowWindow,
  summarizeFlowDay,
} from "../flowViewModel";

function appt(overrides: Partial<Appointment> & Pick<Appointment, "id" | "start" | "end">): Appointment {
  return {
    employeeId: "e1",
    clientName: "Dana",
    serviceName: "Root Color",
    serviceCategory: "Color",
    status: "confirmed",
    ...overrides,
  };
}

const day = new Date(2026, 7, 24, 12, 0, 0);

describe("resolveFlowWindow", () => {
  it("defaults to 09:00–19:00 when the day is empty", () => {
    expect(resolveFlowWindow([])).toEqual({ startMinutes: 9 * 60, endMinutes: 19 * 60 });
  });

  it("expands to cover an earlier appointment", () => {
    const window = resolveFlowWindow([
      appt({ id: "a", start: new Date(2026, 7, 24, 8, 0), end: new Date(2026, 7, 24, 10, 0) }),
    ]);
    expect(window.startMinutes).toBe(8 * 60);
    expect(window.endMinutes).toBe(19 * 60);
  });

  it("does not open the overnight axis when now is outside salon hours", () => {
    const window = resolveFlowWindow([], 1 * 60 + 55);
    expect(window.startMinutes).toBe(9 * 60);
    expect(window.endMinutes).toBe(19 * 60);
  });
});

describe("layoutFlowBar", () => {
  const window = { startMinutes: 9 * 60, endMinutes: 19 * 60 };

  it("makes a 2-hour visit twice as wide as a 1-hour visit", () => {
    const oneHour = layoutFlowBar(
      new Date(2026, 7, 24, 10, 0),
      new Date(2026, 7, 24, 11, 0),
      window,
    );
    const twoHour = layoutFlowBar(
      new Date(2026, 7, 24, 10, 0),
      new Date(2026, 7, 24, 12, 0),
      window,
    );
    expect(twoHour.widthPct).toBeCloseTo(oneHour.widthPct * 2, 5);
    expect(oneHour.leftPct).toBeCloseTo(10, 5);
    expect(twoHour.leftPct).toBeCloseTo(10, 5);
  });
});

describe("layoutNowLine", () => {
  it("places 14:00 at 50% of a 09:00–19:00 window", () => {
    expect(layoutNowLine(14 * 60, { startMinutes: 9 * 60, endMinutes: 19 * 60 })).toBe(50);
  });

  it("hides the line outside the window", () => {
    expect(layoutNowLine(5 * 60, { startMinutes: 9 * 60, endMinutes: 19 * 60 })).toBeNull();
  });
});

describe("resolveFlowTemporalState", () => {
  const start = new Date(2026, 7, 24, 10, 0);
  const end = new Date(2026, 7, 24, 12, 0);

  it("marks past visits as ended", () => {
    expect(resolveFlowTemporalState({
      start, end, status: "confirmed", isInSalon: false, now: new Date(2026, 7, 24, 13, 0),
    })).toBe("ended");
  });

  it("marks the current slot as active", () => {
    expect(resolveFlowTemporalState({
      start, end, status: "confirmed", isInSalon: false, now: new Date(2026, 7, 24, 11, 0),
    })).toBe("active");
  });

  it("marks a future slot as upcoming", () => {
    expect(resolveFlowTemporalState({
      start, end, status: "confirmed", isInSalon: false, now: new Date(2026, 7, 24, 9, 0),
    })).toBe("upcoming");
  });

  it("keeps a checked-in client active even before the planned start", () => {
    expect(resolveFlowTemporalState({
      start, end, status: "confirmed", isInSalon: true, now: new Date(2026, 7, 24, 9, 0),
    })).toBe("active");
  });

  it("marks yesterday's visits as ended even at the same clock time", () => {
    expect(resolveFlowTemporalState({
      start, end, status: "confirmed", isInSalon: false, now: new Date(2026, 7, 25, 11, 0),
    })).toBe("ended");
  });
});

describe("buildFlowRows", () => {
  it("uses existing appointments, hides cancelled, and flags live check-in", () => {
    const rows = buildFlowRows({
      appointments: [
        appt({
          id: "live",
          customerId: "c1",
          clientName: "Michaela",
          start: new Date(2026, 7, 24, 10, 0),
          end: new Date(2026, 7, 24, 12, 0),
        }),
        appt({
          id: "later",
          clientName: "Rachel",
          start: new Date(2026, 7, 24, 14, 0),
          end: new Date(2026, 7, 24, 15, 0),
        }),
        appt({
          id: "gone",
          clientName: "Cancelled",
          status: "cancelled",
          start: new Date(2026, 7, 24, 9, 0),
          end: new Date(2026, 7, 24, 10, 0),
        }),
      ],
      day,
      employees: [{ id: "e1", name: "Noa Levi", avatar: "NL", role: "Stylist", color: "#D7897F" }],
      liveVisits: [{ appointmentId: "live", customerId: "c1", status: "active" }],
      now: new Date(2026, 7, 24, 11, 0),
      customerAvatars: { c1: "https://example.com/michaela.jpg" },
    });

    expect(rows.map((row) => row.id)).toEqual(["live", "later"]);
    expect(rows[0].isInSalon).toBe(true);
    expect(rows[0].temporalState).toBe("active");
    expect(rows[0].staffName).toBe("Noa Levi");
    expect(rows[0].customerAvatarUrl).toBe("https://example.com/michaela.jpg");
    expect(rows[1].isInSalon).toBe(false);
    expect(rows[1].temporalState).toBe("upcoming");
    expect(summarizeFlowDay(rows)).toEqual({
      inSalon: 1,
      arrivingSoon: 0,
      finishingSoon: 0,
      total: 2,
    });
  });

  it("treats an in-progress appointment as currently in the salon", () => {
    const rows = buildFlowRows({
      appointments: [
        appt({
          id: "open",
          clientName: "Liyla",
          status: "in-progress",
          start: new Date(2026, 7, 24, 10, 0),
          end: new Date(2026, 7, 24, 12, 0),
        }),
      ],
      day,
      employees: [{ id: "e1", name: "Noa Levi", avatar: "NL", role: "Stylist", color: "#D7897F" }],
      liveVisits: [],
      now: new Date(2026, 7, 24, 11, 0),
    });
    expect(rows[0].isInSalon).toBe(true);
    expect(rows[0].temporalState).toBe("active");
  });
});
