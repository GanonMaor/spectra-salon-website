export type UpdateLang = "en" | "he";
export type Localized = Record<UpdateLang, string>;

export const FINAL_META = {
  title: "Spectra | August 2026 Update",
  date: { en: "August 2026", he: "אוגוסט 2026" } satisfies Localized,
  masthead: { en: "Spectra", he: "Spectra" } satisfies Localized,
  edition: { en: "Founder Story · Investor Edition", he: "סיפור המייסדים · מהדורת משקיעים" } satisfies Localized,
} as const;

/** Six editorial chapters. Each one owns a distinct composition on the page. */
export const FINAL_CHAPTERS = {
  company: { number: "01", title: { en: "The Company", he: "החברה" } },
  built: { number: "02", title: { en: "What We Built", he: "מה בנינו" } },
  discovered: { number: "03", title: { en: "What We Discovered", he: "מה גילינו" } },
  data: { number: "04", title: { en: "What The Data Can See", he: "מה הדאטה רואה" } },
  platform: { number: "05", title: { en: "The Platform", he: "הפלטפורמה" } },
  opportunity: { number: "06", title: { en: "The Bigger Opportunity", he: "ההזדמנות הגדולה" } },
} as const;

export const FINAL_HERO = {
  coverLine: {
    en: "Maor Ganon & Elad Gotlieb",
    he: "מאור גנון ואלעד גוטליב",
  },
  role: {
    en: "Co-founders of Spectra",
    he: "מייסדי Spectra",
  },
  title: {
    en: "We started with color. Now we’re building Salon AI.",
    he: "התחלנו בצבע. עכשיו אנחנו בונים את Salon AI.",
  },
  statusLine: {
    en: "Spectra is already operating in 170+ salons across 12 countries. What we learned there changed the size of the opportunity.",
    he: "Spectra כבר פועלת ביותר מ־170 סלונים ב־12 מדינות. מה שלמדנו שם שינה את גודל ההזדמנות.",
  },
  proofLabel: {
    en: "What we’ve built so far",
    he: "מה שבנינו עד היום",
  },
  founderAlt: {
    en: "Maor Ganon and Elad Gotlieb, co-founders of Spectra, holding the Color Intelligence tablet inside a salon",
    he: "מאור גנון ואלעד גוטליב, מייסדי Spectra, מחזיקים את הטאבלט של Color Intelligence בתוך סלון",
  },
  visualAlt: {
    en: "The Spectra color bar system: connected scale, mixing bowl, scanned color tube and the iPad formula screen",
    he: "מערכת ספקטרה בעמדת הצבע: משקל מחובר, קערת מיזוג, שפופרת צבע סרוקה ומסך הפורמולה ב-iPad",
  },
} as const;

/** Chapter 01 opening article. This is the narrative anchor for the whole story. */
export const FINAL_LEDE = {
  kicker: { en: "The beginning", he: "ההתחלה" },
  title: {
    en: "It started with one problem inside the salon.",
    he: "זה התחיל בבעיה אחת בתוך הסלון.",
  },
  paragraphs: {
    en: [
      "Spectra began with a very specific problem inside the salon: professional color. It is one of the largest material costs in the business, and almost none of it was measured at the point of service.",
      "So we built a system that could see the service itself, including the formula, the product, the shade, the grams, the client and the cost. Salons adopted it, and it spread across countries.",
      "Every service quietly created something we had not planned for at the beginning: a structured record of what actually happened inside the work. That record is what changed our view of what Spectra could become.",
    ],
    he: [
      "ספקטרה התחילה מבעיה מאוד ספציפית בתוך הסלון: צבע מקצועי. זו אחת מעלויות החומר הגדולות בעסק, וכמעט אף חלק ממנה לא נמדד בנקודת השירות.",
      "אז בנינו מערכת שיודעת לראות את השירות עצמו, כולל הפורמולה, המוצר, הגוון, הגרמים, הלקוחה והעלות. סלונים אימצו אותה, והיא התפשטה בין מדינות.",
      "כל שירות יצר בשקט משהו שלא תכננו בהתחלה: תיעוד מובנה של מה שקרה בפועל בתוך העבודה. התיעוד הזה שינה את התפיסה שלנו לגבי מה שספקטרה יכולה להיות.",
    ],
  },
  pull: {
    en: "Spectra was born inside the salon, not inside a software company.",
    he: "ספקטרה נולדה בתוך הסלון, לא בתוך חברת תוכנה.",
  },
} as const;

