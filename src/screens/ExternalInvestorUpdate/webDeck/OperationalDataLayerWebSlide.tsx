import React from "react";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  Coins,
  Database,
  Factory,
  Layers,
  LineChart,
  MapPin,
  PackageOpen,
  Scissors,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CB_INK } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import {
  Body,
  CenterPanel,
  Display,
  GoldNode,
  InkAtmosphere,
  Kicker,
  LayerMark,
  Rule,
  SkinProvider,
  ZoneLabel,
  slideBase,
} from "./SlideCompositionKit";

/** The colour bar itself: where the activity this slide structures happens. */
const DATA_LAYER_PHOTO = "/investor/media/color-bar.jpg";

/** Each outcome and flow step carries the icon for the thing it names. */
type Step = { label: Localized; icon: LucideIcon };

const COPY = {
  eyebrow: { en: "One solution. Value for both sides.", he: "פתרון אחד. ערך לשני הצדדים." },
  headlineLead: { en: "Spectra turns salon activity", he: "Spectra הופכת פעילות סלון" },
  headlinePunch: { en: "into intelligence.", he: "לאינטליגנציה." },
  leftLabel: { en: "Salons", he: "סלונים" },
  centerLabel: { en: "The operational data layer", he: "שכבת הדאטה התפעולי" },
  rightLabel: { en: "Brands & suppliers", he: "מותגים וספקים" },
  leftOutcomes: [
    { label: { en: "True service cost & margin", he: "עלות ומרווח שירות אמיתיים" }, icon: Coins },
    { label: { en: "Smarter capacity & scheduling", he: "קיבולת ותזמון חכמים יותר" }, icon: CalendarClock },
    { label: { en: "Predictive inventory", he: "מלאי חיזוי" }, icon: Boxes },
    { label: { en: "Better purchasing decisions", he: "החלטות רכש טובות יותר" }, icon: ShoppingCart },
    { label: { en: "Client intelligence", he: "אינטליגנציית לקוחות" }, icon: Users },
  ] satisfies readonly Step[],
  leftShift: [
    { en: "See", he: "ראה" },
    { en: "Understand", he: "הבן" },
    { en: "Predict", he: "חזה" },
    { en: "Act", he: "פעל" },
  ],
  rightOutcomes: [
    { label: { en: "Real product consumption", he: "צריכת מוצר אמיתית" }, icon: PackageOpen },
    { label: { en: "Service-level demand", he: "ביקוש ברמת השירות" }, icon: BarChart3 },
    { label: { en: "Product adoption", he: "אימוץ מוצרים" }, icon: TrendingUp },
    { label: { en: "Local & regional demand signals", he: "אותות ביקוש מקומיים ואזוריים" }, icon: MapPin },
    { label: { en: "Better forecasting", he: "תחזית טובה יותר" }, icon: LineChart },
  ] satisfies readonly Step[],
  rightShiftFrom: { en: "Sell-in", he: "Sell-in" },
  rightShiftTo: {
    en: "Real consumption intelligence",
    he: "אינטליגנציית צריכה אמיתית",
  },
  bridge: {
    en: "Capturing what actually happens during the service.",
    he: "לוכדים את מה שבאמת קורה במהלך השירות.",
  },
  flow: [
    { label: { en: "Real salon activity", he: "פעילות סלון אמיתית" }, icon: Scissors },
    { label: { en: "Structured operational data", he: "דאטה תפעולי מובנה" }, icon: Database },
    { label: { en: "Intelligence", he: "אינטליגנציה" }, icon: Sparkles },
  ] satisfies readonly Step[],
  statement: {
    en: "One operational data layer connects the salon floor to the industry above it.",
    he: "שכבת דאטה תפעולי אחת מחברת את רצפת הסלון לתעשייה שמעליה.",
  },
  index: { en: "05 — The data layer", he: "05 — שכבת הדאטה" },
  label: {
    en: "Spectra turns salon activity into intelligence.",
    he: "Spectra הופכת פעילות סלון לאינטליגנציה.",
  },
} as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

const SideColumn: React.FC<{
  lang: UpdateLang;
  label: Localized;
  labelIcon: LucideIcon;
  outcomes: readonly Step[];
  shift: React.ReactNode;
  shiftLabel: string;
}> = ({ lang, label, labelIcon, outcomes, shift, shiftLabel }) => (
  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 40 }}>
    <ZoneLabel icon={labelIcon}>{text(label, lang)}</ZoneLabel>
    <Rule />
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 30,
      }}
    >
      {outcomes.map((item) => (
        <li
          key={item.label.en}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: CB_INK.ink,
            fontSize: lang === "he" ? 22 : 23,
            fontWeight: 500,
            lineHeight: 1.24,
            letterSpacing: "-0.025em",
          }}
        >
          <GoldNode icon={item.icon} size={42} />
          <span>{text(item.label, lang)}</span>
        </li>
      ))}
    </ul>
    {/* Inherits the page direction so the chain reads in the order it is written. */}
    <p
      aria-label={shiftLabel}
      style={{
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 9,
        color: CB_INK.gold,
        fontSize: lang === "he" ? 21 : 22,
        fontWeight: 500,
        lineHeight: 1.32,
        letterSpacing: "-0.018em",
      }}
    >
      {shift}
    </p>
  </div>
);

