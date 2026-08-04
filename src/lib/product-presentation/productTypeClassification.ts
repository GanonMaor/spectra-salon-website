import type { ProductType } from "../types/productTruth";

export type InventoryProductCategory =
  | "color"
  | "developer"
  | "lightener"
  | "bond"
  | "care"
  | "texture"
  | "other";

const TYPE_ALIASES: Readonly<Record<string, ProductType>> = {
  color: "hair_color_shade",
  hair_color: "hair_color_shade",
  hair_colour: "hair_color_shade",
  toner: "acidic_toner",
  developer: "developer_oxidant",
  oxidant: "developer_oxidant",
  activator: "developer_oxidant",
  bleach: "lightener_bleach",
  lightener: "lightener_bleach",
  treatment: "treatment_care",
  care: "treatment_care",
  mixer: "mixer_corrector",
};

const PRODUCT_TYPES = new Set<ProductType>([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
  "developer_oxidant",
  "lightener_bleach",
  "bond_builder",
  "treatment_care",
  "mixer_corrector",
  "other",
]);

const SHADE_BEARING_TYPES = new Set<ProductType>([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
  "mixer_corrector",
]);

function normalized(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function normalizeProductType(value: string | null | undefined): ProductType {
  const type = normalized(value);
  if (PRODUCT_TYPES.has(type as ProductType)) return type as ProductType;
  return TYPE_ALIASES[type] ?? "other";
}

export function isShadeBearingProductType(value: string | null | undefined): boolean {
  return SHADE_BEARING_TYPES.has(normalizeProductType(value));
}

export function classifyInventoryProduct(input: {
  primaryProductType?: string | null;
  canonicalName?: string | null;
  productLineName?: string | null;
}): InventoryProductCategory {
  const type = normalizeProductType(input.primaryProductType);

  if (SHADE_BEARING_TYPES.has(type)) return "color";
  if (type === "developer_oxidant") return "developer";
  if (type === "lightener_bleach") return "lightener";
  if (type === "bond_builder") return "bond";
  if (type === "treatment_care") return "care";

  // Backward-compatible inference is intentionally limited to records whose
  // canonical type is missing/other. Authoritative Product Truth wins first.
  const text = `${input.canonicalName ?? ""} ${input.productLineName ?? ""}`.toLowerCase();
  if (/(developer|oxidant|oxydant|activator|diactivator)/.test(text)) return "developer";
  if (/(blond|bleach|lighten|platinium|efassor|powder)/.test(text)) return "lightener";
  if (/(bond|plex)/.test(text)) return "bond";
  if (/(shampoo|conditioner|mask|masque|treatment|care|repair|serum|oil|keratin|detox)/.test(text)) return "care";
  if (/(straight|relax|perm|wave)/.test(text)) return "texture";
  if (/(color|colour|shade|toner|gloss|majirel|inoa|luo)/.test(text)) return "color";
  return "other";
}

export function inventoryCategoryLabel(category: InventoryProductCategory, isHebrew: boolean): string {
  const labels: Record<InventoryProductCategory, readonly [string, string]> = {
    color: ["Color & shades", "צבע וגוונים"],
    developer: ["Developers & activators", "חמצנים ואקטיבטורים"],
    lightener: ["Lighteners", "מוצרי הבהרה"],
    bond: ["Bond builders", "מוצרי בונדינג וחיזוק"],
    care: ["Care & treatment", "טיפוח ושיקום"],
    texture: ["Straightening & perm", "החלקות וסלסול"],
    other: ["Other products", "מוצרים נוספים"],
  };
  return labels[category][isHebrew ? 1 : 0];
}

export function isRetailInventoryCategory(category: InventoryProductCategory): boolean {
  return category === "care" || category === "bond";
}
