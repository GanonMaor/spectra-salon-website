# 🔧 Pipeline Debug Guide - Fix Creation Issues

## 🚨 **בעיה: "New Pipeline" לא יוצר פייפליין**

### 🔍 **Debug Steps:**

#### **1. בדוק Console Logs:**

פתח Developer Tools (F12) ובדוק:

```javascript
// Console tab - צריך לראות:
🚀 Creating pipeline: {name: "Test Pipeline", description: "..."}
📡 API Response status: 201
✅ Pipeline created: {id: X, name: "Test Pipeline", ...}

// אם רואה שגיאות:
❌ Network error: ...
❌ API Error: {error: "..."}
```

#### **2. בדוק Network Tab:**

- לך ל-Network tab
- נסה ליצור פייפליין
- חפש request ל-`pipeline/pipelines`
- בדוק:
  - **Status Code**: צריך להיות 201
  - **Request Headers**: `Authorization: Bearer ...`
  - **Request Body**: `{"name":"...","description":"..."}`
  - **Response**: `{"pipeline": {...}}`

#### **3. בדוק אם יש טוקן תקין:**

```javascript
// בConsole:
localStorage.getItem("authToken");
// צריך להחזיר JWT token ולא null
```

#### **4. בדוק שהמשתמש הוא Admin:**

```javascript
// בConsole:
fetch("/.netlify/functions/auth/me", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);

// צריך להחזיר: {role: "admin", ...}
```

### 🛠️ **פתרונות נפוצים:**

#### **אם אין טוקן או לא Admin:**

```sql
-- עדכן את המשתמש להיות Admin
UPDATE public.users SET role='admin' WHERE email='your-email@domain.com';
```

#### **אם הAPI לא מגיב:**

```bash
# בדוק שהשרת רץ
netlify dev --port 8888

# בדוק שהפונקציה קיימת
ls netlify/functions/pipeline.js
```

#### **אם יש שגיאת 500:**

```bash
# בדוק logs בטרמינל של netlify dev
# צריך לראות:
🔍 Debug: {method: "POST", path: "/pipelines", pathSegments: ["pipelines"]}
💾 Creating pipeline in DB: {...}
```

#### **אם שגיאת Database:**

```bash
# בדוק שהDB schema קיים
echo "SELECT COUNT(*) FROM public.pipelines;" | node scripts/sql-terminal.js

# אם אין טבלה, הרץ:
node scripts/setup-pipeline-db.js
```

### 🧪 **בדיקות מהירות:**

#### **1. בדוק API ידנית:**

```bash
# קבל טוקן
TOKEN=$(curl -s -X POST http://localhost:8888/.netlify/functions/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"Passw0rd!"}' | jq -r .token)

# נסה ליצור פייפליין
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Pipeline","description":"Test description"}' \
  http://localhost:8888/.netlify/functions/pipeline/pipelines | jq

# צריך להחזיר:
# {"pipeline": {"id": X, "name": "Test Pipeline", ...}}
```

#### **2. בדוק שהפייפליין נוצר בDB:**

```sql
SELECT * FROM public.pipelines ORDER BY created_at DESC LIMIT 5;
```

### 🔥 **Quick Fix Commands:**

#### **אם הכל נראה תקין אבל עדיין לא עובד:**

```bash
# 1. נקה cache
rm -rf .netlify/functions-internal
rm -rf node_modules/.cache

# 2. התקן מחדש
npm install

# 3. בנה מחדש
npm run build

# 4. הפעל מחדש
pkill -f 'netlify dev'
netlify dev --port 8888
```

### 📊 **Expected Behavior:**

#### **✅ Success Flow:**

1. לחיצה על "New Pipeline"
2. מודל נפתח עם שדות
3. מילוי שם (חובה) ותיאור (אופציונלי)
4. לחיצה על "Create Pipeline"
5. Loading spinner מוצג
6. מודל נסגר
7. פייפליין חדש מופיע ברשימה
8. פייפליין נבחר אוטומטית

#### **❌ Error Indicators:**

- Alert עם הודעת שגיאה
- Console logs עם פרטים
- Network tab עם status code שגוי
- מודל לא נסגר

### 🎯 **Most Common Issues:**

1. **No Admin Role**: המשתמש לא Admin
2. **No Token**: לא מחובר או טוקן פג
3. **DB Not Setup**: טבלאות לא קיימות
4. **Server Not Running**: netlify dev לא רץ
5. **Network Issues**: CORS או connection

### 💡 **Pro Tips:**

- **תמיד בדוק Console** לפני כל דבר אחר
- **Network tab** מראה את הבעיה האמיתית
- **DB queries** בsql-terminal לבדיקה מהירה
- **Restart server** פותר הרבה בעיות cache

## 🎉 **אחרי התיקון:**

המערכת תעבוד חלק עם:

- ✅ יצירת פייפליינים חדשים
- ✅ יצירת שלבים חדשים
- ✅ Drag & drop בין שלבים
- ✅ Pin mode לאונבורדינג
- ✅ KPIs בזמן אמת

**Pipeline System - Debug Complete!** 🚀
