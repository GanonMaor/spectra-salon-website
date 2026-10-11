# דוח איכות נתונים

גרסת קטלוג: `2026-09-27.1`. זמן ייצוא: `2026-09-27T17:08:03.455Z`.

הדוח מתאר את מה שנמצא בקבצי המקור. הוא לא משלים ערכים חסרים.

## כיסוי

- מותגים (מפתחות מקור): 3
- סדרות: 17
- מוצרים: 1005
- תמונות מקומיות שנכללו: 3

שוורצקוף קנדה הוסר מהחבילה הזו ואינו נכלל בספירות. קבצי המקור לא שונו.

כל שורה בסדרה שנבחרה יוצאה. זה כיסוי של הקובץ המקומי, לא אישור שהסדרה המסחרית של היצרן מלאה. לא הושוותה מפת גוונים רשמית.

### לפי סדרה

- L'OREAL PROFESSIONNEL / DIA LIGHT: 83
- L'OREAL PROFESSIONNEL / DIA LIGHT 60g: 54
- L'OREAL PROFESSIONNEL / DIACTIVATOR: 3
- L'OREAL PROFESSIONNEL / MAJIREL: 164
- L'OREAL PROFESSIONNEL / OXYDANT DEVELOPERS: 4
- SCHWARZKOPF / BLONDME: 44
- SCHWARZKOPF / BLONDME DEVELOPERS: 4
- SCHWARZKOPF / BLONDME LIGHTENERS: 5
- SCHWARZKOPF / IGORA ROYAL: 166
- SCHWARZKOPF / IGORA ROYAL DEVELOPERS: 4
- SCHWARZKOPF / IGORA VIBRANCE: 98
- SCHWARZKOPF / IGORA VIBRANCE DEVELOPERS: 3
- WELLA PROFESSIONALS / COLOR TOUCH: 163
- WELLA PROFESSIONALS / COLOR TOUCH DEVELOPERS: 2
- WELLA PROFESSIONALS / COLOR TOUCH PLUS DEVELOPERS: 1
- WELLA PROFESSIONALS / KOLESTONE: 201
- WELLA PROFESSIONALS / WELLOXON DEVELOPERS: 6

### לפי סוג מוצר מהשדה type

- bleach: 8
- color: 1189
- developer: 38
- treatment: 2

### לפי תפקיד שקילה שמופה מה־type

- color: 1189
- developer: 38
- lightener: 8
- treatment: 2

### לפי flag של הקטלוג

- active: 1021
- barcode_conflict: 216

## מה לא מולא

- משפחת גוון טונאלית: 1237 מתוך 1237 מוצרים עם מערך ריק. אין שדה כזה במקור. השדה familyShade הוא תווית קיבוץ, לרוב LEVEL N, ולא משפחה.
- עומק גוון מתווית LEVEL: קיים ב־1003 מוצרים. חסר ב־234. מתוכם LEVEL 0 נשמר כאפס ב־59 מוצרים, לא כערך חסר.
- עומק לא נגזר מהספרה הראשונה של קוד הגוון. קודים כגון 901S ו־904S נשארו מחרוזות, עם shadeLevel ריק כשתווית הקיבוץ אינה LEVEL N.
- חוזק חמצן מפורש במחרוזת הגוון: 38. חמצנים בלי אחוז או Vol מפורשים: 0.
- יחס ערבוב, בסיס חישוב חמצן, ומחיר לגרם: לא קיימים. costPerGram הוא null בכל הרשומות.
- מחיר ומלאי של סלון: לא יוצאו.

## אריזה

היחידה גרם היא מוסכמת הסכמה ב־workbook-builder.js, לא יחידה שכתובה על כל שורה. לא בוצעה המרה ממ״ל.

- packingWeight חסר: 94
- packingWeight שווה 0: 31. האפס נשמר. הוא לא הומר ל־null.
- materialWeight חסר: 0
- מחיר 0: 0

דוגמה לפער יחידות שנשמר ולא הוכרע: Dia Light, גוון `GLOSS CLEAR 250ml`, עם materialWeight 250. הטקסט אומר 250ml והעמודות מתועדות כגרמים. שני הערכים נשמרו בנפרד.

## ברקודים

- מוצרים בלי ברקוד: 91
- מחרוזות ברקוד שלא עברו את בדיקת EAN-13 / EAN-8 / UPC-A של scripts/lib/product-catalog/schema.js: 127. הן נשמרו.
- מחרוזות עם אפס מוביל: 85. האפס נשמר.
- ברקודים שמופיעים על יותר ממוצר אחד בייצוא: 123
- מתוכם התאמות חוצות קבצי מקור: 104. הרשומות לא מוזגו.

