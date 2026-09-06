import React from "react";
import { CB, colorBarSans } from "./colorBarTokens";
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
import { type UpdateLang } from "./finalCopy";

export type CanonicalCommercialSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/** Act IV: heavier ledger rules for the analytical second half. */
const ACT_IV = {
  ledger: "rgba(92,72,42,0.22)",
} as const;

const GTM_COPY = {
  kicker: loc("05 / GTM", "05 / GTM"),
  title: loc("We already learned how the market opens.", "כבר למדנו איך השוק נפתח."),
  lede: loc(
    "Until now, most of our energy went into product. Now we can invest more into the distribution engine that already created paying customers.",
    "עד היום רוב האנרגיה הלכה למוצר. עכשיו אפשר להשקיע יותר במנוע ההפצה שכבר יצר לקוחות משלמים.",
  ),
  routeLabel: loc("The route already in market", "המסלול שכבר עובד בשוק"),
  experimentLabel: loc("What the numbers taught us", "מה למדנו מהמספרים"),
  experimentTitle: loc(
    "One focused 11-month test showed us how the route converts.",
    "ניסוי ממוקד של 11 חודשים הראה לנו איך המסלול הופך ללקוחות משלמים.",
  ),
  experimentNote: loc(
    "The budget included $18K in advertising, $15K in campaign management, and $7K in equipment and onboarding.",
    "התקציב כלל $18K לפרסום, $15K לניהול הקמפיין ו־$7K לציוד ולהטמעה.",
  ),
  proofLabel: loc("The business proof", "ההוכחה העסקית"),
  revenueLabel: loc("Total company revenue since inception", "סך הכנסות החברה מההקמה"),
  revenuePeriod: loc(
    "₪1,440,130 recorded in Admin, Nov 2022–Aug 2026, net of refunds. Converted at ₪3.005 per USD.",
    "₪1,440,130 נרשמו באדמין מנובמבר 2022 עד אוגוסט 2026, נטו לאחר החזרים. המרה לפי ₪3.005 לדולר.",
  ),
  next: loc(
    "Don't invent a new GTM. Increase speed, capacity and precision.",
    "לא צריך להמציא GTM חדש. צריך להגדיל קצב, קיבולת ודיוק.",
  ),
} as const;

const GTM_STAGES = [
  {
    title: loc("Professional community", "קהילה מקצועית"),
    detail: loc("Access to the right people", "גישה לאנשים הנכונים"),
  },
  {
    title: loc("Demo / trial", "דמו / ניסיון"),
    detail: loc("A short, clear experience", "חוויה קצרה וברורה"),
  },
  {
    title: loc("Onboarding", "הטמעה"),
    detail: loc("Product + scale + training", "מוצר + משקל + הדרכה"),
  },
  {
    title: loc("Usage", "שימוש"),
    detail: loc("Repeated use in every color service", "שימוש חוזר בכל שירות צבע"),
  },
  {
    title: loc("Referral", "המלצה"),
    detail: loc("Professionals bring professionals", "המקצוענים מביאים מקצוענים"),
  },
] as const;

const GTM_FUNNEL = [
  { value: "1,476", label: loc("Leads", "לידים"), width: "100%", conversion: undefined },
  { value: "301", label: loc("Trials", "התנסויות"), width: "62%", conversion: "20.4%" },
  { value: "96", label: loc("Paying customers", "לקוחות משלמים"), width: "40%", conversion: "31.9%" },
] as const;

const MODEL_COPY = {
  kicker: loc("09 / Model", "09 / מודל"),
  title: loc("Same customer. More value. More revenue.", "אותו לקוח. יותר ערך. יותר הכנסה."),
  lede: loc(
    "The model grows in two directions: deeper software value per salon, and aggregated intelligence for the industry.",
    "המודל גדל בשתי דרכים: עומק התוכנה לסלון, ואינטליגנציה מצרפית לשחקנים בענף.",
  ),
  arpuLabel: loc("Target average monthly ARPU", "יעד ARPU חודשי ממוצע"),
  laterLabel: loc("A second revenue stream, later", "ערוץ הכנסה שני, בהמשך"),
  privacy: loc(
    "We do not sell personal client data. The value is in aggregated, permissioned and anonymized intelligence.",
    "אנחנו לא מוכרים מידע אישי של לקוחות. הערך הוא בתובנות מצרפיות, מורשות ואנונימיות.",
  ),
  conclusion: loc(
    "SaaS increases ARPU. Data can create an additional revenue engine.",
    "SaaS מגדיל ARPU. הדאטה יכול לבנות מנוע הכנסה נוסף.",
  ),
} as const;

const MONTHLY_ARPU = [
  { value: "~$80", label: "Color Intelligence" },
  { value: "~$160", label: "SalonOS" },
  { value: "~$500", label: "Salon AI" },
] as const;

const LATER_STREAMS = [
  loc("Benchmark reports", "דוחות Benchmark"),
  loc("Manufacturer insights", "תובנות ליצרנים"),
  loc("Demand forecasting for distributors", "תחזית ביקוש למפיצים"),
  loc("Anonymous market panels", "פאנלים אנונימיים לשוק"),
] as const;

