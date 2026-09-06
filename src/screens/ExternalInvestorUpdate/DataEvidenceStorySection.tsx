import React from "react";
import { motion } from "framer-motion";
import { Sheet } from "./ColorBarPatterns";
import { CB, colorBarSans } from "./colorBarTokens";
import type { UpdateLang } from "./finalCopy";
import { SIX_SALON_SAMPLE } from "./intelligenceData";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  Reveal,
  Spread,
  figureAlign,
  loc,
  t as text,
} from "./EditorialPrimitives";

type DataEvidenceStorySectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const COPY = {
  kicker: loc("One view. One real example.", "מבט אחד. דוגמה אמיתית אחת."),
  title: loc(
    "Spectra sees what actually happened inside the service.",
    "Spectra רואה מה באמת קרה בתוך השירות.",
  ),
  support: loc(
    "Others see what moved through the market. Spectra sees what was used, for whom, and what changed.",
    "אחרים רואים מה עבר בשוק. Spectra רואה במה השתמשו, עבור מי ומה השתנה.",
  ),
  scaleLabel: loc("Real service events", "אירועי שירות אמיתיים"),
  scaleNote: loc(
    "Measured across the Spectra network from January 2023 to August 2026.",
    "נמדדו ברשת Spectra מינואר 2023 עד אוגוסט 2026.",
  ),
  question: loc(
    "Then we can ask a simple question across six salons:",
    "ואז אפשר לשאול שאלה פשוטה בשישה סלונים:",
  ),
  questionText: loc(
    "What color was actually consumed?",
    "איזה צבע באמת נצרך?",
  ),
  brunetteLead: loc(
    "of all color material consumed was brunette.",
    "מכל חומרי הצבע שנצרכו היו גוונים חומים.",
  ),
  changeLead: loc(
    "of clients changed color direction.",
    "מהלקוחות שינו כיוון צבע.",
  ),
  whyLabel: loc("Why this matters", "למה זה חשוב"),
  salonTitle: loc("For the salon", "לסלון"),
  salonBody: loc(
    "See material cost, service profitability and client behavior.",
    "לראות עלות חומר, רווחיות שירות והתנהגות לקוחות.",
  ),
  industryTitle: loc("For the industry", "לתעשייה"),
  industryBody: loc(
    "See real product demand, shade trends and portfolio opportunities.",
    "לראות ביקוש אמיתי למוצרים, מגמות גוון והזדמנויות בפורטפוליו.",
  ),
  close: loc(
    "The difference is simple: the market knows what was shipped. Spectra knows what was done.",
    "ההבדל פשוט: השוק יודע מה נשלח. Spectra יודעת מה נעשה.",
  ),
} as const;

const VANTAGE = [
  { source: loc("Manufacturer", "יצרן"), sees: loc("Shipped", "נשלח"), spectra: false },
  { source: loc("POS", "קופה"), sees: loc("Sold", "נמכר"), spectra: false },
  { source: loc("Booking", "יומן"), sees: loc("Scheduled", "נקבע"), spectra: false },
  { source: loc("Spectra", "Spectra"), sees: loc("Done", "נעשה"), spectra: true },
] as const;

const topShades = SIX_SALON_SAMPLE.products.slice(0, 3);
const maxShadeKg = topShades[0].kg;
const brunette = SIX_SALON_SAMPLE.families[0];

