/**
 * Mobile composition of the September 2026 investor deck.
 *
 * The fixed 1920x1080 deck stays the source of truth for desktop and PDF. This
 * file re-composes the same 17 slides, in the same order, as semantic stacked
 * sections for phones. All claims come from the canonical copy, variant and
 * data objects shared with `FounderStoryDeck`.
 */
import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SpectraOrb } from "../../components/SpectraOrb";
import { loc, t as text } from "../ExternalInvestorUpdate/EditorialPrimitives";
import {
  FINAL_ADOPTION,
  FINAL_CHAPTERS,
  FINAL_CLOSE,
  FINAL_COLOR_WEDGE,
  FINAL_GTM,
  FINAL_HERO,
  FINAL_LEDE,
  FINAL_REVELATION,
  FINAL_SAAS,
  FINAL_SALON_AI,
  REVISION,
  type Localized,
  type UpdateLang,
} from "./founderStoryCopy";
import type { DeckVariant } from "./founderStoryVariants";
import {
  ADOPTION_PHONES,
  ADOPTION_PROOF_METRICS,
  BUSINESS_MODEL_LABELS,
  COLOR_WORKFLOW_MEDIA,
  DATA_LAYER_SCALE,
  DATA_SUBSCRIPTION_TIERS,
  DECK_COPY,
  DECK_UI_COPY,
  FOUNDER_STORY_TEAM,
  GTM_FUNNEL_FILLS,
  GTM_FUNNEL_WIDTHS,
  GTM_MONEY,
  HERO_BUSINESS_METRICS,
  HERO_DATA_METRICS,
  HISTORY_PROOF,
  MEDIA,
  OPERATING_COUNTRIES,
  PLATFORM_CAPABILITY_ICONS,
  RECORD_FIELD_ICONS,
  SALON_AI_HIGHLIGHTS,
  SALON_AI_STEP_ICONS,
  SALON_SUBSCRIPTION_TIERS,
  SPECTRA_SOCIAL,
  customerVideoLabel,
  founderPortraitAlt,
} from "./FounderStoryDeck";
import "./founderStoryMobile.css";

type Lang = UpdateLang;
type SlideProps = { lang: Lang; variant: DeckVariant };

const MOBILE_UI = {
  previous: loc("Previous", "הקודם"),
  next: loc("Next", "הבא"),
  jump: loc("Go to slide", "מעבר לשקופית"),
  navigation: loc("Presentation navigation", "ניווט במצגת"),
  language: loc("Change language", "החלפת שפה"),
  slide: loc("Slide", "שקופית"),
  of: loc("of", "מתוך"),
  previousVideo: loc("Previous video", "הסרטון הקודם"),
  nextVideo: loc("Next video", "הסרטון הבא"),
  countries: loc("Operating countries", "מדינות פעילות"),
  social: loc("Spectra on social media", "Spectra ברשתות החברתיות"),
  opensInstagram: loc("opens Instagram profile", "פתיחת פרופיל אינסטגרם"),
  openFull: loc("open full size", "פתיחה בגודל מלא"),
} as const;

const pad = (value: number) => String(value).padStart(2, "0");
export const mobileSlideAnchor = (number: number) => `slide-${pad(number)}`;
const headingId = (number: number) => `${mobileSlideAnchor(number)}-title`;
const dirFor = (lang: Lang) => (lang === "he" ? "rtl" : "ltr");

/** Keys inside form fields, links, buttons and media must keep their native meaning. */
export const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      'a, button, input, select, textarea, video, audio, summary, [contenteditable="true"], [role="slider"], [role="tab"], [role="menu"], [role="listbox"]',
    ),
  );

const usePrefersReducedMotion = () => {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = React.useState(
    () => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches),
  );
  React.useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
};

/* --------------------------------------------------------------- slide meta */

type SlideMeta = {
  chapter: (variant: DeckVariant) => Localized;
  heading: (variant: DeckVariant) => Localized;
};

/** Same order and chapter folios as `FOUNDER_STORY_SLIDES`. */
const SLIDE_META: readonly SlideMeta[] = [
  { chapter: (variant) => variant.date, heading: () => FINAL_HERO.title },
  { chapter: () => FINAL_CHAPTERS.company.title, heading: () => FINAL_LEDE.title },
  { chapter: () => FINAL_CHAPTERS.built.title, heading: () => FINAL_COLOR_WEDGE.title },
  { chapter: () => FINAL_CHAPTERS.built.title, heading: () => FINAL_ADOPTION.strip },
  { chapter: () => FINAL_GTM.kicker, heading: () => FINAL_GTM.title },
  { chapter: () => FINAL_CHAPTERS.discovered.title, heading: () => FINAL_REVELATION.title },
  { chapter: () => FINAL_CHAPTERS.discovered.title, heading: () => DECK_COPY.dataHeadline },
  { chapter: () => REVISION.market.kicker, heading: () => REVISION.market.title },
  { chapter: () => REVISION.twoSided.kicker, heading: () => REVISION.twoSided.title },
  { chapter: () => FINAL_CHAPTERS.platform.title, heading: () => REVISION.salonAi.title },
  { chapter: () => REVISION.model.kicker, heading: () => REVISION.model.title },
  { chapter: () => REVISION.competition.kicker, heading: () => REVISION.competition.title },
  { chapter: () => REVISION.founders.kicker, heading: () => REVISION.founders.title },
  { chapter: () => REVISION.advisors.kicker, heading: () => REVISION.advisors.title },
  { chapter: () => FINAL_CHAPTERS.opportunity.title, heading: (variant) => variant.raise.title },
  { chapter: () => REVISION.exit.kicker, heading: () => REVISION.exit.title },
  { chapter: () => FINAL_CHAPTERS.opportunity.title, heading: () => FINAL_CLOSE.title },
];

const TOTAL = SLIDE_META.length;

/* ---------------------------------------------------------------- primitives */

type Bleed = { image: string; overlay: string; opacity: number };

const MobileSlide: React.FC<{
  number: number;
  lang: Lang;
  variant: DeckVariant;
  tone?: "paper" | "warm" | "ink";
  bleed?: Bleed;
  cover?: boolean;
  showFolio?: boolean;
  children: React.ReactNode;
}> = ({ number, lang, variant, tone = "paper", bleed, cover = false, showFolio = true, children }) => (
  <section
    id={mobileSlideAnchor(number)}
    aria-labelledby={headingId(number)}
    data-mobile-slide={number}
    className={`fsm-slide fsm-slide--${tone}${cover ? " fsm-slide--cover" : ""}`}
  >
    {bleed ? (
      <>
        <div
          aria-hidden="true"
          className="fsm-bleed"
          style={{ backgroundImage: `url('${bleed.image}')`, opacity: bleed.opacity }}
        />
        <div aria-hidden="true" className="fsm-bleed__overlay" style={{ background: bleed.overlay }} />
      </>
    ) : null}
    <div className="fsm-inner">
      {showFolio ? (
        <p className="fsm-folio">
          <span className="fsm-folio__number fsm-ltr">
            <span className="fsm-visually-hidden">{text(MOBILE_UI.slide, lang)} </span>
            {pad(number)} / {pad(TOTAL)}
          </span>
          <span>{text(SLIDE_META[number - 1].chapter(variant), lang)}</span>
        </p>
      ) : null}
      {children}
    </div>
  </section>
);

