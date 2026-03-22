// Spectra Story Timeline — typed seed data (V1, local only)

/* ── Story Blocks ── */

export type StoryBlockType = "paragraph" | "list" | "heading" | "people";

export interface StoryBlockParagraph {
  type: "paragraph";
  text: string;
}

export interface StoryBlockList {
  type: "list";
  items: string[];
}

export interface StoryBlockHeading {
  type: "heading";
  text: string;
}

export interface StoryBlockPeople {
  type: "people";
  items: string[];
}

export type StoryBlock =
  | StoryBlockParagraph
  | StoryBlockList
  | StoryBlockHeading
  | StoryBlockPeople;

/* ── Person (first-class) ── */

export interface Person {
  name: string;
  role: string;
  avatarSrc?: string;
}

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

export type MilestoneType =
  | "קונספט"
  | "השקעה"
  | "שותפות"
  | "משפטי"
  | "צוות"
  | "פיתוח עסקי";

export interface Milestone {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  milestoneType: MilestoneType;
  people: Person[];
  summaryBullets: string[];
  outcome?: string;
  storyBlocks: StoryBlock[];
  visualArchiveAssets: VisualArchiveAsset[];
  formalDocuments: FormalDocument[];
}

/* ── Seed Data ── */

export const milestones: Milestone[] = [
  {
    id: "first-idea",
    date: "2009–2012",
    title: "הרעיון הראשון",
    subtitle: "בעל סלון בתל אביב מחליט להמציא מכונת ערבוב צבע",
    milestoneType: "קונספט",
    people: [
      { name: "מאור גנון", role: "יוזם · בעל סלון, ת״א" },
      { name: "דוד גנון", role: "עיצוב תעשייתי · סטודנט HIT" },
      { name: "עוזי אזר", role: "פיתוח עסקי · לקוח של מאור" },
      { name: "לוקאס", role: "מומחיות שוק יצרניות צבע" },
    ],
    summaryBullets: [
      "מאור זיהה שצבעניות עובדות ללא תיעוד — כל נוסחה חיה בזיכרון, נאבדת כשהצבענית עוזבת",
      "ביקש מאחיו דוד לצייר סקיצות ראשונות: מיקום שפופרות, מנגנון מינון, שלדה",
      "עוזי אזר הצטרף לצד העסקי; עוזי הביא את לוקאס בשל קשריו עם Wella ו-Keune",
      "שלוש שנות עבודה — פגישות, סקיצות, בחינות. ללא מימון, ללא אב-טיפוס, ללא ישות",
    ],
    outcome: "אפס מימון · אפס אב-טיפוס · ללא חברה רשומה",
    storyBlocks: [
      {
        type: "heading",
        text: "הבעיה שמאור ראה",
      },
      {
        type: "list",
        items: [
          "כל נוסחת צבע חיה בזיכרון של הצבענית או על פתק — אין שום מערכת שמתעדת",
          "כשצבענית עוזבת סלון, כל הידע שלה הולך איתה",
          "מאור ראה שזו בעיה שאף אחד לא פותר, למרות שהיא קיימת בכל סלון",
        ],
      },
    ],
    visualArchiveAssets: [
      {
        id: "first-idea-sketch-placeholder",
        title: "[placeholder] סקיצת מכונת ערבוב — דוד גנון, HIT",
        caption: "הנכס המקורי: סקיצות ביד שצייר דוד גנון ב-HIT — מיקום שפופרות, מנגנון מינון, שלדה. הציורים קיימים פיזית אצל דוד, טרם נסרקו. התמונה המוצגת היא placeholder בלבד.",
        assetType: "sketch",
        src: "/spectra-logo-new.png",
        periodLabel: "שלב קונספט, 2009–2011",
        attribution: "דוד גנון",
        note: "Placeholder — הסקיצות המקוריות קיימות כציורים פיזיים, טרם עברו דיגיטציה לארכיון.",
        visibility: "founders-only",
      },
      {
        id: "first-idea-colorbar-reference",
        title: "[הקשר] בר צבע בסלון — תמונת המחשה",
        caption: "לא תמונה מהסלון של מאור. תמונת הקשר בלבד שמראה סביבת עבודה אופיינית של בר צבע — הסביבה שבה מאור זיהה את הבעיה.",
        assetType: "reference-image",
        src: "/hair_colorist_in_a_color_bar.png",
        periodLabel: "תמונת הקשר (ללא תאריך)",
        note: "תמונת המחשה בלבד. לא פריט היסטורי מ-2009.",
        visibility: "internal",
      },
    ],
    formalDocuments: [
      {
        id: "first-idea-sketches-physical",
        title: "סקיצות מכונה פיזיות — דוד גנון (תקופת HIT)",
        documentType: "ארכיון עיצוב / פיזי",
        summary: "סקיצות עיצוב תעשייתי ביד של קונספט מכונת ערבוב הצבע. מספר דפים המכסים מיקום שפופרות, מכניקת מינון וצורת שלדה. נוצרו בזמן שדוד היה סטודנט ב-HIT, חולון.",
        dateLabel: "2009–2011",
        accessState: "metadata-only",
        visibilityNote: "ציורים פיזיים אצל דוד גנון — טרם נסרקו או עברו דיגיטציה",
      },
    ],
  },
  {
    id: "pause",
    date: "2012–2015",
    title: "תקופת שקט",
    subtitle: "שלוש שנות שקט מוחלט, ואז הודעה קצרה",
    milestoneType: "צוות",
    people: [
      { name: "מאור גנון", role: "שולח את ההודעה" },
      { name: "עוזי אזר", role: "נמען · לא המשיך" },
      { name: "לוקאס", role: "נמען · לא המשיך" },
      { name: "דוד גנון", role: "נמען · לא המשיך בשלב זה" },
    ],
    summaryBullets: [
      "אחרי קפיאה ב-~2012 — כשלוש שנות שקט מוחלט. לא פגישות, לא פיתוח, לא תקשורת",
      "ב-~2015 שלח מאור מייל + וואטסאפ לצוות המקורי",
      "הודיע שהוא ממשיך לבד — כל אחד חופשי להמשיך את הרעיון בעצמו",
    ],
    outcome: "פיצול נקי מההרכב המקורי · עוזי, לוקאס ודוד לא המשיכו",
    storyBlocks: [
      {
        type: "paragraph",
        text: "מאור רצה לסגור את הפרק הקודם באופן ברור לפני שהוא מתחיל מחדש. ההודעה הייתה קצרה ויזומה — לא ניתוק, אלא הסדרה.",
      },
    ],
    visualArchiveAssets: [],
    formalDocuments: [
      {
        id: "pause-message",
        title: "הודעת מייל / וואטסאפ של מאור לצוות המקורי",
        documentType: "התכתבות פרטית",
        summary: "הודעה קצרה שמיידעת את חברי הצוות המקוריים שמאור מתכוון לחדש את המיזם באופן עצמאי, וכל אחד חופשי להמשיך את הרעיון בעצמו.",
        dateLabel: "~2015",
        accessState: "metadata-only",
        visibilityNote: "הודעה פרטית — נרשמת כתיעוד היסטורי של סיום ההרכב המקורי, לא זמינה כמסמך",
      },
    ],
  },
  {
    id: "revival",
    date: "2016",
    title: "חידוש עם השקעת בן אבו",
    subtitle: "12,000 יורו מצרפת, ללא חוזה, ודוד חוזר",
    milestoneType: "השקעה",
    people: [
      { name: "מאור גנון", role: "יוזם החידוש" },
      { name: "מיכאל בן אבו", role: "משקיע · צרפת" },
      { name: "דבורה בן אבו", role: "משקיעה · צרפת" },
      { name: "דוד גנון", role: "חוזר לעבודה" },
    ],
    summaryBullets: [
      "מאור פנה למיכאל ודבורה בן אבו (צרפת) והציג להם את הרעיון",
      "12,000 יורו הועברו ללא חוזה השקעה — על בסיס אמון אישי בלבד",
      "מאור ביקש מדוד לחזור; דוד הסכים",
    ],
    outcome: "12,000 יורו בקופה · ללא הסכם חתום · הרכב חדש: מאור + דוד",
    storyBlocks: [
      {
        type: "paragraph",
        text: "בני משפחת בן אבו האמינו ברעיון ובמאור אישית. מאור היה צריך הון התחלתי כדי לחזור לעבודה. דוד היה היחיד עם ניסיון בעיצוב המוצר מהסבב הקודם.",
      },
    ],
    visualArchiveAssets: [
      {
        id: "revival-design-placeholder",
        title: "[placeholder] עבודת עיצוב — תקופת חידוש 2016",
        caption: "הנכס המקורי: סקיצות או הערות עיצוב שדוד יצר אחרי שחזר למיזם. לא אומת אם נוצרו ציורים חדשים או שדוד המשיך מסקיצות HIT. התמונה המוצגת היא placeholder.",
        assetType: "drawing",
        src: "/spectra-logo-new.png",
        periodLabel: "תקופת חידוש, 2016",
        note: "Placeholder — אין נכס ויזואלי מאומת מתקופה זו. מקום שמור.",
        visibility: "founders-only",
      },
    ],
    formalDocuments: [
      {
        id: "revival-ben-abu-investment",
        title: "השקעת בן אבו — 12,000 יורו (לא פורמלית)",
        documentType: "רשומה פיננסית",
        summary: "מיכאל ודבורה בן אבו השקיעו 12,000 יורו לצורך חידוש המיזם. לא נחתם חוזה או הסכם השקעה. ההעברה התבצעה על בסיס אמון אישי.",
        dateLabel: "2016",
        accessState: "metadata-only",
        visibilityNote: "אין הסכם כתוב — רשומה זו מתעדת את ההשקעה לציר הזמן ההיסטורי בלבד",
      },
    ],
  },
  {
    id: "elad-joins",
    date: "~2018",
    title: "הצטרפות אלעד גוטליב",
    subtitle: "פגישה בבית הכנסת מובילה לשותפות שלישית",
    milestoneType: "שותפות",
    people: [
      { name: "מאור גנון", role: "מייסד" },
      { name: "דוד גנון", role: "עיצוב" },
      { name: "אלעד גוטליב", role: "משקיע ושותף עסקי נכנס" },
    ],
    summaryBullets: [
      "מאור פגש את אלעד גוטליב בבית הכנסת — סיפר לו על פרויקט המכונה",
      "אלעד נכנס כמשקיע קטן ושותף עסקי",
      "חלוקת בעלות בעל-פה: 40% מאור · 30% דוד · 30% אלעד",
    ],
    outcome: "שלישייה מייסדת · הסכם בעל-פה בלבד, ללא מסמך חתום",
    storyBlocks: [
      {
        type: "paragraph",
        text: "מאור ודוד עבדו לבד מ-2016 ללא התקדמות מוחשית — צריך שותף שלישי עם הון וקשרים. אלעד הביא השקעה כספית קטנה וגישה לקבלנים (שהובילה בהמשך ל-IndieDev).",
      },
    ],
    visualArchiveAssets: [],
    formalDocuments: [
      {
        id: "elad-ownership-verbal",
        title: "הסכם בעלות בעל-פה — מאור, דוד, אלעד (40/30/30)",
        documentType: "ממשל תאגידי (לא פורמלי)",
        summary: "הסכם בעל-פה על חלוקת בעלות: 40% מאור, 30% דוד, 30% אלעד. לא נחתם מסמך בשלב זה. ההסכם עוגן מאוחר יותר בהתאגדות Color Master.",
        dateLabel: "~2018",
        accessState: "metadata-only",
        visibilityNote: "הסכם בעל-פה — אין מסמך כתוב. נרשם כאן לתיעוד היסטוריית הבעלות.",
      },
    ],
  },
  {
    id: "indiedev-phase",
    date: "2018–2019",
    title: "שלב IndieDev",
    subtitle: "גיא זקס, אלירן בינמן, 40,000 ש״ח, ועורך דין בשם נמרוד",
    milestoneType: "פיתוח עסקי",
    people: [
      { name: "מאור גנון", role: "מייסד" },
      { name: "דוד גנון", role: "עיצוב" },
      { name: "אלעד גוטליב", role: "שותף · חיבר את IndieDev" },
      { name: "גיא זקס", role: "IndieDev · פיתוח עסקי" },
      { name: "אלירן בינמן", role: "IndieDev · פיתוח עסקי" },
      { name: "נמרוד וורמן", role: "עורך דין · הגיע דרך IndieDev" },
    ],
    summaryBullets: [
      "אלעד חיבר את הצוות עם IndieDev — גיא זקס ואלירן בינמן",
      "~40,000 ש״ח לפיתוח עסקי: מאור + דוד שילמו חצי, אלעד שילם חצי",
      "דרך IndieDev הוכר עו״ד נמרוד וורמן",
      "נמרוד בחן את המצב: כסף הושקע, קבלנים עבדו, ואין שום מסמך",
    ],
    outcome: "נמרוד קבע: חייבים הסכם מייסדים — ביקורת משפטית ראשונה",
    storyBlocks: [
      {
        type: "paragraph",
        text: "שלוש שנים של עבודה ללא מסגרת משפטית — כסף כבר הושקע וקבלנים כבר עבדו. נמרוד זיהה חשיפה: הסכמים בעל-פה, השקעות ללא חוזה, קבלנים ללא הגדרת זכויות.",
      },
    ],
    visualArchiveAssets: [
      {
        id: "indiedev-wireframe-placeholder",
        title: "[placeholder] הדמיות מוצר — תקופת IndieDev",
        caption: "הנכס המקורי: wireframes או mockups מתקופת IndieDev. העבודה התמקדה בפיתוח עסקי ולא בעיצוב מוצר — לא ברור אם נוצרו פריטים ויזואליים כלל. התמונה המוצגת היא placeholder.",
        assetType: "render",
        src: "/spectra-logo-new.png",
        periodLabel: "התקשרות IndieDev, ~2018–2019",
        note: "Placeholder — אין ויזואל מוצר מאומת מהשלב הזה. מקום שמור למקרה שיימצא חומר.",
        visibility: "internal",
      },
    ],
    formalDocuments: [
      {
        id: "indiedev-engagement-terms",
        title: "התקשרות IndieDev — ~40,000 ש״ח, גיא זקס ואלירן בינמן",
        documentType: "עסקי / קבלן",
        summary: "התקשרות מקצועית ראשונה בתשלום. ~40,000 ש״ח סה״כ, חולקו שווה: מאור + דוד שילמו חצי, אלעד שילם חצי. תחום העבודה היה פיתוח עסקי ובדיקת היתכנות.",
        dateLabel: "~2018–2019",
        accessState: "metadata-only",
        visibilityNote: "תנאי ההתקשרות מבוססים על עדויות המייסדים — סטטוס חוזה פורמלי לא אומת",
      },
      {
        id: "indiedev-nimrod-introduction",
        title: "כניסת נמרוד וורמן — ייעוץ משפטי",
        documentType: "משפטי",
        summary: "נמרוד וורמן הוצג לצוות דרך IndieDev. אחרי שבחן את המבנה הלא-פורמלי של המיזם, המליץ ליצור הסכם מייסדים כצעד ראשון לקראת עיגון משפטי.",
        dateLabel: "~2019",
        accessState: "metadata-only",
        visibilityNote: "רשומת התקשרות בלבד — לא הופק מסמך מעבר להמלצה עצמה",
      },
    ],
  },
  {
    id: "frank-joins",
    date: "~2019",
    title: "הצטרפות פרנק אבו",
    subtitle: "רקע משפטי וקשרים משפחתיים למשקיעים",
    milestoneType: "צוות",
    people: [
      { name: "מאור גנון", role: "מייסד" },
      { name: "פרנק אבו", role: "לומד משפטים · קשרים משפחתיים למשקיעים" },
    ],
    summaryBullets: [
      "מאור צירף את פרנק אבו — לומד משפטים, קשרים משפחתיים למשקיעים ולחברות רלוונטיות",
      "הצוות ניסה לגייס השקעה חיצונית — פגישות, הצגות, חיפוש מממן",
    ],
    outcome: "אפס השקעות חדשות בתקופה זו",
    storyBlocks: [
      {
        type: "paragraph",
        text: "לצוות לא הייתה גישה ישירה למשקיעים — פרנק הביא רשת קשרים שלא הייתה קיימת. רקע לימודי משפטים היה רלוונטי למו״מ ולתהליכי due diligence מול משקיעים.",
      },
    ],
    visualArchiveAssets: [],
    formalDocuments: [
      {
        id: "frank-team-record",
        title: "פרנק אבו — רשומת כניסה לצוות",
        documentType: "הרכב צוות",
        summary: "פרנק אבו הצטרף למיזם בזכות רקע לימודי משפטים וקשרים משפחתיים למשקיעים. תפקידו לא עוגן רשמית עד להתאגדות Color Master, שם קיבל 1,099 מניות.",
        dateLabel: "~2019",
        accessState: "metadata-only",
        visibilityNote: "אין מסמך נפרד — תפקיד פרנק נרשם מאוחר יותר בטבלת המניות של ההתאגדות",
      },
    ],
  },
  {
    id: "color-master-incorporation",
    date: "2019–2020",
    title: "התאגדות Color Master",
    subtitle: "נמרוד וורמן מכין את הישות המשפטית הראשונה — 105,495 מניות לשבעה אנשים",
    milestoneType: "משפטי",
    people: [
      { name: "נמרוד וורמן", role: "עורך דין · הכין את מסמכי ההתאגדות" },
      { name: "מאור גנון", role: "40,000 מניות" },
      { name: "אלעד גוטליב", role: "30,000 מניות" },
      { name: "דוד גנון", role: "30,000 מניות" },
      { name: "מיכאל אבו", role: "2,198 מניות" },
      { name: "פרנק אבו", role: "1,099 מניות" },
      { name: "גיא זקס", role: "1,099 מניות" },
      { name: "אלירן בינמן", role: "1,099 מניות" },
    ],
    summaryBullets: [
      "נמרוד וורמן הכין מסמך התאגדות רשמי — החברה נרשמה כ-Color Master",
      "הוקצו 105,495 מניות בין 7 בעלי מניות",
      "40,000 מאור · 30,000 אלעד · 30,000 דוד · 2,198 מיכאל אבו · 1,099 × 3 לפרנק, גיא, אלירן",
    ],
    outcome: "ישות משפטית ראשונה · עשור אחרי הרעיון הראשון · עדיין ללא מוצר",
    storyBlocks: [
      {
        type: "paragraph",
        text: "אחרי כעשור של שיחות, סקיצות, הפסקות והסכמים לא-פורמליים — יש ישות משפטית רשומה עם מבנה בעלות מוגדר. אבל ל-Color Master אין מוצר, אין הכנסות ואין עובדים.",
      },
    ],
    visualArchiveAssets: [
      {
        id: "color-master-doc-placeholder",
        title: "[placeholder] סריקת מסמך התאגדות — Color Master",
        caption: "הנכס המקורי: מסמך התאגדות רשמי שהוכן ע״י נמרוד וורמן. המסמך מגדיר ישות משפטית + חלוקת 105,495 מניות בין 7 בעלי מניות. טרם נסרק. התמונה המוצגת היא placeholder.",
        assetType: "scan",
        src: "/spectra-logo-new.png",
        periodLabel: "התאגדות, ~2019–2020",
        attribution: "הוכן ע״י נמרוד וורמן",
        note: "Placeholder — מסמך ההתאגדות המקורי טרם נסרק לארכיון הדיגיטלי.",
        visibility: "founders-only",
      },
      {
        id: "color-master-share-diagram-placeholder",
        title: "[placeholder] דיאגרמת חלוקת מניות — Color Master",
        caption: "הנכס המקורי: דיאגרמה או טבלה של חלוקת 105,495 מניות. ליצירה מנתוני ההתאגדות — טרם עוצב. התמונה המוצגת היא placeholder.",
        assetType: "diagram",
        src: "/spectra-logo-new.png",
        periodLabel: "התאגדות, ~2019–2020",
        note: "Placeholder — דיאגרמה ליצירה מתוך נתוני המניות במסמך ההתאגדות.",
        visibility: "internal",
      },
    ],
    formalDocuments: [
      {
        id: "color-master-incorporation-doc",
        title: "Color Master בע״מ — מסמך התאגדות",
        documentType: "משפטי / הקמת חברה",
        summary: "התאגדות חברה רשמית שהוכנה ע״י עו״ד נמרוד וורמן. נרשמה כ-Color Master. מגדיר 105,495 מניות סה״כ המחולקות בין שבעה בעלי מניות.",
        dateLabel: "~2019–2020",
        accessState: "restricted",
        visibilityNote: "מסמך משפטי אצל נמרוד וורמן — גישה מוגבלת למייסדים וליועץ משפטי",
      },
      {
        id: "color-master-share-allocation",
        title: "Color Master — רשומת חלוקת מניות",
        documentType: "ממשל תאגידי / הון",
        summary: "מאור: 40,000 מניות. אלעד: 30,000. דוד: 30,000. מיכאל אבו: 2,198. פרנק אבו: 1,099. גיא זקס: 1,099. אלירן בינמן: 1,099. סה״כ: 105,495.",
        dateLabel: "~2019–2020",
        accessState: "available-soon",
        visibilityNote: "טבלת מניות להפקה ממסמך ההתאגדות ולעיצוג לשימוש פנימי",
      },
    ],
  },
];