export const CanonicalGtmSection: React.FC<CanonicalCommercialSectionProps> = ({ lang, reducedMotion }) => (
  <Chapter id="gtm" label={text(GTM_COPY.title, lang)} tone="warm" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <Kicker>{text(GTM_COPY.kicker, lang)}</Kicker>
        <div className="mt-5 grid gap-x-14 gap-y-6 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <Display lang={lang} size="feature" className="max-w-[18ch]">
            {text(GTM_COPY.title, lang)}
          </Display>
          <Body className="max-w-[35rem]">{text(GTM_COPY.lede, lang)}</Body>
        </div>

        <div className="mt-11">
          <Kicker>{text(GTM_COPY.routeLabel, lang)}</Kicker>
          <ol className="mt-5 grid border-y sm:grid-cols-5" style={{ borderColor: CB.lineStrong }}>
            {GTM_STAGES.map((stage, index) => (
              <li
                key={stage.title.en}
                className={`relative min-w-0 py-5 sm:px-4 sm:py-6 ${
                  index > 0 ? "border-t sm:border-s sm:border-t-0" : ""
                }`}
                style={{ borderColor: CB.line }}
              >
                <span
                  dir="ltr"
                  className="block text-[10px] font-extrabold tabular-nums tracking-[0.14em]"
                  style={{ color: CB.copperDeep }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                  className="mt-5 text-[1.05rem] font-semibold leading-[1.15] tracking-[-0.025em]"
                >
                  {text(stage.title, lang)}
                </h3>
                <p className="mt-2 text-[12px] leading-[1.55]" style={{ color: CB.muted }}>
                  {text(stage.detail, lang)}
                </p>
                {index < GTM_STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[0.7rem] end-0 z-10 hidden bg-[#F5F2EC] px-1 text-[1rem] sm:-end-[0.6rem] sm:bottom-auto sm:top-6 sm:block"
                    style={{ color: CB.copper }}
                  >
                    {lang === "he" ? "←" : "→"}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10">
          <Kicker>{text(GTM_COPY.experimentLabel, lang)}</Kicker>
          <Display lang={lang} as="p" size="sub" className="mt-4 max-w-[34ch]">
            {text(GTM_COPY.experimentTitle, lang)}
          </Display>
          <div
            className="mt-6 grid gap-8 border-y py-7 lg:grid-cols-[0.24fr_0.76fr] lg:gap-12 lg:py-9"
            style={{ borderColor: CB.lineStrong }}
          >
            <dl className="grid grid-cols-2 gap-5 lg:grid-cols-1 lg:content-between">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: CB.muted }}>
                  {lang === "he" ? "השקעה בניסוי" : "Test investment"}
                </dt>
                <dd
                  dir="ltr"
                  className={`mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-none tracking-[-0.05em] ${figureAlign(lang)}`}
                  style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                >
                  $40K
                </dd>
              </div>
              <div className="border-s ps-5 lg:border-s-0 lg:border-t lg:ps-0 lg:pt-5" style={{ borderColor: CB.line }}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: CB.muted }}>
                  {lang === "he" ? "תקופת המדידה" : "Measured over"}
                </dt>
                <dd className="mt-3 text-[1.35rem] font-semibold" style={{ color: CB.ink }}>
                  {lang === "he" ? "11 חודשים" : "11 months"}
                </dd>
              </div>
            </dl>

            <div dir="ltr" className="min-w-0">
              <div className="space-y-3">
                {GTM_FUNNEL.map((stage, index) => (
                  <div key={stage.value}>
                    {stage.conversion && (
                      <p className="mb-1.5 text-end text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: CB.copperDeep }}>
                        {stage.conversion} {lang === "he" ? "המרה" : "conversion"}
                      </p>
                    )}
                    <div
                      className="flex min-h-[4rem] items-center justify-between gap-4 rounded-e-[10px] border-s-[3px] px-4"
                      style={{
                        width: stage.width,
                        minWidth: index === GTM_FUNNEL.length - 1 ? "13rem" : undefined,
                        borderColor: CB.copper,
                        backgroundColor:
                          index === 0
                            ? "rgba(163,125,56,0.09)"
                            : index === 1
                              ? "rgba(163,125,56,0.16)"
                              : "rgba(163,125,56,0.26)",
                      }}
                    >
                      <strong
                        className="text-[clamp(1.55rem,3vw,2.45rem)] font-semibold tabular-nums tracking-[-0.045em]"
                        style={{ color: CB.ink }}
                      >
                        {stage.value}
                      </strong>
                      <span
                        dir={lang === "he" ? "rtl" : "ltr"}
                        className="text-end text-[10px] font-extrabold uppercase tracking-[0.12em]"
                        style={{ color: CB.copperDeep }}
                      >
                        {text(stage.label, lang)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4 border-t pt-5" style={{ borderColor: CB.line }}>
                <span aria-hidden="true" className="text-[1.2rem]" style={{ color: CB.copper }}>→</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: CB.muted }}>
                    {lang === "he" ? "ARR של הקבוצה" : "Cohort ARR"}
                  </p>
                  <p className="mt-1 text-[1.65rem] font-semibold tracking-[-0.04em]" style={{ color: CB.ink }}>
                    $64.7K
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Caption className="mt-3">{text(GTM_COPY.experimentNote, lang)}</Caption>
        </div>

        <div className="mt-11 grid gap-x-12 gap-y-8 border-t pt-9 lg:grid-cols-[0.5fr_0.5fr]" style={{ borderColor: CB.line }}>
          <div>
            <Kicker>{text(GTM_COPY.proofLabel, lang)}</Kicker>
            <div className="mt-5 border-y py-6" style={{ borderColor: CB.lineStrong }}>
              <p
                dir="ltr"
                style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                className={`text-[clamp(3rem,7vw,5.25rem)] font-semibold leading-none tabular-nums tracking-[-0.055em] ${figureAlign(
                  lang,
                )}`}
              >
                ~$479K
              </p>
              <p
                className="mt-4 text-[11px] font-extrabold uppercase leading-[1.4] tracking-[0.14em]"
                style={{ color: CB.copperDeep }}
              >
                {text(GTM_COPY.revenueLabel, lang)}
              </p>
              <Caption className="mt-2">{text(GTM_COPY.revenuePeriod, lang)}</Caption>
            </div>
          </div>
          <div className="border-t pt-7 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0" style={{ borderColor: CB.lineStrong }}>
            <span aria-hidden="true" className="block h-px w-12" style={{ backgroundColor: CB.copper }} />
            <Display lang={lang} as="p" size="sub" className="mt-5 max-w-[28ch]">
              {text(GTM_COPY.next, lang)}
            </Display>
          </div>
        </div>

      </Reveal>
    </Spread>
  </Chapter>
);

export const CanonicalModelSection: React.FC<CanonicalCommercialSectionProps> = ({ lang, reducedMotion }) => (
  <Chapter id="model" label={text(MODEL_COPY.title, lang)} tone="paper" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <Kicker>{text(MODEL_COPY.kicker, lang)}</Kicker>
        <div className="mt-5 grid gap-x-14 gap-y-6 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <Display lang={lang} size="chapter" className="max-w-[18ch]">
            {text(MODEL_COPY.title, lang)}
          </Display>
          <Body className="max-w-[35rem]">{text(MODEL_COPY.lede, lang)}</Body>
        </div>

        <div className="mt-10 grid gap-x-14 gap-y-8 lg:grid-cols-[0.58fr_0.42fr]">
          <div>
            <Kicker>{text(MODEL_COPY.arpuLabel, lang)}</Kicker>
            <ol className="mt-5 border-y-2" style={{ borderColor: ACT_IV.ledger }}>
              {MONTHLY_ARPU.map((tier, index) => (
                <li
                  key={tier.label}
                  className="grid grid-cols-[auto_1fr] items-baseline gap-7 py-4 sm:gap-12 sm:py-5"
                  style={index > 0 ? { borderTop: `1px solid ${ACT_IV.ledger}` } : undefined}
                >
                  <p
                    dir="ltr"
                    style={{
                      fontFamily: colorBarSans(lang),
                      color: index === MONTHLY_ARPU.length - 1 ? CB.copperDeep : CB.ink,
                    }}
                    className="text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-none tabular-nums tracking-[-0.05em]"
                  >
                    {tier.value}
                  </p>
                  <p
                    className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
                    style={{ color: CB.muted }}
                  >
                    {tier.label}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:border-s-2 lg:ps-10" style={{ borderColor: ACT_IV.ledger }}>
            <Kicker>{text(MODEL_COPY.laterLabel, lang)}</Kicker>
            <ul className="mt-5 border-y-2" style={{ borderColor: ACT_IV.ledger }}>
              {LATER_STREAMS.map((stream, index) => (
                <li
                  key={stream.en}
                  className="flex items-baseline gap-4 py-3.5 text-[0.95rem] font-semibold leading-[1.45]"
                  style={{
                    color: CB.ink,
                    ...(index > 0 ? { borderTop: `1px solid ${ACT_IV.ledger}` } : {}),
                  }}
                >
                  <span aria-hidden="true" className="text-[10px]" style={{ color: CB.copper }}>
                    ●
                  </span>
                  {text(stream, lang)}
                </li>
              ))}
            </ul>
            <Caption className="mt-5">{text(MODEL_COPY.privacy, lang)}</Caption>
          </div>
        </div>

        <div className="mt-10 grid gap-x-14 gap-y-6 border-t-2 pt-7 lg:grid-cols-[0.65fr_0.35fr]" style={{ borderColor: ACT_IV.ledger }}>
          <div>
            <span aria-hidden="true" className="block h-px w-12" style={{ backgroundColor: CB.copper }} />
            <Display lang={lang} as="p" size="chapter" className="mt-5 max-w-[26ch]">
              {text(MODEL_COPY.conclusion, lang)}
            </Display>
          </div>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);
