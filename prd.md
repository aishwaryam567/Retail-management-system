PRD & Development Plan

Project: All-in-One Retail Management System — GST Billing, Real-time Inventory, Analytics
Tech Stack: Frontend: React (Vite) + Tailwind CSS; Backend: Node.js + Express; Database/Auth: Supabase (Postgres + Auth); 

1. High-level Goals (what agent should deliver)

Production-ready API and frontend feature set for core retail flow: POS billing (GST-compliant), inventory management (real-time), and analytics dashboards.

Secure authentication + role-based access control (Owner, Admin, Cashier, Stock Manager).

Reliable data model with clear audit trails (stock movements, invoices, returns).

Automated alerts (low-stock) and exportable reports (PDF/CSV) incl. GST breakdowns.

Clean, modular code with tests and CI pipeline so the agent's output is deployable.

2. Assumptions

Supabase project exists, with Auth enabled and a Postgres DB.

Frontend and backend repos already initialized. If monorepo, follow provided structure; if separate repos, use same conventions.

Thermal printing will be implemented via PDF invoice export and a later integration with client printer drivers (out-of-scope for first deliverable).

No third-party paid services required (SMS/email can use Supabase SMTP or webhook placeholders).

3. Architecture (logical)

[Browser (React/Vite)] <---> [API Gateway (Express)] <---> [Supabase Postgres]
          |                                |
   Realtime (WebSocket/Supabase Realtime)  |---> Storage (Supabase Storage for receipts)
                                           |---> Auth (Supabase Auth)

Key design choices:

Realtime stock sync uses Supabase Realtime (pg changes) or WebSocket channel from Express.

Business logic lives in Express; Supabase used as primary DB + Auth + Storage.

Agent must implement server-side validation for GST and numeric precision (use integers for paise/cents or NUMERIC types).

4. Database Schema (recommended tables + key columns)

Use snake_case for DB fields.

users

id (uuid, pk)

email (text, unique)

full_name (text)

role (owner|admin|cashier|stock_manager)

created_at, updated_at

products

id (uuid, pk)

sku (text, unique)

name (text)

description (text)

hsn_code (text) -- for GST

gst_rate (numeric) -- percentage e.g., 18

purchase_price (numeric, paise) -- store as integer paise or numeric(12,2)

selling_price (numeric)

unit (text) -- e.g., pc, kg

category_id (fk)

current_stock (integer)

reorder_level (integer)

created_at, updated_at

categories

id, name, description

customers

id, name, phone, email, loyalty_points, metadata(json)

suppliers

id, name, contact, gst_number, address

invoices (sales)

id, invoice_number (string), type (sale, return), customer_id, created_by (user id), subtotal, total, tax_total, discount, created_at

invoice_items

id, invoice_id, product_id, qty, unit_price, gst_rate, gst_amount, item_total

stock_movements

id, product_id, change_qty (integer), reason (sale|purchase|adjustment|return), ref_id (invoice/purchase id), created_by, created_at

purchases (stock in)

id, supplier_id, invoice_no, date, total, created_by

gst_reports (materialized view)

date, total_taxable, cgst, sgst, igst, total

audit_logs

id, actor_id, action, object_type, object_id, changes(json), created_at

5. Supabase RLS / Policies (starter examples)

Public access: none. All queries must be via server using service key or via JWT with policies.

users table: allow read on self only. Admin/Owner roles allowed to read all via claim in JWT.

products: only authenticated users with role in (owner,admin,stock_manager) can insert/update/delete.

Use Supabase functions or Postgres functions for complex stock adjustments (wrap in transactions).

6. API Specification (Express) — essential endpoints

Use OpenAPI/Swagger later. Include validation with zod/joi.

Auth

POST /api/auth/signup (dev/admin use only) — body: {email, password, full_name, role}

POST /api/auth/login — body: {email, password} -> returns JWT

POST /api/auth/refresh — refresh tokens

Users

GET /api/users/me -> profile

GET /api/users (admin) -> list

PUT /api/users/:id (admin) -> update role/profile

Products

GET /api/products -> pagination, search, filter by category or low_stock

GET /api/products/:id

POST /api/products (stock_manager/admin)

PUT /api/products/:id

DELETE /api/products/:id

Inventory

POST /api/inventory/adjust -> body {product_id, qty_change, reason, note}

GET /api/inventory/stock-movements?product_id=&limit=

POST /api/inventory/bulk-import -> CSV upload

Billing / Invoicing

POST /api/invoices -> atomic: create invoice, create invoice_items, create stock_movements (sale), decrement stock; returns invoice pdf link

body: { customer_id?, items: [{product_id, qty, unit_price, discount? }], payment_info: {method, paid_amount, reference}}

Server must compute GST per item: gst_amount = round(unit_price * qty * gst_rate/100, 2)

