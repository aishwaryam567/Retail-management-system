# 📋 Retail Management System with GST Billing - Implementation Plan

## Project Overview
**Tech Stack:** 
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL (Supabase)
- Authentication: JWT

**Database Tables Created:**
- users, categories, products, customers, suppliers
- invoices, invoice_items, purchases
- stock_movements, audit_logs
- gst_reports (materialized view)

---

## 🗓️ Week 1: Backend Foundation (Days 1-7)

### Day 1-2: Project Structure & Models
**Status:** ✅ Partially Complete

#### Completed:
- ✅ Database connection (Supabase client)
- ✅ Basic models: `users.js`, `products.js`
- ✅ Server setup with health check

#### To Complete:
**Create folder structure:**
```
Backend/
├── db/
│   ├── models/           (models for all tables)
│   └── supabaseClient.js ✅
├── routes/               (API endpoints)
├── middleware/           (auth, validation, error handling)
├── utils/                (pricing, calculations)
├── services/             (business logic)
└── server.js             ✅
```

**Models to create:**
- [x] `categories.js` - Category CRUD
- [x] `customers.js` - Customer management with loyalty
- [x] `suppliers.js` - Supplier CRUD
- [x] `invoices.js` - Invoice creation & retrieval
- [x] `invoiceItems.js` - Invoice line items
- [x] `purchases.js` - Purchase orders
- [x] `stockMovements.js` - Stock ledger
- [x] `auditLogs.js` - Audit trail

**Files:** 8 model files (300-400 lines total)

---

### Day 3-4: Utilities & Middleware

#### Utilities (`utils/`)
**Create:**
1. **`pricing.js`** - Price conversion functions
   - `rupeesToPaise()` / `paiseToRupees()`
   - `calculateGST()` - Calculate GST from base price
   - `addGST()` / `removeGST()`
   - `splitGST()` - Split into CGST/SGST
   - `formatCurrency()` - Format display

2. **`invoiceCalculator.js`** - Invoice calculation engine
   - `calculateInvoiceTotals()` - Line items → totals
   - Handle discounts, GST per item
   - Return subtotal, tax, discount, total

3. **`validators.js`** - Input validation helpers
   - Email, phone validation
   - GST number format
   - Date range validation

**Files:** 3 utility files (~200 lines)

#### Middleware (`middleware/`)
**Create:**
1. **`auth.js`** - JWT authentication
   - `generateToken()` - Create JWT token
   - `verifyToken()` - Validate token
   - `authenticate()` - Middleware to protect routes
   - `authorize(roles)` - Role-based access control

2. **`errorHandler.js`** - Global error handling
   - Catch all errors
   - Format error responses
   - Log errors
   - `asyncHandler()` - Wrap async routes

3. **`validator.js`** - Request validation middleware
   - `validateRequired(fields)` - Check required fields
   - `validateEmail()`, `validateRole()`
   - `validateInvoiceType()`, `validateStockReason()`

4. **`rateLimiter.js`** - Rate limiting (optional)
   - Prevent API abuse

**Files:** 3-4 middleware files (~300 lines)

---

### Day 5-7: Authentication API

#### Install Dependencies
```bash
cd Backend
npm install jsonwebtoken bcryptjs cors
npm install --save-dev nodemon
```

#### Update `package.json` scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

#### Create Auth Routes (`routes/auth.js`)
**Endpoints:**
- `POST /api/auth/register` - Register new user
  - Input: email, full_name, password, role
  - Validate: email format, role
  - Hash password (bcryptjs)
  - Create user in DB
  - Return user + JWT token

- `POST /api/auth/login` - User login
  - Input: email, password
  - Verify credentials
  - Generate JWT token
  - Return user + token

- `GET /api/auth/me` - Get current user (protected)
  - Requires JWT token
  - Return user details

- `POST /api/auth/change-password` - Change password (protected)
  - Verify old password
  - Update to new password

**Files:** 1 route file (~150 lines)

#### Update `server.js`
```javascript
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use('/api/auth', authRoutes);

// Error handler (must be last)
app.use(errorHandler);
```

#### Environment Variables (`.env`)
```
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
JWT_SECRET=your_jwt_secret_change_this
PORT=3000
NODE_ENV=development
```

#### Testing
- Test user registration
- Test login with valid/invalid credentials
- Test protected routes
- Test role-based access

**Deliverables:**
- ✅ Complete backend structure
- ✅ All models functional
- ✅ Authentication system working
- ✅ Utilities for pricing & GST
- ✅ Error handling middleware

