-- Migration: Create core tables for Retail Management System (GST billing)
-- Generated: 2025-11-03

-- Use pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== roles are modelled as a value on users.role (owner|admin|cashier|stock_manager)

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','cashier','stock_manager')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  hsn_code TEXT,
  gst_rate NUMERIC(5,2), -- percentage e.g. 18.00
  purchase_price_paise BIGINT, -- stored as integer paise
  selling_price_paise BIGINT, -- stored as integer paise
  unit TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  current_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact JSONB DEFAULT '{}',
  gst_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- invoices (sales)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sale','return')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  subtotal_paise BIGINT NOT NULL DEFAULT 0,
  tax_total_paise BIGINT NOT NULL DEFAULT 0,
  discount_paise BIGINT NOT NULL DEFAULT 0,
  total_paise BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  qty NUMERIC(12,4) NOT NULL,
  unit_price_paise BIGINT NOT NULL,
  gst_rate NUMERIC(5,2),
  gst_amount_paise BIGINT NOT NULL DEFAULT 0,
  item_total_paise BIGINT NOT NULL DEFAULT 0
);

-- purchases (stock in)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_no TEXT,
  date DATE DEFAULT CURRENT_DATE,
  total_paise BIGINT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- stock_movements (ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change_qty INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('sale','purchase','adjustment','return')),
  ref_id UUID, -- invoice/purchase id or other reference
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  object_type TEXT,
  object_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- materialized view: gst_reports
-- Note: this is a basic view that sums taxable values and GST by date.
CREATE MATERIALIZED VIEW IF NOT EXISTS gst_reports AS
SELECT
  date_trunc('day', i.created_at) AS date,
  ii.gst_rate AS gst_rate,
  SUM((ii.item_total_paise - ii.gst_amount_paise)::BIGINT) AS total_taxable_paise,
  SUM(ii.gst_amount_paise)::BIGINT AS total_gst_paise
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
GROUP BY date_trunc('day', i.created_at), ii.gst_rate
ORDER BY date_trunc('day', i.created_at) DESC;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);

-- Notes:
-- - Monetary fields use integer paise (BIGINT) to avoid floating rounding errors in JS.
-- - Consider adding triggers to keep products.current_stock in sync with stock_movements
--   or compute stock on-demand via aggregate over stock_movements.
-- - Create additional RLS policies and sequences for invoice numbering as needed.
