import {
  ANALYTICS_TABS,
  ANALYTICS_TRUTH_VERSION,
  METRIC_REGISTRY,
  REGISTERED_METRIC_IDS,
  assertRegistryIntegrity,
  getMetric,
  isRegisteredMetric,
  metricsByClassification,
  metricsForTab,
  type MetricClassification,
} from "../index";

/**
 * The registry is the machine-readable inventory of every rendered analytics
 * surface. These tests enforce the Slice A truth contract: every surface is
 * registered exactly once, classifications match the plan, and no metric can
 * ship without honest provenance / a blocked reason.
 */

/**
 * Canonical inventory of surfaces that are actually rendered today. If the
 * dashboard grows a surface, it must be added here AND to the registry — this
 * list is the static guard that prevents an unregistered metric from shipping.
 */
const RENDERED_SURFACES: Record<string, MetricClassification> = {
  // LiveKpiStrip
  "kpiStrip.liveAppointments": "operational",
  "kpiStrip.reweighAdoption": "operational",
  "kpiStrip.reweighSavings": "estimated",
  "kpiStrip.inventoryHealth": "operational",
  "kpiStrip.lowStockCount": "operational",
  "kpiStrip.topPerformer": "estimated",
  // Dashboard
  "dashboard.bookedServiceValue": "estimated",
  "dashboard.estMaterialCost": "estimated",
  "dashboard.operatingOverhead": "unavailable",
  "dashboard.netProfit": "unavailable",
  "dashboard.revenuePerVisit": "estimated",
  "dashboard.materialCostPerVisit": "estimated",
  "dashboard.grossProfitPerVisit": "estimated",
  "dashboard.perVisitTrend": "unavailable",
  "dashboard.revenueByCategory": "estimated",
  "dashboard.activeClientBase": "operational",
  "dashboard.newClientAcquisition": "operational",
  "dashboard.serviceVolume": "operational",
  "dashboard.topRevenueService": "estimated",
  "dashboard.topProfitService": "estimated",
  "dashboard.extraChargeRevenue": "estimated",
  "dashboard.mixOptimizationSavings": "estimated",
  "dashboard.reweighDetail": "operational",
  "dashboard.savedGramsDirect": "confirmed",
  "dashboard.revenueAppointmentsTrend.appointments": "operational",
  "dashboard.revenueAppointmentsTrend.revenue": "estimated",
  "dashboard.topPerformers": "estimated",
  "dashboard.topServices": "operational",
  "dashboard.mostUsedProducts": "confirmed",
  // Staff performance
  "staffPerformance.totalAppointments": "operational",
  "staffPerformance.bookedRevenue": "estimated",
  "staffPerformance.avgUtilization": "operational",
  "staffPerformance.avgRating": "unavailable",
  "staffPerformance.staffTable": "estimated",
  "staffPerformance.staffRank": "estimated",
  "staffPerformance.trend": "unavailable",
  "staffPerformance.appointmentsByStaff": "operational",
  "staffPerformance.monthlyAppointments": "operational",
  // Services
  "services.totalServices": "operational",
  "services.bookedRevenue": "estimated",
  "services.avgMaterialCost": "estimated",
  "services.topCategory": "operational",
  "services.categoryBreakdown": "operational",
  "services.serviceMix": "operational",
  "services.revenueByCategory": "estimated",
  "services.monthlyServiceVolume": "operational",
  "services.allServicesTable": "estimated",
  "services.trend": "unavailable",
  // Product usage
  "productUsage.totalUsage": "confirmed",
  "productUsage.totalProductCost": "confirmed",
  "productUsage.categories": "operational",
  "productUsage.lowStockAlerts": "operational",
  "productUsage.usageByCategory": "confirmed",
  "productUsage.costByCategory": "estimated",
  "productUsage.monthlyUsageTrend": "confirmed",
  "productUsage.inventoryTable": "confirmed",
  "productUsage.trend": "unavailable",
  // Sales / Expenses (explicit unavailable)
  "sales.retail": "unavailable",
  "expenses.operating": "unavailable",
};