const Title: React.FC<{
  number?: number;
  as?: "h1" | "h2" | "h3" | "p";
  size: "cover" | "feature" | "chapter" | "sub" | "quote";
  accent?: boolean;
  italic?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ number, as: Tag = "h2", size, accent, italic, className, style, children }) => (
  <Tag
    id={number ? headingId(number) : undefined}
    className={[
      "fsm-title",
      `fsm-title--${size}`,
      accent ? "fsm-title--accent" : "",
      italic ? "fsm-italic" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ")}
    style={style}
  >
    {children}
  </Tag>
);

const Kicker: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className,
  style,
}) => (
  <p className={`fsm-kicker${className ? ` ${className}` : ""}`} style={style}>
    {children}
  </p>
);

const Metrics: React.FC<{
  items: readonly { value: string; label: Localized }[];
  lang: Lang;
  className?: string;
  spanFirst?: boolean;
}> = ({ items, lang, className, spanFirst }) => (
  <dl className={`fsm-metrics${className ? ` ${className}` : ""}`}>
    {items.map((item, index) => (
      <div key={item.label.en} className={`fsm-metric${spanFirst && index === 0 ? " fsm-metric--span" : ""}`}>
        <dt>{text(item.label, lang)}</dt>
        <dd>{item.value}</dd>
      </div>
    ))}
  </dl>
);

const nonEmpty = (value: Localized, lang: Lang) => Boolean(text(value, lang));

const BRAND_NAMES = /(Salon AI|Salon OS|Color Intelligence)/;

/** Product names never break across lines and stay LTR inside Hebrew copy. */
const keepBrands = (value: string): React.ReactNode =>
  value.split(BRAND_NAMES).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="fsm-brand">
        {part}
      </span>
    ) : (
      part
    ),
  );

/* ------------------------------------------------------------------ 01 Cover */

const CoverSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide number={1} lang={lang} variant={variant} tone="ink" cover showFolio={false}>
    <p className="fsm-kicker" style={{ color: "rgba(251,246,239,0.62)" }}>
      <span className="fsm-visually-hidden">
        {text(MOBILE_UI.slide, lang)} 01 / {pad(TOTAL)} ·{" "}
      </span>
      {text(variant.date, lang)}
    </p>
    <hr className="fsm-rule fsm-rule--strong" style={{ marginTop: 14 }} />

    <Title number={1} as="h1" size="cover" style={{ marginTop: 26 }}>
      {text(FINAL_HERO.title, lang)
        .split("\n")
        .map((line) => (
          <span key={line} style={{ display: "block" }}>
            {line}
          </span>
        ))}
    </Title>

    <figure className="fsm-media fsm-media--wide fsm-block" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
      <img
        src={MEDIA.founders}
        alt={text(FINAL_HERO.founderAlt, lang)}
        width={1536}
        height={1024}
        style={{ objectPosition: "74% center" }}
      />
    </figure>

    <div className="fsm-block">
      <Kicker>{text(DECK_UI_COPY.coverBusinessKicker, lang)}</Kicker>
      <Metrics items={HERO_BUSINESS_METRICS} lang={lang} className="fsm-block--tight" />
    </div>
    <div className="fsm-block">
      <Kicker>{text(DECK_UI_COPY.coverDataKicker, lang)}</Kicker>
      <Metrics items={HERO_DATA_METRICS} lang={lang} className="fsm-block--tight" />
    </div>
  </MobileSlide>
);

/* ----------------------------------------------------------------- 02 Origin */

const OriginSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide number={2} lang={lang} variant={variant}>
    <Title number={2} size="feature">
      {text(FINAL_LEDE.title, lang)}
    </Title>
    <div className="fsm-stack fsm-block" style={{ "--fsm-gap": "18px" } as React.CSSProperties}>
      <p className="fsm-lede">{FINAL_LEDE.paragraphs[lang][0]}</p>
      <p className="fsm-body">{FINAL_LEDE.paragraphs[lang][1]}</p>
      <div>
        <p className="fsm-body">{text(FINAL_LEDE.dataReveal.setup, lang)}</p>
        <p className="fsm-figure fsm-figure--xl" style={{ marginTop: 8 }}>
          {text(FINAL_LEDE.dataReveal.word, lang)}
        </p>
        <p className="fsm-lede" style={{ marginTop: 10 }}>
          {text(FINAL_LEDE.dataReveal.follow, lang)}
        </p>
      </div>
      <p className="fsm-body">{FINAL_LEDE.paragraphs[lang][2]}</p>
    </div>
    <figure className="fsm-block">
      <hr className="fsm-rule fsm-rule--strong" />
      <blockquote style={{ paddingBlock: 22 }}>
        <p className="fsm-title fsm-title--quote" style={{ color: "var(--fsm-fg)" }}>
          {text(FINAL_LEDE.pull, lang)}
        </p>
      </blockquote>
      <hr className="fsm-rule" />
    </figure>
  </MobileSlide>
);

/* ----------------------------------------------------------- 03 Color workflow */

const WorkflowImage: React.FC<{ src: string; alt: string; position: string; number: string }> = ({
  src,
  alt,
  position,
  number,
}) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="fsm-step__fallback" role="img" aria-label={alt}>
        <span className="fsm-ltr">{number}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={663}
      height={994}
      loading="lazy"
      decoding="async"
      style={{ objectPosition: position }}
      onError={() => setFailed(true)}
    />
  );
};

const ColorSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={3}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.95),rgba(9,6,4,0.8))",
      opacity: 0.3,
    }}
  >
    <Title number={3} size="feature">
      {keepBrands(text(FINAL_COLOR_WEDGE.title, lang))}
    </Title>
    <p className="fsm-lede" style={{ marginTop: 14, color: "rgba(217,185,129,0.9)" }}>
      {text(FINAL_COLOR_WEDGE.appLine, lang)}
    </p>
    <p className="fsm-title fsm-title--sub fsm-title--accent fsm-italic" style={{ marginTop: 6 }}>
      {text(FINAL_COLOR_WEDGE.cadence, lang)}
    </p>

    <ol className="fsm-steps fsm-block" aria-label={text(DECK_UI_COPY.colorWorkflowLabel, lang)}>
      {FINAL_COLOR_WEDGE.workflow.map((step, index) => {
        const media = COLOR_WORKFLOW_MEDIA[index];
        return (
          <li key={step.number} className="fsm-step">
            <div className="fsm-step__media">
              <WorkflowImage
                src={media.src.replace(/ /g, "%20")}
                alt={text(step.alt, lang)}
                position={media.position}
                number={step.number}
              />
            </div>
            <div>
              <p className="fsm-step__number" aria-hidden="true">
                {step.number}
              </p>
              <h3 className="fsm-step__title">{text(step.title, lang)}</h3>
              <p className="fsm-caption" style={{ marginTop: 4 }}>
                {text(step.line, lang)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  </MobileSlide>
);

/* --------------------------------------------------------- 04 Adoption reels */

const ReelRail: React.FC<{ lang: Lang }> = ({ lang }) => {
  const reducedMotion = usePrefersReducedMotion();
  const railRef = React.useRef<HTMLUListElement | null>(null);
  const cardRefs = React.useRef<Array<HTMLLIElement | null>>([]);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);
  const [active, setActive] = React.useState(0);

  const pauseAll = React.useCallback((except?: number) => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== except && !video.paused) video.pause();
    });
  }, []);

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") return undefined;

    const visibility = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio < 0.35 && !video.paused) video.pause();
        });
      },
      { threshold: [0, 0.35] },
    );
    videoRefs.current.forEach((video) => video && visibility.observe(video));

    const position = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const index = Number((best.target as HTMLElement).dataset.reelIndex);
        if (Number.isFinite(index)) setActive(index);
      },
      { root: rail, threshold: [0.6, 0.9] },
    );
    cardRefs.current.forEach((card) => card && position.observe(card));

    const onHidden = () => {
      if (document.visibilityState === "hidden") pauseAll();
    };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      visibility.disconnect();
      position.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
      pauseAll();
    };
  }, [pauseAll]);

  const scrollToCard = (index: number) => {
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) return;
    const next = Math.max(0, Math.min(ADOPTION_PHONES.length - 1, index));
    const target = cardRefs.current[next] ?? card;
    rail.scrollTo({
      left: target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2,
      behavior: reducedMotion ? "instant" : "smooth",
    });
    setActive(next);
  };

  return (
    <div className="fsm-reels fsm-block" role="group" aria-label={text(DECK_UI_COPY.adoptionReelsLabel, lang)}>
      <ul ref={railRef} className="fsm-reels__rail" dir="ltr">
          {ADOPTION_PHONES.map((phone, index) => (
            <li
              key={phone.username}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-reel-index={index}
              className="fsm-reel"
              aria-label={`${index + 1} / ${ADOPTION_PHONES.length}`}
            >
              <div className="fsm-reel__frame">
                <video
                  ref={(video) => {
                    videoRefs.current[index] = video;
                  }}
                  src={phone.video}
                  poster={phone.poster}
                  controls
                  controlsList="nodownload noplaybackrate"
                  playsInline
                  preload="none"
                  aria-label={customerVideoLabel(phone.name, lang)}
                  onPlay={() => {
                    pauseAll(index);
                    setActive(index);
                  }}
                />
              </div>
              <a
                className="fsm-reel__credit"
                href={phone.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${phone.name} ${phone.username}, ${text(MOBILE_UI.opensInstagram, lang)}`}
              >
                <img className="fsm-reel__avatar" src={phone.avatar} alt="" width={30} height={30} loading="lazy" />
                <span style={{ minWidth: 0 }}>
                  <span className="fsm-reel__name">{phone.name}</span>
                  <span className="fsm-reel__handle">{phone.username}</span>
                </span>
              </a>
            </li>
          ))}
      </ul>
      <div className="fsm-reels__controls" dir="ltr">
        <button
          type="button"
          className="fsm-round-button"
          onClick={() => scrollToCard(active - 1)}
          disabled={active === 0}
          aria-label={text(MOBILE_UI.previousVideo, lang)}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p className="fsm-reels__count" aria-live="polite">
          {active + 1} / {ADOPTION_PHONES.length}
        </p>
        <button
          type="button"
          className="fsm-round-button"
          onClick={() => scrollToCard(active + 1)}
          disabled={active === ADOPTION_PHONES.length - 1}
          aria-label={text(MOBILE_UI.nextVideo, lang)}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const AdoptionSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={4}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.92),rgba(9,6,4,0.88))",
      opacity: 0.28,
    }}
  >
    <Title number={4} size="chapter">
      {text(FINAL_ADOPTION.strip, lang)}
    </Title>
    <Metrics items={ADOPTION_PROOF_METRICS} lang={lang} className="fsm-block--tight" />

    <ReelRail lang={lang} />

    <div className="fsm-block">
      <ul className="fsm-flags" dir="ltr" aria-label={text(MOBILE_UI.countries, lang)}>
        {OPERATING_COUNTRIES.map((country) => (
          <li key={country.code}>
            <img
              src={`/investor/flags/${country.code}.png`}
              alt={text(country.name, lang)}
              title={text(country.name, lang)}
              width={36}
              height={24}
              loading="lazy"
            />
          </li>
        ))}
      </ul>
      <ul className="fsm-links" dir="ltr" aria-label={text(MOBILE_UI.social, lang)} style={{ marginTop: 12 }}>
        {SPECTRA_SOCIAL.map((item) => (
          <li key={item.href}>
            <a className="fsm-link" href={item.href} target="_blank" rel="noopener noreferrer">
              <item.Icon size={17} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.label}</span>
              {item.count ? <span className="fsm-link__count">{item.count}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </MobileSlide>
);

/* ------------------------------------------------------------ 05 Commercial */

const CommercialSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={5}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.95),rgba(9,6,4,0.82))",
      opacity: 0.28,
    }}
  >
    <Title number={5} size="feature">
      {text(FINAL_GTM.title, lang)}
    </Title>

    <div className="fsm-block">
      <p className="fsm-figure fsm-figure--xl">{FINAL_SAAS.spend}</p>
      <p className="fsm-label" style={{ marginTop: 8 }}>
        {text(FINAL_GTM.spendLabel, lang)}
      </p>
    </div>

    <ol className="fsm-funnel fsm-block">
      {FINAL_SAAS.funnel.slice(0, 3).map((stage, index) => (
        <li key={stage.value} className="fsm-funnel__row">
          <span className="fsm-label">{text(stage.label, lang)}</span>
          <span
            className="fsm-funnel__bar"
            style={{ width: GTM_FUNNEL_WIDTHS[index], minWidth: 132, background: GTM_FUNNEL_FILLS[index] }}
          >
            <span className="fsm-ltr">{stage.value}</span>
          </span>
        </li>
      ))}
    </ol>

    <div className="fsm-block">
      <hr className="fsm-rule" />
      <Metrics items={GTM_MONEY} lang={lang} className="fsm-block--tight" />
    </div>

    <div className="fsm-block">
      <p className="fsm-title fsm-title--sub fsm-title--accent fsm-italic">{text(FINAL_GTM.close, lang)}</p>
      <p className="fsm-fine" style={{ marginTop: 12 }}>
        {text(FINAL_GTM.caption, lang)}
      </p>
    </div>
  </MobileSlide>
);

/* ----------------------------------------------------------- 06 Turning point */

const RecordFields: React.FC<{ fields: readonly Localized[]; lang: Lang }> = ({ fields, lang }) => (
  <ul className="fsm-record__fields">
    {fields.map((field) => {
      const Icon = RECORD_FIELD_ICONS[field.en as keyof typeof RECORD_FIELD_ICONS];
      return (
        <li key={field.en} className="fsm-record__field">
          <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
          <span>{text(field, lang)}</span>
        </li>
      );
    })}
  </ul>
);

const TurningPointSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={6}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.reception,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))",
      opacity: 0.22,
    }}
  >
    <Title number={6} size="chapter">
      {text(FINAL_REVELATION.title, lang)}
    </Title>

    <figure className="fsm-record fsm-block" aria-label={text(DECK_UI_COPY.recordFigureLabel, lang)}>
      <RecordFields fields={FINAL_REVELATION.signals.slice(0, 4)} lang={lang} />
      <div className="fsm-record__link" aria-hidden="true" />
      <div className="fsm-record__hub">
        <img src={MEDIA.bowlRecord} alt="" width={1536} height={1024} loading="lazy" decoding="async" />
      </div>
      <div className="fsm-record__link" aria-hidden="true" />
      <RecordFields fields={FINAL_REVELATION.signals.slice(4)} lang={lang} />
    </figure>

    <p className="fsm-title fsm-title--sub fsm-italic fsm-block" style={{ color: "var(--fsm-strong)" }}>
      {text(FINAL_REVELATION.close, lang)}
    </p>
  </MobileSlide>
);

/* -------------------------------------------------------------- 07 Data layer */

const DataLayerSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={7}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.reception,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))",
      opacity: 0.22,
    }}
  >
    <Title number={7} size="chapter">
      {text(DECK_COPY.dataHeadline, lang)}
    </Title>
    <Metrics items={DATA_LAYER_SCALE} lang={lang} className="fsm-metrics--2 fsm-metrics--5 fsm-block" spanFirst />

    <div className="fsm-cards fsm-block">
      {HISTORY_PROOF.map((crop) => (
        <figure key={crop.src}>
          <a
            href={crop.src}
            target="_blank"
            rel="noopener noreferrer"
            className="fsm-media fsm-media--plate"
            style={{ display: "block", borderColor: "rgba(255,255,255,0.14)" }}
            aria-label={`${text(crop.caption, lang)} · ${text(MOBILE_UI.openFull, lang)}`}
          >
            <img
              src={crop.src}
              alt={text(crop.caption, lang)}
              width={1352}
              height={598}
              loading="lazy"
              decoding="async"
            />
          </a>
          <figcaption className="fsm-caption fsm-figcaption">{text(crop.caption, lang)}</figcaption>
        </figure>
      ))}
    </div>

    <div className="fsm-panel fsm-block">
      <Kicker>{text(DECK_COPY.dataDifferenceKicker, lang)}</Kicker>
      <div className="fsm-difference" style={{ marginTop: 10 }}>
        {DECK_COPY.dataDifferenceLines.map((line, index) => (
          <p key={line.en} className={index === 2 ? "is-strong" : undefined}>
            {text(line, lang)}
          </p>
        ))}
      </div>
      <p className="fsm-caption" style={{ marginTop: 10, color: "rgba(217,185,129,0.85)" }}>
        {text(DECK_COPY.dataFields, lang)}
      </p>
    </div>

    <div className="fsm-panel" style={{ borderTopColor: "rgba(217,185,129,0.5)" }}>
      <Kicker>{text(DECK_COPY.dataPilotKicker, lang)}</Kicker>
      <p className="fsm-title fsm-title--sub" style={{ marginTop: 12 }}>
        {text(DECK_COPY.dataPilotBody, lang)}
      </p>
    </div>
  </MobileSlide>
);

/* ----------------------------------------------------------------- 08 Market */

const MarketSection: React.FC<SlideProps> = ({ lang, variant }) => {
  const market = REVISION.market;
  const columns = [
    {
      label: market.servicesLabel,
      figure: market.servicesFigure,
      caption: market.servicesCaption,
      future: market.servicesFuture,
      cagr: market.servicesCagr,
      hair: market.servicesHair,
    },
    {
      label: market.productsLabel,
      figure: market.productsFigure,
      caption: market.productsCaption,
      future: market.productsFuture,
      cagr: market.productsCagr,
      hair: market.productsHair,
    },
  ];
  return (
    <MobileSlide number={8} lang={lang} variant={variant}>
      <Title number={8} size="feature">
        {text(market.title, lang)}
      </Title>

      <div className="fsm-panels--2 fsm-block">
        {columns.map((column) => (
          <section key={column.label.en} className="fsm-panel" aria-label={text(column.label, lang)}>
            <Kicker>{text(column.label, lang)}</Kicker>
            <p className="fsm-figure fsm-figure--xl" style={{ marginTop: 12 }}>
              {column.figure}
            </p>
            <p className="fsm-caption" style={{ marginTop: 10 }}>
              {text(column.caption, lang)}
            </p>
            <p className="fsm-title fsm-title--sub" style={{ marginTop: 14 }}>
              {text(column.future, lang)}
            </p>
            <p className="fsm-body" style={{ marginTop: 6 }}>
              {text(column.cagr, lang)}
            </p>
            <Kicker style={{ marginTop: 14, color: "var(--fsm-copper-deep)" }}>{text(column.hair, lang)}</Kicker>
          </section>
        ))}
      </div>

      <div className="fsm-block">
        <p className="fsm-title fsm-title--quote">{text(market.close, lang)}</p>
        <p className="fsm-fine" style={{ marginTop: 14 }}>
          {text(market.sources, lang)}
        </p>
      </div>
    </MobileSlide>
  );
};

/* ------------------------------------------------------------ 09 Two-sided */

const OpportunitySection: React.FC<SlideProps> = ({ lang, variant }) => {
  const two = REVISION.twoSided;
  const sides = [
    { label: two.salonsLabel, model: two.salonsModel, need: two.salonsNeed },
    { label: two.brandsLabel, model: two.brandsModel, need: two.brandsNeed },
  ];
  const renderSide = (side: (typeof sides)[number]) => (
    <div className="fsm-panel" key={side.label.en}>
      <Kicker>{text(side.label, lang)}</Kicker>
      <p style={{ marginTop: 10, fontSize: 16, fontWeight: 600, color: "var(--fsm-copper-deep)" }}>
        {text(side.model, lang)}
      </p>
      <p className="fsm-title fsm-title--sub" style={{ marginTop: 12 }}>
        {text(side.need, lang)}
      </p>
    </div>
  );
  return (
    <MobileSlide number={9} lang={lang} variant={variant} tone="warm">
      <Title number={9} size="feature">
        {text(two.title, lang)}
      </Title>
      <div className="fsm-block">
        {renderSide(sides[0])}
        <div className="fsm-orb">
          <div className="fsm-orb__ring" aria-hidden="true">
            <SpectraOrb size={132} reducedMotion />
          </div>
          <p className="fsm-orb__label fsm-ltr">{text(two.center, lang)}</p>
        </div>
        {renderSide(sides[1])}
      </div>
      <p className="fsm-title fsm-title--sub fsm-title--accent fsm-italic fsm-block">{text(two.close, lang)}</p>
    </MobileSlide>
  );
};

/* --------------------------------------------------------------- 10 Salon AI */

const SalonAiSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={10}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.shelves,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.96),rgba(9,6,4,0.84))",
      opacity: 0.22,
    }}
  >
    <Kicker>{text(REVISION.salonAi.kicker, lang)}</Kicker>
    <Title number={10} size="feature" style={{ marginTop: 14 }}>
      {text(REVISION.salonAi.title, lang)}
    </Title>

    <ol className="fsm-flow fsm-block">
      {REVISION.salonAi.steps.map((step, index) => {
        const Icon = SALON_AI_STEP_ICONS[step.en];
        return (
          <React.Fragment key={step.en}>
            {index > 0 ? (
              <li aria-hidden="true" className="fsm-flow__arrow">
                {lang === "he" ? "←" : "→"}
              </li>
            ) : null}
            <li className="fsm-flow__step">
              <Icon size={18} strokeWidth={1.4} aria-hidden="true" style={{ color: "var(--fsm-copper-light)" }} />
              <span>{text(step, lang)}</span>
            </li>
          </React.Fragment>
        );
      })}
      <li aria-hidden="true" className="fsm-flow__arrow">
        {lang === "he" ? "←" : "→"}
      </li>
      <li className="fsm-flow__destination">{text(REVISION.salonAi.destination, lang)}</li>
    </ol>

    <figure className="fsm-phone fsm-block">
      <div className="fsm-media" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
        <img
          src={MEDIA.salonAiPhone}
          alt={text(DECK_UI_COPY.salonAiPhoneAlt, lang)}
          width={960}
          height={1200}
          loading="lazy"
          decoding="async"
        />
      </div>
      {nonEmpty(FINAL_SALON_AI.caption, lang) ? (
        <figcaption className="fsm-caption fsm-figcaption">{text(FINAL_SALON_AI.caption, lang)}</figcaption>
      ) : null}
    </figure>

    <section className="fsm-block" aria-label={text(DECK_UI_COPY.salonAiCapabilitiesLabel, lang)}>
      <Kicker>{text(DECK_UI_COPY.salonAiCapabilitiesKicker, lang)}</Kicker>
      <ul className="fsm-capabilities" style={{ marginTop: 12 }}>
        {SALON_AI_HIGHLIGHTS.map((item) => {
          const Icon = PLATFORM_CAPABILITY_ICONS[item.title.en];
          return (
            <li key={item.title.en} className="fsm-capability">
              <Icon size={22} strokeWidth={1.4} aria-hidden="true" style={{ color: "var(--fsm-copper-light)" }} />
              <div>
                <h3 className="fsm-capability__title">{text(item.title, lang)}</h3>
                <p className="fsm-caption" style={{ marginTop: 4 }}>
                  {text(item.body, lang)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>

    <p className="fsm-lede fsm-block">{keepBrands(text(REVISION.salonAi.close, lang))}</p>
  </MobileSlide>
);

/* --------------------------------------------------------- 11 Business model */

const TierRows: React.FC<{
  rows: readonly { name: string; detail: Localized; value: string }[];
  lang: Lang;
}> = ({ rows, lang }) => (
  <ul className="fsm-rows" style={{ marginTop: 12 }}>
    {rows.map((row, index) => (
      <li key={row.name} className="fsm-row">
        <div>
          <p className="fsm-row__name">
            <bdi>{row.name}</bdi>
          </p>
          <p className="fsm-fine" style={{ marginTop: 2 }}>
            {text(row.detail, lang)}
          </p>
        </div>
        <p className={`fsm-row__value${index === rows.length - 1 ? " is-accent" : ""}`}>{row.value}</p>
      </li>
    ))}
  </ul>
);

const BusinessModelSection: React.FC<SlideProps> = ({ lang, variant }) => {
  const model = REVISION.model;
  const brandsData = text(model.brandsData, lang)
    .split("\n")
    .map((line) => line.replace(/^•\s*/, ""))
    .filter(Boolean);
  return (
    <MobileSlide number={11} lang={lang} variant={variant} tone="warm">
      <Title number={11} size="feature">
        {text(model.title, lang)}
      </Title>

      <div className="fsm-panels--2 fsm-block">
        <div className="fsm-panel">
          <Kicker>{text(model.salonLabel, lang)}</Kicker>
          <h3 className="fsm-title fsm-title--sub" style={{ marginTop: 10 }}>
            {text(model.salonPays, lang)}
          </h3>
          {nonEmpty(model.salonModel, lang) ? (
            <p className="fsm-body" style={{ marginTop: 8 }}>
              {keepBrands(text(model.salonModel, lang))}
            </p>
          ) : null}
        </div>
        <div className="fsm-panel">
          <Kicker>{text(model.brandsLabel, lang)}</Kicker>
          <h3 className="fsm-title fsm-title--sub" style={{ marginTop: 10 }}>
            {text(model.brandsPays, lang)}
          </h3>
          {nonEmpty(model.brandsModel, lang) ? (
            <p className="fsm-body" style={{ marginTop: 8 }}>
              {text(model.brandsModel, lang)}
            </p>
          ) : null}
          <ul className="fsm-bullets fsm-caption" style={{ marginTop: 12 }}>
            {brandsData.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="fsm-panels--2 fsm-block">
        <section aria-label={text(BUSINESS_MODEL_LABELS.salonArpu, lang)} style={{ paddingBottom: 12 }}>
          <Kicker>{text(BUSINESS_MODEL_LABELS.salonArpu, lang)}</Kicker>
          <p className="fsm-fine" style={{ marginTop: 6 }}>
            {text(BUSINESS_MODEL_LABELS.salonArpuNote, lang)}
          </p>
          <TierRows
            lang={lang}
            rows={SALON_SUBSCRIPTION_TIERS.map((tier) => ({ name: tier.name, detail: tier.scope, value: tier.value }))}
          />
        </section>
        <section aria-label={text(BUSINESS_MODEL_LABELS.dataSubscriptions, lang)} style={{ paddingBottom: 12 }}>
          <Kicker>{text(BUSINESS_MODEL_LABELS.dataSubscriptions, lang)}</Kicker>
          <p className="fsm-fine" style={{ marginTop: 6 }}>
            {text(BUSINESS_MODEL_LABELS.dataSubscriptionsNote, lang)}
          </p>
          <TierRows
            lang={lang}
            rows={DATA_SUBSCRIPTION_TIERS.map((tier) => ({
              name: tier.name,
              detail: tier.customer,
              value: tier.value,
            }))}
          />
        </section>
      </div>
    </MobileSlide>
  );
};

/* ------------------------------------------------------------- 12 Competition */

const CompetitionSection: React.FC<SlideProps> = ({ lang, variant }) => {
  const [salonLayer, ...otherLayers] = REVISION.competition.categories;
  return (
    <MobileSlide number={12} lang={lang} variant={variant}>
      <Title number={12} size="feature">
        {text(REVISION.competition.title, lang)}
      </Title>

      <div className="fsm-block">
        <Kicker>{text(salonLayer.label, lang)}</Kicker>
        <ul className="fsm-cards" style={{ marginTop: 12 }}>
          {salonLayer.players.map((player) => (
            <li key={player.name.en} className="fsm-card">
              <h3 className="fsm-label" style={{ fontSize: 14, color: "var(--fsm-fg)" }}>
                <bdi>{text(player.name, lang)}</bdi>
              </h3>
              {"adoption" in player ? (
                <ul style={{ marginTop: 8 }}>
                  {player.adoption.map((line) => (
                    <li key={line.en} className="fsm-caption">
                      {text(line, lang)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 12px" }}>
                {"value" in player && player.value ? (
                  <p className="fsm-figure fsm-figure--l fsm-figure--accent">{text(player.value, lang)}</p>
                ) : null}
                {"note" in player && player.note ? <p className="fsm-label">{text(player.note, lang)}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dl className="fsm-block">
        <hr className="fsm-rule fsm-rule--strong" />
        {otherLayers.map((row) => (
          <div key={row.label.en} className="fsm-layer">
            <dt className="fsm-label">{text(row.label, lang)}</dt>
            <dd className="fsm-layer__players">{row.players.map((player) => text(player.name, lang)).join("  ·  ")}</dd>
          </div>
        ))}
      </dl>

      <div className="fsm-block">
        <p className="fsm-title fsm-title--sub fsm-title--accent fsm-italic">{text(REVISION.competition.spectra, lang)}</p>
        <p className="fsm-fine" style={{ marginTop: 12 }}>
          {text(REVISION.competition.sources, lang)}
        </p>
      </div>
    </MobileSlide>
  );
};

/* ------------------------------------------------------------------- 13 Team */

const TeamSection: React.FC<SlideProps> = ({ lang, variant }) => {
  const { founders, achela, coreTeam } = FOUNDER_STORY_TEAM;
  return (
    <MobileSlide number={13} lang={lang} variant={variant}>
      <Title number={13} size="chapter">
        {text(REVISION.founders.title, lang)}
      </Title>

      <ul className="fsm-team-founders fsm-block" style={{ rowGap: 28, display: "grid" }}>
        {founders.map(({ media, member, role, focus, why }) => (
          <li key={media.key} className="fsm-founder">
            <div className="fsm-founder__head">
              <div className="fsm-founder__photo">
                <img
                  src={media.src}
                  alt={founderPortraitAlt(member.name, role, lang)}
                  width={959}
                  height={1200}
                  loading="lazy"
                  style={{ objectPosition: media.objectPosition }}
                />
              </div>
              <div>
                <h3 className="fsm-name">{text(member.name, lang)}</h3>
                <p className="fsm-label" style={{ marginTop: 8 }}>
                  {text(role, lang)}
                </p>
              </div>
            </div>
            <p className="fsm-body" style={{ color: "var(--fsm-strong)" }}>
              {text(focus, lang)}
            </p>
            <p className="fsm-caption">{text(why, lang)}</p>
          </li>
        ))}
      </ul>

      <div className="fsm-block">
        <Kicker>{text(REVISION.founders.techKicker, lang)}</Kicker>
        <dl style={{ marginTop: 12 }}>
          <div className="fsm-person">
            <dt className="fsm-name">{text(achela.member.name, lang)}</dt>
            <dd className="fsm-label" style={{ marginTop: 6 }}>
              {text(achela.role, lang)}
            </dd>
            <dd className="fsm-body" style={{ marginTop: 8 }}>
              {text(achela.focus, lang)}
            </dd>
            <dd className="fsm-caption" style={{ marginTop: 6 }}>
              {text(achela.why, lang)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="fsm-block">
        <Kicker>{text(REVISION.founders.teamKicker, lang)}</Kicker>
        <dl style={{ marginTop: 12 }}>
          {coreTeam.map((member) => (
            <div key={member.name.en} className="fsm-person">
              <dt className="fsm-name">{text(member.name, lang)}</dt>
              <dd className="fsm-label" style={{ marginTop: 6 }}>
                {text(member.role, lang)}
              </dd>
              <dd className="fsm-caption" style={{ marginTop: 6 }}>
                {text(member.why, lang)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </MobileSlide>
  );
};

/* -------------------------------------------------------------- 14 Advisors */

const AdvisorsSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide number={14} lang={lang} variant={variant} tone="warm">
    <Title number={14} size="chapter">
      {text(REVISION.advisors.title, lang)}
    </Title>
    <dl className="fsm-block">
      {REVISION.advisors.people.map((person) => (
        <div key={person.name.en} className="fsm-person">
          <dt className="fsm-name">{text(person.name, lang)}</dt>
          <dd className="fsm-label" style={{ marginTop: 6 }}>
            {text(person.role, lang)}
          </dd>
          {nonEmpty(person.background, lang) ? (
            <dd className="fsm-caption" style={{ marginTop: 6 }}>
              {text(person.background, lang)}
            </dd>
          ) : null}
          <dd className="fsm-body" style={{ marginTop: 8, color: "var(--fsm-strong)" }}>
            {text(person.help, lang)}
          </dd>
        </div>
      ))}
    </dl>
  </MobileSlide>
);

/* ------------------------------------------------------------------ 15 Raise */

const RaiseSection: React.FC<SlideProps> = ({ lang, variant }) => {
  const raise = variant.raise;
  return (
    <MobileSlide number={15} lang={lang} variant={variant}>
      <Kicker>{text(raise.kicker, lang)}</Kicker>
      <p className="fsm-figure fsm-figure--hero" style={{ marginTop: 12 }}>
        {raise.amount.en}
      </p>
      <p className="fsm-label" style={{ marginTop: 8 }}>
        {text(raise.raisedToDate, lang)}
      </p>
      {nonEmpty(raise.body, lang) ? (
        <p className="fsm-body" style={{ marginTop: 8 }}>
          {text(raise.body, lang)}
        </p>
      ) : null}

      <Title number={15} size="chapter" style={{ marginTop: 24 }}>
        {text(raise.title, lang)}
      </Title>
      {raise.narrative.length ? (
        <div className="fsm-stack" style={{ marginTop: 16, "--fsm-gap": "8px" } as React.CSSProperties}>
          {raise.narrative.map((paragraph) => (
            <p key={paragraph.en} className="fsm-body">
              {text(paragraph, lang)}
            </p>
          ))}
        </div>
      ) : null}

      <section className="fsm-block" aria-label={text(DECK_UI_COPY.raiseMissionsKicker, lang)}>
        <Kicker style={{ color: "var(--fsm-muted)" }}>{text(DECK_UI_COPY.raiseMissionsKicker, lang)}</Kicker>
        <ol className="fsm-missions" style={{ marginTop: 12 }}>
          {raise.columns.map((item, index) => (
            <li key={item.title.en} className="fsm-mission">
              <span className="fsm-mission__index" aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3 className="fsm-title fsm-title--sub fsm-title--accent" style={{ fontSize: "clamp(26px, 7vw, 32px)" }}>
                  {text(item.title, lang)}
                </h3>
                <p className="fsm-body" style={{ marginTop: 6 }}>
                  {keepBrands(text(item.body, lang))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="fsm-block" aria-label={text(REVISION.raise.fundsLabel, lang)}>
        <Kicker style={{ color: "var(--fsm-muted)" }}>{text(REVISION.raise.fundsLabel, lang)}</Kicker>
        <ul className="fsm-funds" style={{ marginTop: 12 }}>
          {raise.funds.map((item) => (
            <li key={item.label.en} className="fsm-fund">
              <h3 className="fsm-kicker">{text(item.label, lang)}</h3>
              <p className="fsm-body" style={{ marginTop: 6 }}>
                {keepBrands(text(item.body, lang))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="fsm-block">
        <p className="fsm-title fsm-title--quote">{text(raise.conclusion, lang)}</p>
        {nonEmpty(raise.finePrint, lang) ? (
          <p className="fsm-fine" style={{ marginTop: 10 }}>
            {text(raise.finePrint, lang)}
          </p>
        ) : null}
      </div>
    </MobileSlide>
  );
};

/* ------------------------------------------------------------------- 16 Exit */

const ExitSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide number={16} lang={lang} variant={variant}>
    <Title number={16} size="chapter">
      {text(REVISION.exit.title, lang)}
    </Title>
    {nonEmpty(REVISION.exit.tags, lang) ? (
      <Kicker style={{ marginTop: 14, color: "var(--fsm-muted)" }}>{text(REVISION.exit.tags, lang)}</Kicker>
    ) : null}

    <ul className="fsm-panels--2 fsm-block">
      {REVISION.exit.categories.map((item) => (
        <li key={item.label.en} className="fsm-panel">
          <h3 className="fsm-kicker" style={{ display: "flex", gap: 12 }}>
            <span className="fsm-ltr" style={{ color: "var(--fsm-faint)" }}>
              {item.serial}
            </span>
            <span>{text(item.label, lang)}</span>
          </h3>
          <p
            dir="ltr"
            style={{
              marginTop: 10,
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "var(--fsm-strong)",
              textAlign: lang === "he" ? "right" : "left",
            }}
          >
            {item.names.join("  ·  ")}
          </p>
          <p className="fsm-body" style={{ marginTop: 8 }}>
            {text(item.body, lang)}
          </p>
        </li>
      ))}
    </ul>

    <div className="fsm-block">
      <p className="fsm-title fsm-title--quote">{text(REVISION.exit.close, lang)}</p>
      {nonEmpty(REVISION.exit.disclaimer, lang) ? (
        <p className="fsm-fine" style={{ marginTop: 12 }}>
          {text(REVISION.exit.disclaimer, lang)}
        </p>
      ) : null}
    </div>
  </MobileSlide>
);

/* ---------------------------------------------------------------- 17 Closing */

const ClosingSection: React.FC<SlideProps> = ({ lang, variant }) => (
  <MobileSlide
    number={17}
    lang={lang}
    variant={variant}
    tone="ink"
    bleed={{
      image: MEDIA.reception,
      overlay: "linear-gradient(170deg,rgba(9,6,4,0.94),rgba(9,6,4,0.84))",
      opacity: 0.26,
    }}
  >
    <Kicker>{text(FINAL_CLOSE.kicker, lang)}</Kicker>
    <Title number={17} size="cover" style={{ marginTop: 16 }}>
      {text(FINAL_CLOSE.title, lang)}
    </Title>
    <p className="fsm-lede fsm-block">{keepBrands(text(FINAL_CLOSE.body, lang))}</p>
    <p className="fsm-title fsm-title--feature fsm-title--accent fsm-block">{text(FINAL_CLOSE.ask, lang)}</p>

    <hr className="fsm-rule fsm-rule--strong" style={{ marginTop: 36 }} />
    <div className="fsm-block--tight">
      <p className="fsm-caption">{text(FINAL_CLOSE.signoff, lang)}</p>
      <p className="fsm-title fsm-title--sub" style={{ marginTop: 10 }}>
        {text(FINAL_CLOSE.names, lang)}
      </p>
      <p className="fsm-label" style={{ marginTop: 8 }}>
        {text(FINAL_CLOSE.role, lang)}
      </p>
    </div>

    <address className="fsm-block" style={{ fontStyle: "normal" }}>
      <ul className="fsm-stack" style={{ "--fsm-gap": "10px" } as React.CSSProperties}>
        {FINAL_CLOSE.contacts.map((person) => (
          <li key={person.email} className="fsm-contact">
            <span className="fsm-caption">{text(person.name, lang)}</span>
            <a href={`mailto:${person.email}`} dir="ltr">
              {person.email}
            </a>
          </li>
        ))}
      </ul>
      <ul className="fsm-links" dir="ltr" aria-label={text(MOBILE_UI.social, lang)} style={{ marginTop: 10 }}>
        {(
          [
            { ...FINAL_CLOSE.social.instagram, Icon: SPECTRA_SOCIAL[0].Icon },
            { ...FINAL_CLOSE.social.youtube, Icon: SPECTRA_SOCIAL[1].Icon },
          ] as const
        ).map((item) => (
          <li key={item.href}>
            <a className="fsm-link" href={item.href} target="_blank" rel="noreferrer">
              <item.Icon size={17} strokeWidth={1.6} aria-hidden="true" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </address>

    <div className="fsm-block">
      <SalonAiLockup tone="ink" size="close" reducedMotion />
    </div>
  </MobileSlide>
);

/* ------------------------------------------------------------------- deck */

const MOBILE_SECTIONS: readonly React.FC<SlideProps>[] = [
  CoverSection,
  OriginSection,
  ColorSection,
  AdoptionSection,
  CommercialSection,
  TurningPointSection,
  DataLayerSection,
  MarketSection,
  OpportunitySection,
  SalonAiSection,
  BusinessModelSection,
  CompetitionSection,
  TeamSection,
  AdvisorsSection,
  RaiseSection,
  ExitSection,
  ClosingSection,
];

export const FOUNDER_STORY_MOBILE_SECTION_COUNT = MOBILE_SECTIONS.length;

const slideOptionLabel = (index: number, variant: DeckVariant, lang: Lang) =>
  `${pad(index + 1)} · ${text(SLIDE_META[index].heading(variant), lang).replace(/\n/g, " ")}`;

export const FounderStoryMobilePresentation: React.FC<{
  lang: Lang;
  variant: DeckVariant;
  onLangChange: (lang: Lang) => void;
}> = ({ lang, variant, onLangChange }) => {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [active, setActive] = React.useState(0);
  const activeRef = React.useRef(0);
  const settleUntil = React.useRef(0);

  const sections = React.useCallback(
    () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-mobile-slide]") ?? []),
    [],
  );

  const goTo = React.useCallback(
    (index: number, behavior?: ScrollBehavior) => {
      const next = Math.max(0, Math.min(TOTAL - 1, index));
      const target = sections()[next];
      if (!target) return;
      settleUntil.current = Date.now() + (reducedMotion ? 80 : 900);
      activeRef.current = next;
      setActive(next);
      target.scrollIntoView({ behavior: behavior ?? (reducedMotion ? "instant" : "smooth"), block: "start" });
    },
    [reducedMotion, sections],
  );

  React.useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (Date.now() < settleUntil.current) return;
      const nodes = sections();
      if (!nodes.length) return;
      const line = window.innerHeight * 0.38;
      let current = 0;
      nodes.forEach((node, index) => {
        if (node.getBoundingClientRect().top <= line) current = index;
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = nodes.length - 1;
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActive(current);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  React.useEffect(() => {
    const match = /^#slide-(\d{2})$/.exec(window.location.hash);
    if (!match) return;
    const index = Number(match[1]) - 1;
    if (index > 0 && index < TOTAL) {
      window.requestAnimationFrame(() => goTo(index, "instant"));
    }
    // Only honour the deep link on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const params = window.location.search;
    const hash = active === 0 ? "" : `#${mobileSlideAnchor(active + 1)}`;
    window.history.replaceState(null, "", `${window.location.pathname}${params}${hash}`);
  }, [active]);

  const previousLang = React.useRef(lang);
  React.useLayoutEffect(() => {
    if (previousLang.current === lang) return;
    previousLang.current = lang;
    const target = sections()[activeRef.current];
    if (target && activeRef.current > 0) target.scrollIntoView({ behavior: "instant", block: "start" });
  }, [lang, sections]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isInteractiveTarget(event.target)) return;
      const forward = lang === "he" ? "ArrowLeft" : "ArrowRight";
      const backward = lang === "he" ? "ArrowRight" : "ArrowLeft";
      if (event.key === forward) {
        event.preventDefault();
        goTo(activeRef.current + 1);
      } else if (event.key === backward) {
        event.preventDefault();
        goTo(activeRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, lang]);

  const PreviousIcon = lang === "he" ? ChevronRight : ChevronLeft;
  const NextIcon = lang === "he" ? ChevronLeft : ChevronRight;

  return (
    <div
      ref={rootRef}
      className="fsm"
      lang={lang}
      dir={dirFor(lang)}
      data-testid="founder-story-mobile"
      style={{
        fontFamily:
          lang === "he"
            ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
            : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header className="fsm-header">
        <div className="fsm-header__brand">
          <SalonAiLockup />
        </div>
        <div className="fsm-header__tools">
          <div className="fsm-lang" role="group" aria-label={text(MOBILE_UI.language, lang)} dir="ltr">
            {(["en", "he"] as Lang[]).map((option) => (
              <button
                key={option}
                type="button"
                lang={option}
                className="fsm-lang__button"
                aria-pressed={lang === option}
                onClick={() => onLangChange(option)}
              >
                {option === "en" ? "EN" : "עברית"}
              </button>
            ))}
          </div>
        </div>
        <div
          className="fsm-progress"
          role="progressbar"
          aria-label={text(MOBILE_UI.slide, lang)}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={active + 1}
          aria-valuetext={`${active + 1} ${text(MOBILE_UI.of, lang)} ${TOTAL}`}
        >
          <span className="fsm-progress__bar" style={{ transform: `scaleX(${(active + 1) / TOTAL})` }} />
        </div>
      </header>

      <main data-testid="founder-story-mobile-sections">
        {MOBILE_SECTIONS.map((Section, index) => (
          <Section key={index} lang={lang} variant={variant} />
        ))}
      </main>

      <nav className="fsm-nav" aria-label={text(MOBILE_UI.navigation, lang)}>
        <button
          type="button"
          className="fsm-nav__step"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
        >
          <PreviousIcon size={18} aria-hidden="true" />
          <span>{text(MOBILE_UI.previous, lang)}</span>
        </button>
        <label className="fsm-jump">
          <span className="fsm-visually-hidden">{text(MOBILE_UI.jump, lang)}</span>
          <span className="fsm-jump__value fsm-ltr" aria-hidden="true">
            {pad(active + 1)} / {pad(TOTAL)}
          </span>
          <ChevronDown className="fsm-jump__caret" size={14} aria-hidden="true" />
          <select value={active} onChange={(event) => goTo(Number(event.target.value))}>
            {SLIDE_META.map((_, index) => (
              <option key={index} value={index}>
                {slideOptionLabel(index, variant, lang)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="fsm-nav__step"
          onClick={() => goTo(active + 1)}
          disabled={active === TOTAL - 1}
        >
          <span>{text(MOBILE_UI.next, lang)}</span>
          <NextIcon size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
};

export default FounderStoryMobilePresentation;