---

## 🗓️ Week 2: Core API Endpoints (Days 8-14)

### Day 8-9: Product & Category APIs

#### Create `routes/products.js`
**Endpoints:**
- `GET /api/products` - List all products
  - Query params: `limit`, `offset`, `search`, `category_id`
  - Include category info
  - Return paginated results

- `GET /api/products/:id` - Get single product
  - Include category, current stock
  - Return 404 if not found

- `POST /api/products` - Create product (admin/owner only)
  - Validate: required fields, GST rate
  - Convert prices to paise
  - Create product record
  - Log audit

- `PUT /api/products/:id` - Update product (admin/owner only)
  - Validate updates
  - Update record
  - Log audit

- `DELETE /api/products/:id` - Delete product (owner only)
  - Check if used in invoices
  - Soft delete or prevent deletion

- `GET /api/products/low-stock` - Low stock alerts
  - Where current_stock <= reorder_level
  - Return list for dashboard

**Protect routes:** Use `authenticate` and `authorize` middleware

#### Create `routes/categories.js`
**Endpoints:**
- `GET /api/categories` - List all
- `POST /api/categories` - Create (admin/owner)
- `PUT /api/categories/:id` - Update (admin/owner)
- `DELETE /api/categories/:id` - Delete (owner)

**Files:** 2 route files (~400 lines)

---

### Day 10-11: Customer & Supplier APIs

#### Create `routes/customers.js`
**Endpoints:**
- `GET /api/customers` - List customers
  - Search by name, phone, email
  - Pagination
  
- `GET /api/customers/:id` - Get customer details
  - Include loyalty points

- `POST /api/customers` - Create customer
  - Validate email/phone
  
- `PUT /api/customers/:id` - Update customer

- `GET /api/customers/:id/invoices` - Customer purchase history
  - Join with invoices table
  - Show total spent, last purchase

- `POST /api/customers/:id/loyalty` - Add/redeem loyalty points

**Files:** 1 route file (~200 lines)

#### Create `routes/suppliers.js`
**Endpoints:**
- `GET /api/suppliers` - List suppliers
- `GET /api/suppliers/:id` - Get supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (owner only)

**Files:** 1 route file (~150 lines)

---

### Day 12-14: Invoice & Sales API (Complex)

#### Create `services/invoiceService.js`
Business logic for invoice creation:
```javascript
async function createSaleInvoice(data, user_id) {
  // 1. Generate invoice number
  // 2. Calculate totals using invoiceCalculator
  // 3. Create invoice record
  // 4. Create invoice items
  // 5. Update stock (create stock movements)
  // 6. Update product.current_stock
  // 7. Add loyalty points to customer (if applicable)
  // 8. Create audit log
  // 9. Return complete invoice
}
```

#### Create `routes/invoices.js`
**Endpoints:**
- `POST /api/invoices` - Create sale invoice
  - Input: customer_id, items[], discount
  - Call invoiceService.createSaleInvoice()
  - Return invoice with items

- `GET /api/invoices` - List invoices
  - Filter: type (sale/return), date range, customer
  - Include customer name
  - Pagination

- `GET /api/invoices/:id` - Get invoice details
  - Include all items with product details
  - Include customer info

- `POST /api/invoices/return` - Create return invoice
  - Reference original invoice
  - Reverse stock movements
  - Calculate return amount

- `GET /api/invoices/:id/pdf` - Generate PDF (Week 7)
  - Placeholder for now

**Files:** 1 service file, 1 route file (~500 lines total)

---

**Week 2 Deliverables:**
- ✅ Products & Categories API complete
- ✅ Customers & Suppliers API complete
- ✅ Invoice creation working with GST
- ✅ Stock movements auto-created
- ✅ All endpoints tested with Postman

---

## 🗓️ Week 3: Purchases, Stock & Reports (Days 15-21)

### Day 15-16: Purchase Order API

#### Create `services/purchaseService.js`
```javascript
async function createPurchaseOrder(data, user_id) {
  // 1. Create purchase record
  // 2. Create stock movements (positive qty)
  // 3. Update product.current_stock
  // 4. Create audit log
  // 5. Return purchase details
}
```

#### Create `routes/purchases.js`
**Endpoints:**
- `POST /api/purchases` - Create purchase order
  - Input: supplier_id, invoice_no, date, items[]
  - Call purchaseService.createPurchaseOrder()

- `GET /api/purchases` - List purchases
  - Filter by supplier, date range
  - Include supplier name

