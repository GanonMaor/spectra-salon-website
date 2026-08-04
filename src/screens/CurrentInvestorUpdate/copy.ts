export type InvestorUpdateLang = "en" | "he";
export type LocalizedText = Record<InvestorUpdateLang, string>;

export type LetterBlock = {
  kind: "paragraph" | "emphasis";
  text: LocalizedText;
};

export const UPDATE_META = {
  route: "/investors/2026-update",
  deckRoute: "/investors/new-narrative-salon-ai-first#salon-ai",
  title: "Spectra | August 2026 Investor Update",
  description: "A private update for Spectra's existing investors.",
  date: {
    en: "August 2026",
    he: "אוגוסט 2026",
  } satisfies LocalizedText,
} as const;

export const INTRO = {
  eyebrow: {
    en: "A Personal Update From Spectra",
    he: "עדכון אישי מספקטרה",
  },
  title: {
    en: "The First Step Worked.",
    he: "הצעד הראשון הצליח.",
  },
  subtitle: {
    en: "What began in the color room became a working network of salons, professionals and real operational data. Now we are building the system around it.",
    he: "מה שהתחיל בחדר הצבע הפך לרשת פעילה של סלונים, אנשי מקצוע ודאטה תפעולי אמיתי. עכשיו אנחנו בונים סביבו את המערכת השלמה.",
  },
  byline: {
    en: "A note from Maor Ganon",
    he: "מכתב ממאור גנון",
  },
  customerProof: {
    en: "The professionals already working with Spectra",
    he: "אנשי המקצוע שכבר עובדים עם ספקטרה",
  },
  customerRegions: {
    en: "United States · Russia · Japan · Netherlands · Portugal · Israel · Chile",
    he: "ארצות הברית · רוסיה · יפן · הולנד · פורטוגל · ישראל · צ׳ילה",
  },
  languageLabel: {
    en: "Change language",
    he: "החלפת שפה",
  },
} as const satisfies Record<string, LocalizedText>;

export const LETTER_OPENING_BLOCKS: LetterBlock[] = [
  {
    kind: "paragraph",
    text: {
      en: "Hello everyone,",
      he: "שלום לכולם,",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "I wanted to share personally where Spectra stands today, the road we have traveled, and the new direction we are taking.",
      he: "רציתי לשתף אתכם באופן אישי בשלב שבו ספקטרה נמצאת היום, בדרך שעברנו ובכיוון החדש שאליו אנחנו יוצאים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Spectra began with a real problem I knew from the field, both as a salon owner and as someone who lives the daily reality of color, inventory, clients and teams.",
      he: "ספקטרה התחילה מתוך בעיה אמיתית שהכרתי מהשטח, כבעל סלון וכמי שחי את עולם הצבע, המלאי, הלקוחות והצוותים ביום יום.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Along the way, we realized that the problem we are solving is much larger than color and inventory management.",
      he: "לאורך הדרך הבנו שהבעיה שאנחנו פותרים גדולה הרבה יותר מניהול צבע ומלאי.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Over the years, we continued building and learning through complex periods and repeated disruptions, while staying close to the daily reality of our customers.",
      he: "לאורך השנים המשכנו לבנות וללמוד גם בתקופות מורכבות ומשברים, תוך שמירה על קשר קרוב למציאות היומיומית של הלקוחות שלנו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Salon owners need to manage schedules, employees, clients, inventory, expenses, revenue, marketing and service. Yet most existing systems only display information. They do not truly understand the business or help the owner know what to do next.",
      he: "בעלי סלונים צריכים לנהל יומן, עובדים, לקוחות, מלאי, הוצאות, הכנסות, שיווק ושירות, אבל רוב המערכות הקיימות רק מציגות מידע. הן לא באמת מבינות את העסק ולא עוזרות לבעלים לדעת מה לעשות עכשיו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "After approximately a year of deeply examining how to enter the US market, we decided to pause sales and focus on product development.",
      he: "אחרי כשנה של חקירה עמוקה סביב החדירה לשוק האמריקאי, קיבלנו החלטה לעצור את המכירות ולהתמקד בפיתוח.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "The decision was difficult. By that point, continuing in the same way no longer made sense.",
      he: "זו הייתה החלטה קשה. בשלב הזה כבר היה ברור שאין היגיון להמשיך באותה דרך.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Instead of continuing to push a partial product into a large market, we chose to rebuild the foundation and create a much more meaningful product.",
      he: "במקום להמשיך לדחוף מוצר חלקי לשוק גדול, החלטנו לבנות מחדש את התשתית וליצור מוצר הרבה יותר משמעותי.",
    },
  },
  {
    kind: "emphasis",
    text: {
      en: "We did this with almost no resources.",
      he: "עשינו את זה כמעט בלי משאבים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "The team remained more committed than ever, working around the clock with the minimum possible resources. During this period, we rebuilt the system, created a stronger and simpler operational foundation, and prepared it for an AI-native future.",
      he: "הצוות נשאר מחויב מתמיד, עובד מסביב לשעון ובמינימום האפשרי. בתקופה הזו בנינו מחדש את המערכת, יצרנו תשתית חזקה ופשוטה יותר לתפעול, והכנו אותה לעולם של AI.",
    },
  },
];

