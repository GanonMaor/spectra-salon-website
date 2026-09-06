import React from "react";
import { CANONICAL_BY_ID } from "../canonicalNarrative";
import { CB, colorBarSans } from "../colorBarTokens";
import { FINAL_RAISE, type Localized, type UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";

type ClosingSlideProps = {
  lang: UpdateLang;
};

const RULE = "rgba(92,72,42,0.22)";
const SOFT_RULE = "rgba(92,72,42,0.12)";

const value = (copy: Localized, lang: UpdateLang) => copy[lang];
const readingEdge = (lang: UpdateLang): React.CSSProperties["textAlign"] =>
  lang === "he" ? "right" : "left";

const typeStyle = (lang: UpdateLang): React.CSSProperties => ({
  fontFamily: colorBarSans(lang),
});

const Eyebrow: React.FC<{ children: React.ReactNode; lang: UpdateLang }> = ({
  children,
  lang,
}) => (
  <p
    style={{
      ...typeStyle(lang),
      color: CB.copperDeep,
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: "0.17em",
      lineHeight: 1.2,
      margin: 0,
      textTransform: "uppercase",
    }}
  >
    {children}
  </p>
);

const Heading: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: number;
  maxWidth?: number;
}> = ({ children, lang, size = 66, maxWidth }) => (
  <h2
    style={{
      ...typeStyle(lang),
      color: CB.ink,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "-0.05em",
      lineHeight: 1.02,
      margin: 0,
      maxWidth,
    }}
  >
    {children}
  </h2>
);

const Support: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  maxWidth?: number;
}> = ({ children, lang, maxWidth = 650 }) => (
  <p
    style={{
      ...typeStyle(lang),
      color: CB.muted,
      fontSize: 24,
      lineHeight: 1.48,
      margin: 0,
      maxWidth,
    }}
  >
    {children}
  </p>
);

const Caption: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  maxWidth?: number;
}> = ({ children, lang, maxWidth = 760 }) => (
  <p
    style={{
      ...typeStyle(lang),
      color: CB.muted,
      fontSize: 16,
      lineHeight: 1.5,
      margin: 0,
      maxWidth,
    }}
  >
    {children}
  </p>
);

const Statement: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  maxWidth?: number;
}> = ({ children, lang, maxWidth = 1180 }) => (
  <div style={{ borderTop: `2px solid ${RULE}`, paddingTop: 24 }}>
    <span
      aria-hidden="true"
      style={{
        background: CB.copper,
        display: "block",
        height: 2,
        marginBottom: 20,
        width: 54,
      }}
    />
    <p
      style={{
        ...typeStyle(lang),
        color: CB.ink,
        fontSize: 34,
        fontWeight: 600,
        letterSpacing: "-0.035em",
        lineHeight: 1.2,
        margin: 0,
        maxWidth,
      }}
    >
      {children}
    </p>
  </div>
);

const SlideHeader: React.FC<{
  chapter: string;
  headline: Localized;
  support: Localized;
  lang: UpdateLang;
  compact?: boolean;
}> = ({ chapter, headline, support, lang, compact = false }) => (
  <div
    style={{
      alignItems: "end",
      display: "grid",
      gap: 72,
      gridTemplateColumns: "1.08fr 0.92fr",
    }}
  >
    <div>
      <Eyebrow lang={lang}>{chapter}</Eyebrow>
      <div style={{ marginTop: 24 }}>
        <Heading lang={lang} size={compact ? 58 : 66}>
          {value(headline, lang)}
        </Heading>
      </div>
    </div>
    <Support lang={lang}>{value(support, lang)}</Support>
  </div>
);

const latinAlignment = (lang: UpdateLang) => ({
  direction: "ltr" as const,
  textAlign: readingEdge(lang),
});

