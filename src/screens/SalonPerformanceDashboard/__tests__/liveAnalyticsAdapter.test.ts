// The adapter module also exports a React hook that value-imports `crmHooks`,
// which transitively loads the CRM provider (uses `import.meta`, unsupported in
// this jest transform). `computeLiveAnalytics` is pure and needs none of it, so
// stub the hooks module to keep the import chain runtime-free.
jest.mock("../../SalonCRM/data/crmHooks", () => ({
  useAppointments: () => [],
  useCustomers: () => [],
  useServices: () => [],
  useInventoryItems: () => [],
  useProducts: () => [],
  useBrands: () => [],
  useProductUsage: () => [],
  useReweighOutcomes: () => [],
  useMixSessions: () => [],
  useStaffPerformance: () => [],
}));

import {
  computeLiveAnalytics,
  type LiveAnalyticsInputs,
} from "../liveAnalyticsAdapter";
import type { DateRange } from "../analyticsDateRange";
import type {
  Appointment,
  Product,
  ProductUsage,
  Service,
} from "../../SalonCRM/data/crmTypes";
import type { StaffPerformanceVm } from "../../SalonCRM/data/crmSelectors";

/**
 * Adapter provenance tests exercise the pure `computeLiveAnalytics` core so
 * the Slice A truth contract (no silent recorded/estimated conflation, honest
 * classification, coverage, guards) is verified without React or the CRM
 * provider.
 */

const SALON = "salon-1";

function appt(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: `appt-${Math.random().toString(36).slice(2)}`,
    salonId: SALON,
    staffMemberId: "staff-1",
    customerName: "Test Client",
    serviceId: "svc-color",
    serviceName: "Color",
    serviceCategoryId: "color",
    startTime: new Date(2026, 0, 15, 10, 0, 0).toISOString(),
    endTime: new Date(2026, 0, 15, 11, 0, 0).toISOString(),
    status: "completed",
    segments: [],
    ...overrides,
  } as Appointment;
}

function service(overrides: Partial<Service> = {}): Service {
  return {
    id: "svc-color",
    salonId: SALON,
    categoryId: "color",
    name: "Color",
    defaultDurationMinutes: 60,
    defaultPriceCents: 10_000, // $100
    defaultMaterialCostCents: 2_000, // $20
    ...overrides,
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    brandId: "brand-1",
    productLineId: "line-1",
    shadeCode: "6.0",
    sizeGrams: 60,
    serviceCategoryId: "color",
    ...overrides,
  };
}

function usage(overrides: Partial<ProductUsage> = {}): ProductUsage {
  return {
    id: `usage-${Math.random().toString(36).slice(2)}`,
    mixSessionId: "mix-1",
    productId: "prod-1",
    inventoryItemId: "inv-1",
    grams: 50,
    costAtUseUsd: 12,
    recordedAt: new Date(2026, 0, 15, 10, 30, 0).toISOString(),
    ...overrides,
  };
}

function perf(id: string, appointments: number): StaffPerformanceVm {
  return {
    staff: {
      id,
      salonId: SALON,
      name: `Staff ${id}`,
      role: "Stylist",
      color: "#fff",
      status: "active",
      rating: 4.5,
      workingHours: [],
    },
    appointments,
    completed: appointments,
    inProgress: 0,
    upcoming: 0,
    revenueCents: appointments * 10_000,
    utilizationPct: 50,
    rating: 4.5,
  } as StaffPerformanceVm;
}

function janRange(): DateRange {
  return { from: new Date(2026, 0, 1), to: new Date(2026, 0, 31, 23, 59, 59), preset: "custom" };
}

function emptyInputs(overrides: Partial<LiveAnalyticsInputs> = {}): LiveAnalyticsInputs {
  return {
    appointments: [],
    customers: [],
    services: [service()],
    inventory: [],
    products: [product()],
    brands: [],
    productUsage: [],
    reweighOutcomes: [],
    mixSessions: [],
    performance: [],
    ...overrides,
  };
}

describe("computeLiveAnalytics — empty range", () => {
  const result = computeLiveAnalytics(emptyInputs(), janRange());

  it("reports no activity and unavailable material cost", () => {
    expect(result.hasActivity).toBe(false);
    expect(result.coverage.appointmentCount).toBe(0);
    expect(result.materialCost.basis).toBe("none");
    expect(result.provenance.materialCost).toBe("unavailable");
  });

  it("keeps every guard closed with no data", () => {
    expect(result.guards).toEqual({
      comparisonAvailable: false,
      rankingAvailable: false,
      staffComparisonAvailable: false,
      anomalyAvailable: false,
    });
  });

  it("always marks checkout / expenses / retail unavailable", () => {
    expect(result.provenance.checkout).toBe("unavailable");
    expect(result.provenance.expenses).toBe("unavailable");
    expect(result.provenance.retail).toBe("unavailable");
    expect(result.hasCheckoutData).toBe(false);
    expect(result.revenueIsEstimated).toBe(true);
  });
});

