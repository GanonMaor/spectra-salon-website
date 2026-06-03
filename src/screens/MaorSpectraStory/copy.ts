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
      heading: "הכול התחיל בסלון",
      paragraphs: [
        "ב-2009 פתחתי את הסלון הראשון שלי בתל אביב.",
        "באותם ימים לא חשבתי על תוכנה, דאטה או בינה מלאכותית. פשוט רציתי לבנות מספרה מצליחה.",
        "אבל ככל שהעסק גדל, התחלתי להרגיש את אותם כאבים שכל בעל סלון מכיר.",
        "הלקוחות היו מרוצים. העובדים היו עסוקים. היומן היה מלא. אבל מאחורי הקלעים הרגשתי שאני מנהל את העסק כמעט בעיניים עצומות.",
        "לא באמת ידעתי כמה חומר נצרך. לא באמת ידעתי כמה חומר נזרק. לא באמת ידעתי אילו שירותים רווחיים יותר ואילו פחות. לא הייתה לי דרך פשוטה להבין מה באמת קורה בעסק בזמן אמת.",
      ],
    },
    en: {
      heading: "It all started in the salon",
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
      heading: "פער שראיתי מקרוב",
      paragraphs: [
        "ניסיתי להשתמש במערכות שהיו קיימות בשוק. אבל כמעט תמיד הרגשתי שהן נבנו על ידי אנשי תוכנה ולא על ידי אנשים שחיו את עולם הסלונים.",
        "הן ידעו לפתור חלק מהבעיות. אבל אף אחת מהן לא באמת הבינה איך סלון עובד. איך חדר צבע עובד. איך עובדים חושבים. איך לקוחות מתנהגים. ואיך נראה יום אמיתי במספרה.",
        "בסוף מצאתי את עצמי עובד בשביל המערכות במקום שהמערכות יעבדו בשבילי. הרגשתי שיש פער גדול בין מה שסלון באמת צריך לבין מה שהתוכנות בשוק יודעות לתת.",
        "במשך שנים הרעיון הזה ישב לי בראש. האמנתי שאפשר לבנות משהו הרבה יותר טוב. משהו שנבנה מתוך החיים האמיתיים של הסלון. לא מתוך חדר ישיבות. לא מתוך אקסל. אלא מתוך הרצפה של המספרה.",
        "משם למעשה התחיל המסע שהפך בסופו של דבר לספקטרה.",
      ],
    },
    en: {
      heading: "A gap I saw up close",
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
      heading: "החזון מהיום הראשון",
      paragraphs: [
        "היי, אני מאור, ואני רוצה לספר לך את הסיפור של ספקטרה.",
        "האמת היא שמיום הראשון לא רצינו לבנות רק כלי אחד לסלוני יופי. החזון שלנו תמיד היה הרבה יותר גדול.",
        "רצינו לבנות פתרון כולל לסלון. מערכת שבאמת מבינה איך סלון עובד ומתנהל, ולא עוד תוכנה שעושה חלק קטן מהעבודה.",
        "אבל הבנו שכדי להגיע לשם אנחנו צריכים להיכנס דרך הדלת הנכונה.",
      ],
    },
    en: {
      heading: "The vision from day one",
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
      heading: "הבליינד ספוט של הסלון",
      paragraphs: [
        "בחרנו להתחיל עם ניהול חומרי הגלם והצבע. לא רק בגלל שמדובר במיליוני דולרים שמתבזבזים בכל יום בתעשייה, אלא בגלל שזיהינו שזה הבליינד ספוט הכי גדול של הסלון.",
        "זה המקום שבו העבודה האמיתית מתבצעת. זה המקום שבו מתקבלות ההחלטות האמיתיות. וזה המקום שבו נוצרת התמונה האמיתית של העסק בזמן אמת.",
        "במובן מסוים, מערכת ה-Cost Optimization שבנינו הפכה להיות סוג של מצלמה נסתרת על הפעילות של הסלון.",
        "פתאום אפשר לראות כמה חומר באמת נצרך. כמה חומר נזרק. איך עובדים שונים משתמשים במוצרים. מה רמת היעילות של כל עובד. איך מתנהל המלאי. ומה באמת קורה מאחורי הקלעים.",
        "המערכת לא רק מדדה שימוש בחומרי גלם. היא גם ידעה לחזות צריכה עתידית ולהמליץ על הזמנות לפי ממוצעי שימוש אמיתיים. דבר שכמעט ולא היה קיים בעולם הסלונים.",
      ],
    },
    en: {
      heading: "The salon's blind spot",
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
      heading: "הוכחה בשטח",
      paragraphs: [
        "לאט לאט התחלנו להיכנס לעוד שווקים ולעבוד עם עוד סלונים.",
        "סלונים קטנים וגדולים. עצמאיים ורשתות. בארצות הברית, קנדה, אירופה ומקומות נוספים.",
        "ומה שהיה חשוב לנו לא פחות מהמספרים, היה לראות את האנשים עצמם משתמשים במערכת בתוך יום העבודה האמיתי שלהם.",
        "לקוחות שהתחילו להבין טוב יותר את העסק שלהם. עובדים שהצליחו לעבוד בצורה מסודרת יותר. וסלונים שראו שספקטרה לא רק מודדת את מה שקורה מאחורי הקלעים, אלא באמת עוזרת להם לנהל את זה.",
        "הסרטונים האלה נותנים לכם הצצה לספקטרה בפעולה, בתוך הסלונים שלנו, דרך הלקוחות שכבר משתמשים בה.",
      ],
    },
    en: {
      heading: "Proof in the field",
      paragraphs: [
        "Slowly, we began entering more markets and working with more salons.",
        "Small salons and large ones. Independents and chains. In the United States, Canada, Europe, and other places.",
        "And what mattered to us just as much as the numbers was seeing the people themselves use the system inside their real working day.",
        "Customers who started to understand their business better. Staff who were able to work in a more organized way. And salons that saw Spectra not only measuring what happens behind the scenes, but truly helping them manage it.",
        "These videos give you a glimpse of Spectra in action, inside our salons, through the customers who already use it.",
      ],
    },
  },
  {
    id: "color-room",
    he: {
      heading: "המקום הכי מורכב בסלון",
      paragraphs: [
        "כבר מההתחלה ידענו שהמשימה לא תהיה פשוטה.",
        "חדר הצבע הוא אחד המקומות הכי מורכבים בסלון יופי. זה מקום שעובד תחת לחץ, עם כמה עובדים במקביל, עשרות מוצרים, עשרות פורמולות, לקוחות שמחכות ומאות החלטות קטנות שמתקבלות לאורך היום.",
        "זה לא אזור שקל להכניס אליו טכנולוגיה. כדי שמערכת באמת תצליח שם, היא חייבת להיות אינטואיטיבית, מהירה, ידידותית, ובעיקר כזאת שאנשים באמת רוצים להשתמש בה תוך כדי עבודה.",
        "העובדה שהצלחנו לבנות פתרון שעובד דווקא במקום המורכב הזה נתנה לנו הרבה ביטחון.",
        "היום אנחנו עם הפנים קדימה, ובטוחים אפילו יותר בעצמנו, בצוות וביכולת שלנו לבנות את מערכת החלומות של תעשיית היופי.",
      ],
    },
    en: {
      heading: "The most complex place in the salon",
      paragraphs: [
        "From the beginning, we knew the mission would not be simple.",
        "The color room is one of the most complex places in a beauty salon. It operates under pressure, with several staff working in parallel, dozens of products, dozens of formulas, clients waiting, and hundreds of small decisions made throughout the day.",
        "It is not an easy place to introduce technology. For a system to truly succeed there, it has to be intuitive, fast, friendly, and above all, something people actually want to use while they work.",
        "The fact that we managed to build a solution that works in exactly that complex environment gave us a lot of confidence.",
        "Today we are looking forward, even more confident in ourselves, in the team, and in our ability to build the dream system for the beauty industry.",
      ],
    },
  },
  {
    id: "fragmented-systems",
    he: {
      heading: "עסק מפוצל מדי",
      paragraphs: [
        "וככל שנכנסנו עמוק יותר לתוך התעשייה, קיבלנו חיזוק מאוד משמעותי למה שכבר חשבנו מההתחלה. המערכות הקיימות בשוק פשוט לא בנויות נכון עבור סלוני יופי.",
        "רובן מערכות ותיקות. רובן נבנו בתקופה אחרת. וכמעט כולן מחלקות את העסק לחלקים שלא באמת מחוברים אחד לשני.",
        "יש מערכת לתורים. מערכת לקופה. מערכת ללקוחות. מערכת למלאי. מערכת לשיווק. מערכת לדוחות. ובעל הסלון צריך איכשהו לחבר את כל הפאזל הזה לבד.",
        "המידע מפוזר. התהליכים נשברים. והיכולת לקבל החלטות נפגעת.",
      ],
    },
    en: {
      heading: "A business split into too many pieces",
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
      heading: "השלב הבא",
      paragraphs: [
        "בשלב הזה כבר היה ברור לנו שההזדמנות הרבה יותר גדולה מניהול חומרי גלם. הבנו שהגיע הזמן לבנות את מה שתמיד רצינו לבנות. מערכת ההפעלה של הסלון. SalonOS.",
        "מערכת אחת שמרכזת את כל מה שבעל הסלון צריך. ניהול תורים. קופה. תשלומים. CRM. היסטוריית לקוחות. ניהול עובדים. דוחות. ומלאי.",
        "החלק היפה מבחינתנו היה שלא היינו צריכים להתחיל מאפס. מנוע ה-Cost Optimization כבר היה שם. הוא המשיך לעבוד מאחורי הקלעים באזור שבו חומרי הגלם נצרכים. ובחזית העסק מערכת התורים, הקופה והלקוחות מנהלת את כל הפעילות היומיומית.",
        "פתאום נוצר לופ מלא. מהרגע שהלקוחה קובעת תור. דרך הטיפול. דרך צריכת החומרים. דרך המכירה בקופה. ועד הביקור הבא והדוחות העסקיים. הכול מחובר.",
        "אנחנו עדיין לא שם. המערכת נמצאת בשלבי הפיילוט הראשונים שלה. אבל מבחינתי זה השלב הכי חשוב במסע. כי זאת הפעם הראשונה שאנחנו באמת מחברים את כל חלקי הסלון למערכת אחת.",
      ],
    },
    en: {
      heading: "The next step",
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
      heading: "ידענו מההתחלה שאנחנו בונים תשתית",
      paragraphs: [
        "האמת היא שידענו את זה מראש. כבר כשבנינו את SalonOS היה ברור לנו שאנחנו לא בונים רק עוד תוכנה — אנחנו בונים תשתית.",
        "אבל רק עכשיו, כשראינו שזה באמת עובד בשטח, אנחנו מרגישים שזה הזמן הנכון לצאת איתו לשוק ולכוון גבוה יותר. בעולם שמשתנה ומתקדם במהירות, צריך לנצל את המומנטום הזה.",
        "ובאותו רגע התחלנו לחשוב על השלב הבא. לא רק איך לנהל סלון. אלא איך לעזור להפעיל אותו. וככה נולד Salon AI.",
      ],
    },
    en: {
      heading: "We knew from the start we were building infrastructure",
      paragraphs: [
        "The truth is, we knew it all along. Even as we built SalonOS, it was clear to us that we weren't building just another piece of software — we were building infrastructure.",
        "But only now, having seen that it truly works in the field, do we feel it's the right time to take it to market and aim higher. In a world that keeps changing and advancing so fast, you have to seize that momentum.",
        "And at that moment we started thinking about the next stage. Not just how to manage a salon, but how to help run it. And that's how Salon AI was born.",
      ],
    },
  },
  {
    id: "salon-ai-layer",
    he: {
      heading: "AI אמיתי — שכבה מעל כל מה שבנינו",
      paragraphs: [
        "מבחינתי Salon AI הוא לא עוד מוצר. הוא שכבת האינטליגנציה שיושבת מעל כל מה שבנינו.",
        "אם SalonOS יודע לתעד ולנהל את מה שקורה בסלון, Salon AI יודע להבין את מה שקורה ולעזור לקבל החלטות.",
        "במרכז המערכת יש עוזר אישי. סוג של Siri לסלון. ומסביבו מספר סוכנים שכל אחד אחראי על תחום אחר. סוכן מלאי. סוכן תורים. סוכן ביצועים. וסוכן צמיחה ושימור לקוחות.",
        "הרעיון דומה קצת ל-Microsoft Office. אפשר להשתמש בכל אחד מהם בנפרד. ואפשר לקבל את כל החבילה יחד.",
      ],
    },
    en: {
      heading: "Real AI — a layer above everything we built",
      paragraphs: [
        "To me, Salon AI isn't just another product. It's the intelligence layer that sits on top of everything we built.",
        "If SalonOS knows how to record and manage what happens in the salon, Salon AI knows how to understand what's happening and help make decisions.",
        "At the center of the system is a personal assistant. A kind of Siri for the salon. And around it, several agents, each responsible for a different area. An inventory agent. A scheduling agent. A performance agent. And a growth and retention agent.",
        "The idea is a bit like Microsoft Office. You can use each of them on its own. And you can take the whole suite together.",
      ],
    },
  },
  {
    id: "economics",
    he: {
      heading: "מודל עסקי חזק יותר",
      paragraphs: [
        "ובסוף כל זה גם משנה לגמרי את הכלכלה של ספקטרה עצמה. כל שלב מחזק את העסק שלנו וסולל את הדרך לשלב הבא. היום אנחנו מוכרים בעיקר את פתרון ה-Cost Optimization — מוצר שמייצר לנו בערך 960 דולר בשנה לסלון בממוצע.",
        "השלב הבא הוא SalonOS. מערכת ה-All In One שלנו. היא צפויה להכפיל את ההכנסה השנתית הממוצעת לכ-1,920 דולר בשנה לסלון. אבל יותר חשוב מזה, היא מחברת את כל פעילות העסק למקום אחד ויוצרת בסיס הרבה יותר חזק לשלב הבא.",
        "והשלב הבא הוא Salon AI. ושם המשחק כבר משתנה לחלוטין. כי בשלב הזה אנחנו לא מוכרים רק מערכת ניהול. אנחנו מוכרים יכולות. אוטומציה. קבלת החלטות. ביצועים. צמיחה. ושכבת אינטליגנציה שפועלת עבור העסק.",
        "במודל הזה ההכנסה השנתית מסלון יכולה להגיע לאזור של כ-6,000 דולר בשנה ואף יותר, בהתאם לחבילות וליכולות שהלקוח בוחר לצרוך.",
        "מעל זה מתווסף מודל הטוקנים. לקוחות יוכלו לרכוש יכולות AI נוספות לפי שימוש. גם אם הם לא מנויי Salon AI מלאים. כך שנוצר מסלול צמיחה נוסף בתוך בסיס הלקוחות הקיים.",
      ],
    },
    en: {
      heading: "A stronger business model",
      paragraphs: [
        "And in the end, all of this also completely transforms the economics of Spectra itself. Each stage strengthens our business and paves the way to the next. Today we mainly sell the Cost Optimization solution — a product that generates about $960 per year per salon on average.",
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
      heading: "מידע אמיתי מהשטח",
      paragraphs: [
        "אבל מבחינתי הפוטנציאל הגדול ביותר נמצא בשכבת הדאטה. כבר מהרגע הראשון, דרך מערכת ה-Cost Optimization, התחלנו לבנות שכבת מידע שכמעט אין כמותה בתעשייה. וככל שיותר סלונים עובדים על הפלטפורמה, המידע הזה נהיה ייחודי עוד יותר.",
        "לא מידע מסקרים. לא הערכות. אלא מידע אמיתי שמגיע מהפעילות היומיומית של הסלון.",
        "אנחנו לא יודעים רק כמה תורים נקבעו. אנחנו יודעים מה באמת קרה בתוך השירות. איזה מוצרים נצרכים. איזה גוונים בצמיחה. אילו מותגים מתחזקים או נחלשים. מה רמות הבזבוז. איך עובדים מתנהגים. ואיך משתנים דפוסי השימוש בין מדינות ואזורים בזמן אמת.",
        "המידע הזה יכול להיות בעל ערך עצום עבור יצרנים, מפיצים, רשתות וגורמים נוספים בתעשייה. וככל שהרשת שלנו גדלה, כך גם הערך של שכבת המידע גדל.",
        "בטווח הארוך אני מאמין שחלק מהשחקנים הגדולים בתעשייה יהיו מוכנים לשלם עשרות אלפי דולרים בשנה עבור גישה לתובנות מהסוג הזה, פשוט כי כיום אין להם דרך אחרת לקבל את המידע הזה בצורה רחבה, עקבית ובזמן אמת.",
      ],
    },
    en: {
      heading: "Real information from the field",
      paragraphs: [
        "But to me, the biggest potential lies in the data layer. From the very first moment, through the Cost Optimization system, we began building a data layer that almost no one in the industry has. And the more salons work on the platform, the more unique that data becomes.",
        "Not survey data. Not estimates. But real data that comes from the day-to-day activity of the salon.",
        "We don't just know how many appointments were booked. We know what really happened inside the service. Which products are consumed. Which shades are growing. Which brands are strengthening or weakening. What the waste levels are. How staff behave. And how usage patterns change between countries and regions in real time.",
        "This information can be of enormous value to manufacturers, distributors, chains, and other players in the industry. And as our network grows, so does the value of the data layer.",
        "In the long run I believe some of the big players in the industry will be willing to pay tens of thousands of dollars a year for access to insights of this kind, simply because today they have no other way to get this information in a broad, consistent, real-time way.",
      ],
    },
  },
  {
    id: "network-effect",
    he: {
      heading: "כל סלון מחזק את המערכת",
      paragraphs: [
        "וזה מה שאני אוהב במודל הזה. כל סלון חדש שמצטרף לא רק מגדיל את ההכנסות מהמנוי.",
        "הוא גם משפר את איכות ה-AI. הוא גם מחזק את שכבת הדאטה. והוא גם מגדיל את הערך שאנחנו יכולים לייצר לכל שאר השחקנים במערכת האקולוגית של תעשיית היופי.",
      ],
    },
    en: {
      heading: "Every salon strengthens the system",
      paragraphs: [
        "And this is what I love about this model. Every new salon that joins doesn't just increase the subscription revenue.",
        "It also improves the quality of the AI. It also strengthens the data layer. And it also increases the value we can create for all the other players in the beauty industry's ecosystem.",
      ],
    },
  },
  {
    id: "summary",
    he: {
      heading: "מה בנינו באמת",
      paragraphs: [
        "ובסוף, אם אני מסכם את כל המסע הזה במשפט אחד, אז מבחינתי לא התחלנו ממערכת לניהול צבע. התחלנו מנקודת המידע הכי חשובה בסלון.",
        "ומשם בנינו בהדרגה את מערכת ההפעלה, את שכבת האינטליגנציה ואת שכבת הדאטה שיכולה להפוך בעתיד לתשתית של תעשיית היופי כולה.",
      ],
    },
    en: {
      heading: "What we really built",
      paragraphs: [
        "And in the end, if I sum up this whole journey in one sentence, then to me we didn't start from a color-management system. We started from the most important data point in the salon.",
        "And from there we gradually built the operating system, the intelligence layer, and the data layer that could one day become the infrastructure of the entire beauty industry.",
      ],
    },
  },
];
