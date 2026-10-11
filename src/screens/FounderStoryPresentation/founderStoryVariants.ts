/** September fundraising wrapper around the shared Founder Story deck. */
import { REVISION, type Localized } from "./founderStoryCopy";

export type DeckVariantId = "september2026";

export type RaiseColumn = {
  title: Localized;
  body: Localized;
};

export type RaiseConfig = {
  kicker: Localized;
  amount: Localized;
  raisedToDate: Localized;
  title: Localized;
  body: Localized;
  narrative: readonly Localized[];
  columns: readonly RaiseColumn[];
  funds: typeof REVISION.raise.funds;
  conclusion: Localized;
  nextStep: { label: Localized; value: Localized } | null;
  finePrint: Localized;
};

export type DeckVariant = {
  id: DeckVariantId;
  route: string;
  publicName: string;
  date: Localized;
  raise: RaiseConfig;
};

const SEPTEMBER_RAISE: RaiseConfig = {
  kicker: { en: "Equity round · $5M pre-money", he: "סבב הון · $5M לפני הכסף" },
  amount: { en: "$1M", he: "$1M" },
  raisedToDate: { en: "Over $1M raised to date", he: "מעל $1M גויסו עד היום" },
  title: {
    en: "Built on what is already working. Focused on what comes next.",
    he: "נבנה על מה שכבר עובד. ממוקד במה שמגיע עכשיו.",
  },
  body: { en: "", he: "" },
  narrative: [],
  columns: [
    {
      title: { en: "Complete", he: "להשלים" },
      body: {
        en: "Finish Salon OS and the foundation of Salon AI.",
        he: "להשלים את Salon OS ואת התשתית של Salon AI.",
      },
    },
    {
      title: { en: "Expand", he: "להרחיב" },
      body: {
        en: "Bring Salon OS across the existing salon network and learn from real daily operations.",
        he: "להביא את Salon OS לכל רשת הסלונים הקיימת וללמוד מפעילות יומיומית אמיתית.",
      },
    },
    {
      title: { en: "Scale", he: "להגדיל" },
      body: {
        en: "Grow the proven acquisition engine with a leaner AI-native GTM model.",
        he: "להגדיל את מנוע הרכישה המוכח באמצעות מודל GTM רזה ומבוסס AI.",
      },
    },
  ],
  funds: REVISION.raise.funds,
  conclusion: {
    en: "We already proved the wedge. This round is about proving the platform.",
    he: "כבר הוכחנו את נקודת הכניסה. הסבב הזה נועד להוכיח את הפלטפורמה.",
  },
  nextStep: null,
  finePrint: { en: "", he: "" },
};

export const DECK_VARIANTS: Record<DeckVariantId, DeckVariant> = {
  september2026: {
    id: "september2026",
    route: "/investors/september-2026",
    publicName: "Spectra Investor Deck · September 2026",
    date: { en: "September 2026", he: "ספטמבר 2026" },
    raise: SEPTEMBER_RAISE,
  },
};
