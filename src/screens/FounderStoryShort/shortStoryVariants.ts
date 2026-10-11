/** September financing wrapper for the short Founder Story deck. */
export type ShortDeckVariantId = "september";

export type ShortRaise = {
  amount: string;
  terms: string;
  nextStep: { label: string; value: string } | null;
  finePrint: string;
};

export type ShortDeckVariant = {
  id: ShortDeckVariantId;
  route: string;
  publicName: string;
  date: string;
  raise: ShortRaise;
};

const SEPTEMBER_RAISE: ShortRaise = {
  amount: "$1M",
  terms: "$5M pre-money valuation",
  nextStep: null,
  finePrint:
    "Spectra has raised $1M+ to date. $1M at a $5M pre-money valuation ($6M post-money), subject to board, investor and legal approval. Advisory compensation includes performance-linked and equity components. Forward-looking milestones depend on product, adoption and market conditions.",
};


export const SHORT_DECK_VARIANTS: Record<ShortDeckVariantId, ShortDeckVariant> = {
  september: {
    id: "september",
    route: "/investors/founder-story-short",
    publicName: "Spectra Founder Story · Short · September 2026",
    date: "September 2026",
    raise: SEPTEMBER_RAISE,
  },
};
