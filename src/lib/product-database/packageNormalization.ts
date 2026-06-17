/**
 * src/lib/product-database/packageNormalization.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Utility functions for normalizing package size, unit, and quantity values
 * for canonical product identity.
 *
 * Per plan spec: "Separate product family from canonical product SKU.
 * Package size, unit, package count, barcode, catalog number, and intended
 * use are identity guardrails."
 *
 * Key rules (from plan):
 *   - 60 ml ≠ 120 ml (different SKUs even if same shade)
 *   - 1000 ml bottle ≠ 2 × 500 ml pack (different SKUs, same total volume)
 *   - professional_backbar ≠ retail (different intended use = different identity)
 *   - developer ≠ activator ≠ lightener (never merge across product types)
 *
 * These utilities produce the package-level fields stored in canonical_products.
 * They never overwrite source values — source is always preserved in raw_payload.
 */

export type PackageSizeUnit =
  | "g" | "kg" | "ml" | "l" | "oz" | "fl_oz"
  | "units" | "sachets" | "ampoules" | "tubes" | "packs" | "unknown";

export type IntendedUseType =
  | "professional_backbar"
  | "professional_technical"
  | "retail"
  | "refill"
  | "sample"
  | "starter_kit"
  | "salon_only"
  | "home_care"
  | "system_specific"
  | "universal"
  | "unknown";

export interface NormalizedPackage {
  packageSizeValue: number | null;
  packageSizeUnit: PackageSizeUnit;
  packageCount: number | null;
  unitSizeValue: number | null;
  unitSizeUnit: PackageSizeUnit;
  originalPackageText: string;
  isMultiUnit: boolean;
  totalVolumeEstimate: number | null; // for reference only, NOT an identity field
  parseMethod: "structured" | "single_unit" | "multi_unit" | "size_only" | "unknown";
}

export interface NormalizedIntendedUse {
  intendedUseType: IntendedUseType;
  professionalUse: boolean;
  retailUse: boolean;
  technicalUse: boolean;
  packagingRole: string | null;
}

// ── Unit normalization ────────────────────────────────────────────────────

const UNIT_ALIASES: Record<string, PackageSizeUnit> = {
  g: "g", gram: "g", grams: "g", גרם: "g",
  kg: "kg", kilogram: "kg", kilograms: "kg", קילוגרם: "kg",
  ml: "ml", milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml", "מ\"ל": "ml",
  l: "l", liter: "l", litre: "l", liters: "l", ליטר: "l",
  oz: "oz", ounce: "oz", ounces: "oz", "fl oz": "fl_oz", "fl. oz": "fl_oz", floz: "fl_oz",
  units: "units", unit: "units", pc: "units", pcs: "units", יחידות: "units",
  sachets: "sachets", sachet: "sachets",
  ampoules: "ampoules", ampoule: "ampoules", ampule: "ampoules",
  tubes: "tubes", tube: "tubes",
  packs: "packs", pack: "packs",
};

function normalizeUnit(raw: string): PackageSizeUnit {
  const s = raw.trim().toLowerCase();
  return UNIT_ALIASES[s] ?? "unknown";
}

/**
 * Parse a package text like:
 *   "60ml", "60 ml", "60g", "120 ML", "1 kg",
 *   "12 × 10 ml", "6 tubes × 60 ml", "2 x 500ml",
 *   "500 g pouch", "1000 ml bottle"
 */
