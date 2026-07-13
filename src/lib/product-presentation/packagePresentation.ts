export type ProductPackageClass = "tube" | "bottle" | "pump" | "jar" | "box" | "canister";

export interface ProductPresentationInput {
  canonicalName: string;
  productLineName?: string | null;
  primaryProductType?: string | null;
  packagingType?: string | null;
}

export interface ProductPackageSpec {
  targetBBox: Readonly<{ width: number; height: number }>;
  baselineY: number;
}

/**
 * Export-time image contract. All brands use this shared 800×800 transparent
 * canvas, so `object-contain` cards retain a consistent visual weight.
 */
export const PRODUCT_PACKAGE_SPECS: Readonly<Record<ProductPackageClass, ProductPackageSpec>> = {
  tube: { targetBBox: { width: 480, height: 640 }, baselineY: 690 },
  bottle: { targetBBox: { width: 480, height: 640 }, baselineY: 690 },
  pump: { targetBBox: { width: 480, height: 640 }, baselineY: 690 },
  jar: { targetBBox: { width: 640, height: 480 }, baselineY: 610 },
  box: { targetBBox: { width: 560, height: 640 }, baselineY: 690 },
  canister: { targetBBox: { width: 560, height: 640 }, baselineY: 690 },
};

function normalized(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Uses explicit catalog metadata first; brand-agnostic terms are only a
 * backward-compatible fallback until imports populate `packaging_type`.
 */
export function inferProductPackageClass(input: ProductPresentationInput): ProductPackageClass {
  const packagingType = normalized(input.packagingType);
  if (/(jar|pot|compact)/.test(packagingType)) return "jar";
  if (/(box|carton|kit|sachet)/.test(packagingType)) return "box";
  if (/(canister|tub|powder)/.test(packagingType)) return "canister";
  if (/pump/.test(packagingType)) return "pump";
  if (/(bottle|spray|aerosol)/.test(packagingType)) return "bottle";
  if (/tube/.test(packagingType)) return "tube";

  const text = `${normalized(input.canonicalName)} ${normalized(input.productLineName)} ${normalized(input.primaryProductType)}`;
  if (/(jar|pot|mask|masque|balm|paste)/.test(text)) return "jar";
  if (/(box|carton|kit|sachet|step\s*[12])/.test(text)) return "box";
  if (/(blond|bleach|lightener|powder|platinium|clay)/.test(text)) return "canister";
  if (/(spray|aerosol)/.test(text)) return "bottle";
  if (/(pump|shampoo|conditioner|developer|oxidant|oxydant|activator|diactivator|serum|\boil\b|lotion)/.test(text)) return "pump";
  return "tube";
}

export function usesProminentRawCard(packageClass: ProductPackageClass): boolean {
  return packageClass === "canister" || packageClass === "bottle" || packageClass === "pump";
}
