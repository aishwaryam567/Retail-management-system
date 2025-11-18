-- Add password_hash column to users table (if it doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Insert test/seed data
INSERT INTO users (email, full_name, role, password_hash, created_at)
VALUES 
  ('owner@example.com', 'Store Owner', 'owner', '$2a$10$7K1SfqNPSvINQXF.LK1l6OPST9/PgBkqquzi.Ss7KIUgO2PKh2m4m', now()),
  ('admin@example.com', 'Store Admin', 'admin', '$2a$10$7K1SfqNPSvINQXF.LK1l6OPST9/PgBkqquzi.Ss7KIUgO2PKh2m4m', now()),
  ('cashier@example.com', 'Cashier', 'cashier', '$2a$10$7K1SfqNPSvINQXF.LK1l6OPST9/PgBkqquzi.Ss7KIUgO2PKh2m4m', now()),
  ('stock@example.com', 'Stock Manager', 'stock_manager', '$2a$10$7K1SfqNPSvINQXF.LK1l6OPST9/PgBkqquzi.Ss7KIUgO2PKh2m4m', now())
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Accessories', 'Phone and laptop accessories'),
  ('Clothing', 'Apparel and fashion items'),
  ('Home & Kitchen', 'Home appliances and kitchen items'),
  ('Books', 'Physical and digital books')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (sku, name, description, hsn_code, gst_rate, purchase_price_paise, selling_price_paise, unit, category_id, current_stock, reorder_level) VALUES
  ('SKU-0001', 'Laptop', 'High performance laptop', '8471.30', 18.00, 5000000, 6500000, 'pc', 1, 25, 5),
  ('SKU-0002', 'Mobile Phone', 'Latest smartphone', '8517.62', 18.00, 2000000, 2500000, 'pc', 1, 50, 10),
  ('SKU-0003', 'USB Cable', 'High quality USB cable', '8544.30', 12.00, 30000, 50000, 'pc', 2, 200, 50),
  ('SKU-0004', 'Phone Case', 'Protective phone case', '4202.92', 12.00, 25000, 60000, 'pc', 2, 150, 30),
  ('SKU-0005', 'Screen Protector', 'Tempered glass protector', '7007.19', 12.00, 20000, 40000, 'pc', 2, 300, 100),
  ('SKU-0006', 'Wireless Headphones', 'Bluetooth headphones', '8518.30', 18.00, 300000, 500000, 'pc', 2, 40, 10),
  ('SKU-0007', 'Power Bank', '20000mAh power bank', '8504.40', 18.00, 150000, 300000, 'pc', 2, 75, 20),
  ('SKU-0008', 'Mechanical Keyboard', 'Gaming keyboard', '9209.40', 18.00, 250000, 400000, 'pc', 2, 30, 5)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, phone, email, loyalty_points) VALUES
  ('Rajesh Kumar', '9876543210', 'rajesh@example.com', 100),
  ('Priya Sharma', '9876543211', 'priya@example.com', 250),
  ('John Smith', '9876543212', 'john@example.com', 50),
  ('Amit Patel', '9876543213', 'amit@example.com', 175),
  ('Neha Verma', '9876543214', 'neha@example.com', 320)
ON CONFLICT (email) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact, gst_number, address) VALUES
  ('Tech Supplies Inc', '{"phone":"9876543200"}', 'GST123456', '123 Tech Street, Bangalore'),
  ('Electronics Wholesale', '{"phone":"9876543201"}', 'GST789012', '456 Wholesale Ave, Mumbai'),
  ('Direct Imports', '{"phone":"9876543202"}', 'GST345678', '789 Import Road, Delhi')
ON CONFLICT (name) DO NOTHING;

-- Note: Password hashes above are bcryptjs hashes of "password123"
-- Test credentials:
-- owner@example.com / password123
-- admin@example.com / password123
-- cashier@example.com / password123
-- stock@example.com / password123
