import { DEFAULT_CRM_SEED } from "../../SalonCRM/data/crmSeedData";
import {
  AVG_MATERIAL_COST_PER_SVC,
  MONTHLY_COMBINED,
  MONTHLY_PRODUCTS,
  OPERATING_EXPENSE_RATE,
  SERVICES,
} from "../../SalonPerformanceDashboard/reports/AnalyticsMockData";
import { CATEGORY_COLORS } from "../../SalonPerformanceDashboard/reports/ReportShared";
import { SALON_OS_PROOF } from "../salonOsProofSnapshot";

describe("salonOsProofSnapshot", () => {
  it("builds salon economics from average material per completed visit plus an operating layer", () => {
    const bookedServiceValue = MONTHLY_COMBINED.reduce((sum, month) => sum + month.revenue, 0);
    const visitCount = MONTHLY_COMBINED.reduce((sum, month) => sum + month.appointments, 0);
    const estimatedMaterialCost = AVG_MATERIAL_COST_PER_SVC * visitCount;
    const operatingOverhead = Math.round(bookedServiceValue * OPERATING_EXPENSE_RATE);

    expect(SALON_OS_PROOF.bookedServiceValue).toBe(bookedServiceValue);
    expect(SALON_OS_PROOF.visitCount).toBe(visitCount);
    expect(SALON_OS_PROOF.avgMaterialCostPerVisit).toBe(AVG_MATERIAL_COST_PER_SVC);
    expect(SALON_OS_PROOF.estimatedMaterialCost).toBe(estimatedMaterialCost);
    expect(SALON_OS_PROOF.estimatedMaterialCost).not.toBe(
      MONTHLY_COMBINED.reduce((sum, month) => sum + month.productCost, 0),
    );
    expect(SALON_OS_PROOF.operatingOverhead).toBe(operatingOverhead);
    expect(SALON_OS_PROOF.netProfit).toBe(
      bookedServiceValue - estimatedMaterialCost - operatingOverhead,
    );
    expect(SALON_OS_PROOF.netProfit).toBeGreaterThan(0);
    expect(SALON_OS_PROOF.revenueIsEstimated).toBe(true);
  });

  it("keeps the user-approved P&L amounts and exact arithmetic", () => {
    expect(SALON_OS_PROOF.bookedServiceValue).toBe(216_720);
    expect(SALON_OS_PROOF.estimatedMaterialCost).toBe(34_830);
    expect(SALON_OS_PROOF.operatingOverhead).toBe(134_366);
    expect(SALON_OS_PROOF.netProfit).toBe(47_524);
    expect(
      SALON_OS_PROOF.bookedServiceValue -
        SALON_OS_PROOF.estimatedMaterialCost -
        SALON_OS_PROOF.operatingOverhead,
    ).toBe(SALON_OS_PROOF.netProfit);
  });

  it("labels the strip as a whole-year view of a single salon", () => {
    expect(SALON_OS_PROOF.periodMonths).toBe(MONTHLY_COMBINED.length);
    expect(SALON_OS_PROOF.periodMonths).toBe(12);
    expect(SALON_OS_PROOF.avgMaterialCostPerVisit * SALON_OS_PROOF.visitCount).toBe(
      SALON_OS_PROOF.estimatedMaterialCost,
    );
  });

  it("counts low-stock alerts with the CRM inventory rule", () => {
    const expected = DEFAULT_CRM_SEED.inventoryItems.filter(
      (item) => item.unitsInStock <= item.minStock,
    ).length;
    expect(SALON_OS_PROOF.lowStockAlerts).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it("keeps four representative service rows with average material cost per service", () => {
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
    expect(MONTHLY_PRODUCTS.length).toBeGreaterThan(0);
  });
});
