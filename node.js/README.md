# TinyUrl Service

שירות Node.js לקיצור כתובות URL עם מעקב וטרגוט, מבוסס Express ו-MongoDB.

## הפעלה
1. התקן תלויות:
   ```bash
   npm install
   ```
2. העתק את הקובץ `.env.example` ל-`.env` ועדכן את הפרטים (בעיקר את MONGO_URI אם צריך).
3. הפעל את השרת:
   ```bash
   npm run dev
   ```
   או
   ```bash
   npm start
   ```

## Endpoints עיקריים
- POST `/api/users/register` — הרשמת משתמש
- POST `/api/users/login` — התחברות
- POST `/api/links` — יצירת קישור מקוצר
- GET  `/:id` — הפניה (redirect) לקישור המקורי
- GET  `/api/links/:id/stats` — סטטיסטיקות לפי קישור

## הערות
- נדרש MongoDB פעיל (לוקאלי או בענן)
- ניתן לבדוק את ה-API עם Postman או curl
