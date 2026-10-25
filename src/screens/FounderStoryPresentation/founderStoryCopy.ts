/**
 * Copy for the September 2026 Founder Story Investor Edition.
 * Keep this file independent of later investor-page rewrites.
 */
export type UpdateLang = "en" | "he";
export type Localized = Record<UpdateLang, string>;

export const FINAL_META = {
  title: "Spectra | Founder Story · Investor Edition",
  date: { en: "September 2026", he: "ספטמבר 2026" } satisfies Localized,
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
    en: "From the salon color bar\nto industry intelligence.",
    he: "מעמדת הצבע בסלון\nלאינטליגנציה של התעשייה.",
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
      "So we built a system that could see the service itself: the formula, the product, the shade, the grams, the client and the cost. Salons adopted it, and it spread across countries.",
      "That record is what changed our view of what Spectra could become.",
    ],
    he: [
      "ספקטרה התחילה מבעיה מאוד ספציפית בתוך הסלון: צבע מקצועי. זו אחת מעלויות החומר הגדולות בעסק, וכמעט אף חלק ממנה לא נמדד בנקודת השירות.",
      "אז בנינו מערכת שיודעת לראות את השירות עצמו: הפורמולה, המוצר, הגוון, הגרמים, הלקוחה והעלות. סלונים אימצו אותה, והיא התפשטה בין מדינות.",
      "התיעוד הזה שינה את התפיסה שלנו לגבי מה שספקטרה יכולה להיות.",
    ],
  },
  dataReveal: {
    setup: {
      en: "Every service quietly created something we had not planned for at the beginning:",
      he: "כל שירות יצר בשקט משהו שלא תכננו בהתחלה:",
    },
    word: { en: "Data.", he: "Data." },
    follow: {
      en: "A structured record of what actually happened inside the work.",
      he: "תיעוד מובנה של מה שקרה בפועל בתוך העבודה.",
    },
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
  appLine: {
    en: "A simple app.",
    he: "אפליקציה פשוטה.",
  },
  cadence: {
    en: "Scan. Mix. Measure. Remember.",
    he: "סריקה. ערבוב. מדידה. זיכרון.",
  },
  wedge: {
    en: "Control over formulas, material usage and inventory, measured while the work happened.",
    he: "שליטה על פורמולות, שימוש בחומרים ומלאי, במדידה בזמן העבודה.",
  },
  pull: {
    en: "For the first time, software could see the work itself.",
    he: "בפעם הראשונה, תוכנה יכלה לראות את העבודה עצמה.",
  },
  close: {
    en: "",
    he: "",
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
  /** Sequencing from the site's Five Simple Steps, restated around Color Intelligence. */
  workflow: [
    {
      number: "01",
      title: { en: "Client", he: "לקוחה" },
      line: { en: "Identified", he: "מזוהה" },
      alt: {
        en: "A client is identified by scanning a salon QR code",
        he: "לקוחה מזוהה בסריקת קוד QR בסלון",
      },
    },
    {
      number: "02",
      title: { en: "Service", he: "שירות" },
      line: { en: "Context set", he: "הקשר נקבע" },
      alt: {
        en: "Spectra tablet showing service selection at the color bar",
        he: "טאבלט Spectra מציג בחירת שירות בעמדת הצבע",
      },
    },
    {
      number: "03",
      title: { en: "Scan", he: "סריקה" },
      line: { en: "Product identified", he: "המוצר מזוהה" },
      alt: {
        en: "A color tube is scanned into Spectra beside the connected scale",
        he: "שפופרת צבע נסרקת לספקטרה לצד המשקל המחובר",
      },
    },
    {
      number: "04",
      title: { en: "Mix & Measure", he: "ערבוב ומדידה" },
      line: { en: "Every gram measured", he: "כל גרם נמדד" },
      alt: {
        en: "Color is dispensed into a bowl on the scale while Spectra measures grams",
        he: "צבע נסחט לקערה על המשקל בזמן שספקטרה מודדת גרמים",
      },
    },
    {
      number: "05",
      title: { en: "Record", he: "תיעוד" },
      line: { en: "Formula, cost, inventory saved", he: "פורמולה, עלות ומלאי נשמרים" },
      alt: {
        en: "Saved service record with formula, usage and cost",
        he: "רשומת שירות שמורה עם פורמולה, שימוש ועלות",
      },
    },
  ],
} as const;

export const FINAL_ADOPTION = {
  title: { en: "Salons adopted it.", he: "סלונים אימצו אותה." },
  body: {
    en: "This was not a prototype. It became a real operating product.",
    he: "זה לא היה אב־טיפוס. זה הפך למוצר תפעולי אמיתי.",
  },
  strip: {
    en: "Real salons. Real daily use. Across 12 countries.",
    he: "סלונים אמיתיים. שימוש יומיומי אמיתי. ב־12 מדינות.",
  },
  caption: {
    en: "",
    he: "",
  },
} as const;

/** Chapter 03 turning point. This is the protagonist of the chapter. */
export const FINAL_REVELATION = {
  title: {
    en: "Every service became valuable, unique data.",
    he: "כל שירות הפך לדאטה בעל ערך וייחודי.",
  },
  body: {
    en: "",
    he: "",
  },
  center: {
    en: "ONE SERVICE RECORD",
    he: "רשומת שירות אחת",
  },
  close: {
    en: "What happened in the chair became structured data.",
    he: "מה שקרה בכיסא הפך לדאטה מובנה.",
  },
  signals: [
    { en: "Client", he: "לקוח" },
    { en: "Professional", he: "איש מקצוע" },
    { en: "Service", he: "שירות" },
    { en: "Formula", he: "פורמולה" },
    { en: "Product", he: "מוצר" },
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
    en: "",
    he: "",
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

/**
 * The owner is the emotional centre of the mobile chapter. Copy here is the
 * owner's own vantage point, and the status line keeps it honestly future-state.
 */
export const FINAL_OWNER_APP = {
  kicker: { en: "The owner side", he: "הצד של הבעלים" },
  title: {
    en: "The whole salon, in your hand.",
    he: "כל הסלון, בכף היד שלך.",
  },
  body: {
    en: "See who's working. Who's in the chair. What's coming next. What needs attention. And what the business is doing, without being there.",
    he: "לראות מי עובד. מי יושבת בכיסא. מה מגיע אחר כך. מה דורש טיפול. ומה העסק עושה, בלי להיות שם.",
  },
  pull: {
    en: "Leave the salon. Don't lose the salon.",
    he: "לצאת מהסלון. בלי לאבד את הסלון.",
  },
  status: {
    en: "Designed owner experience, in development. Not live today.",
    he: "חוויית בעלים מתוכננת, בפיתוח. אינה פעילה כיום.",
  },
  caption: {
    en: "Owner Home, design direction. English-language concept screen. Salon activity and figures are illustrative.",
    he: "Owner Home, כיוון עיצובי. מסך קונספט באנגלית. פעילות הסלון והנתונים הם להמחשה.",
  },
  figureLabel: { en: "Owner Home", he: "Owner Home" },
  /** Owner surfaces, shown two at a time on the live page. */
  screensCaption: {
    en: "Owner app, design direction. English-language concept screens. Salon activity and figures are illustrative.",
    he: "אפליקציית הבעלים, כיוון עיצובי. מסכי קונספט באנגלית. פעילות הסלון והנתונים הם להמחשה.",
  },
  screens: [
    {
      key: "home",
      image: "/investor/media/owner-app/01-home.png",
      label: { en: "Home", he: "בית" },
      note: { en: "The salon right now", he: "הסלון עכשיו" },
      alt: {
        en: "Owner home screen: appointments, active clients, team status and the shape of the day",
        he: "מסך הבית של הבעלים: תורים, לקוחות בטיפול, מצב הצוות ומבנה היום",
      },
    },
    {
      key: "intelligence",
      image: "/investor/media/owner-app/02-intelligence.png",
      label: { en: "Intelligence", he: "אינטליגנציה" },
      note: { en: "Ranked actions, not a dashboard", he: "פעולות מדורגות, לא דשבורד" },
      alt: {
        en: "Intelligence screen: ranked actions for stock, schedule gaps, client retention and team delays",
        he: "מסך האינטליגנציה: פעולות מדורגות למלאי, פערים ביומן, שימור לקוחות ועיכובי צוות",
      },
    },
    {
      key: "service",
      image: "/investor/media/owner-app/03-live-service.png",
      label: { en: "Live service", he: "שירות בזמן אמת" },
      note: { en: "Inside one client's service", he: "בתוך השירות של לקוחה אחת" },
      alt: {
        en: "Live service screen: service progress, active mixes, the formula and client notes",
        he: "מסך שירות בזמן אמת: התקדמות השירות, מיזוגים פעילים, הפורמולה והערות הלקוחה",
      },
    },
    {
      key: "overview",
      image: "/investor/media/owner-app/04-business-overview.png",
      label: { en: "Business", he: "העסק" },
      note: { en: "The salon in numbers", he: "הסלון במספרים" },
      alt: {
        en: "Business overview: live appointments, Color Intelligence savings, inventory and the top performer",
        he: "סקירת העסק: תורים חיים, חיסכון של Color Intelligence, מלאי והעובד המוביל",
      },
    },
    {
      key: "revenue",
      image: "/investor/media/owner-app/05-business-revenue.png",
      label: { en: "Revenue", he: "הכנסות" },
      note: { en: "Per visit, and the mix", he: "לביקור, והתמהיל" },
      alt: {
        en: "Revenue screen: per-visit economics and revenue by service category",
        he: "מסך הכנסות: כלכלה לביקור והכנסות לפי קטגוריית שירות",
      },
    },
    {
      key: "team",
      image: "/investor/media/owner-app/06-business-team.png",
      label: { en: "Team", he: "צוות" },
      note: { en: "Ranked like the floor", he: "מדורג כמו הרצפה" },
      alt: {
        en: "Team performance: stylists ranked by utilization, appointments and revenue",
        he: "ביצועי צוות: ספרים מדורגים לפי ניצולת, תורים והכנסות",
      },
    },
  ],
} as const;

/**
 * Owner Home interface strings. The screen is an operating surface: live
 * service first, then the shape of the day, then what needs a decision.
 * Money is one quiet line at the bottom.
 */
export const FINAL_OWNER_SCREEN = {
  greeting: { en: "Good morning, Maor.", he: "בוקר טוב, מאור." },
  live: { en: "Your salon is live.", he: "הסלון שלך פעיל עכשיו." },
  strip: {
    en: "14 appointments · 4 team · 3 clients live",
    he: "14 תורים · 4 בצוות · 3 לקוחות בטיפול",
  },
  liveNowLabel: { en: "Live now", he: "עכשיו בסלון" },
  liveClients: [
    {
      initials: "MC",
      name: { en: "Maya Cohen", he: "מאיה כהן" },
      service: { en: "Color", he: "צבע" },
      stage: { en: "Processing", he: "בזמן עיבוד" },
      remaining: { en: "24 min left", he: "עוד 24 דק׳" },
      stylist: { en: "Dana", he: "דנה" },
      progress: 62,
      tone: "rose",
    },
    {
      initials: "RL",
      name: { en: "Roni Levy", he: "רוני לוי" },
      service: { en: "Highlights", he: "גוונים" },
      stage: { en: "Application", he: "מריחה" },
      remaining: { en: "40 min left", he: "עוד 40 דק׳" },
      stylist: { en: "Noa", he: "נועה" },
      progress: 22,
      tone: "amber",
    },
    {
      initials: "SB",
      name: { en: "Shira Ben Ami", he: "שירה בן עמי" },
      service: { en: "Keratin", he: "קרטין" },
      stage: { en: "Finishing", he: "סיום" },
      remaining: { en: "18 min", he: "עוד 18 דק׳" },
      stylist: { en: "Lital", he: "ליטל" },
      progress: 84,
      tone: "green",
    },
  ],
  todayLabel: { en: "Today", he: "היום" },
  todayNote: { en: "1h 30m free at 14:30", he: "שעה וחצי פנויה ב-14:30" },
  todayNext: {
    en: "Next in, 11:15 · Tal Aviad · Root color · Dana",
    he: "הבא בתור, 11:15 · טל אביעד · צבע שורש · דנה",
  },
  todayLanes: [
    {
      initial: { en: "D", he: "ד" },
      stylist: { en: "Dana", he: "דנה" },
      blocks: [
        { start: 30, end: 165, tone: "rose" },
        { start: 210, end: 300, tone: "amber" },
        { start: 390, end: 480, tone: "rose" },
      ],
    },
    {
      initial: { en: "N", he: "נ" },
      stylist: { en: "Noa", he: "נועה" },
      blocks: [
        { start: 60, end: 210, tone: "amber" },
        { start: 330, end: 420, tone: "free" },
        { start: 420, end: 540, tone: "rose" },
      ],
    },
    {
      initial: { en: "L", he: "ל" },
      stylist: { en: "Lital", he: "ליטל" },
      blocks: [
        { start: 0, end: 120, tone: "green" },
        { start: 240, end: 330, tone: "rose" },
        { start: 480, end: 570, tone: "amber" },
      ],
    },
  ],
  needsYouLabel: { en: "Needs you", he: "דורש אותך" },
  needsYou: [
    {
      title: { en: "Dana is 20 min behind", he: "דנה מאחרת ב-20 דקות" },
      action: { en: "Message team", he: "הודעה לצוות" },
      tone: "amber",
    },
    {
      title: { en: "Metal Detox runs out in 3 days", he: "Metal Detox ייגמר בעוד 3 ימים" },
      action: { en: "Approve order", he: "לאשר הזמנה" },
      tone: "rose",
    },
    {
      title: { en: "Maya hasn't returned in 11 weeks", he: "מאיה לא חזרה 11 שבועות" },
      action: { en: "Review client", he: "כרטיס לקוחה" },
      tone: "green",
    },
  ],
  money: {
    en: "Today · $2,480 booked · $1,860 completed",
    he: "היום · $2,480 נקבע · $1,860 הושלם",
  },
} as const;

export const FINAL_CLIENT_APP = {
  kicker: { en: "The client side", he: "הצד של הלקוחה" },
  transition: {
    en: "The same context follows the client too.",
    he: "אותו הקשר ממשיך גם אל הלקוחה.",
  },
  title: {
    en: "She books with an assistant. Then she buys what her hair needs.",
    he: "היא קובעת עם עוזר חכם. אחר כך היא קונה את מה שהשיער שלה צריך.",
  },
  body: {
    en: "The assistant finds real free capacity and offers times that actually fit. It then recommends retail from her hair type and new colour. The salon does not chase the booking or the sale.",
    he: "העוזר מוצא קיבולת פנויה אמיתית ומציע זמנים שבאמת מתאימים. אחר כך הוא ממליץ על מוצרים לפי סוג השיער והצבע החדש. הסלון לא צריך לרדוף אחרי התור או המכירה.",
  },
  status: {
    en: "Designed client experience. Not live today.",
    he: "חוויית לקוחה מתוכננת. אינה פעילה כיום.",
  },
  dataNote: {
    en: "Product photography and names are real rows from the salon’s L’Oréal Professionnel catalog. Prices are illustrative, in USD.",
    he: "צילומי המוצרים והשמות הם שורות אמיתיות מקטלוג L’Oréal Professionnel של הסלון. המחירים הם להמחשה, בדולרים.",
  },
  bookLabel: { en: "AI appointment booking", he: "קביעת תור עם AI" },
  bookAssistant: { en: "Studio assistant", he: "עוזר הסטודיו" },
  bookDesigned: { en: "Designed", he: "מתוכנן" },
  bookContext: {
    en: "For Maya Cohen",
    he: "עבור מאיה כהן",
  },
  bookClientMsg: {
    en: "Can I book my usual with Dana?",
    he: "אפשר לקבוע את הטיפול הרגיל שלי עם דנה?",
  },
  bookAiMsg: {
    en: "I found three openings that fit Dana’s real capacity.",
    he: "מצאתי שלושה זמנים שמתאימים לקיבולת האמיתית של דנה.",
  },
  bookSlotsHint: { en: "Available times", he: "זמנים פנויים" },
  bookService: { en: "Root colour + gloss", he: "צבע שורש + גלוס" },
  bookDuration: { en: "about 2 hours", he: "כשעתיים" },
  bookCta: { en: "Confirm booking", he: "אישור התור" },
  slots: [
    {
      day: { en: "Thu 27 Aug", he: "ה׳ 27 באוג" },
      time: "10:30",
      stylist: { en: "Dana", he: "דנה" },
      selected: true,
    },
    {
      day: { en: "Tue 1 Sep", he: "ג׳ 1 בספט" },
      time: "09:00",
      stylist: { en: "Dana", he: "דנה" },
      selected: false,
    },
    {
      day: { en: "Wed 2 Sep", he: "ד׳ 2 בספט" },
      time: "13:30",
      stylist: { en: "Noa", he: "נועה" },
      selected: false,
    },
  ],
  shopLabel: { en: "Retail for her hair", he: "מוצרים לשיער שלה" },
  shopHeader: { en: "For your hair", he: "לשיער שלך" },
  shopWhyLabel: { en: "Why these", he: "למה אלה" },
  shopWhy: {
    en: "Based on your hair type and new colour.",
    he: "בהתאם לסוג השיער ולצבע החדש שלך.",
  },
  shopBag: { en: "Bag", he: "סל" },
  shopItems: { en: "items", he: "פריטים" },
  shopInBag: { en: "In bag", he: "בסל" },
  shopAdd: { en: "Add", he: "הוספה" },
  shopCta: { en: "Checkout", he: "לתשלום" },
  products: [
    {
      key: "vitamino",
      name: "Vitamino Color",
      detail: { en: "Colour mask, 500 ml", he: "מסכת צבע, 500 מ״ל" },
      reason: { en: "For your new copper tone", he: "לגוון הנחושת החדש" },
      price: 200,
      inBag: true,
    },
    {
      key: "absolut",
      name: "Absolut Repair",
      detail: { en: "Molecular mask, 500 ml", he: "מסכה מולקולרית, 500 מ״ל" },
      reason: { en: "For dry, wavy hair", he: "לשיער יבש וגלי" },
      price: 150,
      inBag: true,
    },
  ],
} as const;

export const FINAL_SALON_AI = {
  status: { en: "Designed / in development", he: "מתוכנן / בפיתוח" },
  /** Editorial bridge from the mobile chapter into the Salon AI chapter. */
  bridge: {
    en: "When one system sees the whole salon, AI finally has something useful to work with.",
    he: "כשמערכת אחת רואה את הסלון כולו, ל-AI סוף סוף יש עם מה לעבוד.",
  },
  /** What the shared context actually contains. */
  contextTerms: [
    { en: "Client", he: "לקוחה" },
    { en: "Team", he: "צוות" },
    { en: "Calendar", he: "יומן" },
    { en: "Service", he: "שירות" },
    { en: "Inventory", he: "מלאי" },
    { en: "Economics", he: "כלכלה" },
    { en: "History", he: "היסטוריה" },
  ],
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
    en: "",
    he: "",
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
    en: "We already learned how to acquire salons.",
    he: "כבר למדנו איך לרכוש סלונים.",
  },
  spendLabel: { en: "Marketing spend", he: "תקציב שיווק" },
  outcomeLabel: { en: "Paying salons", he: "סלונים משלמים" },
  revenueToDate: { en: "~$452K", he: "~$452K" },
  revenueToDateLabel: { en: "Revenue to date", he: "הכנסות עד היום" },
  ltvLabel: { en: "LTV / CAC", he: "LTV / CAC" },
  close: {
    en: "We learned how to acquire salons, and how to monetize them.",
    he: "למדנו איך לרכוש סלונים, ואיך לייצר מהם הכנסה.",
  },
  caption: {
    en: "2025 cohort. Modeled LTV, not realized results.",
    he: "קבוצת 2025. LTV לפי מודל, לא תוצאות שהתממשו.",
  },
  revenueSource: {
    en: "₪1,358,361 company revenue recorded in SUMIT through Oct 2026, net of refunds and excluding internal transactions. Converted at ₪3.005 per USD.",
    he: "₪1,358,361 הכנסות חברה נרשמו ב־SUMIT עד אוקטובר 2026, נטו לאחר החזרים וללא עסקאות פנימיות. המרה לפי ₪3.005 לדולר.",
  },
} as const;

export const FINAL_BUSINESS_MODEL = {
  title: {
    en: "The same salon can grow with us.",
    he: "אותו סלון יכול לגדול איתנו.",
  },
  line: {
    en: "",
    he: "",
  },
  caveat: {
    en: "",
    he: "",
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
    en: "",
    he: "",
  },
  askLabel: { en: "The ask now", he: "הבקשה עכשיו" },
  askLine: {
    en: "Up to $600K of new capital through an extension of the existing instrument.",
    he: "עד $600K של הון חדש באמצעות הרחבת מכשיר המימון הקיים.",
  },
  useLabel: { en: "What this capital funds", he: "מה ההון הזה מממן" },
  context: {
    label: { en: "Financing context", he: "רקע המימון" },
    /** Company history, deliberately separate from the current instrument. */
    raisedValue: "$1M+",
    raisedLabel: { en: "Raised to date", he: "גויס עד היום" },
    lead: {
      en: "Spectra has raised $1M+ to date. The current instrument remains open.",
      he: "Spectra גייסה יותר מ-$1M עד היום. המכשיר הנוכחי עדיין פתוח.",
    },
    steps: [
      { value: "$4.25M", label: { en: "Instrument starting point", he: "נקודת הפתיחה של המכשיר" } },
      { value: "~$4.65M", label: { en: "Current implied level", he: "הרמה הנגזרת כיום" } },
      { value: "~$5.25M", label: { en: "After the full $600K extension", he: "לאחר מלוא ההרחבה של $600K" } },
    ],
    note: {
      en: "Approximately $400K has already been invested under the instrument. Up to $600K can still enter on the same terms.",
      he: "כ-$400K כבר הושקעו במסגרת המכשיר. ניתן להכניס עד $600K נוספים באותם תנאים.",
    },
    caption: {
      en: "Rounded figures. Extension of the existing instrument, not a new priced round.",
      he: "מספרים מעוגלים. הרחבה של המכשיר הקיים, לא סבב חדש במחיר.",
    },
  },
  columns: [
    {
      title: { en: "Build", he: "לבנות" },
      body: { en: "Finish Salon OS and Salon AI.", he: "להשלים את Salon OS ואת Salon AI." },
    },
    {
      title: { en: "Prove", he: "להוכיח" },
      body: {
        en: "Validate with the existing base.",
        he: "לאמת מול הבסיס הקיים.",
      },
    },
    {
      title: { en: "Grow", he: "לצמוח" },
      body: {
        en: "Restart acquisition.",
        he: "לחדש את גיוס הלקוחות.",
      },
    },
  ],
  nextStep: {
    label: { en: "The step after this", he: "השלב שאחרי" },
    value: { en: "$3M to $5M growth round", he: "סבב צמיחה של $3M עד $5M" },
    body: {
      en: "Targeted after product, revenue and market validation milestones, to fund international expansion, sales infrastructure, AI development and industry intelligence.",
      he: "יעד לאחר עמידה באבני דרך של מוצר, הכנסות ואימות שוק, למימון התרחבות בינלאומית, תשתית מכירות, פיתוח AI ואינטליגנציה תעשייתית.",
    },
  },
  pull: {
    en: "The previous capital built the company and the data asset. This capital turns them into the next platform.",
    he: "ההון הקודם בנה את החברה ואת נכס הדאטה. ההון הזה הופך אותם לפלטפורמה הבאה.",
  },
  footnote: {
    en: "Extension of the existing instrument, not a new priced round, subject to board, investor and legal approval. Advisory compensation includes performance-linked and equity components. Forward-looking milestones depend on product, adoption and market conditions.",
    he: "הרחבה של המכשיר הקיים ולא סבב חדש במחיר, בכפוף לאישורי בורד, משקיעים ובדיקה משפטית. ייעוץ כולל תגמול מותנה הצלחה ורכיב הוני. אבני הדרך תלויות במוצר, באימוץ ובתנאי השוק.",
  },
} as const;

export const FINAL_PROOF = [
  { value: "170+", label: { en: "Salons", he: "סלונים" } },
  { value: "$121K", label: { en: "ARR", he: "ARR" } },
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
    en: "LTV and LTV to CAC are modeled on the 2025 cohort, not realised results.",
    he: "LTV והיחס ל-CAC מבוססים על מודל של קבוצת 2025, לא תוצאות שהתממשו.",
  },
} as const;

/**
 * Approved Alon-revision copy for the Founder Story 18-slide sequence.
 * Keep wording locked. Do not invent numbers, biographies, or competitor claims.
 */
export const REVISION = {
  dataTakeaway: {
    en: "Spectra knows what was actually done.",
    he: "ספקטרה יודעת מה באמת נעשה.",
  },
  market: {
    kicker: { en: "The market", he: "השוק" },
    title: {
      en: "Two economies. One salon in the middle.",
      he: "שני משקים. סלון אחד באמצע.",
    },
    close: {
      en: "Every salon sits between the services it sells and the professional products it consumes.",
      he: "כל סלון יושב בין השירותים שהוא מוכר לבין המוצרים המקצועיים שהוא צורך.",
    },
    servicesLabel: { en: "Salon services", he: "שירותי סלון" },
    servicesFigure: "$264.9B",
    servicesCaption: {
      en: "Global salon services · 2025",
      he: "שוק שירותי הסלון העולמי · 2025",
    },
    servicesFuture: {
      en: "$522.6B by 2034",
      he: "$522.6B עד 2034",
    },
    servicesCagr: {
      en: "7.9% CAGR (2026–2034)",
      he: "צמיחה שנתית ממוצעת 7.9% (2026–2034)",
    },
    servicesHair: {
      en: "Hair care ≈77% of salon services",
      he: "טיפולי שיער ≈77% משירותי הסלון",
    },
    productsLabel: {
      en: "Brands & professional products",
      he: "מותגים ומוצרים מקצועיים",
    },
    productsFigure: "$128.6B",
    productsCaption: {
      en: "Salon-grade beauty & personal care products · 2025",
      he: "מוצרי יופי וטיפוח ברמת סלון · 2025",
    },
    productsFuture: {
      en: "$222.3B by 2033",
      he: "$222.3B עד 2033",
    },
    productsCagr: {
      en: "7.1% CAGR (2026–2033)",
      he: "צמיחה שנתית ממוצעת 7.1% (2026–2033)",
    },
    productsHair: {
      en: "Hair care products = 42.1% of the category",
      he: "מוצרי שיער = 42.1% מהקטגוריה",
    },
    sources: {
      en: "Sources: Fortune Business Insights, Salon Services (2025–2034); Grand View Research, Salon Beauty & Personal Care Products (2025–2033). Hair segments are not additive TAM.",
      he: "מקורות: Fortune Business Insights, Salon Services (2025–2034); Grand View Research, Salon Beauty & Personal Care Products (2025–2033). מקטעי השיער אינם מצטברים ל־TAM אחד.",
    },
  },
  twoSided: {
    kicker: { en: "The opportunity", he: "ההזדמנות" },
    title: {
      en: "One operational layer. Two customers.",
      he: "שכבה תפעולית אחת. שני לקוחות.",
    },
    salonsLabel: { en: "Salons", he: "סלונים" },
    salonsModel: { en: "SaaS subscription", he: "מנוי SaaS" },
    salonsNeed: {
      en: "Clients · Staff · Calendar · Inventory · Economics · Execution",
      he: "לקוחות · צוות · יומן · מלאי · כלכלה · ביצוע",
    },
    brandsLabel: { en: "Brands / suppliers", he: "מותגים / ספקים" },
    brandsModel: { en: "Data intelligence subscription", he: "מנוי לאינטליגנציית דאטה" },
    brandsNeed: {
      en: "Consumption · Usage by service · Demand · Adoption · Portfolio",
      he: "צריכה · שימוש לפי שירות · ביקוש · אימוץ · פורטפוליו",
    },
    center: {
      en: "Industry Data Lake",
      he: "Industry Data Lake",
    },
    close: {
      en: "Value for both sides of the industry.",
      he: "ערך לשני צידי התעשייה.",
    },
    note: {
      en: "Salons are the operating customer. Brands are the intelligence customer we are beginning to validate.",
      he: "הסלונים הם לקוח התפעול. המותגים הם לקוח האינטליגנציה שאנחנו מתחילים לאמת.",
    },
  },
  platform: {
    kicker: { en: "The platform", he: "הפלטפורמה" },
    title: {
      en: "What do we bring that is actually new?",
      he: "מה אנחנו מביאים שבאמת חדש?",
    },
    body: {
      en: "Not another dashboard that explains what happened. A system that understands, recommends, and gradually acts.",
      he: "לא עוד דשבורד שמסביר מה קרה. מערכת שמבינה, ממליצה, ובהדרגה פועלת.",
    },
    visualAlt: {
      en: "The salon floor connected to scheduling, client intelligence, inventory and economics",
      he: "רצפת הסלון מחוברת לתזמון, אינטליגנציית לקוחה, מלאי וכלכלה",
    },
    capabilities: [
      {
        title: { en: "Intelligent Salon Operations", he: "תפעול סלון אינטליגנטי" },
        body: {
          en: "Understands demand, time, skills and profitability.",
          he: "מבינה ביקוש, זמן, מיומנות ורווחיות.",
        },
      },
      {
        title: { en: "Autonomous inventory", he: "מלאי אוטונומי" },
        body: {
          en: "Predicts consumption, exceptions and reorders.",
          he: "חוזה צריכה, חריגות והזמנות מחדש.",
        },
      },
      {
        title: { en: "Client memory", he: "זיכרון לקוחה" },
        body: {
          en: "Formulas, history and preferences in one place.",
          he: "פורמולות, היסטוריה והעדפות במקום אחד.",
        },
      },
      {
        title: { en: "Profit engine", he: "מנוע רווח" },
        body: {
          en: "Cost and profitability in real time.",
          he: "עלות ורווחיות בזמן אמת.",
        },
      },
      {
        title: { en: "Team assistant", he: "עוזר לצוות" },
        body: {
          en: "Workload, performance and team recommendations.",
          he: "עומס, ביצועים והמלצות לצוות.",
        },
      },
      {
        title: { en: "Owner agent", he: "סוכן לבעלים" },
        body: {
          en: "Summaries, exceptions and actions for the owner.",
          he: "סיכומים, חריגות ופעולות לבעלים.",
        },
      },
    ],
  },
  salonAi: {
    kicker: { en: "Salon AI", he: "Salon AI" },
    title: {
      en: "We started by measuring one bowl of color.",
      he: "התחלנו במדידה של קערת צבע אחת.",
    },
    close: {
      en: "Spectra is building the operating and data layer for professional beauty.",
      he: "Spectra בונה את שכבת התפעול והדאטה של תעשיית היופי המקצועית.",
    },
    steps: [
      { en: "Bowl", he: "קערה" },
      { en: "Service", he: "שירות" },
      { en: "Data", he: "דאטה" },
      { en: "Intelligence", he: "אינטליגנציה" },
    ],
    destination: { en: "Autonomous salon", he: "סלון אוטונומי" },
  },
  whyNow: {
    kicker: { en: "Why now", he: "למה עכשיו" },
    title: {
      en: "Too early before AI could act. Ready now.",
      he: "מוקדם מדי לפני שה־AI יכול היה לפעול. מוכן עכשיו.",
    },
    thenLabel: { en: "Then", he: "אז" },
    thenBody: {
      en: "Salon systems mainly recorded transactions.",
      he: "מערכות סלון בעיקר תיעדו עסקאות.",
    },
    nowLabel: { en: "Now", he: "עכשיו" },
    nowBody: {
      en: "AI can reason across operational context and take actions.",
      he: "AI יכול להסיק מהקשר תפעולי ולבצע פעולות.",
    },
    todayLabel: { en: "Spectra today", he: "ספקטרה היום" },
    todayBody: {
      en: "Real workflow penetration. Historical service data. Existing customers.",
      he: "חדירה לזרימת עבודה. היסטוריית שירות. לקוחות קיימים.",
    },
    close: {
      en: "AI can now act on operational context. Spectra already has physical execution data.",
      he: "AI יכול עכשיו לפעול על הקשר תפעולי. ל־Spectra כבר יש נתוני ביצוע פיזי.",
    },
  },
  model: {
    kicker: { en: "Business model", he: "מודל עסקי" },
    title: {
      en: "Same connected salon. More value. More revenue layers.",
      he: "אותו סלון מחובר. יותר ערך. יותר שכבות הכנסה.",
    },
    salonLabel: { en: "Customer 1 · Salons", he: "לקוח 1 · סלונים" },
    salonPays: {
      en: "Pays for software",
      he: "משלמים על תוכנה",
    },
    salonModel: {
      en: "Color Intelligence · Salon OS · Salon AI",
      he: "Color Intelligence · Salon OS · Salon AI",
    },
    brandsLabel: { en: "Customer 2 · Brands / suppliers", he: "לקוח 2 · מותגים / ספקים" },
    brandsPays: {
      en: "Pays for intelligence",
      he: "משלמים על אינטליגנציה",
    },
    brandsModel: {
      en: "",
      he: "",
    },
    brandsData: {
      en: "• Brand and product share across measured color services\n• Real consumption, waste and replenishment signals\n• Service, shade, salon and regional trend benchmarks",
      he: "• נתח מותגים ומוצרים מתוך שירותי צבע שנמדדו\n• נתוני צריכה, בזבוז וחידוש מלאי בפועל\n• מגמות והשוואות לפי שירות, גוון, סלון ואזור",
    },
    futureLabel: { en: "", he: "" },
    futureBody: {
      en: "",
      he: "",
    },
    futureNote: {
      en: "",
      he: "",
    },
    close: {
      en: "",
      he: "",
    },
  },
  competition: {
    kicker: { en: "Competitive landscape", he: "מפת התחרות" },
    title: {
      en: "Salon software has already proven both scale and enterprise value.",
      he: "תוכנה לסלונים כבר הוכיחה גם יכולת להגיע לסקייל וגם ערך עסקי משמעותי.",
    },
    categories: [
      {
        label: { en: "Salon management", he: "ניהול סלון" },
        players: [
          {
            name: { en: "Zenoti", he: "Zenoti" },
            adoption: [
              { en: "30,000+ businesses", he: "יותר מ־30,000 עסקים" },
              { en: "50+ countries", he: "יותר מ־50 מדינות" },
            ],
            value: { en: "~$1.5B", he: "~$1.5B" },
            note: { en: "last known valuation", he: "שווי ידוע אחרון" },
          },
          {
            name: { en: "Fresha", he: "Fresha" },
            adoption: [
              { en: "130,000+ partner businesses", he: "יותר מ־130,000 עסקים שותפים" },
              { en: "450,000+ professionals", he: "יותר מ־450,000 אנשי מקצוע" },
              { en: "120+ countries", he: "יותר מ־120 מדינות" },
            ],
            value: { en: "$1B+", he: "$1B+" },
            note: { en: "valuation", he: "שווי" },
          },
          {
            name: { en: "Mangomint", he: "Mangomint" },
            adoption: [
              { en: "Thousands of salons & spas", he: "אלפי סלונים וספא" },
              { en: "10,000+ hair-salon professionals", he: "יותר מ־10,000 אנשי מקצוע במספרות" },
            ],
            value: { en: "$35M", he: "$35M" },
            note: { en: "Series B", he: "Series B" },
          },
        ],
      },
      {
        label: { en: "Color intelligence", he: "אינטליגנציית צבע" },
        players: [{ name: { en: "Vish", he: "Vish" } }, { name: { en: "SalonScale", he: "SalonScale" } }],
      },
      {
        label: { en: "AI / automation", he: "AI / אוטומציה" },
        players: [{ name: { en: "Emerging", he: "מתהווה" } }],
      },
      {
        label: { en: "Industry data", he: "דאטה תעשייתי" },
        players: [{ name: { en: "Brand / network platforms", he: "פלטפורמות למותגים ולרשתות" } }],
      },
    ],
    spectra: {
      en: "Large customer bases show that salon software can scale. Valuations and funding show that the category can create substantial enterprise value.",
      he: "בסיסי לקוחות גדולים מוכיחים שתוכנה לסלונים יכולה לצמוח בקנה מידה רחב. שווי וגיוסים מוכיחים שהקטגוריה יכולה ליצור ערך עסקי משמעותי.",
    },
    sources: {
      en: "Zenoti last known valuation from the 2021 TPG Series D extension. Fresha $1B+ from the May 2026 KKR investment. Mangomint $35M Series B announced in 2024.",
      he: "שווי Zenoti הידוע האחרון לפי הרחבת Series D של TPG ב־2021. Fresha $1B+ לפי השקעת KKR במאי 2026. Mangomint $35M Series B ב־2024.",
    },
  },
  founders: {
    kicker: { en: "The founders", he: "המייסדים" },
    title: {
      en: "Domain depth. Technology. Execution.",
      he: "עומק תחום. טכנולוגיה. ביצוע.",
    },
    titleShort: {
      en: "Domain depth. Technology. Execution.",
      he: "עומק תחום. טכנולוגיה. ביצוע.",
    },
    techKicker: { en: "Technology leadership", he: "הובלה טכנולוגית" },
    teamKicker: { en: "Core team", he: "הצוות" },
    maorRole: { en: "Co-Founder & CEO", he: "מייסד שותף ו־CEO" },
    eladRole: { en: "Co-Founder & COO", he: "מייסד שותף ו־COO" },
    achelaRole: { en: "CTO", he: "CTO" },
    maorFocus: {
      en: "Professional Color Technician",
      he: "טכנאי צבע מקצועי",
    },
    eladFocus: {
      en: "Seacret Asia · International expansion · Operations",
      he: "Seacret אסיה · התרחבות בינלאומית · תפעול",
    },
    achelaFocus: {
      en: "Engineering · Platform · AI",
      he: "הנדסה · פלטפורמה · AI",
    },
    litalRole: {
      en: "Frontend · UX · Quality",
      he: "פרונט · חוויית משתמש · איכות",
    },
    yaarRole: {
      en: "Customer Operations · Data",
      he: "תפעול לקוחות · דאטה",
    },
    maorWhy: {
      en: "Professional color expert and salon operator; worked in Paris, managed color rooms, and built Spectra from a problem he experienced firsthand.",
      he: "מומחה לצבע מקצועי ומפעיל סלון; עבד בפריז, ניהל חדרי צבע ובנה את Spectra מתוך בעיה שחווה בעצמו.",
    },
    eladWhy: {
      en: "Previously led Asia operations and market expansion at Seacret; today leads Spectra’s operations, finance and commercial execution.",
      he: "הוביל בעבר את פעילות אסיה והתרחבות השווקים ב־Seacret; היום מוביל את התפעול, הכספים והביצוע המסחרי של Spectra.",
    },
    achelaWhy: {
      en: "Leads Spectra’s engineering, platform architecture and AI development.",
      he: "מוביל את ההנדסה, הארכיטקטורה, הפלטפורמה ושכבת ה־AI של Spectra.",
    },
    litalWhy: {
      en: "Brings product and frontend experience from Wix and leads interface quality and user experience across Spectra.",
      he: "מביאה ניסיון במוצר וב־frontend מ־Wix ומובילה את איכות הממשקים וחוויית המשתמש בכל מוצרי Spectra.",
    },
    yaarWhy: {
      en: "Connects customers, operational data, support and Spectra’s professional product catalog.",
      he: "מחברת בין הלקוחות, הדאטה התפעולי, התמיכה וקטלוג המוצרים המקצועי.",
    },
  },
  advisors: {
    kicker: { en: "Investors & Advisors", he: "משקיעים ויועצים" },
    title: {
      en: "People around the table who understand capital, growth, data and professional beauty.",
      he: "סביב השולחן כבר יושבים אנשים שמבינים הון, צמיחה, דאטה ויופי מקצועי.",
    },
    people: [
      {
        name: { en: "Yoav Horovitz", he: "יואב הורוביץ" },
        role: { en: "Investor & Board Member", he: "משקיע וחבר דירקטוריון" },
        background: { en: "", he: "" },
        help: {
          en: "Spectra investor supporting financing, governance and strategic decisions.",
          he: "משקיע ב־Spectra התומך במימון, ממשל תאגידי והחלטות אסטרטגיות.",
        },
      },
      {
        name: { en: "Brian Cooper", he: "בריאן קופר" },
        role: { en: "Investor / Board Observer", he: "משקיע / משקיף בבורד" },
        background: { en: "", he: "" },
        help: {
          en: "Co-founder of Retalix, which was acquired by NCR for $650M; brings deep enterprise retail software experience.",
          he: "מייסד שותף של Retalix, שנרכשה על ידי NCR תמורת $650M; מביא ניסיון עמוק בתוכנה ארגונית לקמעונאות.",
        },
      },
      {
        name: { en: "Alon Maharshak", he: "אלון מרשק" },
        role: { en: "Investor / Board Advisor", he: "משקיע / יועץ לבורד" },
        background: { en: "", he: "" },
        help: {
          en: "VC executive for a prominent holding company and HNWIs, managing investments from sourcing and due diligence through post-investment execution.",
          he: "מנהל השקעות בחברת אחזקות בולטת ובקרב HNWIs, המלווה השקעות מהשלב הראשוני ובדיקת נאותות ועד ביצוע לאחר ההשקעה.",
        },
      },
      {
        name: { en: "Udi Oster", he: "אודי אוסטר" },
        role: { en: "Investor", he: "משקיע" },
        background: { en: "", he: "" },
        help: {
          en: "Co-founder and CTO of Tapingo, acquired by Grubhub for $150M; brings product, engineering and scaling experience.",
          he: "מייסד שותף ו־CTO של Tapingo, שנרכשה על ידי Grubhub תמורת $150M; מביא ניסיון במוצר, הנדסה והתרחבות.",
        },
      },
      {
        name: { en: "Roy Gefen", he: "רועי גפן" },
        role: { en: "GTM Advisor", he: "יועץ GTM" },
        background: { en: "", he: "" },
        help: {
          en: "Experienced technology marketing executive advising on positioning, acquisition and international growth.",
          he: "מנהל שיווק טכנולוגי מנוסה המייעץ בנושאי מיצוב, רכישה וצמיחה בינלאומית.",
        },
      },
      {
        name: { en: "Oren Revach", he: "אורן רווח" },
        role: { en: "Professional Beauty Advisor", he: "יועץ יופי מקצועי" },
        background: { en: "", he: "" },
        help: {
          en: "Chairman of The Estée Lauder Companies Israel, bringing deep beauty-industry and distribution experience.",
          he: "יו״ר קבוצת החברות של Estée Lauder בישראל, המביא ניסיון עמוק בתעשיית היופי ובהפצה.",
        },
      },
      {
        name: { en: "Paul Hagege", he: "פול הג׳ג׳" },
        role: { en: "Data & Industry Advisor", he: "יועץ דאטה ותעשייה" },
        background: { en: "", he: "" },
        help: {
          en: "Founder of CHD Expert, acquired by Datassential; investor and director at Fyre, turning real-world hospitality consumption into market intelligence for global F&B brands.",
          he: "מייסד CHD Expert, שנרכשה על ידי Datassential; משקיע ודירקטור ב־Fyre, שהופכת צריכה אמיתית מעולם האירוח למודיעין שוק עבור מותגי מזון ומשקאות גלובליים.",
        },
      },
    ],
  },
  gtm: {
    close: {
      en: "We learned how to acquire salons, and how to monetize them.",
      he: "למדנו איך לרכוש סלונים, ואיך לייצר מהם הכנסה.",
    },
    remotely: {
      en: "We already learned how to acquire salons remotely.",
      he: "כבר למדנו איך לרכוש סלונים מרחוק.",
    },
  },
  raise: {
    fundsLabel: { en: "Use of funds", he: "שימוש בכסף" },
    funds: [
      {
        label: { en: "Product & engineering", he: "מוצר והנדסה" },
        body: {
          en: "Complete Salon OS and build the Salon AI foundation.",
          he: "להשלים את Salon OS ולבנות את התשתית של Salon AI.",
        },
      },
      {
        label: { en: "Customer expansion", he: "הרחבת לקוחות" },
        body: {
          en: "Expand Salon OS across the existing salon network and learn from real daily usage.",
          he: "להרחיב את Salon OS ברשת הסלונים הקיימת וללמוד משימוש יומיומי אמיתי.",
        },
      },
      {
        label: { en: "Growth", he: "צמיחה" },
        body: {
          en: "Scale the acquisition motion we already proved, using a leaner AI-native GTM model.",
          he: "להגדיל את מנגנון הרכישה שכבר הוכחנו באמצעות מודל GTM רזה ומבוסס AI.",
        },
      },
      {
        label: { en: "Data / industry", he: "דאטה / תעשייה" },
        body: {
          en: "Expand the intelligence layer for brands and distributors.",
          he: "להרחיב את שכבת האינטליגנציה למותגים ולמפיצים.",
        },
      },
      {
        label: { en: "Operations", he: "תפעול" },
        body: {
          en: "Keep the company lean while supporting international execution.",
          he: "לשמור על חברה רזה תוך תמיכה בביצוע בינלאומי.",
        },
      },
    ],
    milestone: {
      en: "",
      he: "",
    },
  },
  exit: {
    kicker: { en: "Strategic exit", he: "יציאה אסטרטגית" },
    title: {
      en: "The layer we are building could be strategically valuable to some of the largest players in beauty, software, distribution and data.",
      he: "השכבה שאנחנו בונים עשויה להיות בעלת ערך אסטרטגי לכמה מהשחקנים הגדולים ביותר בעולמות היופי, התוכנה, ההפצה והדאטה.",
    },
    tags: {
      en: "",
      he: "",
    },
    categories: [
      {
        serial: "01",
        label: { en: "Professional Beauty", he: "יופי מקצועי" },
        names: ["L’Oréal", "Estée Lauder", "Wella Company", "Henkel"],
        body: {
          en: "Direct visibility into real salon consumption, professional behavior and service-level product usage.",
          he: "ראות ישירה לצריכה אמיתית בסלון, להתנהגות מקצועית ולשימוש במוצרים ברמת השירות.",
        },
      },
      {
        serial: "02",
        label: { en: "Salon Software", he: "תוכנות לסלונים" },
        names: ["Zenoti", "Fresha", "Phorest"],
        body: {
          en: "Add the physical execution and product-consumption layer that booking, CRM and POS do not naturally see.",
          he: "הוספת שכבת הביצוע הפיזי וצריכת המוצרים שמערכות תורים, CRM ו-POS אינן רואות באופן טבעי.",
        },
      },
      {
        serial: "03",
        label: { en: "Distribution & Commerce", he: "הפצה ומסחר" },
        names: ["SalonCentric", "CosmoProf / Beauty Systems Group", "State Beauty Supply"],
        body: {
          en: "Connect actual consumption directly to replenishment and professional purchasing.",
          he: "חיבור הצריכה בפועל ישירות לחידוש מלאי ולרכש מקצועי.",
        },
      },
      {
        serial: "04",
        label: { en: "Data & Market Intelligence", he: "דאטה ומודיעין שוק" },
        names: ["NielsenIQ", "Circana"],
        body: {
          en: "Add proprietary professional-beauty execution data to existing consumer and retail intelligence.",
          he: "הוספת דאטה קנייני על ביצוע בעולם היופי המקצועי למודיעין צרכני וקמעונאי קיים.",
        },
      },
    ],
    close: {
      en: "Different buyers. One intersection: workflow, consumption, software and data.",
      he: "קונים שונים. צומת אחד: זרימת עבודה, צריכה, תוכנה ודאטה.",
    },
    disclaimer: { en: "", he: "" },
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
  contacts: [
    { name: { en: "Maor Ganon", he: "מאור גנון" }, email: "maor@spectra-ci.com" },
    { name: { en: "Elad Gotlieb", he: "אלעד גוטליב" }, email: "elad@spectra-ci.com" },
  ],
  social: {
    instagram: { label: "@spectra.ci", href: "https://www.instagram.com/spectra.ci/" },
    youtube: { label: "YouTube", href: "https://www.youtube.com/@spectracolorintelligence" },
  },
} as const;
