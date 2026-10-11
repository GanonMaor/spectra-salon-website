import React from "react";
import type { UpdateLang } from "../finalCopy";
import { PlayerBlindSpotSlide, type PlayerBlindSpotSpec } from "./PlayerBlindSpotSlide";

const SPEC: PlayerBlindSpotSpec = {
  id: "web-deck-operational-data-layer",
  className: "web-deck-operational-data-layer",
  kicker: { en: "For brands", he: "למותגים" },
  headlineLead: { en: "The brand can see what it sold.", he: "המותג רואה מה שמכר." },
  headlinePunch: { en: "Not what was used.", he: "לא מה שהיה בשימוש." },
  support: {
    en: "It knows what was shipped, ordered and invoiced. It cannot see what actually happens to the product inside the salon.",
    he: "הוא יודע מה נשלח, מה הוזמן ומה חויב. הוא לא רואה מה באמת קורה למוצר בתוך המספרה.",
  },
  canSeeLabel: { en: "They can see", he: "מה שהמותג רואה" },
  cannotSeeLabel: { en: "They cannot see", he: "מה שהמותג לא רואה" },
  canSee: [
    { en: "What was sold", he: "מה שנמכר" },
    { en: "Which salon ordered", he: "איזו מספרה הזמינה" },
    { en: "How much was shipped", he: "כמה נשלח" },
  ],
  cannotSee: [
    { en: "Which products were actually used", he: "אילו מוצרים באמת היו בשימוש" },
    { en: "How much was used per service", he: "כמה היה בשימוש לכל שירות" },
    { en: "Which products were used together", he: "אילו מוצרים היו בשימוש יחד" },
    { en: "What demand really looks like on the salon floor", he: "איך הביקוש באמת נראה על רצפת המספרה" },
  ],
  close: {
    en: "Spectra measures product usage at the point of service.",
    he: "Spectra מודדת שימוש במוצר בנקודת השירות.",
  },
  outcomes: [
    { en: "Real product usage", he: "שימוש אמיתי במוצר" },
    { en: "Real professional behavior", he: "התנהגות מקצועית אמיתית" },
    { en: "Real demand visibility", he: "נראות ביקוש אמיתית" },
  ],
  index: { en: "05 — For brands", he: "05 — למותגים" },
  label: {
    en: "The brand can see what it sold. Not what was used.",
    he: "המותג רואה מה שמכר. לא מה שהיה בשימוש.",
  },
};

export const OperationalDataLayerWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <PlayerBlindSpotSlide lang={lang} spec={SPEC} />
);
