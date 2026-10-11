/**
 * 12-slide short deck. Editorial compositions only.
 * Does not alter the 19-slide Founder Story decks.
 */
import React from "react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { displayFamily } from "../ExternalInvestorUpdate/EditorialPrimitives";
import {
  Hair,
  P,
  PresentationSlide,
  SLIDE,
  SlideBody,
  SlideCaption,
  SlideDateline,
  SlideFigure,
  SlideFine,
  SlideKicker,
  SlideTitle,
  TYPE,
} from "../ExternalInvestorUpdate/PresentationSlide";
import {
  SHORT_CLOSE,
  SHORT_COVER,
  SHORT_CYCLE,
  SHORT_INDUSTRY,
  SHORT_MARKET,
  SHORT_MOAT,
  SHORT_MODEL,
  SHORT_ORIGIN,
  SHORT_PLATFORM,
  SHORT_PROOF,
  SHORT_SOLUTION,
  SHORT_TEAM,
} from "./shortStoryCopy";
import { SHORT_DECK_VARIANTS, type ShortDeckVariant, type ShortDeckVariantId } from "./shortStoryVariants";

export const SHORT_STORY_TOTAL = 12;
const LANG = "en" as const;

export const ShortDeckVariantContext = React.createContext<ShortDeckVariant>(SHORT_DECK_VARIANTS.september);
const useShortVariant = () => React.useContext(ShortDeckVariantContext);

const MEDIA = {
  founders: "/team/maor-elad-spectra.jpg",
  maorSalon: "/investor/media/maor-client-salon-crop.jpg",
  bowl: "/step 4 squiz the color.jpeg",
  salon: "/investor/media/adoption-proof/04-color-bar.jpg",
  mix: "/investor/media/adoption-proof/02-mix-interface.jpg",
  owner: "/investor/media/owner-app/01-home.png",
  team: "/investor/media/owner-app/06-business-team.png",
  client: "/investor/media/client-app-two-phones.png",
  maor: "/team/maor-ganon.jpg",
  elad: "/team/elad-gottlieb.jpg",
} as const;

const WORKFLOW = [
  { src: "/stap 1 chack in.jpeg", position: "50% 42%" },
  { src: "/step 3 scan tube.jpeg", position: "52% 36%" },
  { src: "/step 4 squiz the color.jpeg", position: "50% 38%" },
  { src: "/investor/media/colorbar-composition.png", position: "50% 40%" },
  { src: "/step_5.jpg", position: "50% 0%" },
] as const;

const ADOPTION_REEL = [
  { src: "/customers/summer.jpg", position: "50% 22%" },
  { src: "/investor/media/adoption-proof/02-mix-interface.jpg", position: "50% 40%" },
  { src: "/customers/kendall.jpg", position: "50% 18%" },
  { src: "/investor/media/adoption-proof/03-materials-measured.jpg", position: "50% 45%" },
  { src: "/customers/serina.jpg", position: "50% 20%" },
  { src: "/investor/media/adoption-proof/04-color-bar.jpg", position: "45% 22%" },
] as const;

const Article: React.FC<{ lines: readonly string[]; dark?: boolean; gap?: number; style?: React.CSSProperties }> = ({
  lines,
  dark = false,
  gap = 14,
  style,
}) => (
  <div style={style}>
    {lines.map((line, index) => (
      <SlideBody key={`${index}-${line}`} dark={dark} style={{ marginTop: index === 0 ? 0 : gap }}>
        {line}
      </SlideBody>
    ))}
  </div>
);

const ArticleColumns: React.FC<{ lines: readonly string[]; dark?: boolean; gap?: number; columns?: number }> = ({
  lines,
  dark = false,
  gap = 11,
  columns = 2,
}) => (
  <div style={{ columnCount: columns, columnGap: 40 }}>
    {lines.map((line) => (
      <SlideBody key={line} dark={dark} style={{ marginTop: 0, marginBottom: gap, breakInside: "avoid" }}>
        {line}
      </SlideBody>
    ))}
  </div>
);

