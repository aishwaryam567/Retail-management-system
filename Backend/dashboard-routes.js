const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const supabase = require('./db/supabaseClient');
const { paiseToRupees } = require('./utils/pricing');

// GET /api/dashboard/stats - Dashboard statistics
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const { period = 'today' } = req.query;

  // Calculate date range
  const now = new Date();
  let fromDate;

  switch(period) {
    case 'today':
      fromDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      fromDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      fromDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      fromDate = new Date(now.setHours(0, 0, 0, 0));
  }

  // Get sales statistics
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('type, total_paise, tax_total_paise')
    .gte('created_at', fromDate.toISOString());

  if (invError) throw invError;

  const sales = invoices.filter(inv => inv.type === 'sale');
  const returns = invoices.filter(inv => inv.type === 'return');

  const totalSales = sales.reduce((sum, inv) => sum + inv.total_paise, 0);
  const totalReturns = returns.reduce((sum, inv) => sum + inv.total_paise, 0);
  const totalTax = sales.reduce((sum, inv) => sum + inv.tax_total_paise, 0);

  // Get product count
  const { count: productCount, error: prodError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (prodError) throw prodError;

  // Get low stock count
  const { data: lowStockProducts, error: stockError } = await supabase
    .from('products')
    .select('id, current_stock, reorder_level');

  if (stockError) throw stockError;

  // Filter products that are low on stock (current_stock <= reorder_level)
  const lowStockFiltered = lowStockProducts.filter(p => p.current_stock <= (p.reorder_level || 0));
  const outOfStock = lowStockFiltered.filter(p => p.current_stock === 0);

  // Get customer count
  const { count: customerCount, error: custError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (custError) throw custError;

  res.json({
    success: true,
    period,
    statistics: {
      sales: {
        total: paiseToRupees(totalSales),
        count: sales.length,
        average: sales.length > 0 ? paiseToRupees(Math.round(totalSales / sales.length)) : 0
      },
      returns: {
        total: paiseToRupees(totalReturns),
        count: returns.length
      },
      revenue: {
        gross: paiseToRupees(totalSales),
        net: paiseToRupees(totalSales - totalReturns),
        tax_collected: paiseToRupees(totalTax)
      },
      inventory: {
        total_products: productCount,
        low_stock_items: lowStockFiltered.length,
        out_of_stock_items: outOfStock.length
      },
      customers: {
        total: customerCount
      }
    }
  });
}));

// GET /api/dashboard/recent-sales - Recent sales
router.get('/recent-sales', authenticate, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, type, total_paise, created_at, customers(name)')
    .eq('type', 'sale')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) throw error;

  const recentSales = invoices.map(inv => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    customer_name: inv.customers?.name || 'Walk-in',
    total: paiseToRupees(inv.total_paise),
    created_at: inv.created_at
  }));

  res.json({
    success: true,
    count: recentSales.length,
    sales: recentSales
  });
}));

// GET /api/dashboard/low-stock - Low stock alert
router.get('/low-stock', authenticate, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const { data: allProducts, error } = await supabase
    .from('products')
    .select('id, sku, name, current_stock, reorder_level, categories(name)')
    .order('current_stock', { ascending: true });

  if (error) throw error;

  // Filter for low stock items (current_stock <= reorder_level)
  const lowStockProducts = allProducts.filter(p => p.current_stock <= (p.reorder_level || 0)).slice(0, parseInt(limit));

  const lowStock = lowStockProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.categories?.name || 'Uncategorized',
    current_stock: p.current_stock,
    reorder_level: p.reorder_level,
    shortage: p.reorder_level - p.current_stock,
    status: p.current_stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
  }));

  res.json({
    success: true,
    count: lowStock.length,
    products: lowStock
  });
}));

// GET /api/dashboard/top-customers - Top customers
router.get('/top-customers', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { limit = 10, from_date, to_date } = req.query;

  let query = supabase
    .from('invoices')
    .select('customer_id, total_paise, customers(name, phone)')
    .eq('type', 'sale')
    .not('customer_id', 'is', null);

  if (from_date) query = query.gte('created_at', from_date);
  if (to_date) query = query.lte('created_at', to_date);

  const { data: invoices, error } = await query;

  if (error) throw error;

  // Group by customer
  const customerStats = {};
  invoices.forEach(inv => {
    const cid = inv.customer_id;
    if (!customerStats[cid]) {
      customerStats[cid] = {
        customer_id: cid,
        name: inv.customers?.name || 'Unknown',
        phone: inv.customers?.phone || '',
        total_spent: 0,
        purchase_count: 0
      };
    }
    customerStats[cid].total_spent += inv.total_paise;
    customerStats[cid].purchase_count += 1;
  });

  // Sort by total spent
  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, parseInt(limit))
    .map(c => ({
      ...c,
      total_spent: paiseToRupees(c.total_spent),
      average_purchase: paiseToRupees(Math.round(c.total_spent / c.purchase_count))
    }));

  res.json({
    success: true,
    count: topCustomers.length,
    customers: topCustomers
  });
}));

module.exports = router;