export const ModelWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.model;

  return (
    <WebSlide
      id="web-model"
      label={value(step.headline, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-closing-slide"
    >
      <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
        <SlideHeader
          chapter={step.chapter}
          headline={step.headline}
          support={step.support}
          lang={lang}
        />

        <div
          style={{
            display: "grid",
            flex: 1,
            gap: 70,
            gridTemplateColumns: "1.12fr 0.88fr",
            marginTop: 48,
            minHeight: 0,
          }}
        >
          <div>
            <Eyebrow lang={lang}>{value(step.metricsLabel, lang)}</Eyebrow>
            <ol style={{ borderBottom: `2px solid ${RULE}`, borderTop: `2px solid ${RULE}`, listStyle: "none", margin: "20px 0 0", padding: 0 }}>
              {step.metrics.map((metric, index) => (
                <li
                  key={metric.value}
                  style={{
                    alignItems: "baseline",
                    borderTop: index ? `1px solid ${RULE}` : undefined,
                    display: "grid",
                    gap: 42,
                    gridTemplateColumns: "230px 1fr",
                    padding: "22px 0",
                  }}
                >
                  <strong
                    dir="ltr"
                    style={{
                      color: index === step.metrics.length - 1 ? CB.copperDeep : CB.ink,
                      fontSize: 58,
                      fontWeight: 600,
                      letterSpacing: "-0.05em",
                      lineHeight: 0.95,
                      textAlign: readingEdge(lang),
                    }}
                  >
                    {metric.value}
                  </strong>
                  <span
                    dir="ltr"
                    style={{
                      color: CB.muted,
                      fontSize: 17,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textAlign: readingEdge(lang),
                      textTransform: "uppercase",
                    }}
                  >
                    {value(metric.label, lang)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div style={{ borderInlineStart: `2px solid ${RULE}`, paddingInlineStart: 48 }}>
            <Eyebrow lang={lang}>{value(step.termsLabel, lang)}</Eyebrow>
            <ul style={{ borderBottom: `2px solid ${RULE}`, borderTop: `2px solid ${RULE}`, listStyle: "none", margin: "20px 0 0", padding: 0 }}>
              {step.terms.map((term, index) => (
                <li
                  key={term.en}
                  style={{
                    alignItems: "baseline",
                    borderTop: index ? `1px solid ${RULE}` : undefined,
                    color: CB.ink,
                    display: "flex",
                    fontSize: 21,
                    fontWeight: 600,
                    gap: 18,
                    lineHeight: 1.35,
                    padding: "16px 0",
                  }}
                >
                  <span aria-hidden="true" style={{ color: CB.copper, fontSize: 10 }}>●</span>
                  {value(term, lang)}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 22 }}>
              <Caption lang={lang}>{value(step.caveat, lang)}</Caption>
            </div>
          </div>
        </div>

        <Statement lang={lang}>{value(step.statement, lang)}</Statement>
      </div>
    </WebSlide>
  );
};

export const LandscapeWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.landscape;

  return (
    <WebSlide
      id="web-landscape"
      label={value(step.headline, lang)}
      lang={lang}
      tone="chalk"
      className="web-deck-closing-slide"
    >
      <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
        <SlideHeader
          chapter={step.chapter}
          headline={step.headline}
          support={step.support}
          lang={lang}
          compact
        />

        <div style={{ borderTop: `2px solid ${RULE}`, marginTop: 42 }}>
          {step.groups.map((group) => (
            <div
              key={group.label.en}
              style={{
                alignItems: "center",
                borderBottom: `1px solid ${RULE}`,
                display: "grid",
                gap: 50,
                gridTemplateColumns: "420px 1fr",
                minHeight: 102,
                padding: "18px 0",
              }}
            >
              <div>
                <Eyebrow lang={lang}>{value(group.label, lang)}</Eyebrow>
                {"detail" in group && (
                  <div style={{ marginTop: 8 }}>
                    <Caption lang={lang}>{value(group.detail, lang)}</Caption>
                  </div>
                )}
              </div>
              <p
                dir="ltr"
                style={{
                  ...latinAlignment(lang),
                  color: CB.ink,
                  fontSize: 22,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {group.members.join(" · ")}
              </p>
            </div>
          ))}

          <div
            style={{
              borderBottom: `2px solid ${RULE}`,
              display: "grid",
              gap: 50,
              gridTemplateColumns: "420px 1fr",
              padding: "22px 0",
            }}
          >
            <Eyebrow lang={lang}>Spectra</Eyebrow>
            <div>
              <ol dir="ltr" style={{ ...latinAlignment(lang), listStyle: "none", margin: 0, padding: 0 }}>
                {step.stack.map((layer, index) => (
                  <li
                    key={layer}
                    style={{
                      color: CB.ink,
                      fontSize: 25,
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.35,
                    }}
                  >
                    {index ? "+ " : ""}{layer}
                  </li>
                ))}
              </ol>
              <p style={{ color: CB.muted, fontSize: 19, lineHeight: 1.45, margin: "14px 0 0", maxWidth: 980 }}>
                {value(step.note, lang)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 22 }}>
          <Statement lang={lang}>{value(step.statement, lang)}</Statement>
          <div style={{ marginTop: 12 }}>
            <Caption lang={lang} maxWidth={1120}>
              <span dir="ltr">{step.sources}</span>
            </Caption>
          </div>
        </div>
      </div>
    </WebSlide>
  );
};

const founderMedia = [
  { src: "/team/maor-ganon.jpg", position: "50% 16%" },
  { src: "/team/elad-gottlieb.jpg", position: "50% 14%" },
] as const;

export const TeamFoundersWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.team;
  const founders = step.facts.slice(0, 2);

  return (
    <WebSlide
      id="web-team-founders"
      label={value(step.headline, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-closing-slide"
    >
      <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
        <SlideHeader
          chapter={step.chapter}
          headline={step.headline}
          support={step.support}
          lang={lang}
          compact
        />

        <ol
          style={{
            borderBottom: `2px solid ${RULE}`,
            borderTop: `2px solid ${RULE}`,
            display: "grid",
            flex: 1,
            gap: 60,
            gridTemplateColumns: "1fr 1fr",
            listStyle: "none",
            margin: "42px 0 0",
            minHeight: 0,
            padding: "28px 0",
          }}
        >
          {founders.map((person, index) => {
            const name = value(person.term, lang);
            return (
              <li
                key={person.serial}
                style={{
                  borderInlineStart: index ? `1px solid ${RULE}` : undefined,
                  display: "grid",
                  gap: 34,
                  gridTemplateColumns: "280px 1fr",
                  minWidth: 0,
                  paddingInlineStart: index ? 46 : 0,
                }}
              >
                <img
                  src={founderMedia[index].src}
                  alt={lang === "he" ? `דיוקן של ${name}, ${person.meta}` : `Portrait of ${name}, ${person.meta}`}
                  width={280}
                  height={350}
                  style={{
                    alignSelf: "center",
                    height: 350,
                    objectFit: "cover",
                    objectPosition: founderMedia[index].position,
                    width: 280,
                  }}
                />
                <div style={{ alignSelf: "center" }}>
                  <span dir="ltr" style={{ color: CB.copperDeep, fontSize: 15, fontWeight: 800, letterSpacing: "0.14em" }}>
                    {person.serial}
                  </span>
                  <h3 style={{ color: CB.ink, fontSize: 42, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: "18px 0 0" }}>
                    {name}
                  </h3>
                  <p
                    dir="ltr"
                    style={{
                      ...latinAlignment(lang),
                      color: CB.copperDeep,
                      fontSize: 15,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      lineHeight: 1.4,
                      margin: "16px 0 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {person.meta}
                  </p>
                  <p style={{ color: CB.muted, fontSize: 21, lineHeight: 1.5, margin: "22px 0 0" }}>
                    {value(person.detail, lang)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </WebSlide>
  );
};

export const TeamNetworkWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.team;
  const team = step.facts.slice(2);

  return (
    <WebSlide
      id="web-team-network"
      label={value(step.statement, lang)}
      lang={lang}
      tone="warm"
      className="web-deck-closing-slide"
    >
      <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
        <Eyebrow lang={lang}>{step.chapter}</Eyebrow>

        <ol style={{ borderTop: `2px solid ${RULE}`, listStyle: "none", margin: "30px 0 0", padding: 0 }}>
          {team.map((person) => (
            <li
              key={person.serial}
              style={{
                alignItems: "center",
                borderBottom: `1px solid ${RULE}`,
                display: "grid",
                gap: 44,
                gridTemplateColumns: "54px 330px 380px 1fr",
                minHeight: 154,
              }}
            >
              <span dir="ltr" style={{ color: CB.copperDeep, fontSize: 15, fontWeight: 800, letterSpacing: "0.14em" }}>
                {person.serial}
              </span>
              <h3 style={{ color: CB.ink, fontSize: 38, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>
                {value(person.term, lang)}
              </h3>
              <p
                dir="ltr"
                style={{
                  ...latinAlignment(lang),
                  color: CB.copperDeep,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  lineHeight: 1.4,
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {person.meta}
              </p>
              <p style={{ color: CB.muted, fontSize: 22, lineHeight: 1.45, margin: 0 }}>
                {value(person.detail, lang)}
              </p>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: "auto" }}>
          <Statement lang={lang} maxWidth={1320}>{value(step.statement, lang)}</Statement>
        </div>
      </div>
    </WebSlide>
  );
};

const allocationRule = [
  CB.copper,
  "rgba(163,125,56,0.70)",
  "rgba(163,125,56,0.45)",
  "rgba(163,125,56,0.22)",
] as const;

export const RaiseWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => (
  <WebSlide
    id="web-raise"
    label={value(FINAL_RAISE.title, lang)}
    lang={lang}
    tone="paper"
    className="web-deck-closing-slide"
  >
    <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
      <Eyebrow lang={lang}>{value(FINAL_RAISE.kicker, lang)}</Eyebrow>
      <div
        style={{
          alignItems: "end",
          display: "grid",
          gap: 68,
          gridTemplateColumns: "420px 1fr",
          marginTop: 24,
        }}
      >
        <p
          dir="ltr"
          style={{
            color: CB.ink,
            fontSize: 126,
            fontWeight: 600,
            letterSpacing: "-0.06em",
            lineHeight: 0.82,
            margin: 0,
            textAlign: readingEdge(lang),
          }}
        >
          {FINAL_RAISE.amount.en}
        </p>
        <div>
          <Heading lang={lang} size={60}>{value(FINAL_RAISE.title, lang)}</Heading>
          <div style={{ marginTop: 20 }}>
            <Support lang={lang} maxWidth={980}>{value(FINAL_RAISE.body, lang)}</Support>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <Eyebrow lang={lang}>{value(FINAL_RAISE.useLabel, lang)}</Eyebrow>
        <div
          style={{
            borderBottom: `2px solid ${RULE}`,
            borderTop: `2px solid ${RULE}`,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginTop: 18,
          }}
        >
          {FINAL_RAISE.allocation.map((item, index) => (
            <div
              key={item.title.en}
              style={{
                borderInlineStart: index ? `1px solid ${RULE}` : undefined,
                minHeight: 210,
                padding: "24px 28px",
                position: "relative",
              }}
            >
              <span aria-hidden="true" style={{ background: allocationRule[index], height: 4, insetInline: 0, position: "absolute", top: 0 }} />
              <p dir="ltr" style={{ color: allocationRule[index], fontSize: 42, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, margin: 0, textAlign: readingEdge(lang) }}>
                {item.pct}
              </p>
              <h3 style={{ color: CB.ink, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "18px 0 0" }}>
                {value(item.title, lang)}
              </h3>
              <p style={{ color: CB.muted, fontSize: 18, lineHeight: 1.45, margin: "12px 0 0" }}>
                {value(item.body, lang)}
              </p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Caption lang={lang}>{value(FINAL_RAISE.allocationCaveat, lang)}</Caption>
        </div>
      </div>

      <div
        style={{
          alignItems: "baseline",
          borderBottom: `1px solid ${SOFT_RULE}`,
          borderTop: `1px solid ${SOFT_RULE}`,
          display: "grid",
          gap: 50,
          gridTemplateColumns: "390px 1fr",
          marginTop: "auto",
          padding: "20px 0",
        }}
      >
        <Eyebrow lang={lang}>{value(FINAL_RAISE.milestonesLabel, lang)}</Eyebrow>
        <p style={{ color: CB.ink, fontSize: 19, fontWeight: 600, lineHeight: 1.45, margin: 0 }}>
          {FINAL_RAISE.milestones.map((item) => value(item, lang)).join(" · ")}
        </p>
      </div>
    </div>
  </WebSlide>
);

export const OptionalityWebSlide: React.FC<ClosingSlideProps> = ({ lang }) => {
  const step = CANONICAL_BY_ID.optionality;

  return (
    <WebSlide
      id="web-optionality"
      label={value(step.headline, lang)}
      lang={lang}
      tone="chalk"
      className="web-deck-closing-slide"
    >
      <div style={{ ...typeStyle(lang), display: "flex", flexDirection: "column", height: "100%" }}>
        <SlideHeader
          chapter={step.chapter}
          headline={step.headline}
          support={step.support}
          lang={lang}
          compact
        />

        <div style={{ borderTop: `2px solid ${RULE}`, marginTop: 40 }}>
          {step.groups.map((route) => (
            <div
              key={route.serial}
              style={{
                alignItems: "center",
                borderBottom: `1px solid ${RULE}`,
                display: "grid",
                gap: 36,
                gridTemplateColumns: "70px 350px 390px 1fr",
                minHeight: 118,
                padding: "16px 0",
              }}
            >
              <span dir="ltr" style={{ color: CB.copperDeep, fontSize: 15, fontWeight: 800, letterSpacing: "0.14em" }}>
                {route.serial}
              </span>
              <h3 style={{ color: CB.ink, fontSize: 27, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.15, margin: 0 }}>
                {value(route.label, lang)}
              </h3>
              <p style={{ color: CB.muted, fontSize: 19, lineHeight: 1.4, margin: 0 }}>
                {value(route.detail, lang)}
              </p>
              <p
                dir="ltr"
                style={{
                  ...latinAlignment(lang),
                  color: CB.ink,
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {route.members.join(" · ")}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <Statement lang={lang} maxWidth={1420}>{value(step.statement, lang)}</Statement>
          <div style={{ marginTop: 14 }}>
            <Caption lang={lang}>{value(step.caveat, lang)}</Caption>
          </div>
        </div>
      </div>
    </WebSlide>
  );
};
