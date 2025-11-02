const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const supabase = require('./db/supabaseClient');
const { paiseToRupees } = require('./utils/pricing');

// GET /api/reports/sales - Sales report
router.get('/sales', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { from_date, to_date, group_by = 'day' } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'from_date and to_date are required' });
  }

  // Get sales data
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('created_at, type, total_paise, tax_total_paise')
    .eq('type', 'sale')
    .gte('created_at', from_date)
    .lte('created_at', to_date)
    .order('created_at');

  if (error) throw error;

  // Calculate totals
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total_paise, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.tax_total_paise, 0);
  const totalInvoices = invoices.length;

  // Group by period
  const grouped = {};
  invoices.forEach(inv => {
    const date = new Date(inv.created_at);
    let key;
    
    if (group_by === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (group_by === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (group_by === 'year') {
      key = String(date.getFullYear());
    }

    if (!grouped[key]) {
      grouped[key] = { period: key, sales: 0, tax: 0, count: 0 };
    }

    grouped[key].sales += inv.total_paise;
    grouped[key].tax += inv.tax_total_paise;
    grouped[key].count += 1;
  });

  // Convert to array and format prices
  const timeline = Object.values(grouped).map(item => ({
    period: item.period,
    sales: paiseToRupees(item.sales),
    tax: paiseToRupees(item.tax),
    count: item.count
  }));

  res.json({
    success: true,
    summary: {
      total_sales: paiseToRupees(totalSales),
      total_tax: paiseToRupees(totalTax),
      total_invoices: totalInvoices,
      average_sale: totalInvoices > 0 ? paiseToRupees(Math.round(totalSales / totalInvoices)) : 0
    },
    timeline
  });
}));

// GET /api/reports/gst - GST report
router.get('/gst', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { from_date, to_date } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'from_date and to_date are required' });
  }

  // Get invoice items with GST data
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select(`
      gst_rate,
      gst_amount_paise,
      invoices!inner(created_at, type)
    `)
    .gte('invoices.created_at', from_date)
    .lte('invoices.created_at', to_date);

  if (error) throw error;

  // Group by GST rate
  const gstBreakdown = {};
  
  items.forEach(item => {
    const rate = item.gst_rate || 0;
    if (!gstBreakdown[rate]) {
      gstBreakdown[rate] = { rate, sales: 0, returns: 0, net: 0 };
    }

    if (item.invoices.type === 'sale') {
      gstBreakdown[rate].sales += item.gst_amount_paise;
    } else if (item.invoices.type === 'return') {
      gstBreakdown[rate].returns += item.gst_amount_paise;
    }
  });

  // Calculate net and format
  const breakdown = Object.values(gstBreakdown).map(item => ({
    gst_rate: item.rate,
    cgst: paiseToRupees(Math.round((item.sales - item.returns) / 2)),
    sgst: paiseToRupees(Math.round((item.sales - item.returns) / 2)),
    total_gst: paiseToRupees(item.sales - item.returns),
    sales_gst: paiseToRupees(item.sales),
    returns_gst: paiseToRupees(item.returns)
  }));

  const totalGST = breakdown.reduce((sum, item) => sum + (item.sales_gst - item.returns_gst), 0);

  res.json({
    success: true,
    summary: {
      total_gst_collected: totalGST,
      period: { from: from_date, to: to_date }
    },
    breakdown
  });
}));

// GET /api/reports/inventory - Inventory report
router.get('/inventory', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { category_id, low_stock_only } = req.query;

  let query = supabase
    .from('products')
    .select('id, sku, name, current_stock, reorder_level, purchase_price_paise, selling_price_paise, categories(name)');

  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  if (low_stock_only === 'true') {
    query = query.filter('current_stock', 'lte', 'reorder_level');
  }

  const { data: products, error } = await query.order('current_stock', { ascending: true });

  if (error) throw error;

  // Calculate inventory value
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const formattedProducts = products.map(p => {
    const value = (p.current_stock || 0) * (p.purchase_price_paise || 0);
    totalValue += value;

    if (p.current_stock === 0) outOfStockCount++;
    else if (p.current_stock <= p.reorder_level) lowStockCount++;

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.categories?.name || 'Uncategorized',
      current_stock: p.current_stock,
      reorder_level: p.reorder_level,
      purchase_price: paiseToRupees(p.purchase_price_paise || 0),
      selling_price: paiseToRupees(p.selling_price_paise || 0),
      stock_value: paiseToRupees(value),
      status: p.current_stock === 0 ? 'Out of Stock' : 
              p.current_stock <= p.reorder_level ? 'Low Stock' : 'In Stock'
    };
  });

  res.json({
    success: true,
    summary: {
      total_products: products.length,
      total_inventory_value: paiseToRupees(totalValue),
      low_stock_items: lowStockCount,
      out_of_stock_items: outOfStockCount
    },
    products: formattedProducts
  });
}));

// GET /api/reports/profit - Profit report
router.get('/profit', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { from_date, to_date } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'from_date and to_date are required' });
  }

  // Get sales data with product costs
  const { data: invoiceItems, error } = await supabase
    .from('invoice_items')
    .select(`
      qty,
      unit_price_paise,
      item_total_paise,
      products(purchase_price_paise),
      invoices!inner(created_at, type)
    `)
    .gte('invoices.created_at', from_date)
    .lte('invoices.created_at', to_date);

  if (error) throw error;

  let totalRevenue = 0;
  let totalCost = 0;

  invoiceItems.forEach(item => {
    if (item.invoices.type === 'sale') {
      totalRevenue += item.item_total_paise;
      totalCost += (item.products.purchase_price_paise || 0) * item.qty;
    } else if (item.invoices.type === 'return') {
      totalRevenue -= item.item_total_paise;
      totalCost -= (item.products.purchase_price_paise || 0) * item.qty;
    }
  });

  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0;

  res.json({
    success: true,
    summary: {
      total_revenue: paiseToRupees(totalRevenue),
      total_cost: paiseToRupees(totalCost),
      gross_profit: paiseToRupees(profit),
      profit_margin: `${profitMargin}%`,
      period: { from: from_date, to: to_date }
    }
  });
}));

// GET /api/reports/top-products - Top selling products
router.get('/top-products', authenticate, asyncHandler(async (req, res) => {
  const { from_date, to_date, limit = 10 } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'from_date and to_date are required' });
  }

  const { data: items, error } = await supabase
    .from('invoice_items')
    .select(`
      product_id,
      qty,
      item_total_paise,
      products(name, sku),
      invoices!inner(created_at, type)
    `)
    .eq('invoices.type', 'sale')
    .gte('invoices.created_at', from_date)
    .lte('invoices.created_at', to_date);

  if (error) throw error;

  // Group by product
  const productStats = {};
  items.forEach(item => {
    const pid = item.product_id;
    if (!productStats[pid]) {
      productStats[pid] = {
        product_id: pid,
        name: item.products.name,
        sku: item.products.sku,
        qty_sold: 0,
        revenue: 0
      };
    }
    productStats[pid].qty_sold += item.qty;
    productStats[pid].revenue += item.item_total_paise;
  });

  // Sort by revenue and format
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, parseInt(limit))
    .map(p => ({
      ...p,
      revenue: paiseToRupees(p.revenue)
    }));

  res.json({
    success: true,
    count: topProducts.length,
    products: topProducts
  });
}));

module.exports = router;
