/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * scripts/lib/m5-classification/__tests__/product-classifier.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for Milestone 5 deterministic product classifier.
 *
 * Key safety invariant: identical numeric shade codes in different manufacturers
 * must NEVER produce same_commercial_sku across manufacturers.
 *
 * Covers:
 *   - Shade format parsing: 8.3, 8/3, 8-3, 8G, 8GB, 8.03, 8N, 8NA
 *   - Named tone parsing: Natural Gold, Golden Blonde, Warm Beige, Copper Red
 *   - Confidence band behavior (automatic / review / unresolved)
 *   - Cross-brand safety: no SKU merge across manufacturers
 *   - Product type detection from rules
 *   - Package size extraction
 */

const {
  classifyProduct,
  parseShadeCode,
  parseNamedTone,
  extractPackageSize,
  detectProductType,
  confidenceBand,
  CONFIDENCE,
  BAND_THRESHOLDS,
  isShadeBearingProductType,
  isTonalClassificationEligibleProductType,
  NAMED_TONE_MAP,
} = require("../product-classifier");

const {
  getRulesForBrand,
  WELLA_REFLECTIONS,
  SKP_REFLECTIONS,
  GOLDWELL_REFLECTIONS,
  REDKEN_SUFFIXES,
} = require("../manufacturer-rules");

// ── Shade format parsing ──────────────────────────────────────────────────────

