# מודל המקור

החבילה נקראה מהקבצים. מסד Neon לא נפתח, ושום קובץ מקור לא שונה.

## שכבות

יש שלוש שכבות שונות. הן לא אוחדו.

### 1. גיליון הקטלוג

`data/products_1781528628322.xlsx`, גיליון `Sheet1`, 32937 שורות.

העמודות:

`productId`, `brand`, `series`, `familyShade`, `shade`, `image`, `catalogNo`, `hairColor`, `type`, `packingWeight`, `materialWeight`, `barcodes`, `ILS`.

בדיקת היכר: `productId` `ff1264f7-f6e5-11ec-9cb4-6045bd925463` הוא Majirel `5.0`, `familyShade` `LEVEL 5`, משקלים 50 ו־67, מחיר 27.5. אותם ערכים נמצאים גם ב־JSON.

### 2. קבצי מותג שנגזרו מהגיליון

`scripts/build-catalog-truth.js` כותב אל `data/catalog-brands/*.json`.

הייצוא נלקח מהקבצים האלה, לא מהעותק הרזה ב־`src/data/catalog-brands/`. העותק הרזה חולק את אותם מזהים ואת אותם ערכים בשדות המשותפים שנבדקו ל־Majirel, והקובץ ב־`data/` חדש יותר ומכיל גם `familyShade`, משקלים, ברקודים מלאים, `image` ו־`productKind`.

שדות שהסקריפט מוסיף, ואינם עמודות בגיליון:

- `shadeDesc`, מ־`describeShade`. זה טקסט היוריסטי.
- `productKind`, מ־`inferProductKind`.
- `flag`, מ־`entryFlag`.
- `verificationUrl`, קישור חיפוש Google. `reports/catalog-verification-audit/README.md` קובע שאין ראיית מקור שנאספה בפועל לאף מוצר.
- `rawType`, עותק של `type` אחרי הנרמול ב־`TYPE_MAP`.

### 3. קטלוג סלון ומלאי

אלה טבלאות אחרות. הן לא יוצאו.

- `migrations/020_canonical_product_database.sql` ואחר כך `migrations/026_catalog_inventory_v1_naming.sql`: מותג, סדרה, משפחת מוצר ומוצר קנוני ב־Neon. עמודות העומק והמשפחה הטונאלית מסומנות שם כמצייני מקום עד אבן דרך אונטולוגיה, ואין למלא אותן לפני כן.
- `migrations/028_salon_catalog_enablement_inventory.sql`: מותג מופעל לסלון, מלאי סלון, ומחיר עלות/מכירה של הסלון.
- `migrations/031_salon_product_line_enablement.sql`: הפעלת סדרות. אם יש סדרות מופעלות, חיפוש ברירת המחדל מצטמצם אליהן. אם אין, כל המותג המופעל נשאר.
- `migrations/032_catalog_runtime_products_view.sql`: תצוגת ריצה לסלון דורשת `active`, `validation_status = approved` ו־`published_at`. זה שער אחר מ־`flag` של ה־JSON.
- `migrations/15_inventory.sql`: מלאי ישן per salon, עם `level` מספרי ו־`size_grams` שברירת המחדל שלו 50. זה לא הקטלוג המרכזי.
- `netlify/functions/inventory.js`: שורות הדגמה של Salon Look. לא יוצאו.

`netlify/functions/salon-products.js` הוא ה־API הקיים של הסלון. הוא לא מחזיר את הצילום הזה, והוא לא מחשב יעד חמצן.

## ישויות

```
brand (מחרוזת brand)
  └── series (מחרוזת series) = product line
        └── product (productId)
              ├── shade (מחרוזת)
              ├── familyShade (תווית קיבוץ, לא משפחת גוון)
              ├── type
              ├── materialWeight, packingWeight
              ├── barcodes[]
              ├── image (שם קובץ)
              └── ILS
```

אין טבלת גוון נפרדת ואין טבלת אריזה נפרדת. אריזה אחרת היא `productId` אחר. דוגמה: `DIA LIGHT` ו־`DIA LIGHT 60g`.