## חוזק חמצן מול הקוד הקיים

כשיש אחוז מפורש, `parseDeveloperStrength` מתעלמת מה־Vol המפורש וממלאת `volume` רק אם האחוז נמצא ב־`PERCENT_TO_VOL`. 1.8, 2.7, 4.5 ו־3.75 אינם בטבלה, ולכן הפונקציה מחזירה `volume: null` למרות שהטקסט אומר 6, 9, 15 ו־12.5 Vol. הייצוא שמר את שני המספרים המפורשים, בלי להשלים צד חסר מהטבלה.

פערי פרשנות מול הפונקציה: 4.

- `1.8%   6 Vol.` (src:2b593fb9-12aa-11ed-9cb4-6045bd925463): explicit {"percent":1.8,"volume":6,"volumeUnit":"vol","percentExplicit":true,"volumeExplicit":true,"raw":"1.8%   6 Vol.","inferredCounterpart":false} ; code {"percent":1.8,"volume":null,"strengthKey":"1.8pct","source":"scripts/lib/product-truth/catalog-normalizer.js parseDeveloperStrength"}
- `2.7%   9 Vol.` (src:cd545fe7-010f-11ed-9cb4-6045bd925463): explicit {"percent":2.7,"volume":9,"volumeUnit":"vol","percentExplicit":true,"volumeExplicit":true,"raw":"2.7%   9 Vol.","inferredCounterpart":false} ; code {"percent":2.7,"volume":null,"strengthKey":"2.7pct","source":"scripts/lib/product-truth/catalog-normalizer.js parseDeveloperStrength"}
- `4.5%   15 Vol.` (src:f3922079-3a6b-11ed-81e7-6045bd925463): explicit {"percent":4.5,"volume":15,"volumeUnit":"vol","percentExplicit":true,"volumeExplicit":true,"raw":"4.5%   15 Vol.","inferredCounterpart":false} ; code {"percent":4.5,"volume":null,"strengthKey":"4.5pct","source":"scripts/lib/product-truth/catalog-normalizer.js parseDeveloperStrength"}
- `3,75%   12,5 Vol.` (src:ccb1384e-3f4d-11ed-81e7-6045bd925463): explicit {"percent":3.75,"volume":12.5,"volumeUnit":"vol","percentExplicit":true,"volumeExplicit":true,"raw":"3,75%   12,5 Vol.","inferredCounterpart":false} ; code {"percent":3.75,"volume":null,"strengthKey":"3.75pct","source":"scripts/lib/product-truth/catalog-normalizer.js parseDeveloperStrength"}

## גוונים מיוחדים שנשמרו כמחרוזת

נמצאו 89 רשומות שהטקסט שלהן כולל 90x, 901, 904, 99, CLEAR, BOOST, HIGH LIFT, MIXT או HL. עומק הושם רק אם familyShade הוא בדיוק LEVEL ומספר.