export const LETTER_PRODUCT_BLOCKS: LetterBlock[] = [
  {
    kind: "paragraph",
    text: {
      en: "Today, our direction is clear:",
      he: "היום הכיוון שלנו ברור:",
    },
  },
  {
    kind: "emphasis",
    text: {
      en: "Spectra is evolving from a Color Intelligence company into an AI company building a complete operating system for the salon industry.",
      he: "ספקטרה הופכת מחברת Color Intelligence לחברת AI שבונה מערכת הפעלה מלאה לעולם הסלונים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "The first layer is Salon OS. It connects the calendar, clients, employees, services, inventory, payments, expenses and business performance in one place.",
      he: "השלב הראשון הוא Salon OS. זו מערכת שמחברת במקום אחד את היומן, הלקוחות, העובדים, השירותים, המלאי, התשלומים, ההוצאות והביצועים העסקיים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Above it, we are building Salon AI: a layer of intelligent agents designed to understand the business, identify problems and opportunities, answer questions and, over time, take action for the salon owner.",
      he: "מעליה אנחנו בונים את Salon AI. זו שכבת סוכנים חכמים שתדע להבין את העסק, לזהות בעיות והזדמנויות, לענות על שאלות ובהמשך גם לבצע פעולות עבור בעל הסלון.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Instead of moving between dozens of screens and reports, a salon owner will simply be able to ask:",
      he: "במקום לעבור בין עשרות מסכים ודוחות, בעל הסלון יוכל פשוט לשאול:",
    },
  },
];

export const PROOF_SECTION = {
  eyebrow: {
    en: "The foundation behind the next chapter",
    he: "התשתית שמאחורי הפרק הבא",
  },
  title: {
    en: "Built on Real Salons. Rebuilt for AI.",
    he: "נבנה על סלונים אמיתיים. נבנה מחדש עבור AI.",
  },
  subtitle: {
    en: "The next chapter builds on real customers, real workflows, real data and years of operational learning.",
    he: "הפרק הבא נבנה על לקוחות אמיתיים, תהליכי עבודה אמיתיים, דאטה אמיתי ושנים של למידה תפעולית.",
  },
  impactTitle: {
    en: "What This Enables",
    he: "מה התשתית הזו מאפשרת",
  },
} as const satisfies Record<string, LocalizedText>;

export const PROOF_METRICS: Array<{
  value: string;
  label: LocalizedText;
  note: LocalizedText;
}> = [
  {
    value: "170+",
    label: { en: "Existing salons", he: "סלונים קיימים" },
    note: { en: "Rollout base for the new platform", he: "בסיס ההטמעה של הפלטפורמה החדשה" },
  },
  {
    value: "$130K",
    label: { en: "ARR", he: "הכנסה שנתית חוזרת" },
    note: { en: "From the current customer base", he: "מבסיס הלקוחות הנוכחי" },
  },
  {
    value: "12",
    label: { en: "Countries", he: "מדינות" },
    note: { en: "Usage across multiple markets", he: "שימוש במספר שווקים" },
  },
  {
    value: "500+",
    label: { en: "Color technicians", he: "אנשי מקצוע בתחום הצבע" },
    note: { en: "Using the system in daily workflows", he: "משתמשים במערכת בתהליכי העבודה" },
  },
  {
    value: "556K+",
    label: { en: "Services analyzed", he: "שירותים שנותחו" },
    note: { en: "Real formulas, timing and outcomes", he: "פורמולות, זמנים ותוצאות מהשטח" },
  },
  {
    value: "40",
    label: { en: "Months of history", he: "חודשי היסטוריה" },
    note: { en: "Longitudinal operational data", he: "דאטה תפעולי לאורך זמן" },
  },
];

