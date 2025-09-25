# DB Snapshot – Neon (תאריך: 2025-08-17 23:30)

## תקציר מנהלים
- סה״כ טבלאות: 13
- טבלאות גדולות בולטות: messages (96 kB),clients (64 kB) support_tickets (64 kB),users (48 kB) signup_users (48 kB)
- האם לשולחן leads יש שדות אטריביושן חיוניים? landing/cta/signup: 0/0/0
- דופליקציות אימייל בלידים (top): 1

---

## [1] מלאי טבלאות (גודל ושורות מוערכות)
(ראה `reports/db_inventory_raw.txt`, קטע [1])

## [2] עמודות לכל טבלה
(ראה `reports/db_inventory_raw.txt`, קטע [2])

## [3] אילוצים (PK/FK/Unique)
(ראה `reports/db_inventory_raw.txt`, קטע [3])

## [4] מועמדים לארכוב/מחיקה (תמיכה/צ׳אט)
(ראה `reports/db_inventory_raw.txt`, קטע [4])

## [5] דופליקציות בלידים
(ראה `reports/db_inventory_raw.txt`, קטע [5] – Top 20)

## [6] קיום שדות אטריביושן בלידים
landing/cta/signup: 0/0/0; utm_campaign:1; gclid:0; fbclid:0

## [7] תצוגות לדשבורד – בדיקות מיידיות
- v_leads_recent: 10 שורות
- v_leads_by_signup_path_30d (Top 20):
  - /special-offer: 1
  - /lead-capture: 1
  - /signup?trial=true: 1
  - /features: 1
  - /contact: 1
  - /: 1
- v_leads_by_cta_path_30d (Top 20):
  - /special-offer: 1
  - /lead-capture: 1
  - /signup?trial=true: 1
  - /features: 1
  - /contact: 1
  - /: 1

## [8] טריגרים/פונקציות DB
(ראה `reports/db_inventory_raw.txt`, קטע [8])

---

### החלטות נדרשות (כן/לא)
1) האם לידים ייחודיים לפי **email**?  ☐ כן ☐ לא  
2) ארכוב טבלאות תמיכה לשבועיים לפני DROP?  ☐ כן ☐ לא  
3) להשאיר `signup_users` כטיוטות נפרדות או למזג ל־leads+lead_events?  ☐ טיוטות ☐ למזג
