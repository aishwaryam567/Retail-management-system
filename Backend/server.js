const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const supabase = require('./db/supabaseClient');

// Import routes
const authRoutes = require('./auth-routes');
const productsRoutes = require('./products-routes');
const categoriesRoutes = require('./categories-routes');
const customersRoutes = require('./customers-routes');
const invoicesRoutes = require('./invoices-routes');
const dashboardRoutes = require('./dashboard-routes');
const supplierRoutes = require('./suppliers-routes');
const stockRoutes = require('./stock-routes');
const reportsRoutes = require('./reports-routes');
const purchasesRoutes = require('./purchases-routes');

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Express Backend!');
});

// Health check for DB
app.get('/health/db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, db: !!data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/purchases', purchasesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});