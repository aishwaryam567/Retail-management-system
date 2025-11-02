const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const customersRoutes = require('./routes/customers');
const suppliersRoutes = require('./routes/suppliers');
const { errorHandler } = require('./middleware/errorHandler');
const supabase = require('./db/supabaseClient');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Retail Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      customers: '/api/customers',
      suppliers: '/api/suppliers'
    }
  });
});

// Health check for DB
app.get('/health/db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, db: true, message: 'Database connected' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/suppliers', suppliersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health/db`);
  console.log(`\n📦 Available Endpoints:`);
  console.log(`   🔐 Auth:       /api/auth`);
  console.log(`   📦 Products:   /api/products`);
  console.log(`   📁 Categories: /api/categories`);
  console.log(`   👥 Customers:  /api/customers`);
  console.log(`   🏭 Suppliers:  /api/suppliers`);
  console.log('\n✅ Ready to accept requests!\n');
});
