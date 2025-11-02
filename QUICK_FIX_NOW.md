# 🚨 QUICK FIX - Run These Commands NOW!

## The Problem
1. You're using the basic `server.js` which has no CORS or routes
2. Missing required npm packages (cors, bcrypt, jsonwebtoken)

## ✅ THE FIX (3 Commands)

### Step 1: Stop the backend server
Press `Ctrl+C` in the backend terminal

### Step 2: Install missing packages
```bash
cd Backend
npm install cors bcrypt jsonwebtoken nodemon
```

### Step 3: Restart backend (it will now use server-week3.js)
```bash
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server-week3.js`
Server is running on port 3000
```

### Step 4: Test frontend
Go to: http://localhost:5173
Try logging in with: owner@example.com / password123

---

## ✅ What Changed

**package.json** now points to `server-week3.js` which has:
- ✅ CORS enabled
- ✅ All API routes (/api/auth, /api/products, etc.)
- ✅ JWT authentication
- ✅ Error handling

---

## 🎯 Quick Copy-Paste

```bash
cd Backend
npm install cors bcrypt jsonwebtoken nodemon
npm run dev
```

Then refresh your browser and login! 🚀