- `GET /api/purchases/:id` - Get purchase details

**Files:** 1 service file, 1 route file (~300 lines)

---

### Day 17-18: Stock Management API

#### Update `db/models/products.js`
Add functions:
- `updateStock(product_id, quantity)` - Update current_stock
- `getStockValue()` - Calculate total inventory value

#### Create `routes/stock.js`
**Endpoints:**
- `GET /api/stock/movements` - Stock movement ledger
  - Filter by product, date range, reason
  - Show running balance

- `POST /api/stock/adjustment` - Manual stock adjustment
  - Input: product_id, change_qty, reason, notes
  - Create stock movement with reason='adjustment'
  - Update product stock
  - Requires admin/owner role

- `GET /api/stock/valuation` - Inventory valuation report
  - Sum of (current_stock × purchase_price) for all products
  - Group by category

- `GET /api/stock/alerts` - Low stock alerts
  - Products below reorder level
  - For dashboard

**Files:** 1 route file (~200 lines)

---

### Day 19-21: Reports API

#### Create `services/reportService.js`
Complex queries for reports:
```javascript
async function getSalesSummary(from_date, to_date) {
  // Total sales, total GST, number of invoices
  // Group by date/week/month
}

async function getGSTReport(from_date, to_date) {
  // Use gst_reports materialized view
  // Refresh view if needed
  // Group by GST rate
  // Show taxable amount, CGST, SGST, total GST
}

async function getProfitReport(from_date, to_date) {
  // Compare selling_price vs purchase_price
  // Calculate gross profit per product
  // Total profit
}

async function getTopProducts(from_date, to_date, limit) {
  // Most sold products by quantity and value
}
```

#### Create `routes/reports.js`
**Endpoints:**
- `GET /api/reports/sales` - Sales summary
  - Query params: from_date, to_date, group_by (day/week/month)
  - Return total sales, GST collected, invoice count

- `GET /api/reports/gst` - GST report
  - Query params: from_date, to_date
  - Return breakdown by GST rate (5%, 12%, 18%, 28%)
  - Show taxable value, CGST, SGST, total GST

- `GET /api/reports/inventory` - Stock report
  - Current stock levels
  - Stock value
  - Low stock items

- `GET /api/reports/profit` - Profit analysis
  - Gross profit per product
  - Total profit
  - Profit margin %

- `GET /api/reports/top-products` - Best sellers
  - Query params: limit (default 10)
  - Sort by quantity or revenue

- `POST /api/reports/gst/refresh` - Refresh GST materialized view
  - Manual refresh trigger
  - Return success message

**Files:** 1 service file, 1 route file (~600 lines)

---

### Day 21: Dashboard API

#### Create `routes/dashboard.js`
**Endpoints:**
- `GET /api/dashboard/stats` - Dashboard statistics
  - Today's sales (total, count)
  - This week/month sales
  - Low stock count
  - Total customers
  - Recent invoices (last 5)
  - Top selling products today

- `GET /api/dashboard/charts` - Chart data
  - Sales trend (last 7/30 days)
  - Revenue by category
  - GST collected trend

**Files:** 1 route file (~200 lines)

---

**Week 3 Deliverables:**
- ✅ Purchase order system complete
- ✅ Stock management with adjustments
- ✅ Comprehensive reports API
- ✅ Dashboard API with real-time stats
- ✅ Backend fully functional

---

## 🗓️ Week 4: Frontend Foundation (Days 22-28)

### Day 22-23: Frontend Setup & Structure

#### Install Dependencies
```bash
cd Frontend
npm install react-router-dom axios
npm install @tanstack/react-query
npm install react-hook-form
npm install tailwindcss -D
npx tailwindcss init
```

Or use a UI library:
```bash
npm install @mui/material @emotion/react @emotion/styled
# OR
npm install antd
```

#### Folder Structure
```
src/
├── components/       (reusable components)
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── common/       (buttons, inputs, modals)
├── pages/            (route pages)
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Products/
│   ├── Customers/
│   ├── Suppliers/
│   ├── Invoices/
│   ├── Reports/
│   └── Settings/
├── services/         (API calls)
│   ├── api.js        (axios instance)
│   ├── auth.js
│   ├── products.js
│   └── ...
├── context/          (React context)
│   └── AuthContext.jsx
├── hooks/            (custom hooks)
│   └── useAuth.js
├── utils/            (helpers)
│   ├── pricing.js    (same as backend)
│   └── formatters.js
└── App.jsx
```

