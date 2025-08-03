# 📱 WhatsApp Business API Integration Setup

## מה נוצר במערכת:

### ✅ מה כבר עובד:

1. **WhatsApp Widget** - כפתור ירוק בפינה שמאל של האתר
2. **Customer Messages Integration** - אינטגרציה מלאה עם מערכת התמיכה
3. **Two-way Communication** - אפשרות לענות ללקוחות דרך WhatsApp מהאדמין
4. **Database Integration** - כל הודעות WhatsApp נשמרות במסד הנתונים

### 🔧 מה צריך להגדיר:

## 1. הגדרת WhatsApp Business API

### שלב 1: יצירת Facebook App

1. עבור ל: https://developers.facebook.com/
2. צור "New App" → "Business"
3. הוסף "WhatsApp" product
4. בחר "Business" tier

### שלב 2: קבלת Phone Number ID ו-Access Token

1. במשך הגדרת WhatsApp, תקבל:
   - `PHONE_NUMBER_ID` (מזהה הטלפון העסקי)
   - `ACCESS_TOKEN` (אסימון גישה)

### שלב 3: הוספת משתני סביבה ל-.env

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token_here
```

### שלב 4: הגדרת Webhook

1. ב-WhatsApp Business Platform, הוסף webhook URL:
   ```
   https://your-domain.netlify.app/.netlify/functions/whatsapp-webhook
   ```
2. השתמש ב-`WHATSAPP_VERIFY_TOKEN` שבחרת
3. בחר "messages" subscription

## 2. עדכון מספר הטלפון ברכיב

ב-`src/screens/Frame/Frame.tsx`, עדכן את המספר:

```tsx
<WhatsAppWidget
  phoneNumber="972501234567" // 👈 החלף עם המספר שלך
  message="Hi! I'm interested in Spectra Color Intelligence system. Can you help me?"
  position="bottom-left"
/>
```

## 3. כיצד זה עובד:

### מהלקוח:

1. לוחץ על כפתור WhatsApp באתר
2. נפתח WhatsApp עם הודעה מוכנה מראש
3. שולח הודעה

### במערכת:

1. WhatsApp webhook מקבל את ההודעה
2. נוצרת פנייה חדשה במסד הנתונים
3. ההודעה מופיעה ב-Customer Messages

### מהאדמין:

1. רואה את ההודעה ב-Customer Messages
2. יכול לענות רגיל או דרך WhatsApp
3. תגובה דרך WhatsApp נשלחת ישירות ללקוח

## 4. תכונות מתקדמות:

### אוטומציה:

- הודעות WhatsApp נוצרות כפניות אוטומטית
- תגיות "whatsapp" נוספות אוטומטית
- זיהוי לקוחות חוזרים לפי מספר טלפון

### אנליטיקס:

- מעקב אחר קליקים על WhatsApp
- הפרדה בין ערוצי תקשורת
- דיווחים על זמני תגובה

### UI/UX:

- באדג' ירוק מציין הודעות WhatsApp
- כפתור מיוחד לשליחה דרך WhatsApp
- אייקון WhatsApp ברשימת הפניות

## 5. בדיקה:

1. **בדיקת Widget**: לחץ על הכפתור הירוק באתר
2. **בדיקת Webhook**: שלח הודעה דרך WhatsApp
3. **בדיקת Admin**: ראה שההודעה מופיעה במערכת
4. **בדיקת תגובה**: נסה לענות דרך WhatsApp

## 🎯 מצב נוכחי:

- ✅ WhatsApp Widget מותקן ועובד
- ✅ Customer Messages מוכן
- ⏳ צריך הגדרת WhatsApp Business API
- ⏳ צריך עדכון מספר טלפון

## 📞 המספר הנוכחי:

`972504322680` ✅ (מספר העסק של מאור - מעודכן)

## סיום:

לאחר השלמת ההגדרות, יהיה לך צ'אט WhatsApp מלא עם:

- כפתור באתר → WhatsApp → Customer Messages → תגובה → WhatsApp ← לקוח
