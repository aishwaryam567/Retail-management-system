# 🚀 Complete Setup & Testing Guide

**Objective:** Get the retail management system running end-to-end  
**Estimated Time:** 30-45 minutes  
**Prerequisites:** Node.js 18+, Supabase account, Git

---

## STEP 1: Environment Configuration (5 minutes)

### 1.1 Create Backend .env File

```bash
cd Backend
```

Create a new file named `.env` with the following:

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_random_secret_key_minimum_32_characters_long
```

**How to get Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` → paste as `SUPABASE_URL`
5. Copy `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY`
6. Copy `anon public` key → paste as `SUPABASE_ANON_KEY`

**Generate JWT_SECRET:**
```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# On Mac/Linux:
openssl rand -base64 32
```

### 1.2 Create Frontend .env.local File

```bash
cd Frontend
```

Create a new file named `.env.local` with:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## STEP 2: Install Dependencies (5 minutes)

### 2.1 Backend Dependencies

```bash
cd Backend
npm install
```

**Expected output:** Should show all packages installed with no errors.

**Verify installation:**
```bash
npm list | grep -E "express|bcryptjs|cors|dotenv|jsonwebtoken|@supabase"
```

### 2.2 Frontend Dependencies

```bash
cd Frontend
npm install
```

**Expected output:** All dependencies installed successfully.

---

## STEP 3: Database Setup (10 minutes)

### 3.1 Create Tables

1. Open Supabase dashboard → Your project
2. Go to **SQL Editor** → Click **"New Query"**
3. Copy entire contents of `db/migrations/001_create_tables.sql`
4. Paste into the SQL Editor
5. Click **"Run"** button

**Expected output:**
```
Executing query...
✓ Success. No rows returned
```

**Verify tables created:**
In SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these 10 tables:
- audit_logs
- categories
- customers
- invoice_items
- invoices
- products
- purchases
- stock_movements
- suppliers
- users

### 3.2 Create Initial Admin User

In SQL Editor, run:
```sql
INSERT INTO users (email, full_name, role)
VALUES (
  'owner@example.com',
  'Store Owner',
  'owner'
);
```

Note the UUID that was created. You'll need it if you want to modify the user later.

### 3.3 Create Sample Data

**Categories:**
```sql
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Accessories', 'Phone and laptop accessories'),
('Clothing', 'Apparel and fashion items'),
('Home & Kitchen', 'Home appliances and kitchen items'),
('Books', 'Physical and digital books');
```

**Products:**
```sql
INSERT INTO products (sku, name, description, hsn_code, gst_rate, 
  purchase_price_paise, selling_price_paise, unit, category_id, 
  current_stock, reorder_level)
SELECT 
  'SKU-' || LPAD(row_number()::text, 4, '0'),
  items.name,
  'Sample product for testing',
  '9015',
  18.00,
  (random() * 50000)::bigint,
  (random() * 100000)::bigint,
  'pc',
  (SELECT id FROM categories LIMIT 1),
  (random() * 100)::integer,
  20
FROM (
  VALUES
    ('Laptop'),
    ('Mobile Phone'),
    ('USB Cable'),
    ('Phone Case'),
    ('Screen Protector'),
    ('Headphones'),
    ('Power Bank'),
    ('Keyboard')
) AS items(name);
```

**Sample Customers:**
```sql
INSERT INTO customers (name, phone, email, loyalty_points) VALUES
('Rajesh Kumar', '9876543210', 'rajesh@example.com', 100),
('Priya Sharma', '9876543211', 'priya@example.com', 250),
('John Smith', '9876543212', 'john@example.com', 50),
('Amit Patel', '9876543213', 'amit@example.com', 175),
('Neha Verma', '9876543214', 'neha@example.com', 320);
```

---

## STEP 4: Start Backend Server (3 minutes)

```bash
cd Backend
npm run dev
```

**Expected output:**
```
✅ Server is running on port 3000
🌐 API URL: http://localhost:3000
📊 Health Check: http://localhost:3000/health/db
```