export function normalizePackageText(raw: string | null | undefined): NormalizedPackage {
  const original = String(raw ?? "").trim();
  if (!original) {
    return {
      packageSizeValue: null,
      packageSizeUnit: "unknown",
      packageCount: null,
      unitSizeValue: null,
      unitSizeUnit: "unknown",
      originalPackageText: original,
      isMultiUnit: false,
      totalVolumeEstimate: null,
      parseMethod: "unknown",
    };
  }

  // Multi-unit: "12 × 10 ml", "6 tubes × 60ml", "2 x 500ml"
  const multiMatch = original.match(
    /^(\d+(?:\.\d+)?)\s*(?:×|x|×)\s*(\d+(?:\.\d+)?)\s*([a-zA-Zאָ-ת"]+)/i
  );
  if (multiMatch) {
    const count     = parseFloat(multiMatch[1]);
    const unitSize  = parseFloat(multiMatch[2]);
    const unit      = normalizeUnit(multiMatch[3]);
    const total     = count * unitSize;
    return {
      packageSizeValue: total,
      packageSizeUnit: unit,
      packageCount: count,
      unitSizeValue: unitSize,
      unitSizeUnit: unit,
      originalPackageText: original,
      isMultiUnit: true,
      totalVolumeEstimate: total,
      parseMethod: "multi_unit",
    };
  }

  // Single value + unit: "60ml", "60 ml", "500 g"
  const singleMatch = original.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Zאָ-ת"]+)/i);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);
    const unit  = normalizeUnit(singleMatch[2]);
    return {
      packageSizeValue: value,
      packageSizeUnit: unit,
      packageCount: 1,
      unitSizeValue: value,
      unitSizeUnit: unit,
      originalPackageText: original,
      isMultiUnit: false,
      totalVolumeEstimate: value,
      parseMethod: "single_unit",
    };
  }

  // Numeric only
  const numOnly = original.match(/^(\d+(?:\.\d+)?)$/);
  if (numOnly) {
    return {
      packageSizeValue: parseFloat(numOnly[1]),
      packageSizeUnit: "unknown",
      packageCount: null,
      unitSizeValue: null,
      unitSizeUnit: "unknown",
      originalPackageText: original,
      isMultiUnit: false,
      totalVolumeEstimate: null,
      parseMethod: "size_only",
    };
  }

  return {
    packageSizeValue: null,
    packageSizeUnit: "unknown",
    packageCount: null,
    unitSizeValue: null,
    unitSizeUnit: "unknown",
    originalPackageText: original,
    isMultiUnit: false,
    totalVolumeEstimate: null,
    parseMethod: "unknown",
  };
}

/**
 * Returns true if two normalized packages represent the same identity.
 * RULE: different total volume does NOT auto-prove different identity,
 * because 1×1000ml ≠ 2×500ml are different SKUs despite same total.
 * We compare packageSizeValue + packageSizeUnit + packageCount + unitSizeValue.
 */
export function packagesAreSameIdentity(a: NormalizedPackage, b: NormalizedPackage): boolean {
  if (a.packageSizeUnit !== b.packageSizeUnit) return false;
  if (a.packageCount !== b.packageCount) return false;
  if (a.packageSizeValue !== b.packageSizeValue) return false;
  if (a.unitSizeValue !== b.unitSizeValue) return false;
  return true;
}

// ── Intended use inference ────────────────────────────────────────────────

const PROFESSIONAL_SIGNALS = [
  /\bprofessional\b/i, /\bpro\b/i, /\bbackbar\b/i, /\bsalon\b/i,
  /\bsalon.only\b/i, /\btechnical\b/i,
];

const RETAIL_SIGNALS = [
  /\bretail\b/i, /\bhome\b/i, /\bhome.care\b/i, /\bconsumer\b/i,
];

/**
 * Infer intended use from product name, type, or raw description.
 * Soft inference only — never overrides manual assignment.
 */
export function inferIntendedUse(
  rawProductName: string,
  rawProductType: string | null,
  rawProductLine: string | null,
): NormalizedIntendedUse {
  const combined = [rawProductName, rawProductType, rawProductLine]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isProfessional = PROFESSIONAL_SIGNALS.some((p) => p.test(combined));
  const isRetail       = RETAIL_SIGNALS.some((p) => p.test(combined));

  let intendedUseType: IntendedUseType = "unknown";
  if (isProfessional && !isRetail) intendedUseType = "professional_backbar";
  else if (isRetail && !isProfessional) intendedUseType = "retail";
  else if (isProfessional && isRetail) intendedUseType = "universal";

  return {
    intendedUseType,
    professionalUse: isProfessional || intendedUseType === "universal",
    retailUse: isRetail || intendedUseType === "universal",
    technicalUse: /\btechnical\b/i.test(combined),
    packagingRole: null,
  };
}

// ── Duplicate matching guardrails ─────────────────────────────────────────

export interface ProductIdentityFields {
  manufacturerNormalizedName: string;
  productLineNormalizedName: string | null;
  primaryProductType: string;
  shadeName: string | null;
  shadeCode: string | null;
  packageSizeValue: number | null;
  packageSizeUnit: PackageSizeUnit;
  packageCount: number | null;
  unitSizeValue: number | null;
  intendedUseType: IntendedUseType;
  barcode: string | null;
  catalogNumber: string | null;
}

export type DuplicateMatchResult =
  | "safe_auto_merge"
  | "suggested_duplicate"
  | "needs_review"
  | "different_product";

/**
 * Apply duplicate matching guardrails per plan spec.
 * Returns whether two products can be auto-merged, are suggested duplicates,
 * or must be treated as different products.
 */
export function evaluateDuplicateMatch(
  a: ProductIdentityFields,
  b: ProductIdentityFields,
): { result: DuplicateMatchResult; reasons: string[] } {
  const reasons: string[] = [];

  // Safe auto-merge: trusted barcode matches
  if (a.barcode && b.barcode && a.barcode === b.barcode) {
    return { result: "safe_auto_merge", reasons: ["trusted barcode match"] };
  }

  // Safe auto-merge: catalog number matches within same brand
  if (
    a.catalogNumber && b.catalogNumber &&
    a.catalogNumber === b.catalogNumber &&
    a.manufacturerNormalizedName === b.manufacturerNormalizedName
  ) {
    return { result: "safe_auto_merge", reasons: ["catalog number + manufacturer match"] };
  }

  // Hard block: different manufacturers
  if (a.manufacturerNormalizedName !== b.manufacturerNormalizedName) {
    return { result: "different_product", reasons: ["different manufacturer"] };
  }

  // Hard block: different product types (developer vs shade vs lightener)
  if (a.primaryProductType !== b.primaryProductType) {
    reasons.push(`product type mismatch: ${a.primaryProductType} vs ${b.primaryProductType}`);
    return { result: "different_product", reasons };
  }

  // Hard block: different package sizes with both specified
  if (
    a.packageSizeValue != null && b.packageSizeValue != null &&
    a.packageSizeUnit !== "unknown" && b.packageSizeUnit !== "unknown"
  ) {
    if (!packagesAreSameIdentity(
      { packageSizeValue: a.packageSizeValue, packageSizeUnit: a.packageSizeUnit, packageCount: a.packageCount, unitSizeValue: a.unitSizeValue, unitSizeUnit: a.packageSizeUnit, originalPackageText: "", isMultiUnit: false, totalVolumeEstimate: null, parseMethod: "unknown" },
      { packageSizeValue: b.packageSizeValue, packageSizeUnit: b.packageSizeUnit, packageCount: b.packageCount, unitSizeValue: b.unitSizeValue, unitSizeUnit: b.packageSizeUnit, originalPackageText: "", isMultiUnit: false, totalVolumeEstimate: null, parseMethod: "unknown" }
    )) {
      reasons.push(`package size mismatch: ${a.packageSizeValue}${a.packageSizeUnit} vs ${b.packageSizeValue}${b.packageSizeUnit}`);
      return { result: "suggested_duplicate", reasons };
    }
  }

  // Hard block: different intended use
  const bothKnown = a.intendedUseType !== "unknown" && b.intendedUseType !== "unknown";
  if (bothKnown && a.intendedUseType !== b.intendedUseType) {
    if (
      (a.intendedUseType === "professional_backbar" && b.intendedUseType === "retail") ||
      (a.intendedUseType === "retail" && b.intendedUseType === "professional_backbar")
    ) {
      reasons.push(`professional vs retail variant — different identity`);
      return { result: "suggested_duplicate", reasons };
    }
  }

  // All critical structured fields match
  if (
    a.productLineNormalizedName === b.productLineNormalizedName &&
    a.shadeCode === b.shadeCode &&
    a.shadeName === b.shadeName
  ) {
    return { result: "safe_auto_merge", reasons: ["all critical identity fields match"] };
  }

  // Names match but some fields differ → suggest
  if (a.shadeCode && b.shadeCode && a.shadeCode !== b.shadeCode) {
    reasons.push(`shade code mismatch: ${a.shadeCode} vs ${b.shadeCode}`);
    return { result: "needs_review", reasons };
  }

  reasons.push("partial field match — review required");
  return { result: "suggested_duplicate", reasons };
}