export const DataEvidenceStorySection: React.FC<DataEvidenceStorySectionProps> = ({
  lang,
  reducedMotion,
}) => (
  <Chapter
    id="six-salon-evidence"
    label={text(COPY.title, lang)}
    tone="warm"
    rhythm="feature"
  >
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <Kicker>{text(COPY.kicker, lang)}</Kicker>
        <div className="mt-5 grid gap-7 lg:grid-cols-[0.55fr_0.45fr] lg:items-end lg:gap-14">
          <Display lang={lang} size="chapter" className="max-w-[22ch]">
            {text(COPY.title, lang)}
          </Display>
          <Body className="max-w-[34rem]">{text(COPY.support, lang)}</Body>
        </div>

        <ol
          className="mt-9 grid grid-cols-2 border-y sm:grid-cols-4"
          style={{ borderColor: CB.lineStrong }}
          aria-label={lang === "he" ? "עומק המידע בתעשייה" : "Industry data depth"}
        >
          {VANTAGE.map((item, index) => (
            <motion.li
              key={item.source.en}
              className={`relative min-w-0 px-3 py-5 sm:px-5 ${
                index % 2 ? "border-s" : ""
              } ${index >= 2 ? "border-t sm:border-t-0" : ""} ${
                index > 0 ? "sm:border-s" : "sm:border-s-0"
              }`}
              style={{
                borderColor: item.spectra ? CB.copper : CB.line,
                backgroundColor: item.spectra ? "rgba(163,125,56,0.1)" : "transparent",
              }}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : index * 0.07 }}
            >
              <span
                className="text-[9px] font-extrabold uppercase tracking-[0.13em]"
                style={{ color: item.spectra ? CB.copperDeep : CB.muted }}
              >
                {text(item.source, lang)}
              </span>
              <strong
                className="mt-2 block text-[1.05rem] font-semibold tracking-[-0.025em]"
                style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              >
                {text(item.sees, lang)}
              </strong>
              {index < VANTAGE.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -end-2.5 top-1/2 z-10 hidden -translate-y-1/2 bg-[#F5F2EC] px-1 text-[1rem] sm:block"
                  style={{ color: CB.copper }}
                >
                  {lang === "he" ? "←" : "→"}
                </span>
              )}
            </motion.li>
          ))}
        </ol>

        <div className="mt-9 grid gap-7 border-b pb-9 lg:grid-cols-[0.34fr_0.66fr] lg:items-end" style={{ borderColor: CB.line }}>
          <div>
            <p
              dir="ltr"
              className={`text-[clamp(3.6rem,9vw,6.5rem)] font-semibold leading-[0.88] tabular-nums tracking-[-0.055em] ${figureAlign(lang)}`}
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
            >
              617K+
            </p>
            <Kicker className="mt-4">{text(COPY.scaleLabel, lang)}</Kicker>
            <Caption className="mt-2">{text(COPY.scaleNote, lang)}</Caption>
          </div>
          <div className="lg:border-s lg:ps-12" style={{ borderColor: CB.line }}>
            <Body>{text(COPY.question, lang)}</Body>
            <Display lang={lang} as="p" size="sub" className="mt-3 max-w-[24ch]">
              {text(COPY.questionText, lang)}
            </Display>
          </div>
        </div>

        <Sheet className="mt-9">
          <div className="grid gap-9 px-4 py-6 sm:px-7 sm:py-8 lg:grid-cols-[0.55fr_0.45fr] lg:gap-12">
            <div>
              <div className="flex items-end gap-5">
                <p
                  dir="ltr"
                  className={`text-[clamp(3.4rem,8vw,5.8rem)] font-semibold leading-[0.86] tabular-nums tracking-[-0.055em] ${figureAlign(lang)}`}
                  style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                >
                  {brunette.value}%
                </p>
                <Body className="max-w-[18rem] pb-1">{text(COPY.brunetteLead, lang)}</Body>
              </div>

              <div
                dir="ltr"
                className="mt-6 flex h-3 overflow-hidden rounded-full"
                role="img"
                aria-label={SIX_SALON_SAMPLE.families.map((family) => `${family.name} ${family.value}%`).join(", ")}
              >
                {SIX_SALON_SAMPLE.families.map((family) => (
                  <span
                    key={family.name}
                    style={{ width: `${family.value}%`, backgroundColor: family.color }}
                  />
                ))}
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  SIX_SALON_SAMPLE.totals[1],
                  SIX_SALON_SAMPLE.totals[2],
                  SIX_SALON_SAMPLE.totals[3],
                ].map((metric) => (
                  <div key={metric.value} className="border-t pt-3" style={{ borderColor: CB.line }}>
                    <dd className="text-[1.15rem] font-semibold tabular-nums tracking-[-0.03em]" style={{ color: CB.ink }}>
                      {metric.value}
                    </dd>
                    <dt className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: CB.muted }}>
                      {lang === "he" ? metric.he : metric.en}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border-t pt-7 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0" style={{ borderColor: CB.line }}>
              <p
                dir="ltr"
                className={`text-[clamp(2.8rem,6vw,4.4rem)] font-semibold leading-none tabular-nums tracking-[-0.05em] ${figureAlign(lang)}`}
                style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
              >
                {SIX_SALON_SAMPLE.journeyShare}
              </p>
              <Body className="mt-4 max-w-[18rem]">{text(COPY.changeLead, lang)}</Body>
              <Caption className="mt-2">
                {lang === "he"
                  ? `${SIX_SALON_SAMPLE.journeyClients} מסעות צבע מתוך ${SIX_SALON_SAMPLE.clientCount} לקוחות`
                  : `${SIX_SALON_SAMPLE.journeyClients} color journeys across ${SIX_SALON_SAMPLE.clientCount} clients`}
              </Caption>

              <Kicker className="mt-7">{lang === "he" ? "גוונים מובילים" : "Top shades used"}</Kicker>
              <ol className="mt-3 space-y-2">
                {topShades.map((shade) => (
                  <li key={shade.name} dir="ltr" className="grid grid-cols-[6.7rem_1fr_auto] items-center gap-3">
                    <span className="truncate text-[9px] font-bold uppercase tracking-[0.06em]" style={{ color: CB.ink }}>
                      {shade.name}
                    </span>
                    <span className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: CB.well }}>
                      <span
                        className="block h-full"
                        style={{ width: `${(shade.kg / maxShadeKg) * 100}%`, backgroundColor: shade.tone }}
                      />
                    </span>
                    <span className="text-[10px] tabular-nums" style={{ color: CB.muted }}>{shade.kg.toFixed(1)} kg</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Sheet>

        <div className="mt-9">
          <Kicker>{text(COPY.whyLabel, lang)}</Kicker>
          <div className="mt-4 grid border-y sm:grid-cols-2" style={{ borderColor: CB.lineStrong }}>
            <div className="py-6 sm:pe-8">
              <Display lang={lang} as="h3" size="sub">{text(COPY.salonTitle, lang)}</Display>
              <Body className="mt-3 max-w-[28rem]">{text(COPY.salonBody, lang)}</Body>
            </div>
            <div className="border-t py-6 sm:border-s sm:border-t-0 sm:ps-8" style={{ borderColor: CB.line }}>
              <Display lang={lang} as="h3" size="sub">{text(COPY.industryTitle, lang)}</Display>
              <Body className="mt-3 max-w-[28rem]">{text(COPY.industryBody, lang)}</Body>
            </div>
          </div>
          <Display lang={lang} as="p" size="sub" className="mt-7 max-w-[38ch]">
            {text(COPY.close, lang)}
          </Display>
          <Caption className="mt-3">{text(SIX_SALON_SAMPLE.caveat, lang)}</Caption>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);

export default DataEvidenceStorySection;
