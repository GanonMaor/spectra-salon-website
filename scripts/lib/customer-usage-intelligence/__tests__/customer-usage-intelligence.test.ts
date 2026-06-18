import fs from "fs";
import path from "path";

const XLSX = require("xlsx");
const { parseWithRegistry } = require("../parser-profiles");
const { buildInsightPacket } = require("../engine");

function workbookBuffer(rows: unknown[][], sheetName = "Data") {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function serviceFormulaWorkbook() {
  return workbookBuffer([
    ["Date", "Time", "Client", "Service", "Brand", "Series", "Shade", "Grams", "Cost", "Rounded", "Reweigh", "Profile"],
    ["2026-01-05", "10:00", "Real Client Name", "Full head highlights", null, null, null, 70, 120, null, null, "Stylist A"],
    [null, null, null, null, "L'Oréal Professionnel", "Majirel", "8.3", 40, 60, null, null, null],
    [null, null, null, null, "Wella", "Blondor", "Lightener", 30, 40, null, null, null],
    ["2026-02-10", "11:00", "Real Client Name", "Toner for highlights", null, null, null, 45, 80, null, null, "Stylist A"],
    [null, null, null, null, "L'Oréal Professionnel", "Dia Light", "9.01", 30, 50, null, null, null],
    [null, null, null, null, "Generic", "Developer", "6%", 15, 20, null, null, null],
  ], "TONER");
}

function syntheticWorkbook() {
  return workbookBuffer([
    ["event date", "client key", "service", "brand", "shade", "grams"],
    ["2026-01-01", "client-a", "color", "Brand A", "7.0", 30],
    ["2026-01-01", "client-a", "color", "Brand B", "developer 6%", 30],
    ["2026-03-01", "client-a", "toner", "Brand A", "9.1", 20],
  ]);
}

describe("customer usage intelligence", () => {
  it("routes service/formula workbooks through a generic parser profile and builds ten insight modules", () => {
    const parsed = parseWithRegistry(serviceFormulaWorkbook(), {
      organizationId: "org-real",
      customerAccountId: "customer-real",
      salonId: "salon-real",
      uploadId: "upload-real",
    });

    const packet = buildInsightPacket({
      analysisRunId: "run-real",
      uploadIds: ["upload-real"],
      organizationId: "org-real",
      customerAccountId: "customer-real",
      salonId: "salon-real",
      parserProfileId: parsed.parserProfileId,
      parsed,
      resolvedFacts: parsed.facts,
      productTruthVersion: "test",
    });

    expect(parsed.parserProfileId).toBe("service_formula_workbook_v1");
    expect(packet.serviceCount).toBe(2);
    expect(packet.formulaCount).toBe(2);
    expect(packet.clientCount).toBe(1);
    expect(packet.insightItems.filter((item: any) => item.displayOrder <= 10)).toHaveLength(10);
    expect(packet.insightItems.find((item: any) => item.insightType === "brand_share_of_bowl")?.supportStatus).toBe("supported");
    expect(packet.insightItems.find((item: any) => item.insightType === "unsupported_inventory_purchase_metrics")?.supportStatus).toBe("not_supported");
  });

  it("pseudonymizes customer, salon, profile, and client identity in manufacturer-facing packets", () => {
    const parsed = parseWithRegistry(serviceFormulaWorkbook(), {
      organizationId: "org-secret",
      customerAccountId: "customer-secret-name",
      salonId: "salon-secret-name",
      uploadId: "upload-secret",
    });
    const packet = buildInsightPacket({
      analysisRunId: "run-secret",
      uploadIds: ["upload-secret"],
      organizationId: "org-secret",
      customerAccountId: "customer-secret-name",
      salonId: "salon-secret-name",
      parserProfileId: parsed.parserProfileId,
      parsed,
      resolvedFacts: parsed.facts,
    });
    const rendered = JSON.stringify(packet);

    expect(packet.pseudonymousCustomerLabel).toMatch(/^Customer Account \d{3}$/);
    expect(packet.pseudonymousSalonLabel).toMatch(/^Salon \d{3}$/);
    expect(rendered).not.toContain("Real Client Name");
    expect(rendered).not.toContain("customer-secret-name");
    expect(rendered).not.toContain("salon-secret-name");
    expect(rendered).toContain("Anonymous Client");
  });

  it("proves the engine is not tied to one salon workbook by accepting a second parser profile", () => {
    const parsed = parseWithRegistry(syntheticWorkbook(), {
      organizationId: "org-b",
      customerAccountId: "customer-b",
      salonId: "salon-b",
      uploadId: "upload-b",
    });
    const packet = buildInsightPacket({
      analysisRunId: "run-b",
      uploadIds: ["upload-b"],
      organizationId: "org-b",
      customerAccountId: "customer-b",
      salonId: "salon-b",
      parserProfileId: parsed.parserProfileId,
      parsed,
      resolvedFacts: parsed.facts,
    });

    expect(parsed.parserProfileId).toBe("synthetic_normalized_rows_v1");
    expect(packet.insightItems.filter((item: any) => item.displayOrder <= 10)).toHaveLength(10);
    expect(packet.supportStatuses.cross_brand_mixing).toBe("supported");
  });

  it("keeps salon-specific names out of core modules", () => {
    const coreFiles = ["contracts.js", "engine.js", "product-truth-resolution.js"].map((file) =>
      fs.readFileSync(path.join(process.cwd(), "scripts/lib/customer-usage-intelligence", file), "utf8"),
    ).join("\n");

    expect(coreFiles).not.toMatch(/Sharon\s+Mor/i);
  });
});
