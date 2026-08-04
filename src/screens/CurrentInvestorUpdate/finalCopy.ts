export type UpdateLang = "en" | "he";
export type Localized = Record<UpdateLang, string>;

export const FINAL_META = {
  title: "Spectra | August 2026 Update",
  date: { en: "August 2026", he: "אוגוסט 2026" } satisfies Localized,
} as const;

export const FINAL_HERO = {
  eyebrow: {
    en: "Investor and partner update",
    he: "עדכון משקיעים ושותפים",
  },
  title: {
    en: "A few words about the road behind us, and the one ahead.",
    he: "כמה מילים על הדרך שעברנו ועל הדרך שלפנינו.",
  },
  body: {
    en: "To our investors, partners and friends. We want to share what the last chapter taught us, why our belief in Spectra is stronger today, and where we are going together.",
    he: "למשקיעים, לשותפים ולחברים שלנו. אנחנו רוצים לשתף במה שלמדנו בפרק האחרון, למה האמונה שלנו בספקטרה חזקה היום יותר ולאן אנחנו הולכים יחד.",
  },
  customerProof: {
    en: "Professionals already working with Spectra",
    he: "אנשי מקצוע שכבר עובדים עם ספקטרה",
  },
  regions: {
    en: "🇺🇸 United States · 🇷🇺 Russia · 🇯🇵 Japan · 🇳🇱 Netherlands · 🇵🇹 Portugal · 🇮🇱 Israel · 🇨🇱 Chile",
    he: "🇺🇸 ארצות הברית · 🇷🇺 רוסיה · 🇯🇵 יפן · 🇳🇱 הולנד · 🇵🇹 פורטוגל · 🇮🇱 ישראל · 🇨🇱 צ׳ילה",
  },
  read: { en: "Continue reading", he: "להמשך הקריאה" },
} as const;