#### Create API Client (`services/api.js`)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Create Auth Context
```javascript
// context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch current user
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

### Day 24-25: Routing & Layout

#### Setup React Router (`App.jsx`)
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<NewInvoicePage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

#### Create Layout Component
```javascript
// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

### Day 26-28: Login & Dashboard

#### Create Login Page (`pages/Login.jsx`)
- Email/password form
- Call auth API
- Store token
- Redirect to dashboard
- Show errors

#### Create Dashboard (`pages/Dashboard.jsx`)
- Display key metrics:
  - Today's sales
  - This week/month sales
  - Low stock alerts count
  - Total customers
- Recent invoices table
- Sales chart (last 7 days)
- Quick action buttons
- Fetch data from `/api/dashboard/stats`

**Files:** ~500 lines (layout, login, dashboard)

---

**Week 4 Deliverables:**
- ✅ Frontend structure & routing
- ✅ Authentication UI working
- ✅ Dashboard with real-time stats
- ✅ Layout with sidebar navigation
- ✅ API integration setup

---

## 🗓️ Week 5: Product & Inventory UI (Days 29-35)

### Day 29-30: Products List Page

#### Create `pages/Products/ProductsList.jsx`
**Features:**
- Fetch products from API
- Display in table/grid
- Search by name/SKU
- Filter by category
- Pagination
- Actions: Edit, Delete
- "Add Product" button → modal/page

**Components:**
- ProductTable
- SearchBar
- FilterDropdown
- Pagination

---

### Day 31-32: Add/Edit Product

#### Create `pages/Products/ProductForm.jsx`
**Form fields:**
- SKU (auto-generate option)
- Name *
- Description
- Category (dropdown)
- HSN Code
- GST Rate (dropdown: 0, 5, 12, 18, 28)
- Purchase Price (₹) → convert to paise
- Selling Price (₹) → convert to paise
- Unit (pcs, kg, liter, etc.)
- Current Stock
- Reorder Level

**Features:**
- Form validation (react-hook-form)
- Price preview with GST
- Submit → POST/PUT API
- Success/error messages
- Close → back to list

---

### Day 33-34: Categories Management

#### Create `pages/Products/Categories.jsx`
- List categories
- Add/Edit/Delete inline or modal
- Simple CRUD interface

---

### Day 35: Stock Movements View

#### Create `pages/Products/StockMovements.jsx`
- Filter by product
- Show movement history
- Display: date, product, change, reason, user, balance
- Pagination

---

**Week 5 Deliverables:**
- ✅ Complete product management UI
- ✅ Category management
- ✅ Stock movement history
- ✅ Search & filter working

---

## 🗓️ Week 6: Sales & Invoicing UI (Days 36-42)

### Day 36-38: POS / New Invoice Page (Most Complex)

#### Create `pages/Invoices/NewInvoice.jsx`
**Layout:**
- Customer selection (dropdown with search or create new)
- Product search/barcode input
- Cart table:
  - Product, Qty, Unit Price, GST %, GST Amount, Total
  - Remove item button
- Summary panel:
  - Subtotal
  - Total GST
  - Discount (optional)
  - Grand Total
- Payment method (cash, card, UPI)
- "Generate Invoice" button

**Functionality:**
1. Search products (autocomplete)
2. Add to cart
3. Update quantity (auto-recalculate)
4. Remove items
5. Apply discount
6. Calculate totals (use pricing utils)
7. Submit → POST /api/invoices
8. Show success → print/download option
9. Reset form for next sale

**Components:**
- CustomerSelector
- ProductSearch
- CartTable
- CartItem
- SummaryPanel
- PaymentSelector

**Files:** ~600 lines

---

### Day 39-40: Invoice List & Details

#### Create `pages/Invoices/InvoicesList.jsx`
- Fetch invoices
- Display: invoice number, date, customer, total, status
- Filter by date range, type (sale/return)
- Search by invoice number
- Click → view details

#### Create `pages/Invoices/InvoiceDetails.jsx`
- Display full invoice
- Customer info
- Line items table
- Totals with GST breakdown
- Actions:
  - Print/Download PDF (Week 7)
  - Create return invoice
  - Email to customer (optional)

---

### Day 41-42: Returns & Refunds

#### Create `pages/Invoices/CreateReturn.jsx`
- Select original invoice
- Select items to return (partial or full)
- Calculate return amount
- Submit → POST /api/invoices/return
- Update stock automatically

---

