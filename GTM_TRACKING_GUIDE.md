# Google Tag Manager מדריך מעקב

## 🎯 מה הוגדר עבורך

### 1. GTM Container

- **Container ID**: `GTM-T3LLQRVX`
- **מותקן**: ב-`index.html` - בראש ובבודי
- **מוכן לשימוש**: כן ✅

### 2. אירועים אוטומטיים שמתעדים

- 📝 **שליחת ליד** - כל מי שממלא טופס
- 🖱️ **לחיצות CTA** - "Start Free Trial", "Watch Demo"
- 📞 **לחיצות WhatsApp** - כפתור WhatsApp
- 📅 **הזמנת דמו** - כפתור Calendly
- 📱 **לחיצות רשתות חברתיות**

---

## 📊 האירועים שנשלחים

### Lead Submission (הכי חשוב!)

```javascript
{
  event: 'lead_submission',
  event_category: 'Lead Generation',
  event_action: 'Form Submit',
  event_label: '/contact',        // דף המקור
  lead_source: 'instagram',       // UTM source
  lead_page: '/contact',          // איזה דף
  user_email: 'danny@example.com',
  utm_source: 'instagram',
  utm_medium: 'social',
  utm_campaign: 'winter2024',
  company_name: 'סטודיו דני',
  full_name: 'דני אבישר'
}
```

### CTA Clicks

```javascript
{
  event: 'cta_click',
  event_category: 'CTA',
  event_action: 'Click',
  event_label: 'Start Free Trial',
  cta_location: 'Hero Section'
}
```

### Demo Booking

```javascript
{
  event: 'demo_booking',
  event_category: 'Conversion',
  event_action: 'Demo Book',
  event_label: 'calendly',
  value: 1
}
```

---

## 🔧 איך להגדיר ב-GTM

### 1. חיבור ל-Google Analytics

1. כנס ל-GTM: `tagmanager.google.com`
2. תג חדש → Google Analytics: GA4 Configuration
3. **Measurement ID**: הכנס את ה-GA4 ID שלך
4. **Trigger**: All Pages

### 2. יצירת Conversions

1. ב-Google Analytics → Conversions
2. צור אירוע חדש:
   - **Event name**: `lead_submission`
   - **Mark as conversion**: כן

### 3. מעקב UTM מפורט

```javascript
// GTM Variable - Page URL
// GTM Variable - UTM Source
// GTM Variable - UTM Medium
// GTM Variable - UTM Campaign
```

---

## 📈 דוחות שתוכל לקבל

### 1. Lead Sources Report

- **פייסבוק**: 45 ליידים
- **גוגל**: 32 ליידים
- **אינסטגרם**: 28 ליידים
- **ישיר**: 15 ליידים

### 2. Page Performance

- **דף בית**: 12% conversion rate
- **דף Features**: 8% conversion rate
- **דף Contact**: 25% conversion rate

### 3. Campaign ROI

- **winter2024**: 50 ליידים → 5 לקוחות → 25,000₪
- **summer2024**: 35 ליידים → 3 לקוחות → 15,000₪

---

## 🎯 Remarketing באמצעות GTM

### 1. Audiences ב-GA4

- **מי שמילא טופס** - 180 ימים
- **מי שלחץ על CTA** - 90 ימים
- **מי שראה דמו** - 365 ימים

### 2. Facebook Pixel Setup

1. GTM → New Tag → Custom HTML
2. הכנס Facebook Pixel Code
3. Trigger: All Pages + Lead Events

### 3. Google Ads Conversion

1. GTM → New Tag → Google Ads Conversion Tracking
2. **Conversion ID**: מ-Google Ads
3. **Trigger**: lead_submission event

---

## 🔍 Debug & Testing

### 1. GTM Preview Mode

```
1. GTM → Preview
2. הכנס URL: localhost:8899
3. בדוק שכל האירועים עובדים
```

### 2. Real-time ב-GA4

```
1. GA4 → Realtime
2. מלא טופס באתר
3. ראה את האירוע ב-realtime
```

### 3. Console Log

כל אירוע נכתב גם ל-console:

```
📊 GTM Event pushed: {event: "lead_submission", ...}
```

---

## 💡 טיפים מתקדמים

### 1. Enhanced Ecommerce

אם תוסיף מחירים:

```javascript
trackPurchase({
  transaction_id: "12345",
  value: 2500,
  currency: "ILS",
  items: [
    {
      item_name: "Spectra Pro Plan",
      price: 2500,
      quantity: 1,
    },
  ],
});
```

### 2. Scroll Depth

```javascript
// בקומפוננט
useEffect(() => {
  const { trackScrollDepth } = useGTM();
  // Logic for scroll tracking
}, []);
```

### 3. Video Tracking

```javascript
// בקומפוננט וידאו
const { trackVideoPlay, trackVideoPause } = useGTM();

onPlay={() => trackVideoPlay('Hero Video', 'Main Page')}
onPause={(time) => trackVideoPause('Hero Video', time)}
```

---

## 🎯 המטרה: ROI מדויק

עם המערכת הזו תוכל לענות על:

- **איך אנשים מגיעים לאתר?** (UTM tracking)
- **איזה דף הכי יעיל?** (page tracking)
- **איזה קמפיין משתלם?** (campaign ROI)
- **מה הלקוחות עושים באתר?** (behavior flow)

**תוצאה**: החלטות שיווק מבוססות נתונים 📊✨