export const FINAL_COLOR_WEDGE = {
  kicker: { en: "Color Intelligence", he: "Color Intelligence" },
  title: {
    en: "So we built Color Intelligence.",
    he: "אז בנינו את Color Intelligence.",
  },
  cadence: {
    en: "Scan. Mix. Measure. Remember.",
    he: "סריקה. ערבוב. מדידה. זיכרון.",
  },
  wedge: {
    en: "It gave salons control over formulas, material usage and inventory, measured while the work happened.",
    he: "היא נתנה לסלונים שליטה על פורמולות, שימוש בחומרים ומלאי, במדידה שמתרחשת בזמן העבודה.",
  },
  pull: {
    en: "For the first time, software could see the work itself.",
    he: "בפעם הראשונה, תוכנה יכלה לראות את העבודה עצמה.",
  },
  close: {
    en: "Every service created a structured operational event.",
    he: "כל שירות יצר אירוע תפעולי מובנה.",
  },
  caption: {
    en: "Spectra Color Intelligence in daily salon use, 2026.",
    he: "Color Intelligence של ספקטרה בשימוש יומיומי בסלון, 2026.",
  },
  terms: [
    { en: "Connected scale", he: "משקל מחובר" },
    { en: "Tablet", he: "טאבלט" },
    { en: "Barcode scan", he: "סריקת ברקוד" },
  ],
} as const;

export const FINAL_ADOPTION = {
  title: { en: "Salons adopted it.", he: "סלונים אימצו אותה." },
  body: {
    en: "This was not a prototype. It became a real operating product.",
    he: "זה לא היה אב־טיפוס. זה הפך למוצר תפעולי אמיתי.",
  },
  strip: {
    en: "Real salons. Real daily use.",
    he: "סלונים אמיתיים. שימוש יומיומי אמיתי.",
  },
  caption: {
    en: "Professionals working with Spectra across 12 countries.",
    he: "אנשי מקצוע שעובדים עם ספקטרה ב־12 מדינות.",
  },
} as const;

/** Chapter 03 turning point. This is the protagonist of the chapter. */
export const FINAL_REVELATION = {
  title: {
    en: "Then we realized we had built something bigger than a color tool.",
    he: "ואז הבנו שבנינו משהו גדול יותר מכלי צבע.",
  },
  body: {
    en: "Every time a colorist used Spectra, the system captured what actually happened inside the service.",
    he: "בכל פעם שצבעי השתמש בספקטרה, המערכת תיעדה מה באמת קרה בתוך השירות.",
  },
  close: {
    en: "Spectra knows what was actually done.",
    he: "ספקטרה יודעת מה באמת נעשה.",
  },
  signals: [
    { en: "Formula", he: "פורמולה" },
    { en: "Product", he: "מוצר" },
    { en: "Shade", he: "גוון" },
    { en: "Client", he: "לקוח" },
    { en: "Professional", he: "איש מקצוע" },
    { en: "Grams", he: "גרמים" },
    { en: "Time", he: "זמן" },
    { en: "Cost", he: "עלות" },
  ],
} as const;

/** Chapter 05 opens on the problem, then the decision, then the platform. */
export const FINAL_PROBLEM = {
  intro: {
    en: "Once we looked beyond color, we saw the same problem everywhere.",
    he: "ברגע שהסתכלנו מעבר לצבע, ראינו את אותה בעיה בכל מקום.",
  },
  systems: {
    en: "Booking knows appointments. POS knows payments. Inventory knows stock. CRM knows customers. None of them understands the whole operation.",
    he: "היומן יודע תורים. הקופה יודעת תשלומים. המלאי יודע מה יש במדף. ה-CRM יודע לקוחות. אף אחד מהם אינו מבין את התפעול כולו.",
  },
  title: {
    en: "Millions of salons run on software. Very few run as one connected business.",
    he: "מיליוני סלונים עובדים עם תוכנה. מעטים פועלים כעסק מחובר אחד.",
  },
} as const;