אין שדה מדינה על השורה. השוק היחיד שסומן בייצוא הוא קנדה, בגלל שם הקובץ `schwarzkopf-canada.json` ומחרוזת המותג `SCHWARZKOPF_CANADA`. קוד `CA` הוא נרמול של הסיומת הזו. קבצי JP קיימים (`l-oreal-professionnel-jp.json`, `wella-professionals-jp.json`, `schwarzkopf-professional-jp.json`) עם שמות סדרה אחרים, כגון Alluria ו־Koleston Perfect +. הם לא אוחדו.

`scripts/lib/beauty-intelligence/brand-dictionary.js` ממפה כל מותג שמכיל את המחרוזת SCHWARZKOPF אל מפתח אחד. הייצוא לא השתמש במיפוי הזה כדי למזג את קנדה.

## מושגים שהתבקשו, ואיפה הם חיים

| מושג | במקור | בייצוא |
| --- | --- | --- |
| Brand | `brand` | `brand.source`, ושם תצוגה מהמילון כשיש |
| Product line | `series` | `productLine.source` |
| Product type | `type` | `productType`. bleach נשאר bleach |
| Mixing role | אין שדה | תרגום מתועד של `type`. bleach הופך ל־lightener |
| Shade code | `shade` | `shadeCode`, מחרוזת |
| Shade family | אין שדה טונאלי | `shadeFamilies: []` |
| Shade level | רק אם `familyShade` הוא `LEVEL N` | `shadeLevel.numeric` |
| Developer strength | בתוך טקסט `shade`, אחוז ו־Vol | רק מספרים מפורשים |
| Package size | `materialWeight`, `packingWeight` | שניהם, יחידה גרם כמוסכמת סכמה |
| Barcode | מערך מחרוזות | `barcodes`, בלי להוריד אפסים |
| Market | אין, חוץ משם קובץ קנדה | `market` או null |

`familyShade` מתועד ב־`scripts/lib/product-catalog/workbook-builder.js` כתווית קבוצה, לדוגמה `LEVEL 6`. אצל Koleston יש גם תווית `80g` על שורות שמשקלן 80. זו אינה רמת גוון ואינה משפחה, ולכן `shadeLevel` שם הוא null.

קודים `900S`, `901S` ו־904S ב־Majirel יושבים תחת `HIGH LIFT - S` או `HIGHLIFT`. הם לא פורשו כרמה 9.

## תמונות

השדה `image` הוא שם קובץ, למשל `lpm0000.png`. השם חוזר על מוצרים רבים באותה סדרה. לא נמצאו הקבצים האלה בעץ הפרויקט.

`public/catalog-products/loreal-professionnel/` מכיל 31 קבצים ששמם הוא `productId`. כולם שייכים ל־Absolut Repair, Blond Studio, Metal Detox ו־Serie Expert. אף אחד מהם אינו מוצר בסדרות הייצוא, ולכן לא הועתק דבר.

## ברקודים

`scripts/build-catalog-truth.js` מסמן `flag` 3 כשאותו ברקוד מופיע על יותר מ־`productId` אחד באותו מותג, או בין מותגים. הרשומה נשארת.

`scripts/lib/product-catalog/schema.js` בודק ספרת ביקורת של EAN-13, UPC-A ו־EAN-8. ברקוד שלא עובר נשמר בייצוא.

## כללים שקיימים בקוד, ואינם יחס ערבוב

- `parseDeveloperStrength` ב־`scripts/lib/product-truth/catalog-normalizer.js` בונה מפתח חוזק לחיפוש. כשיש אחוז, Vol מפורש מושלך אם האחוז לא נמצא ב־`PERCENT_TO_VOL`.
- `describeShade` מייצר משפט צבע מהספרה הראשונה ומהסיומת. זה מקור השדה `shadeDesc` בלבד.
- `classification-engine.js` גוזר רמה ומשפחה מקוד הגוון. דוח האימות מסמן את זה כהיוריסטיקה.
- `PRODUCT_LINE_ALIASES` ממפה שמות סדרה. המיפוי לא הופעל בייצוא, כי הוא מאחד סדרות שהמקור שומר בנפרד, ובמקרה של Koleston הוא גם לא מסכים עם מפתח המילון `KOLESTONE`.

פירוט האכיפה, כולל מה חסר, נמצא ב־`mixing-rules.json`.