describe("computeLiveAnalytics — booked value with no recorded usage", () => {
  const result = computeLiveAnalytics(
    emptyInputs({ appointments: [appt()], performance: [perf("staff-1", 1)] }),
    janRange(),
  );

  it("classifies revenue as an estimate and volume as operational", () => {
    expect(result.provenance.revenue).toBe("estimated");
    expect(result.provenance.volume).toBe("operational");
    expect(result.hasActivity).toBe(true);
    expect(result.coverage.appointmentCount).toBe(1);
  });

  it("does not silently conflate estimated material cost with recorded cost", () => {
    expect(result.materialCost.recorded).toBe(0);
    expect(result.materialCost.estimated).toBe(20);
    expect(result.materialCost.basis).toBe("estimated");
    expect(result.materialCost.hasRecordedUsage).toBe(false);
    expect(result.provenance.materialCost).toBe("estimated");

    const janRow = result.monthlyCombined.find((r) => r.appointments > 0);
    expect(janRow?.recordedProductCost).toBe(0);
    expect(janRow?.estimatedMaterialCost).toBe(20);
    // The legacy convenience field still falls back to the estimate, but the
    // explicit recorded field stays honest at 0.
    expect(janRow?.productCost).toBe(20);
  });
});

describe("computeLiveAnalytics — recorded product usage", () => {
  const result = computeLiveAnalytics(
    emptyInputs({
      appointments: [appt()],
      productUsage: [usage()],
      performance: [perf("staff-1", 1)],
    }),
    janRange(),
  );

  it("classifies recorded usage + cost as confirmed", () => {
    expect(result.materialCost.recorded).toBe(12);
    expect(result.materialCost.basis).toBe("recorded");
    expect(result.materialCost.hasRecordedUsage).toBe(true);
    expect(result.provenance.materialCost).toBe("confirmed");
    expect(result.provenance.recordedUsage).toBe("confirmed");
    expect(result.coverage.recordedUsageRecordCount).toBe(1);
    expect(result.coverage.unmappedProductUsageCount).toBe(0);

    const janRow = result.monthlyCombined.find((r) => r.appointments > 0);
    expect(janRow?.recordedProductCost).toBe(12);
  });
});

describe("computeLiveAnalytics — broken usage linkage", () => {
  it("marks recorded usage incomplete when product linkage is missing", () => {
    const result = computeLiveAnalytics(
      emptyInputs({ productUsage: [usage({ productId: "ghost" })] }),
      janRange(),
    );
    expect(result.coverage.unmappedProductUsageCount).toBe(1);
    expect(result.provenance.recordedUsage).toBe("incomplete");
  });

  it("marks recorded usage incomplete when the currency is unknown", () => {
    const result = computeLiveAnalytics(
      emptyInputs({ productUsage: [usage({ costCurrency: "XYZ" })] }),
      janRange(),
    );
    expect(result.coverage.unmappedProductUsageCount).toBe(1);
    expect(result.provenance.recordedUsage).toBe("incomplete");
  });
});

describe("computeLiveAnalytics — guards & coverage", () => {
  it("opens the comparison/anomaly guards only with enough active months", () => {
    const twelveMonthRange: DateRange = {
      from: new Date(2026, 0, 1),
      to: new Date(2026, 11, 31, 23, 59, 59),
      preset: "custom",
    };
    const result = computeLiveAnalytics(
      emptyInputs({
        appointments: [
          appt({ startTime: new Date(2026, 0, 10, 10).toISOString(), endTime: new Date(2026, 0, 10, 11).toISOString() }),
          appt({ startTime: new Date(2026, 5, 10, 10).toISOString(), endTime: new Date(2026, 5, 10, 11).toISOString() }),
          appt({ startTime: new Date(2026, 9, 10, 10).toISOString(), endTime: new Date(2026, 9, 10, 11).toISOString() }),
        ],
        performance: [perf("staff-1", 3)],
      }),
      twelveMonthRange,
    );
    expect(result.coverage.monthsWithActivity).toBe(3);
    expect(result.guards.comparisonAvailable).toBe(true);
    expect(result.guards.anomalyAvailable).toBe(true);
  });

  it("opens staff comparison only with two active staff", () => {
    const single = computeLiveAnalytics(
      emptyInputs({ appointments: [appt()], performance: [perf("staff-1", 1)] }),
      janRange(),
    );
    expect(single.guards.staffComparisonAvailable).toBe(false);

    const two = computeLiveAnalytics(
      emptyInputs({
        appointments: [appt({ staffMemberId: "staff-1" }), appt({ staffMemberId: "staff-2" })],
        performance: [perf("staff-1", 1), perf("staff-2", 1)],
      }),
      janRange(),
    );
    expect(two.guards.staffComparisonAvailable).toBe(true);
  });

  it("flags partial coverage when the window is wider than the data", () => {
    const wide: DateRange = {
      from: new Date(2026, 0, 1),
      to: new Date(2026, 11, 31, 23, 59, 59),
      preset: "custom",
    };
    const partial = computeLiveAnalytics(
      emptyInputs({ appointments: [appt({ startTime: new Date(2026, 5, 10, 10).toISOString(), endTime: new Date(2026, 5, 10, 11).toISOString() })] }),
      wide,
    );
    expect(partial.coverage.hasPartialCoverage).toBe(true);

    // A window that starts/ends exactly on the data bounds is full coverage.
    const start = new Date(2026, 0, 10, 10, 0, 0);
    const end = new Date(2026, 0, 20, 10, 0, 0);
    const full = computeLiveAnalytics(
      emptyInputs({
        appointments: [
          appt({ startTime: start.toISOString(), endTime: new Date(2026, 0, 10, 11).toISOString() }),
          appt({ startTime: end.toISOString(), endTime: new Date(2026, 0, 20, 11).toISOString() }),
        ],
      }),
      { from: start, to: end, preset: "custom" },
    );
    expect(full.coverage.hasPartialCoverage).toBe(false);
  });
});
