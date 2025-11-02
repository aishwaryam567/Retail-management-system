const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired } = require('./middleware/validator');
const { 
  createCategory, 
  listCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require('./db/models/categories');
const { createAuditLog } = require('./db/models/auditLogs');

// GET /api/categories - List all categories
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const categories = await listCategories();

  res.json({
    success: true,
    count: categories.length,
    categories
  });
}));

// GET /api/categories/:id - Get single category
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({
    success: true,
    category
  });
}));

// POST /api/categories - Create new category (admin/owner only)
router.post('/', authenticate, authorize('owner', 'admin'), 
  validateRequired(['name']), 
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const category = await createCategory({ name, description });

    // Create audit log
    await createAuditLog({
      actor_id: req.user.id,
      action: 'CATEGORY_CREATED',
      object_type: 'category',
      object_id: category.id,
      changes: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
}));

// PUT /api/categories/:id - Update category (admin/owner only)
router.put('/:id', authenticate, authorize('owner', 'admin'), asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if category exists
  const existingCategory = await getCategoryById(req.params.id);
  if (!existingCategory) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Build update object
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  const category = await updateCategory(req.params.id, updates);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'CATEGORY_UPDATED',
    object_type: 'category',
    object_id: category.id,
    changes: updates
  });

  res.json({
    success: true,
    message: 'Category updated successfully',
    category
  });
}));

// DELETE /api/categories/:id - Delete category (owner only)
router.delete('/:id', authenticate, authorize('owner'), asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Note: Deleting a category will set category_id to NULL for products
  // due to ON DELETE SET NULL constraint
  
  await deleteCategory(req.params.id);

  // Create audit log
  await createAuditLog({
    actor_id: req.user.id,
    action: 'CATEGORY_DELETED',
    object_type: 'category',
    object_id: req.params.id,
    changes: { name: category.name }
  });

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

module.exports = router;