export const PROOF_IMPACT: LocalizedText[] = [
  {
    en: "One connected operating system across appointments, clients, staff, inventory and payments",
    he: "מערכת הפעלה מחוברת ליומן, לקוחות, צוות, מלאי ותשלומים",
  },
  {
    en: "AI-ready business context across the salon",
    he: "הקשר עסקי מלא שמוכן להפעלת שכבת AI",
  },
  {
    en: "A gradual rollout through more than 170 existing salons",
    he: "הטמעה הדרגתית דרך יותר מ־170 סלונים קיימים",
  },
  {
    en: "Faster learning and a stronger path to growth",
    he: "למידה מהירה יותר ובסיס חזק יותר לצמיחה",
  },
];

export const SALON_AI_QUESTIONS: Record<InvestorUpdateLang, string[]> = {
  en: [
    "Where am I losing money?",
    "Which clients have not returned?",
    "What am I missing in inventory?",
    "Which employee needs more work?",
    "What can I do to improve next week?",
  ],
  he: [
    "איפה אני מפסיד כסף?",
    "אילו לקוחות לא חזרו?",
    "מה חסר לי במלאי?",
    "איזה עובד צריך יותר עבודה?",
    "מה אפשר לעשות כדי לשפר את השבוע הבא?",
  ],
};

