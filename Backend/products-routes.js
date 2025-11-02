const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired, validateGSTRate } = require('./middleware/validator');
const { 
  createProduct, 
  getProductById, 
  listProducts, 
  updateProduct, 
  deleteProduct, 
  getLowStockProducts 
} = require('./db/models/products');
const { createAuditLog } = require('./db/models/auditLogs');
const { rupeesToPaise, paiseToRupees } = require('./utils/pricing');

// GET /api/products - List all products (pagination, search, filter)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 50, 
    offset = 0, 
    search, 
    category_id 
  } = req.query;

  const products = await listProducts({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
    category_id
  });

  // Convert prices from paise to rupees for display
  const productsWithRupees = products.map(p => ({
    ...p,
    purchase_price: p.purchase_price_paise ? paiseToRupees(p.purchase_price_paise) : null,
    selling_price: p.selling_price_paise ? paiseToRupees(p.selling_price_paise) : null
  }));

  res.json({
    success: true,
    count: products.length,
    products: productsWithRupees
  });
}));

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock', authenticate, asyncHandler(async (req, res) => {
  const products = await getLowStockProducts();

  const productsWithRupees = products.map(p => ({
    ...p,
    purchase_price: p.purchase_price_paise ? paiseToRupees(p.purchase_price_paise) : null,
    selling_price: p.selling_price_paise ? paiseToRupees(p.selling_price_paise) : null
  }));

  res.json({
    success: true,
    count: products.length,
    products: productsWithRupees
  });
}));

// GET /api/products/:id - Get single product
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Convert prices to rupees
  const productWithRupees = {
    ...product,
    purchase_price: product.purchase_price_paise ? paiseToRupees(product.purchase_price_paise) : null,
    selling_price: product.selling_price_paise ? paiseToRupees(product.selling_price_paise) : null
  };

  res.json({
    success: true,
    product: productWithRupees
  });
}));

// POST /api/products - Create new product (admin/owner only)
router.post('/', authenticate, authorize('owner', 'admin'), 
  validateRequired(['name', 'selling_price']), 
  asyncHandler(async (req, res) => {
    const { 
      sku, 
      name, 
      description, 
      hsn_code, 
      gst_rate, 
      purchase_price, 
      selling_price, 
      unit, 
      category_id,
      current_stock = 0,
      reorder_level = 0
    } = req.body;

    // Validate GST rate if provided
    if (gst_rate && !validateGSTRate(gst_rate)) {
      return res.status(400).json({ 
        error: 'Invalid GST rate. Must be: 0, 5, 12, 18, or 28' 
      });
    }

    // Convert prices from rupees to paise
    const productData = {
      sku,
      name,
      description,
      hsn_code,
      gst_rate: gst_rate || 0,
      purchase_price_paise: purchase_price ? rupeesToPaise(purchase_price) : null,
      selling_price_paise: rupeesToPaise(selling_price),
      unit: unit || 'pcs',
      category_id,
      current_stock,
      reorder_level
    };

    const product = await createProduct(productData);

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'PRODUCT_CREATED',
      object_type: 'product',
      object_id: product.id,
      changes: { name, sku, selling_price }
    });

    // Convert back to rupees for response
    const productWithRupees = {
      ...product,
      purchase_price: product.purchase_price_paise ? paiseToRupees(product.purchase_price_paise) : null,
      selling_price: paiseToRupees(product.selling_price_paise)
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: productWithRupees
    });
}));

// PUT /api/products/:id - Update product (admin/owner only)
router.put('/:id', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { 
    sku, 
    name, 
    description, 
    hsn_code, 
    gst_rate, 
    purchase_price, 
    selling_price, 
    unit, 
    category_id,
    current_stock,
    reorder_level
  } = req.body;

  // Check if product exists
  const existingProduct = await getProductById(req.params.id);
  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Validate GST rate if provided
  if (gst_rate !== undefined && !validateGSTRate(gst_rate)) {
    return res.status(400).json({ 
      error: 'Invalid GST rate. Must be: 0, 5, 12, 18, or 28' 
    });
  }

  // Build update object
  const updates = {};
  if (sku !== undefined) updates.sku = sku;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (hsn_code !== undefined) updates.hsn_code = hsn_code;
  if (gst_rate !== undefined) updates.gst_rate = gst_rate;
  if (purchase_price !== undefined) updates.purchase_price_paise = rupeesToPaise(purchase_price);
  if (selling_price !== undefined) updates.selling_price_paise = rupeesToPaise(selling_price);
  if (unit !== undefined) updates.unit = unit;
  if (category_id !== undefined) updates.category_id = category_id;
  if (current_stock !== undefined) updates.current_stock = current_stock;
  if (reorder_level !== undefined) updates.reorder_level = reorder_level;

  const product = await updateProduct(req.params.id, updates);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'PRODUCT_UPDATED',
    object_type: 'product',
    object_id: product.id,
    changes: updates
  });

  // Convert to rupees
  const productWithRupees = {
    ...product,
    purchase_price: product.purchase_price_paise ? paiseToRupees(product.purchase_price_paise) : null,
    selling_price: product.selling_price_paise ? paiseToRupees(product.selling_price_paise) : null
  };

  res.json({
    success: true,
    message: 'Product updated successfully',
    product: productWithRupees
  });
}));

// DELETE /api/products/:id - Delete product (owner only)
router.delete('/:id', authenticate, authorize('owner'), asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Note: In production, you might want to check if product is used in invoices
  // and either prevent deletion or do a soft delete

  await deleteProduct(req.params.id);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'PRODUCT_DELETED',
    object_type: 'product',
    object_id: req.params.id,
    changes: { name: product.name, sku: product.sku }
  });

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

module.exports = router;
