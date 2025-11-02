const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired } = require('./middleware/validator');
const { createPurchase, listPurchases, getPurchaseById } = require('./db/models/purchases');
const { createStockMovements } = require('./db/models/stockMovements');
const { updateStock, getProductById } = require('./db/models/products');
const { createAuditLog } = require('./db/models/auditLogs');
const { rupeesToPaise, paiseToRupees } = require('./utils/pricing');

// POST /api/purchases - Create purchase order
router.post('/', authenticate, authorize('owner', 'admin', 'stock_manager'),
  validateRequired(['supplier_id', 'invoice_no', 'items']),
  asyncHandler(async (req, res) => {
    const { supplier_id, invoice_no, date, items } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    // Validate each item and calculate total
    let totalPaise = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.qty || !item.unit_cost) {
        return res.status(400).json({ 
          error: 'Each item must have product_id, qty, and unit_cost' 
        });
      }

      // Verify product exists
      const product = await getProductById(item.product_id);
      if (!product) {
        return res.status(400).json({ 
          error: `Product not found: ${item.product_id}` 
        });
      }

      const unit_cost_paise = rupeesToPaise(item.unit_cost);
      const item_total_paise = unit_cost_paise * item.qty;
      totalPaise += item_total_paise;

      validatedItems.push({
        product_id: item.product_id,
        qty: item.qty,
        unit_cost_paise,
        product_name: product.name
      });
    }

    // Create purchase record
    const purchase = await createPurchase({
      supplier_id,
      invoice_no,
      date: date || new Date().toISOString(),
      total_paise: totalPaise,
      created_by: req.user.id
    });

    // Create stock movements and update stock
    const stockMovements = validatedItems.map(item => ({
      product_id: item.product_id,
      change_qty: item.qty, // Positive for purchase
      reason: 'purchase',
      ref_id: purchase.id,
      created_by: req.user.id
    }));

    await createStockMovements(stockMovements);

    // Update product stock levels
    for (const item of validatedItems) {
      await updateStock(item.product_id, item.qty);
    }

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'PURCHASE_CREATED',
      object_type: 'purchase',
      object_id: purchase.id,
      changes: {
        supplier_id,
        invoice_no,
        total_paise: totalPaise,
        items_count: items.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      purchase: {
        ...purchase,
        total: paiseToRupees(purchase.total_paise),
        items: validatedItems.map(item => ({
          ...item,
          unit_cost: paiseToRupees(item.unit_cost_paise)
        }))
      }
    });
}));

// GET /api/purchases - List purchases
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 50, 
    offset = 0,
    supplier_id,
    from_date,
    to_date
  } = req.query;

  const purchases = await listPurchases({
    limit: parseInt(limit),
    offset: parseInt(offset),
    supplier_id,
    from_date,
    to_date
  });

  // Convert prices to rupees
  const purchasesWithRupees = purchases.map(purchase => ({
    ...purchase,
    total: paiseToRupees(purchase.total_paise)
  }));

  res.json({
    success: true,
    count: purchases.length,
    purchases: purchasesWithRupees
  });
}));

// GET /api/purchases/:id - Get purchase details
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const purchase = await getPurchaseById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ error: 'Purchase not found' });
  }

  res.json({
    success: true,
    purchase: {
      ...purchase,
      total: paiseToRupees(purchase.total_paise)
    }
  });
}));

module.exports = router;
