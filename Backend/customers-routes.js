const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired, validateEmail } = require('./middleware/validator');
const { 
  createCustomer, 
  listCustomers, 
  getCustomerById, 
  updateCustomer,
  addLoyaltyPoints,
  deleteCustomer
} = require('./db/models/customers');
const { listInvoices } = require('./db/models/invoices');
const { createAuditLog } = require('./db/models/auditLogs');
const { paiseToRupees } = require('./utils/pricing');

// GET /api/customers - List all customers (pagination, search)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 50, 
    offset = 0, 
    search 
  } = req.query;

  const customers = await listCustomers({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search
  });

  res.json({
    success: true,
    count: customers.length,
    customers
  });
}));

// GET /api/customers/:id - Get single customer
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({
    success: true,
    customer
  });
}));

// GET /api/customers/:id/invoices - Get customer's purchase history
router.get('/:id/invoices', authenticate, asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const { limit = 50, offset = 0 } = req.query;

  const invoices = await listInvoices({
    customer_id: req.params.id,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Convert prices to rupees
  const invoicesWithRupees = invoices.map(inv => ({
    ...inv,
    subtotal: paiseToRupees(inv.subtotal_paise),
    tax_total: paiseToRupees(inv.tax_total_paise),
    discount: paiseToRupees(inv.discount_paise),
    total: paiseToRupees(inv.total_paise)
  }));

  // Calculate total spent
  const totalSpent = invoices
    .filter(inv => inv.type === 'sale')
    .reduce((sum, inv) => sum + inv.total_paise, 0);

  res.json({
    success: true,
    customer: {
      id: customer.id,
      name: customer.name,
      loyalty_points: customer.loyalty_points
    },
    total_spent: paiseToRupees(totalSpent),
    invoice_count: invoices.length,
    invoices: invoicesWithRupees
  });
}));

// POST /api/customers - Create new customer
router.post('/', authenticate, authorize('owner', 'admin', 'cashier'), 
  validateRequired(['name']), 
  asyncHandler(async (req, res) => {
    const { name, phone, email, metadata = {} } = req.body;

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const customer = await createCustomer({ name, phone, email, metadata });

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'CUSTOMER_CREATED',
      object_type: 'customer',
      object_id: customer.id,
      changes: { name, phone, email }
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer
    });
}));

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticate, authorize('owner', 'admin', 'cashier'), asyncHandler(async (req, res) => {
  const { name, phone, email, loyalty_points, metadata } = req.body;

  // Check if customer exists
  const existingCustomer = await getCustomerById(req.params.id);
  if (!existingCustomer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Validate email if provided
  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Build update object
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (loyalty_points !== undefined) updates.loyalty_points = parseInt(loyalty_points) || 0;
  if (metadata !== undefined) updates.metadata = metadata;

  const customer = await updateCustomer(req.params.id, updates);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'CUSTOMER_UPDATED',
    object_type: 'customer',
    object_id: customer.id,
    changes: updates
  });

  res.json({
    success: true,
    message: 'Customer updated successfully',
    customer
  });
}));

// POST /api/customers/:id/loyalty - Add/subtract loyalty points
router.post('/:id/loyalty', authenticate, authorize('owner', 'admin', 'cashier'), 
  validateRequired(['points']), 
  asyncHandler(async (req, res) => {
    const { points, reason } = req.body;

    // Check if customer exists
    const existingCustomer = await getCustomerById(req.params.id);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Points can be positive (add) or negative (redeem)
    const customer = await addLoyaltyPoints(req.params.id, parseInt(points));

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: points > 0 ? 'LOYALTY_POINTS_ADDED' : 'LOYALTY_POINTS_REDEEMED',
      object_type: 'customer',
      object_id: customer.id,
      changes: { points, reason, new_balance: customer.loyalty_points }
    });

    res.json({
      success: true,
      message: `${Math.abs(points)} points ${points > 0 ? 'added' : 'redeemed'}`,
      customer: {
        id: customer.id,
        name: customer.name,
        loyalty_points: customer.loyalty_points
      }
    });
}));

// DELETE /api/customers/:id - Delete customer (owner only)
router.delete('/:id', authenticate, authorize('owner'), asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  await deleteCustomer(req.params.id);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'CUSTOMER_DELETED',
    object_type: 'customer',
    object_id: req.params.id,
    changes: { name: customer.name }
  });

  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
}));

module.exports = router;
