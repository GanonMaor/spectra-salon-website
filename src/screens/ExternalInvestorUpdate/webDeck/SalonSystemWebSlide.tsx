import React from "react";
import { CB_INK } from "../colorBarTokens";
import { FINAL_SALON_AI, type Localized, type UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { Body, Display, Kicker, LayerMark, Rule, SkinProvider, slideBase } from "./SlideCompositionKit";

const COPY = {
  eyebrow: { en: "From color to the salon", he: "מצבע לסלון" },
  headlineLead: {
    en: "What happens when the same operational context",
    he: "מה קורה כשאותו הקשר תפעולי",
  },
  headlinePunch: {
    en: "expands across the entire salon?",
    he: "מתרחב לכל הסלון?",
  },
  support: {
    en: "The color room was the entry point. The same context can hold the rest of the salon.",
    he: "חדר הצבע היה נקודת הכניסה. אותו הקשר יכול להחזיק את שאר הסלון.",
  },
  tracks: [
    {
      label: { en: "Inside the salon", he: "בתוך הסלון" },
      steps: [
        { en: "Color data", he: "דאטה צבע" },
        { en: "Full salon context", he: "הקשר סלון מלא" },
        { en: "Salon AI", he: "Salon AI" },
      ],
      close: { en: "The salon’s intelligence layer", he: "המוח של הסלון" },
    },
    {
      label: { en: "Across salons", he: "בין סלונים" },
      steps: [
        { en: "Connected salons", he: "סלונים מחוברים" },
        { en: "Industry data layer", he: "שכבת דאטה תעשייתית" },
      ],
      close: {
        en: "What the industry can finally see",
        he: "מה שהתעשייה סוף סוף יכולה לראות",
      },
    },
  ],
  thesis: {
    en: "The salon gets a brain. The industry gets a data layer.",
    he: "הסלון מקבל מוח. התעשייה מקבלת שכבת דאטה.",
  },
  index: { en: "10 — The system", he: "10 — המערכת" },
  label: {
    en: "What happens when the same operational context expands across the entire salon?",
    he: "מה קורה כשאותו הקשר תפעולי מתרחב לכל הסלון?",
  },
} as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

const Track: React.FC<{
  track: (typeof COPY.tracks)[number];
  lang: UpdateLang;
  hebrew: boolean;
}> = ({ track, lang, hebrew }) => (
  <div>
    <p
      style={{
        margin: 0,
        color: CB_INK.gold,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      {text(track.label, lang)}
    </p>
    <ol
      style={{
        margin: "22px 0 0",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {track.steps.map((step, index) => {
        const last = index === track.steps.length - 1;
        return (
          <li key={step.en} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {index > 0 ? (
              <span aria-hidden="true" style={{ color: "rgba(215,170,88,0.45)", fontSize: 15 }}>
                ↓
              </span>
            ) : null}
            <p
              style={{
                margin: 0,
                color: last ? CB_INK.gold : CB_INK.ink,
                fontSize: last ? (hebrew ? 32 : 34) : hebrew ? 22 : 23,
                fontWeight: last ? 600 : 400,
                lineHeight: 1.2,
                letterSpacing: last ? "-0.032em" : "-0.018em",
              }}
            >
              {step.en === "Salon AI" ? <span dir="ltr">{text(step, lang)}</span> : text(step, lang)}
            </p>
          </li>
        );
      })}
    </ol>
    <p
      style={{
        margin: "18px 0 0",
        color: CB_INK.muted,
        fontSize: hebrew ? 20 : 21,
        fontWeight: 400,
        lineHeight: 1.35,
        letterSpacing: "-0.014em",
      }}
    >
      {text(track.close, lang)}
    </p>
  </div>
);

export const SalonSystemWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id="web-deck-salon-system"
      label={text(COPY.label, lang)}
      lang={lang}
      tone="ink"
      className="web-deck-salon-system"
    >
      <SkinProvider skin="ink">
        <div style={{ ...slideBase(lang, "ink"), justifyContent: "space-between", gap: 28 }}>
          <div>
            <LayerMark>{text(COPY.index, lang)}</LayerMark>
            <Kicker style={{ marginTop: 22 }}>{text(COPY.eyebrow, lang)}</Kicker>
            <Display lang={lang} size="statement" style={{ marginTop: 18, maxWidth: 1280 }}>
              {text(COPY.headlineLead, lang)}{" "}
              <span style={{ color: CB_INK.gold }}>{text(COPY.headlinePunch, lang)}</span>
            </Display>
            <Body size="lead" style={{ marginTop: 16, maxWidth: 980 }}>
              {text(COPY.support, lang)}
            </Body>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 72,
              alignItems: "start",
              paddingBlock: 8,
            }}
          >
            {COPY.tracks.map((track, index) => (
              <div
                key={track.label.en}
                className="deck-track"
                style={{
                  paddingInlineStart: index === 0 ? 0 : 36,
                  borderInlineStart: index === 0 ? undefined : `1px solid ${CB_INK.lineStrong}`,
                }}
              >
                <Track track={track} lang={lang} hebrew={hebrew} />
              </div>
            ))}
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: CB_INK.faint,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: hebrew ? "0.06em" : "0.14em",
                textTransform: "uppercase",
              }}
            >
              {FINAL_SALON_AI.contextTerms.map((term) => text(term, lang)).join("  ·  ")}
            </p>
            <Rule style={{ marginTop: 20 }} />
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: 1280,
                color: CB_INK.ink,
                fontSize: hebrew ? 28 : 30,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: hebrew ? "-0.028em" : "-0.032em",
              }}
            >
              {text(COPY.thesis, lang)}
            </p>
          </div>
        </div>
      </SkinProvider>
    </WebSlide>
  );
};