**Test the server is running:**
```bash
# In a new terminal, run:
curl http://localhost:3000/health/db

# Expected response:
{"ok":true,"db":true,"message":"Database connected"}
```

If you see errors:
- **"Cannot find module"** → Run `npm install` again
- **"SUPABASE_URL is not set"** → Check `.env` file has correct values
- **"Connection refused"** → Supabase URL might be wrong

---

## STEP 5: Start Frontend Server (3 minutes)

```bash
cd Frontend
npm run dev
```

**Expected output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Test the frontend is running:**
- Open http://localhost:5173 in your browser
- You should see the login page

---

## STEP 6: Complete Testing Checklist

### 6.1 Health Check
```bash
# Test 1: Backend is running
curl http://localhost:3000
# Expected: JSON with endpoint list

# Test 2: Database connection
curl http://localhost:3000/health/db
# Expected: {"ok":true,"db":true,"message":"Database connected"}
```

### 6.2 Authentication Testing

**Test 3: Login (Success)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "any_password"
  }'

# Expected response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "owner@example.com",
    "role": "owner",
    "full_name": "Store Owner"
  },
  "token": "eyJhbGc..."
}
```

**Test 4: Login (Invalid Email)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'

# Expected: {"error":"Invalid email or password"}
```

**Test 5: Get Current User (Protected)**
```bash
# First, get a token from login test above
TOKEN="paste_token_from_login_response_here"

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: User details
```

### 6.3 Product API Testing

**Test 6: List Products**
```bash
TOKEN="your_token_here"

curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Expected: List of products with pagination
```

**Test 7: Get Single Product**
```bash
TOKEN="your_token_here"
PRODUCT_ID="id_from_products_list"

curl http://localhost:3000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: Single product details
```

### 6.4 Invoice API Testing

**Test 8: Create Invoice (Sale)**
```bash
TOKEN="your_token_here"
PRODUCT_ID="id_from_products_list"
CUSTOMER_ID="id_from_customers"

curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "'$CUSTOMER_ID'",
    "items": [
      {
        "product_id": "'$PRODUCT_ID'",
        "qty": 2,
        "discount": 0
      }
    ],
    "discount": 0
  }'

# Expected: Invoice created successfully with ID
```

**Verify stock was reduced:**
- Check backend console for stock updates
- Query database: `SELECT current_stock FROM products WHERE id = ...`

### 6.5 Frontend Testing

**Test 9: Frontend Login**
1. Open http://localhost:5173
2. Enter credentials:
   - Email: `owner@example.com`
   - Password: `any_password` (for testing, any password works)
3. Click "Login"
4. **Expected:** Redirected to Dashboard

**Test 10: Dashboard Load**
1. After login, you should see:
   - Sidebar with navigation menu
   - Dashboard with stat cards
   - "Today's Sales", "Net Revenue", "Total Products", "Total Customers"
2. Open DevTools (F12) → Network tab
3. **Expected:** API calls to `/api/dashboard` show success

**Test 11: Logout**
1. Click user profile or logout button
2. **Expected:** Redirected to login page, token cleared

### 6.6 Error Handling

**Test 12: Missing Authorization Header**
```bash
curl http://localhost:3000/api/products
# Expected: {"error":"Access token required"}
```

**Test 13: Invalid Token**
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer invalid_token_here"
# Expected: {"error":"Invalid token"}
```

**Test 14: 404 Endpoint**
```bash
curl http://localhost:3000/api/nonexistent
# Expected: {"error":"Endpoint not found"}
```

---

## Common Issues & Fixes

### Issue 1: "CORS error" in frontend console
**Solution:**
- Ensure `VITE_API_URL` is set correctly in Frontend/.env.local
- Check backend CORS is enabled in server-fixed.js
- Clear browser cache (Ctrl+Shift+Delete)

### Issue 2: "Cannot connect to Supabase"
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Backend/.env
- Check URL format: `https://xxxxx.supabase.co`
- Test connectivity: `curl https://YOUR_SUPABASE_URL`