export const FINAL_STORY = {
  origin: {
    eyebrow: { en: "Where we began", he: "איפה התחלנו" },
    title: {
      en: "We started Spectra to solve a real problem I had lived with throughout my years in the industry.",
      he: "התחלנו את ספקטרה כדי לפתור בעיה אמיתית שליוותה אותי לאורך כל שנותיי בענף.",
    },
    paragraphs: {
      en: [
        "We started Spectra to solve a real problem I had lived with in my salon throughout my years in the industry. Color, inventory, clients and teams were being managed without one clear, connected view of the business. From there, Elad and I, together with Danny and the team, began building a solution from that experience.",
        "Working with salons taught us that the need reaches far beyond color. Owners need one clear picture of their business and help deciding what deserves attention.",
      ],
      he: [
        "התחלנו את ספקטרה כדי לפתור בעיה אמיתית שליוותה אותי בסלון לאורך כל שנותיי בענף. ניהול הצבע, המלאי, הלקוחות והצוותים נעשה בלי תמונה אחת ברורה ומחוברת של העסק. משם, אלעד ואני, יחד עם דני והצוות, התחלנו לבנות פתרון מתוך הניסיון הזה.",
        "העבודה עם סלונים לימדה אותנו שהצורך רחב הרבה יותר מצבע. בעלי סלונים צריכים תמונה ברורה אחת של העסק ועזרה בהחלטה במה לטפל עכשיו.",
      ],
    },
  },
  rebuild: {
    eyebrow: { en: "The decision to pause", he: "ההחלטה לעצור" },
    title: {
      en: "Stopping sales was difficult. Continuing with the wrong foundation would have been worse.",
      he: "לעצור את המכירות היה קשה. להמשיך עם תשתית לא נכונה היה קשה יותר.",
    },
    paragraphs: {
      en: [
        "After a long examination of the US market, we stopped pushing sales and returned our attention to the product. We had promised a great deal, delivered part of it, and understood that the larger promise needed a stronger base.",
        "The team stayed. With very limited resources, we rebuilt major parts of the platform. That period strengthened our belief in one another and in what we can still accomplish together.",
      ],
      he: [
        "אחרי בחינה ארוכה של השוק האמריקאי, עצרנו את מאמצי המכירה וחזרנו להתמקד במוצר. הבטחנו הרבה, מימשנו חלק, והבנו שההבטחה הגדולה דורשת בסיס חזק יותר.",
        "הצוות נשאר. עם מעט מאוד משאבים, בנינו מחדש חלקים מרכזיים בפלטפורמה. התקופה הזו חיזקה את האמונה שלנו זה בזה ובמה שעוד נוכל להשיג יחד.",
      ],
    },
  },
  proof: {
    eyebrow: { en: "Built on real salons", he: "נבנה על סלונים אמיתיים" },
    title: {
      en: "We are moving forward from something real.",
      he: "אנחנו ממשיכים קדימה מתוך בסיס אמיתי.",
    },
    paragraphs: {
      en: [
        "Our customers, years of salon activity and existing SaaS base give us a place to start, learn and improve. They are also a reminder that trust has to be earned every day.",
      ],
      he: [
        "הלקוחות שלנו, שנות הפעילות בסלונים ובסיס ה-SaaS הקיים נותנים לנו מקום להתחיל, ללמוד ולהשתפר. הם גם מזכירים לנו שאמון צריך להרוויח בכל יום מחדש.",
      ],
    },
  },
  direction: {
    eyebrow: { en: "The vision became clearer", he: "החזון התבהר" },
    title: {
      en: "We believe every salon will eventually work with an intelligent operating partner.",
      he: "אנחנו מאמינים שכל סלון יעבוד בעתיד עם שותף תפעולי חכם.",
    },
    paragraphs: {
      en: [
        "Salon OS connects the daily work. Salon AI learns from that context and helps the owner and team understand what is happening and what to do next.",
        "This is the future we believe in: technology that knows the business, works alongside the people inside it and gives them more time to lead, create and care for their clients.",
      ],
      he: [
        "Salon OS מחברת את העבודה היומיומית. Salon AI לומדת מההקשר הזה ועוזרת לבעלים ולצוות להבין מה קורה ומה נכון לעשות עכשיו.",
        "זה העתיד שאנחנו מאמינים בו: טכנולוגיה שמכירה את העסק, עובדת לצד האנשים שבתוכו ונותנת להם יותר זמן להוביל, ליצור ולטפל בלקוחות.",
      ],
    },
  },
  intelligence: {
    eyebrow: { en: "Why we believe we can build it", he: "למה אנחנו מאמינים שנוכל לבנות את זה" },
    title: {
      en: "Our advantage comes from understanding the work itself.",
      he: "היתרון שלנו מגיע מהבנה של העבודה עצמה.",
    },
    paragraphs: {
      en: [
        "We have spent years learning how salons actually operate. Salon AI can connect bookings, clients, staff, inventory, payments and color activity into one living picture.",
        "That depth is why we believe we can build something useful and lasting. We are determined to move carefully, learn from real use and keep important decisions in human hands.",
      ],
      he: [
        "השקענו שנים בלמידה של הדרך שבה סלונים באמת עובדים. Salon AI יכולה לחבר יומן, לקוחות, צוות, מלאי, תשלומים ופעילות צבע לתמונה חיה אחת.",
        "העומק הזה הוא הסיבה שאנחנו מאמינים שנוכל לבנות משהו שימושי שיישאר לאורך זמן. אנחנו נחושים להתקדם בזהירות, ללמוד משימוש אמיתי ולהשאיר החלטות חשובות בידיים אנושיות.",
      ],
    },
  },
  people: {
    eyebrow: { en: "The people behind Spectra", he: "האנשים שמאחורי ספקטרה" },
    title: {
      en: "Our belief in Spectra begins with the people who kept showing up.",
      he: "האמונה שלנו בספקטרה מתחילה באנשים שהמשיכו להגיע ולעשות.",
    },
    paragraphs: {
      en: [
        "As founders, we carry different parts of the company together. Elad leads finance, organization and operations and brings a commercial perspective to product decisions. Achela leads development and was central to the rebuild. Lital joined us after nearly 12 years at Wix and leads front-end, user experience and testing. Yaar leads customer service and maintains the customer product database, one of the important assets we have built.",
        "Roy Gefen is an active advisor on marketing, market relevance and go-to-market. Danny helped build Spectra's early foundation and has been less active during the last two years because of earlier commitments and the financing we did not complete. We remain grateful for what he built with us.",
      ],
      he: [
        "כמייסדים, אנחנו מחזיקים יחד חלקים שונים בחברה. אלעד מוביל את הצד הפיננסי, הארגוני והתפעולי ומביא הסתכלות מסחרית להחלטות מוצר. אצ׳לה מוביל את הפיתוח והיה דמות מרכזית בבנייה מחדש. ליטל הצטרפה אלינו אחרי כמעט 12 שנים ב-Wix ומובילה את הפרונט, חוויית המשתמש והבדיקות. יער מובילה את שירות הלקוחות ומתחזקת את מאגר המוצרים של הלקוחות, אחד הנכסים החשובים שבנינו.",
        "רועי גפן הוא יועץ פעיל בשיווק, ברלוונטיות מול השוק וב-go-to-market. דני עזר לבנות את היסודות הראשונים של ספקטרה והיה פחות פעיל בשנתיים האחרונות בגלל התחייבויות קודמות והגיוס שלא השלמנו. אנחנו ממשיכים להעריך את מה שבנה איתנו.",
      ],
    },
  },
  supporters: {
    eyebrow: { en: "People who shaped the path", he: "אנשים שעיצבו את הדרך" },
    title: {
      en: "This road also belongs to the people who believed in us.",
      he: "הדרך הזו שייכת גם לאנשים שהאמינו בנו.",
    },
    paragraphs: {
      en: [
        "Brian Cooper was the first investor to believe in us and in Spectra. He supported the company across several stages, continued to stand beside us through challenging periods and remained actively involved in our thinking, decisions and progress. Brian serves as a board observer. His trust and commitment have been deeply important to our ability to keep building.",
        "Yoav Horovitz has also been one of Spectra's most significant investors. He supported the company across several stages, continued investing during challenging periods and holds one voting seat on the company's board.",
        "Amos Horovitz was the person who connected us. Meeting Amos and the relationship he created were life-changing and became an important part of Spectra's path. We are deeply grateful to him for his trust, personal support and for making that connection possible.",
        "Alongside our investors, we met experienced people who did not invest in Spectra but had a meaningful influence on our thinking and on how we understood the larger opportunity.",
        "Oren Revach, Chairman of The Estée Lauder Companies Israel, helped us see Spectra as infrastructure that could create value beyond individual salons, for major beauty companies and global professional networks. Through the connection to Aveda's network of approximately 9,000 salons worldwide, we gained a clearer understanding of how data generated inside salons can become a meaningful asset across the beauty-industry value chain.",
        "Paul Hagag, a data professional working on global data initiatives with L'Oréal, helped us shape our data programs, think more systematically about the value of the information we collect and understand how it can be transformed into useful insights for large beauty companies.",
        "Oren and Paul are not investors in Spectra. Their contribution came through their experience, perspective, challenging questions and the validation they provided for the need among major industry players.",
        "We are grateful to Brian, Yoav, Amos, Udi, our friends-and-family investors and everyone who trusted and continued supporting the company. We are also grateful to Oren, Paul and the other experienced people who shared their knowledge, challenged our assumptions and helped us sharpen our direction.",
      ],
      he: [
        "בריאן קופר היה המשקיע הראשון שהאמין בנו ובספקטרה. הוא תמך בחברה לאורך כמה שלבים, המשיך לעמוד לצדה גם בתקופות מורכבות והיה מעורב באופן פעיל בחשיבה, בהחלטות ובדרך שעברנו. בריאן משמש משקיף בבורד. האמון והמחויבות שלו היו משמעותיים מאוד ליכולת שלנו להמשיך לבנות.",
        "יואב הורוביץ הוא גם אחד המשקיעים המרכזיים והמשמעותיים ביותר בספקטרה. הוא תמך בחברה לאורך כמה שלבים, המשיך להשקיע בתקופות מורכבות ומחזיק בקול אחד בבורד החברה.",
        "עמוס הורוביץ היה האדם שחיבר אותנו. ההיכרות עם עמוס והקשר שהוא יצר היו משני חיים והפכו לחלק משמעותי מאוד מהדרך של ספקטרה. אנחנו מודים לו מעומק הלב על האמון, התמיכה האישית והחיבור החשוב הזה.",
        "לצד המשקיעים, פגשנו לאורך הדרך אנשים מנוסים שלא השקיעו בספקטרה, אבל השפיעו מאוד על צורת החשיבה שלנו ועל ההבנה של ההזדמנות הגדולה יותר.",
        "אורן רווח, יו״ר קבוצת החברות אסתי לאודר בישראל, עזר לנו לראות את ספקטרה כתשתית שיכולה לייצר ערך מעבר לסלון הבודד, גם עבור חברות ביוטי גדולות ורשתות בינלאומיות. דרך החיבור לרשת של Aveda, שפועלת עם כ-9,000 סלונים ברחבי העולם, התחזקה אצלנו ההבנה שהמידע שנוצר בתוך הסלון יכול להפוך לנכס משמעותי עבור כל שרשרת הערך של התעשייה.",
        "פול חג׳ג׳, איש דאטה שעובד על יוזמות מידע גלובליות עם L'Oréal, עזר לנו לגבש את תוכניות הדאטה שלנו, לחשוב בצורה מסודרת יותר על הערך של המידע שאנחנו אוספים ולהבין כיצד אפשר להפוך אותו לתובנות שימושיות עבור חברות ביוטי גדולות.",
        "אורן ופול אינם משקיעים בספקטרה. התרומה שלהם הגיעה מהניסיון, מהפרספקטיבה, מהשאלות שהציבו ומהחיזוק שנתנו לצורך שזיהינו בקרב שחקנים משמעותיים בתעשייה.",
        "אנחנו מודים לבריאן, ליואב, לעמוס, לאודי, למשקיעי החברים והמשפחה ולכל מי שנתן בנו אמון והמשיך לתמוך בחברה. אנחנו מודים גם לאורן, לפול ולאנשים מנוסים נוספים ששיתפו אותנו בידע שלהם, אתגרו את ההנחות שלנו ועזרו לנו לדייק את הדרך.",
      ],
    },
  },
  revenue: {
    eyebrow: { en: "How the platform grows value", he: "איך הפלטפורמה מגדילה ערך" },
    title: {
      en: "Each product layer can deepen the relationship with the salon.",
      he: "כל שכבת מוצר יכולה להעמיק את הקשר עם הסלון.",
    },
    paragraphs: {
      en: [
        "Color Intelligence created the first recurring relationship. Booking, CRM and POS broaden the daily workflow. Salon OS connects the operation. Salon AI adds intelligence and assisted actions.",
        "The revenue model shown here is a product-economics model. The later layers still require completion, adoption and successful commercial execution.",
      ],
      he: [
        "Color Intelligence יצרה את הקשר החוזר הראשון. יומן, CRM ו-POS מרחיבים את העבודה היומיומית. Salon OS מחברת את התפעול. Salon AI מוסיפה אינטליגנציה ופעולות מסייעות.",
        "מודל ההכנסות שמוצג כאן הוא מודל של כלכלת מוצר. השכבות הבאות עדיין דורשות השלמה, אימוץ וביצוע מסחרי מוצלח.",
      ],
    },
  },
  saas: {
    eyebrow: { en: "The SaaS base today", he: "בסיס ה-SaaS שלנו היום" },
    title: {
      en: "The recurring base is real, and there is room to improve how we operate it.",
      he: "בסיס ההכנסה החוזרת אמיתי, ויש מקום לשפר את הדרך שבה אנחנו מפעילים אותו.",
    },
    paragraphs: {
      en: [
        "For 11 months in 2025, we tested a focused go-to-market effort with a total budget of $40K. It generated 1,476 leads, 301 trials, 96 paying customers and $64,728 in actual ARR. For a small team working with limited tools, the result still feels extraordinary to us.",
        "With better onboarding, customer-success tools, activation automation and a broader product, we believe the business can improve revenue per salon, retention, expansion and acquisition efficiency.",
      ],
      he: [
        "במשך 11 חודשים בשנת 2025 בדקנו מהלך יציאה ממוקד לשוק בתקציב כולל של 40 אלף דולר. המהלך יצר 1,476 לידים, 301 ניסיונות, 96 לקוחות משלמים ו-ARR בפועל של 64,728 דולר. עבור צוות קטן שעבד עם כלים מוגבלים, התוצאה הזו עדיין מרגישה לנו יוצאת דופן.",
        "עם תהליך הטמעה טוב יותר, כלי שירות לקוחות, אוטומציה ומוצר רחב יותר, אנחנו מאמינים שאפשר לשפר הכנסה לסלון, שימור, הרחבה ויעילות רכישה.",
      ],
    },
  },
  financing: {
    eyebrow: { en: "The financing we are exploring", he: "הגיוס שאנחנו בוחנים" },
    title: {
      en: "The purpose is to complete, deploy and grow what the team has already rebuilt.",
      he: "המטרה היא להשלים, להטמיע ולהצמיח את מה שהצוות כבר בנה מחדש.",
    },
    paragraphs: {
      en: [
        "We recently began working with Alon. Under the agreement, the owner of Aquilo Ventures committed to make an angel investment in the company by August 31, 2026. Aquilo also supports strategy, operations, growth and investor introductions. Its compensation includes success-based fees and warrants under the agreement.",
        "Separately, we are evaluating whether the terms of the company's most recent financing instrument can be extended to support up to an additional $600K, subject to board, investor and legal approval.",
        "The capital would support completion of Salon OS, acceleration of Salon AI, rollout to existing salons, customer success, go-to-market activity and the core team's ability to execute.",
      ],
      he: [
        "בתקופה האחרונה התחלנו לעבוד עם אלון. לפי ההסכם, הבעלים של Aquilo Ventures התחייב לבצע השקעת אנג׳ל בחברה עד 31 באוגוסט 2026. Aquilo מסייעת גם באסטרטגיה, תפעול, צמיחה וחיבורים למשקיעים. התגמול כולל רכיבים מבוססי הצלחה ו-warrants בהתאם להסכם.",
        "בנפרד, אנחנו בוחנים אפשרות להאריך את תנאי מכשיר ההשקעה האחרון כדי לתמוך בגיוס נוסף של עד 600 אלף דולר, בכפוף לאישורי הבורד והמשקיעים הנדרשים ולבדיקה משפטית.",
        "הכסף ישמש להשלמת Salon OS, להאצת Salon AI, להטמעה אצל סלונים קיימים, לשירות לקוחות, לפעילות יציאה לשוק וליכולת של הצוות המרכזי לבצע.",
      ],
    },
  },
} as const;

