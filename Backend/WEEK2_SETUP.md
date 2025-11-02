# 🚀 Week 2 Setup Guide - Core API Endpoints

## What's New in Week 2

I've created complete CRUD APIs for:
- ✅ Products (with price conversion, GST, low stock alerts)
- ✅ Categories (simple CRUD)
- ✅ Customers (with loyalty points, purchase history)
- ✅ Suppliers (with purchase history)

**Total new files:** 5 files (~1,500 lines of code)

---

## Step 1: Organize New Route Files (2 minutes)

Run in Backend folder:

```bash
# Move route files to routes folder
move products-routes.js routes\products.js
move categories-routes.js routes\categories.js
move customers-routes.js routes\customers.js
move suppliers-routes.js routes\suppliers.js

# Update server.js
copy server-week2.js server.js
```

Or use PowerShell:
```powershell
Move-Item products-routes.js routes\products.js
Move-Item categories-routes.js routes\categories.js
Move-Item customers-routes.js routes\customers.js
Move-Item suppliers-routes.js routes\suppliers.js
Copy-Item server-week2.js server.js -Force
```

---

## Step 2: Restart Server

```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 3000
📍 API: http://localhost:3000
🏥 Health: http://localhost:3000/health/db

📦 Available Endpoints:
   🔐 Auth:       /api/auth
   📦 Products:   /api/products
   📁 Categories: /api/categories
   👥 Customers:  /api/customers
   🏭 Suppliers:  /api/suppliers

✅ Ready to accept requests!
```

---

## API Endpoints Summary

### 🔐 Authentication (Week 1)
- POST   `/api/auth/register` - Register user
- POST   `/api/auth/login` - Login
- GET    `/api/auth/me` - Get current user

### 📦 Products
- GET    `/api/products` - List products (with pagination, search, filter)
- GET    `/api/products/:id` - Get single product
- GET    `/api/products/low-stock` - Get low stock products
- POST   `/api/products` - Create product (admin/owner)
- PUT    `/api/products/:id` - Update product (admin/owner)
- DELETE `/api/products/:id` - Delete product (owner only)

### 📁 Categories
- GET    `/api/categories` - List all categories
- GET    `/api/categories/:id` - Get single category
- POST   `/api/categories` - Create category (admin/owner)
- PUT    `/api/categories/:id` - Update category (admin/owner)
- DELETE `/api/categories/:id` - Delete category (owner)

### 👥 Customers
- GET    `/api/customers` - List customers (with pagination, search)
- GET    `/api/customers/:id` - Get single customer
- GET    `/api/customers/:id/invoices` - Get customer purchase history
- POST   `/api/customers` - Create customer (admin/owner/cashier)
- PUT    `/api/customers/:id` - Update customer (admin/owner/cashier)
- POST   `/api/customers/:id/loyalty` - Add/redeem loyalty points
- DELETE `/api/customers/:id` - Delete customer (owner)

### 🏭 Suppliers
- GET    `/api/suppliers` - List suppliers (with pagination, search)
- GET    `/api/suppliers/:id` - Get single supplier
- GET    `/api/suppliers/:id/purchases` - Get supplier purchase history
- POST   `/api/suppliers` - Create supplier (admin/owner/stock_manager)
- PUT    `/api/suppliers/:id` - Update supplier (admin/owner/stock_manager)
- DELETE `/api/suppliers/:id` - Delete supplier (owner)

---

## Quick Test Examples

### 1. Create a Category

```bash
POST http://localhost:3000/api/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic items"
}
```

### 2. Create a Product

```bash
POST http://localhost:3000/api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "sku": "LAPTOP001",
  "name": "Dell Laptop",
  "description": "15 inch display",
  "hsn_code": "8471",
  "gst_rate": 18,
  "purchase_price": 45000,
  "selling_price": 55000,
  "unit": "pcs",
  "category_id": 1,
  "current_stock": 10,
  "reorder_level": 3
}
```

**Note:** Prices are in rupees in the API, but stored as paise internally.

### 3. List Products with Search

```bash
GET http://localhost:3000/api/products?search=laptop&limit=10
Authorization: Bearer YOUR_TOKEN
```

### 4. Get Low Stock Products

```bash
GET http://localhost:3000/api/products/low-stock
Authorization: Bearer YOUR_TOKEN
```