describe("metric registry integrity", () => {
  it("passes the internal integrity assertion", () => {
    expect(() => assertRegistryIntegrity()).not.toThrow();
  });

  it("has no duplicate metric ids", () => {
    const ids = METRIC_REGISTRY.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stamps every descriptor with the current contract version", () => {
    for (const m of METRIC_REGISTRY) expect(m.version).toBe(ANALYTICS_TRUTH_VERSION);
  });

  it("covers every analytics tab (including the KPI strip)", () => {
    for (const tab of ANALYTICS_TABS) {
      expect(metricsForTab(tab).length).toBeGreaterThan(0);
    }
  });
});

describe("rendered surface completeness (static guard)", () => {
  it("registers every rendered surface with the expected classification", () => {
    for (const [id, classification] of Object.entries(RENDERED_SURFACES)) {
      const descriptor = getMetric(id);
      expect(descriptor).toBeDefined();
      expect(descriptor?.classification).toBe(classification);
    }
  });

  it("does not register any surface that is not actually rendered", () => {
    const known = new Set(Object.keys(RENDERED_SURFACES));
    const unexpected = REGISTERED_METRIC_IDS.filter((id) => !known.has(id));
    expect(unexpected).toEqual([]);
  });

  it("rejects unregistered metric ids", () => {
    expect(isRegisteredMetric("dashboard.bookedServiceValue")).toBe(true);
    expect(isRegisteredMetric("dashboard.madeUpMetric")).toBe(false);
  });
});

describe("data contract classifications", () => {
  it("treats booked service value / default material / category allocation as estimated", () => {
    expect(getMetric("dashboard.bookedServiceValue")?.classification).toBe("estimated");
    expect(getMetric("dashboard.estMaterialCost")?.classification).toBe("estimated");
    expect(getMetric("dashboard.revenueByCategory")?.classification).toBe("estimated");
    expect(getMetric("productUsage.costByCategory")?.classification).toBe("estimated");
  });

  it("treats appointment / service volume as operational", () => {
    expect(getMetric("dashboard.serviceVolume")?.classification).toBe("operational");
    expect(getMetric("kpiStrip.liveAppointments")?.classification).toBe("operational");
    expect(getMetric("services.totalServices")?.classification).toBe("operational");
  });

  it("treats recorded grams + direct recorded cost as confirmed", () => {
    expect(getMetric("productUsage.totalUsage")?.classification).toBe("confirmed");
    expect(getMetric("productUsage.totalProductCost")?.classification).toBe("confirmed");
  });

  it("treats checkout / expenses / retail as unavailable with a blocked reason", () => {
    for (const id of ["dashboard.netProfit", "dashboard.operatingOverhead", "sales.retail", "expenses.operating"]) {
      const m = getMetric(id);
      expect(m?.classification).toBe("unavailable");
      expect(m?.blockedReason && m.blockedReason.length).toBeGreaterThan(0);
      expect(m?.dataOrigin).toBe("none");
    }
  });

  it("marks unsupported trend/rating surfaces as unavailable rather than a real value", () => {
    for (const id of [
      "dashboard.perVisitTrend",
      "staffPerformance.trend",
      "staffPerformance.avgRating",
      "services.trend",
      "productUsage.trend",
    ]) {
      expect(getMetric(id)?.classification).toBe("unavailable");
    }
  });
});

describe("guards", () => {
  it("guards rankings and staff comparisons with a positive minimum sample", () => {
    for (const m of METRIC_REGISTRY) {
      if (m.guard === "ranking" || m.guard === "staff_comparison") {
        expect(m.minimumSample).toBeGreaterThan(0);
      }
    }
  });

  it("classifies exactly the plan's unavailable set", () => {
    const unavailable = metricsByClassification("unavailable").map((m) => m.id).sort();
    expect(unavailable).toEqual(
      [
        "dashboard.netProfit",
        "dashboard.operatingOverhead",
        "dashboard.perVisitTrend",
        "expenses.operating",
        "productUsage.trend",
        "sales.retail",
        "services.trend",
        "staffPerformance.avgRating",
        "staffPerformance.trend",
      ].sort(),
    );
  });
});