export const FINAL_DECISION = {
  title: {
    en: "So we stopped thinking about color software.",
    he: "אז הפסקנו לחשוב על תוכנה לצבע.",
  },
  body: {
    en: "And started building the operating system around it, on top of the data layer we already owned.",
    he: "והתחלנו לבנות סביבה את מערכת ההפעלה, מעל שכבת הדאטה שכבר הייתה בידינו.",
  },
  close: {
    en: "Color was the wedge. The salon is the platform.",
    he: "הצבע היה נקודת הכניסה. הסלון הוא הפלטפורמה.",
  },
} as const;

/** The three movements are consequences of one operating context, not products. */
export const FINAL_PLATFORM = {
  intro: {
    en: "One operating context. Three consequences.",
    he: "הקשר תפעולי אחד. שלוש תוצאות.",
  },
  support: {
    en: "Once the service is understood, capacity, economics and action stop being separate systems.",
    he: "ברגע שמבינים את השירות, קיבולת, כלכלה ופעולה מפסיקות להיות מערכות נפרדות.",
  },
  movements: {
    capacity: { en: "Capacity", he: "קיבולת" },
    economics: { en: "Economics", he: "כלכלה" },
    action: { en: "Action", he: "פעולה" },
  },
} as const;

export const FINAL_BOOKING = {
  title: {
    en: "A three-hour service is not three hours of stylist capacity.",
    he: "שירות של שלוש שעות אינו שלוש שעות של קיבולת איש מקצוע.",
  },
  support: {
    en: "Salon calendars schedule time. Spectra models the capacity that is actually available.",
    he: "יומני סלונים מתזמנים זמן. ספקטרה ממדלת את הקיבולת שזמינה בפועל.",
  },
  caption: {
    en: "Booking Intelligence, built and in testing. Processing time is released back into the day.",
    he: "Booking Intelligence, נבנה ובבדיקה. זמן העיבוד משוחרר בחזרה אל היום.",
  },
} as const;

export const FINAL_SALON_OS = {
  title: {
    en: "Once we understand the service, we can understand the economics around it.",
    he: "ברגע שאנחנו מבינים את השירות, אנחנו יכולים להבין את הכלכלה שסביבו.",
  },
  pull: {
    en: "What was done. What was used. What was earned.",
    he: "מה נעשה. במה השתמשו. כמה הרוויחו.",
  },
} as const;

export const FINAL_MOBILE = {
  line: {
    en: "One business. One operating context.",
    he: "עסק אחד. הקשר תפעולי אחד.",
  },
  roles: [
    { en: "Owner", he: "בעלים" },
    { en: "Team", he: "צוות" },
    { en: "Client", he: "לקוח" },
  ],
} as const;

export const FINAL_CLIENT_APP = {
  kicker: { en: "The client side", he: "הצד של הלקוחה" },
  title: {
    en: "The client books, and buys, inside the same context.",
    he: "הלקוחה קובעת תור, וגם קונה, בתוך אותו הקשר.",
  },
  body: {
    en: "The salon already knows her formula, her cycle and her products. The client app turns that context into a booking and a purchase, without the salon chasing either one.",
    he: "הסלון כבר יודע מה הפורמולה שלה, מה המחזור שלה ואילו מוצרים היא צורכת. אפליקציית הלקוחה הופכת את ההקשר הזה לתור ולרכישה, בלי שהסלון ירדוף אחרי אף אחד מהם.",
  },
  status: {
    en: "Designed client experience, in development. Not live today.",
    he: "חוויית לקוחה מתוכננת, בפיתוח. אינה פעילה כיום.",
  },
  dataNote: {
    en: "Product photography, names and list prices are real rows from the salon’s L’Oréal Professionnel catalog.",
    he: "צילומי המוצרים, השמות והמחירים הם שורות אמיתיות מקטלוג L’Oréal Professionnel של הסלון.",
  },
  bookLabel: { en: "Client booking", he: "קביעת תור" },
  bookGreeting: { en: "Hi Maya", he: "היי מאיה" },
  bookMember: { en: "Client since 2023", he: "לקוחה מ-2023" },
  bookFormulaLabel: { en: "Your last formula", he: "הפורמולה האחרונה שלך" },
  bookLastVisit: { en: "Root colour + gloss · 12 June · Dana", he: "צבע שורש + גלוס · 12 ביוני · דנה" },
  bookService: { en: "Root colour + gloss", he: "צבע שורש + גלוס" },
  bookSlots: { en: "Next available with your colourist", he: "התורים הפנויים הבאים אצל הצבעית שלך" },
  bookCta: { en: "Confirm booking", he: "אישור התור" },
  shopLabel: { en: "Client retail", he: "ריטייל ללקוחה" },
  shopHeader: { en: "For your colour", he: "לצבע שלך" },
  shopTabFor: { en: "For you", he: "בשבילך" },
  shopTabColour: { en: "Colour care", he: "טיפוח צבע" },
  shopTabRepair: { en: "Repair", he: "שיקום" },
  shopMatched: { en: "Matched to your formula", he: "מותאם לפורמולה שלך" },
  shopCta: { en: "Checkout", he: "לתשלום" },
} as const;

