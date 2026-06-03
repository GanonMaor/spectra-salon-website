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
    eyebrow: "ספקטרה מציגה",
    title: "Salon AI",
    greeting:
      "לפני שאני מספר על ספקטרה, חשוב לי להסביר מאיפה הכול התחיל.",
  },
  en: {
    eyebrow: "Spectra presents",
    title: "Salon AI",
    greeting:
      "Before I tell you about Spectra, I want to explain where it all began.",
  },
};

export const sections: StorySection[] = [
  {
    id: "origin-2009",
    he: {
      heading: "2009 — הסלון הראשון שלי",
      paragraphs: [
        "ב-2009 פתחתי את הסלון הראשון שלי בתל אביב.",
        "באותם ימים לא חשבתי על תוכנה, דאטה או בינה מלאכותית. פשוט רציתי לבנות מספרה מצליחה.",
        "אבל ככל שהעסק גדל, התחלתי להרגיש את אותם כאבים שכל בעל סלון מכיר.",
        "הלקוחות היו מרוצים. העובדים היו עסוקים. היומן היה מלא. אבל מאחורי הקלעים הרגשתי שאני מנהל את העסק כמעט בעיניים עצומות.",
        "לא באמת ידעתי כמה חומר נצרך. לא באמת ידעתי כמה חומר נזרק. לא באמת ידעתי אילו שירותים רווחיים יותר ואילו פחות. לא הייתה לי דרך פשוטה להבין מה באמת קורה בעסק בזמן אמת.",
      ],
    },
    en: {
      heading: "2009 — my first salon",
      paragraphs: [
        "In 2009 I opened my first salon in Tel Aviv.",
        "Back then I wasn't thinking about software, data, or artificial intelligence. I just wanted to build a successful salon.",
        "But as the business grew, I started to feel the same pains every salon owner knows.",
        "The clients were happy. The staff were busy. The calendar was full. But behind the scenes I felt like I was running the business almost with my eyes closed.",
        "I didn't really know how much product was being used. I didn't really know how much was being thrown away. I didn't really know which services were more profitable and which were less. I had no simple way to understand what was actually happening in the business in real time.",
      ],
    },
  },
  {
    id: "systems-gap",
    he: {
      heading: "המערכות שבשוק לא הבינו סלון",
      paragraphs: [
        "ניסיתי להשתמש במערכות שהיו קיימות בשוק. אבל כמעט תמיד הרגשתי שהן נבנו על ידי אנשי תוכנה ולא על ידי אנשים שחיו את עולם הסלונים.",
        "הן ידעו לפתור חלק מהבעיות. אבל אף אחת מהן לא באמת הבינה איך סלון עובד. איך חדר צבע עובד. איך עובדים חושבים. איך לקוחות מתנהגים. ואיך נראה יום אמיתי במספרה.",
        "בסוף מצאתי את עצמי עובד בשביל המערכות במקום שהמערכות יעבדו בשבילי. הרגשתי שיש פער גדול בין מה שסלון באמת צריך לבין מה שהתוכנות בשוק יודעות לתת.",
        "במשך שנים הרעיון הזה ישב לי בראש. האמנתי שאפשר לבנות משהו הרבה יותר טוב. משהו שנבנה מתוך החיים האמיתיים של הסלון. לא מתוך חדר ישיבות. לא מתוך אקסל. אלא מתוך הרצפה של המספרה.",
        "משם למעשה התחיל המסע שהפך בסופו של דבר לספקטרה.",
      ],
    },
    en: {
      heading: "The systems on the market didn't understand a salon",
      paragraphs: [
        "I tried using the systems that existed on the market. But almost always I felt they were built by software people, not by people who had lived the salon world.",
        "They could solve some of the problems. But none of them truly understood how a salon works. How a color room works. How staff think. How clients behave. And what a real day in a salon looks like.",
        "In the end I found myself working for the systems instead of the systems working for me. I felt there was a big gap between what a salon really needs and what the software on the market can give.",
        "For years that idea sat in my head. I believed it was possible to build something much better. Something built out of the real life of the salon. Not out of a boardroom. Not out of a spreadsheet. But out of the salon floor itself.",
        "That, in fact, is where the journey that eventually became Spectra began.",
      ],
    },
  },
  {
    id: "the-vision",
    he: {
      heading: "היי, אני מאור",
      paragraphs: [
        "היי, אני מאור, ואני רוצה לספר לך את הסיפור של ספקטרה.",
        "האמת היא שמיום הראשון לא רצינו לבנות רק כלי אחד לסלוני יופי. החזון שלנו תמיד היה הרבה יותר גדול.",
        "רצינו לבנות פתרון כולל לסלון. מערכת שבאמת מבינה איך סלון עובד ומתנהל, ולא עוד תוכנה שעושה חלק קטן מהעבודה.",
        "אבל הבנו שכדי להגיע לשם אנחנו צריכים להיכנס דרך הדלת הנכונה.",
      ],
    },
    en: {
      heading: "Hi, I'm Maor",
      paragraphs: [
        "Hi, I'm Maor, and I want to tell you the story of Spectra.",
        "The truth is that from day one we didn't want to build just one tool for beauty salons. Our vision was always much bigger.",
        "We wanted to build a complete solution for the salon. A system that truly understands how a salon works and is run, not just another piece of software that does a small part of the job.",
        "But we understood that to get there, we had to come in through the right door.",
      ],
    },
  },
  {
    id: "start-with-color",
    he: {
      heading: "התחלנו מחומרי הגלם והצבע",
      paragraphs: [
        "בחרנו להתחיל עם ניהול חומרי הגלם והצבע. לא רק בגלל שמדובר במיליוני דולרים שמתבזבזים בכל יום בתעשייה, אלא בגלל שזיהינו שזה הבליינד ספוט הכי גדול של הסלון.",
        "זה המקום שבו העבודה האמיתית מתבצעת. זה המקום שבו מתקבלות ההחלטות האמיתיות. וזה המקום שבו נוצרת התמונה האמיתית של העסק בזמן אמת.",
        "במובן מסוים, מערכת ה-Cost Optimization שבנינו הפכה להיות סוג של מצלמה נסתרת על הפעילות של הסלון.",
        "פתאום אפשר לראות כמה חומר באמת נצרך. כמה חומר נזרק. איך עובדים שונים משתמשים במוצרים. מה רמת היעילות של כל עובד. איך מתנהל המלאי. ומה באמת קורה מאחורי הקלעים.",
        "המערכת לא רק מדדה שימוש בחומרי גלם. היא גם ידעה לחזות צריכה עתידית ולהמליץ על הזמנות לפי ממוצעי שימוש אמיתיים. דבר שכמעט ולא היה קיים בעולם הסלונים.",
      ],
    },
    en: {
      heading: "We started with raw materials and color",
      paragraphs: [
        "We chose to start with the management of raw materials and color. Not only because millions of dollars are wasted in the industry every day, but because we recognized that this is the salon's biggest blind spot.",
        "It's the place where the real work happens. It's the place where the real decisions are made. And it's the place where the true picture of the business is formed in real time.",
        "In a way, the Cost Optimization system we built became a kind of hidden camera on the salon's activity.",
        "Suddenly you could see how much product was really being used. How much was thrown away. How different staff use products. The efficiency level of each staff member. How inventory is managed. And what really happens behind the scenes.",
        "The system didn't only measure raw-material usage. It also forecasted future consumption and recommended orders based on real usage averages. Something that barely existed in the salon world.",
      ],
    },
  },
  {
    id: "expanding-markets",
    he: {
      heading: "התרחבנו לעוד שווקים",
      paragraphs: [
        "לאט לאט התחלנו להיכנס לעוד שווקים. לעבוד עם עוד סלונים. קטנים. גדולים. עצמאיים. רשתות. בארצות הברית, קנדה, אירופה ומקומות נוספים.",
      ],
    },
    en: {
      heading: "We expanded into more markets",
      paragraphs: [
        "Slowly we began entering more markets. Working with more salons. Small ones. Large ones. Independents. Chains. In the United States, Canada, Europe, and other places.",
      ],
    },
  },
  {
    id: "color-room",
    he: {
      heading: "חדר הצבע — מבחן ההוכחה שלנו",
      paragraphs: [
        "ואז באיזשהו שלב נפל לנו האסימון. חדר הצבע הוא כנראה המקום הכי כאוטי, מורכב ומבולגן בכל סלון יופי.",
        "זה המקום שבו עובדים תחת לחץ. כמה עובדים במקביל. עם עשרות מוצרים. עשרות פורמולות. לקוחות שמחכות. ומאות החלטות קטנות שמתקבלות במהלך היום.",
        "וברגע שהצלחנו להכניס דווקא לשם מערכת שהיא אינטואיטיבית, ידידותית, מהירה ושאנשים באמת רוצים להשתמש בה, הבנו משהו חשוב.",
        "אם הצלחנו לפתור את החלק הכי מורכב בסלון, אנחנו יכולים לבנות גם את כל השאר.",
        "במובן מסוים, חדר הצבע היה מבחן ההוכחה שלנו. הוא נתן לנו ביטחון שאנחנו מסוגלים לבנות את מערכת החלומות של תעשיית היופי כולה.",
      ],
    },
    en: {
      heading: "The color room — our proof of concept",
      paragraphs: [
        "And then, at some point, it clicked. The color room is probably the most chaotic, complex, and messy place in any beauty salon.",
        "It's the place where people work under pressure. Several staff at once. With dozens of products. Dozens of formulas. Clients waiting. And hundreds of small decisions made throughout the day.",
        "And the moment we managed to bring a system into exactly that place — one that is intuitive, friendly, fast, and that people actually want to use — we understood something important.",
        "If we could solve the most complex part of the salon, we could build everything else too.",
        "In a way, the color room was our proof of concept. It gave us the confidence that we were capable of building the dream system for the entire beauty industry.",
      ],
    },
  },
  {
    id: "fragmented-systems",
    he: {
      heading: "המערכות הקיימות לא בנויות נכון לסלון",
      paragraphs: [
        "וככל שנכנסנו עמוק יותר לתוך התעשייה, קיבלנו חיזוק מאוד משמעותי למה שכבר חשבנו מההתחלה. המערכות הקיימות בשוק פשוט לא בנויות נכון עבור סלוני יופי.",
        "רובן מערכות ותיקות. רובן נבנו בתקופה אחרת. וכמעט כולן מחלקות את העסק לחלקים שלא באמת מחוברים אחד לשני.",
        "יש מערכת לתורים. מערכת לקופה. מערכת ללקוחות. מערכת למלאי. מערכת לשיווק. מערכת לדוחות. ובעל הסלון צריך איכשהו לחבר את כל הפאזל הזה לבד.",
        "המידע מפוזר. התהליכים נשברים. והיכולת לקבל החלטות נפגעת.",
      ],
    },
    en: {
      heading: "The existing systems aren't built right for a salon",
      paragraphs: [
        "And the deeper we went into the industry, the more we received strong reinforcement for what we had thought from the start. The systems on the market simply aren't built right for beauty salons.",
        "Most of them are legacy systems. Most were built in a different era. And almost all of them split the business into parts that aren't really connected to one another.",
        "There's a system for appointments. A system for the register. A system for clients. A system for inventory. A system for marketing. A system for reports. And the salon owner has to somehow connect this whole puzzle alone.",
        "Information is fragmented. Processes break. And the ability to make decisions suffers.",
      ],
    },
  },
  {
    id: "salon-os",
    he: {
      heading: "SalonOS — מערכת ההפעלה של הסלון",
      paragraphs: [
        "בשלב הזה כבר היה ברור לנו שההזדמנות הרבה יותר גדולה מניהול חומרי גלם. הבנו שהגיע הזמן לבנות את מה שתמיד רצינו לבנות. מערכת ההפעלה של הסלון. SalonOS.",
        "מערכת אחת שמרכזת את כל מה שבעל הסלון צריך. ניהול תורים. קופה. תשלומים. CRM. היסטוריית לקוחות. ניהול עובדים. דוחות. ומלאי.",
        "החלק היפה מבחינתנו היה שלא היינו צריכים להתחיל מאפס. מנוע ה-Cost Optimization כבר היה שם. הוא המשיך לעבוד מאחורי הקלעים באזור שבו חומרי הגלם נצרכים. ובחזית העסק מערכת התורים, הקופה והלקוחות מנהלת את כל הפעילות היומיומית.",
        "פתאום נוצר לופ מלא. מהרגע שהלקוחה קובעת תור. דרך הטיפול. דרך צריכת החומרים. דרך המכירה בקופה. ועד הביקור הבא והדוחות העסקיים. הכול מחובר.",
        "אנחנו עדיין לא שם. המערכת נמצאת בשלבי הפיילוט הראשונים שלה. אבל מבחינתי זה השלב הכי חשוב במסע. כי זאת הפעם הראשונה שאנחנו באמת מחברים את כל חלקי הסלון למערכת אחת.",
      ],
    },
    en: {
      heading: "SalonOS — the salon's operating system",
      paragraphs: [
        "At this stage it was already clear to us that the opportunity was far bigger than managing raw materials. We realized it was time to build what we had always wanted to build. The salon's operating system. SalonOS.",
        "One system that brings together everything a salon owner needs. Appointment management. Point of sale. Payments. CRM. Client history. Staff management. Reports. And inventory.",
        "The beautiful part for us was that we didn't have to start from scratch. The Cost Optimization engine was already there. It kept working behind the scenes in the area where raw materials are consumed. And at the front of the business, the appointments, register, and clients run all the day-to-day activity.",
        "Suddenly a full loop was created. From the moment a client books an appointment. Through the service. Through material consumption. Through the sale at the register. All the way to the next visit and the business reports. Everything is connected.",
        "We're not there yet. The system is in its first pilot stages. But to me this is the most important stage in the journey. Because it's the first time we are truly connecting all the parts of the salon into one system.",
      ],
    },
  },
  {
    id: "salon-ai-born",
    he: {
      heading: "מתשתית ל-Salon AI",
      paragraphs: [
        "ואז קרה משהו מעניין. ככל שבנינו את SalonOS הבנו שאנחנו לא באמת בונים תוכנה. אנחנו בונים תשתית.",
        "ובאותו רגע התחלנו לחשוב על השלב הבא. לא רק איך לנהל סלון. אלא איך לעזור להפעיל אותו. וככה נולד Salon AI.",
      ],
    },
    en: {
      heading: "From infrastructure to Salon AI",
      paragraphs: [
        "And then something interesting happened. As we built SalonOS, we realized we weren't really building software. We were building infrastructure.",
        "And at that moment we started thinking about the next stage. Not just how to manage a salon, but how to help run it. And that's how Salon AI was born.",
      ],
    },
  },
  {
    id: "salon-ai-layer",
    he: {
      heading: "Salon AI — שכבת האינטליגנציה",
      paragraphs: [
        "מבחינתי Salon AI הוא לא עוד מוצר. הוא שכבת האינטליגנציה שיושבת מעל כל מה שבנינו.",
        "אם SalonOS יודע לתעד ולנהל את מה שקורה בסלון, Salon AI יודע להבין את מה שקורה ולעזור לקבל החלטות.",
        "במרכז המערכת יש עוזר אישי. סוג של Siri לסלון. ומסביבו מספר סוכנים שכל אחד אחראי על תחום אחר. סוכן מלאי. סוכן תורים. סוכן ביצועים. וסוכן צמיחה ושימור לקוחות.",
        "הרעיון דומה קצת ל-Microsoft Office. אפשר להשתמש בכל אחד מהם בנפרד. ואפשר לקבל את כל החבילה יחד.",
      ],
    },
    en: {
      heading: "Salon AI — the intelligence layer",
      paragraphs: [
        "To me, Salon AI isn't just another product. It's the intelligence layer that sits on top of everything we built.",
        "If SalonOS knows how to record and manage what happens in the salon, Salon AI knows how to understand what's happening and help make decisions.",
        "At the center of the system is a personal assistant. A kind of Siri for the salon. And around it, several agents, each responsible for a different area. An inventory agent. A scheduling agent. A performance agent. And a growth and retention agent.",
        "The idea is a bit like Microsoft Office. You can use each of them on its own. And you can take the whole suite together.",
      ],
    },
  },
  {
    id: "the-data",
    he: {
      heading: "החלק הכי מעניין — הדאטה",
      paragraphs: [
        "אבל מבחינתי כל זה עדיין לא החלק הכי מעניין. החלק הכי מעניין הוא הדאטה.",
        "כי מהרגע הראשון, דרך מערכת ה-Cost Optimization, התחלנו לבנות שכבת מידע שאין כמעט לאף אחד בתעשייה.",
        "אנחנו לא יודעים רק כמה תורים נקבעו. אנחנו יודעים מה באמת קרה בתוך השירות. איזה צבעים נצרכו. איזה מוצרים נמצאים בצמיחה. איזה מוצרים בירידה. מה רמות הבזבוז. איך עובדים מתנהגים. איך נראים דפוסי שימוש במדינות שונות. ואיך בפועל נראית תעשיית היופי בזמן אמת.",
        "ככל שיותר סלונים מצטרפים, שכבת המידע הזאת נהיית עמוקה יותר, מדויקת יותר ובעלת ערך גדול יותר. ליצרנים. למפיצים. לרשתות. ולחברות ענק שרוצות להבין מה באמת קורה בשוק.",
      ],
    },
    en: {
      heading: "The most interesting part — the data",
      paragraphs: [
        "But to me, all of this still isn't the most interesting part. The most interesting part is the data.",
        "Because from the very first moment, through the Cost Optimization system, we began building a data layer that almost no one in the industry has.",
        "We don't just know how many appointments were booked. We know what really happened inside the service. Which colors were used. Which products are growing. Which products are declining. What the waste levels are. How staff behave. What usage patterns look like across different countries. And what the beauty industry actually looks like in real time.",
        "The more salons join, the deeper, more accurate, and more valuable this data layer becomes. To manufacturers. To distributors. To chains. And to the giant companies that want to understand what's really happening in the market.",
      ],
    },
  },
  {
    id: "economics",
    he: {
      heading: "איך זה משנה את הכלכלה של העסק",
      paragraphs: [
        "ובסוף כל זה גם משנה לגמרי את הכלכלה של העסק. היום אנחנו מוכרים בעיקר את פתרון ה-Cost Optimization. זה מוצר שמייצר לנו בערך 960 דולר בשנה לסלון בממוצע.",
        "השלב הבא הוא SalonOS. מערכת ה-All In One שלנו. היא צפויה להכפיל את ההכנסה השנתית הממוצעת לכ-1,920 דולר בשנה לסלון. אבל יותר חשוב מזה, היא מחברת את כל פעילות העסק למקום אחד ויוצרת בסיס הרבה יותר חזק לשלב הבא.",
        "והשלב הבא הוא Salon AI. ושם המשחק כבר משתנה לחלוטין. כי בשלב הזה אנחנו לא מוכרים רק מערכת ניהול. אנחנו מוכרים יכולות. אוטומציה. קבלת החלטות. ביצועים. צמיחה. ושכבת אינטליגנציה שפועלת עבור העסק.",
        "במודל הזה ההכנסה השנתית מסלון יכולה להגיע לאזור של כ-6,000 דולר בשנה ואף יותר, בהתאם לחבילות וליכולות שהלקוח בוחר לצרוך.",
        "מעל זה מתווסף מודל הטוקנים. לקוחות יוכלו לרכוש יכולות AI נוספות לפי שימוש. גם אם הם לא מנויי Salon AI מלאים. כך שנוצר מסלול צמיחה נוסף בתוך בסיס הלקוחות הקיים.",
      ],
    },
    en: {
      heading: "How this changes the economics of the business",
      paragraphs: [
        "And in the end, all of this also completely changes the economics of the business. Today we mainly sell the Cost Optimization solution. It's a product that generates about $960 per year per salon on average.",
        "The next stage is SalonOS. Our all-in-one system. It's expected to double the average annual revenue to about $1,920 per year per salon. But more importantly, it connects all of the business's activity into one place and creates a far stronger foundation for the next stage.",
        "And the next stage is Salon AI. And there the game changes completely. Because at this stage we're not just selling a management system. We're selling capabilities. Automation. Decision-making. Performance. Growth. And an intelligence layer that works on behalf of the business.",
        "In this model, the annual revenue from a salon can reach the range of about $6,000 per year and even more, depending on the packages and capabilities the customer chooses to use.",
        "On top of that comes the token model. Customers will be able to purchase additional AI capabilities based on usage. Even if they aren't full Salon AI subscribers. This creates another growth path within the existing customer base.",
      ],
    },
  },
  {
    id: "data-value",
    he: {
      heading: "הפוטנציאל הגדול ביותר — שכבת הדאטה",
      paragraphs: [
        "אבל מבחינתי הפוטנציאל הגדול ביותר נמצא בשכבת הדאטה. ככל שיותר סלונים עובדים על הפלטפורמה, אנחנו צוברים מידע ייחודי שלא קיים כיום כמעט בשום מקום אחר.",
        "לא מידע מסקרים. לא הערכות. אלא מידע אמיתי שמגיע מהפעילות היומיומית של הסלון.",
        "איזה מוצרים באמת נצרכים. איזה גוונים נמצאים בצמיחה. אילו מותגים מתחזקים או נחלשים. איך משתנים דפוסי השימוש בין מדינות ואזורים. ומה באמת קורה בשוק בזמן אמת.",
        "המידע הזה יכול להיות בעל ערך עצום עבור יצרנים, מפיצים, רשתות וגורמים נוספים בתעשייה. וככל שהרשת שלנו גדלה, כך גם הערך של שכבת המידע גדל.",
        "בטווח הארוך אני מאמין שחלק מהשחקנים הגדולים בתעשייה יהיו מוכנים לשלם עשרות אלפי דולרים בשנה עבור גישה לתובנות מהסוג הזה, פשוט כי כיום אין להם דרך אחרת לקבל את המידע הזה בצורה רחבה, עקבית ובזמן אמת.",
      ],
    },
    en: {
      heading: "The biggest potential — the data layer",
      paragraphs: [
        "But to me, the biggest potential lies in the data layer. The more salons work on the platform, the more unique data we accumulate — data that today exists almost nowhere else.",
        "Not survey data. Not estimates. But real data that comes from the day-to-day activity of the salon.",
        "Which products are really consumed. Which shades are growing. Which brands are strengthening or weakening. How usage patterns change between countries and regions. And what's really happening in the market in real time.",
        "This information can be of enormous value to manufacturers, distributors, chains, and other players in the industry. And as our network grows, so does the value of the data layer.",
        "In the long run I believe some of the big players in the industry will be willing to pay tens of thousands of dollars a year for access to insights of this kind, simply because today they have no other way to get this information in a broad, consistent, real-time way.",
      ],
    },
  },
  {
    id: "network-effect",
    he: {
      heading: "אפקט הרשת",
      paragraphs: [
        "וזה מה שאני אוהב במודל הזה. כל סלון חדש שמצטרף לא רק מגדיל את ההכנסות מהמנוי.",
        "הוא גם משפר את איכות ה-AI. הוא גם מחזק את שכבת הדאטה. והוא גם מגדיל את הערך שאנחנו יכולים לייצר לכל שאר השחקנים במערכת האקולוגית של תעשיית היופי.",
      ],
    },
    en: {
      heading: "The network effect",
      paragraphs: [
        "And this is what I love about this model. Every new salon that joins doesn't just increase the subscription revenue.",
        "It also improves the quality of the AI. It also strengthens the data layer. And it also increases the value we can create for all the other players in the beauty industry's ecosystem.",
      ],
    },
  },
  {
    id: "summary",
    he: {
      heading: "לסיכום המסע",
      paragraphs: [
        "ובסוף, אם אני מסכם את כל המסע הזה במשפט אחד, אז מבחינתי לא התחלנו ממערכת לניהול צבע. התחלנו מנקודת המידע הכי חשובה בסלון.",
        "ומשם בנינו בהדרגה את מערכת ההפעלה, את שכבת האינטליגנציה ואת שכבת הדאטה שיכולה להפוך בעתיד לתשתית של תעשיית היופי כולה.",
      ],
    },
    en: {
      heading: "To sum up the journey",
      paragraphs: [
        "And in the end, if I sum up this whole journey in one sentence, then to me we didn't start from a color-management system. We started from the most important data point in the salon.",
        "And from there we gradually built the operating system, the intelligence layer, and the data layer that could one day become the infrastructure of the entire beauty industry.",
      ],
    },
  },
];
