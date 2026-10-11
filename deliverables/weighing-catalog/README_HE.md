# חבילת קטלוג למערכת שקילה

צילום מצב לקריאה, גרסה `2026-09-27.1`, שיוצא ב־`2026-09-27T17:08:03.455Z`.

החבילה נבנתה מקבצי הקטלוג של Spectra. היא לא משנה את מסד המקור, והיא לא מחוברת אליו בזמן ריצה. מערכת השקילה יכולה לטעון את `catalog.json` מקומית.

## מה נכלל

| פריט | כמות |
| --- | ---: |
| מפתחות מותג | 3 |
| סדרות | 17 |
| מוצרים | 1005 |
| קבצי תמונה מעובדים | 3 |
| מוצרים עם תמונה | 210 |
| מתוכם תמונת סדרה | 209 |
| מתוכם תמונת מוצר מדויקת | 1 |
| בלי תמונה | 795 |

שלושת המותגים הם L'Oréal Professionnel, Wella Professionals ו־Schwarzkopf Professional. שוורצקוף קנדה אינו בחבילה.

סוגי המוצר לפי שדה `type` של הקטלוג: 1189 color, 38 developer, 8 bleach, 2 treatment. שתי שורות הטיפול הן Color Worx בתוך Igora Royal, והן נשארו. אין בסדרות שנבחרו שורות straightening.

1021 שורות הן `active` (`flag` 0). 216 שורות הן `barcode_conflict` (`flag` 3). הן לא נמחקו.

כל שורה בסדרה שנבחרה יוצאה. זה כיסוי של הקובץ המקומי. אין השוואה למפת גוונים של היצרן, ולכן אף סדרה לא מסומנת כמלאה מסחרית.

## סדרות

L'Oréal Professionnel, קובץ בלי מדינה:

- MAJIREL, 164
- DIA LIGHT, 83
- DIA LIGHT 60g, 54, סדרת אריזה נפרדת, לא אוחדה
- DIACTIVATOR, 3
- OXYDANT DEVELOPERS, 4

Wella Professionals:

- KOLESTONE, 201. שם התצוגה Koleston Perfect לקוח מהמילון. מחרוזת המקור נשארה KOLESTONE
- COLOR TOUCH, 163
- WELLOXON DEVELOPERS, 6
- COLOR TOUCH DEVELOPERS, 2
- COLOR TOUCH PLUS DEVELOPERS, 1

Schwarzkopf, קובץ בלי מדינה:

- IGORA ROYAL, 166, כולל 2 טיפולים
- IGORA VIBRANCE, 98
- BLONDME, 44, ב־type color
- IGORA ROYAL DEVELOPERS, 4
- IGORA VIBRANCE DEVELOPERS, 3
- BLONDME DEVELOPERS, 4
- BLONDME LIGHTENERS, 5, ב־type bleach

Schwarzkopf Canada אינו בחבילה.

## תמונות

העיבוד לפי `docs/agent-guides/product-image-playbook-tubes-sprays.md` ו־`product-image-playbook-jars-compacts.md`: קנבס 800×800, קנה מידה אחיד, בלי מתיחה, קו בסיס 690 לשפופרות ו־610 לקופסה.

- Majirel, גווני `LEVEL` בלבד: תמונת סדרה של השפופרת הרשמית. אין עליה קוד גוון, ולכן היא לא מסומנת כתמונה מדויקת.
- Dia Light, גווני `LEVEL` בלבד: השפופרת בלבד. הקופסה שלידה נחתכה במקור ולכן לא נשמרה.
- BlondMe Premium Lightener 9+ ב־450 גרם: תמונה מדויקת מנכס Henkel.
- Diactivator: נמצאו תמונות רשמיות, אבל הסרת הרקע חתכה את הכתף הלבנה. הן נדחו ולא שויכו.
- שאר הסדרות, כולל Wella ורוב Schwarzkopf: `missing`. לא הושמה תמונה של גוון אחר.

המקור ב־`assets/originals/`, הקובץ המעובד ב־`assets/processed/`. תצוגה מקדימה: `image-preview.html`.

## קבצים

- `catalog.json` — המותגים, הסדרות והמוצרים
- `mixing-rules.json` — כללים עם מקור ומצב אכיפה
- `asset-manifest.json` — מיפוי שמות תמונה, בלי בתים שהועתקו
- `assets/NO_LOCAL_ASSETS.txt` — הסבר קצר לתיקייה הריקה
- `id-map.json` — `src:{uuid}` אל מזהה המקור
- `catalog.types.ts` ו־`catalog.schema.json` — צורת הרשומה
- `api-contract.yaml` — חוזה **מוצע**. אין שרת
- `api-examples/` — בקשות ותשובות עם מוצרים מהייצוא
- `source-model.md` — מודל המקור
- `data-quality-report.md` — חוסרים וסתירות
- `integration-guide.md` — איך לטעון את הקובץ
- `validation-report.md` — נוצר בבדיקה
- `export-summary.json` — סיכום ספירות לבדיקה
- `scripts/build-export.js` ו־`scripts/validate-export.js` — בנייה מחדש ובדיקה, בלי לכתוב אל קבצי המקור

## מה לא נמצא, ולכן לא הומצא

- יחס ערבוב, כיוון היחס, ויעד חמצן לכמה צבעים
- משפחת גוון טונאלית. `shadeFamilies` ריק בכל המוצרים
- עלות לגרם, מחיר סלון ומלאי סלון
- שוק על השורות שאינן מקובץ קנדה. מטבע ILS אינו הוכחת מדינה
- קובץ תמונה לכל גוון. ראו למטה מה כן כוסה.

עומק גוון מולא רק כש־`familyShade` הוא `LEVEL` ומספר, כולל `LEVEL 0`. קוד `901S` נשאר מחרוזת, בלי עומק מספרי.

## שימוש מקומי

טענו את `catalog.json`. חפשו לפי `shadeCode`, `barcodes` ו־`productLine.source`. אל תגזרו עומק מהספרה הראשונה, ואל תחלקו את `price.amount` במשקל.

פרטי החיבור, כולל המעבר העתידי ל־API, נמצאים ב־`integration-guide.md`.

## החלטות שדורשות תשובה

1. האם שורת `barcode_conflict` מותרת בשקילה.
2. האם צימוד Diactivator ל־Dia Light, שכתוב רק במילון, יהיה חסימה.
3. האם תווית `LEVEL N` היא עומק השקילה, כולל `LEVEL 0` וכולל דלי `LEVEL 10` על קוד `10 1/2.1`.
4. האם `packingWeight` 0 הוא אפס אמיתי או ערך לא ידוע.
5. איך להציג אריזה כשהטקסט אומר `250ml` והעמודה מתועדת כגרמים.
6. האם להוסיף בהמשך את Majirel Funda ואת Galon Developers. הן קיימות במקור ולא נכנסו, כי לא מוזגו אוטומטית.
7. יחסי הערבוב עצמם. אין להם מקור בחבילה הזו.