export const FINAL_SALON_AI = {
  status: { en: "Designed / in development", he: "מתוכנן / בפיתוח" },
  kicker: { en: "Now AI has something most AI does not:", he: "עכשיו ל-AI יש משהו שלרוב חסר לו:" },
  title: { en: "Context.", he: "הקשר." },
  support: {
    en: "It knows the client, the calendar, the service, the products, the economics and the history.",
    he: "הוא מכיר את הלקוחה, את היומן, את השירות, את המוצרים, את הכלכלה ואת ההיסטוריה.",
  },
  flow: [
    { en: "Signal", he: "אות" },
    { en: "Recommendation", he: "המלצה" },
    { en: "Approval", he: "אישור" },
    { en: "Action", he: "פעולה" },
  ],
  examples: [
    {
      signal: { en: "Stock running out", he: "מוצר עומד להיגמר" },
      action: { en: "Reorder prepared", he: "הזמנה מוכנה" },
    },
    {
      signal: { en: "Client outside her cycle", he: "לקוחה מחוץ למחזור שלה" },
      action: { en: "Win-back prepared", he: "מהלך החזרה מוכן" },
    },
    {
      signal: { en: "Recoverable time in the calendar", he: "זמן שניתן לנצל ביומן" },
      action: { en: "Schedule move suggested", he: "הצעה לשינוי ביומן" },
    },
  ],
  agents: [
    { en: "Booking", he: "יומן" },
    { en: "Inventory", he: "מלאי" },
    { en: "Retention", he: "שימור" },
    { en: "Operations", he: "תפעול" },
    { en: "Growth", he: "צמיחה" },
  ],
  agentsSupport: {
    en: "One shared context. Specialized agents around it. The owner approves the action.",
    he: "הקשר אחד משותף. סוכנים מתמחים סביבו. הבעלים מאשר את הפעולה.",
  },
  caption: {
    en: "Designed Salon AI mobile direction. Not live today.",
    he: "כיוון מובייל מתוכנן ל-Salon AI. אינו פעיל כיום.",
  },
} as const;

export const FINAL_INDUSTRY = {
  kicker: { en: "The opportunity ahead", he: "ההזדמנות שלפנינו" },
  title: {
    en: "We started with color. The opportunity is the operating layer of the salon industry.",
    he: "התחלנו בצבע. ההזדמנות היא שכבת התפעול של תעשיית הסלונים.",
  },
  scale: {
    en: "Millions of salons worldwide",
    he: "מיליוני סלונים בעולם",
  },
  salons: { en: "Salons", he: "סלונים" },
  salonsOffer: {
    en: "An operating system and an intelligence layer for the business they run every day.",
    he: "מערכת הפעלה ושכבת אינטליגנציה לעסק שהם מנהלים כל יום.",
  },
  center: {
    en: "Spectra operating data layer",
    he: "שכבת הדאטה התפעולית של Spectra",
  },
  industry: { en: "Industry", he: "תעשייה" },
  industryActors: {
    en: "Manufacturers, distributors and suppliers who see shipments and sales, but not real consumption.",
    he: "יצרנים, מפיצים וספקים שרואים משלוחים ומכירות, אבל לא צריכה אמיתית.",
  },
  support: {
    en: "Every salon creates operating data. Aggregated correctly, the same data can become intelligence for the companies supplying the industry.",
    he: "כל סלון מייצר דאטה תפעולי. כשהוא מאוגד נכון, אותם נתונים יכולים להפוך לאינטליגנציה עבור החברות שמספקות את התעשייה.",
  },
  caveat: {
    en: "Industry intelligence is a direction we are building toward, not a product sold today.",
    he: "אינטליגנציה לתעשייה היא כיוון שאנחנו בונים אליו, ולא מוצר שנמכר היום.",
  },
} as const;