const Quote: React.FC<{ children: React.ReactNode; dark?: boolean; offset?: boolean }> = ({
  children,
  dark = false,
  offset = true,
}) => (
  <figure style={{ marginInlineStart: offset ? "18%" : 0 }}>
    <Hair dark={dark} strong />
    <blockquote style={{ paddingBlock: 8 }}>
      <SlideTitle lang={LANG} size="sub" italic accent dark={dark} style={{ maxWidth: "30ch" }}>
        {children}
      </SlideTitle>
    </blockquote>
    <Hair dark={dark} />
  </figure>
);

/* ----------------------------------------------------------------- 01 Cover */

const CoverSlide: React.FC = () => {
  const variant = useShortVariant();
  return (
    <PresentationSlide index={1} total={SHORT_STORY_TOTAL} chapter="Founder story" lang={LANG} tone="ink" align="between">
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          <SalonAiLockup tone="ink" size="cover" reducedMotion />
          <p
            style={{
              fontSize: TYPE.kicker,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(251,246,239,0.48)",
            }}
          >
            {variant.date}
          </p>
        </div>
        <Hair dark strong style={{ marginTop: 20 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.54fr 0.46fr", gap: 84, alignItems: "center" }}>
        <div>
          <SlideKicker dark>Maor Ganon · Founder &amp; CEO</SlideKicker>
          <SlideTitle lang={LANG} size="feature" dark style={{ marginTop: 22, maxWidth: "13ch", fontSize: 82, lineHeight: 1.06 }}>
            <span style={{ display: "block" }}>{SHORT_ORIGIN.titleA}</span>
            <span style={{ display: "block", marginTop: 12, color: P.accentDark }}>{SHORT_ORIGIN.titleB}</span>
          </SlideTitle>
          <SlideCaption dark style={{ marginTop: 30, maxWidth: "48ch", fontSize: 19, lineHeight: 1.55 }}>
            {SHORT_ORIGIN.body[0]}
          </SlideCaption>
        </div>
        <figure style={{ position: "relative", height: 590, overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)" }}>
          <img
            src={MEDIA.maorSalon}
            alt="Maor Ganon working with a client in his salon"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0",
              padding: "68px 28px 24px",
              background: "linear-gradient(180deg, transparent, rgba(9,6,4,0.82))",
            }}
          >
            <SlideCaption dark>Inside the salon, before Spectra.</SlideCaption>
          </div>
        </figure>
      </div>

      <div>
        <Hair dark />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40, marginTop: 20 }}>
          <SlideTitle lang={LANG} size="sub" accent dark>
            {SHORT_ORIGIN.pull}
          </SlideTitle>
          <SlideCaption dark style={{ maxWidth: "38ch", textAlign: "right" }}>
            This is the founder story behind Spectra.
          </SlideCaption>
        </div>
      </div>
    </PresentationSlide>
  );
};

/* --------------------------------------------------------------- 02 Origin */

const OriginSlide: React.FC = () => (
  <PresentationSlide index={2} total={SHORT_STORY_TOTAL} chapter="The blind spot" lang={LANG} tone="paper" align="between">
    <div>
      <SlideKicker>{SHORT_ORIGIN.kicker}</SlideKicker>
      <SlideTitle lang={LANG} size="feature" style={{ marginTop: 16, maxWidth: "14ch" }}>
        One extra bowl did not look important.
      </SlideTitle>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "0.46fr 0.54fr", gap: 72, alignItems: "stretch" }}>
      <figure style={{ position: "relative", height: 470, overflow: "hidden", border: "1px solid rgba(43,34,27,0.12)" }}>
        <img
          src={MEDIA.bowl}
          alt={SHORT_ORIGIN.photoAlt}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 40%" }}
        />
        <div style={{ position: "absolute", left: 22, bottom: 20, right: 22, padding: "18px 20px", background: "rgba(23,17,13,0.88)" }}>
          <SlideCaption dark>{SHORT_ORIGIN.body[3]}</SlideCaption>
        </div>
      </figure>

      <div style={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", borderTop: `1px solid ${P.accent}` }}>
        {[
          { label: "Visible", text: SHORT_ORIGIN.body[6] },
          { label: "Visible", text: SHORT_ORIGIN.body[7] },
          { label: "The blind spot", text: SHORT_ORIGIN.body[8], accent: true },
        ].map((item) => (
          <div
            key={item.text}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr",
              gap: 28,
              alignItems: "center",
              borderBottom: "1px solid rgba(43,34,27,0.14)",
            }}
          >
            <SlideKicker style={item.accent ? { color: P.accentDeep } : undefined}>{item.label}</SlideKicker>
            <SlideTitle lang={LANG} size="sub" accent={item.accent} italic={item.accent} style={{ maxWidth: "24ch" }}>
              {item.text}
            </SlideTitle>
          </div>
        ))}
      </div>
    </div>

    <SlideCaption style={{ maxWidth: "76ch", fontSize: 18 }}>
      {SHORT_ORIGIN.body[1]} {SHORT_ORIGIN.body[2]} {SHORT_ORIGIN.body[5]}
    </SlideCaption>
  </PresentationSlide>
);

