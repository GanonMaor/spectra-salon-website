export type FeatureScore = "Strong" | "Moderate" | "Weak" | "Unknown";

export type AIPresence = "None" | "Limited" | "Embedded" | "AI-first";
export type AIEvidence = "Verified in-product" | "Vendor-claimed" | "Unclear";

export type PricingTransparency = "High" | "Medium" | "Medium-Low" | "Low";

export type AddOnIntensity = "Low" | "Medium" | "High";

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
}

export interface PlanTier {
  name: string;
  price: string;
}

export interface PricingProfile {
  model: string;
  entryPrice: string;
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
}

export interface CompetitorDataset {
  competitors: Competitor[];
  lastUpdated: string;
}
