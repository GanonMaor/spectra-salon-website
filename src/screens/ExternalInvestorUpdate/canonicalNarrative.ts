/**
 * The canonical investor narrative: the thirteen steps of
 * `Spectra_SalonAI_Investor_Narrative_EN_1.pdf` and its Hebrew twin
 * `Spectra_SalonAI_Investor_Narrative_v1_1.pdf`, in deck order.
 *
 * The PDFs are the source of truth for message, order and numbers. Nothing in
 * this file may be rounded, re-scaled, merged or improved: every figure, list
 * and caveat is transcribed as printed, and the caveats travel with the numbers
 * they qualify so a section cannot render a claim without its limits.
 *
 * Copy is bilingual because the deck is. Strings the deck sets in Latin on both
 * language slides (brand names, chapter titles, source notes) are typed as
 * plain `string` rather than `Localized`, which is why `chapter`, `members`,
 * `stack` and `sources` are not translated here.
 */

import type { Localized } from "./finalCopy";

/** Local so the manifest stays a pure data module with no React imports. */
const loc = (en: string, he: string): Localized => ({ en, he });

export const CANONICAL_STEP_IDS = [
  "thesis",
  "market",
  "wedge",
  "proof",
  "gtm",
  "platform",
  "salon-ai",
  "data",
  "model",
  "landscape",
  "team",
  "raise",
  "optionality",
] as const;

export type CanonicalStepId = (typeof CANONICAL_STEP_IDS)[number];

/** A figure exactly as printed, with the label that gives it meaning. */
export type CanonicalMetric = {
  /** Set `dir="ltr"`: transcribed with its currency, tilde and plus sign. */
  value: string;
  label: Localized;
  detail?: Localized;
  /**
   * Relative magnitude for proportional rules only, derived from `value` and
   * never displayed. Present only where the deck itself argues about scale.
   */
  weight?: number;
};

/** A named consequence, capability, audience or person. */
export type CanonicalFact = {
  /** Serial only where the slide prints one. */
  serial?: string;
  term: Localized;
  /** Sub-label the deck sets in Latin on both slides, e.g. a role. */
  meta?: string;
  detail?: Localized;
};

/** A cluster of named third parties: a competitor set, or an acquirer type. */
export type CanonicalGroup = {
  serial?: string;
  label: Localized;
  detail?: Localized;
  members: readonly string[];
};

export type CanonicalAllocation = {
  percent: number;
  label: Localized;
  detail: Localized;
};

export type CanonicalStep = {
  /** Slide number as printed, e.g. `"02"`. */
  serial: string;
  id: CanonicalStepId;
  /** Chapter title, printed in Latin caps on both language slides. */
  chapter: string;
  headline: Localized;
  support: Localized;
  /** Centre label of a hub-and-spoke slide. */
  hub?: { term: Localized; detail?: Localized };
  metricsLabel?: Localized;
  metrics?: readonly CanonicalMetric[];
  facts?: readonly CanonicalFact[];
  groups?: readonly CanonicalGroup[];
  /** Spectra's own layered position, printed in Latin on both slides. */
  stack?: readonly string[];
  allocation?: readonly CanonicalAllocation[];
  termsLabel?: Localized;
  terms?: readonly Localized[];
  /** A pointed aside set beside the main figure. */
  note?: Localized;
  /** The line the slide lands on. */
  statement?: Localized;
  /** Scope or measurement limit. Renders wherever the numbers render. */
  caveat?: Localized;
  /** Verbatim source or verification note, English on both slides. */
  sources?: string;
  /** How the live page differs from the slide, and why that is sanctioned. */
  presentation?: string;
};