- DIA LIGHT / `ASH` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `BLUE` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `CLEAR 50g` / grouping `SPECIAL TONES` / shadeLevel null / color
- DIA LIGHT / `COPPER` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `GLOSS CLEAR 250ml` / grouping `SPECIAL TONES` / shadeLevel null / color
- DIA LIGHT / `GOLD/YELLOW` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `MATTE` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `RED` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT / `VIOLET` / grouping `BOOSTERS` / shadeLevel null / color
- DIA LIGHT 60g / `Clear` / grouping `CLEAR` / shadeLevel null / color
- MAJIREL / `10 1/2.1` / grouping `LEVEL 10` / shadeLevel 10 / color
- MAJIREL / `900S` / grouping `HIGH LIFT - S` / shadeLevel null / color
- MAJIREL / `901S` / grouping `HIGH LIFT - S` / shadeLevel null / color
- MAJIREL / `904S` / grouping `HIGH LIFT - S` / shadeLevel null / color
- MAJIREL / `HL  BEIGE` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL ASH` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL ASH VIOLET` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL ASH+` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL NEUTRAL` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL VIOLET` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `HL VIOLET +` / grouping `HIGH LIFT` / shadeLevel null / color
- MAJIREL / `MC ROUGE (RED)` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MC ROUGE MAGENTA` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MM BLEU` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MM CUIVRE (COPPER)` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MM ROUGE (RED)` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MM VERT (GREEN)` / grouping `MIXTONS` / shadeLevel null / color
- MAJIREL / `MM VIOLET` / grouping `MIXTONS` / shadeLevel null / color
- BLONDME / `L - CLEAR` / grouping `SPECIAL TONES` / shadeLevel null / color
- BLONDME / `T - CLEAR` / grouping `SPECIAL TONES` / shadeLevel null / color
- BLONDME LIGHTENERS / `9 -900g` / grouping `BLONDME LIGHTENERS` / shadeLevel null / bleach
- IGORA ROYAL / `0-00` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-11` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-22` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-33` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-55` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-77` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-88` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-89` / grouping `MIXTONES` / shadeLevel null / color
- IGORA ROYAL / `0-99` / grouping `MIXTONES` / shadeLevel null / color

## חצאי רמות

קוד שמכיל `1/2` נשמר כמו שהוא. אם familyShade הוא LEVEL 10, העומק בייצוא הוא 10 כי כך כתוב בקיבוץ, לא 10.5. החצי נשאר רק בקוד הגוון.

- `10 1/2.1` grouping `LEVEL 10`

## תמונות אחרי סבב הנכסים

שלושה קבצים מעובדים מכסים 210 מוצרים: 209 כתמונת סדרה (Majirel ו־Dia Light ברמות LEVEL) ואחד מדויק (BlondMe Premium Lightener 9+, 450 גרם). 795 מוצרים נשארו `missing`. תמונות Diactivator הרשמיות נדחו כי החיתוך פגע בכתף הבקבוק.

## שמות התמונה בגיליון

שמות כמו `lpm0000.png` עדיין שמורים ב־`image.catalogFilename`. הקבצים עצמם לא היו בפרויקט, ולא שויכו תמונות של סדרות אחרות.

## סדרות קיימות שלא יוצאו

הן לא חסרות מהדיסק. הן מחוץ לבחירה, כי השם אינו הסדרה המבוקשת, או שאין במקור כלל שמקשר אותן לסדרה שנבחרה.

### data/catalog-brands/l-oreal-professionnel.json

- MAJIREL FUNDA: 109 שורות בקובץ
- COOL COVER: 27 שורות בקובץ
- MAJICREME: 1 שורות בקובץ
- INOA DEVELOPERS: 3 שורות בקובץ
- BS DEVELOPERS: 5 שורות בקובץ
- LUO COLOR DEVELOPERS: 1 שורות בקובץ

### data/catalog-brands/wella-professionals.json

- GALON DEVELOPERS: 4 שורות בקובץ
- BLONDOR DEVELOPERS: 3 שורות בקובץ
- COLOR TOUCH PLUS: 16 שורות בקובץ

### data/catalog-brands/wella-professionals-jp.json

- KOLESTON PERFECT +: 170 שורות בקובץ

### data/catalog-brands/l-oreal-professionnel-jp.json

- Alluria FASHION: 54 שורות בקובץ
- Alluria cream oxydant: 3 שורות בקובץ

### data/catalog-brands/schwarzkopf-professional-jp.json

- IGORA ROYAL PIXAM-F: 97 שורות בקובץ
- IGORA ROYAL PIXAM-G: 60 שורות בקובץ

Majirel Funda קיימת כסדרת מקור נפרדת. טבלת הכינויים בקוד ממפה אותה ל־MAJIREL. המיפוי לא הופעל, והשורות לא מוזגו לתוך Majirel.

Galon Developers קיימת אצל Wella, כולל שורה `Shinfinity Activator`, בלי כלל מקור שמקשר אותה ל־Koleston או ל־Color Touch.

קובצי JP אינם מכילים את שמות הסדרות Majirel, Dia Light, Koleston או Igora Royal. יש בהם שמות אחרים, כגון Alluria ו־Koleston Perfect +. הם לא אוחדו לייצוא.

## סתירות שנשמרו

- מילון BlondMe מגדיר את הסדרה כ־lightener. בקובץ schwarzkopf.json סדרת BLONDME היא type color. סוג המוצר בייצוא נלקח מהשדה type, לא מהמילון.
- Dia Light ו־Color Touch ו־Igora Vibrance מסומנים במילון כ־acidic toner או demi. השדה type בקטלוג הוא color. הייצוא לא שדרג את הסוג.
- `catalog-normalizer.js` בונה מפתח זהות בלי גודל אריזה. `migrations/020_canonical_product_database.sql` אומר שגודל אריזה הוא חלק מהזהות. הייצוא שמר שורה נפרדת לכל productId.
- טבלת האחוז/נפח בקוד אינה זהה לכל הזוגות המפורשים. למשל Diactivator כתוב 1.8% ו־6 Vol, בעוד Color Touch כתוב 1.9% ו־6 Vol.

## נתוני דמו שלא נכנסו

`netlify/functions/inventory.js` מכיל שורות הדגמה של Salon Look, עם level מספרי ומחירים בדולר. אלה לא רשומות קטלוג. הן לא יוצאו.
