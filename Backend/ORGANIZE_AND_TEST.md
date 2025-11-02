# 🚀 Quick Setup & Testing Guide

## Step 1: Organize Files (5 minutes)

Run this in PowerShell from Backend folder:

```powershell
cd Backend
.\organize-files.ps1
```

**Manual alternative:**
```bash
# Create folders
mkdir utils, middleware, routes, services

# Move utils
move pricing.js utils\
move invoiceCalculator.js utils\

# Move middleware
move auth.js middleware\
move errorHandler.js middleware\
move validator.js middleware\

# Move models
move categories-model.js db\models\categories.js
move customers-model.js db\models\customers.js
move suppliers-model.js db\models\suppliers.js
move invoices-model.js db\models\invoices.js
move invoiceItems-model.js db\models\invoiceItems.js
move purchases-model.js db\models\purchases.js
move stockMovements-model.js db\models\stockMovements.js
move auditLogs-model.js db\models\auditLogs.js

# Move auth routes
move auth-routes.js routes\auth.js

# Update server.js
copy server-updated.js server.js
```

---

## Step 2: Install Dependencies (2 minutes)

```bash
cd Backend
npm install jsonwebtoken bcryptjs cors
npm install --save-dev nodemon
```

---

## Step 3: Configure Environment (1 minute)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Edit `.env` file and add:**
```env
JWT_SECRET=<paste_generated_secret_here>
```

Your `.env` should look like:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_generated_secret_here
PORT=3000
NODE_ENV=development
```

---

## Step 4: Start Server (1 minute)

```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 3000
📍 API: http://localhost:3000
🏥 Health: http://localhost:3000/health/db
🔐 Auth: http://localhost:3000/api/auth

✅ Ready to accept requests!
```

---

## Step 5: Test the API (5 minutes)

### Test 1: Health Check
Open browser: http://localhost:3000/health/db

Should see: `{"ok":true,"db":true,"message":"Database connected"}`

### Test 2: Register a User

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@shop.com\",\"full_name\":\"Shop Owner\",\"password\":\"password123\",\"role\":\"owner\"}"
```

**Using Postman/Thunder Client:**
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "email": "owner@shop.com",
  "full_name": "Shop Owner",
  "password": "password123",
  "role": "owner"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "owner@shop.com",
    "full_name": "Shop Owner",
    "role": "owner"
  },
  "token": "eyJhbGc..."
}
```

✅ **Save the token!** You'll need it for protected routes.

### Test 3: Login

```json
POST http://localhost:3000/api/auth/login
{
  "email": "owner@shop.com",
  "password": "password123"
}
```

### Test 4: Get Current User (Protected)

```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your_token_from_login>
```

---

## ✅ Success Criteria

You've successfully completed Week 1 if:

- [ ] Server starts without errors
- [ ] Health check returns `ok: true`
- [ ] Can register new user and receive token
- [ ] Can login and receive token
- [ ] Can access `/api/auth/me` with token
- [ ] Get 401 error when accessing `/api/auth/me` without token

---

## 🎉 Week 1 Complete!

**What you've accomplished:**
- ✅ All database models created (10 files)
- ✅ Utilities for pricing & GST (2 files)
- ✅ Middleware for auth & validation (3 files)
- ✅ Authentication API working (login, register, me)
- ✅ JWT token generation & verification
- ✅ Role-based access control ready

**Total files:** 25+ files, ~12,000 lines of code!

---

## 🚀 What's Next (Week 2)

After authentication is working, we'll create:

1. **Product & Category APIs**
   - GET /api/products (list with pagination)
   - POST /api/products (create)
   - PUT /api/products/:id (update)
   - DELETE /api/products/:id (delete)
   - GET /api/categories (list)
   - POST /api/categories (create)

2. **Customer & Supplier APIs**
   - Full CRUD for customers
   - Full CRUD for suppliers
   - Customer purchase history
   - Loyalty points management

3. **Invoice Creation API**
   - POST /api/invoices (create sale)
   - Automatic GST calculation
   - Automatic stock updates
   - Invoice number generation

---

## 📚 Documentation References

- **Full Implementation Plan:** `IMPLEMENTATION_PLAN.md`
- **API Testing Guide:** `Backend/TEST_AUTH_API.md`
- **Week 1 Progress:** `WEEK1_PROGRESS.md`
- **Project Status:** `STATUS.md`

---

## 🐛 Common Issues & Solutions

### Issue: `Cannot find module 'jsonwebtoken'`
**Solution:** Run `npm install jsonwebtoken bcryptjs cors`

### Issue: `JWT_SECRET is not defined`
**Solution:** Add JWT_SECRET to `.env` file

### Issue: `Port 3000 is already in use`
**Solution:** 
```bash
# Find process
netstat -ano | findstr :3000
# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Issue: Database connection error
**Solution:** 
- Check Supabase credentials in `.env`
- Verify internet connection
- Check if tables exist in Supabase dashboard

---

## 💬 Ready to Continue?

Once everything is working, let me know and I'll create:
- Week 2 API routes (Products, Categories, Customers, Suppliers)
- Invoice creation service with automatic stock updates
- Postman collection for all endpoints

Just say: **"Week 1 complete, start Week 2"** 🚀