export const LETTER_BLOCKS_AFTER_QUESTIONS: LetterBlock[] = [
  {
    kind: "emphasis",
    text: {
      en: "The system will display the data in context, explain what it means and suggest the next action.",
      he: "המערכת תציג את הנתונים בהקשר הנכון, תסביר מה הם אומרים ותציע את הפעולה הבאה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "We will begin deploying the new product with our existing customer base, which currently includes more than 170 salons.",
      he: "את המוצר החדש נתחיל להטמיע קודם אצל בסיס הלקוחות הקיים שלנו, שמונה כיום יותר מ־170 סלונים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "This is a significant advantage for us.",
      he: "זה יתרון גדול מאוד מבחינתנו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "We already have existing customers, real experience, data, a deep connection to the field, and the ability to learn and improve the product through daily use.",
      he: "יש לנו לקוחות קיימים, ניסיון אמיתי, דאטה, קשר עמוק לשטח ויכולת ללמוד ולשפר את המוצר מתוך שימוש יומיומי.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "I also want to recognize the people who are holding the company together with me.",
      he: "אני רוצה גם לתת מקום לאנשים שמחזיקים את החברה יחד איתי.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Elad has been my partner throughout this journey. He leads the company's financial, organizational and operational work, supports the employees and the operation, and helps me make product decisions through a business and commercial lens.",
      he: "אלעד הוא השותף שלי לאורך הדרך. הוא מוביל את הצד הפיננסי, הארגוני והתפעולי של החברה, מחזיק את העובדים והאופרציה, ועוזר לי גם בהחלטות מוצר מתוך הסתכלות עסקית ומסחרית.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Achela leads development and played a central role in rebuilding the system and creating the foundations of Salon OS and Salon AI.",
      he: "אצ׳לה מוביל את הפיתוח והיה חלק מרכזי בבנייה מחדש של המערכת וביצירת היסודות של Salon OS ו־Salon AI.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Lital, who joined us after approximately 12 years at Wix, leads the front end, user experience and testing processes at a very high level.",
      he: "ליטל, שהצטרפה אלינו אחרי כ־12 שנים ב־Wix, מובילה את הפרונט, חוויית המשתמש ותהליכי הבדיקות ברמה גבוהה מאוד.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Yaar continues to lead customer service and our customers' product database, which is one of the most important assets we have built over the years.",
      he: "יער ממשיכה להוביל את שירות הלקוחות ואת מאגר המוצרים של הלקוחות, שהוא אחד הנכסים החשובים שבנינו לאורך השנים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Roy Gefen continues to help us with marketing thinking, the vision, and keeping the product relevant to the market.",
      he: "רועי גפן ממשיך לעזור לנו כל הזמן בחשיבה השיווקית, בחזון ובשמירה על הרלוונטיות של המוצר מול השוק.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Danny also played a meaningful role in the journey and in the company's early foundations. During the past two years, he has been less active, mainly because of prior commitments and because we did not complete a financing that could support full activity under the previous structure. I greatly appreciate his contribution and the road he traveled with us.",
      he: "גם דני היה חלק משמעותי מהדרך ומהיסודות הראשונים של החברה. בשנתיים האחרונות הוא היה פחות פעיל, בעיקר בשל התחייבויות קודמות ובשל העובדה שלא השלמנו גיוס שאפשר המשך פעילות מלאה במבנה הקודם. אני מעריך מאוד את התרומה שלו ואת הדרך שעשה איתנו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Along the way, we received many valuable ideas from investors and experienced people we met. Conversations with people such as Oren Revach, Paul and others helped us sharpen our thinking, the product and the way the company should be built.",
      he: "לאורך הדרך קיבלנו הרבה רעיונות טובים ממשקיעים ואנשים מנוסים שפגשנו. שיחות עם אנשים כמו אורן רווח, פול ואחרים עזרו לנו לדייק את החשיבה, את המוצר ואת הדרך שבה נכון לבנות את החברה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Yoav Horovitz has been one of Spectra's most significant and consistent investors. He has supported the company across several stages, continued investing during challenging periods, and holds one voting seat on the company's board.",
      he: "יואב הורוביץ הוא אחד המשקיעים המרכזיים והמשמעותיים ביותר בספקטרה. הוא תמך בחברה לאורך כמה שלבים, המשיך להשקיע גם בתקופות מורכבות ומחזיק בקול אחד בבורד החברה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "I also want to recognize Amos Horovitz, who was the person who introduced us.",
      he: "אני רוצה לתת מקום גם לעמוס הורוביץ, שהיה האדם שחיבר בינינו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Meeting Amos, and the connection he created with Yoav, changed my life and had a profound impact on Spectra's journey. For years, I had been trying to build something meaningful with the right people, and this relationship became one of the most important in my life and in the company's history.",
      he: "ההיכרות עם עמוס והחיבור שהוא יצר עם יואב שינו את החיים שלי והשפיעו עמוקות על הדרך של ספקטרה. במשך שנים ניסיתי לבנות משהו משמעותי שאוכל לקדם יחד עם האנשים הנכונים, והקשר הזה הפך לאחד הקשרים החשובים ביותר עבורי ועבור החברה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "I am deeply grateful to Amos for the introduction, the trust, the personal support, and everything he has done for us along the way.",
      he: "אני מודה לעמוס מעומק הלב על ההיכרות, על האמון, על התמיכה האישית ועל הדרך שבה עזר לנו לאורך השנים.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Recently, we also connected with Alon.",
      he: "בתקופה האחרונה התחברנו גם לאלון.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "His experience in strategy, operations, growth and investor relationships can be very meaningful for us at this stage.",
      he: "הניסיון שלו באסטרטגיה, אופרציה, צמיחה וחיבורים למשקיעים יכול להיות משמעותי מאוד עבורנו בשלב הזה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "His role includes a commitment beyond advice. Under the agreement, the owner of Aquilo Ventures committed to make an angel investment in the company by August 31, 2026. Aquilo also committed to assist with strategy, operations, growth and investor introductions. Its compensation includes success-based fees and warrants under the terms set out in the agreement.",
      he: "התפקיד שלו כולל מחויבות מעבר לייעוץ. לפי ההסכם, הבעלים של Aquilo Ventures התחייב לבצע השקעת אנג׳ל בחברה עד 31 באוגוסט 2026. Aquilo התחייבה גם לסייע בנושאי אסטרטגיה, תפעול, צמיחה וחיבור למשקיעים. התגמול כולל רכיבים מבוססי הצלחה ו־warrants בהתאם לתנאים המפורטים בהסכם.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Separately, we are evaluating whether the terms of the company's most recent financing instrument can be extended to support up to an additional $600K, subject to board, investor and legal approval.",
      he: "בנפרד, אנחנו בוחנים אפשרות להאריך את תנאי מכשיר ההשקעה האחרון, כך שיוכל לתמוך בגיוס נוסף של עד 600 אלף דולר, בכפוף לאישורי הבורד והמשקיעים הנדרשים ולבדיקה משפטית.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "The purpose is to enable faster and more efficient financing without returning to complex legal expenses or delaying the company through unnecessary processes. Any such step will, of course, be carried out in an orderly and transparent manner with appropriate legal guidance.",
      he: "המטרה היא לאפשר גיוס מהיר ויעיל יותר, בלי להיכנס שוב להוצאות משפטיות מורכבות ובלי לעכב את החברה בתהליכים מיותרים. כמובן שכל מהלך כזה ייעשה בצורה מסודרת, בשקיפות ובליווי משפטי מתאים.",
    },
  },
  {
    kind: "emphasis",
    text: {
      en: "The purpose of the next financing is to move forward with what we have already built.",
      he: "מטרת הגיוס הבא היא לקדם את מה שכבר בנינו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "It is intended to take what we have already built, complete Salon OS, deploy it with our existing customers, accelerate Salon AI and return the company to a path of meaningful growth.",
      he: "הוא נועד לקחת את מה שכבר בנינו, להשלים את Salon OS, להטמיע אותו אצל הלקוחות הקיימים, להאיץ את Salon AI ולהחזיר את החברה למסלול צמיחה משמעותי.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "The road has been longer and more complex than we expected at the beginning.",
      he: "הדרך הייתה ארוכה ומורכבת יותר ממה שחשבנו בתחילת הדרך.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "Today, however, we are in a much more mature, focused and clear position.",
      he: "אבל היום אנחנו במקום הרבה יותר בשל, ממוקד וברור.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "We have a committed team, real customers, deep knowledge, a new foundation, an advanced product and a larger vision than the one with which we started.",
      he: "יש לנו צוות מחויב, לקוחות אמיתיים, ידע עמוק, תשתית חדשה, מוצר מתקדם וחזון גדול יותר מזה שאיתו התחלנו.",
    },
  },
  {
    kind: "emphasis",
    text: {
      en: "My vision is to make Salon AI the intelligent operating system for the global beauty industry. It should manage the salon, understand what is happening inside it and work alongside the owner to improve it.",
      he: "החזון שלי הוא להפוך את Salon AI למערכת ההפעלה החכמה של תעשיית היופי בעולם. המערכת תנהל את הסלון, תבין מה קורה בו ותעבוד יחד עם הבעלים כדי לשפר אותו.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "I want to thank you for the trust, patience and support throughout the journey. Some of you supported us during the most difficult periods, and our ability to reach this point is directly connected to your belief in me, in Elad, in the team and in the company.",
      he: "אני רוצה להודות לכם על האמון, הסבלנות והתמיכה לאורך הדרך. חלקכם תמכתם בנו גם בתקופות המורכבות ביותר, והיכולת שלנו להגיע לנקודה הזו קשורה ישירות לאמונה שלכם בי, באלעד, בצוות ובחברה.",
    },
  },
  {
    kind: "paragraph",
    text: {
      en: "We look forward to holding a structured conversation soon to present the product, the roadmap, the next financing structure and our plan for the coming year.",
      he: "בקרוב נשמח לקיים שיחה מסודרת, להציג את המוצר, את מפת הדרך, את מבנה הגיוס הבא ואת התוכנית שלנו לשנה הקרובה.",
    },
  },
];

export const CLOSING = {
  thanks: {
    en: "Thank you for the journey, the trust and the support over the years.",
    he: "תודה על הדרך, על האמון ועל התמיכה לאורך השנים.",
  },
  signoff: {
    en: "With appreciation,",
    he: "בברכה ובהערכה,",
  },
  names: {
    en: "Maor Ganon and Elad Gotlieb",
    he: "מאור גנון ואלעד גוטליב",
  },
  role: {
    en: "Co-Founders",
    he: "מייסדים שותפים",
  },
  cta: {
    en: "Continue to the Salon AI Presentation",
    he: "המשיכו למצגת Salon AI",
  },
  ctaSubline: {
    en: "Product, market opportunity, rollout plan and the next 12 months.",
    he: "המוצר, הזדמנות השוק, תוכנית ההטמעה ו־12 החודשים הבאים.",
  },
} as const satisfies Record<string, LocalizedText>;
