import React from "react";
import { CB, colorBarSans } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";

const PHOTO = "/investor-vision/hero/salon-color-station.jpg";

const COPY = {
  eyebrow: { en: "Where we started", he: "איפה התחלנו" },
  lead: {
    en: "We didn’t start by building the whole salon.",
    he: "לא התחלנו בבניית הסלון כולו.",
  },
  follow: {
    en: "We started in the hardest place to measure:",
    he: "התחלנו במקום הקשה ביותר למדידה:",
  },
  punch: { en: "The color room.", he: "חדר הצבע." },
  meet: {
    en: "The color room is where product, cost, craft and the client meet.",
    he: "חדר הצבע הוא המקום שבו המוצר, העלות, המלאכה והלקוחה נפגשים.",
  },
  capture: {
    en: "Spectra captured what actually happened during the service — not just what was planned, charged or purchased.",
    he: "Spectra תיעדה את מה שבאמת קרה במהלך השירות — לא רק מה שתוכנן, חויב או נרכש.",
  },
  photoAlt: {
    en: "A real salon color station with tablets, digital scales, and color products on a stainless steel workstation, looking through to the salon floor",
    he: "עמדת צבע אמיתית בסלון: טאבלטים, משקלים דיגיטליים ומוצרי צבע על משטח נירוסטה, עם רצפת הסלון ברקע",
  },
  index: { en: "06 — The color room", he: "06 — חדר הצבע" },
  label: {
    en: "We started in the hardest place to measure: the color room.",
    he: "התחלנו במקום הקשה ביותר למדידה: חדר הצבע.",
  },
} as const;

const MARKS = [
  {
    term: { en: "Client", he: "לקוחה" },
    gloss: { en: "Who received the service", he: "מי שקיבלה את השירות" },
  },
  {
    term: { en: "Professional", he: "מקצועית" },
    gloss: { en: "Who performed it", he: "מי שביצעה אותו" },
  },
  {
    term: { en: "Formula", he: "פורמולה" },
    gloss: { en: "What was mixed", he: "מה שעורבב" },
  },
  {
    term: { en: "Grams", he: "גרמים" },
    gloss: { en: "What was actually used", he: "מה שבאמת היה בשימוש" },
  },
  {
    term: { en: "Cost", he: "עלות" },
    gloss: { en: "What the service really cost", he: "כמה השירות באמת עלה" },
  },
  {
    term: { en: "Inventory", he: "מלאי" },
    gloss: { en: "What left the shelf", he: "מה שיצא מהמדף" },
  },
] as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

export const ColorRoomWedgeWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id="web-deck-color-room-wedge"
      label={text(COPY.label, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-color-room-wedge"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: colorBarSans(lang),
          color: CB.ink,
        }}
      >
        <div
          dir="ltr"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.49fr) minmax(0, 0.51fr)",
            columnGap: 48,
            alignItems: "stretch",
            flex: 1,
            minHeight: 0,
            maxHeight: "100%",
          }}
          className="deck-split"
        >
          <div
            dir={hebrew ? "rtl" : "ltr"}
            style={{
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              paddingBottom: 4,
            }}
          >
            <div>
              <span
                aria-hidden="true"
                style={{ display: "block", width: 58, height: 3, background: CB.copper }}
              />
              <p
                style={{
                  margin: "16px 0 0",
                  color: CB.copperDeep,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {text(COPY.eyebrow, lang)}
              </p>
              <h2
                style={{
                  margin: "26px 0 0",
                  color: CB.ink,
                  fontSize: hebrew ? 33 : 32,
                  fontWeight: 500,
                  lineHeight: 1.16,
                  letterSpacing: hebrew ? "-0.028em" : "-0.04em",
                }}
              >
                <span style={{ display: "block" }}>{text(COPY.lead, lang)}</span>
                <span style={{ display: "block", marginTop: 8 }}>
                  {text(COPY.follow, lang)}
                </span>
              </h2>
              <p
                style={{
                  margin: "20px 0 0",
                  color: CB.copper,
                  fontSize: hebrew ? 58 : 62,
                  fontWeight: 600,
                  lineHeight: 0.96,
                  letterSpacing: hebrew ? "-0.038em" : "-0.05em",
                }}
              >
                {text(COPY.punch, lang)}
              </p>
              <p
                style={{
                  margin: "44px 0 0",
                  maxWidth: hebrew ? 620 : 600,
                  color: CB.ink,
                  fontSize: hebrew ? 24 : 26,
                  fontWeight: 600,
                  lineHeight: 1.28,
                  letterSpacing: hebrew ? "-0.02em" : "-0.026em",
                }}
              >
                {text(COPY.meet, lang)}
              </p>
              <p
                style={{
                  margin: "22px 0 0",
                  maxWidth: hebrew ? 600 : 560,
                  color: CB.muted,
                  fontSize: hebrew ? 16 : 16,
                  fontWeight: 400,
                  lineHeight: 1.42,
                  letterSpacing: hebrew ? "-0.008em" : "-0.01em",
                }}
              >
                {hebrew ? (
                  <>
                    <span dir="ltr">Spectra</span> תיעדה את מה שבאמת קרה במהלך השירות — לא רק מה שתוכנן, חויב או
                    נרכש.
                  </>
                ) : (
                  text(COPY.capture, lang)
                )}
              </p>
            </div>
          </div>

          <figure
            style={{
              margin: 0,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="deck-photo-frame"
              style={{
                position: "relative",
                border: `1px solid ${CB.lineStrong}`,
                padding: 12,
                background: CB.bg,
                flex: "1 1 auto",
                minHeight: 0,
                height: 0,
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <img
                  src={PHOTO}
                  alt={text(COPY.photoAlt, lang)}
                  width={1284}
                  height={1763}
                  decoding="async"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "50% 36%",
                  }}
                />
              </div>
            </div>

            <figcaption
              dir={hebrew ? "rtl" : "ltr"}
              className="deck-marks"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                columnGap: 20,
                margin: 0,
                paddingTop: 18,
                flexShrink: 0,
                borderTop: `1px solid ${CB.lineStrong}`,
              }}
            >
              {MARKS.map((mark) => (
                <p
                  key={mark.term.en}
                  style={{
                    margin: 0,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    textAlign: "start",
                  }}
                >
                  <span
                    style={{
                      color: CB.copperDeep,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {text(mark.term, lang)}
                  </span>
                  <span
                    style={{
                      color: CB.muted,
                      fontSize: 12,
                      fontWeight: 400,
                      lineHeight: 1.35,
                    }}
                  >
                    {text(mark.gloss, lang)}
                  </span>
                </p>
              ))}
            </figcaption>
          </figure>
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 22,
          }}
        >
          <p
            dir="ltr"
            style={{
              margin: 0,
              color: CB.faint,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {text(COPY.index, lang)}
          </p>
        </footer>
      </div>
    </WebSlide>
  );
};
