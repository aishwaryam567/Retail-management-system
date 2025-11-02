const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired } = require('./middleware/validator');
const { listStockMovements, createStockMovement, getProductStockBalance } = require('./db/models/stockMovements');
const { updateStock, getProductById } = require('./db/models/products');
const { createAuditLog } = require('./db/models/auditLogs');

// GET /api/stock/movements - List stock movements
router.get('/movements', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 100, 
    offset = 0,
    product_id,
    reason
  } = req.query;

  const movements = await listStockMovements({
    limit: parseInt(limit),
    offset: parseInt(offset),
    product_id,
    reason
  });

  res.json({
    success: true,
    count: movements.length,
    movements
  });
}));

// GET /api/stock/balance/:product_id - Get product stock balance
router.get('/balance/:product_id', authenticate, asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.product_id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const balance = await getProductStockBalance(req.params.product_id);

  res.json({
    success: true,
    product: {
      id: product.id,
      name: product.name,
      sku: product.sku,
      current_stock: product.current_stock,
      calculated_balance: balance,
      match: product.current_stock === balance
    }
  });
}));

// POST /api/stock/adjustment - Create stock adjustment
router.post('/adjustment', authenticate, authorize('owner', 'admin', 'stock_manager'),
  validateRequired(['product_id', 'change_qty', 'reason']),
  asyncHandler(async (req, res) => {
    const { product_id, change_qty, reason, notes } = req.body;

    // Validate product exists
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Check if adjustment would result in negative stock
    const newStock = (product.current_stock || 0) + change_qty;
    if (newStock < 0) {
      return res.status(400).json({ 
        error: `Stock adjustment would result in negative stock. Current: ${product.current_stock}, Change: ${change_qty}` 
      });
    }

    // Create stock movement
    const movement = await createStockMovement({
      product_id,
      change_qty,
      reason: 'adjustment',
      ref_id: null,
      created_by: req.user.id
    });

    // Update product stock
    await updateStock(product_id, change_qty);

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'STOCK_ADJUSTED',
      object_type: 'stock_movement',
      object_id: movement.id,
      changes: {
        product_id,
        product_name: product.name,
        change_qty,
        reason,
        notes,
        old_stock: product.current_stock,
        new_stock: newStock
      }
    });

    res.status(201).json({
      success: true,
      message: 'Stock adjusted successfully',
      movement: {
        ...movement,
        product: {
          name: product.name,
          sku: product.sku,
          old_stock: product.current_stock,
          new_stock: newStock
        }
      }
    });
}));

// POST /api/stock/recount - Recount and adjust stock to actual count
router.post('/recount', authenticate, authorize('owner', 'admin', 'stock_manager'),
  validateRequired(['product_id', 'actual_count']),
  asyncHandler(async (req, res) => {
    const { product_id, actual_count, notes } = req.body;

    // Validate product exists
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    if (actual_count < 0) {
      return res.status(400).json({ error: 'Actual count cannot be negative' });
    }

    const currentStock = product.current_stock || 0;
    const difference = actual_count - currentStock;

    if (difference === 0) {
      return res.json({
        success: true,
        message: 'Stock count matches, no adjustment needed',
        product: {
          name: product.name,
          sku: product.sku,
          stock: currentStock
        }
      });
    }

    // Create stock movement for the difference
    const movement = await createStockMovement({
      product_id,
      change_qty: difference,
      reason: 'adjustment',
      ref_id: null,
      created_by: req.user.id
    });

    // Update product stock to actual count
    await updateStock(product_id, difference);

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'STOCK_RECOUNTED',
      object_type: 'stock_movement',
      object_id: movement.id,
      changes: {
        product_id,
        product_name: product.name,
        system_count: currentStock,
        actual_count,
        difference,
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: `Stock adjusted by ${difference > 0 ? '+' : ''}${difference}`,
      movement: {
        ...movement,
        product: {
          name: product.name,
          sku: product.sku,
          old_stock: currentStock,
          actual_count,
          difference
        }
      }
    });
}));

module.exports = router;
