import React from "react";
import { CANONICAL_BY_ID } from "../canonicalNarrative";
import { CB, colorBarSans } from "../colorBarTokens";
import {
  FINAL_COVER_EVIDENCE,
  FINAL_HERO,
  FINAL_META,
  splitCoverEvidence,
  type Localized,
  type UpdateLang,
} from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { Body, Display, Kicker, Meta, Rule, slideBase } from "./SlideCompositionKit";

type OpeningSlideProps = {
  lang: UpdateLang;
  reducedMotion?: boolean;
};

type FoundationWebSlideProps = OpeningSlideProps & {
  showColorRoomImage?: boolean;
};

const MEDIA = {
  founders: "/team/maor-elad-spectra.jpg",
  colorRoom: "/investor-vision/hero/salon-color-room.jpg",
  colorBar: "/investor/media/color-bar.jpg",
  colorBarComposition: "/investor/media/colorbar-composition.png",
} as const;

const coverAccent: React.CSSProperties = { color: CB.copperDeep };

const COVER_QUESTION = {
  en: (
    <>
      If a car can <span style={coverAccent}>drive itself</span>,
      <br />
      why can’t a salon
      <br />
      <span style={coverAccent}>run itself</span>?
    </>
  ),
  he: (
    <>
      אם מכונית יכולה <span style={coverAccent}>לנהוג בעצמה</span>,
      <br />
      למה שסלון לא יוכל
      <br />
      <span style={coverAccent}>לנהל את עצמו</span>?
    </>
  ),
} as const;

const COVER_SUPPORT: Localized = {
  en: "We made color rooms visible. Now it is time to build the world’s first Salon AI.",
  he: "הפכנו את חדרי הצבע לשקופים. זה הזמן לבנות את ה־Salon AI הראשון בעולם.",
};

const text = (value: Localized, lang: UpdateLang) => value[lang];

const baseStyle = (lang: UpdateLang): React.CSSProperties => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  fontFamily: colorBarSans(lang),
  textAlign: "start",
});

const ChapterLine: React.FC<{
  serial?: string;
  chapter: string;
}> = ({ serial, chapter }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      minHeight: 28,
      color: CB.copperDeep,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.17em",
      textTransform: "uppercase",
    }}
  >
    {serial && <span dir="ltr">{serial}</span>}
    {serial && <span aria-hidden="true" style={{ width: 52, height: 1, background: CB.lineStrong }} />}
    <span dir="ltr">{chapter}</span>
  </div>
);

const AccentSalonAi: React.FC<{ value: string; accent?: string }> = ({
  value,
  accent = CB.copperDeep,
}) => (
  <>
    {value.split(/(Salon AI)/).map((part, index) =>
      part === "Salon AI" ? (
        <span key={`${part}-${index}`} dir="ltr" style={{ color: accent }}>
          {part}
        </span>
      ) : (
        <React.Fragment key={`copy-${index}`}>{part}</React.Fragment>
      ),
    )}
  </>
);