export const FINAL_PEOPLE = {
  kicker: { en: "The people behind the next chapter", he: "האנשים שמאחורי הפרק הבא" },
  title: {
    en: "We did not arrive here with an idea. We arrived here with a company.",
    he: "לא הגענו לכאן עם רעיון. הגענו לכאן עם חברה.",
  },
} as const;

export const FINAL_GTM = {
  kicker: { en: "2025 go-to-market", he: "יציאה לשוק · 2025" },
  title: {
    en: "We already know we can acquire salons.",
    he: "אנחנו כבר יודעים שאנחנו מצליחים לגייס סלונים.",
  },
  spendLabel: { en: "Marketing spend", he: "תקציב שיווק" },
  outcomeLabel: { en: "Paying salons", he: "סלונים משלמים" },
  caption: {
    en: "2025 cohort over 11 months. 1,476 leads, 301 trials, $64.7K cohort ARR. Not current company ARR.",
    he: "קבוצת 2025 על פני 11 חודשים. 1,476 לידים, 301 ניסיונות, ARR של 64.7 אלף דולר לקבוצה. אינו ה-ARR הנוכחי של החברה.",
  },
} as const;

export const FINAL_BUSINESS_MODEL = {
  title: {
    en: "The same salon can grow with us.",
    he: "אותו סלון יכול לגדול איתנו.",
  },
  line: {
    en: "Same salon. More workflows. Higher annual value.",
    he: "אותו סלון. יותר תהליכי עבודה. ערך שנתי גבוה יותר.",
  },
  caveat: {
    en: "Product-economics model, not a revenue forecast. The later layers still require completion and adoption.",
    he: "מודל של כלכלת מוצר, לא תחזית הכנסות. השכבות המתקדמות עדיין דורשות השלמה ואימוץ.",
  },
} as const;

export const FINAL_RAISE = {
  kicker: { en: "The next chapter", he: "הפרק הבא" },
  amount: { en: "$600K", he: "$600K" },
  title: {
    en: "to finish the transition from Color Intelligence to Salon AI.",
    he: "כדי להשלים את המעבר מ-Color Intelligence אל Salon AI.",
  },
  body: {
    en: "The customers exist. The data exists. The team exists. Significant parts of the new platform are already built. This capital completes the transition.",
    he: "הלקוחות קיימים. הדאטה קיים. הצוות קיים. חלקים משמעותיים מהפלטפורמה החדשה כבר נבנו. ההון הזה משלים את המעבר.",
  },
  columns: [
    {
      title: { en: "Build", he: "לבנות" },
      body: { en: "Finish Salon OS and Salon AI.", he: "להשלים את Salon OS ואת Salon AI." },
    },
    {
      title: { en: "Prove", he: "להוכיח" },
      body: { en: "Roll out across the existing customer base.", he: "להטמיע בבסיס הלקוחות הקיים." },
    },
    {
      title: { en: "Grow", he: "לצמוח" },
      body: { en: "Restart go-to-market with a broader product.", he: "לחדש את היציאה לשוק עם מוצר רחב יותר." },
    },
  ],
  now: {
    label: { en: "Now", he: "עכשיו" },
    value: { en: "Up to $600K", he: "עד $600K" },
    body: {
      en: "Product completion, validation with the existing base and a restarted growth engine.",
      he: "השלמת המוצר, אימות מול בסיס הלקוחות הקיים וחידוש מנוע הצמיחה.",
    },
  },
  next: {
    label: { en: "Next", he: "אחר כך" },
    value: { en: "$3M to $5M growth round", he: "סבב צמיחה של $3M עד $5M" },
    body: {
      en: "International scale, a real sales engine, AI expansion and industry data. Targeted after milestones, not committed.",
      he: "התרחבות בינלאומית, מנוע מכירות אמיתי, הרחבת ה-AI ודאטה לתעשייה. יעד לאחר עמידה באבני דרך, ואינו מובטח.",
    },
  },
  pull: {
    en: "The data layer already exists. This capital funds completion, rollout and growth, not another discovery cycle.",
    he: "שכבת הדאטה כבר קיימת. ההון הזה מממן השלמה, הטמעה וצמיחה, לא עוד סבב גילוי.",
  },
  footnote: {
    en: "We are evaluating an extension of the company’s most recent financing instrument rather than a new priced round, subject to board, investor and legal approval. Separately, Aquilo’s owner committed an angel investment by 31 August 2026 and supports strategy and introductions; compensation includes success fees and warrants. Forward-looking milestones depend on product completion, adoption, growth and market conditions.",
    he: "אנחנו בוחנים הארכה של מכשיר המימון האחרון של החברה ולא סבב חדש במחיר, בכפוף לאישורי בורד, משקיעים ובדיקה משפטית. בנפרד, הבעלים של Aquilo התחייב להשקעת אנג׳ל עד 31 באוגוסט 2026 ומסייע באסטרטגיה ובחיבורים; התגמול כולל רכיבי הצלחה ו-warrants. אבני הדרך העתידיות תלויות בהשלמת המוצר, באימוץ, בצמיחה ובתנאי השוק.",
  },
} as const;

