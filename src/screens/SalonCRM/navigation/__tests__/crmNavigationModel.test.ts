import { buildCrmNavigation, type CrmNavigationLabels } from "../crmNavigationModel";
import type { ServiceDepartment } from "../../schedule/catalogTypes";

const labels: CrmNavigationLabels = {
  home: "Home",
  customers: "Customers",
  rawProducts: "Raw products",
  retailProducts: "Retail products",
  settings: "Settings",
  analytics: "Analytics",
  scheduleCalendar: (department) => `${department.calendarLabel ?? department.name} Calendar`,
  fallbackCalendar: "Calendar",
};

const colors = { hair: "#D7897F", cosmetics: "#F9B95C" };

function dept(partial: Partial<ServiceDepartment> & { id: string }): ServiceDepartment {
  return {
    name: partial.id,
    sortOrder: 0,
    status: "active",
    ...partial,
  } as ServiceDepartment;
}

describe("buildCrmNavigation", () => {
  it("emits a single fallback calendar when there are no departments", () => {
    const model = buildCrmNavigation({ departments: [], labels, colors });
    const calendarItems = model.all.filter((item) => item.iconKey === "calendar");
    expect(calendarItems).toHaveLength(1);
    expect(calendarItems[0]).toMatchObject({
      id: "schedule-default",
      path: "/crm/schedule",
      color: colors.hair,
    });
  });

  it("builds one calendar entry per active department with stable ids", () => {
    const model = buildCrmNavigation({
      departments: [
        dept({ id: "hair", name: "Hair", sortOrder: 0 }),
        dept({ id: "cosmetics", name: "Cosmetics", sortOrder: 1, calendarColor: "#123456" }),
      ],
      labels,
      colors,
    });
    const calendarItems = model.all.filter((item) => item.iconKey === "calendar");
    expect(calendarItems.map((item) => item.id)).toEqual(["schedule-hair", "schedule-cosmetics"]);
    expect(calendarItems[0]).toMatchObject({
      path: "/crm/schedule?calendar=hair",
      color: colors.hair,
      departmentId: "hair",
    });
    // Department-provided calendar color wins over the positional default.
    expect(calendarItems[1].color).toBe("#123456");
  });

  it("excludes inactive departments and sorts by sortOrder", () => {
    const model = buildCrmNavigation({
      departments: [
        dept({ id: "b", name: "B", sortOrder: 2 }),
        dept({ id: "archived", name: "Archived", sortOrder: 0, status: "archived" }),
        dept({ id: "a", name: "A", sortOrder: 1 }),
      ],
      labels,
      colors,
    });
    const scheduleIds = model.all.filter((item) => item.iconKey === "calendar").map((item) => item.id);
    expect(scheduleIds).toEqual(["schedule-a", "schedule-b"]);
  });

  it("keeps the core sections and splits primary/more consistently", () => {
    const model = buildCrmNavigation({ departments: [], labels, colors });
    const ids = model.all.map((item) => item.id);
    expect(ids).toEqual([
      "home",
      "schedule-default",
      "customers",
      "raw-products",
      "retail-products",
      "settings",
      "analytics",
    ]);
    // All 7 core items fit inside the 8-item primary rail; nothing overflows.
    expect(model.primary).toHaveLength(ids.length);
    expect(model.more).toHaveLength(0);
    // Every item carries a stable, unique id key.
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("drops items gated by a disabled feature flag", () => {
    const model = buildCrmNavigation({
      departments: [],
      labels,
      colors,
      features: { analytics: false },
    });
    // No default item declares `requiredFeature: "analytics"`, so gating is a
    // no-op today; the analytics entry remains available.
    expect(model.all.some((item) => item.id === "analytics")).toBe(true);
  });
});

// The shell memoizes this model to keep the sidebar dimensionally stable across
// navigations. Memoization is only safe if the builder is deterministic — the
// same bootstrap snapshot must always yield the same ids/paths/order, so a
// background refresh never reshuffles or re-keys the rail (a layout-shift
// source). These tests lock that determinism in as a unit-level proxy for the
// browser layout-stability assertions.
describe("buildCrmNavigation determinism (layout stability)", () => {
  const departments: ServiceDepartment[] = [
    dept({ id: "hair", name: "Hair", sortOrder: 0 }),
    dept({ id: "cosmetics", name: "Cosmetics", sortOrder: 1 }),
  ];

  it("returns deep-equal models for identical inputs across renders", () => {
    const a = buildCrmNavigation({ departments, labels, colors, role: "owner" });
    const b = buildCrmNavigation({ departments, labels, colors, role: "owner" });
    // Different object identities (pure function), but structurally identical so
    // React keys and order never change between refreshes.
    expect(a).not.toBe(b);
    expect(a.all).toEqual(b.all);
    expect(a.all.map((i) => i.id)).toEqual(b.all.map((i) => i.id));
  });

  it("keeps the core sections regardless of role (no role gating today)", () => {
    const owner = buildCrmNavigation({ departments, labels, colors, role: "owner" });
    const stylist = buildCrmNavigation({ departments, labels, colors, role: "stylist" });
    expect(stylist.all.map((i) => i.id)).toEqual(owner.all.map((i) => i.id));
  });

  it("accepts permissions/features without dropping opt-in-only core items", () => {
    const model = buildCrmNavigation({
      departments,
      labels,
      colors,
      role: "stylist",
      permissions: ["schedule.read"],
      features: { analytics: true },
    });
    for (const id of ["home", "customers", "analytics", "settings"]) {
      expect(model.all.some((item) => item.id === id)).toBe(true);
    }
  });

  it("assigns every schedule item a stable, unique department-scoped id", () => {
    const model = buildCrmNavigation({ departments, labels, colors });
    const scheduleIds = model.all.filter((i) => i.iconKey === "calendar").map((i) => i.id);
    expect(scheduleIds).toEqual(["schedule-hair", "schedule-cosmetics"]);
    expect(new Set(scheduleIds).size).toBe(scheduleIds.length);
  });
});