/* ------------------------------------------------------------- 03 Solution */

const SolutionSlide: React.FC = () => (
  <PresentationSlide
    index={3}
    total={SHORT_STORY_TOTAL}
    chapter={SHORT_SOLUTION.kicker}
    lang={LANG}
    tone="ink"
    bleed={{
      image: MEDIA.salon,
      overlay: "linear-gradient(105deg,rgba(9,6,4,0.97),rgba(9,6,4,0.92))",
      opacity: 0.1,
    }}
    align="between"
  >
    <div>
      <SlideKicker dark>{SHORT_SOLUTION.kicker}</SlideKicker>
      <SlideTitle lang={LANG} size="feature" dark style={{ marginTop: 12, maxWidth: "18ch" }}>
        <span style={{ display: "block" }}>{SHORT_SOLUTION.titleA}</span>
        <span style={{ display: "block" }}>{SHORT_SOLUTION.titleB}</span>
      </SlideTitle>
      <SlideBody dark style={{ marginTop: 20, maxWidth: "56ch", fontSize: 22 }}>
        {SHORT_SOLUTION.body[0]} {SHORT_SOLUTION.body[5]} {SHORT_SOLUTION.body[6]}
      </SlideBody>
    </div>

    <figure>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        {WORKFLOW.map((frame) => (
          <div key={frame.src} style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", height: 146 }}>
            <img
              src={frame.src}
              alt=""
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: frame.position }}
            />
          </div>
        ))}
      </div>
      <SlideCaption dark style={{ marginTop: 12 }}>
        {SHORT_SOLUTION.figureCaption}
      </SlideCaption>
    </figure>

    <Quote dark offset={false}>
      {SHORT_SOLUTION.pull.split("\n").map((line) => (
        <span key={line} style={{ display: "block" }}>
          {line}
        </span>
      ))}
    </Quote>
  </PresentationSlide>
);

/* ---------------------------------------------------------------- 04 Cycle */

