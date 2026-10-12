export type FeatureScore = "Strong" | "Moderate" | "Weak" | "Unknown";

export type AIPresence = "None" | "Limited" | "Embedded" | "AI-first" | "Not verified";
export type AIEvidence = "Verified in-product" | "Vendor-claimed" | "Unclear";

export type PricingTransparency = "High" | "Medium" | "Medium-Low" | "Low";

export type AddOnIntensity = "Low" | "Medium" | "High";
export type CompetitiveSegment = "cost-optimization" | "salon-management";
export type SpectraProductArea = "color-intelligence" | "salon-os" | "salon-ai";

export interface FeatureScores {
  booking: FeatureScore;
  payments: FeatureScore;
  operations: FeatureScore;
  clientCRM: FeatureScore;
  marketing: FeatureScore;
  ai: FeatureScore;
  analytics: FeatureScore;
  teamStaff: FeatureScore;
}

export interface AIProfile {
  presence: AIPresence;
  breadth: number;
  narrativeCriticality: number;
  rationale: string;
  evidence: AIEvidence;
  product?: string;
  actions?: string[];
  channels?: string[];
  limitations?: string[];
  availability?: string;
  price?: string;
  verifiedAt?: string;
  sources?: SourceLink[];
}

export interface SourceLink {
  label: string;
  url: string;
  publishedAt?: string;
}

export type CapabilityStatus = "Verified" | "Partial" | "In development" | "Not verified";

export interface CapabilityEvidence {
  status: CapabilityStatus;
  detail: string;
}

export interface ColorCostProfile {
  weighing: CapabilityEvidence;
  leftovers: CapabilityEvidence;
  formulas: CapabilityEvidence;
  billing: CapabilityEvidence;
  inventory: CapabilityEvidence;
  procurement: CapabilityEvidence;
  integrations: CapabilityEvidence;
}

export interface PlanTier {
  name: string;
  price: string;
}

export interface PricingProfile {
  model: string;
  entryPrice: string;
  entryPriceNote?: string;
  processingFees: string;
  addOnIntensity: AddOnIntensity;
  marketplaceCommission: string;
  transparency: PricingTransparency;
  plans?: PlanTier[];
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  website: string;
  features: FeatureScores;
  ai: AIProfile;
  pricing: PricingProfile;
  differentiationNote: string;
  scale?: string;
  countries?: string;
  funding?: string;
  valuation?: string;
  primarySegment?: CompetitiveSegment;
  segments?: CompetitiveSegment[];
  competesWith?: SpectraProductArea[];
  colorCost?: ColorCostProfile;
}

export interface CompetitorDataset {
  competitors: Competitor[];
  lastUpdated: string;
}