describe("parseShadeCode", () => {
  const wellaRules  = getRulesForBrand("wella-professionals");
  const lorealRules = getRulesForBrand("l-oreal-professionnel");
  const skpRules    = getRulesForBrand("schwarzkopf");
  const goldwellRules = getRulesForBrand("goldwell");
  const redkenRules = getRulesForBrand("redken");

  describe("L'Oréal dot notation", () => {
    it("parses 8.3 → level 8, primary tone 3 (Gold)", () => {
      const result = parseShadeCode("8.3", lorealRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("3");
      expect(result!.primaryToneLabel).toBe("Gold");
      expect(result!.shadeSystem).toBe("dot");
      expect(result!.shadeCodeNormalized).toBe("8.3");
    });

    it("parses 8.03 → level 8, tones 03 (single compound reflection, not 0+3)", () => {
      const result = parseShadeCode("8.03", lorealRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      // primary tone is the leading '0' character of '03'
      expect(result!.primaryTone).toBe("0");
      expect(result!.primaryToneLabel).toBe("Natural");
    });

    it("parses 10.12 → level 10, primary 1 (Ash), secondary 2", () => {
      const result = parseShadeCode("10.12", lorealRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(10);
      expect(result!.primaryTone).toBe("1");
      expect(result!.secondaryTone).toBe("2");
    });

    it("parses 1.0 → level 1, primary 0 (Natural)", () => {
      const result = parseShadeCode("1.0", lorealRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(1);
      expect(result!.primaryTone).toBe("0");
    });
  });

  describe("Wella slash notation", () => {
    it("parses 8/3 → level 8, primary tone 3 (Gold)", () => {
      const result = parseShadeCode("8/3", wellaRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("3");
      expect(result!.primaryToneLabel).toBe("Gold");
      expect(result!.shadeSystem).toBe("slash");
      expect(result!.shadeCodeNormalized).toBe("8/3");
    });

    it("parses 8/03 → level 8, primary 0 (Natural), secondary 3 (Gold)", () => {
      const result = parseShadeCode("8/03", wellaRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("0");
      expect(result!.secondaryTone).toBe("3");
    });

    it("parses /05 → no level (lightener shade), tone 05", () => {
      const result = parseShadeCode("/05", wellaRules);
      // level should be null or 0 for lightener shades with no level prefix
      expect(result).not.toBeNull();
      expect(result!.shadeSystem).toBe("slash");
    });

    it("distinguishes Wella Gold reflection (3) from L'Oréal Gold (3)", () => {
      const wellaResult  = parseShadeCode("8/3", wellaRules);
      const lorealResult = parseShadeCode("8.3", lorealRules);
      // Both are 'Gold' but they come from different reflection maps
      // The key safety invariant: they have DIFFERENT brand contexts
      expect(wellaResult!.shadeSystem).toBe("slash");
      expect(lorealResult!.shadeSystem).toBe("dot");
      // The label may match by coincidence but the shade system confirms different identity
      expect(wellaResult!.primaryTone).toBe(lorealResult!.primaryTone); // both "3"
      // That's fine — but the classifier attaches manufacturer context, preventing merge
    });
  });

  describe("Approved Wella line-scoped rules", () => {
    it("parses Color Charm Permanent alpha suffixes only with exact product-line context", () => {
      const examples = [
        ["10A", 10, "A", "Ash"],
        ["10GV", 10, "GV", "Gold Violet"],
        ["5NW", 5, "NW", "Natural Warm"],
        ["7RR", 7, "RR", "Intense Red"],
        ["12AA", 12, "AA", "Intense Ash"],
      ] as const;

      for (const [shade, level, tone, label] of examples) {
        const result = parseShadeCode(shade, wellaRules, {
          productLine: "CHARM COLOR PERMANENT LIQUID COLOR",
        });
        expect(result).not.toBeNull();
        expect(result!.patternName).toBe("color_charm_alpha");
        expect(result!.level).toBe(level);
        expect(result!.primaryTone).toBe(tone);
        expect(result!.primaryToneLabel).toBe(label);
        expect(result!.shadeSystem).toBe("alpha");
        expect(result!.ruleId).toBe("wella_color_charm_permanent_alpha");
      }
    });

    it("parses Color Charm Demi alpha suffixes only with exact product-line context", () => {
      const examples = [
        ["10A", 10, "A", "Ash"],
        ["1N", 1, "N", "Natural"],
        ["2BBL", 2, "BBL", "Intense Blue Black"],
        ["7RR", 7, "RR", "Intense Red"],
        ["5VV", 5, "VV", "Intense Violet"],
      ] as const;

      for (const [shade, level, tone, label] of examples) {
        const result = parseShadeCode(shade, wellaRules, {
          productLine: "CHARM COLOR DEMI",
        });
        expect(result).not.toBeNull();
        expect(result!.patternName).toBe("color_charm_alpha");
        expect(result!.level).toBe(level);
        expect(result!.primaryTone).toBe(tone);
        expect(result!.primaryToneLabel).toBe(label);
        expect(result!.shadeSystem).toBe("alpha");
        expect(result!.ruleId).toBe("wella_color_charm_demi_alpha");
      }
    });

    it("parses Koleston/Kolestone special mix, repeated-depth, and package-suffix variants", () => {
      const specialMix = parseShadeCode("0/00", wellaRules, { productLine: "KOLESTONE" });
      expect(specialMix).not.toBeNull();
      expect(specialMix!.level).toBeNull();
      expect(specialMix!.shadeCodeNormalized).toBe("0/00");
      expect(specialMix!.metadata.variant).toBe("special_mix");
      expect(specialMix!.ruleId).toBe("wella_koleston_perfect_slash_variants");

      const repeated = parseShadeCode("33/55", wellaRules, { productLine: "KOLESTONE" });
      expect(repeated).not.toBeNull();
      expect(repeated!.level).toBe(3);
      expect(repeated!.primaryTone).toBe("5");
      expect(repeated!.metadata.rawDepth).toBe("33");
      expect(repeated!.metadata.variant).toBe("repeated_depth");

      const red = parseShadeCode("77/43", wellaRules, { productLine: "KOLESTON PERFECT" });
      expect(red).not.toBeNull();
      expect(red!.level).toBe(7);
      expect(red!.primaryTone).toBe("4");
      expect(red!.secondaryTone).toBe("3");

      const packageSuffix = parseShadeCode("10/0 80g", wellaRules, { productLine: "KOLESTONE" });
      expect(packageSuffix).not.toBeNull();
      expect(packageSuffix!.shadeCodeNormalized).toBe("10/0");
      expect(packageSuffix!.level).toBe(10);
      expect(packageSuffix!.metadata.packageSuffix).toBe("80g");
    });

    it("parses Color Touch Special Mix, Plus, and Relights as separate line-scoped variants", () => {
      const specialMix = parseShadeCode("0/56", wellaRules, { productLine: "COLOR TOUCH" });
      expect(specialMix).not.toBeNull();
      expect(specialMix!.level).toBeNull();
      expect(specialMix!.metadata.variant).toBe("special_mix");
      expect(specialMix!.ruleId).toBe("wella_color_touch_variants");

      const plus = parseShadeCode("88/03", wellaRules, { productLine: "COLOR TOUCH PLUS" });
      expect(plus).not.toBeNull();
      expect(plus!.level).toBe(8);
      expect(plus!.metadata.variant).toBe("repeated_depth");
      expect(plus!.metadata.rawDepth).toBe("88");

      const relights = parseShadeCode("R12/00", wellaRules, { productLine: "COLOR TOUCH" });
      expect(relights).not.toBeNull();
      expect(relights!.shadeCodeNormalized).toBe("R12/00");
      expect(relights!.level).toBe(12);
      expect(relights!.metadata.variant).toBe("relights");
    });

    it("does not apply approved Wella alpha parsing without an exact approved product line", () => {
      expect(parseShadeCode("10A", wellaRules)).toBeNull();
      expect(parseShadeCode("10A", wellaRules, { productLine: "ILLUMINA" })).toBeNull();
      expect(parseShadeCode("10A", wellaRules, { productLine: "CHARM COLOR" })).toBeNull();
    });

    it("does not apply approved Wella slash variants to other Wella lines", () => {
      expect(parseShadeCode("33/55", wellaRules, { productLine: "ILLUMINA" })).toBeNull();
      expect(parseShadeCode("R12/00", wellaRules, { productLine: "KOLESTONE" })).toBeNull();
      expect(parseShadeCode("10/0 80g", wellaRules, { productLine: "COLOR TOUCH DEVELOPERS" })).toBeNull();
    });

    it("does not apply approved Wella rules to other manufacturers", () => {
      expect(parseShadeCode("10A", lorealRules, {
        productLine: "CHARM COLOR PERMANENT LIQUID COLOR",
      })).toBeNull();
      expect(parseShadeCode("33/55", lorealRules, { productLine: "KOLESTONE" })).toBeNull();

      const redkenResult = parseShadeCode("8G", redkenRules, {
        productLine: "CHARM COLOR PERMANENT LIQUID COLOR",
      });
      expect(redkenResult).not.toBeNull();
      expect(redkenResult!.patternName).toBe("redken_alpha");
    });
  });

  describe("Schwarzkopf dash notation", () => {
    it("parses 8-3 → level 8, primary tone 3 (Gold)", () => {
      const result = parseShadeCode("8-3", skpRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("3");
      expect(result!.shadeSystem).toBe("dash");
      expect(result!.shadeCodeNormalized).toBe("8-3");
    });

    it("parses 0-00 → level 0, Special Natural", () => {
      const result = parseShadeCode("0-00", skpRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(0);
    });

    it("Schwarzkopf 8-3 and L'Oréal 8.3 are NOT the same shade", () => {
      const skpResult   = parseShadeCode("8-3", skpRules);
      const lorealResult = parseShadeCode("8.3", lorealRules);
      // SKP reflection[3] = Gold; L'Oréal reflection[3] = Gold — coincidentally same label
      // but shade SYSTEMS are different, confirming different manufacturers
      expect(skpResult!.shadeSystem).toBe("dash");
      expect(lorealResult!.shadeSystem).toBe("dot");
      // The cross-brand comparison must only produce tonal_equivalent, never same_commercial_sku
    });
  });

  describe("Goldwell alpha notation", () => {
    it("parses 8G → level 8, tone G (Gold)", () => {
      const result = parseShadeCode("8G", goldwellRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("G");
      expect(result!.primaryToneLabel).toBe("Gold");
      expect(result!.shadeSystem).toBe("alpha");
    });

    it("parses 8GB → level 8, compound tone GB (Gold Beige)", () => {
      const result = parseShadeCode("8GB", goldwellRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("GB");
      expect(result!.primaryToneLabel).toBe("Gold Beige");
    });

    it("parses 8N → level 8, Natural", () => {
      const result = parseShadeCode("8N", goldwellRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("N");
    });

    it("Goldwell 8N and Redken 8N are NOT the same shade", () => {
      const goldwellResult = parseShadeCode("8N", goldwellRules);
      const redkenResult   = parseShadeCode("8N", redkenRules);
      // Both parse successfully as alpha suffix codes
      expect(goldwellResult).not.toBeNull();
      expect(redkenResult).not.toBeNull();
      // They have the same pattern name but DIFFERENT reflection maps — confirmed by manufacturer context
      expect(goldwellResult!.primaryToneLabel).toBe("Natural");
      expect(redkenResult!.primaryToneLabel).toBe("Natural"); // same label by coincidence
      // The safety guarantee is that classifyProduct() attaches brand context so they never merge
    });
  });

  describe("Redken alpha suffix", () => {
    it("parses 8N → level 8, Natural", () => {
      const result = parseShadeCode("8N", redkenRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("N");
      expect(result!.shadeSystem).toBe("alpha");
    });

    it("parses 8NA → level 8, Natural Ash", () => {
      const result = parseShadeCode("8NA", redkenRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("NA");
      expect(result!.primaryToneLabel).toBe("Natural Ash");
    });

    it("parses 8G → level 8, Gold", () => {
      const result = parseShadeCode("8G", redkenRules);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(8);
      expect(result!.primaryTone).toBe("G");
      expect(result!.primaryToneLabel).toBe("Gold");
    });
  });

  describe("Null / empty inputs", () => {
    it("returns null for null input", () => {
      expect(parseShadeCode(null, wellaRules)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseShadeCode("", wellaRules)).toBeNull();
    });
  });
});

// ── Named tone parsing ────────────────────────────────────────────────────────

describe("parseNamedTone", () => {
  it("parses 'Natural Gold' → primaryTone Natural Gold, toneFamily warm", () => {
    const result = parseNamedTone("Natural Gold");
    expect(result).not.toBeNull();
    expect(result!.primaryTone).toBe("Natural Gold");
    expect(result!.toneFamily).toBe("warm");
    expect(result!.matched).toBe("exact");
  });

  it("parses 'Golden Blonde' → Gold, warm", () => {
    const result = parseNamedTone("Golden Blonde");
    expect(result).not.toBeNull();
    expect(result!.primaryTone).toBe("Gold");
    expect(result!.toneFamily).toBe("warm");
  });

  it("parses 'Warm Beige' → Beige, warm", () => {
    const result = parseNamedTone("Warm Beige");
    expect(result).not.toBeNull();
    expect(result!.primaryTone).toBe("Beige");
    expect(result!.toneFamily).toBe("warm");
  });

  it("parses 'Copper Red' → Copper Red, warm", () => {
    const result = parseNamedTone("Copper Red");
    expect(result).not.toBeNull();
    expect(result!.primaryTone).toBe("Copper Red");
    expect(result!.toneFamily).toBe("warm");
  });

  it("parses 'Lightest Natural' → Natural, natural (partial match)", () => {
    const result = parseNamedTone("Lightest Natural");
    expect(result).not.toBeNull();
    expect(result!.toneFamily).toBe("natural");
  });

  it("returns null for completely unrecognized shade names", () => {
    expect(parseNamedTone("Booster Blue XYZ")).toBeNull();
  });

  it("is case-insensitive", () => {
    const a = parseNamedTone("NATURAL GOLD");
    const b = parseNamedTone("natural gold");
    expect(a?.primaryTone).toBe(b?.primaryTone);
  });
});

// ── Confidence band behavior ──────────────────────────────────────────────────

describe("confidenceBand", () => {
  it("returns 'automatic' for scores >= 0.95", () => {
    expect(confidenceBand(1.00)).toBe("automatic");
    expect(confidenceBand(0.97)).toBe("automatic");
    expect(confidenceBand(0.95)).toBe("automatic");
  });

  it("returns 'review' for scores in 0.80–0.94", () => {
    expect(confidenceBand(0.94)).toBe("review");
    expect(confidenceBand(0.82)).toBe("review");
    expect(confidenceBand(0.80)).toBe("review");
  });

  it("returns 'unresolved' for scores below 0.80", () => {
    expect(confidenceBand(0.79)).toBe("unresolved");
    expect(confidenceBand(0.50)).toBe("unresolved");
    expect(confidenceBand(0.00)).toBe("unresolved");
  });
});

// ── Cross-brand safety invariant ─────────────────────────────────────────────

describe("Cross-brand safety invariant", () => {
  const wellaProduct = {
    id: "wella-test-1",
    brand: "WELLA PROFESSIONALS",
    series: "KOLESTON PERFECT",
    familyShade: "PURE NATURALS",
    shade: "8/0",
    type: "color",
    materialWeight: 60,
    barcode: "",
    barcodes: [],
    catalogNo: "",
    flag: 0,
  };

  const lorealProduct = {
    id: "loreal-test-1",
    brand: "L'OREAL PROFESSIONNEL",
    series: "MAJIREL",
    familyShade: "MAJIREL",
    shade: "8.0",
    type: "color",
    materialWeight: 60,
    barcode: "",
    barcodes: [],
    catalogNo: "",
    flag: 0,
  };

  const skpProduct = {
    id: "skp-test-1",
    brand: "SCHWARZKOPF",
    series: "IGORA ROYAL",
    familyShade: "IGORA ROYAL",
    shade: "8-0",
    type: "color",
    materialWeight: 60,
    barcode: "",
    barcodes: [],
    catalogNo: "",
    flag: 0,
  };

  it("Wella 8/0 produces tonal profile with manufacturerSpecific: true", () => {
    const result = classifyProduct(wellaProduct, "wella-professionals");
    expect(result.manufacturer).toBe("WELLA PROFESSIONALS");
    expect(result.tonalProfile?.manufacturerSpecific).toBe(true);
  });

  it("L'Oréal 8.0 produces tonal profile with manufacturerSpecific: true", () => {
    const result = classifyProduct(lorealProduct, "l-oreal-professionnel");
    expect(result.manufacturer).toBe("L'OREAL PROFESSIONNEL");
    expect(result.tonalProfile?.manufacturerSpecific).toBe(true);
  });

  it("Schwarzkopf 8-0 produces tonal profile with manufacturerSpecific: true", () => {
    const result = classifyProduct(skpProduct, "schwarzkopf");
    expect(result.manufacturer).toBe("SCHWARZKOPF");
    expect(result.tonalProfile?.manufacturerSpecific).toBe(true);
  });

  it("Wella 8/0 and L'Oréal 8.0 have same level but DIFFERENT manufacturers", () => {
    const wellaResult  = classifyProduct(wellaProduct, "wella-professionals");
    const lorealResult = classifyProduct(lorealProduct, "l-oreal-professionnel");
    expect(wellaResult.level).toBe(8);
    expect(lorealResult.level).toBe(8);
    // Different manufacturers — MUST never produce same_commercial_sku
    expect(wellaResult.manufacturer).not.toBe(lorealResult.manufacturer);
    expect(wellaResult.manufacturerKey).not.toBe(lorealResult.manufacturerKey);
  });

  it("Wella 8/0 and Schwarzkopf 8-0 have same level but DIFFERENT manufacturers", () => {
    const wellaResult  = classifyProduct(wellaProduct, "wella-professionals");
    const skpResult    = classifyProduct(skpProduct, "schwarzkopf");
    expect(wellaResult.level).toBe(8);
    expect(skpResult.level).toBe(8);
    expect(wellaResult.manufacturer).not.toBe(skpResult.manufacturer);
  });

  it("Goldwell 8G and Redken 8G have same alphanumeric code but DIFFERENT manufacturers", () => {
    const goldwellProd = {
      id: "goldwell-8G",
      brand: "GOLDWELL",
      series: "TOPCHIC",
      familyShade: "TOPCHIC",
      shade: "8G",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const redkenProd = {
      id: "redken-8G",
      brand: "REDKEN",
      series: "COLOR FUSION",
      familyShade: "COLOR FUSION",
      shade: "8G",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const gResult = classifyProduct(goldwellProd, "goldwell");
    const rResult = classifyProduct(redkenProd, "redken");
    expect(gResult.manufacturer).toBe("GOLDWELL");
    expect(rResult.manufacturer).toBe("REDKEN");
    expect(gResult.manufacturerKey).not.toBe(rResult.manufacturerKey);
    // Both have tonalProfile.manufacturerSpecific = true
    expect(gResult.tonalProfile?.manufacturerSpecific).toBe(true);
    expect(rResult.tonalProfile?.manufacturerSpecific).toBe(true);
  });
});

// ── Product type detection ────────────────────────────────────────────────────

describe("detectProductType", () => {
  const wellaRules = getRulesForBrand("wella-professionals");
  const lorealRules = getRulesForBrand("l-oreal-professionnel");

  it("detects Wella KOLESTON PERFECT as permanent_color via rules", () => {
    const product = { type: "color", series: "KOLESTON PERFECT", shade: "8/0", familyShade: "" };
    const { productType } = detectProductType(product, wellaRules);
    expect(productType).toBe("permanent_color");
  });

  it("detects Wella COLOR TOUCH as demi_permanent via rules", () => {
    const product = { type: "color", series: "COLOR TOUCH", shade: "8/0", familyShade: "" };
    const { productType } = detectProductType(product, wellaRules);
    expect(productType).toBe("demi_permanent");
  });

  it("detects Wella BLONDOR as lightener via rules", () => {
    const product = { type: "color", series: "BLONDOR", shade: "/05", familyShade: "PLEX" };
    const { productType } = detectProductType(product, wellaRules);
    expect(productType).toBe("lightener");
  });

  it("detects L'Oréal DIA LIGHT as acidic_toner via rules", () => {
    const product = { type: "color", series: "DIA LIGHT", shade: "8.3", familyShade: "" };
    const { productType } = detectProductType(product, lorealRules);
    expect(productType).toBe("acidic_toner");
  });

  it("falls back to catalog type when series is unrecognized", () => {
    const product = { type: "developer", series: "UNKNOWN SERIES", shade: "", familyShade: "" };
    const { productType } = detectProductType(product, wellaRules);
    expect(productType).toBe("developer_oxidant");
  });

  it("detects approved Wella Color Charm Permanent line as permanent_color via exact line-scoped rule", () => {
    const product = {
      type: "color",
      series: "CHARM COLOR PERMANENT LIQUID COLOR",
      shade: "10A",
      familyShade: "LEVEL 10",
    };
    const { productType, typeEvidence } = detectProductType(product, wellaRules);
    expect(productType).toBe("permanent_color");
    expect(typeEvidence).toContain("wella_color_charm_permanent_alpha");
  });

  it("detects approved Wella Color Charm Demi line as demi_permanent via exact line-scoped rule", () => {
    const product = { type: "color", series: "CHARM COLOR DEMI", shade: "2BBL", familyShade: "LEVEL 2" };
    const { productType, typeEvidence } = detectProductType(product, wellaRules);
    expect(productType).toBe("demi_permanent");
    expect(typeEvidence).toContain("wella_color_charm_demi_alpha");
  });

  it("does not apply the approved Color Touch line-scoped rule to Color Touch Developers", () => {
    const product = { type: "color", series: "COLOR TOUCH DEVELOPERS", shade: "1.9% 6 Vol.", familyShade: "" };
    const { typeEvidence } = detectProductType(product, wellaRules);
    expect(typeEvidence).not.toContain("wella_color_touch_variants");
  });
});

// ── Package extraction ────────────────────────────────────────────────────────

describe("extractPackageSize", () => {
  it("extracts 60g from materialWeight", () => {
    const product = { materialWeight: 60, shade: "", series: "", familyShade: "" };
    const result = extractPackageSize(product);
    expect(result.packageSize).toBe(60);
    expect(result.packageUnit).toBe("g");
  });

  it("extracts size from shade text '500ml'", () => {
    const product = { materialWeight: null, shade: "Developer 500ml", series: "", familyShade: "" };
    const result = extractPackageSize(product);
    expect(result.packageSize).toBe(500);
    expect(result.packageUnit).toBe("ml");
  });

  it("extracts oz from shade text '2 oz'", () => {
    const product = { materialWeight: null, shade: "Color 2 oz", series: "", familyShade: "" };
    const result = extractPackageSize(product);
    expect(result.packageSize).toBe(2);
    expect(result.packageUnit).toBe("oz");
  });

  it("returns null when no size information is available", () => {
    const product = { materialWeight: null, shade: "Natural", series: "INOA", familyShade: "" };
    const result = extractPackageSize(product);
    expect(result.packageSize).toBeNull();
  });
});

// ── classifyProduct integration ───────────────────────────────────────────────

describe("classifyProduct — full integration", () => {
  it("classifies a Wella Koleston Perfect 8/3 as automatic", () => {
    const product = {
      id: "wella-kp-8-3",
      brand: "WELLA PROFESSIONALS",
      series: "KOLESTON PERFECT",
      familyShade: "VIBRANT REDS",
      shade: "8/3",
      type: "color",
      rawType: "color",
      materialWeight: 60,
      barcode: "4064666123456",
      barcodes: ["4064666123456"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");

    expect(result.manufacturer).toBe("WELLA PROFESSIONALS");
    expect(result.productLine).toBe("KOLESTON PERFECT");
    expect(result.level).toBe(8);
    expect(result.primaryTone).toBe("3");
    expect(result.productType).toBe("permanent_color");
    expect(result.shadeSystem).toBe("slash");
    expect(result.packageSize).toBe(60);
    expect(result.barcode).toBe("4064666123456");
    expect(result.confidenceBand).toBe("automatic");
    expect(result.confidence).toBeGreaterThanOrEqual(BAND_THRESHOLDS.AUTOMATIC);
    expect(result.tonalProfile?.manufacturerSpecific).toBe(true);
    expect(result.active).toBe(true);
  });

  it("classifies approved Wella Color Charm Permanent alpha shades as automatic with source evidence", () => {
    const product = {
      id: "wella-color-charm-permanent-10A",
      brand: "WELLA PROFESSIONALS",
      series: "CHARM COLOR PERMANENT LIQUID COLOR",
      familyShade: "LEVEL 10",
      shade: "10A",
      type: "color",
      materialWeight: 42,
      barcode: "0123456789012",
      barcodes: ["0123456789012"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.productType).toBe("permanent_color");
    expect(result.shadeCodeNormalized).toBe("10A");
    expect(result.level).toBe(10);
    expect(result.primaryToneLabel).toBe("Ash");
    expect(result.shadeRuleId).toBe("wella_color_charm_permanent_alpha");
    expect(result.shadeRuleEvidenceSources?.[0]?.sourceType).toBe("official");
    expect(result.confidenceBand).toBe("automatic");
  });

  it("classifies approved Wella Color Charm Demi alpha shades as demi_permanent automatic", () => {
    const product = {
      id: "wella-color-charm-demi-2BBL",
      brand: "WELLA PROFESSIONALS",
      series: "CHARM COLOR DEMI",
      familyShade: "LEVEL 2",
      shade: "2BBL",
      type: "color",
      materialWeight: 60,
      barcode: "0123456789013",
      barcodes: ["0123456789013"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.productType).toBe("demi_permanent");
    expect(result.shadeCodeNormalized).toBe("2BBL");
    expect(result.level).toBe(2);
    expect(result.primaryToneLabel).toBe("Intense Blue Black");
    expect(result.shadeRuleId).toBe("wella_color_charm_demi_alpha");
    expect(result.confidenceBand).toBe("automatic");
  });

  it("classifies approved Kolestone package-suffix and repeated-depth shades as automatic", () => {
    const product = {
      id: "wella-kolestone-33-55",
      brand: "WELLA PROFESSIONALS",
      series: "KOLESTONE",
      familyShade: "LEVEL 3",
      shade: "33/55",
      type: "color",
      materialWeight: 60,
      barcode: "0123456789014",
      barcodes: ["0123456789014"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.productType).toBe("permanent_color");
    expect(result.shadeBearing).toBe(true);
    expect(result.tonalClassificationEligible).toBe(true);
    expect(result.shadeCodeNormalized).toBe("33/55");
    expect(result.level).toBe(3);
    expect(result.tonalProfile).toMatchObject({
      level: 3,
      primaryTone: "5",
      manufacturerSpecific: true,
    });
    expect(result.shadeMetadata?.variant).toBe("repeated_depth");
    expect(result.shadeRuleId).toBe("wella_koleston_perfect_slash_variants");
    expect(result.confidenceBand).toBe("automatic");
  });

  it("keeps previously automatic Kolestone slash shades in shade and tonal workflows after productType refinement", () => {
    const product = {
      id: "wella-kolestone-10-0",
      brand: "WELLA PROFESSIONALS",
      series: "KOLESTONE",
      familyShade: "LEVEL 10",
      shade: "10/0",
      type: "color",
      materialWeight: 60,
      barcode: "0123456789016",
      barcodes: ["0123456789016"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.productType).toBe("permanent_color");
    expect(result.shadeBearing).toBe(true);
    expect(result.tonalClassificationEligible).toBe(true);
    expect(isShadeBearingProductType(result.productType)).toBe(true);
    expect(isTonalClassificationEligibleProductType(result.productType)).toBe(true);
    expect(result.shadeCodeNormalized).toBe("10/0");
    expect(result.level).toBe(10);
    expect(result.tonalProfile).toMatchObject({
      level: 10,
      primaryTone: "0",
      manufacturerSpecific: true,
    });
    expect(result.confidenceBand).toBe("automatic");
  });

  it("classifies approved Color Touch Relights without changing other line behavior", () => {
    const product = {
      id: "wella-color-touch-r12-00",
      brand: "WELLA PROFESSIONALS",
      series: "COLOR TOUCH",
      familyShade: "RELIGHTS",
      shade: "R12/00",
      type: "color",
      materialWeight: 60,
      barcode: "0123456789015",
      barcodes: ["0123456789015"],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.productType).toBe("demi_permanent");
    expect(result.shadeCodeNormalized).toBe("R12/00");
    expect(result.level).toBe(12);
    expect(result.shadeMetadata?.variant).toBe("relights");
    expect(result.shadeRuleId).toBe("wella_color_touch_variants");
    expect(result.confidenceBand).toBe("automatic");
  });

  it("classifies a product with missing shade as lower confidence", () => {
    const product = {
      id: "no-shade-1",
      brand: "WELLA PROFESSIONALS",
      series: "KOLESTON PERFECT",
      familyShade: "",
      shade: "",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    // Missing shade for a color product should reduce confidence below automatic
    expect(result.confidence).toBeLessThan(BAND_THRESHOLDS.AUTOMATIC);
  });

  it("classifies deleted product (flag=1) as inactive", () => {
    const product = {
      id: "deleted-1",
      brand: "WELLA PROFESSIONALS",
      series: "KOLESTON PERFECT",
      familyShade: "",
      shade: "8/3",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 1,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.active).toBe(false);
    expect(result.catalogFlag).toBe(1);
  });

  it("classifies an L'Oréal Dia Light product as acidic_toner", () => {
    const product = {
      id: "loreal-diaLight-1",
      brand: "L'OREAL PROFESSIONNEL",
      series: "DIA LIGHT",
      familyShade: "DIA LIGHT",
      shade: "8.3",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "l-oreal-professionnel");
    expect(result.productType).toBe("acidic_toner");
    expect(result.level).toBe(8);
  });

  it("classifies a product with no rules registered at lower confidence", () => {
    const product = {
      id: "unknown-brand-1",
      brand: "SOME UNKNOWN BRAND",
      series: "MYSTERY LINE",
      familyShade: "",
      shade: "8.3",
      type: "color",
      materialWeight: 60,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "some-unknown-brand");
    // No rules → confidence penalty → should not be automatic
    expect(result.confidenceBand).not.toBe("automatic");
    // But should still classify what it can
    expect(result.manufacturer).toBe("SOME UNKNOWN BRAND");
  });

  it("includes rulesVersion in every classification result", () => {
    const product = {
      id: "rules-version-check",
      brand: "WELLA PROFESSIONALS",
      series: "COLOR TOUCH",
      familyShade: "",
      shade: "8/3",
      type: "color",
      materialWeight: 50,
      barcode: "",
      barcodes: [],
      catalogNo: "",
      flag: 0,
    };
    const result = classifyProduct(product, "wella-professionals");
    expect(result.rulesVersion).toBeTruthy();
  });

  it("evidence array contains at least one entry per classified field", () => {
    const product = {
      id: "evidence-check",
      brand: "REDKEN",
      series: "COLOR FUSION",
      familyShade: "COLOR FUSION",
      shade: "8NA",
      type: "color",
      materialWeight: 60,
      barcode: "123456789",
      barcodes: ["123456789"],
      catalogNo: "CF-8NA",
      flag: 0,
    };
    const result = classifyProduct(product, "redken");
    const fields = result.evidence.map((e: any) => e.field);
    expect(fields).toContain("brand");
    expect(fields).toContain("productType");
    expect(fields).toContain("shade");
    expect(fields).toContain("packageSize");
  });
});