const CycleSlide: React.FC = () => (
  <PresentationSlide index={6} total={SHORT_STORY_TOTAL} chapter={SHORT_CYCLE.kicker} lang={LANG} tone="warm" align="start">
    <SlideKicker>{SHORT_CYCLE.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="feature" style={{ marginTop: 12, maxWidth: "16ch" }}>
      {SHORT_CYCLE.title}
    </SlideTitle>

    <SlideBody style={{ marginTop: 22, maxWidth: "72ch", fontSize: 22 }}>
      {SHORT_CYCLE.body[0]} {SHORT_CYCLE.body[1]} {SHORT_CYCLE.body[10]}
    </SlideBody>

    <figure style={{ marginTop: 28 }}>
      <div dir="ltr" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        {SHORT_CYCLE.stages.map((stage, index) => (
          <React.Fragment key={stage.name}>
            {index > 0 ? (
              <span aria-hidden="true" style={{ color: stage.busy ? "rgba(43,34,27,0.22)" : P.accent, fontSize: 22 }}>
                →
              </span>
            ) : null}
            <span
              style={{
                fontFamily: displayFamily(LANG),
                fontSize: stage.busy ? 28 : 32,
                lineHeight: 1.15,
                color: stage.busy ? P.text : P.accentDeep,
              }}
            >
              {stage.name}
            </span>
          </React.Fragment>
        ))}
      </div>
      <Hair style={{ marginTop: 14 }} />
      <SlideCaption style={{ marginTop: 10 }}>
        {SHORT_CYCLE.busy} · {SHORT_CYCLE.free}
      </SlideCaption>
    </figure>

    <div style={{ marginTop: 24 }}>
      <Quote offset={false}>{SHORT_CYCLE.pull}</Quote>
      <SlideCaption style={{ marginTop: 12, maxWidth: "62ch" }}>{SHORT_CYCLE.close}</SlideCaption>
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------------- 05 Proof */

const ProofSlide: React.FC = () => (
  <PresentationSlide
    index={4}
    total={SHORT_STORY_TOTAL}
    chapter={SHORT_PROOF.kicker}
    lang={LANG}
    tone="ink"
    bleed={{
      image: MEDIA.mix,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.96),rgba(9,6,4,0.94))",
      opacity: 0.09,
    }}
    align="start"
  >
    <SlideKicker dark>{SHORT_PROOF.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" dark style={{ marginTop: 10, maxWidth: "28ch" }}>
      <span style={{ display: "block" }}>{SHORT_PROOF.titleA}</span>
      <span style={{ display: "block" }}>{SHORT_PROOF.titleB}</span>
    </SlideTitle>

    <SlideBody dark style={{ marginTop: 16, maxWidth: "74ch", fontSize: 22 }}>
      {SHORT_PROOF.body[0]} {SHORT_PROOF.body[1]} {SHORT_PROOF.body[2]}
    </SlideBody>

    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 48, alignItems: "end" }}>
      <figure>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {[ADOPTION_REEL[0], ADOPTION_REEL[2], ADOPTION_REEL[5]].map((frame) => (
            <div key={frame.src} style={{ height: 220, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
              <img
                src={frame.src}
                alt=""
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: frame.position }}
              />
            </div>
          ))}
        </div>
        <SlideDateline items={SHORT_PROOF.proof} lang={LANG} dark size={22} style={{ marginTop: 10 }} />
        <p
          dir="ltr"
          style={{
            marginTop: 8,
            fontFamily: displayFamily(LANG),
            fontSize: 16,
            lineHeight: 1.45,
            color: "rgba(251,246,239,0.55)",
          }}
        >
          {SHORT_PROOF.funnel.map((stage, index) => (
            <React.Fragment key={stage.label}>
              {index > 0 ? <span style={{ color: "rgba(217,185,129,0.4)", margin: "0 8px" }}>→</span> : null}
              <span style={{ color: P.accentDark }}>{stage.value}</span> {stage.label}
            </React.Fragment>
          ))}
          <span style={{ color: "rgba(217,185,129,0.4)", margin: "0 12px" }}>·</span>
          {SHORT_PROOF.historicLabel} {SHORT_PROOF.historicValue}
          <span style={{ color: "rgba(217,185,129,0.4)", margin: "0 8px" }}>·</span>
          {SHORT_PROOF.targetLabel} {SHORT_PROOF.targetValue} {SHORT_PROOF.targetNote}
        </p>
      </figure>
      <Quote dark offset={false}>
        <span style={{ display: "block" }}>{SHORT_PROOF.pullA}</span>
        <span style={{ display: "block" }}>{SHORT_PROOF.pullB}</span>
      </Quote>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------------------ 06 Moat */

