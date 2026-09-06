import React from "react";
import { CB, colorBarSans } from "../colorBarTokens";
import {
  FINAL_COVER_EVIDENCE,
  splitCoverEvidence,
  type Localized,
} from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";

const CORAL = "#B96850";
const COLOR_ROOM = "/investor-vision/hero/salon-color-room.jpg";
const SALON_KPIS = FINAL_COVER_EVIDENCE.kpis.slice(0, 3);

const KICKER = {
  en: "Inside the salon",
  he: "בתוך הסלון",
} as const;

const text = (value: Localized, lang: "en" | "he") => value[lang];

const baseStyle = (lang: "en" | "he"): React.CSSProperties => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  fontFamily: colorBarSans(lang),
  textAlign: "start",
});

const AccentSalonAi: React.FC<{ value: string }> = ({ value }) => (
  <>
    {value.split(/(Salon AI)/).map((part, index) =>
      part === "Salon AI" ? (
        <span key={`${part}-${index}`} dir="ltr" style={{ color: CORAL }}>
          {part}
        </span>
      ) : (
        <React.Fragment key={`copy-${index}`}>{part}</React.Fragment>
      ),
    )}
  </>
);

export const FoundationSalonsWebSlide: React.FC<{ lang: "en" | "he" }> = ({ lang }) => (
  <WebSlide
    id="web-deck-foundation-salons"
    label={text(FINAL_COVER_EVIDENCE.close, lang)}
    lang={lang}
    tone="paper"
    className="web-deck-foundation-salons"
  >
    <div style={{ ...baseStyle(lang), height: "calc(100% - 8px)", justifyContent: "space-between", gap: 40 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 450px",
          alignItems: "start",
          gap: 72,
        }}
      >
        <div>
          <span aria-hidden="true" style={{ display: "block", width: 58, height: 3, background: CORAL }} />
          <p
            style={{
              margin: "16px 0 0",
              color: CORAL,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {KICKER[lang]}
          </p>
          <p
            style={{
              margin: "22px 0 0",
              maxWidth: 1040,
              color: CB.ink,
              fontSize: lang === "he" ? 45 : 47,
              fontWeight: 400,
              lineHeight: 1.24,
              letterSpacing: "-0.03em",
            }}
          >
            {splitCoverEvidence(text(FINAL_COVER_EVIDENCE.opening, lang)).map((part, index) =>
              FINAL_COVER_EVIDENCE.highlights.some((highlight) => highlight === part) ? (
                <span key={`${part}-${index}`} dir="ltr" style={{ color: CORAL }}>
                  {part}
                </span>
              ) : (
                <React.Fragment key={`copy-${index}`}>{part}</React.Fragment>
              ),
            )}
          </p>
        </div>

        <figure
          aria-hidden="true"
          style={{ margin: 0, borderTop: `1px solid ${CB.lineStrong}`, paddingTop: 14 }}
        >
          <img
            src={COLOR_ROOM}
            alt=""
            width={900}
            height={500}
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: 240,
              objectFit: "cover",
              objectPosition: "70% 56%",
              filter: "grayscale(12%)",
            }}
          />
        </figure>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          margin: 0,
          borderTop: `1px solid ${CB.lineStrong}`,
          borderBottom: `1px solid ${CB.lineStrong}`,
        }}
      >
        {SALON_KPIS.map((metric, index) => (
          <div
            key={metric.value}
            style={{
              minWidth: 0,
              minHeight: 220,
              padding: "34px 28px 30px",
              borderInlineStart: index > 0 ? `1px solid ${CB.lineStrong}` : undefined,
            }}
          >
            <dd
              dir="ltr"
              style={{
                margin: 0,
                color: CORAL,
                fontSize: 76,
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: "-0.055em",
              }}
            >
              {metric.value}
            </dd>
            <dt
              style={{
                maxWidth: 290,
                marginTop: 20,
                color: CB.muted,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.48,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
              }}
            >
              {text(metric.label, lang)}
            </dt>
          </div>
        ))}
      </dl>

      <p
        style={{
          width: "100%",
          margin: 0,
          color: CB.ink,
          fontSize: lang === "he" ? 48 : 52,
          fontWeight: 500,
          lineHeight: 1.08,
          letterSpacing: "-0.045em",
        }}
      >
        <AccentSalonAi value={text(FINAL_COVER_EVIDENCE.close, lang)} />
      </p>
    </div>
  </WebSlide>
);
