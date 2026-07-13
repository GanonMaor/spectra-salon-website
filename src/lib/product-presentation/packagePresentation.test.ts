import {
  inferProductPackageClass,
  PRODUCT_PACKAGE_SPECS,
  usesProminentRawCard,
} from "./packagePresentation";

describe("inferProductPackageClass", () => {
  it.each([
    ["tube", { canonicalName: "Majirel 7.13 Color Cream" }],
    ["jar", { canonicalName: "Redken All Soft Heavy Cream Mask" }],
    ["box", { canonicalName: "Wella Color Touch Kit" }],
    ["canister", { canonicalName: "Schwarzkopf BlondMe Premium Lightener Powder" }],
    ["pump", { canonicalName: "Kérastase Nutritive Shampoo" }],
    ["bottle", { canonicalName: "Moroccanoil Luminous Hairspray" }],
  ])("classifies generic %s packaging", (expected, input) => {
    expect(inferProductPackageClass(input)).toBe(expected);
  });

  it("honors persisted packaging metadata before name inference", () => {
    expect(inferProductPackageClass({
      canonicalName: "Professional Treatment",
      packagingType: "jar",
    })).toBe("jar");
  });

  it("uses a shared normalized canvas contract", () => {
    expect(PRODUCT_PACKAGE_SPECS.pump.targetBBox).toEqual({ width: 480, height: 640 });
    expect(usesProminentRawCard("canister")).toBe(true);
    expect(usesProminentRawCard("jar")).toBe(false);
  });
});
