import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
import { FINAL_PROOF, type Localized } from "./finalCopy";

/**
 * Cover dateline for the external investor story.
 *
 * Business-traction values are the approved FINAL_PROOF presentation strings
 * (src/screens/ExternalInvestorUpdate/finalCopy.ts). They are not recalculated
 * here. investor-shared/investor-metrics.ts does not publish these KPIs.
 *
 * The grams figure comes from the shipped usage proof
 * (src/screens/SpectraProductVision/dataMoat.ts) using the same investor
 * presentation already used elsewhere: (grams / 1e6).toFixed(1) + "M".
 * Months of history, visits and service counts live in the data-layer chapter.
 */
export const HERO_PROOF_METRICS: readonly { value: string; label: Localized }[] = [
  ...FINAL_PROOF,
  {
    value: `${(GLOBAL_USAGE_PROOF.grams / 1_000_000).toFixed(1)}M`,
    label: { en: "Grams measured", he: "גרמים שנמדדו" },
  },
];