const MoatSlide: React.FC = () => (
  <PresentationSlide index={5} total={SHORT_STORY_TOTAL} chapter={SHORT_MOAT.kicker} lang={LANG} tone="ink" align="start">
    <SlideKicker dark>{SHORT_MOAT.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" dark style={{ marginTop: 10, maxWidth: "16ch" }}>
      {SHORT_MOAT.title}
    </SlideTitle>

    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "0.56fr 0.44fr", gap: 48, alignItems: "start" }}>
      <Article lines={[SHORT_MOAT.body[0], SHORT_MOAT.body[2], SHORT_MOAT.body[4], SHORT_MOAT.body[9]]} dark gap={18} />

      <figure>
        <SlideCaption dark>
          {SHORT_MOAT.fields}
          <br />
          → {SHORT_MOAT.record}
        </SlideCaption>
        <SlideFigure value={SHORT_MOAT.heroValue} lang={LANG} size={72} color={P.inkText} style={{ marginTop: 12 }} />
        <SlideKicker dark style={{ marginTop: 8 }}>
          {SHORT_MOAT.heroLabel}
        </SlideKicker>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
          {SHORT_MOAT.support.map((item) => (
            <div key={item.label}>
              <SlideFigure value={item.value} lang={LANG} size={28} color={P.accentDark} />
              <SlideCaption dark style={{ marginTop: 4 }}>
                {item.label}
              </SlideCaption>
            </div>
          ))}
        </div>
        <dl style={{ marginTop: 20 }}>
          <Hair dark strong />
          {SHORT_MOAT.vantage.map((row, index) => {
            const last = index === SHORT_MOAT.vantage.length - 1;
            return (
              <div
                key={row.source}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 24,
                  paddingBlock: 8,
                  borderBottom: last ? "1px solid rgba(217,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <dt
                  style={{
                    fontSize: TYPE.kicker,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: last ? P.accentDark : "rgba(251,246,239,0.46)",
                  }}
                >
                  {row.source}
                </dt>
                <dd style={{ fontSize: TYPE.body, color: last ? P.inkText : "rgba(251,246,239,0.62)" }}>{row.sees}</dd>
              </div>
            );
          })}
        </dl>
      </figure>
    </div>

    <div style={{ marginTop: 16 }}>
      <Quote dark>
        <span style={{ display: "block" }}>{SHORT_MOAT.pullA}</span>
        <span style={{ display: "block" }}>{SHORT_MOAT.pullB}</span>
      </Quote>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------------- 07 Industry */

const IndustrySlide: React.FC = () => (
  <PresentationSlide index={8} total={SHORT_STORY_TOTAL} chapter={SHORT_INDUSTRY.kicker} lang={LANG} tone="paper" align="start">
    <SlideKicker>{SHORT_INDUSTRY.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" style={{ marginTop: 8, maxWidth: "18ch" }}>
      <span style={{ display: "block" }}>{SHORT_INDUSTRY.titleA}</span>
      <span style={{ display: "block" }}>{SHORT_INDUSTRY.titleB}</span>
    </SlideTitle>

    <SlideBody style={{ marginTop: 16, maxWidth: "78ch", fontSize: 21 }}>
      {SHORT_INDUSTRY.body[0]} {SHORT_INDUSTRY.body[3]} {SHORT_INDUSTRY.body[9]} {SHORT_INDUSTRY.body[10]} {SHORT_INDUSTRY.body[11]}
    </SlideBody>

    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "0.66fr 0.34fr", gap: 36, alignItems: "end" }}>
      <figure>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {SHORT_INDUSTRY.crops.map((crop) => (
            <div
              key={crop.caption}
              style={{
                height: 148,
                overflow: "hidden",
                border: "1px solid rgba(43,34,27,0.12)",
                background: "#fff",
                padding: 8,
              }}
            >
              <img src={crop.src} alt={crop.caption} style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ))}
        </div>
        <SlideCaption style={{ marginTop: 8 }}>{SHORT_INDUSTRY.figureCaption}</SlideCaption>
        <SlideCaption style={{ marginTop: 4 }}>{SHORT_INDUSTRY.modelCaption}</SlideCaption>
      </figure>
      <Quote offset={false}>
        <span style={{ display: "block" }}>{SHORT_INDUSTRY.pullA}</span>
        <span style={{ display: "block" }}>{SHORT_INDUSTRY.pullB}</span>
      </Quote>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------------- 08 Market */

