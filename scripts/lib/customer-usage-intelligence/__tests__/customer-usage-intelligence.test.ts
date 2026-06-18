import fs from "fs";
import path from "path";

const XLSX = require("xlsx");
const { parseWithRegistry } = require("../parser-profiles");
const { buildInsightPacket, classifyProductRole, detectColorFamily } = require("../engine");

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

function buildTestPacket(buffer: Buffer) {
  const parsed = parseWithRegistry(buffer, {
    organizationId: "org-test",
    customerAccountId: "customer-test",
    salonId: "salon-test",
    uploadId: "upload-test",
  });
  return buildInsightPacket({
    analysisRunId: "run-test",
    uploadIds: ["upload-test"],
    organizationId: "org-test",
    customerAccountId: "customer-test",
    salonId: "salon-test",
    parserProfileId: parsed.parserProfileId,
    parsed,
    resolvedFacts: parsed.facts,
    productTruthVersion: "test",
  });
}

describe("customer usage intelligence", () => {
  it("routes service/formula workbooks through a generic parser profile and builds ten insight modules", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    expect(packet.insightItems.filter((item: any) => item.displayOrder <= 10)).toHaveLength(10);
    expect(packet.executiveFindings.length).toBeGreaterThan(0);
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
  });

  it("keeps salon-specific names out of core modules", () => {
    const coreFiles = ["contracts.js", "engine.js", "product-truth-resolution.js"].map((file) =>
      fs.readFileSync(path.join(process.cwd(), "scripts/lib/customer-usage-intelligence", file), "utf8"),
    ).join("\n");
    expect(coreFiles).not.toMatch(/Sharon\s+Mor/i);
  });

  // ── Semantic guardrail tests ─────────────────────────────────────────────

  it("excludes developers from top-shade rankings", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const topShades = packet.insightItems.find((i: any) => i.insightType === "top_shades_by_usage");
    const shadeLabels: string[] = (topShades.payload.topShades || []).map((s: any) => s.label.toLowerCase());
    expect(shadeLabels.some((l: string) => /developer|6%|vol|oxidant/.test(l))).toBe(false);
  });

  it("does not use service categories as color families", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const colorFamilies = packet.insightItems.find((i: any) => i.insightType === "most_used_color_families");
    const familyNames: string[] = (colorFamilies.payload.chartData || []).map((f: any) => f.name.toLowerCase());
    const forbidden = ["root_or_grey_coverage", "toner", "highlights", "color", "correction", "other"];
    for (const f of forbidden) {
      expect(familyNames).not.toContain(f);
    }
  });

  it("uses proper market color family categories", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const colorFamilies = packet.insightItems.find((i: any) => i.insightType === "most_used_color_families");
    const familyNames: string[] = (colorFamilies.payload.chartData || []).map((f: any) => f.name);
    const validFamilies = ["Blonde", "Brunette", "Copper", "Red", "Fashion", "Natural / Neutral", "Unresolved", "Dark"];
    for (const name of familyNames) {
      expect(validFamilies).toContain(name);
    }
  });

  it("routes developers to developer_behavior section", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const devBehavior = packet.insightItems.find((i: any) => i.insightType === "developer_behavior");
    expect(devBehavior.payload.chartData.length).toBeGreaterThan(0);
    const devLabels: string[] = devBehavior.payload.chartData.map((d: any) => d.name);
    expect(devLabels.some((l: string) => /\d+%/.test(l) || /vol/i.test(l))).toBe(true);
  });

  it("excludes developer product lines from product-line adoption", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const adoption = packet.insightItems.find((i: any) => i.insightType === "product_line_adoption");
    const lineLabels: string[] = (adoption.payload.topProductLines || []).map((l: any) => l.label.toLowerCase());
    expect(lineLabels.some((l: string) => /^developer|^oxidant/.test(l))).toBe(false);
  });

  it("provides business headlines not technical labels", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    for (const insight of packet.insightItems.filter((i: any) => i.displayOrder <= 10)) {
      expect(insight.businessHeadline).toBeDefined();
      expect(insight.businessHeadline.length).toBeGreaterThan(10);
      expect(insight.businessHeadline).not.toContain("formula_component");
      expect(insight.businessHeadline).not.toContain("numerator");
    }
  });

  it("generates executive findings in plain English", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    expect(packet.executiveFindings).toBeDefined();
    expect(packet.executiveFindings.length).toBeGreaterThan(0);
    for (const finding of packet.executiveFindings) {
      expect(finding).not.toContain("raw_fallback");
      expect(finding.length).toBeGreaterThan(20);
    }
  });

  it("provides percentages that sum correctly within color families", () => {
    const packet = buildTestPacket(serviceFormulaWorkbook());
    const colorFamilies = packet.insightItems.find((i: any) => i.insightType === "most_used_color_families");
    const shares: number[] = (colorFamilies.payload.chartData || []).map((f: any) => f.share);
    const total = shares.reduce((a: number, b: number) => a + b, 0);
    expect(total).toBeGreaterThan(95);
    expect(total).toBeLessThanOrEqual(101);
  });
});
