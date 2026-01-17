# Spectra AI - Investor Presentation Guide

## 📊 קבצי המצגת שנוצרו

### 1. `investor-presentation.html`
מצגת HTML אינטראקטיבית עם reveal.js - **מומלץ להצגה חיה**

### 2. `INVESTOR_DECK_DATA.md`
מסמך Markdown מפורט עם כל הנתונים

---

## 🚀 איך להשתמש במצגת HTML

### פתיחה והצגה

**אפשרות 1: הצגה ישירה בדפדפן**
1. פתח את הקובץ `investor-presentation.html` בדפדפן (Chrome/Firefox/Safari)
2. לחץ F11 למסך מלא
3. השתמש בחיצים או רווח כדי לנווט בין השקפים

**אפשרות 2: הרצה עם שרת מקומי** (מומלץ)
```bash
# מהתיקייה הראשית של הפרויקט
cd /Users/maorganon/Downloads/spectra-salon-website-main
python3 -m http.server 8000
# או
npx serve .
```
לאחר מכן פתח: `http://localhost:8000/investor-presentation.html`

### מקשי ניווט

- **→ / ↓ / רווח**: שקף הבא
- **← / ↑**: שקף קודם
- **Home**: שקף ראשון
- **End**: שקף אחרון
- **F**: מסך מלא
- **S**: מצב רמקול (speaker notes)
- **ESC**: סקירה כללית של כל השקפים
- **?**: עזרה

---

## 📥 ייצוא ל-PowerPoint

### שיטה 1: ייצוא ל-PDF ואז ל-PowerPoint

1. **ייצוא ל-PDF:**
   - פתח את המצגת בדפדפן Chrome
   - לחץ Ctrl+P (Windows) או Cmd+P (Mac)
   - בחר "Print to PDF"
   - ב-"More settings" → שנה Layout ל-"Landscape"
   - הדפס/שמור
   
2. **המרה ל-PowerPoint:**
   - פתח PowerPoint
   - File → Open → בחר את קובץ ה-PDF
   - PowerPoint יהמיר אוטומטית לשקפים

### שיטה 2: העתקה ידנית (שומרת את העיצוב הטוב ביותר)

1. פתח PowerPoint חדש
2. עבור לכל שקף במצגת HTML
3. צלם מסך (Win+Shift+S / Cmd+Shift+4)
4. הדבק ב-PowerPoint
5. הוסף טקסט מעל התמונה לעריכה

### שיטה 3: שימוש ב-Decktape (מתקדם)

```bash
# התקנה
npm install -g decktape

# ייצוא ל-PDF
decktape reveal investor-presentation.html investor-deck.pdf

# ייצוא ל-PPTX (דרך PDF)
# פתח את ה-PDF ב-PowerPoint
```

---

## 🎨 התאמה אישית של העיצוב

### שינוי צבעים

ערוך את הקובץ `investor-presentation.html` ב-section `<style>`:

```css
:root {
  --amber-500: #f59e0b;    /* צבע ראשי */
  --amber-400: #fbbf24;    /* צבע משני */
  --orange-500: #f97316;   /* הדגשה */
  --orange-400: #fb923c;   /* רקע כרטיסים */
  --red-600: #dc2626;      /* אזהרות */
}
```

### שינוי פונטים

החלף את ה-font-family:

```css
.reveal {
  font-family: 'Your-Font-Here', sans-serif;
}
```

### הוספת לוגו

הוסף בתוך כל `<section>`:

```html
<img src="your-logo.png" style="position: absolute; top: 20px; right: 20px; width: 100px;">
```

---

## 🖼️ יצירת PowerPoint מאפס (מדריך עיצוב)

אם אתה רוצה ליצור ב-PowerPoint ידנית, השתמש בהנחיות אלו:

### פלטת צבעים

| צבע | קוד HEX | שימוש |
|-----|---------|-------|
| Amber 500 | #f59e0b | כותרות ראשיות |
| Amber 400 | #fbbf24 | מדדים, מספרים |
| Orange 500 | #f97316 | הדגשות |
| Orange 400 | #fb923c | רקעי כרטיסים |
| שחור | #0a0a0a | רקע ראשי |
| לבן 85% | rgba(255,255,255,0.85) | טקסט רגיל |

### פונטים

- **כותרות:** Inter Light/Regular, 48-72pt
- **כותרות משנה:** Inter Regular, 32-40pt
- **טקסט גוף:** Inter Regular, 18-24pt
- **Letter Spacing:** 0.1em-0.2em (רווח בין אותיות)
- **Text Transform:** UPPERCASE לכותרות

### אפקטים

**כרטיסי Glassmorphism:**
- רקע: שחור 40% שקיפות
- גבול: Orange 40% שקיפות, 2px
- צל: Soft shadow (10px blur, orange tint)
- פינות מעוגלות: 24px

**אנימציות מומלצות:**
- כניסת שקפים: Fade + Slide from Right
- כניסת אלמנטים: Fade In, delay 0.2s בין פריטים

### פריסת שקפים

```
┌────────────────────────────┐
│ [Logo]         [Page #]   │
│                            │
│  ┌─ TITLE ────────────┐  │
│  │                     │   │
│  │  [Content Cards]    │   │
│  │  [Metrics Grid]     │   │
│  │  [Charts/Data]      │   │
│  │                     │   │
│  └─────────────────────┘   │
│                            │
│  Spectra AI © 2025         │
└────────────────────────────┘
```

---

## 💡 טיפים להצגה

### לפני ההצגה
- [x] בדוק שכל המספרים עדכניים
- [x] הכן speaker notes (מקש S במצגת)
- [x] תרגל את המעברים בין שקפים
- [x] הכן תשובות לשאלות נפוצות

### במהלך ההצגה
- השתמש במצב מסך מלא (F)
- השהה על שקפי מדדים 10-15 שניות
- הדגש את ה-LTV:CAC ratio (8:1)
- הסבר את משפך ה-marketing בפירוט
- סיים עם call-to-action ברור

### אחרי ההצגה
- שלח PDF של המצגת
- צרף את `INVESTOR_DECK_DATA.md` למייל
- הוסף לינק לדף המשקיעים החי

---

## 🔗 קישורים נוספים

- **מצגת חיה באתר:** `http://localhost:4173/investors`
- **מסמך נתונים מפורט:** `INVESTOR_DECK_DATA.md`
- **קוד מקור המצגת:** `investor-presentation.html`

---

## 📞 תמיכה טכנית

אם יש בעיה עם המצגת:
1. וודא שאתה משתמש בדפדפן מודרני (Chrome/Firefox)
2. נסה לפתוח ב-incognito/private mode
3. נקה cache של הדפדפן
4. בדוק את ה-console (F12) לשגיאות

---

## ✨ תכונות מתקדמות

### הוספת אנימציות מותאמות

הוסף ל-`<section>`:

```html
<section data-transition="zoom">
  <!-- תוכן השקף -->
</section>
```

אפשרויות: `slide`, `fade`, `zoom`, `convex`, `concave`

### הוספת Speaker Notes

```html
<section>
  <h2>Title</h2>
  <p>Content</p>
  <aside class="notes">
    הערות למרצה - יופיעו במצב S
  </aside>
</section>
```

### רקע מותאם לשקף

```html
<section data-background-color="#0a0a0a">
  <!-- או -->
<section data-background-image="background.jpg">
```

---

*מצגת זו נוצרה אוטומטית מנתוני דף המשקיעים של Spectra AI*