const MarketSlide: React.FC = () => (
  <PresentationSlide index={9} total={SHORT_STORY_TOTAL} chapter={SHORT_MARKET.kicker} lang={LANG} tone="warm" align="start">
    <SlideKicker>{SHORT_MARKET.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" style={{ marginTop: 10, maxWidth: "16ch" }}>
      <span style={{ display: "block" }}>{SHORT_MARKET.titleA}</span>
      <span style={{ display: "block" }}>{SHORT_MARKET.titleB}</span>
    </SlideTitle>

    <div style={{ marginTop: 14 }}>
      <ArticleColumns lines={SHORT_MARKET.body} gap={9} />
    </div>

    <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "0.28fr 0.44fr 0.28fr", gap: 28, alignItems: "center" }}>
      <div>
        <SlideKicker>{SHORT_MARKET.services}</SlideKicker>
        <SlideFigure value={SHORT_MARKET.servicesNow} lang={LANG} size={48} style={{ marginTop: 8 }} />
        <SlideCaption style={{ marginTop: 6 }}>{SHORT_MARKET.servicesFuture}</SlideCaption>
      </div>
      <figure>
        <div style={{ overflow: "hidden", border: "1px solid rgba(43,34,27,0.12)", height: 220 }}>
          <img
            src={MEDIA.salon}
            alt="A Spectra color bar station: the salon between service and product"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 22%" }}
          />
        </div>
      </figure>
      <div>
        <SlideKicker>{SHORT_MARKET.products}</SlideKicker>
        <SlideFigure value={SHORT_MARKET.productsNow} lang={LANG} size={48} style={{ marginTop: 8 }} />
        <SlideCaption style={{ marginTop: 6 }}>{SHORT_MARKET.productsFuture}</SlideCaption>
      </div>
    </div>

    <div style={{ marginTop: 16 }}>
      <Quote offset={false}>
        <span style={{ display: "block" }}>{SHORT_MARKET.pullA}</span>
        <span style={{ display: "block" }}>{SHORT_MARKET.pullB}</span>
      </Quote>
      <SlideFine style={{ marginTop: 8 }}>{SHORT_MARKET.category}</SlideFine>
      <SlideFine style={{ marginTop: 2 }}>
        {SHORT_MARKET.players.map((player) => `${player.name} — ${player.note}`).join(" · ")}
      </SlideFine>
      <SlideFine style={{ marginTop: 6, maxWidth: 1180 }}>{SHORT_MARKET.sources}</SlideFine>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------------- 09 Platform */

const PlatformSlide: React.FC = () => (
  <PresentationSlide index={7} total={SHORT_STORY_TOTAL} chapter={SHORT_PLATFORM.kicker} lang={LANG} tone="paper" align="start">
    <SlideKicker>{SHORT_PLATFORM.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" style={{ marginTop: 8, maxWidth: "30ch" }}>
      <span style={{ display: "block" }}>{SHORT_PLATFORM.titleA}</span>
      <span style={{ display: "block" }}>{SHORT_PLATFORM.titleB}</span>
    </SlideTitle>

    <SlideBody style={{ marginTop: 16, maxWidth: "82ch", fontSize: 21 }}>
      {SHORT_PLATFORM.body[0]} {SHORT_PLATFORM.body[1]} {SHORT_PLATFORM.body[4]} {SHORT_PLATFORM.body[10]}
    </SlideBody>

    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 40, alignItems: "end" }}>
      <figure style={{ position: "relative", height: 248 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 168,
            height: 248,
            overflow: "hidden",
            border: "1px solid rgba(43,34,27,0.14)",
            background: P.ink,
          }}
        >
          <img src={MEDIA.owner} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 132,
            top: 20,
            width: 156,
            height: 228,
            overflow: "hidden",
            border: "1px solid rgba(43,34,27,0.14)",
            background: P.ink,
          }}
        >
          <img src={MEDIA.team} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 260,
            top: 36,
            width: 380,
            height: 212,
            overflow: "hidden",
          }}
        >
          <img src={MEDIA.client} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", objectPosition: "top" }} />
        </div>
      </figure>
      <div>
        <Quote offset={false}>
          <span style={{ display: "block" }}>{SHORT_PLATFORM.pullA}</span>
          <span style={{ display: "block" }}>{SHORT_PLATFORM.pullB}</span>
        </Quote>
        <SlideCaption style={{ marginTop: 10 }}>
          {SHORT_PLATFORM.formulaOs} + {SHORT_PLATFORM.formulaHistory} → {SHORT_PLATFORM.formulaAi}
          <br />
          {SHORT_PLATFORM.closeA} = {SHORT_PLATFORM.closeB}
        </SlideCaption>
      </div>
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------------- 10 Model */

