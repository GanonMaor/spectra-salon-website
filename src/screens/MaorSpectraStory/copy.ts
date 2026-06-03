export interface StoryBlock {
  heading?: string;
  paragraphs: string[];
}

export interface StorySection {
  id: string;
  he: StoryBlock;
  en: StoryBlock;
}

export const intro = {
  he: {
    eyebrow: "ספקטרה סי איי מציגה",
    title: "Salon AI",
    greeting:
      "שלום, שמי מאור ואני רוצה לספר לכם את הסיפור של ספקטרה סי איי.",
  },
  en: {
    eyebrow: "Spectra CI presents",
    title: "Salon AI",
    greeting:
      "Hi, my name is Maor, and I'd like to tell you the story of Spectra CI.",
  },
};

export const sections: StorySection[] = [
  {
    id: "one-problem",
    he: {
      heading: "התחלנו מלפתור בעיה אחת",
      paragraphs: [
        "כשייסדנו את ספקטרה סי איי לא ניסינו לבנות מערכת הפעלה לסלוני יופי.",
        "ניסינו לפתור בעיה אחת.",
        "בכל יום, מיליוני דולרים של צבע וחומרי גלם נזרקים לפח בסלוני יופי ברחבי העולם, בלי מדידה, בלי בקרה ובלי דרך אמיתית להבין מה קורה מאחורי הקלעים.",
        "פיתחנו מערכת Cost Optimization ייחודית שמאפשרת לסלון להבין בדיוק מה נצרך, מה נזרק, מה העלות האמיתית של כל שירות ואיך לנהל מלאי בצורה חכמה יותר.",
        "המערכת לא רק מודדת שימוש בחומרי גלם.",
        "היא גם יודעת לחזות צריכת מלאי ולהפיק הזמנות חכמות לפי ממוצעי שימוש אמיתיים – יכולת שכמעט ולא הייתה קיימת בעולם סלוני היופי.",
        "הפתרון הצליח לעבוד במספר שווקים שונים, ובמיוחד בארצות הברית, שם עשרות סלונים אימצו את המערכת והפכו ללקוחות פעילים ומרוצים.",
      ],
    },
    en: {
      heading: "We started by solving one problem",
      paragraphs: [
        "When we founded Spectra CI, we weren't trying to build an operating system for beauty salons.",
        "We were trying to solve one problem.",
        "Every day, millions of dollars of color and raw materials are thrown away in beauty salons around the world, with no measurement, no control, and no real way to understand what happens behind the scenes.",
        "We built a unique Cost Optimization system that lets a salon understand exactly what is consumed, what is wasted, the true cost of every service, and how to manage inventory more intelligently.",
        "The system doesn't only measure raw-material usage.",
        "It also forecasts inventory consumption and generates smart orders based on real usage averages — a capability that barely existed in the beauty-salon world.",
        "The solution proved itself across several markets, and especially in the United States, where dozens of salons adopted it and became active, satisfied customers.",
      ],
    },
  },
  {
    id: "bigger-opportunity",
    he: {
      heading: "ואז גילינו הזדמנות גדולה יותר",
      paragraphs: [
        "בזמן שעבדנו עם הסלונים גילינו משהו חשוב.",
        "הבעיה האמיתית של בעל הסלון אינה רק ניהול חומרי גלם.",
        "הבעיה היא שהעסק כולו מפוזר בין מערכות שונות.",
        "מערכת אחת לניהול תורים. מערכת אחרת לקופה. מערכת נוספת לשיווק. מערכת נוספת למלאי. ומערכות נוספות לדוחות ולניהול עובדים.",
        "בעל הסלון נאלץ לעבוד עם מספר מערכות שאינן מדברות אחת עם השנייה.",
        "המידע מפוזר. התהליכים נשברים. והיכולת לקבל החלטות נפגעת.",
      ],
    },
    en: {
      heading: "Then we discovered a bigger opportunity",
      paragraphs: [
        "While working with salons, we discovered something important.",
        "The salon owner's real problem isn't only managing raw materials.",
        "The problem is that the entire business is scattered across different systems.",
        "One system for appointments. Another for the point of sale. Another for marketing. Another for inventory. And more systems for reports and staff management.",
        "The salon owner is forced to work with multiple systems that don't talk to one another.",
        "Information is fragmented. Processes break. And the ability to make decisions suffers.",
      ],
    },
  },
  {
    id: "salon-os",
    he: {
      heading: "השלב הבא: מערכת ההפעלה לסלון",
      paragraphs: [
        "הבנו שהדרך לחזון גדול יותר פתוחה בפנינו.",
        "במקום לבנות עוד כלי, החלטנו לבנות את מערכת הניהול השלמה לסלון. SalonOS. פלטפורמת All In One לסלוני יופי.",
        "מערכת אחת שמרכזת: ניהול תורים, קופה ותשלומים, CRM, היסטוריית לקוחות, ניהול עובדים, דוחות עסקיים וניהול מלאי.",
        "היתרון הגדול היה שהמערכת החדשה לא החליפה את מנוע ה-Cost Optimization. היא הרחיבה אותו.",
        "מאחורי הקלעים, באזור שבו חומרי הגלם נצרכים, מנוע ה-Cost Optimization ממשיך לעבוד.",
        "בחזית העסק, מערכת התורים, הקופה וה-CRM מנהלת את הלקוחות, התורים וההכנסות.",
        "לראשונה נוצר לופ מלא של פעילות הסלון. מהזמנת התור, דרך ביצוע השירות, צריכת החומרים, המכירה בקופה, הביקור הבא, ועד הדוחות הפיננסיים של העסק.",
      ],
    },
    en: {
      heading: "The next step: the operating system for the salon",
      paragraphs: [
        "We realized the path to a bigger vision was open to us.",
        "Instead of building yet another tool, we decided to build the complete management system for the salon. SalonOS. An all-in-one platform for beauty salons.",
        "One system that brings together: appointment management, point of sale and payments, CRM, customer history, staff management, business reports, and inventory management.",
        "The big advantage was that the new system didn't replace the Cost Optimization engine. It extended it.",
        "Behind the scenes, where raw materials are consumed, the Cost Optimization engine keeps working.",
        "At the front of the business, the appointments, point of sale, and CRM manage the customers, the bookings, and the revenue.",
        "For the first time, a full loop of salon activity was created. From booking the appointment, through performing the service, material consumption, the sale at the register, the next visit, all the way to the financial reports of the business.",
      ],
    },
  },
  {
    id: "built-intelligence",
    he: {
      heading: "אחרי שבנינו מערכת הפעלה – בנינו אינטליגנציה",
      paragraphs: [
        "אחרי שבנינו את מערכת ההפעלה המלאה לסלון, הבנו שאפשר לקחת את זה צעד נוסף קדימה.",
        "לא רק לנהל את הסלון. אלא לעזור להפעיל אותו.",
        "כך נולד Salon AI.",
      ],
    },
    en: {
      heading: "After building an operating system — we built intelligence",
      paragraphs: [
        "After building the complete operating system for the salon, we realized we could take it one step further.",
        "Not only to manage the salon, but to help run it.",
        "That's how Salon AI was born.",
      ],
    },
  },
  {
    id: "salon-ai-layer",
    he: {
      heading: "Salon AI – שכבת האינטליגנציה של הסלון",
      paragraphs: [
        "Salon AI היא שכבת אינטליגנציה חדשה שפועלת מעל מערכת ההפעלה של הסלון.",
        "במקום שבעלי הסלון והעובדים ירדפו אחרי משימות, המערכת עוזרת להם לקבל החלטות ולבצע פעולות באופן יזום.",
        "בדומה ל-Microsoft Office, ניתן להשתמש בכל רכיב בנפרד או לקבל את כל החבילה כפלטפורמה אחת.",
        "בלב המערכת נמצא Assistant אישי מובנה. מעין Siri של הסלון. נקודת הגישה המרכזית לכל המערכת.",
        "לצידו פועלים ארבעה סוכנים מרכזיים.",
      ],
    },
    en: {
      heading: "Salon AI – the salon's intelligence layer",
      paragraphs: [
        "Salon AI is a new intelligence layer that runs on top of the salon's operating system.",
        "Instead of owners and staff chasing tasks, the system helps them make decisions and take action proactively.",
        "Much like Microsoft Office, you can use each component on its own or take the whole suite as a single platform.",
        "At the heart of the system is a built-in personal assistant. A kind of Siri for the salon. The main access point to the entire system.",
        "Alongside it, four core agents operate.",
      ],
    },
  },
  {
    id: "inventory-agent",
    he: {
      heading: "סוכן המלאי",
      paragraphs: [
        "מוודא שחומרי הגלם הנדרשים לשבוע הקרוב יהיו זמינים במלאי.",
        "מזהה חוסרים לפני שהם קורים. ממליץ על הזמנות. ומבצע אופטימיזציה מתמשכת של רמות המלאי.",
      ],
    },
    en: {
      heading: "The inventory agent",
      paragraphs: [
        "Makes sure the raw materials needed for the coming week are available in stock.",
        "Identifies shortages before they happen, recommends orders, and continuously optimizes inventory levels.",
      ],
    },
  },
  {
    id: "scheduling-agent",
    he: {
      heading: "סוכן ניהול התורים",
      paragraphs: [
        "מבין את המורכבות האמיתית של תורי יופי.",
        "לא כל גוונים דורשים אותו זמן. לא כל לקוחה דורשת אותו תהליך. לא כל עובד מבצע את אותו שירות באותו קצב.",
        "הסוכן יודע להתחשב בפרופיל הטיפולים של כל לקוחה, לבנות יומן יעיל יותר ולצמצם חורים ביומן.",
      ],
    },
    en: {
      heading: "The scheduling agent",
      paragraphs: [
        "Understands the real complexity of beauty appointments.",
        "Not every shade takes the same time. Not every client needs the same process. Not every staff member performs the same service at the same pace.",
        "The agent takes each client's treatment profile into account, builds a more efficient calendar, and reduces gaps in the schedule.",
      ],
    },
  },
  {
    id: "performance-agent",
    he: {
      heading: "סוכן הביצועים",
      paragraphs: [
        "מודד ביצועים. מזהה בזבוזי חומר. משווה בין עובדים. משווה לבנצ'מרקים מהשוק.",
        "ומסייע למנהל להבין היכן ניתן לשפר רווחיות.",
      ],
    },
    en: {
      heading: "The performance agent",
      paragraphs: [
        "Measures performance. Detects material waste. Compares between staff members. Benchmarks against the market.",
        "And helps the manager understand where profitability can be improved.",
      ],
    },
  },
  {
    id: "growth-agent",
    he: {
      heading: "סוכן הצמיחה",
      paragraphs: [
        "עוסק בשימור לקוחות ובהגדלת הכנסות.",
        "מזהה הזדמנויות למכירת מוצרים משלימים. מפעיל קמפיינים חכמים. שולח פושים רלוונטיים.",
        "ומסייע להגדיל את ערך הלקוח לאורך זמן.",
      ],
    },
    en: {
      heading: "The growth agent",
      paragraphs: [
        "Focuses on customer retention and revenue growth.",
        "Spots opportunities to sell complementary products, runs smart campaigns, and sends relevant push notifications.",
        "And helps increase customer lifetime value over time.",
      ],
    },
  },
  {
    id: "communication-platform",
    he: {
      heading: "פלטפורמת התקשורת של הסלון",
      paragraphs: [
        "כל הסוכנים מחוברים לפלטפורמת תקשורת פנימית. סוג של Slack לעולם היופי.",
        "מקום אחד שבו בעלי הסלון, העובדים והלקוחות מתקשרים, משתפים מידע ומבצעים פעולות.",
        "הסוכנים אינם כלי חיצוני. הם חלק אינטגרלי מהעבודה היומיומית.",
      ],
    },
    en: {
      heading: "The salon's communication platform",
      paragraphs: [
        "All the agents are connected to an internal communication platform. A kind of Slack for the beauty world.",
        "One place where owners, staff, and clients communicate, share information, and take action.",
        "The agents aren't an external tool. They're an integral part of the daily work.",
      ],
    },
  },
  {
    id: "data-layer",
    he: {
      heading: "שכבת הדאטה",
      paragraphs: [
        "לאורך השנים, הסלונים שעובדים עם ספקטרה יצרו עבורנו שכבת מידע ייחודית. מידע שלא נאסף בשום מקום אחר בצורה דומה.",
        "המערכת יודעת להבין: אילו מוצרים נצרכים בפועל, אילו צבעים נמצאים בצמיחה או בירידה, דפוסי שימוש לפי אזור גיאוגרפי, רמות בזבוז, מגמות שירותים, דפוסי ביקורים, צריכת מלאי וביצועים תפעוליים.",
        "זהו מידע בעל ערך עצום עבור יצרנים, מפיצים, רשתות וגופי מחקר.",
        "כבר היום קיימת התעניינות מצד שחקנים בתעשייה במידע מסוג זה.",
        "בעתיד, ככל שיותר סלונים יצטרפו לפלטפורמה, ערך שכבת המידע יגדל משמעותית.",
      ],
    },
    en: {
      heading: "The data layer",
      paragraphs: [
        "Over the years, the salons working with Spectra have created a unique data layer for us. Data that isn't collected anywhere else in a comparable way.",
        "The system can understand: which products are actually consumed, which colors are growing or declining, usage patterns by geographic region, waste levels, service trends, visit patterns, inventory consumption, and operational performance.",
        "This is information of enormous value to manufacturers, distributors, chains, and research bodies.",
        "Even today there is interest from industry players in data of this kind.",
        "In the future, as more salons join the platform, the value of the data layer will grow significantly.",
      ],
    },
  },
  {
    id: "network-effect",
    he: {
      heading: "אפקט הרשת",
      paragraphs: [
        "ככל שיותר סלונים משתמשים במערכת: המערכת נהיית חכמה יותר. הסוכנים נהיים מדויקים יותר. הבנצ'מרקים נהיים חזקים יותר. ושכבת המידע הופכת לנכס בעל ערך גבוה יותר עבור כלל התעשייה.",
        "כל לקוח חדש לא רק מגדיל הכנסות. הוא משפר את המוצר עבור כל שאר הלקוחות.",
      ],
    },
    en: {
      heading: "The network effect",
      paragraphs: [
        "The more salons use the system: the smarter the system becomes. The agents grow more accurate. The benchmarks grow stronger. And the data layer becomes a higher-value asset for the entire industry.",
        "Every new customer doesn't just add revenue. They improve the product for every other customer.",
      ],
    },
  },
  {
    id: "business-model",
    he: {
      heading: "האבולוציה של המודל העסקי",
      paragraphs: [
        "שלב 1 – Cost Optimization: הכנסה שנתית ממוצעת של כ-960 דולר לסלון (80 דולר לחודש).",
        "שלב 2 – SalonOS: הכנסה שנתית ממוצעת של כ-1,920 דולר לסלון (160 דולר לחודש).",
        "שלב 3 – Salon AI: הכנסה שנתית ממוצעת של כ-6,000 דולר לסלון (500 דולר לחודש).",
      ],
    },
    en: {
      heading: "The evolution of the business model",
      paragraphs: [
        "Stage 1 – Cost Optimization: average annual revenue of about $960 per salon ($80 per month).",
        "Stage 2 – SalonOS: average annual revenue of about $1,920 per salon ($160 per month).",
        "Stage 3 – Salon AI: average annual revenue of about $6,000 per salon ($500 per month).",
      ],
    },
  },
  {
    id: "additional-revenue",
    he: {
      heading: "מקורות הכנסה נוספים",
      paragraphs: [
        "טוקנים ליכולות AI: לקוחות יוכלו לרכוש חבילות טוקנים לפי שימוש. גם לקוחות שאינם מנויי Salon AI מלאים יוכלו לצרוך יכולות AI נקודתיות. כך נוצר מסלול Upsell טבעי לאורך זמן.",
        "מודיעין שוק ותעשייה: יצרנים, מותגים, מפיצים ורשתות יוכלו לרכוש גישה לשכבות מידע ותובנות שוק. ככל שהרשת תגדל, ערך המידע יגדל יחד איתה.",
      ],
    },
    en: {
      heading: "Additional revenue streams",
      paragraphs: [
        "Tokens for AI capabilities: customers will be able to buy token packages based on usage. Even customers who aren't full Salon AI subscribers will be able to use AI capabilities on demand. This creates a natural upsell path over time.",
        "Market and industry intelligence: manufacturers, brands, distributors, and chains will be able to purchase access to data layers and market insights. As the network grows, the value of the data grows with it.",
      ],
    },
  },
  {
    id: "why-it-matters",
    he: {
      heading: "למה זה חשוב",
      paragraphs: [
        "המעבר מ-Cost Optimization ל-SalonOS ול-Salon AI אינו רק הרחבת מוצר. הוא משנה לחלוטין את הכלכלה של החברה.",
        "הוא מגדיל משמעותית את ההכנסה מכל לקוח. הוא מייצר מקורות הכנסה חדשים. הוא משפר את אחוזי ההמרה של קמפיינים. הוא משפר את יחס ה-LTV/CAC.",
        "הוא מקטין את עלויות התמיכה והתפעול באמצעות אוטומציה ויכולות AI מובנות.",
        "והוא יוצר נכס מידע שהולך ומתחזק ככל שהרשת גדלה.",
      ],
    },
    en: {
      heading: "Why it matters",
      paragraphs: [
        "The shift from Cost Optimization to SalonOS to Salon AI isn't just a product expansion. It completely changes the economics of the company.",
        "It significantly increases the revenue from each customer. It creates new revenue streams. It improves campaign conversion rates. It improves the LTV/CAC ratio.",
        "It reduces support and operating costs through automation and built-in AI capabilities.",
        "And it creates a data asset that grows stronger as the network grows.",
      ],
    },
  },
  {
    id: "vision",
    he: {
      heading: "החזון",
      paragraphs: [
        "התחלנו מפתרון אחד לבעיה אחת. משם בנינו מערכת הפעלה מלאה לסלוני יופי. ומעליה בנינו שכבת אינטליגנציה.",
        "אנחנו מאמינים שזהו העתיד של תעשיית היופי.",
        "לא עוד תוכנה שמנהלת סלון. אלא מערכת שמבינה אותו, מסייעת לו לקבל החלטות, ומפעילה חלקים הולכים וגדלים ממנו.",
        "זה החזון של Salon AI. הפלטפורמה הראשונה שנבנתה מהיסוד כדי להפוך סלוני יופי לעסקים מבוססי בינה מלאכותית.",
      ],
    },
    en: {
      heading: "The vision",
      paragraphs: [
        "We started with one solution to one problem. From there we built a complete operating system for beauty salons. And on top of it we built an intelligence layer.",
        "We believe this is the future of the beauty industry.",
        "Not just software that manages a salon, but a system that understands it, helps it make decisions, and runs growing parts of it.",
        "This is the vision of Salon AI. The first platform built from the ground up to turn beauty salons into AI-driven businesses.",
      ],
    },
  },
];