export const FINAL_PROOF = [
  { value: "170+", label: { en: "Existing salons", he: "סלונים קיימים" }, note: { en: "Rollout base", he: "בסיס להטמעה" } },
  { value: "$130K", label: { en: "Current ARR", he: "ARR נוכחי" }, note: { en: "Recurring base", he: "בסיס הכנסה חוזרת" } },
  { value: "12", label: { en: "Countries", he: "מדינות" }, note: { en: "Multiple markets", he: "מספר שווקים" } },
  { value: "500+", label: { en: "Color technicians", he: "אנשי מקצוע בצבע" }, note: { en: "Real workflows", he: "תהליכי עבודה אמיתיים" } },
  { value: "556K+", label: { en: "Services analyzed", he: "שירותים שנותחו" }, note: { en: "Operational history", he: "היסטוריה תפעולית" } },
  { value: "40", label: { en: "Months of history", he: "חודשי היסטוריה" }, note: { en: "Longitudinal data", he: "דאטה לאורך זמן" } },
] as const;

export const FINAL_SAAS = {
  period: { value: "11", label: { en: "Months of marketing", he: "חודשי שיווק" } },
  budget: [
    { value: "$18K", label: { en: "Meta advertising", he: "פרסום ב-Meta" }, share: 45 },
    { value: "$15K", label: { en: "Campaign management", he: "ניהול קמפיין" }, share: 37.5 },
    { value: "$7K", label: { en: "Equipment and onboarding", he: "ציוד והטמעה" }, share: 17.5 },
  ],
  funnel: [
    { value: "1,476", label: { en: "Leads", he: "לידים" }, note: "$27 / lead" },
    { value: "301", label: { en: "Trials", he: "ניסיונות" }, note: "20.4%" },
    { value: "96", label: { en: "Customers", he: "לקוחות" }, note: "32% trial conversion" },
  ],
  summary: [
    { value: "$64.7K", label: { en: "Actual 2025 ARR", he: "ARR בפועל בשנת 2025" } },
    { value: "$40K", label: { en: "Total CAC", he: "CAC כולל" } },
    { value: "$185K", label: { en: "Modeled 3-year LTV", he: "LTV מתוכנן ל-3 שנים" } },
    { value: "4.6x", label: { en: "Modeled LTV:CAC", he: "יחס LTV:CAC מתוכנן" } },
  ],
} as const;

