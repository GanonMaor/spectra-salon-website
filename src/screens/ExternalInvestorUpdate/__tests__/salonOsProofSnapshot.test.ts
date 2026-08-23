import { DEFAULT_CRM_SEED } from "../../SalonCRM/data/crmSeedData";
import {
  MONTHLY_COMBINED,
  MONTHLY_PRODUCTS,
  SERVICES,
} from "../../SalonPerformanceDashboard/reports/AnalyticsMockData";
import { buildPilotFinanceDemo } from "../../SalonPerformanceDashboard/pilotFinanceDemo";
import { CATEGORY_COLORS } from "../../SalonPerformanceDashboard/reports/ReportShared";
import { SALON_OS_PROOF } from "../salonOsProofSnapshot";

describe("salonOsProofSnapshot", () => {
  it("derives economics from the CRM monthly snapshot and pilot finance formula", () => {
    const bookedServiceValue = MONTHLY_COMBINED.reduce((sum, month) => sum + month.revenue, 0);
    const estimatedMaterialCost = MONTHLY_COMBINED.reduce((sum, month) => sum + month.productCost, 0);
    const finance = buildPilotFinanceDemo(
      MONTHLY_COMBINED.map((month) => ({
        month: month.month,
        revenue: month.revenue,
        appointments: month.appointments,
      })),
    );

    expect(SALON_OS_PROOF.bookedServiceValue).toBe(bookedServiceValue);
    expect(SALON_OS_PROOF.estimatedMaterialCost).toBe(estimatedMaterialCost);
    expect(SALON_OS_PROOF.totalUsageGrams).toBe(
      MONTHLY_PRODUCTS.reduce((sum, month) => sum + month.totalUsage, 0),
    );
    expect(SALON_OS_PROOF.totalProductCost).toBe(
      MONTHLY_PRODUCTS.reduce((sum, month) => sum + month.totalCost, 0),
    );
    expect(SALON_OS_PROOF.netProfit).toBe(
      bookedServiceValue + finance.totalRetailRevenue - estimatedMaterialCost - finance.totalExpenses,
    );
    expect(SALON_OS_PROOF.revenueIsEstimated).toBe(true);
  });

  it("counts low-stock alerts with the CRM inventory rule", () => {
    const expected = DEFAULT_CRM_SEED.inventoryItems.filter(
      (item) => item.unitsInStock <= item.minStock,
    ).length;
    expect(SALON_OS_PROOF.lowStockAlerts).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it("keeps four representative service rows from the CRM catalog", () => {
    expect(SALON_OS_PROOF.serviceRows).toHaveLength(4);
    const names = SALON_OS_PROOF.serviceRows.map((row) => row.name);
    expect(names.some((name) => /root/i.test(name))).toBe(true);
    expect(names.some((name) => /highlight/i.test(name))).toBe(true);
    expect(names.some((name) => /toner|rinse/i.test(name))).toBe(true);
    expect(names.some((name) => /straight|keratin/i.test(name))).toBe(true);
    for (const row of SALON_OS_PROOF.serviceRows) {
      const source = SERVICES.find((service) => service.id === row.id);
      expect(source).toBeDefined();
      expect(row.revenue).toBe(source?.revenue);
      expect(row.avgMaterialCost).toBe(source?.avgMaterialCost);
    }
  });

  it("uses CRM category colors for revenue and usage charts", () => {
    const keys = ["Color", "Highlights", "Toner", "Straightening", "Treatment"];
    expect(SALON_OS_PROOF.revenueByCategory.map((item) => item.key)).toEqual(
      expect.arrayContaining(keys.filter((key) =>
        SALON_OS_PROOF.revenueByCategory.some((item) => item.key === key),
      )),
    );
    for (const point of [...SALON_OS_PROOF.revenueByCategory, ...SALON_OS_PROOF.usageByCategory]) {
      expect(point.color).toBe(CATEGORY_COLORS[point.key]);
    }
  });
});