const ModelSlide: React.FC = () => (
  <PresentationSlide index={10} total={SHORT_STORY_TOTAL} chapter={SHORT_MODEL.kicker} lang={LANG} tone="warm" align="start">
    <SlideKicker>{SHORT_MODEL.kicker}</SlideKicker>
    <SlideTitle lang={LANG} size="chapter" style={{ marginTop: 8, maxWidth: "16ch" }}>
      <span style={{ display: "block" }}>{SHORT_MODEL.titleA}</span>
      <span style={{ display: "block" }}>{SHORT_MODEL.titleB}</span>
    </SlideTitle>

    <SlideBody style={{ marginTop: 16, maxWidth: "82ch", fontSize: 21 }}>
      {SHORT_MODEL.body[0]} {SHORT_MODEL.body[2]} {SHORT_MODEL.body[3]} {SHORT_MODEL.body[8]}
    </SlideBody>

    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "0.42fr 0.58fr", gap: 40, alignItems: "end" }}>
      <figure>
        <div style={{ overflow: "hidden", border: "1px solid rgba(43,34,27,0.12)", height: 176 }}>
          <img
            src={MEDIA.salon}
            alt=""
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 22%" }}
          />
        </div>
        <p
          dir="ltr"
          style={{
            marginTop: 16,
            fontFamily: displayFamily(LANG),
            fontSize: 26,
            lineHeight: 1.2,
            color: P.text,
          }}
        >
          {SHORT_MODEL.flow.map((step, index) => (
            <React.Fragment key={step}>
              {index > 0 ? (
                <span aria-hidden="true" style={{ color: P.accent, margin: "0 10px", fontSize: 20 }}>
                  →
                </span>
              ) : null}
              <span style={{ color: index === 1 ? P.accentDeep : P.text }}>{step}</span>
            </React.Fragment>
          ))}
        </p>
        <SlideCaption style={{ marginTop: 8 }}>{SHORT_MODEL.engines.join(" · ")}</SlideCaption>
      </figure>
      <Quote offset={false}>
        <span style={{ display: "block" }}>{SHORT_MODEL.pullA}</span>
        <span style={{ display: "block" }}>{SHORT_MODEL.pullB}</span>
      </Quote>
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------- 11 Team + raise */

const TeamRaiseSlide: React.FC = () => {
  const { raise } = useShortVariant();
  return (
    <PresentationSlide index={11} total={SHORT_STORY_TOTAL} chapter={SHORT_TEAM.kicker} lang={LANG} tone="paper" align="start">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 48, alignItems: "start" }}>
        <div>
          <SlideKicker>{SHORT_TEAM.kicker}</SlideKicker>
          <SlideTitle lang={LANG} size="chapter" style={{ marginTop: 8, maxWidth: "32ch" }}>
            <span style={{ display: "block" }}>{SHORT_TEAM.titleA}</span>
            <span style={{ display: "block" }}>{SHORT_TEAM.titleB}</span>
            <span style={{ display: "block" }}>{SHORT_TEAM.titleC}</span>
          </SlideTitle>
        </div>
        <aside>
          <SlideFigure value={raise.amount} lang={LANG} size={56} />
          <SlideKicker style={{ marginTop: 8 }}>{raise.terms}</SlideKicker>
          <SlideCaption style={{ marginTop: 10 }}>{SHORT_TEAM.jobs.join(" · ")}</SlideCaption>
        </aside>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "280px 280px 1fr", gap: 28, alignItems: "start" }}>
        <figure>
          <div style={{ width: 280, height: 280, overflow: "hidden", border: "1px solid rgba(43,34,27,0.12)", background: P.ink }}>
            <img src={MEDIA.maor} alt="Maor Ganon" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 16%" }} />
          </div>
          <figcaption style={{ marginTop: 12 }}>
            <p style={{ fontFamily: displayFamily(LANG), fontSize: 26 }}>Maor Ganon</p>
            <SlideCaption style={{ marginTop: 4 }}>Founder &amp; CEO · Salon operator</SlideCaption>
          </figcaption>
        </figure>
        <figure>
          <div style={{ width: 280, height: 280, overflow: "hidden", border: "1px solid rgba(43,34,27,0.12)", background: P.ink }}>
            <img src={MEDIA.elad} alt="Elad Gotlieb" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 14%" }} />
          </div>
          <figcaption style={{ marginTop: 12 }}>
            <p style={{ fontFamily: displayFamily(LANG), fontSize: 26 }}>Elad Gotlieb</p>
            <SlideCaption style={{ marginTop: 4 }}>Co-Founder · Global operations</SlideCaption>
          </figcaption>
        </figure>
        <div>
          <Article lines={[SHORT_TEAM.body[0], SHORT_TEAM.body[1], SHORT_TEAM.body[2], SHORT_TEAM.body[3]]} gap={14} />
        </div>
      </div>

      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "0.48fr 0.52fr", gap: 36, alignItems: "end" }}>
        <Quote offset={false}>
          <span style={{ display: "block" }}>{SHORT_TEAM.pullA}</span>
          <span style={{ display: "block" }}>{SHORT_TEAM.pullB}</span>
        </Quote>
        <div>
          <SlideCaption>{SHORT_TEAM.close}</SlideCaption>
          <SlideFine style={{ marginTop: 8 }}>{SHORT_TEAM.advisors}</SlideFine>
          <SlideFine style={{ marginTop: 2 }}>{SHORT_TEAM.advisorsNote}</SlideFine>
          <SlideFine style={{ marginTop: 2, maxWidth: 1180 }}>{raise.finePrint}</SlideFine>
        </div>
      </div>
    </PresentationSlide>
  );
};