GET /api/invoices/:id -> invoice details

GET /api/invoices?from=&to=&customer_id= -> for reporting

POST /api/invoices/:id/return -> handle returns (increase stock)

Purchases

POST /api/purchases -> stock in; creates stock_movements with reason=purchase

Reports / Analytics

GET /api/reports/sales?from=&to=&group_by=day|month|product

GET /api/reports/top-products?limit=10

GET /api/reports/gst?from=&to= -> returns CGST/SGST breakdown

Admin / Settings

GET /api/settings / PUT /api/settings (owner)

POST /api/export/csv -> generate CSV for a query

7. Frontend: Routes & Component Map (React + Vite)

High-level Routes

/login, /logout

/dashboard (analytics overview)

/pos (billing / POS UI)

/products (list, add, edit)

/inventory (stock movements, bulk import)

/customers (list, create)

/suppliers

/invoices (list, view, return)

/settings (company GST, invoice format)

Core Components (atomic -> page)

Auth/* (LoginForm, ProtectedRoute)

POS/PosScreen, POS/Cart, POS/ProductScanner, POS/PaymentModal, POS/ReceiptPreview

Products/ProductList, Products/ProductForm, Products/ProductRow

Inventory/StockMovementList, Inventory/BulkImport

Reports/SalesChart, Reports/GSTTable, Reports/TopProducts

Shared/Modal, Shared/Table, Shared/Filters, Shared/Notification

State Management

Use Zustand for simple global state (cart, current store, user) OR React Query for server state + caching.

Recommendation: React Query for all server data (caching, background sync), Zustand for ephemeral UI state (cart contents).

8. POS UI Interaction Flow (acceptance criteria)

Cashier opens /pos and selects products by search/scan.

Selected items show quantity, price, GST per item, subtotal, discount and grand total.

On Confirm, frontend sends POST /api/invoices. UI must show spinner and optimistic lock to disable duplicate submits.

Backend validates stock availability inside a DB transaction; if insufficient stock, return 409 with detailed message.

Successful invoice returns invoice id and PDF link; POS shows printable receipt and option to print/email.

Stock movements recorded and current_stock updated.

Acceptance criteria: no negative stocks allowed; round-off logic consistent and tested.

9. Validation & Business Rules

Use server-side validation for all money math using NUMERIC or integer paise. Avoid JS floating errors.

GST calculation per item and totals must match Indian rounding rules (round half-up to 2 decimals).

Invoice numbering: prefixed by store code and incremental sequence (store001-0001). Use a DB sequence or table to maintain concurrency-safe counters.

Stock adjustments must be audited (stock_movements entry for every change).

10. Testing Strategy

Unit tests for key business logic (GST calculation, stock transaction logic). Use Jest.

Integration tests for API endpoints (supertest) with a test Supabase DB (or a dockerized Postgres).

E2E tests for the POS and product flows using Playwright (simulate checkout, insufficient stock, return).

Linting and formatting: ESLint + Prettier. TypeScript recommended (if not already used).

11. CI / CD Checklist (GitHub Actions recommended)

Lint and run unit tests on PRs.

Build frontend (Vite) and backend (node) to verify compile.

On push to main/master: run full test suite, build Docker images, and deploy to target environment.

Use environment secrets in Actions (SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, JWT secrets).

12. Local Dev & Docker (suggested)

docker-compose.yml for: node app, (optional) redis, and a local Postgres (if not using Supabase local). But since Supabase is used, you can run backend locally with SUPABASE_URL + SERVICE_ROLE_KEY.

Env file template .env.example with all required keys.

13. Security Best Practices

Never embed Supabase service_role key in frontend; backend should use service keys when performing privileged writes.

Use HTTPS in production. Use secure cookies for refresh tokens or rely on Supabase session flows.

Rate limit POS endpoints to prevent accidental double clicks. Use idempotency keys for invoice creation.

Sanitize all user input and escape outputs.

14. Observability & Monitoring

Logging: structured logs (JSON) with request id, user id. Use winston/pino.

Error reporting: Sentry (optional) or similar.

Metrics: record invoice count, sales volume, API error rates.

Backups: export key tables nightly (in Supabase, schedule SQL dump or use their backup features).

15. Coding Agent: Step-by-step Work Plan (prioritized tasks agent must follow)

Phase A — Core infra & auth (high priority)

Validate repo structure & install dependencies (express, supabase-js, zod/joi, react-query, zustand, vite, tailwind).

Implement environment config loader and .env.example.

Implement auth flows: /auth/login, /auth/refresh, secure JWT handling.

Create DB migrations (SQL) for users, products, categories, customers, invoices, invoice_items, stock_movements and run against Supabase.

Add RLS policies + seed admin user.

Phase B — Product & Inventory core

CRUD APIs for products, categories.

Implement stock movement APIs and DB transactions for atomic updates.

