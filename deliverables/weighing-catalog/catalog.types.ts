/**
 * Types for the weighing-catalog snapshot.
 * Field names match catalog.json. This file is a contract for the snapshot,
 * not a claim that a server with these types already exists.
 */

export type Enforcement =
  | "enforced_in_code"
  | "catalog_data"
  | "documentation_only"
  | "missing"
  | "undecided";

export type CatalogStatus = "active" | "deleted" | "deprecated" | "barcode_conflict" | "unknown";

export type MixingRole =
  | "color"
  | "toner"
  | "developer"
  | "lightener"
  | "treatment"
  | "straightening"
  | "additive"
  | "other";

export type Presence = "present" | "missing" | "zero" | "unparsed" | "not_applicable";

export interface Market {
  code: "CA";
  sourceLabel: string;
  evidence: string;
}

export interface WeightField {
  value: number | null;
  unit: "g" | null;
  unitStatus?: "schema_convention";
  unitSource?: string;
  presence: Presence;
  sourceField: "materialWeight" | "packingWeight";
  raw?: unknown;
}

export interface DeveloperStrength {
  percent: number | null;
  volume: number | null;
  volumeUnit: "vol" | null;
  percentExplicit: boolean;
  volumeExplicit: boolean;
  raw: string;
  inferredCounterpart: false;
}

export interface ShadeLevel {
  numeric: number;
  raw: string;
  status: "catalog_grouping";
  sourceField: "familyShade";
  note: string;
}

export interface WeighingProduct {
  id: string;
  source: {
    productId: string;
    file: string;
    upstreamSpreadsheet: string;
  };
  brandId: string;
  productLineId: string;
  brand: { source: string; display: string };
  productLine: { source: string; display: string };
  shadeCode: string;
  shadeLevel: ShadeLevel | null;
  shadeFamilies: string[];
  shadeFamilyStatus: "not_in_source";
  sourceGrouping: string | null;
  productType: string;
  rawType: string | null;
  mixingRole: MixingRole;
  mixingRoleStatus: "mapped_from_catalog_type" | "unmapped_type_kept_as_other";
  developerStrength: DeveloperStrength | null;
  developerStrengthPresence: "present" | "missing" | "not_applicable";
  package: {
    materialWeight: WeightField;
    packingWeight: WeightField;
  };
  barcodes: string[];
  catalogNo: string | null;
  hairColor: string | null;
  catalogStatus: CatalogStatus;
  sourceFlag: number;
  price: {
    amount: number | null;
    currency: "ILS";
    currencySource: string;
    scope: "catalog_spreadsheet";
    isSalonPrice: false;
    presence: Presence;
  };
  costPerGram: null;
  countsTowardDeveloperTarget: null;
  market: Market | null;
  image: {
    sourceFilename: string | null;
    sourcePublicPath: string | null;
    localAsset: string | null;
    included: boolean;
  };
  derived?: {
    productKind: { value: string | null; status: "inferred"; source: string };
    shadeDescription: { value: string; status: "heuristic"; source: string } | null;
    verificationUrl: { value: string | null; status: "search_link_not_evidence"; source: string };
  };
}

export interface WeighingCatalog {
  catalogVersion: string;
  exportedAt: string;
  contract: "spectra-weighing-catalog/1";
  contractStatus: "snapshot";
  counts: {
    brands: number;
    productLines: number;
    products: number;
    localImages: number;
  };
  brands: Array<{
    id: string;
    sourceBrand: string;
    displayName: string;
    displayNameSource: string;
    market: Market | null;
  }>;
  productLines: Array<{
    id: string;
    brandId: string;
    sourceSeries: string;
    displayName: string;
    sourceFile: string;
    market: Market | null;
    localExtract: {
      exportedCount: number;
      sourceFileCount: number;
      status: "all_rows_in_source_series_exported";
    };
    manufacturerCompleteness: "unknown";
  }>;
  products: WeighingProduct[];
}
