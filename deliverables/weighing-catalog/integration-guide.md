# חיבור למערכת השקילה

החבילה היא קובץ מקומי. מנגנון השקילה לא צריך את סכמת Neon, את גיליון האקסל, או את שמות העמודות המקוריים.

## טעינה עכשיו

1. קראו את `catalog.json`.
2. בדקו ש־`catalogVersion` הוא `2026-09-27.1` וש־`counts.products` שווה לאורך `products`.
3. אינדקס ראשי: `id` וגם `source.productId`.
4. אינדקס ברקוד: כל איבר ב־`barcodes` כמחרוזת. אל תמירו למספר.
5. שמרו מיקס היסטורי עם `source.productId` ועם `catalogVersion`.

מיון יציב, זהה לחוזה המוצע:

`brand.source`, אחר כך `productLine.source`, אחר כך `shadeCode`, אחר כך `source.productId`.

ההשוואה היא סדר יחידות הקוד של המחרוזת. `10.1` בא לפני `5.0`. זה לא מיון לפי עומק גוון.

## שדות שאפשר להציג

- מותג: `brand.display`. לחיפוש ולייצוב השתמשו גם ב־`brand.source`.
- סדרה: `productLine.display` ו־`productLine.source`. אצל Wella המקור הוא `KOLESTONE`.
- קוד גוון: `shadeCode` כמו שהוא, כולל `901S`, `10 1/2.1`, `3,75%   12,5 Vol.`.
- עומק: רק `shadeLevel.numeric` כשהאובייקט אינו null. `0` הוא ערך, לא חוסר.
- משפחה טונאלית: אין. אל תבנו מסנן משפחה מהסיומת.
- סוג: `productType`. תפקיד שקילה: `mixingRole`. אצל הבהרה הסוג הוא `bleach` והתפקיד הוא `lightener`.
- חמצן: `developerStrength.percent` ו־`developerStrength.volume` רק כשאינם null.
- אריזה: `package.materialWeight` ו־`package.packingWeight`. היחידה גרם היא מוסכמת העמודה, לא מדידה מחודשת.
- מחיר: `price.amount` עם מטבע `ILS` והיקף `catalog_spreadsheet`. זה לא מחיר הסלון.
- סטטוס קטלוג: `catalogStatus`. `barcode_conflict` עדיין מוצר.

`derived.shadeDescription` ו־`derived.productKind` הם טקסטים שחושבו ב־`build-catalog-truth.js`. הם לא שדות יצרן. `derived.verificationUrl` הוא קישור חיפוש, לא אימות.

## מה לא לחשב

- אל תחלקו מחיר במשקל. `costPerGram` הוא null כי אין המרה.
- אל תחשבו יעד חמצן. אין יחס, ואין כלל לכמה צבעים בקערה. `countsTowardDeveloperTarget` הוא null גם אצל צבע וגם אצל טיפול.
- אל תסתמכו על טבלאות האחוז/Vol שב־`mixing-rules.json`. הן מצוטטות כדי שלא ישמשו כברירת מחדל.
- אל תחברו זמינות סלון. אין במצב הזה סלון, מלאי או סדרה מופעלת. חוסר הרשומה הוא "לא ידוע", לא "אזל".

מוצר בלי תמונה ובלי משפחת גוון כשיר לבחירה. שתי שורות הטיפול ב־Igora Royal, ושורות ההבהרה ב־BlondMe, נמצאות בקובץ וצריכות להופיע כשמסננים לפי הסוג שלהן.

## תמונות

אם `image.included` הוא true, הציגו את `image.localAsset`. זה נתיב יחסי בתוך החבילה, בלי רשת.

`image.matchType` הוא `exact`, `series` או `missing`. תמונת `series` היא אריזת הסדרה בלי קוד הגוון של המוצר. אל תציגו אותה כגוון המדויק. `missing` נשאר בלי תמונה.

המקור שהורד נשמר ב־`image.originalAsset`. הקובץ לכרטיס הוא ה־PNG המעובד.

## החלפה עתידית ב־API

`api-contract.yaml` מסומן `x-contract-status: proposed`. אין שרת כזה היום.

ה־API הקיים של הסלון הוא `netlify/functions/salon-products.js`. הוא מחזיר קטלוג ריצה מאושר מ־Neon, לא את הצילום הזה, והוא לא מסנן לפי עומק או חוזק חמצן. אפשר להשאיר אותו לזמינות סלון בהמשך, בנפרד מקטלוג השקילה.

כדי להחליף את הקובץ המקומי בלי לשבור מיקסים:

1. המשיכו להשתמש ב־`source.productId` כמפתח זר של שורת מיקס.
2. אל תמחזרו מזהה. שינוי עתידי מסמן `catalogStatus` כ־`deleted` או `deprecated` ומשאיר את הרשומה ניתנת לשליפה.
3. שמרו על המיון והעימוד שמתוארים בחוזה, כדי שעמוד לא יזוז בין גרסאות כשאין שינוי בנתונים.
4. גרסה חדשה היא קובץ מלא עם `catalogVersion` חדש. דלתא לא מומשה.
5. שכבת הסלון נשארת קריאה נפרדת: מותג מופעל, סדרה מופעלת, מלאי ומחיר. היא לא נכתבת לתוך רשומת הקטלוג המרכזית.

דוגמאות אמיתיות, כולל Majirel `5.0`, Majirel `901S`, Diactivator `1.8% / 6 Vol`, טיפול Igora, והברקוד `4045787423426` שיש לו כמה התאמות, נמצאות ב־`api-examples/`.
