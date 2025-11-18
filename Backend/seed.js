const bcrypt = require('bcryptjs');
const supabase = require('./db/supabaseClient');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Hash password for test users
    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Insert Categories
    const categoriesData = [
      { name: 'Electronics', description: 'Electronic items and gadgets' },
      { name: 'Groceries', description: 'Food and grocery items' },
      { name: 'Clothing', description: 'Apparel and fashion items' }
    ];

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert(categoriesData)
      .select();

    if (catError) {
      console.error('Categories error:', catError);
      throw catError;
    }
    console.log('✅ Categories created:', categories.length);

    // 2. Insert Users
    const usersData = [
      {
        email: 'owner@example.com',
        password_hash: passwordHash,
        full_name: 'Shop Owner',
        role: 'owner'
      },
      {
        email: 'admin@example.com', 
        password_hash: passwordHash,
        full_name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'cashier@example.com',
        password_hash: passwordHash,
        full_name: 'Cashier User', 
        role: 'cashier'
      },
      {
        email: 'stock@example.com',
        password_hash: passwordHash,
        full_name: 'Stock Manager',
        role: 'stock_manager'
      }
    ];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(usersData)
      .select();

    if (usersError) {
      console.error('Users error:', usersError);
      throw usersError;
    }
    console.log('✅ Users created:', users.length);

    // 3. Insert Products
    const productsData = [
      {
        sku: 'PHONE001',
        name: 'Smartphone XL',
        description: 'Latest smartphone with advanced features',
        hsn_code: '8517',
        gst_rate: 18.00,
        purchase_price_paise: 1500000, // ₹15,000
        selling_price_paise: 2000000,  // ₹20,000
        unit: 'pcs',
        category_id: categories[0].id, // Electronics
        current_stock: 50,
        reorder_level: 10
      },
      {
        sku: 'RICE001',
        name: 'Basmati Rice 1kg',
        description: 'Premium quality basmati rice',
        hsn_code: '1006',
        gst_rate: 5.00,
        purchase_price_paise: 15000,   // ₹150
        selling_price_paise: 20000,    // ₹200
        unit: 'kg',
        category_id: categories[1].id, // Groceries
        current_stock: 200,
        reorder_level: 50
      },
      {
        sku: 'SHIRT001',
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        hsn_code: '6109',
        gst_rate: 12.00,
        purchase_price_paise: 50000,   // ₹500
        selling_price_paise: 75000,    // ₹750
        unit: 'pcs',
        category_id: categories[2].id, // Clothing
        current_stock: 100,
        reorder_level: 20
      },
      {
        sku: 'LAPTOP001',
        name: 'Laptop Pro 15"',
        description: 'High-performance laptop for professionals',
        hsn_code: '8471',
        gst_rate: 18.00,
        purchase_price_paise: 6000000, // ₹60,000
        selling_price_paise: 7500000,  // ₹75,000
        unit: 'pcs',
        category_id: categories[0].id, // Electronics
        current_stock: 25,
        reorder_level: 5
      },
      {
        sku: 'MILK001',
        name: 'Fresh Milk 1L',
        description: 'Fresh dairy milk',
        hsn_code: '0401',
        gst_rate: 5.00,
        purchase_price_paise: 4000,    // ₹40
        selling_price_paise: 5000,     // ₹50
        unit: 'L',
        category_id: categories[1].id, // Groceries
        current_stock: 500,
        reorder_level: 100
      }
    ];

    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(productsData)
      .select();

    if (productsError) {
      console.error('Products error:', productsError);
      throw productsError;
    }
    console.log('✅ Products created:', products.length);

    // 4. Insert Customers
    const customersData = [
      {
        name: 'John Doe',
        phone: '+91-9876543210',
        email: 'john@example.com',
        loyalty_points: 100
      },
      {
        name: 'Jane Smith',
        phone: '+91-9876543211',
        email: 'jane@example.com',
        loyalty_points: 50
      },
      {
        name: 'Mike Johnson',
        phone: '+91-9876543212',
        email: 'mike@example.com',
        loyalty_points: 200
      },
      {
        name: 'Sarah Wilson',
        phone: '+91-9876543213',
        email: 'sarah@example.com',
        loyalty_points: 75
      },
      {
        name: 'Walk-in Customer',
        phone: null,
        email: null,
        loyalty_points: 0
      }
    ];

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert(customersData)
      .select();

    if (customersError) {
      console.error('Customers error:', customersError);
      throw customersError;
    }
    console.log('✅ Customers created:', customers.length);

    // 5. Insert Suppliers
    const suppliersData = [
      {
        name: 'Tech Supplies Inc',
        contact: { phone: '+91-1234567890', email: 'contact@techsupplies.com' },
        gst_number: '27AABCT1234L1Z5',
        address: '123 Tech Park, Mumbai, Maharashtra'
      },
      {
        name: 'Fresh Foods Pvt Ltd',
        contact: { phone: '+91-1234567891', email: 'sales@freshfoods.com' },
        gst_number: '19AABCF1234M1Z6',
        address: '456 Market Street, Delhi, India'
      },
      {
        name: 'Fashion Hub',
        contact: { phone: '+91-1234567892', email: 'orders@fashionhub.com' },
        gst_number: '33AABCH1234N1Z7',
        address: '789 Fashion District, Chennai, Tamil Nadu'
      }
    ];

    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .insert(suppliersData)
      .select();

    if (suppliersError) {
      console.error('Suppliers error:', suppliersError);
      throw suppliersError;
    }
    console.log('✅ Suppliers created:', suppliers.length);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('   Email: owner@example.com');
    console.log('   Password: password123');
    console.log('\n🌐 Available Users:');
    console.log('   - owner@example.com (Owner)');
    console.log('   - admin@example.com (Admin)');
    console.log('   - cashier@example.com (Cashier)');
    console.log('   - stock@example.com (Stock Manager)');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();