export const CoverWebSlide: React.FC<OpeningSlideProps> = ({ lang }) => (
  <WebSlide
    id="web-deck-cover"
    label={text(FINAL_HERO.title, lang)}
    lang={lang}
    tone="paper"
    className="web-deck-opening-cover"
  >
    <div style={{ ...slideBase(lang), justifyContent: "center" }}>
      <div
        className="deck-split"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, 0.92fr)",
          alignItems: "center",
          gap: 74,
        }}
      >
        <div>
          <Kicker>{text(FINAL_META.edition, lang)}</Kicker>

          <Display
            as="h1"
            lang={lang}
            size="hero"
            style={{ marginTop: 36, maxWidth: lang === "he" ? 820 : 850 }}
          >
            {COVER_QUESTION[lang]}
          </Display>

          <Body size="lead" style={{ marginTop: 38, maxWidth: 720 }}>
            <AccentSalonAi value={COVER_SUPPORT[lang]} />
          </Body>

          <Rule style={{ width: 200, marginTop: 46 }} />

          <Meta style={{ marginTop: 22 }}>
            {text(FINAL_HERO.coverLine, lang)}
            <span aria-hidden="true" style={{ padding: "0 12px" }}>
              ·
            </span>
            {text(FINAL_META.date, lang)}
          </Meta>
        </div>

        <figure style={{ margin: 0 }}>
          <div style={{ position: "relative", height: 1, background: CB.lineStrong }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInlineStart: 0,
                top: 0,
                width: 92,
                height: 1,
                background: CB.copperDeep,
              }}
            />
          </div>
          <img
            src={MEDIA.founders}
            alt={text(FINAL_HERO.founderAlt, lang)}
            width={1800}
            height={1012}
            decoding="async"
            {...{ fetchpriority: "high" }}
            className="deck-cover-photo"
            style={{
              display: "block",
              width: "100%",
              height: 500,
              marginTop: 14,
              objectFit: "cover",
              objectPosition: "50% 50%",
            }}
          />
        </figure>
      </div>
    </div>
  </WebSlide>
);

