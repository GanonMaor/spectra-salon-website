# Spectra/Booksy Payments Dashboard - מדריך הפעלה

## 🚀 סקירה כללית

דשבורד מקיף לניהול ומעקב אחר תשלומים של Spectra/Booksy עם תמיכה ב-ILS ו-USD.

## 📊 פיצ'רים עיקריים

### 1. **כרטיסי סיכום**

- סך הכנסות לפי מטבע (ILS/USD)
- מספר לקוחות פעילים
- מספר מדינות
- מספר טרנזקציות

### 2. **גרפי מגמות**

- גרף קווים/עמודות של הכנסות חודשיות
- חלוקה לפי מטבע
- 12 חודשים אחורה

### 3. **טבלת תשלומים**

- חיפוש לפי שם לקוח
- פילטרים: מטבע, מדינה, תאריכים
- עימוד (pagination)
- מיון וסידור

### 4. **לקוחות מובילים**

- Top 10 לקוחות לפי סך תשלומים
- ממוצע תשלום
- תשלום אחרון

### 5. **חלוקה לפי מדינות**

- סך הכנסות לפי מדינה ומטבע
- מספר לקוחות ייחודיים
- מספר טרנזקציות

## 🛠️ התקנה והגדרה

### 1. הרצת המיגרציה לדאטאבייס

```bash
# התחבר ל-Neon וצור את הטבלאות
psql $DATABASE_URL -f migrations/03_spectra_payments.sql
```

### 2. ייבוא נתונים

#### אפשרות א: ייבוא מ-CSV רגיל

```bash
# פורמט CSV: client,date,currency,amount,country
node migrations/import_payments_from_csv.js path/to/payments.csv
```

#### אפשרות ב: ייבוא מטבלת Pivot

```bash
# עבור קבצי Pivot מ-Excel/Booksy
node migrations/import_payments_from_csv.js path/to/pivot.csv --pivot
```

### 3. בדיקת הפונקציות

```bash
# בדיקה לוקלית
netlify functions:serve

# בדוק ב:
# http://localhost:8888/.netlify/functions/get-payments
# http://localhost:8888/.netlify/functions/get-payments-summary
```

## 📱 גישה לדשבורד

1. **התחבר כ-Admin**: `/login`
2. **נווט לדשבורד**: `/dashboard`
3. **או דרך תפריט Admin**: Admin → Dashboard → Payments

## 🔧 התאמות וקונפיגורציה

### שינוי מגבלת רשומות בעמוד

```typescript
// ב-PaymentsTable.tsx
const [pagination, setPagination] = useState<PaginationInfo>({
  limit: 20, // שנה כאן
  // ...
});
```

### הוספת מטבעות נוספים

```sql
-- ב-migration
CHECK (currency IN ('ILS', 'USD', 'EUR')) -- הוסף מטבע
```

### התאמת פורמט תאריכים

```typescript
// ב-paymentsService.ts
static formatDate(date: string): string {
  return new Date(date).toLocaleDateString('he-IL', {
    // שנה פורמט כאן
  });
}
```

## 📊 ייצוא נתונים

כפתור "Export Data" מאפשר הורדת הנתונים (יש להטמיע):

```typescript
const handleExport = () => {
  // יצירת CSV
  const csv = convertToCSV(payments);
  downloadFile(csv, "payments.csv");
};
```

## 🔍 טיפים לשימוש

1. **חיפוש מהיר**: השתמש בשדה החיפוש למציאת לקוח ספציפי
2. **פילטרים מרובים**: ניתן לשלב כמה פילטרים יחד
3. **תצוגות**: עבור בין הטאבים לתצוגות שונות
4. **רענון**: הנתונים מתעדכנים אוטומטית בטעינת העמוד

## 🐛 פתרון בעיות

### "No payments found"

- וודא שהמיגרציה רצה בהצלחה
- בדוק שיש נתונים בטבלה: `SELECT COUNT(*) FROM spectra_payments;`

### גרפים לא מוצגים

- וודא שיש נתונים ב-12 החודשים האחרונים
- בדוק console לשגיאות JavaScript

### בעיות הרשאות

- וודא שהמשתמש הוא admin
- בדוק את ה-role בטבלת users

## 🚀 הרחבות עתידיות

- [ ] ייצוא ל-Excel
- [ ] שליחת דוחות אוטומטיים
- [ ] השוואה בין תקופות
- [ ] תחזיות והערכות
- [ ] אינטגרציה עם מערכות תשלום
- [ ] דוחות מס אוטומטיים

## 📞 תמיכה

לשאלות ותמיכה:

- בדוק את הלוגים ב-Netlify Functions
- השתמש ב-console.log לדיבאג
- וודא שכל משתני הסביבה מוגדרים
