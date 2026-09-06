import React from "react";
import { Activity, LineChart, Repeat2 } from "lucide-react";
import { CB } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { Body, Display, Kicker, LayerMark, Rule, slideBase } from "./SlideCompositionKit";

const COPY = {
  eyebrow: { en: "Industry validation", he: "אימות תעשייתי" },
  headline: {
    en: "The industry is already paying for the data.",
    he: "התעשייה כבר משלמת על הדאטה.",
  },
  support: {
    en: "L’Oréal Israel paid ₪24K a year for Spectra’s operational data across its salon customers in Israel.",
    he: "L’Oréal ישראל שילמה ₪24K בשנה על הדאטה התפעולי של Spectra מלקוחות הסלון שלה בישראל.",
  },
  insights: [
    {
      term: { en: "Consumption", he: "צריכה" },
      detail: { en: "What salons actually use", he: "מה שהסלונים באמת צורכים" },
      icon: Activity,
    },
    {
      term: { en: "Adoption", he: "אימוץ" },
      detail: { en: "Which products and behaviors stick", he: "אילו מוצרים והתנהגויות נשארים" },
      icon: Repeat2,
    },
    {
      term: { en: "Demand signals", he: "אותות ביקוש" },
      detail: { en: "What is changing across salons", he: "מה משתנה בין סלונים" },
      icon: LineChart,
    },
  ],
  brandOver: "L’ORÉAL",
  brandUnder: { en: "Israel", he: "ישראל" },
  program: { en: "₪24K annual data program", he: "תוכנית דאטה שנתית · ₪24K" },
  amount: "₪24K",
  scope: {
    en: "Operational data across L’Oréal salon customers in Israel",
    he: "דאטה תפעולי מלקוחות הסלון של L’Oréal בישראל",
  },
  flow: [
    { en: "Real product consumption", he: "צריכת מוצר אמיתית" },
    { en: "Usage by service", he: "שימוש לפי שירות" },
    { en: "Adoption & demand signals", he: "אימוץ ואותות ביקוש" },
  ],
  thesis: {
    en: "For brands, the value is not what was sold. It is what was actually used.",
    he: "עבור מותגים, הערך אינו במה שנמכר. הוא במה שבאמת היה בשימוש.",
  },
  index: { en: "09 — Industry validation", he: "09 — אימות תעשייתי" },
} as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

const Amount: React.FC = () => (
  <span dir="ltr" style={{ display: "inline-block", unicodeBidi: "isolate" }}>
    {COPY.amount}
  </span>
);

export const IndustryValidationWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id="web-deck-industry-validation"
      label={text(COPY.headline, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-industry-validation"
    >
      <div style={{ ...slideBase(lang), justifyContent: "space-between", gap: 24 }}>
        <div>
          <LayerMark>{text(COPY.index, lang)}</LayerMark>
          <Kicker style={{ marginTop: 22 }}>{text(COPY.eyebrow, lang)}</Kicker>
          <Display lang={lang} size="statement" style={{ marginTop: 18, maxWidth: 1180 }}>
            {text(COPY.headline, lang)}
          </Display>
          <Body size="lead" style={{ marginTop: 16, maxWidth: 1040 }}>
            {lang === "he" ? (
              <>
                <span dir="ltr">L’Oréal</span> ישראל שילמה <Amount /> בשנה על הדאטה התפעולי של{" "}
                <span dir="ltr">Spectra</span> מלקוחות הסלון שלה בישראל.
              </>
            ) : (
              text(COPY.support, lang)
            )}
          </Body>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
            gap: 72,
            alignItems: "start",
          }}
        >
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {COPY.insights.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.term.en}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto minmax(0, 1fr)",
                    columnGap: 22,
                    alignItems: "start",
                    paddingBlock: 24,
                    borderTop: index === 0 ? `1px solid ${CB.lineStrong}` : undefined,
                    borderBottom: `1px solid ${CB.lineStrong}`,
                  }}
                >
                  <Icon
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.5}
                    style={{ marginTop: 4, color: CB.copperDeep }}
                  />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: CB.ink,
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {text(item.term, lang)}
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: CB.muted,
                        fontSize: hebrew ? 22 : 23,
                        fontWeight: 400,
                        lineHeight: 1.3,
                        letterSpacing: "-0.018em",
                      }}
                    >
                      {text(item.detail, lang)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: 36,
              paddingBlock: 24,
              paddingInlineStart: 36,
              borderInlineStart: `1px solid ${CB.lineStrong}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
              <p
                className="deck-keep-nowrap"
                style={{
                  margin: 0,
                  color: CB.ink,
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                }}
              >
                <span dir="ltr">{COPY.brandOver}</span>
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  color: CB.copperDeep,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {text(COPY.brandUnder, lang)}
              </p>
              <p
                style={{
                  margin: "18px 0 0",
                  color: CB.ink,
                  fontSize: hebrew ? 26 : 28,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                }}
              >
                {lang === "he" ? (
                  <>
                    תוכנית דאטה שנתית · <Amount />
                  </>
                ) : (
                  text(COPY.program, lang)
                )}
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  color: CB.muted,
                  fontSize: hebrew ? 22 : 23,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  letterSpacing: "-0.018em",
                }}
              >
                {text(COPY.scope, lang)}
              </p>
            </div>

            <div>
              <Rule />
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
                {COPY.flow.map((step, index) => {
                  const last = index === COPY.flow.length - 1;
                  return (
                    <li
                      key={step.en}
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    >
                      {index > 0 ? (
                        <span aria-hidden="true" style={{ color: CB.faint, fontSize: 15 }}>
                          ↓
                        </span>
                      ) : null}
                      <p
                        style={{
                          margin: 0,
                          color: last ? CB.copperDeep : CB.muted,
                          fontSize: hebrew ? 22 : 23,
                          fontWeight: last ? 700 : 400,
                          lineHeight: 1.3,
                          letterSpacing: "-0.018em",
                        }}
                      >
                        {text(step, lang)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>

        <div>
          <Rule />
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: 1280,
              color: CB.ink,
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
    </WebSlide>
  );
};
