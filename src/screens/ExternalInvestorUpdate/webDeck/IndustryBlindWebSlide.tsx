import React from "react";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  EyeOff,
  Factory,
  PackageOpen,
  Scissors,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { CB_INK } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { MARKET_SALON_PHOTO } from "./MarketFieldSystem";
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

type Pair = { left: Localized; right: Localized; icon: LucideIcon };

const COPY = {
  eyebrow: { en: "One problem. Two sides.", he: "בעיה אחת. שני צדדים." },
  headlineLead: { en: "The beauty industry", he: "תעשיית היופי" },
  headlinePunch: { en: "runs blind.", he: "פועלת בעיוורון." },
  leftLabel: { en: "Salons", he: "סלונים" },
  centerLabel: { en: "The service", he: "השירות" },
  rightLabel: { en: "Brands & suppliers", he: "מותגים וספקים" },
  leftPairs: [
    { left: { en: "Booking", he: "תור" }, right: { en: "Execution", he: "ביצוע" }, icon: CalendarDays },
    { left: { en: "Payment", he: "תשלום" }, right: { en: "Margin", he: "מרווח" }, icon: CreditCard },
    { left: { en: "Purchase", he: "רכישה" }, right: { en: "Consumption", he: "צריכה" }, icon: ShoppingBag },
  ] satisfies readonly Pair[],
  leftBut: {
    en: "But not what actually happened.",
    he: "אבל לא מה שבאמת קרה.",
  },
  rightPairs: [
    { left: { en: "Sell-in", he: "Sell-in" }, right: { en: "Consumption", he: "צריכה" }, icon: PackageOpen },
    { left: { en: "Shipment", he: "משלוח" }, right: { en: "Usage", he: "שימוש" }, icon: Truck },
    { left: { en: "Orders", he: "הזמנות" }, right: { en: "Real demand", he: "ביקוש אמיתי" }, icon: ClipboardList },
  ] satisfies readonly Pair[],
  rightBut: {
    en: "But not how it was actually used.",
    he: "אבל לא איך זה באמת היה בשימוש.",
  },
  centerLead: {
    en: "Millions of services happen every day.",
    he: "מיליוני שירותים מתרחשים כל יום.",
  },
  centerClose: {
    en: "Almost none become usable operational data.",
    he: "כמעט אף אחד מהם לא הופך לדאטה תפעולי שמיש.",
  },
  reality: {
    en: "The service is where reality happens.",
    he: "השירות הוא המקום שבו המציאות מתרחשת.",
  },
  index: { en: "04 — The blind spot", he: "04 — נקודת העיוורון" },
  label: {
    en: "The beauty industry runs blind.",
    he: "תעשיית היופי פועלת בעיוורון.",
  },
} as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];
const termDir = (value: string) => (/[\u0590-\u05FF]/.test(value) ? "rtl" : "ltr");

/** `Booking ≠ Execution` — what each side can see next to what it cannot. */
const PairList: React.FC<{ lang: UpdateLang; items: readonly Pair[] }> = ({ lang, items }) => (
  <ul
    style={{
      margin: 0,
      padding: 0,
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      gap: 46,
    }}
  >
    {items.map((item) => {
      const left = text(item.left, lang);
      const right = text(item.right, lang);
      return (
        <li
          key={`${item.left.en}-${item.right.en}`}
          aria-label={lang === "he" ? `${left} אינו ${right}` : `${left} is not ${right}`}
          style={{ display: "flex", alignItems: "center", gap: 20 }}
        >
          <GoldNode icon={item.icon} size={46} />
          {/* Inherits the page direction so the pair reads in the order it is written. */}
          <span
            className="deck-pair"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              color: CB_INK.ink,
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <span dir={termDir(left)}>{left}</span>
            <span aria-hidden="true" style={{ color: CB_INK.gold }}>
              ≠
            </span>
            <span dir={termDir(right)} style={{ color: CB_INK.faint }}>
              {right}
            </span>
          </span>
        </li>
      );
    })}
  </ul>
);

const SideColumn: React.FC<{
  lang: UpdateLang;
  label: Localized;
  labelIcon: LucideIcon;
  pairs: readonly Pair[];
  but: Localized;
}> = ({ lang, label, labelIcon, pairs, but }) => (
  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 44 }}>
    <ZoneLabel icon={labelIcon}>{text(label, lang)}</ZoneLabel>
    <Rule />
    <PairList lang={lang} items={pairs} />
    <p
      style={{
        margin: 0,
        color: CB_INK.gold,
        fontSize: lang === "he" ? 24 : 25,
        fontWeight: 500,
        lineHeight: 1.35,
        letterSpacing: "-0.025em",
      }}
    >
      {text(but, lang)}
    </p>
  </div>
);

export const IndustryBlindWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <WebSlide
    id="web-deck-industry-blind"
    label={text(COPY.label, lang)}
    lang={lang}
    tone="ink"
    bleed={<InkAtmosphere image={MARKET_SALON_PHOTO} lang={lang} position="62% 46%" />}
    className="web-deck-industry-blind"
  >
    <SkinProvider skin="ink">
      <div style={{ ...slideBase(lang, "ink"), justifyContent: "space-between", gap: 40 }}>
      <div>
        <LayerMark>{text(COPY.index, lang)}</LayerMark>
        <Kicker style={{ marginTop: 30 }}>{text(COPY.eyebrow, lang)}</Kicker>
        <Display lang={lang} size="statement" style={{ marginTop: 26, maxWidth: 1180 }}>
          {text(COPY.headlineLead, lang)}{" "}
          <span style={{ color: CB_INK.gold }}>{text(COPY.headlinePunch, lang)}</span>
        </Display>
      </div>

      {/* The three zones centre in whatever the headline block leaves behind. */}
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
          pairs={COPY.leftPairs}
          but={COPY.leftBut}
        />

        <CenterPanel style={{ gap: 34, padding: "54px 54px 58px" }}>
          <ZoneLabel icon={Scissors} align="center">
            {text(COPY.centerLabel, lang)}
          </ZoneLabel>
          <GoldNode icon={EyeOff} size={84} accent />
          <Body style={{ textAlign: "center" }}>{text(COPY.centerLead, lang)}</Body>
          <p
            style={{
              margin: 0,
              color: CB_INK.ink,
              fontSize: lang === "he" ? 36 : 38,
              fontWeight: 600,
              lineHeight: 1.26,
              letterSpacing: "-0.035em",
              textAlign: "center",
            }}
          >
            {text(COPY.centerClose, lang)}
          </p>
          <Rule style={{ width: 120 }} />
          <p
            style={{
              margin: 0,
              color: CB_INK.gold,
              fontSize: lang === "he" ? 23 : 24,
              fontWeight: 500,
              lineHeight: 1.35,
              letterSpacing: "-0.022em",
              textAlign: "center",
            }}
          >
            {text(COPY.reality, lang)}
          </p>
        </CenterPanel>

        <SideColumn
          lang={lang}
          label={COPY.rightLabel}
          labelIcon={Factory}
          pairs={COPY.rightPairs}
          but={COPY.rightBut}
        />
        </div>
      </div>
    </SkinProvider>
  </WebSlide>
);
