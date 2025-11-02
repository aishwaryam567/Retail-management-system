# 🔧 CORS Error Fix

## Issue
The frontend (localhost:5173) can't connect to backend (localhost:3000) due to CORS.

## Root Cause
You're using the wrong server file! `server.js` doesn't have CORS or routes configured.

---

## ✅ Solution (Choose ONE):

### Option 1: Use server-week3.js (RECOMMENDED)

This file has CORS and all routes already configured!

**Step 1:** Update package.json to use the correct server file:

Edit **Backend/package.json**:
```json
{
  "scripts": {
    "start": "node server-week3.js",
    "dev": "nodemon server-week3.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

**Step 2:** Install cors package (if not installed):
```bash
cd Backend
npm install cors bcrypt jsonwebtoken
```

**Step 3:** Restart backend:
```bash
npm run dev
```

---

### Option 2: Update server.js

If you want to keep using server.js, you need to:

**Step 1:** Install cors:
```bash
cd Backend
npm install cors bcrypt jsonwebtoken
```

**Step 2:** Replace **Backend/server.js** with **Backend/server-week3.js** content

**Step 3:** Restart backend:
```bash
npm run dev
```

---

## ✅ Verify Fix

After restarting backend, you should see:
```
Server is running on port 3000
```

Then test frontend login at: http://localhost:5173

---

## 📝 What Changed

**server-week3.js** has:
- ✅ CORS enabled
- ✅ All API routes (/api/auth, /api/products, etc.)
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Health check endpoint

**server.js** only has:
- ❌ No CORS
- ❌ No API routes
- ❌ Basic setup only

---

## 🚀 Quick Command

```bash
cd Backend
npm install cors bcrypt jsonwebtoken
npm run dev
```

Then refresh frontend and try logging in!