/** Points the way the language reads, so the chain never doubles back on itself. */
const Arrow: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <span aria-hidden="true" style={{ opacity: 0.5 }}>
    {lang === "he" ? "←" : "→"}
  </span>
);

export const OperationalDataLayerWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const leftShiftLabel = COPY.leftShift.map((step) => text(step, lang)).join(" → ");
  const rightShiftLabel = `${text(COPY.rightShiftFrom, lang)} → ${text(COPY.rightShiftTo, lang)}`;

  return (
    <WebSlide
      id="web-deck-operational-data-layer"
      label={text(COPY.label, lang)}
      lang={lang}
      tone="ink"
      bleed={
        <InkAtmosphere image={DATA_LAYER_PHOTO} lang={lang} position="50% 52%" brightness={0.62} />
      }
      className="web-deck-operational-data-layer"
    >
      <SkinProvider skin="ink">
      <div style={{ ...slideBase(lang, "ink"), justifyContent: "space-between", gap: 40 }}>
        <div>
          <LayerMark>{text(COPY.index, lang)}</LayerMark>
          <Kicker style={{ marginTop: 30 }}>{text(COPY.eyebrow, lang)}</Kicker>
          <Display lang={lang} style={{ marginTop: 28, maxWidth: 1180 }}>
            {lang === "he" ? (
              <>
                <span dir="ltr">Spectra</span> הופכת פעילות סלון{" "}
              </>
            ) : (
              `${text(COPY.headlineLead, lang)} `
            )}
            <span style={{ color: CB_INK.gold }}>{text(COPY.headlinePunch, lang)}</span>
          </Display>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.16fr) minmax(0, 1fr)",
            gap: 86,
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <SideColumn
            lang={lang}
            label={COPY.leftLabel}
            labelIcon={Store}
            outcomes={COPY.leftOutcomes}
            shiftLabel={leftShiftLabel}
            shift={COPY.leftShift.map((step, index) => (
              <React.Fragment key={step.en}>
                {index > 0 ? <Arrow lang={lang} /> : null}
                <span>{text(step, lang)}</span>
              </React.Fragment>
            ))}
          />

          <CenterPanel style={{ gap: 32, padding: "48px 52px 52px" }}>
            <ZoneLabel icon={Layers} align="center">
              {text(COPY.centerLabel, lang)}
            </ZoneLabel>
            <Body style={{ textAlign: "center" }}>{text(COPY.bridge, lang)}</Body>

            <ol
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              {COPY.flow.map((step, index) => {
                const last = index === COPY.flow.length - 1;
                return (
                  <li
                    key={step.label.en}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
                  >
                    {index > 0 ? (
                      <span aria-hidden="true" style={{ color: "rgba(215,170,88,0.5)", fontSize: 16 }}>
                        ↓
                      </span>
                    ) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <GoldNode icon={step.icon} size={last ? 46 : 38} accent={last} />
                      <p
                        style={{
                          margin: 0,
                          color: last ? CB_INK.gold : CB_INK.ink,
                          fontSize: last ? (lang === "he" ? 26 : 27) : lang === "he" ? 19 : 20,
                          fontWeight: last ? 600 : 500,
                          lineHeight: 1.2,
                          letterSpacing: last ? "-0.032em" : "-0.014em",
                          textAlign: "center",
                        }}
                      >
                        {text(step.label, lang)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <Rule style={{ width: 120 }} />
            <p
              style={{
                margin: 0,
                maxWidth: 540,
                color: CB_INK.ink,
                fontSize: lang === "he" ? 26 : 27,
                fontWeight: 500,
                lineHeight: 1.24,
                letterSpacing: "-0.03em",
                textAlign: "center",
              }}
            >
              {text(COPY.statement, lang)}
            </p>
          </CenterPanel>

          <SideColumn
            lang={lang}
            label={COPY.rightLabel}
            labelIcon={Factory}
            outcomes={COPY.rightOutcomes}
            shiftLabel={rightShiftLabel}
            shift={
              <>
                <span dir="ltr">{text(COPY.rightShiftFrom, lang)}</span>
                <Arrow lang={lang} />
                <span>{text(COPY.rightShiftTo, lang)}</span>
              </>
            }
          />
        </div>
      </div>
      </SkinProvider>
    </WebSlide>
  );
};