export const FoundationWebSlide: React.FC<FoundationWebSlideProps> = ({
  lang,
  showColorRoomImage = true,
}) => (
  <WebSlide
    id="web-deck-foundation"
    label={text(FINAL_COVER_EVIDENCE.close, lang)}
    lang={lang}
    tone="paper"
    className="web-deck-foundation"
  >
    <div style={{ ...baseStyle(lang), height: "calc(100% - 8px)", justifyContent: "space-between", gap: 34 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showColorRoomImage ? "minmax(0, 1fr) 430px" : "1fr",
          alignItems: "end",
          gap: 72,
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: 1120,
            color: CB.ink,
            fontSize: lang === "he" ? 45 : 47,
            fontWeight: 400,
            lineHeight: 1.24,
            letterSpacing: "-0.03em",
          }}
        >
          {splitCoverEvidence(text(FINAL_COVER_EVIDENCE.opening, lang)).map((part, index) =>
            FINAL_COVER_EVIDENCE.highlights.some((highlight) => highlight === part) ? (
              <span key={`${part}-${index}`} dir="ltr" style={{ color: CB.copperDeep }}>
                {part}
              </span>
            ) : (
              <React.Fragment key={`copy-${index}`}>{part}</React.Fragment>
            ),
          )}
        </p>

        {showColorRoomImage && (
          <figure
            aria-hidden="true"
            style={{ margin: 0, borderInlineStart: `1px solid ${CB.lineStrong}`, paddingInlineStart: 22 }}
          >
            <img
              src={MEDIA.colorRoom}
              alt=""
              width={900}
              height={500}
              decoding="async"
              style={{
                display: "block",
                width: "100%",
                height: 176,
                objectFit: "cover",
                objectPosition: "70% 56%",
                filter: "grayscale(20%)",
              }}
            />
          </figure>
        )}
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          margin: 0,
          borderTop: `1px solid ${CB.lineStrong}`,
          borderBottom: `1px solid ${CB.lineStrong}`,
        }}
      >
        {FINAL_COVER_EVIDENCE.kpis.map((metric, index) => (
          <div
            key={metric.value}
            style={{
              minWidth: 0,
              minHeight: 264,
              padding: "34px 28px 30px",
              borderInlineStart: index > 0 ? `1px solid ${CB.lineStrong}` : undefined,
            }}
          >
            <dd
              dir="ltr"
              style={{
                margin: 0,
                color: CB.copperDeep,
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
          fontSize: lang === "he" ? 64 : 68,
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


export const WedgeThesisWebSlide: React.FC<OpeningSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.wedge;
  const metric = step.metrics[0];

  return (
    <WebSlide
      id="web-deck-wedge-thesis"
      label={text(step.headline, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-wedge-thesis"
    >
      <div style={{ ...baseStyle(lang), justifyContent: "space-between", gap: 32 }}>
        <ChapterLine serial={step.serial} chapter={step.chapter} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.56fr) minmax(0, 0.44fr)",
            gap: 76,
            alignItems: "stretch",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <h2
                style={{
                  maxWidth: 900,
                  margin: 0,
                  color: CB.ink,
                  fontSize: lang === "he" ? 68 : 72,
                  fontWeight: 600,
                  lineHeight: 1.04,
                  letterSpacing: "-0.052em",
                }}
              >
                {text(step.headline, lang)}
              </h2>
              <p
                style={{
                  maxWidth: 850,
                  margin: "34px 0 0",
                  color: CB.muted,
                  fontSize: 27,
                  lineHeight: 1.48,
                }}
              >
                {text(step.support, lang)}
              </p>
            </div>

            <dl style={{ margin: 0, borderTop: `1px solid ${CB.lineStrong}`, paddingTop: 30 }}>
              <dd
                dir="ltr"
                style={{
                  margin: 0,
                  color: CB.copperDeep,
                  fontSize: 104,
                  fontWeight: 500,
                  lineHeight: 0.92,
                  letterSpacing: "-0.065em",
                }}
              >
                {metric.value}
              </dd>
              <dt style={{ marginTop: 20, color: CB.muted, fontSize: 20, lineHeight: 1.4 }}>
                {text(metric.label, lang)}
              </dt>
            </dl>
          </div>

          <figure
            aria-hidden="true"
            style={{
              display: "grid",
              gridTemplateRows: "1fr 188px",
              gap: 16,
              margin: 0,
              borderInlineStart: `1px solid ${CB.lineStrong}`,
              paddingInlineStart: 22,
              minWidth: 0,
            }}
          >
            <div style={{ minHeight: 0, background: CB.well, padding: 26 }}>
              <img
                src={MEDIA.colorBarComposition}
                alt=""
                width={960}
                height={720}
                decoding="async"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <img
              src={MEDIA.colorBar}
              alt=""
              width={1200}
              height={450}
              decoding="async"
              style={{ display: "block", width: "100%", height: 188, objectFit: "cover", objectPosition: "center" }}
            />
          </figure>
        </div>
      </div>
    </WebSlide>
  );
};

export const WedgeOutcomesWebSlide: React.FC<OpeningSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.wedge;

  return (
    <WebSlide
      id="web-deck-wedge-outcomes"
      label={text(step.headline, lang)}
      lang={lang}
      tone="chalk"
      className="web-deck-wedge-outcomes"
    >
      <div style={{ ...baseStyle(lang), justifyContent: "space-between", gap: 30 }}>
        <ChapterLine chapter={step.chapter} />

        <h2
          style={{
            maxWidth: 1180,
            margin: 0,
            color: CB.ink,
            fontSize: lang === "he" ? 56 : 60,
            fontWeight: 600,
            lineHeight: 1.06,
            letterSpacing: "-0.048em",
          }}
        >
          {text(step.headline, lang)}
        </h2>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            margin: 0,
            borderTop: `1px solid ${CB.lineStrong}`,
            flex: 1,
          }}
        >
          {step.facts.map((fact, index) => (
            <div
              key={fact.term.en}
              style={{
                minWidth: 0,
                padding: index < 2 ? "38px 44px 34px" : "34px 44px 30px",
                borderInlineStart: index % 2 === 1 ? `1px solid ${CB.lineStrong}` : undefined,
                borderBottom: `1px solid ${CB.lineStrong}`,
              }}
            >
              <dt
                style={{
                  maxWidth: 650,
                  color: CB.copperDeep,
                  fontSize: 30,
                  fontWeight: 600,
                  lineHeight: 1.18,
                  letterSpacing: "-0.025em",
                }}
              >
                {text(fact.term, lang)}
              </dt>
              <dd
                style={{
                  maxWidth: 650,
                  margin: "18px 0 0",
                  color: CB.muted,
                  fontSize: 23,
                  lineHeight: 1.45,
                }}
              >
                {text(fact.detail, lang)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </WebSlide>
  );
};
