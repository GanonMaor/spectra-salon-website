export type UpdateLang = "en" | "he";
export type Localized = Record<UpdateLang, string>;

export const FINAL_META = {
  title: "Spectra | From Color Intelligence to Salon AI",
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
  /** Owner surfaces, shown one at a time beside the copy. */
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
    en: "The customers, data and team already exist. Significant parts of the new platform are built. This capital completes the transition and restarts growth.",
    he: "הלקוחות, הדאטה והצוות כבר קיימים. חלקים משמעותיים מהפלטפורמה החדשה כבר נבנו. ההון הזה משלים את המעבר ומחדש את הצמיחה.",
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
      en: "Spectra has raised $1M+ to date. The current instrument is a separate financing path that is still open.",
      he: "Spectra גייסה יותר מ-$1M עד היום. מכשיר המימון הנוכחי הוא מסלול נפרד שעדיין פתוח.",
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
      en: "Rounded figures for orientation. This is an extension of the existing financing instrument, not a new priced round.",
      he: "מספרים מעוגלים לצורך התמצאות. מדובר בהרחבה של מכשיר המימון הקיים ולא בסבב חדש במחיר.",
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
        en: "Deploy across the existing customer base and validate the expanded model.",
        he: "להטמיע בבסיס הלקוחות הקיים ולאמת את המודל המורחב.",
      },
    },
    {
      title: { en: "Grow", he: "לצמוח" },
      body: {
        en: "Restart acquisition and prepare for international scale.",
        he: "לחדש את גיוס הלקוחות ולהתכונן להתרחבות בינלאומית.",
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
    en: "Extension of the company’s most recent financing instrument rather than a new priced round, subject to board, investor and legal approval. An advisory engagement carries performance-linked and equity-based compensation. Forward-looking milestones depend on product completion, adoption, growth and market conditions.",
    he: "הרחבה של מכשיר המימון האחרון של החברה ולא סבב חדש במחיר, בכפוף לאישורי בורד, משקיעים ובדיקה משפטית. התקשרות ייעוץ כוללת תגמול מותנה הצלחה ורכיב הוני. אבני הדרך העתידיות תלויות בהשלמת המוצר, באימוץ, בצמיחה ובתנאי השוק.",
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
