# 🚀 Quick Start Guide

## Current Status

✅ **Week 1 (Days 1-4) Complete!**
- All backend models created (10 files)
- Utilities for pricing & GST calculations
- Authentication & error handling middleware
- Files ready to be organized

## Next: Complete Week 1 Setup

### Step 1: Organize Files (5 minutes)

Open PowerShell in the Backend folder and run:

```powershell
cd Backend
.\organize-files.ps1
```

Or manually run:
```bash
cd Backend
mkdir utils middleware routes services
# Then move files as per SETUP_INSTRUCTIONS.md
```

### Step 2: Install Dependencies (2 minutes)

```bash
cd Backend
npm install jsonwebtoken bcryptjs cors
npm install --save-dev nodemon
```

### Step 3: Update Environment Variables (1 minute)

Edit `Backend/.env` and add:

```env
JWT_SECRET=your_random_secret_key_change_this
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Update package.json (1 minute)

Add to scripts section:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 5: Test the Server (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000/health/db

Should see: `{"ok":true,"db":true}`

---

## What's Created So Far

### ✅ Backend Models (10 files)
All database operations ready:
- Users, Products, Categories
- Customers, Suppliers
- Invoices, Invoice Items
- Purchases, Stock Movements
- Audit Logs

### ✅ Utilities (2 files)
- Price conversion (rupees ↔ paise)
- GST calculations (CGST/SGST)
- Invoice totals calculator

### ✅ Middleware (3 files)
- JWT authentication
- Role-based authorization
- Global error handling
- Input validation

---

## What's Next (Days 5-7)

I'll create:
1. **Authentication Routes** (`POST /api/auth/login`, `/register`)
2. **Update server.js** with routes and error handler
3. **Test authentication** with Postman

Then Week 2:
- Product API routes
- Customer/Supplier routes
- Invoice creation API
- Sales system with stock updates

---

## Project Structure

```
Backend/
├── db/
│   ├── models/ (10 model files) ✅
│   └── supabaseClient.js ✅
├── utils/ (2 utility files) ✅
├── middleware/ (3 middleware files) ✅
├── routes/ (to be created)
├── services/ (to be created)
├── .env ✅
└── server.js ✅

Frontend/
├── src/
│   ├── App.jsx ✅
│   └── main.jsx ✅
├── package.json ✅
└── vite.config.js ✅
```

---

## Resources

- **Implementation Plan:** `IMPLEMENTATION_PLAN.md` (full 8-week plan)
- **Week 1 Progress:** `WEEK1_PROGRESS.md` (detailed checklist)
- **Setup Instructions:** `Backend/SETUP_INSTRUCTIONS.md`
- **Database Schema:** `db/migrations/001_create_tables.sql`

---

## Commands Reference

### Backend
```bash
cd Backend
npm run dev          # Start development server
npm start            # Start production server
```

### Frontend
```bash
cd Frontend
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
```

---

## Need Help?

1. Check `IMPLEMENTATION_PLAN.md` for detailed week-by-week guide
2. Check `WEEK1_PROGRESS.md` for current status
3. Check `Backend/SETUP_INSTRUCTIONS.md` for file organization

---

**Let's continue!** Once you've organized the files and installed dependencies, let me know and I'll create the authentication routes! 🚀
