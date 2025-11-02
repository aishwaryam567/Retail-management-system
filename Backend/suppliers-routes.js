const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired } = require('./middleware/validator');
const { 
  createSupplier, 
  listSuppliers, 
  getSupplierById, 
  updateSupplier,
  deleteSupplier
} = require('./db/models/suppliers');
const { listPurchases } = require('./db/models/purchases');
const { createAuditLog } = require('./db/models/auditLogs');
const { paiseToRupees } = require('./utils/pricing');

// GET /api/suppliers - List all suppliers (pagination, search)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 50, 
    offset = 0, 
    search 
  } = req.query;

  const suppliers = await listSuppliers({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search
  });

  res.json({
    success: true,
    count: suppliers.length,
    suppliers
  });
}));

// GET /api/suppliers/:id - Get single supplier
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  res.json({
    success: true,
    supplier
  });
}));

// GET /api/suppliers/:id/purchases - Get supplier's purchase history
router.get('/:id/purchases', authenticate, asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);

  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  const { limit = 50, offset = 0 } = req.query;

  const purchases = await listPurchases({
    supplier_id: req.params.id,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Convert prices to rupees
  const purchasesWithRupees = purchases.map(purchase => ({
    ...purchase,
    total: paiseToRupees(purchase.total_paise)
  }));

  // Calculate total purchased
  const totalPurchased = purchases.reduce((sum, p) => sum + p.total_paise, 0);

  res.json({
    success: true,
    supplier: {
      id: supplier.id,
      name: supplier.name,
      gst_number: supplier.gst_number
    },
    total_purchased: paiseToRupees(totalPurchased),
    purchase_count: purchases.length,
    purchases: purchasesWithRupees
  });
}));

// POST /api/suppliers - Create new supplier (admin/owner only)
router.post('/', authenticate, authorize('owner', 'admin', 'stock_manager'), 
  validateRequired(['name']), 
  asyncHandler(async (req, res) => {
    const { name, contact = {}, gst_number, address } = req.body;

    const supplier = await createSupplier({ name, contact, gst_number, address });

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'SUPPLIER_CREATED',
      object_type: 'supplier',
      object_id: supplier.id,
      changes: { name, gst_number }
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier
    });
}));

// PUT /api/suppliers/:id - Update supplier (admin/owner only)
router.put('/:id', authenticate, authorize('owner', 'admin', 'stock_manager'), asyncHandler(async (req, res) => {
  const { name, contact, gst_number, address } = req.body;

  // Check if supplier exists
  const existingSupplier = await getSupplierById(req.params.id);
  if (!existingSupplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  // Build update object
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (contact !== undefined) updates.contact = contact;
  if (gst_number !== undefined) updates.gst_number = gst_number;
  if (address !== undefined) updates.address = address;

  const supplier = await updateSupplier(req.params.id, updates);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'SUPPLIER_UPDATED',
    object_type: 'supplier',
    object_id: supplier.id,
    changes: updates
  });

  res.json({
    success: true,
    message: 'Supplier updated successfully',
    supplier
  });
}));

// DELETE /api/suppliers/:id - Delete supplier (owner only)
router.delete('/:id', authenticate, authorize('owner'), asyncHandler(async (req, res) => {
  const supplier = await getSupplierById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  // Note: Deleting a supplier will set supplier_id to NULL for purchases
  // due to ON DELETE SET NULL constraint

  await deleteSupplier(req.params.id);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'SUPPLIER_DELETED',
    object_type: 'supplier',
    object_id: req.params.id,
    changes: { name: supplier.name }
  });

  res.json({
    success: true,
    message: 'Supplier deleted successfully'
  });
}));

module.exports = router;
