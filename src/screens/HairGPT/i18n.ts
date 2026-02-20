export type Lang = "en" | "he";

export interface PromptItem {
  text: string;
}

export interface Translations {
  placeholder: string;
  subtitle: string;
  newChat: string;
  noChats: string;
  backToSite: string;
  enterCode: string;
  wrongCode: string;
  enter: string;
  poweredBy: string;
  prompts: PromptItem[];
  confidence: { high: string; medium: string; low: string };
  analyticsTitle: string;
  analyticsSubtitle: string;
  kpi: { demand: string; margin: string; retention: string; growth: string };
  ticker: string[];
}

export const translations: Record<Lang, Translations> = {
  en: {
    placeholder: "Ask HairGPT anything...",
    subtitle: "AI-powered business advisor for the hair salon industry",
    newChat: "New conversation",
    noChats: "No conversations yet",
    backToSite: "Back to site",
    enterCode: "Enter access code",
    wrongCode: "Wrong code. Try again.",
    enter: "Enter",
    poweredBy: "Powered by Spectra AI",
    prompts: [
      { text: "What are the hottest trends in the market this month?" },
      { text: "Which brands are gaining vs losing in the last 90 days?" },
      { text: "What's the market average for color services vs toning?" },
      { text: "What is the seasonal demand by month?" },
      { text: "What questions should I ask to improve profitability?" },
      { text: "Compare A+ vs B salon types in the market" },
    ],
    confidence: {
      high: "High confidence",
      medium: "Medium confidence",
      low: "Low confidence",
    },
    analyticsTitle: "Market Intelligence",
    analyticsSubtitle: "Real-time salon industry signals",
    kpi: {
      demand: "Demand Index",
      margin: "Avg. Margin",
      retention: "Client Retention",
      growth: "YoY Growth",
    },
    ticker: [
      "Color services demand +12% vs last quarter",
      "Balayage trending #1 in Tel Aviv metro",
      "Premium brand margin at 68% average",
      "Salon retention rates up 4.2% industry-wide",
      "Toning services growing 23% YoY",
      "A+ salons outperform B-tier by 2.4x in revenue",
      "Weekend booking density at 94% capacity",
      "Keratin treatment demand stable at 15% share",
    ],
  },
  he: {
    placeholder: "...שאלו את HairGPT",
    subtitle: "יועץ עסקי AI מומחה לענף המספרות",
    newChat: "שיחה חדשה",
    noChats: "אין שיחות עדיין",
    backToSite: "חזרה לאתר",
    enterCode: "הזינו קוד גישה",
    wrongCode: "קוד שגוי. נסו שנית.",
    enter: "כניסה",
    poweredBy: "Powered by Spectra AI",
    prompts: [
      { text: "מה הטרנדים החמים בשוק הישראלי החודש?" },
      { text: "אילו מותגים מתחזקים ואילו נחלשים ב-90 יום האחרונים?" },
      { text: "מה הממוצע בשוק לשירותי צבע לעומת גוונים?" },
      { text: "מהי עונתיות הביקוש לפי חודשים?" },
      { text: "אילו שאלות כדאי שאשאל כדי לשפר רווחיות?" },
      { text: "השווה את סוגי הסלונים A+ מול B בשוק" },
    ],
    confidence: {
      high: "רמת ביטחון גבוהה",
      medium: "רמת ביטחון בינונית",
      low: "רמת ביטחון נמוכה",
    },
    analyticsTitle: "מודיעין שוק",
    analyticsSubtitle: "סיגנלים בזמן אמת מענף המספרות",
    kpi: {
      demand: "מדד ביקוש",
      margin: "מרווח ממוצע",
      retention: "שימור לקוחות",
      growth: "צמיחה שנתית",
    },
    ticker: [
      "ביקוש לשירותי צבע עלה ב-12% לעומת הרבעון הקודם",
      "בלאיאז׳ מוביל בטרנדים באזור תל אביב",
      "מרווח מותגי פרימיום עומד על 68% בממוצע",
      "שיעור שימור לקוחות עלה ב-4.2% בכל הענף",
      "שירותי טונינג בצמיחה של 23% שנתי",
      "סלונים A+ מניבים פי 2.4 מסלוני B",
      "צפיפות הזמנות בסופ״ש ב-94% תפוסה",
      "ביקוש לטיפולי קרטין יציב ב-15% נתח שוק",
    ],
  },
};
