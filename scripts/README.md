# 📊 SUMIT Data Import Scripts

מערכת מקיפה לייבוא נתוני לקוחות ותשלומים מ-SUMIT למסד הנתונים Neon PostgreSQL.

---

## 🚀 התקנה ראשונית

### 1. הכן את הסביבה

```bash
# וודא שכל התלויות מותקנות
npm install

# וודא שקיים קובץ .env עם המשתנים הנדרשים
```

### 2. הגדר את קובץ `.env`

```env
# Database
NEON_DATABASE_URL=postgresql://username:password@host/database

# SUMIT API (אם נדרש בעתיד)
SUMIT_API_URL=https://api.sumit.co.il
SUMIT_API_KEY=your_api_key
SUMIT_ORG_ID=your_organization_id
```

### 3. הכן את מסד הנתונים

```bash
# הרץ את קובץ ה-SQL ב-Neon Console או באמצעות psql
psql $NEON_DATABASE_URL -f scripts/database-setup.sql
```

---

## 📁 מבנה הקבצים

```
scripts/
├── data/                          # תיקיית קבצי CSV
│   ├── sumit_customers_new.csv     # קובץ לקוחות מ-SUMIT
│   ├── sumit_payments.csv          # קובץ תשלומים מ-SUMIT
│   ├── import_errors_customers.csv # שגיאות ייבוא לקוחות
│   └── import_errors_payments.csv  # שגיאות ייבוא תשלומים
├── importCustomers.js             # ייבוא לקוחות
├── importPayments.js              # ייבוא תשלומים
├── importAll.js                   # ייבוא מלא (הכל יחד)
├── database-setup.sql             # הגדרת מסד נתונים
└── README.md                      # המדריך הזה
```

---

## 🎯 איך להשתמש

### ▶️ ייבוא מהיר (הכל יחד)

```bash
npm run import:all
# או
npm run sync:full
```

### ▶️ ייבוא נפרד

**לקוחות בלבד:**

```bash
npm run import:customers
```

**תשלומים בלבד:**

```bash
npm run import:payments
```

**עם קובץ מותאם אישית:**

```bash
node scripts/importPayments.js custom_payments.csv
```

---

## 📋 פורמט קבצי CSV

### 🧑‍🤝‍🧑 קובץ לקוחות (`sumit_customers_new.csv`)

| עמודה בעברית          | שדה ב-DB     | סוג  | חובה   |
| --------------------- | ------------ | ---- | ------ |
| שם הכרטיס             | card_name    | TEXT | לא     |
| שם מלא                | full_name    | TEXT | **כן** |
| ת"ז/ח"פ               | id_number    | TEXT | לא     |
| טלפון                 | phone        | TEXT | **כן** |
| כתובת מייל            | email        | TEXT | **כן** |
| פרטי כתובת            | address      | TEXT | לא     |
| יישוב                 | city         | TEXT | לא     |
| מיקוד                 | zip_code     | TEXT | לא     |
| התאריך הבא ליצירת קשר | next_contact | DATE | לא     |
| סטטוס                 | status       | TEXT | לא     |

### 💰 קובץ תשלומים (`sumit_payments.csv`)

| עמודה אפשרית | שדה ב-DB         | סוג     | חובה   |
| ------------ | ---------------- | ------- | ------ |
| מספר מסמך    | document_id      | TEXT    | **כן** |
| תאריך        | payment_date     | DATE    | **כן** |
| לקוח         | customer_name    | TEXT    | כן\*   |
| מזהה לקוח    | customer_id      | TEXT    | כן\*   |
| סכום         | amount           | DECIMAL | **כן** |
| מטבע         | currency         | TEXT    | לא     |
| סטטוס        | status           | TEXT    | לא     |
| אמצעי תשלום  | payment_method   | TEXT    | לא     |
| מספר אסמכתא  | reference_number | TEXT    | לא     |
| הערות        | notes            | TEXT    | לא     |

\*אחד מהשדות `customer_name` או `customer_id` חובה

---

## ✅ תכונות מתקדמות

### 🔍 ולידציה אוטומטית

- **אימייל תקין:** בדיקת פורמט אימייל
- **טלפון תקין:** לפחות 9 ספרות (ישראלי)
- **סכום תקין:** מספר חיובי
- **תאריך תקין:** פורמט תאריך מובן

### 🛡️ מניעת כפילויות

- **לקוחות:** לפי אימייל (`ON CONFLICT email`)
- **תשלומים:** לפי מספר מסמך (`ON CONFLICT document_id`)

### 📝 רישום שגיאות

- שורות שנכשלו נשמרות בקבצי CSV נפרדים
- כולל סיבת השגיאה לכל שורה

### 🔄 עדכון אוטומטי

- אם רשומה קיימת, היא מתעדכנת עם הנתונים החדשים
- שדות `updated_at` מתעדכנים אוטומטית

---

## 📊 דוחות ובקרה

### בדיקת תוצאות הייבוא

```sql
-- סך לקוחות
SELECT COUNT(*) as total_customers FROM users;

-- סך תשלומים והכנסות
SELECT COUNT(*) as total_payments, SUM(amount) as total_revenue FROM payments;

-- לקוחות מובילים
SELECT full_name, email, total_amount, total_payments
FROM customer_payment_summary
ORDER BY total_amount DESC
LIMIT 10;
```

### קישור תשלומים ללקוחות

```sql
-- אחרי הייבוא, הרץ פונקציה לקישור
SELECT link_payments_to_users();
```

---

## 🔧 פתרון בעיות

### ❌ שגיאת חיבור למסד נתונים

```
Error: connection refused
```

**פתרון:** בדוק את `NEON_DATABASE_URL` בקובץ `.env`

### ❌ קובץ CSV לא נמצא

```
File not found: scripts/data/sumit_customers_new.csv
```

**פתרון:** וודא שהקובץ נמצא בתיקיה הנכונה עם השם המדויק

### ❌ שגיאות ולידציה

```
⚠️ Skipping invalid row: אימייל לא תקין
```

**פתרון:** בדוק את קובץ השגיאות `import_errors_*.csv` לפרטים

### ❌ כפילות במסד נתונים

```
ERROR: duplicate key value violates unique constraint
```

**פתרון:** זה תקין! הסקריפט מטפל בכפילויות באופן אוטומטי

---

## ⚡ אוטומציה

### 🕐 הרצה מתוזמנת (cron)

```bash
# הוסף ל-crontab עבור הרצה יומית ב-2:00
0 2 * * * cd /path/to/project && npm run import:all >> logs/import.log 2>&1
```

### 🌐 Netlify Scheduled Functions

```javascript
// netlify/functions/scheduled-import.js
exports.handler = async (event, context) => {
  try {
    // קוד ייבוא כאן
    return { statusCode: 200, body: "Import completed" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
```

### 📧 הודעות וניטור

אפשר להוסיף התראות במייל או Slack כשהייבוא מסתיים או כשיש שגיאות.

---

## 🔮 תכונות עתידיות

- [ ] ייבוא מ-API של SUMIT (כשיהיה זמין)
- [ ] סנכרון דו-כיווני
- [ ] ממשק גרפי לייבוא
- [ ] דוחות מתקדמים
- [ ] גיבוי אוטומטי

---

## 📞 תמיכה

אם נתקלת בבעיות:

1. בדוק את קבצי השגיאות ב-`scripts/data/import_errors_*.csv`
2. בדוק את ה-logs בטרמינל
3. וודא שמסד הנתונים פועל
4. וודא שהקבצים בפורמט הנכון

**🎉 בהצלחה עם הייבוא!**
