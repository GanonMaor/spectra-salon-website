import { hasActiveWashStation, isHairCalendarDepartment } from "../scheduleCalendarTruth";
import type { SalonResource } from "../catalogTypes";

describe("schedule calendar truth", () => {
  it("does not infer Hair from a legacy ID outside the display contract", () => {
    expect(isHairCalendarDepartment({
      name: "Cosmetics",
      calendarLabel: "Cosmetics",
    })).toBe(false);
    expect(isHairCalendarDepartment({
      name: "Hair",
      calendarLabel: "Hair Calendar",
    })).toBe(true);
  });

  it("exposes wash calendar only for an active configured wash station", () => {
    const resource = (
      type: SalonResource["type"],
      status: SalonResource["status"],
      departmentId?: string,
    ): SalonResource => ({
      id: `${type}-${status}`,
      type,
      name: type,
      status,
      sortOrder: 0,
      departmentId,
    });

    expect(hasActiveWashStation([])).toBe(false);
    expect(hasActiveWashStation([resource("treatment-room", "active")])).toBe(false);
    expect(hasActiveWashStation([resource("wash-station", "archived")])).toBe(false);
    expect(hasActiveWashStation(
      [resource("wash-station", "active", "dept-cosmetics")],
      "dept-hair",
    )).toBe(false);
    expect(hasActiveWashStation(
      [resource("wash-station", "active", "dept-hair")],
      "dept-hair",
    )).toBe(true);
    expect(hasActiveWashStation(
      [resource("wash-station", "active")],
      "dept-hair",
    )).toBe(true);
  });
});