/* ----------------------------------------------------------------- 12 Close */

const CloseSlide: React.FC = () => (
  <PresentationSlide
    index={12}
    total={SHORT_STORY_TOTAL}
    chapter={SHORT_CLOSE.kicker}
    lang={LANG}
    tone="ink"
    bleed={{
      image: MEDIA.salon,
      overlay: "linear-gradient(160deg,rgba(9,6,4,0.94),rgba(9,6,4,0.82))",
      opacity: 0.24,
    }}
    align="between"
  >
    <div>
      <SlideKicker dark>{SHORT_CLOSE.kicker}</SlideKicker>
      <SlideTitle lang={LANG} size="cover" dark style={{ marginTop: 4, maxWidth: "16ch" }}>
        {SHORT_CLOSE.title}
      </SlideTitle>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "0.54fr 0.46fr", gap: 64 }}>
        <Article lines={SHORT_CLOSE.body} dark gap={5} />
        <div>
          <SlideTitle lang={LANG} size="chapter" accent dark style={{ maxWidth: "16ch" }}>
            <span style={{ display: "block" }}>{SHORT_CLOSE.finalA}</span>
            <span style={{ display: "block", marginTop: 14 }}>{SHORT_CLOSE.finalB}</span>
          </SlideTitle>
          <SlideCaption dark style={{ marginTop: 22 }}>
            {SHORT_CLOSE.layerA}
            <br />
            {SHORT_CLOSE.layerB}
          </SlideCaption>
        </div>
      </div>
    </div>

    <div>
      <Hair dark strong />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <SlideTitle lang={LANG} size="sub" dark>
            {SHORT_CLOSE.names}
          </SlideTitle>
          <SlideKicker dark style={{ marginTop: 8, color: "rgba(251,246,239,0.42)" }}>
            {SHORT_CLOSE.role}
          </SlideKicker>
        </div>
        <SalonAiLockup tone="ink" size="close" reducedMotion />
      </div>
    </div>
  </PresentationSlide>
);

export const SHORT_STORY_SLIDES = [
  CoverSlide,
  OriginSlide,
  SolutionSlide,
  ProofSlide,
  MoatSlide,
  CycleSlide,
  PlatformSlide,
  IndustrySlide,
  MarketSlide,
  ModelSlide,
  TeamRaiseSlide,
  CloseSlide,
] as const;

export const FounderStoryShortDeck: React.FC<{ variantId?: ShortDeckVariantId }> = ({
  variantId = "september",
}) => (
  <ShortDeckVariantContext.Provider value={SHORT_DECK_VARIANTS[variantId]}>
    <div
      data-investor-presentation="true"
      data-slide-count={SHORT_STORY_SLIDES.length}
      dir="ltr"
      style={{ width: SLIDE.width, margin: "0 auto", background: P.paper }}
    >
      {SHORT_STORY_SLIDES.map((Slide, index) => (
        <Slide key={index} />
      ))}
    </div>
  </ShortDeckVariantContext.Provider>
);

export default FounderStoryShortDeck;
