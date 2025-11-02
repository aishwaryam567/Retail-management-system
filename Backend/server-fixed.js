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

// Import routes (using correct file paths)
const authRoutes = require('./auth-routes');
const productsRoutes = require('./products-routes');
const categoriesRoutes = require('./categories-routes');
const customersRoutes = require('./customers-routes');
const suppliersRoutes = require('./suppliers-routes');
const invoicesRoutes = require('./invoices-routes');
const purchasesRoutes = require('./purchases-routes');
const stockRoutes = require('./stock-routes');
const reportsRoutes = require('./reports-routes');
const dashboardRoutes = require('./dashboard-routes');
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
      suppliers: '/api/suppliers',
      invoices: '/api/invoices',
      purchases: '/api/purchases',
      stock: '/api/stock',
      reports: '/api/reports',
      dashboard: '/api/dashboard'
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
app.use('/api/invoices', invoicesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health/db`);
});

module.exports = app;
