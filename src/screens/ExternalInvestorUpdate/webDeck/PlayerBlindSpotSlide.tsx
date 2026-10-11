import React from "react";
import { CB } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { Body, Display, Kicker, LayerMark, Rule, slideBase } from "./SlideCompositionKit";

export type PlayerBlindSpotSpec = {
  id: string;
  className: string;
  kicker: Localized;
  headlineLead: Localized;
  headlinePunch: Localized;
  support: Localized;
  canSeeLabel: Localized;
  cannotSeeLabel: Localized;
  canSee: readonly Localized[];
  cannotSee: readonly Localized[];
  close: Localized;
  outcomes: readonly Localized[];
  index: Localized;
  label: Localized;
};

const text = (value: Localized, lang: UpdateLang) => value[lang];

const CloseLine: React.FC<{ lang: UpdateLang; close: Localized }> = ({ lang, close }) => {
  if (lang !== "he") return <>{close.en}</>;
  const [before, after] = close.he.split("Spectra");
  if (after === undefined) return <>{close.he}</>;
  return (
    <>
      {before}
      <span dir="ltr">Spectra</span>
      {after}
    </>
  );
};

const LedgerColumn: React.FC<{
  lang: UpdateLang;
  label: Localized;
  rows: readonly Localized[];
  first?: boolean;
}> = ({ lang, label, rows, first }) => (
  <div
    className="deck-ledger"
    style={{
      minWidth: 0,
      paddingInlineStart: first ? 0 : 48,
      borderInlineStart: first ? undefined : `1px solid ${CB.lineStrong}`,
    }}
  >
    <p
      style={{
        margin: 0,
        color: first ? CB.muted : CB.copperDeep,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: lang === "he" ? "0.08em" : "0.16em",
        textTransform: "uppercase",
      }}
    >
      {text(label, lang)}
    </p>
    <ul
      style={{
        margin: "18px 0 0",
        padding: 0,
        listStyle: "none",
      }}
    >
      {rows.map((row, index) => (
        <li
          key={row.en}
          style={{
            paddingBlock: 18,
            borderTop: index === 0 ? `1px solid ${CB.lineStrong}` : undefined,
            borderBottom: `1px solid ${CB.lineStrong}`,
            color: CB.ink,
            fontSize: lang === "he" ? 26 : 28,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.028em",
          }}
        >
          {text(row, lang)}
        </li>
      ))}
    </ul>
  </div>
);

export const PlayerBlindSpotSlide: React.FC<{
  lang: UpdateLang;
  spec: PlayerBlindSpotSpec;
}> = ({ lang, spec }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id={spec.id}
      label={text(spec.label, lang)}
      lang={lang}
      tone="paper"
      className={spec.className}
    >
      <div style={{ ...slideBase(lang), justifyContent: "space-between", gap: 28 }}>
        <header>
          <LayerMark>{text(spec.index, lang)}</LayerMark>
          <Kicker style={{ marginTop: 22 }}>{text(spec.kicker, lang)}</Kicker>
          <Display lang={lang} size="headline" style={{ marginTop: 20, maxWidth: 1180 }}>
            <span style={{ display: "block" }}>{text(spec.headlineLead, lang)}</span>
            <span style={{ display: "block", color: CB.copper }}>{text(spec.headlinePunch, lang)}</span>
          </Display>
          <Body size="lead" style={{ marginTop: 18, maxWidth: 920 }}>
            {text(spec.support, lang)}
          </Body>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 0,
            alignItems: "start",
            paddingBlock: 8,
          }}
        >
          <LedgerColumn lang={lang} label={spec.canSeeLabel} rows={spec.canSee} first />
          <LedgerColumn lang={lang} label={spec.cannotSeeLabel} rows={spec.cannotSee} />
        </div>

        <footer>
          <Rule />
          <p
            style={{
              margin: "22px 0 0",
              color: CB.ink,
              fontSize: hebrew ? 30 : 32,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: hebrew ? "-0.028em" : "-0.032em",
            }}
          >
            <CloseLine lang={lang} close={spec.close} />
          </p>
          <p
            className="deck-pair"
            style={{
              margin: "16px 0 0",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: "10px 0",
              color: CB.muted,
              fontSize: hebrew ? 18 : 17,
              fontWeight: 600,
              letterSpacing: hebrew ? "0.04em" : "0.12em",
              textTransform: "uppercase",
            }}
          >
            {spec.outcomes.map((item, index) => (
              <React.Fragment key={item.en}>
                {index > 0 ? (
                  <span aria-hidden="true" style={{ paddingInline: 16, color: CB.faint }}>
                    ·
                  </span>
                ) : null}
                <span>{text(item, lang)}</span>
              </React.Fragment>
            ))}
          </p>
        </footer>
      </div>
    </WebSlide>
  );
};