export const FINAL_PROOF = [
  { value: "170+", label: { en: "Salons", he: "סלונים" } },
  { value: "$130K", label: { en: "ARR", he: "ARR" } },
  { value: "12", label: { en: "Countries", he: "מדינות" } },
  { value: "500+", label: { en: "Professionals", he: "אנשי מקצוע" } },
] as const;

export const FINAL_SAAS = {
  spend: "$40K",
  customers: "96",
  funnel: [
    { value: "1,476", label: { en: "Leads", he: "לידים" } },
    { value: "301", label: { en: "Trials", he: "ניסיונות" } },
    { value: "96", label: { en: "Paying salons", he: "סלונים משלמים" } },
    { value: "$64.7K", label: { en: "Cohort ARR", he: "ARR של הקבוצה" } },
  ],
  unitLabel: { en: "Unit economics", he: "כלכלת יחידה" },
  unit: [
    { value: "$40K", label: { en: "Total CAC", he: "CAC כולל" } },
    { value: "$185K", label: { en: "3-year LTV", he: "LTV לשלוש שנים" } },
    { value: "4.6x", label: { en: "LTV to CAC", he: "יחס LTV ל-CAC" } },
  ],
  unitCaveat: {
    en: "LTV and the LTV to CAC ratio are modeled on the 2025 cohort, not realised results.",
    he: "ה-LTV והיחס ל-CAC מבוססים על מודל של קבוצת 2025, ואינם תוצאות שהתממשו.",
  },
} as const;

export const FINAL_CLOSE = {
  kicker: { en: "Where we started", he: "איפה התחלנו" },
  title: { en: "One gram of color.", he: "גרם אחד של צבע." },
  body: {
    en: "That gram became a formula. The formulas became hundreds of thousands of real service events. The events became an operating data layer. And that layer is becoming Salon AI.",
    he: "הגרם הזה הפך לפורמולה. הפורמולות הפכו למאות אלפי אירועי שירות אמיתיים. האירועים הפכו לשכבת דאטה תפעולית. והשכבה הזאת הופכת ל-Salon AI.",
  },
  ask: {
    en: "Now we’re building the rest.",
    he: "עכשיו אנחנו בונים את כל השאר.",
  },
  signoff: { en: "With appreciation,", he: "בברכה ובהערכה," },
  names: { en: "Maor Ganon and Elad Gotlieb", he: "מאור גנון ואלעד גוטליב" },
  role: { en: "Co-Founders, Spectra", he: "מייסדים שותפים, Spectra" },
} as const;
