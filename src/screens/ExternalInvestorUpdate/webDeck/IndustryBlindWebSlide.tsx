import React from "react";
import type { UpdateLang } from "../finalCopy";
import { PlayerBlindSpotSlide, type PlayerBlindSpotSpec } from "./PlayerBlindSpotSlide";

const SPEC: PlayerBlindSpotSpec = {
  id: "web-deck-industry-blind",
  className: "web-deck-industry-blind",
  kicker: { en: "For salons", he: "למספרות" },
  headlineLead: { en: "The salon can see the booking.", he: "המספרה רואה את התור." },
  headlinePunch: { en: "Not the work.", he: "לא את העבודה." },
  support: {
    en: "It knows what was planned, charged and purchased. It cannot see what actually happened during the service.",
    he: "היא יודעת מה תוכנן, מה חויב ומה נרכש. היא לא רואה מה באמת קרה בשירות.",
  },
  canSeeLabel: { en: "They can see", he: "מה שהמספרה רואה" },
  cannotSeeLabel: { en: "They cannot see", he: "מה שהמספרה לא רואה" },
  canSee: [
    { en: "Who is booked", he: "מי בתור" },
    { en: "What was charged", he: "מה שחויב" },
    { en: "What was purchased", he: "מה שנרכש" },
  ],
  cannotSee: [
    { en: "What was mixed", he: "מה שעורבב" },
    { en: "How many grams were used", he: "כמה גרם היה בשימוש" },
    { en: "What the service really cost", he: "כמה השירות באמת עלה" },
    { en: "What actually left the shelf", he: "מה שבאמת ירד מהמדף" },
  ],
  close: {
    en: "Spectra measures the service as it happens.",
    he: "Spectra מודדת את השירות בזמן שהוא קורה.",
  },
  outcomes: [
    { en: "Real service cost", he: "עלות שירות אמיתית" },
    { en: "Real material usage", he: "שימוש אמיתי בחומרים" },
    { en: "Inventory that matches the shelf", he: "מלאי שתואם את המדף" },
  ],
  index: { en: "04 — For salons", he: "04 — למספרות" },
  label: {
    en: "The salon can see the booking. Not the work.",
    he: "המספרה רואה את התור. לא את העבודה.",
  },
};

export const IndustryBlindWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <PlayerBlindSpotSlide lang={lang} spec={SPEC} />
);
