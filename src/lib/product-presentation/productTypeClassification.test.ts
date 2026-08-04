import {
  classifyInventoryProduct,
  inventoryCategoryLabel,
  isRetailInventoryCategory,
  isShadeBearingProductType,
  normalizeProductType,
} from "./productTypeClassification";

describe("product type classification", () => {
  it.each([
    ["developer", "developer_oxidant"],
    ["developer_oxidant", "developer_oxidant"],
    ["bleach", "lightener_bleach"],
    ["color", "hair_color_shade"],
    ["permanent-color", "permanent_color"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeProductType(input)).toBe(expected);
  });

  it("uses the authoritative developer type before misleading shade-like data", () => {
    expect(classifyInventoryProduct({
      primaryProductType: "developer_oxidant",
      canonicalName: "1.5% 5.5 VOL.",
      productLineName: "INOA",
    })).toBe("developer");
    expect(isShadeBearingProductType("developer_oxidant")).toBe(false);
  });

  it("keeps canonical color types shade-bearing", () => {
    expect(isShadeBearingProductType("permanent_color")).toBe(true);
    expect(isShadeBearingProductType("acidic_toner")).toBe(true);
    expect(classifyInventoryProduct({
      primaryProductType: "permanent_color",
      canonicalName: "Majirel 7.13",
    })).toBe("color");
  });

  it("only falls back to names for missing or other types", () => {
    expect(classifyInventoryProduct({
      primaryProductType: "other",
      canonicalName: "Professional Oxidant 20 Vol",
    })).toBe("developer");
  });

  it("keeps care and bond products in the retail segment", () => {
    expect(isRetailInventoryCategory("care")).toBe(true);
    expect(isRetailInventoryCategory("bond")).toBe(true);
    expect(isRetailInventoryCategory("developer")).toBe(false);
    expect(inventoryCategoryLabel("developer", false)).toBe("Developers & activators");
  });
});
