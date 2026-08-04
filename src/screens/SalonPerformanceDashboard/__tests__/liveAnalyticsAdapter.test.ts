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

  it("keeps checkout unavailable and finance demo idle with no activity", () => {
    expect(result.provenance.checkout).toBe("unavailable");
    expect(result.provenance.expenses).toBe("unavailable");
    expect(result.provenance.retail).toBe("unavailable");
    expect(result.hasCheckoutData).toBe(false);
    expect(result.hasExpenseData).toBe(false);
    expect(result.hasRetailData).toBe(false);
    expect(result.financeDemo.active).toBe(false);
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

  it("activates pilot finance preview from booked activity", () => {
    expect(result.hasExpenseData).toBe(true);
    expect(result.hasRetailData).toBe(true);
    expect(result.financeDemo.active).toBe(true);
    expect(result.financeDemo.totalExpenses).toBeGreaterThan(0);
    expect(result.financeDemo.totalRetailRevenue).toBeGreaterThan(0);
    expect(result.provenance.expenses).toBe("operational");
    expect(result.provenance.retail).toBe("operational");
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
  const visit = appt({ id: "appt-color-1", customerId: "cust-1" });
  const result = computeLiveAnalytics(
    emptyInputs({
      appointments: [visit],
      productUsage: [usage({ mixSessionId: visit.id })],
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

describe("computeLiveAnalytics — usage attributed to visit service category", () => {
  it("puts highlight-visit materials under Highlights, not Color product type", () => {
    const visit = appt({
      id: "appt-hl-1",
      customerId: "cust-hl",
      serviceId: "svc-hl",
      serviceName: "Full head highlights",
      serviceCategoryId: "highlights",
    });
    const result = computeLiveAnalytics(
      emptyInputs({
        appointments: [visit],
        services: [
          service({
            id: "svc-hl",
            categoryId: "highlights",
            name: "Full head highlights",
          }),
        ],
        // Catalog product is typed as color (typical for bleach/shade SKUs).
        products: [product({ serviceCategoryId: "color" })],
        productUsage: [
          usage({
            mixSessionId: visit.id,
            costAtUseUsd: 40,
            costCurrency: "ILS",
            grams: 80,
            sourceServiceName: "Full head highlights",
            sourceSeries: "BLONDME",
            sourceShade: "9+",
          }),
        ],
        performance: [perf("staff-1", 1)],
      }),
      janRange(),
    );

    const janProducts = result.monthlyProducts.find((r) => (r.Highlights || 0) > 0 || (r.Color || 0) > 0);
    expect(janProducts?.Highlights).toBe(80);
    expect(janProducts?.HighlightsCost).toBe(40);
    expect(janProducts?.Color || 0).toBe(0);
    expect(result.categoryAvgMaterialCost.Highlights).toBe(40);
    expect(result.categoryAvgMaterialCost.Color).toBeUndefined();
    expect(result.products[0]?.category).toBe("Highlights");
  });

  it("falls back to sourceServiceName when the appointment is missing", () => {
    const result = computeLiveAnalytics(
      emptyInputs({
        appointments: [],
        products: [product({ serviceCategoryId: "color" })],
        productUsage: [
          usage({
            mixSessionId: "orphan-visit",
            costAtUseUsd: 25,
            costCurrency: "ILS",
            grams: 50,
            sourceServiceName: "Toner for highlights",
            recordedAt: new Date(2026, 0, 15, 10, 30, 0).toISOString(),
          }),
        ],
      }),
      janRange(),
    );

    expect(result.monthlyProducts.some((r) => r.Toner === 50)).toBe(true);
    expect(result.categoryMaterialDays[0]?.category).toBe("Toner");
  });
});

describe("computeLiveAnalytics — material cost per customer×category×day", () => {
  it("sums mix ingredients into one bowl, and multiple mixes same day into one unit", () => {
    const mixA = appt({
      id: "appt-mix-a",
      customerId: "cust-aya",
      serviceId: "svc-color",
      serviceCategoryId: "color",
    });
    const mixB = appt({
      id: "appt-mix-b",
      customerId: "cust-aya",
      serviceId: "svc-color",
      serviceCategoryId: "color",
      startTime: new Date(2026, 0, 15, 14, 0, 0).toISOString(),
      endTime: new Date(2026, 0, 15, 15, 0, 0).toISOString(),
    });
    const result = computeLiveAnalytics(
      emptyInputs({
        appointments: [mixA, mixB],
        productUsage: [
          // One mix = pink summary + ingredient rows (not 3 bowls).
          usage({
            id: "u1",
            mixSessionId: mixA.id,
            costAtUseUsd: 10,
            costCurrency: "ILS",
            sourceSeries: "NANOPLEX",
            sourceShade: "7.11",
          }),
          usage({
            id: "u2",
            mixSessionId: mixA.id,
            costAtUseUsd: 15,
            costCurrency: "ILS",
            sourceSeries: "NANOPLEX",
            sourceShade: "6.00",
          }),
          usage({
            id: "u3",
            mixSessionId: mixA.id,
            costAtUseUsd: 5,
            costCurrency: "ILS",
            sourceBrand: "L'OREAL",
            sourceSeries: "OXYDANT DEVELOPERS",
            sourceShade: "6% 20 Vol.",
          }),
          // Second mix same client/category/day.
          usage({
            id: "u4",
            mixSessionId: mixB.id,
            costAtUseUsd: 20,
            costCurrency: "ILS",
            recordedAt: mixB.startTime,
            sourceSeries: "MAJIREL",
            sourceShade: "6.1",
          }),
        ],
        performance: [perf("staff-1", 2)],
      }),
      janRange(),
    );

    // 10+15+5+20 = 50 for one customer-day-category unit; 2 mixes/bowls.
    expect(result.categoryAvgMaterialCost.Color).toBe(50);
    expect(result.categoryMaterialDays).toEqual([
      expect.objectContaining({
        category: "Color",
        customerId: "cust-aya",
        bowlCount: 2,
        visitCount: 2,
        totalCost: 50,
        avgCostPerBowl: 25,
        materialLabels: expect.arrayContaining(["NANOPLEX 6.00", "NANOPLEX 7.11", "MAJIREL 6.1", "6%"]),
      }),
    ]);
  });

  it("keeps separate days as separate average units", () => {
    const day1 = appt({
      id: "appt-day-1",
      customerId: "cust-aya",
      startTime: new Date(2026, 0, 10, 10, 0, 0).toISOString(),
      endTime: new Date(2026, 0, 10, 11, 0, 0).toISOString(),
    });
    const day2 = appt({
      id: "appt-day-2",
      customerId: "cust-aya",
      startTime: new Date(2026, 0, 20, 10, 0, 0).toISOString(),
      endTime: new Date(2026, 0, 20, 11, 0, 0).toISOString(),
    });
    const result = computeLiveAnalytics(
      emptyInputs({
        appointments: [day1, day2],
        productUsage: [
          usage({ id: "u1", mixSessionId: day1.id, costAtUseUsd: 20, recordedAt: day1.startTime, costCurrency: "ILS" }),
          usage({ id: "u2", mixSessionId: day2.id, costAtUseUsd: 40, recordedAt: day2.startTime, costCurrency: "ILS" }),
        ],
        performance: [perf("staff-1", 2)],
      }),
      janRange(),
    );

    expect(result.categoryAvgMaterialCost.Color).toBe(30); // (20+40)/2
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