export const FINAL_FUNDING = [
  { title: { en: "Complete Salon OS", he: "השלמת Salon OS" }, body: { en: "Finish the connected workflows required for rollout.", he: "השלמת תהליכי העבודה המחוברים שנדרשים להטמעה." } },
  { title: { en: "Accelerate Salon AI", he: "האצת Salon AI" }, body: { en: "Build intelligence and assisted actions on top of the operating layer.", he: "בניית אינטליגנציה ופעולות מסייעות מעל שכבת התפעול." } },
  { title: { en: "Roll out to existing salons", he: "הטמעה בסלונים קיימים" }, body: { en: "Deploy gradually and learn from real daily use.", he: "הטמעה הדרגתית ולמידה משימוש יומיומי אמיתי." } },
  { title: { en: "Customer success", he: "שירות והצלחת לקוחות" }, body: { en: "Improve onboarding, adoption and retention.", he: "שיפור ההטמעה, האימוץ והשימור." } },
  { title: { en: "Go to market", he: "יציאה לשוק" }, body: { en: "Restart acquisition with a broader product and better tools.", he: "חידוש הרכישה עם מוצר רחב יותר וכלים טובים יותר." } },
  { title: { en: "Core team", he: "הצוות המרכזי" }, body: { en: "Give the team the resources required for consistent execution.", he: "מתן המשאבים שנדרשים לביצוע עקבי." } },
] as const;

export const FINAL_CLOSE = {
  eyebrow: { en: "From here", he: "מכאן" },
  title: { en: "We still believe deeply in what we set out to build.", he: "אנחנו עדיין מאמינים בכל ליבנו במה שיצאנו לבנות." },
  body: {
    en: "The road has been longer than we expected, but the vision is clearer and our determination is stronger. We would be glad to host you at our office, show you what the team has built and talk openly about the next stage.",
    he: "הדרך הייתה ארוכה ממה שציפינו, אבל החזון ברור יותר והנחישות שלנו חזקה יותר. נשמח לארח אתכם במשרד, להראות לכם מה הצוות בנה ולדבר בפתיחות על השלב הבא.",
  },
  primary: { en: "Schedule a meeting", he: "תיאום פגישה" },
  whatsapp: { en: "Contact Maor on WhatsApp", he: "יצירת קשר עם מאור ב-WhatsApp" },
  signoff: { en: "With appreciation,", he: "בברכה ובהערכה," },
  names: { en: "Maor Ganon and Elad Gotlieb", he: "מאור גנון ואלעד גוטליב" },
  role: { en: "Co-Founders, Spectra", he: "מייסדים שותפים, Spectra" },
} as const;
