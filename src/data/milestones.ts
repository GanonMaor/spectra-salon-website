// Spectra Story Timeline — typed seed data (V1, local only)

/* ── Visual Archive ── */

export type ArchiveAssetType =
  | "sketch"
  | "drawing"
  | "scan"
  | "render"
  | "reference-image"
  | "diagram";

export type ArchiveVisibility = "internal" | "team-only" | "founders-only";

export interface VisualArchiveAsset {
  id: string;
  title: string;
  caption?: string;
  assetType: ArchiveAssetType;
  src: string;
  thumbnailSrc?: string;
  periodLabel?: string;
  attribution?: string;
  note?: string;
  visibility?: ArchiveVisibility;
}

/* ── Formal Documents ── */

export type DocumentAccessState = "restricted" | "metadata-only" | "available-soon";

export interface FormalDocument {
  id: string;
  title: string;
  documentType: string;
  summary?: string;
  dateLabel: string;
  accessState: DocumentAccessState;
  visibilityNote?: string;
}

/* ── Milestone ── */

export interface Milestone {
  id: string;
  date: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  periodLabel?: string;
  periodYears?: string;
  visualArchiveAssets: VisualArchiveAsset[];
  formalDocuments: FormalDocument[];
}

/* ── Seed Data ── */

export const milestones: Milestone[] = [
  {
    id: "e1",
    date: "2009",
    title: "אירוע 1",
    shortTitle: "מאור גנון מקים מיזם — מכונת ערבוב צבעים",
    subtitle: "מאור גנון מקים מיזם לפיתוח מכונת ערבוב צבעים אוטומטית למספרות",
    periodLabel: "הרעיון המקורי",
    periodYears: "2009–2012",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e2",
    date: "",
    title: "אירוע 2",
    shortTitle: "מאור גנון מצרף את דוד גנון — עיצוב תעשייתי",
    subtitle: "מאור גנון מצרף את דוד גנון אחיו — לדוד גנון היה ניסיון בלימודי עיצוב תעשייתי במכון הטכנולוגי חולון HIT",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e3",
    date: "",
    title: "אירוע 3",
    shortTitle: "מאור גנון מצרף את עוזי עזר — פיתוח עסקי",
    subtitle: "מאור גנון ודוד גנון מצרפים את עוזי עזר — לעוזי עזר היה ניסיון בפיתוח עסקי והבנה בעולם היזמות",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e4",
    date: "",
    title: "אירוע 4",
    shortTitle: "עוזי עזר מצרף את לוקאס — מומחה שוק",
    subtitle: "עוזי עזר מצרף את לוקאס — ללוקאס היה ניסיון והיכרות עם שוק יצרניות הצבע כמו Wella ו־Keune",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e5",
    date: "",
    title: "אירוע 5",
    shortTitle: "המיזם נעצר — ללא מוצר וללא מימון",
    subtitle: "לאחר עבודה של כ־3 שנים, סקיצות רבות וניסיון לרישום פטנט — לא נבנה מוצר ולא גויס מימון",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e6",
    date: "2017",
    title: "אירוע 6",
    shortTitle: "מאור גנון חוזר מצרפת ומחיה את המיזם",
    subtitle: "מאור גנון מחליט להחיות מחדש את המיזם לאחר תקופה של שקט",
    periodLabel: "החייאה מחדש של המיזם",
    periodYears: "2017–2019",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e7",
    date: "2018",
    title: "אירוע 7",
    shortTitle: "מאור גנון מגייס את מיכאל בן אבו ודבורה בן אבו — השקעה ראשונה",
    subtitle: "מאור גנון מגייס השקעה ראשונה ממיכאל ודבורה בן אבו — 12,000 יורו ללא חוזה רשמי, על בסיס אמון אישי",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e8",
    date: "מרץ 2019",
    title: "אירוע 8",
    shortTitle: "דוד גנון חוזר למיזם — שותף טכנולוגי",
    subtitle: "דוד גנון חוזר לעבוד על המיזם לצד מאור גנון",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e9",
    date: "מאי 2019",
    title: "אירוע 9",
    shortTitle: "מאור גנון מצרף את אלעד גוטליב — שותף עסקי",
    subtitle: "מאור גנון פוגש את אלעד גוטליב בבית הכנסת ומספר לו על פרויקט מכונת הצבע",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e10",
    date: "",
    title: "אירוע 10",
    shortTitle: "מאור גנון, דוד גנון ואלעד גוטליב — חלוקת מניות 40/30/30",
    subtitle: "אלעד גוטליב מצטרף למיזם כמשקיע קטן ושותף עסקי",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e11",
    date: "",
    title: "אירוע 11",
    shortTitle: "מאור גנון מצרף את פרנק אבו — ייעוץ משפטי וקשרים",
    subtitle: "מוסכמת חלוקת בעלות בעל-פה — 40% מאור גנון, 30% דוד גנון, 30% אלעד גוטליב",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e12",
    date: "",
    title: "אירוע 12",
    shortTitle: "אלעד גוטליב מביא את IndieDev — פיתוח עסקי",
    subtitle: "אלעד גוטליב מביא את חברת IndieDev — חברה לפיתוח עסקי וייעוץ לסטארטאפים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e13",
    date: "",
    title: "אירוע 13",
    shortTitle: "גיא זקס ואלירן בינמן — מובילים תהליך פיתוח עסקי",
    subtitle: "חברת IndieDev בראשות גיא זקס ואלירן בינמן מובילה תהליך פיתוח עסקי ומביאה תרבות ארגונית למיזם",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e14",
    date: "",
    title: "אירוע 14",
    shortTitle: "נמרוד וורמן מצטרף — עורך דין",
    subtitle: "גיא זקס ואלירן בינמן מצרפים את נמרוד וורמן — עורך דין המתמחה בליווי סטארטאפים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e15",
    date: "",
    title: "אירוע 15",
    shortTitle: "נמרוד וורמן מוביל — סדר משפטי והסכם מייסדים",
    subtitle: "נמרוד וורמן מתחיל לעשות סדר משפטי במיזם וממליץ על עריכת הסכם מייסדים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e16",
    date: "2019",
    title: "אירוע 16",
    shortTitle: "הקמת Color Master — מסמך התאגדות וחלוקת המניות",
    subtitle: "נחתם מסמך התאגדות והחברה מוקמת בשם Color Master עם חלוקת מניות מלאה בין השותפים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e17",
    date: "",
    title: "אירוע 17",
    shortTitle: "מאור מצרף את ג׳ואן בן אמיתי",
    subtitle: "מאור גנון מצרף את ג׳ואן בן אמיתי — על רקע ניסיון קודם במיקרוסופט בתחום אדמיניסטרציה ותרגום מסמכים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e18",
    date: "",
    title: "אירוע 18",
    shortTitle: "פגישות עם משקיעים",
    subtitle: "הצוות נפגש עם משקיעים רבים — רובם טוענים כי צריך להציג מוצר עובד לפני השקעה",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e19",
    date: "",
    title: "אירוע 19",
    shortTitle: "פרנק אבו מצטרף",
    subtitle: "מאור גנון מצרף את פרנק אבו — על רקע לימודי משפטים וקשרים משפחתיים למשקיעים",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e20",
    date: "",
    title: "אירוע 20",
    shortTitle: "ניסיון גיוס ללא הצלחה",
    subtitle: "הצוות מנסה לגייס השקעה חיצונית דרך הקשרים של פרנק אבו — ללא הצלחה",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e21",
    date: "",
    title: "אירוע 21",
    shortTitle: "כיוון חדש — פתרון תוכנה",
    subtitle: "עולה רעיון לפתח את המוצר כפתרון תוכנה במקום מכונה פיזית בלבד",
    periodLabel: "פיבוט ובניית המוצר",
    periodYears: "2020–2021",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e22",
    date: "",
    title: "אירוע 22",
    shortTitle: "בחינת חיבור למשקל חכם",
    subtitle: "נבחנת אפשרות של חיבור למשקל חכם כחלק מהפתרון הטכנולוגי",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e23",
    date: "",
    title: "אירוע 23",
    shortTitle: "נדרש שותף טכנולוגי",
    subtitle: "הצוות מגיע למסקנה שנדרש שותף טכנולוגי בתחום התוכנה כדי להתקדם",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e24",
    date: "",
    title: "אירוע 24",
    shortTitle: "החלטה להחליף שותף טכנולוגי",
    subtitle: "מתקבלת החלטה להחליף את דוד גנון בתפקיד השותף הטכנולוגי בתחום התוכנה",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e25",
    date: "",
    title: "אירוע 25",
    shortTitle: "דוד גנון מוותר על מניות",
    subtitle: "דוד גנון מוותר על חצי מהמניות שלו לטובת הכנסת שותף טכנולוגי חדש",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e26",
    date: "",
    title: "אירוע 26",
    shortTitle: "מאור גנון מצרף את דני מיכאלי — שותף טכנולוגי",
    subtitle: "מאור גנון מצרף את דני מיכאלי — מומחה תוכנה — כשותף טכנולוגי ומעביר אליו את חלק מהמניות",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
  {
    id: "e27",
    date: "",
    title: "אירוע 27",
    shortTitle: "דני מיכאלי בונה — POC ראשון",
    subtitle: "דני מיכאלי בונה POC עובד אשר משמש בסיס להמשך חיפוש השקעה",
    visualArchiveAssets: [],
    formalDocuments: [],
  },
];