### Issue 3: "Port 3000 already in use"
**Solution:**
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Issue 4: "Module not found" errors
**Solution:**
```bash
cd Backend
npm install  # Install all dependencies
npm list     # Verify packages are installed
```

### Issue 5: "Database tables don't exist"
**Solution:**
1. Go to Supabase SQL Editor
2. Copy `db/migrations/001_create_tables.sql`
3. Run the entire SQL script
4. Verify with: `SELECT COUNT(*) FROM users;`

---

## 🧪 Advanced Testing

### Using Postman (Recommended)

1. Download Postman: https://www.postman.com/downloads/
2. Create new collection: "Retail Management API"
3. Create these requests:

**Request 1: Login**
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "owner@example.com",
  "password": "any_password"
}
```
- Save the response token

**Request 2: List Products**
- Method: GET
- URL: `http://localhost:3000/api/products`
- Headers:
  - Authorization: `Bearer YOUR_TOKEN_HERE`

**Request 3: Create Invoice**
- Method: POST
- URL: `http://localhost:3000/api/invoices`
- Headers:
  - Authorization: `Bearer YOUR_TOKEN_HERE`
  - Content-Type: `application/json`
- Body (JSON):
```json
{
  "customer_id": "customer_uuid_here",
  "items": [
    {
      "product_id": "product_uuid_here",
      "qty": 1,
      "discount": 0
    }
  ],
  "discount": 0
}
```

---

## 📊 Expected Results Summary

### After Step 1-3 (Database Ready)
- [ ] 10 tables exist in Supabase
- [ ] 1 admin user created
- [ ] Sample products, categories, customers inserted

### After Step 4 (Backend Running)
- [ ] Backend starts without errors
- [ ] `/health/db` returns success
- [ ] All API routes are registered

### After Step 5 (Frontend Running)
- [ ] Frontend loads at http://localhost:5173
- [ ] Login page is visible
- [ ] DevTools shows no JS errors

### After Step 6 (Testing Complete)
- [ ] All 14 tests pass
- [ ] Login works with valid credentials
- [ ] Products can be queried
- [ ] Invoices can be created
- [ ] Stock updates automatically
- [ ] Frontend properly shows data

---

## 🎯 What Works Now

✅ **Backend:**
- User authentication (login/register)
- Product CRUD operations
- Category management
- Customer management
- Supplier management
- Invoice creation with GST calculation
- Stock movement tracking
- Reports (sales, GST, top products)
- Dashboard analytics

✅ **Frontend:**
- Login/Register pages
- Dashboard with stats
- Protected routes
- Navigation sidebar
- Auth context management

✅ **Database:**
- All 10 tables with proper relationships
- Data integrity constraints
- Audit logging structure

---

## 📝 What's Pending

🔄 **In Progress:**
- Password hashing (currently accepts any password for testing)
- PDF invoice generation
- Email notifications
- Realtime stock updates
- CSV/Excel export
- Role-based access control enforcement
- RLS (Row Level Security) policies
- Comprehensive unit tests

---

## 🚨 Critical Next Steps

1. **Test the setup** by following Steps 1-6 above
2. **Report any issues** found during testing
3. **Fix password authentication** to use bcryptjs properly
4. **Implement PDF generation** for invoices
5. **Add email notifications** for orders
6. **Setup CI/CD pipeline** for automated testing and deployment

---

## 💡 Tips

- **Use Postman or Thunder Client** for API testing instead of curl
- **Keep the browser DevTools open** to see network requests
- **Check backend console logs** for request/response details
- **Use Supabase SQL Editor** to verify data was inserted correctly
- **Restart servers** if you make changes to code

---

**Status:** Ready to begin setup  
**Difficulty:** Beginner-Friendly  
**Estimated Completion:** 45 minutes  
**Support:** Check CURRENT_STATE_AND_NEXT_STEPS.md for detailed troubleshooting