**Week 6 Deliverables:**
- ✅ Functional POS interface
- ✅ Invoice creation with GST calculation
- ✅ Invoice list & details
- ✅ Return/refund system
- ✅ Real-time stock updates

---

## 🗓️ Week 7: Customers, Suppliers & Reports UI (Days 43-49)

### Day 43-44: Customers Management

#### Create `pages/Customers/CustomersList.jsx`
- Display customers table
- Search by name/phone
- Show loyalty points
- Add/Edit/Delete customers

#### Create `pages/Customers/CustomerForm.jsx`
- Name, Phone, Email, Address
- Form validation
- Submit → API

#### Create `pages/Customers/CustomerDetails.jsx`
- Customer info
- Purchase history (invoices)
- Total spent
- Loyalty points
- Add/redeem points

**Files:** ~400 lines

---

### Day 45: Suppliers Management

#### Create `pages/Suppliers/` (similar to Customers)
- SuppliersList
- SupplierForm
- SupplierDetails (with purchase history)

**Files:** ~300 lines

---

### Day 46-47: Purchase Orders UI

#### Create `pages/Purchases/PurchasesList.jsx`
- List purchases
- Filter by supplier, date

#### Create `pages/Purchases/NewPurchase.jsx`
- Select supplier
- Add products with quantities and prices
- Submit → POST /api/purchases
- Auto-update stock

**Files:** ~400 lines

---

### Day 48-49: Reports UI

#### Create `pages/Reports/ReportsPage.jsx`
**Tabs:**
1. **Sales Report**
   - Date range picker
   - Display: total sales, GST collected, invoice count
   - Chart: sales trend

2. **GST Report**
   - Date range
   - Table: GST rate, taxable value, CGST, SGST, total
   - Download CSV/Excel

3. **Inventory Report**
   - Current stock levels
   - Stock value
   - Low stock alerts

4. **Profit Report**
   - Product-wise profit
   - Total profit, profit margin %

5. **Top Products**
   - Best sellers by quantity/revenue

**Components:**
- DateRangePicker
- ReportTable
- SalesChart (use Chart.js or Recharts)
- ExportButton (CSV download)

**Files:** ~500 lines

---

**Week 7 Deliverables:**
- ✅ Customer & supplier management complete
- ✅ Purchase order system
- ✅ Comprehensive reports UI
- ✅ Charts & visualizations
- ✅ CSV export functionality

---

## 🗓️ Week 8: Advanced Features & Polish (Days 50-56)

### Day 50-51: Invoice PDF Generation

#### Backend: Install dependencies
```bash
npm install pdfkit
```

#### Create `services/pdfService.js`
```javascript
const PDFDocument = require('pdfkit');
const { formatCurrency } = require('../utils/pricing');

async function generateInvoicePDF(invoiceId) {
  // 1. Fetch invoice with items
  // 2. Create PDF document
  // 3. Add header (company name, logo, GST number)
  // 4. Add invoice details (number, date, customer)
  // 5. Add items table
  // 6. Add totals (subtotal, CGST, SGST, total)
  // 7. Add footer (terms, signature)
  // 8. Return PDF buffer
}
```

#### Update `routes/invoices.js`
```javascript
router.get('/:id/pdf', authenticate, async (req, res) => {
  const pdf = await pdfService.generateInvoicePDF(req.params.id);
  res.contentType('application/pdf');
  res.send(pdf);
});
```

#### Frontend: Update InvoiceDetails.jsx
- Add "Download PDF" button
- Call `/api/invoices/:id/pdf`
- Trigger download

**Files:** ~300 lines

---

### Day 52: Barcode Scanner Integration

#### Install dependencies
```bash
npm install react-barcode-reader
# OR
npm install html5-qrcode
```

#### Update NewInvoice page
- Add barcode input field
- Scan → search product by SKU
- Auto-add to cart

**Optional:** Print barcode labels for products

---

### Day 53: Audit Log Viewer

#### Create `pages/Settings/AuditLogs.jsx`
- Fetch audit logs
- Display: date, user, action, object type, changes
- Filter by user, date, action type
- Pagination

---

### Day 54: User Management

#### Create `pages/Settings/Users.jsx`
- List users (owner/admin only)
- Add new user
- Change user role
- Deactivate user

#### Create `pages/Settings/Profile.jsx`
- View/edit current user profile
- Change password
- Update display name

---

### Day 55: Settings & Configuration

#### Create `pages/Settings/SettingsPage.jsx`
**Tabs:**
1. **Company Settings**
   - Company name
   - GST number
   - Address, phone, email
   - Logo upload (optional)