### 5. Create a Customer

```bash
POST http://localhost:3000/api/customers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com"
}
```

### 6. Add Loyalty Points

```bash
POST http://localhost:3000/api/customers/{customer_id}/loyalty
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "points": 100,
  "reason": "Welcome bonus"
}
```

### 7. Create a Supplier

```bash
POST http://localhost:3000/api/suppliers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "ABC Distributors",
  "contact": {
    "phone": "1234567890",
    "email": "abc@example.com"
  },
  "gst_number": "27AABCU9603R1ZX",
  "address": "123 Market Street"
}
```

---

## Features Implemented

### Products API
- ✅ Full CRUD operations
- ✅ Automatic price conversion (rupees ↔ paise)
- ✅ GST rate validation (0, 5, 12, 18, 28)
- ✅ Low stock alerts
- ✅ Category filtering
- ✅ Search by name/SKU
- ✅ Pagination support
- ✅ Role-based access control
- ✅ Audit logging

### Categories API
- ✅ Simple CRUD operations
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Auto-set category_id to NULL in products when deleted

### Customers API
- ✅ Full CRUD operations
- ✅ Loyalty points management (add/redeem)
- ✅ Purchase history with totals
- ✅ Email validation
- ✅ Search by name/phone/email
- ✅ Pagination support
- ✅ Audit logging

### Suppliers API
- ✅ Full CRUD operations
- ✅ Purchase history with totals
- ✅ GST number field
- ✅ Contact info (JSON)
- ✅ Search by name
- ✅ Pagination support
- ✅ Audit logging

---

## Role-Based Access Control

### Product Routes
- **View:** All authenticated users
- **Create/Update:** admin, owner
- **Delete:** owner only

### Category Routes
- **View:** All authenticated users
- **Create/Update:** admin, owner
- **Delete:** owner only

### Customer Routes
- **View/Create/Update/Loyalty:** admin, owner, cashier
- **Delete:** owner only

### Supplier Routes
- **View/Create/Update:** admin, owner, stock_manager
- **Delete:** owner only

---

## What's Next (Week 2 Continued)

In the next session, we'll create:

### Invoice & Sales API
- `POST /api/invoices` - Create sale invoice
  - Automatic GST calculation
  - Automatic stock deduction
  - Invoice number generation
  - Multiple line items support
  
- `GET /api/invoices` - List invoices with filters
- `GET /api/invoices/:id` - Get invoice with items
- `POST /api/invoices/return` - Create return invoice

This is the most complex part as it involves:
- Invoice calculation service
- Stock movement creation
- Multiple table transactions
- GST computation per item

---

## Testing Checklist

- [ ] Can login and get token
- [ ] Can create categories
- [ ] Can list categories
- [ ] Can create products with GST
- [ ] Can list products
- [ ] Can search products
- [ ] Can get low stock products
- [ ] Can update product prices
- [ ] Can create customers
- [ ] Can add loyalty points
- [ ] Can view customer purchase history
- [ ] Can create suppliers
- [ ] Can view supplier purchase history
- [ ] All prices display correctly in rupees

---

## Common Issues

### "Cannot find module" error
**Solution:** Make sure route files are in `routes/` folder

### "Unauthorized" error
**Solution:** Include `Authorization: Bearer YOUR_TOKEN` header

### Price showing in paise
**Solution:** API should return prices in rupees. Check if conversion is working.

### "Forbidden: insufficient permissions"
**Solution:** User role doesn't have access. Use owner/admin account.

---

## Progress Update

**Week 2 (Days 8-11) Complete!** ✅

- ✅ Products API (full CRUD with GST)
- ✅ Categories API (simple CRUD)
- ✅ Customers API (with loyalty system)
- ✅ Suppliers API (with purchase history)

**Remaining Week 2 (Days 12-14):**
- [ ] Invoice creation API
- [ ] Sales service with stock updates
- [ ] Invoice calculations

**Total APIs:** 26 endpoints created!

---

## 📚 Documentation

- See `WEEK2_TESTS.http` for all test requests
- See `IMPLEMENTATION_PLAN.md` for full roadmap
- See `STATUS.md` for current progress

---

**Ready to continue?** Say "invoice API" and I'll create the sales/invoice system! 🚀
