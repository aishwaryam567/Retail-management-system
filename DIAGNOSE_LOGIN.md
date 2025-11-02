# 🔍 Diagnose Login Issue

## Issue: Page refreshes when clicking Sign In

This usually means JavaScript is failing silently. Let's debug!

---

## ✅ Step-by-Step Diagnosis

### Step 1: Test Backend Directly

Open this file in your browser:
```
TEST_LOGIN.html
```

This will test:
1. ✅ Is backend running?
2. ✅ Is CORS working?
3. ✅ Can we login with test credentials?

---

### Step 2: Check Browser Console

1. Open frontend: `http://localhost:5173`
2. Press `F12` to open Developer Tools
3. Click **Console** tab
4. Try logging in
5. Look for:
   - **Red error messages**
   - **"API Base URL:"** log (should show http://localhost:3000/api)
   - **"Login attempt:"** log
   - **Any CORS errors**

**Take a screenshot and share!**

---

### Step 3: Verify Frontend is Running

In your Frontend terminal, you should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

If not, restart:
```bash
cd Frontend
npm run dev
```

---

### Step 4: Verify Backend is Running

In your Backend terminal, you should see:
```
✅ Server is running on port 3000
🌐 API URL: http://localhost:3000
```

If not, restart:
```bash
cd Backend
npm run dev
```

---

### Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Click **Network** tab
3. Try logging in
4. Look for a request to `localhost:3000/api/auth/login`

**What to look for:**

✅ **Good:** Request appears, Status: 200 or 401
❌ **Bad:** No request appears = JavaScript error
❌ **Bad:** Request failed = Backend not running or CORS issue

---

## 🐛 Common Issues & Solutions

### Issue 1: "CORS Error" in console
**Solution:** Backend must be using `server-fixed.js`
```bash
cd Backend
# Check package.json shows "dev": "nodemon server-fixed.js"
npm run dev
```

### Issue 2: No request in Network tab
**Solution:** JavaScript error - check Console for red errors

### Issue 3: "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:** Backend not running
```bash
cd Backend
npm run dev
```

### Issue 4: Backend shows error on startup
**Solution:** Missing route files - check error message

### Issue 5: Page just refreshes, no console errors
**Solution:** 
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Restart frontend: `cd Frontend && npm run dev`

---

## 🎯 Quick Checklist

Before trying to login, verify:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] No errors in backend terminal
- [ ] Browser console open (F12)
- [ ] TEST_LOGIN.html shows ✅ for health check

---

## 📸 What to Share

If still not working, share:

1. **Backend terminal output** (last 20 lines)
2. **Frontend console** (screenshot with F12 open)
3. **Network tab** (screenshot showing requests)
4. **TEST_LOGIN.html result** (screenshot)

---

## 🚀 Quick Test Command

Run this in a new terminal to test backend:
```bash
curl http://localhost:3000/health/db
```

Expected response:
```json
{"ok":true,"db":true,"message":"Database connected"}
```