2. **Invoice Settings**
   - Invoice prefix
   - Terms & conditions
   - Default GST rate

3. **Notification Settings**
   - Email notifications
   - Low stock alerts threshold

4. **Backup & Export**
   - Export all data (CSV/JSON)
   - Import data

Store settings in a `settings` table or JSON config.

---

### Day 56: Testing & Bug Fixes

#### Testing Checklist:
- [ ] User registration/login
- [ ] CRUD operations (products, customers, suppliers)
- [ ] Invoice creation with GST calculation
- [ ] Stock movements update correctly
- [ ] Reports show accurate data
- [ ] PDF generation works
- [ ] Pagination works on all lists
- [ ] Search & filters work
- [ ] Role-based access enforced
- [ ] Error handling (network errors, validation)
- [ ] Mobile responsiveness (basic)

#### Performance:
- [ ] Optimize slow queries
- [ ] Add indexes if needed
- [ ] Lazy load large lists
- [ ] Cache frequently accessed data

#### UI Polish:
- [ ] Consistent styling
- [ ] Loading states
- [ ] Empty states
- [ ] Success/error toasts
- [ ] Confirm dialogs for delete actions

---

**Week 8 Deliverables:**
- ✅ PDF invoice generation
- ✅ Barcode scanning (optional)
- ✅ Audit logs viewer
- ✅ User management
- ✅ Settings page
- ✅ Fully tested application
- ✅ Production-ready

---

## 📦 Deployment (Post Week 8)

### Backend Deployment (Render/Railway/Heroku)
```bash
# .env production
DATABASE_URL=postgresql://...
JWT_SECRET=strong_random_secret
NODE_ENV=production
```

- Deploy to Render/Railway/Heroku
- Connect to Supabase (already hosted)
- Enable HTTPS
- Set up environment variables

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
```

- Deploy build folder to Vercel/Netlify
- Update API base URL in `services/api.js`
- Enable CORS on backend

### Database
- Supabase (already hosted)
- Run migrations
- Set up backups
- Monitor performance

---

## 📊 Feature Summary

### ✅ Must-Have Features (MVP)
- User authentication (JWT)
- Product management with categories
- Customer management
- Invoice creation with GST calculation
- Stock management (automatic)
- Basic reports (sales, GST, inventory)
- Dashboard with key metrics

### 🎯 Nice-to-Have Features
- Invoice PDF generation
- Barcode scanning
- Loyalty points system
- Return/refund handling
- Advanced reports (profit analysis)
- Audit logs
- User management with roles
- Email notifications
- CSV export for reports

### 🚀 Future Enhancements
- Mobile app (React Native)
- WhatsApp invoice sharing
- Payment gateway integration
- Multi-location support
- Advanced inventory (batch tracking, expiry dates)
- Supplier portal
- Customer portal
- Analytics dashboard (charts, trends)
- E-way bill generation
- GST return filing integration

---

## 📝 Notes & Best Practices

### Code Organization
- Keep models thin (just DB operations)
- Put business logic in services
- Validate inputs in middleware
- Handle errors globally
- Use async/await consistently

### Security
- Hash passwords (bcryptjs)
- Validate all inputs
- Use parameterized queries (Supabase handles this)
- Implement rate limiting
- Sanitize user inputs
- CORS configuration
- HTTPS in production

### Performance
- Use pagination for large lists
- Add database indexes
- Cache frequently accessed data
- Lazy load components
- Optimize images
- Minify production build

### Testing
- Test API endpoints with Postman
- Write unit tests (Jest)
- Test edge cases
- Test with different roles
- Load testing for production

### Documentation
- API documentation (Swagger/Postman)
- README with setup instructions
- Code comments for complex logic
- User manual for end users

---

## 🎯 Success Metrics

By the end of 8 weeks, you should have:
- ✅ Fully functional retail management system
- ✅ GST-compliant invoicing
- ✅ Automated stock management
- ✅ Comprehensive reporting
- ✅ User-friendly interface
- ✅ Role-based access control
- ✅ Production-ready application

---

## 📞 Support & Resources

### Learning Resources
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Supabase: https://supabase.com/docs
- JWT: https://jwt.io/

### Tools
- Postman (API testing)
- VS Code (IDE)
- Git (version control)
- Chrome DevTools (debugging)

---

**Good luck with your implementation! Follow this plan week by week, and you'll have a complete system in 8 weeks.** 🚀

**Questions or stuck? Review the plan, check documentation, or ask for help!**