export const CANONICAL_NARRATIVE = [
  {
    serial: "01",
    id: "thesis",
    chapter: "Thesis",
    headline: loc(
      "We solved the hard part. Now we're building the autonomous salon.",
      "פיצחנו את החלק הקשה. עכשיו אנחנו בונים את הסלון האוטונומי.",
    ),
    support: loc(
      "Spectra started in the color room, where product cost, inventory, craft and client experience all meet. Today, that same data layer is becoming the foundation of Salon AI.",
      "Spectra התחילה בחדר הצבע, שם כסף, מלאי, מקצועיות ולקוח נפגשים. היום אותה שכבת דאטה הופכת לבסיס של Salon AI.",
    ),
    presentation:
      "The live hero opens on the approved cars-to-autonomous-salon framing instead of this headline. That substitution is a sanctioned presentation exception for the thesis beat only; the deck's thesis meaning is preserved verbatim in `headline` and `support` and must stay intact here.",
  },
  {
    serial: "02",
    id: "market",
    chapter: "Market",
    headline: loc(
      "The market is huge even before you add software.",
      "השוק גדול עוד לפני שמדברים על תוכנה.",
    ),
    support: loc(
      "Three overlapping economic layers around one salon. Shown for scale, not added.",
      "שלוש שכבות כלכליות חופפות סביב אותו סלון. קנה מידה, לא סכום.",
    ),
    metrics: [
      {
        value: "$636B",
        label: loc("Beauty & personal care products, 2026", "מוצרי ביוטי וטיפוח אישי, 2026"),
        weight: 636,
      },
      {
        value: "$285B",
        label: loc("Global salon services, 2026", "שירותי סלון בעולם, 2026"),
        weight: 285,
      },
      {
        value: "$219B",
        label: loc("Salon hair-care services, 2026", "שירותי שיער בסלונים, 2026"),
        weight: 219,
      },
    ],
    statement: loc(
      "We sit where services, products and software overlap, in a market measured in hundreds of billions.",
      "אנחנו פועלים במקום שבו שירות, מוצר ותוכנה נפגשים. התעשייה נמדדת במאות מיליארדי דולרים.",
    ),
    caveat: loc(
      "Market layers overlap and are shown for scale, not as additive TAM.",
      "שכבות השוק חופפות ומוצגות לקנה מידה, לא כ-TAM מסוכם.",
    ),
    sources: "Sources: Mordor Intelligence (2026); Fortune Business Insights (2026).",
  },
  {
    serial: "03",
    id: "wedge",
    chapter: "Wedge",
    headline: loc(
      "We solved a real problem. Along the way, we built something bigger.",
      "פתרנו בעיה גדולה. בדרך בנינו משהו גדול יותר.",
    ),
    support: loc(
      "The color room was manual and invisible. It is where craft, inventory, product cost and client experience meet. We turned every mix into data.",
      "חדר הצבע היה ידני ולא מדיד. שם מקצועיות, מלאי, עלות חומר וחוויית הלקוח נפגשים. הפכנו כל ערבוב לדאטה.",
    ),
    metrics: [
      {
        value: "30M+",
        label: loc("grams of color measured in real use", "גרם צבע שנמדדו בפועל"),
      },
    ],
    facts: [
      {
        term: loc("Less waste", "פחות בזבוז"),
        detail: loc(
          "Salons see what was used, what was discarded and what needs to change.",
          "הסלון רואה מה נצרך, מה נזרק ומה צריך להשתנות.",
        ),
      },
      {
        term: loc("Higher efficiency & profitability", "יותר יעילות ורווחיות"),
        detail: loc(
          "Product cost becomes a number you can actually manage.",
          "עלות החומר הופכת מחור שחור למספר שאפשר לנהל.",
        ),
      },
      {
        term: loc("Professional memory for every client", "זיכרון מקצועי לכל לקוח"),
        detail: loc(
          "Formulas, quantities and history persist across visits.",
          "פורמולות, כמויות והיסטוריה נשמרות לאורך ביקורים.",
        ),
      },
      {
        term: loc("A personalized client journey", "מסע לקוח פרסונלי"),
        detail: loc(
          "Hundreds of thousands of past visits give real context for the next service.",
          "מאות אלפי ביקורים יוצרים הקשר אמיתי לשירות הבא.",
        ),
      },
    ],
  },
  {
    serial: "04",
    id: "proof",
    chapter: "Proof",
    headline: loc("The proof is real usage, not a pitch.", "ההוכחה היא שימוש אמיתי, לא מצגת."),
    support: loc(
      "Spectra already operates with real salons, professionals, products and clients.",
      "Spectra כבר פועלת עם סלונים, אנשי מקצוע, מוצרים ולקוחות אמיתיים.",
    ),
    metrics: [
      { value: "170+", label: loc("Salons", "סלונים") },
      { value: "12", label: loc("Countries", "מדינות") },
      { value: "500+", label: loc("Professionals", "אנשי מקצוע") },
      {
        value: "~$130K",
        label: loc("ARR", "ARR"),
        detail: loc(
          "Recurring revenue built from the first product",
          "הכנסה חוזרת שנבנתה מהמוצר הראשון",
        ),
      },
      { value: "<5%", label: loc("Historical churn", "נטישה היסטורית") },
      {
        value: "31.9%",
        label: loc("Trial to paid", "מהתנסות לתשלום"),
        detail: loc("2025 measured cohort", "קבוצת 2025 שנמדדה"),
      },
    ],
    statement: loc(
      "The data is created through daily work. That makes it hard to replicate later.",
      "הדאטה נוצר תוך כדי עבודה יומיומית. לכן קשה להעתיק אותו בדיעבד.",
    ),
  },
  {
    serial: "05",
    id: "gtm",
    chapter: "GTM",
    headline: loc("We already learned how the market opens.", "כבר למדנו איך השוק נפתח."),
    support: loc(
      "Until now most of our energy went into product. Now we can put more into the distribution engine that already brought in paying customers.",
      "עד היום רוב האנרגיה הלכה למוצר. עכשיו אפשר להשקיע יותר במנוע ההפצה שכבר יצר לקוחות משלמים.",
    ),
    facts: [
      {
        serial: "01",
        term: loc("Professional community", "קהילה מקצועית"),
        detail: loc("Access to the right people", "גישה לאנשים הנכונים"),
      },
      {
        serial: "02",
        term: loc("Demo / trial", "דמו / ניסיון"),
        detail: loc("A short, clear experience", "חוויה קצרה וברורה"),
      },
      {
        serial: "03",
        term: loc("Onboarding", "הטמעה"),
        detail: loc("Product + scale + training", "מוצר + משקל + הדרכה"),
      },
      {
        serial: "04",
        term: loc("Usage", "שימוש"),
        detail: loc("Repeated use in every color service", "שימוש חוזר בכל שירות צבע"),
      },
      {
        serial: "05",
        term: loc("Referral", "המלצה"),
        detail: loc("Professionals bring professionals", "המקצוענים מביאים מקצוענים"),
      },
    ],
    metrics: [
      {
        value: "~$479K",
        label: loc("Total company revenue since inception", "סך הכנסות החברה מההקמה"),
        detail: loc(
          "₪1,440,130 recorded in Admin, Nov 2022–Aug 2026, net of refunds. Converted at ₪3.005 per USD.",
          "₪1,440,130 נרשמו באדמין מנובמבר 2022 עד אוגוסט 2026, נטו לאחר החזרים. המרה לפי ₪3.005 לדולר.",
        ),
      },
    ],
    statement: loc(
      "The next-stage principle: don't invent a new GTM. Increase speed, capacity and precision.",
      "העיקרון לשלב הבא: לא להמציא GTM חדש. להגדיל קצב, קיבולת ודיוק.",
    ),
  },
  {
    serial: "06",
    id: "platform",
    chapter: "Platform",
    headline: loc(
      "From unique data to the salon operating system.",
      "מהדאטה הייחודי למערכת הניהול של הסלון.",
    ),
    support: loc(
      "Salons already pay for management software. We change what that software can do.",
      "סלונים כבר משלמים על תוכנת ניהול. אנחנו משנים מה היא יודעת לעשות.",
    ),
    facts: [
      {
        term: loc("Color Intelligence", "Color Intelligence"),
        detail: loc("Measure real-world usage", "מודדים שימוש אמיתי"),
      },
      {
        term: loc("SalonOS", "SalonOS"),
        detail: loc("Run the business", "מנהלים את העסק"),
      },
      {
        term: loc("Salon AI", "Salon AI"),
        detail: loc("The system starts acting", "המערכת מתחילה לפעול"),
      },
    ],
    metricsLabel: loc("A category already proven at scale", "הקטגוריה כבר מוכחת בקנה מידה"),
    metrics: [
      { value: "140K+", label: loc("Fresha, businesses", "Fresha, עסקים") },
      { value: "30K+", label: loc("Zenoti, businesses", "Zenoti, עסקים") },
      { value: "12K+", label: loc("Phorest, businesses", "Phorest, עסקים") },
    ],
    statement: loc(
      "No need to create a new category. Build a better intelligence layer.",
      "לא צריך לחנך שוק חדש. צריך לבנות שכבה טובה יותר.",
    ),
    caveat: loc(
      "Company-reported counts use different definitions and are shown only as evidence of category maturity.",
      "המספרים שדווחו על ידי החברות מבוססים על הגדרות שונות ומוצגים רק כעדות לבגרות הקטגוריה.",
    ),
    sources: "Sources: Fresha (2026), Zenoti (2026), Phorest (2026).",
  },
  {
    serial: "07",
    id: "salon-ai",
    chapter: "Salon AI",
    headline: loc("What do we bring that is actually new?", "מה חדש בעולם הזה?"),
    support: loc(
      "Not another dashboard that explains what happened. A system that understands, recommends, and gradually acts on its own.",
      "לא עוד דשבורד שמראה מה קרה. מערכת שמבינה, ממליצה, ובהדרגה גם פועלת בעצמה.",
    ),
    hub: {
      term: loc("Salon AI", "Salon AI"),
      detail: loc("The salon's intelligence layer", "המוח של הסלון"),
    },
    facts: [
      {
        term: loc("Smart scheduling", "יומן חכם"),
        detail: loc(
          "Understands demand, time, skills and profitability.",
          "מבין ביקוש, זמן, כישורים ורווחיות.",
        ),
      },
      {
        term: loc("Autonomous inventory", "מלאי אוטונומי"),
        detail: loc("Predicts consumption, exceptions and reorders.", "חוזה צריכה, חריגות והזמנות."),
      },
      {
        term: loc("Client memory", "זיכרון לקוח"),
        detail: loc(
          "Formulas, history and preferences in one place.",
          "פורמולות, היסטוריה והעדפות במקום אחד.",
        ),
      },
      {
        term: loc("Profit engine", "מנוע רווח"),
        detail: loc("Cost and profitability in real time.", "עלות ורווחיות בזמן אמת."),
      },
      {
        term: loc("Team assistant", "עוזר צוות"),
        detail: loc(
          "Workload, performance and team recommendations.",
          "עומסים, ביצועים והמלצות לצוות.",
        ),
      },
      {
        term: loc("Owner agent", "סוכן בעלים"),
        detail: loc("Summaries, exceptions and actions for the owner.", "סיכום, חריגות ופעולות לבעלים."),
      },
    ],
  },
  {
    serial: "08",
    id: "data",
    chapter: "Data",
    headline: loc(
      "Every action in the salon turns into data the industry can use.",
      "כל פעולה בסלון הופכת לדאטה שכל הענף יכול להשתמש בו.",
    ),
    support: loc(
      "The data answers different questions for every industry player.",
      "הדאטה עונה על שאלות שונות לכל שחקן בענף.",
    ),
    hub: { term: loc("Live Industry Data Center", "Live Industry Data Center") },
    facts: [
      {
        term: loc("Salon owner", "בעל הסלון"),
        detail: loc(
          "Benchmarks, profitability, pricing, decisions.",
          "Benchmarks, רווחיות, תמחור, החלטות.",
        ),
      },
      {
        term: loc("Professionals", "אנשי מקצוע"),
        detail: loc(
          "History, formulas, recommendations, consistency.",
          "היסטוריה, פורמולות, המלצות, עקביות.",
        ),
      },
      {
        term: loc("Brands & manufacturers", "מותגים ויצרנים"),
        detail: loc("Actual usage, penetration, shades, demand.", "שימוש בפועל, penetration, גוונים, ביקוש."),
      },
      {
        term: loc("Distributors", "מפיצים"),
        detail: loc("Demand forecasting, assortment and inventory.", "תחזית ביקוש, assortment ומלאי."),
      },
      {
        term: loc("Chains & groups", "רשתות וקבוצות"),
        detail: loc(
          "Branch comparison, performance and standards.",
          "השוואה בין סניפים, ביצועים וסטנדרטים.",
        ),
      },
    ],
    terms: [
      loc("Aggregated", "Aggregated"),
      loc("Permissioned", "Permissioned"),
      loc("Privacy-first", "Privacy-first"),
    ],
    statement: loc(
      "The advantage is not a static database. It is live data, created fresh every day.",
      "היתרון הוא לא מאגר סטטי. זה דאטה חי שנוצר מחדש כל יום.",
    ),
  },
  {
    serial: "09",
    id: "model",
    chapter: "Model",
    headline: loc("Same customer. More value. More revenue.", "אותו לקוח. יותר ערך. יותר הכנסה."),
    support: loc(
      "Two growth engines: more software value per salon, and aggregated industry intelligence.",
      "שני מנועי צמיחה: יותר ערך לסלון ואינטליגנציה מצרפית לענף.",
    ),
    metricsLabel: loc("Target average monthly ARPU", "יעד ARPU חודשי ממוצע"),
    metrics: [
      { value: "~$80", label: loc("Color Intelligence", "Color Intelligence"), weight: 80 },
      { value: "~$160", label: loc("SalonOS", "SalonOS"), weight: 160 },
      { value: "~$500", label: loc("Salon AI", "Salon AI"), weight: 500 },
    ],
    termsLabel: loc("A second revenue stream, later", "ערוץ הכנסה שני, בהמשך"),
    terms: [
      loc("Benchmark reports", "דוחות Benchmark"),
      loc("Manufacturer insights", "תובנות ליצרנים"),
      loc("Demand forecasting for distributors", "תחזית ביקוש למפיצים"),
      loc("Anonymous market panels", "פאנלים אנונימיים לשוק"),
    ],
    statement: loc(
      "SaaS increases ARPU. Data can create an additional revenue engine.",
      "SaaS מגדיל ARPU. הדאטה יכול לבנות מנוע הכנסה נוסף.",
    ),
    caveat: loc(
      "We do not sell personal client data. The value is in aggregated, permissioned and anonymized intelligence.",
      "אנחנו לא מוכרים מידע אישי של לקוחות. הערך הוא בתובנות מצרפיות, מורשות ואנונימיות.",
    ),
  },
  {
    serial: "10",
    id: "landscape",
    chapter: "Landscape",
    headline: loc("The market is crowded but fragmented.", "השוק צפוף, אבל מפוצל."),
    support: loc(
      "Others understand management or product cost. We connect physical usage to the operating system.",
      "אחרים מבינים ניהול או עלות חומר. אנחנו מחברים שימוש פיזי למערכת ההפעלה.",
    ),
    groups: [
      {
        label: loc("Cost optimization", "אופטימיזציית עלויות"),
        detail: loc("Track color, cost and inventory", "מודדים צבע, עלויות ומלאי"),
        members: ["Vish", "SalonScale"],
      },
      {
        label: loc("Management systems", "מערכות ניהול"),
        members: ["Zenoti", "Phorest", "Fresha", "Mangomint", "Boulevard", "Mindbody"],
      },
    ],
    stack: ["Product usage data", "Salon OS", "AI execution layer"],
    note: loc(
      "Key difference: our data starts with what was actually used and consumed during the service, not just with the calendar transaction.",
      "הבדל מרכזי: הדאטה שלנו מתחיל ממה שבאמת נעשה ונצרך בשירות, לא רק מהעסקה ביומן.",
    ),
    statement: loc(
      "AI is already entering management platforms. The moat has to be the data and the workflow, not the word \u201CAI.\u201D",
      "AI כבר נכנס למערכות הניהול. לכן ה-moat חייב להיות הדאטה וה-workflow, לא המילה AI.",
    ),
    sources:
      "Current positioning verified from Vish, SalonScale, Zenoti, Phorest, Fresha, Mangomint, Boulevard and Mindbody websites (2026).",
  },
  {
    serial: "11",
    id: "team",
    chapter: "Team",
    headline: loc("The team was built around the problem.", "הצוות נבנה בדיוק סביב הבעיה."),
    support: loc(
      "Industry, product, engineering, operations and data. Not software from the outside.",
      "תעשייה, מוצר, הנדסה, תפעול ודאטה. לא תוכנה שהגיעה מבחוץ.",
    ),
    facts: [
      {
        serial: "01",
        term: loc("Maor", "מאור"),
        meta: "CEO / Product",
        detail: loc(
          "Professional stylist and salon owner. Builds the product from inside the workflow.",
          "ספר מקצועי ובעל סלון. בונה את המוצר מתוך העבודה עצמה.",
        ),
      },
      {
        serial: "02",
        term: loc("Elad", "אלעד"),
        meta: "Co-Founder / Operations",
        detail: loc(
          "Finance, operations and the ability to turn vision into a working company.",
          "פיננסים, תפעול, חברה ויכולת להפוך חזון למערכת עובדת.",
        ),
      },
      {
        serial: "03",
        term: loc("Achla", "אצ׳לה"),
        meta: "Engineering Lead",
        detail: loc(
          "Leads the platform build and the transition to SalonOS.",
          "מוביל את בניית הפלטפורמה והמעבר ל-SalonOS.",
        ),
      },
      {
        serial: "04",
        term: loc("Roy", "רועי"),
        meta: "Growth / Marketing",
        detail: loc(
          "Sharpens market, message and customer acquisition.",
          "מחדד שוק, מסר ורכישת לקוחות.",
        ),
      },
      {
        serial: "05",
        term: loc("Paul", "Paul"),
        meta: "Industry Data Advisor",
        detail: loc(
          "Data experience from the professional beauty industry.",
          "ניסיון דאטה מתוך תעשיית הביוטי המקצועית.",
        ),
      },
    ],
    statement: loc(
      "Our edge is proximity: we know the chair, the color room and the code.",
      "היתרון שלנו הוא proximity: אנחנו מכירים את הכיסא, את חדר הצבע ואת הקוד.",
    ),
  },
  {
    serial: "12",
    id: "raise",
    chapter: "Raise",
    headline: loc("Why $1M now?", "למה $1M עכשיו?"),
    support: loc(
      "We have a product that already created real usage and data. Now we need to prove the platform, distribution and economics of the next stage.",
      "יש לנו מוצר שכבר יצר שימוש ודאטה אמיתיים. עכשיו צריך להוכיח את הפלטפורמה, ההפצה והכלכלה של השלב הבא.",
    ),
    metrics: [{ value: "$1M", label: loc("Raise", "סבב גיוס") }],
    allocation: [
      {
        percent: 40,
        label: loc("Product + AI", "מוצר + AI"),
        detail: loc(
          "Complete SalonOS, agents and core workflows.",
          "להשלים SalonOS, Agents ותהליכי עבודה.",
        ),
      },
      {
        percent: 30,
        label: loc("U.S. expansion", "חדירה לארה״ב"),
        detail: loc(
          "Acquisition, partnerships and increased sales capacity.",
          "רכישה, שותפויות והגדלת קיבולת מכירה.",
        ),
      },
      {
        percent: 20,
        label: loc("Onboarding + Data", "Onboarding + Data"),
        detail: loc(
          "Implementation, catalog, support and deeper data capture.",
          "הטמעה, קטלוג, תמיכה והעמקת הדאטה.",
        ),
      },
      {
        percent: 10,
        label: loc("Infrastructure + Security", "תשתית + אבטחה"),
        detail: loc(
          "Reliability, permissions, privacy and infrastructure.",
          "יציבות, הרשאות, פרטיות ותשתית.",
        ),
      },
    ],
    termsLabel: loc("What the capital needs to prove", "מה הכסף צריך להוכיח"),
    terms: [
      loc("Platform adoption", "אימוץ הפלטפורמה"),
      loc("Repeatable U.S. GTM", "GTM חוזר בארה״ב"),
      loc("Higher ARPU", "הגדלת ARPU"),
      loc("First data pilots", "פיילוטים ראשונים של דאטה"),
    ],
    caveat: loc(
      "Draft allocation. Easy to adjust after budget lock.",
      "הקצאה ראשונית. ניתנת להתאמה לאחר נעילת התקציב.",
    ),
  },
  {
    serial: "13",
    id: "optionality",
    chapter: "Optionality",
    headline: loc(
      "We're building an independent company and creating strategic optionality along the way.",
      "אנחנו בונים חברה עצמאית, ובדרך יוצרים אופציונליות אסטרטגית.",
    ),
    support: loc(
      "As the platform and data grow, Spectra becomes relevant to several types of buyers.",
      "ככל שהפלטפורמה והדאטה גדלים, Spectra הופכת רלוונטית לכמה סוגי שחקנים.",
    ),
    groups: [
      {
        serial: "01",
        label: loc("Independent company", "חברה עצמאית"),
        detail: loc("Vertical AI platform for salons", "פלטפורמת AI אנכית לסלונים"),
        members: ["Salon AI", "Industry intelligence", "Payments / commerce later"],
      },
      {
        serial: "02",
        label: loc("Management systems", "מערכות ניהול"),
        detail: loc("Strategic consolidation", "קונסולידציה אסטרטגית"),
        members: ["Zenoti", "Fresha / Phorest", "Mindbody / Boulevard"],
      },
      {
        serial: "03",
        label: loc("Beauty industry", "תעשיית הביוטי"),
        detail: loc("Data + distribution", "דאטה + הפצה"),
        members: ["L'Oréal", "Wella / Henkel", "Professional distributors"],
      },
    ],
    statement: loc(
      "The long-term value goes beyond the software. It is the live map of how the salon industry actually works.",
      "הערך ארוך הטווח הוא לא רק בתוכנה. הוא במפה החיה של איך תעשיית הסלונים באמת עובדת.",
    ),
    caveat: loc(
      "Examples show strategic fit only, not indications of interest.",
      "הדוגמאות ממחישות התאמה אסטרטגית בלבד, לא אינדיקציה לעניין.",
    ),
  },
] as const satisfies readonly CanonicalStep[];

type CanonicalStepUnion = (typeof CANONICAL_NARRATIVE)[number];

/**
 * Per-step lookup that keeps each step's literal type, so a section reading
 * `CANONICAL_BY_ID.market.metrics` gets the three known layers rather than an
 * optional array it has to guard.
 */
export const CANONICAL_BY_ID = Object.fromEntries(
  CANONICAL_NARRATIVE.map((step) => [step.id, step]),
) as { [Id in CanonicalStepUnion["id"]]: Extract<CanonicalStepUnion, { id: Id }> };
