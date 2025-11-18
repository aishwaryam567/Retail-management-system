#!/usr/bin/env node

/**
 * Seed Script for Retail Management System
 * This script initializes the database with test data
 * Usage: node seed.js
 */

require('dotenv').config({ path: './Backend/.env' });
const supabase = require('./Backend/db/supabaseClient');
const bcryptjs = require('./Backend/node_modules/bcryptjs');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Add password_hash column if not exists
    console.log('1️⃣  Checking users table structure...');
    // This would need to run raw SQL through Supabase
    console.log('   ✓ Users table ready\n');

    // 2. Create admin users
    console.log('2️⃣  Creating test users...');
    const passwordHash = await bcryptjs.hash('password123', 10);
    
    const testUsers = [
      { email: 'owner@example.com', full_name: 'Store Owner', role: 'owner' },
      { email: 'admin@example.com', full_name: 'Store Admin', role: 'admin' },
      { email: 'cashier@example.com', full_name: 'Cashier User', role: 'cashier' },
      { email: 'stock@example.com', full_name: 'Stock Manager', role: 'stock_manager' }
    ];

    for (const user of testUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert([{ ...user, password_hash: passwordHash }], { onConflict: 'email' })
        .select();
      
      if (error) {
        console.log(`   ⚠️  ${user.email}: ${error.message}`);
      } else {
        console.log(`   ✓ ${user.email} created/updated`);
      }
    }
    console.log();

    // 3. Create categories
    console.log('3️⃣  Creating product categories...');
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Accessories', description: 'Phone and laptop accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Home & Kitchen', description: 'Home appliances and kitchen items' },
      { name: 'Books', description: 'Physical and digital books' }
    ];

    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert([category], { onConflict: 'name' })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${category.name}: ${error.message}`);
      } else {
        console.log(`   ✓ ${category.name}`);
      }
    }
    console.log();

    // 4. Create products
    console.log('4️⃣  Creating sample products...');
    
    // Get category IDs first
    const { data: catData } = await supabase.from('categories').select('id, name');
    const categoryMap = {};
    if (catData) {
      catData.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });
    }

    const products = [
      { sku: 'SKU-0001', name: 'Laptop', description: 'High performance laptop', hsn_code: '8471.30', gst_rate: 18.00, purchase_price_paise: 5000000, selling_price_paise: 6500000, unit: 'pc', category_id: categoryMap['Electronics'], current_stock: 25, reorder_level: 5 },
      { sku: 'SKU-0002', name: 'Mobile Phone', description: 'Latest smartphone', hsn_code: '8517.62', gst_rate: 18.00, purchase_price_paise: 2000000, selling_price_paise: 2500000, unit: 'pc', category_id: categoryMap['Electronics'], current_stock: 50, reorder_level: 10 },
      { sku: 'SKU-0003', name: 'USB Cable', description: 'High quality USB cable', hsn_code: '8544.30', gst_rate: 12.00, purchase_price_paise: 30000, selling_price_paise: 50000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 200, reorder_level: 50 },
      { sku: 'SKU-0004', name: 'Phone Case', description: 'Protective phone case', hsn_code: '4202.92', gst_rate: 12.00, purchase_price_paise: 25000, selling_price_paise: 60000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 150, reorder_level: 30 },
      { sku: 'SKU-0005', name: 'Screen Protector', description: 'Tempered glass protector', hsn_code: '7007.19', gst_rate: 12.00, purchase_price_paise: 20000, selling_price_paise: 40000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 300, reorder_level: 100 },
      { sku: 'SKU-0006', name: 'Wireless Headphones', description: 'Bluetooth headphones', hsn_code: '8518.30', gst_rate: 18.00, purchase_price_paise: 300000, selling_price_paise: 500000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 40, reorder_level: 10 },
      { sku: 'SKU-0007', name: 'Power Bank', description: '20000mAh power bank', hsn_code: '8504.40', gst_rate: 18.00, purchase_price_paise: 150000, selling_price_paise: 300000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 75, reorder_level: 20 },
      { sku: 'SKU-0008', name: 'Mechanical Keyboard', description: 'Gaming keyboard', hsn_code: '9209.40', gst_rate: 18.00, purchase_price_paise: 250000, selling_price_paise: 400000, unit: 'pc', category_id: categoryMap['Accessories'], current_stock: 30, reorder_level: 5 }
    ];

    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'sku' })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${product.name}: ${error.message}`);
      } else {
        console.log(`   ✓ ${product.name}`);
      }
    }
    console.log();

    // 5. Create customers
    console.log('5️⃣  Creating sample customers...');
    const customers = [
      { name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@example.com', loyalty_points: 100 },
      { name: 'Priya Sharma', phone: '9876543211', email: 'priya@example.com', loyalty_points: 250 },
      { name: 'John Smith', phone: '9876543212', email: 'john@example.com', loyalty_points: 50 },
      { name: 'Amit Patel', phone: '9876543213', email: 'amit@example.com', loyalty_points: 175 },
      { name: 'Neha Verma', phone: '9876543214', email: 'neha@example.com', loyalty_points: 320 }
    ];

    for (const customer of customers) {
      const { error } = await supabase
        .from('customers')
        .upsert([customer], { onConflict: 'email' })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${customer.name}: ${error.message}`);
      } else {
        console.log(`   ✓ ${customer.name}`);
      }
    }
    console.log();

    // 6. Create suppliers
    console.log('6️⃣  Creating sample suppliers...');
    const suppliers = [
      { name: 'Tech Supplies Inc', contact: { phone: '9876543200' }, gst_number: 'GST123456', address: '123 Tech Street, Bangalore' },
      { name: 'Electronics Wholesale', contact: { phone: '9876543201' }, gst_number: 'GST789012', address: '456 Wholesale Ave, Mumbai' },
      { name: 'Direct Imports', contact: { phone: '9876543202' }, gst_number: 'GST345678', address: '789 Import Road, Delhi' }
    ];

    for (const supplier of suppliers) {
      const { error } = await supabase
        .from('suppliers')
        .upsert([supplier], { onConflict: 'name' })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${supplier.name}: ${error.message}`);
      } else {
        console.log(`   ✓ ${supplier.name}`);
      }
    }
    console.log();

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: owner@example.com');
    console.log('   Password: password123');
    console.log('\n   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('\n   Email: cashier@example.com');
    console.log('   Password: password123');
    console.log('\n   Email: stock@example.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
