const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('./middleware/auth');
const { asyncHandler } = require('./middleware/errorHandler');
const { validateRequired } = require('./middleware/validator');
const { createSaleInvoice, createReturnInvoice, createQuickSale } = require('./services/invoiceService');
const { listInvoices, getInvoiceWithItems } = require('./db/models/invoices');
const { paiseToRupees, rupeesToPaise } = require('./utils/pricing');
const { generateInvoicePDF } = require('./services/pdfService');
const { sendInvoiceEmail } = require('./services/emailService');

// POST /api/invoices - Create sale invoice
router.post('/', authenticate, authorize('owner', 'admin', 'cashier'),
  validateRequired(['items']),
  asyncHandler(async (req, res) => {
    const { customer_id, items, discount } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.product_id || !item.qty) {
        return res.status(400).json({ 
          error: 'Each item must have product_id and qty' 
        });
      }
      if (item.qty <= 0) {
        return res.status(400).json({ 
          error: 'Item quantity must be greater than 0' 
        });
      }
    }

    // Convert discount from rupees to paise if provided
    const invoice_discount_paise = discount ? rupeesToPaise(discount) : 0;

    // Prepare items with discount in paise
    const itemsWithPaise = items.map(item => ({
      product_id: item.product_id,
      qty: item.qty,
      discount_paise: item.discount ? rupeesToPaise(item.discount) : 0
    }));

    try {
      const invoice = await createSaleInvoice({
        customer_id,
        items: itemsWithPaise,
        invoice_discount_paise
      }, req.user.id);

      // Convert prices to rupees for response
      const invoiceWithRupees = {
        ...invoice,
        subtotal: paiseToRupees(invoice.subtotal_paise),
        tax_total: paiseToRupees(invoice.tax_total_paise),
        discount: paiseToRupees(invoice.discount_paise),
        total: paiseToRupees(invoice.total_paise),
        items: invoice.items.map(item => ({
          ...item,
          unit_price: paiseToRupees(item.unit_price_paise),
          gst_amount: paiseToRupees(item.gst_amount_paise),
          item_total: paiseToRupees(item.item_total_paise)
        }))
      };

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        invoice: invoiceWithRupees
      });
    } catch (error) {
      // Handle specific business logic errors
      return res.status(400).json({ 
        error: error.message 
      });
    }
}));

// POST /api/invoices/quick-sale - Quick sale without customer
router.post('/quick-sale', authenticate, authorize('owner', 'admin', 'cashier'),
  validateRequired(['items']),
  asyncHandler(async (req, res) => {
    const { items, discount } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    try {
      const invoice = await createQuickSale({ items, discount }, req.user.id);

      // Convert prices to rupees
      const invoiceWithRupees = {
        ...invoice,
        subtotal: paiseToRupees(invoice.subtotal_paise),
        tax_total: paiseToRupees(invoice.tax_total_paise),
        discount: paiseToRupees(invoice.discount_paise),
        total: paiseToRupees(invoice.total_paise),
        items: invoice.items.map(item => ({
          ...item,
          unit_price: paiseToRupees(item.unit_price_paise),
          gst_amount: paiseToRupees(item.gst_amount_paise),
          item_total: paiseToRupees(item.item_total_paise)
        }))
      };

      res.status(201).json({
        success: true,
        message: 'Quick sale completed successfully',
        invoice: invoiceWithRupees
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
}));

// POST /api/invoices/return - Create return invoice
router.post('/return', authenticate, authorize('owner', 'admin', 'cashier'),
  validateRequired(['original_invoice_id', 'items', 'reason']),
  asyncHandler(async (req, res) => {
    const { original_invoice_id, items, reason } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    try {
      const invoice = await createReturnInvoice({
        original_invoice_id,
        items,
        reason
      }, req.user.id);

      // Convert prices to rupees
      const invoiceWithRupees = {
        ...invoice,
        subtotal: paiseToRupees(invoice.subtotal_paise),
        tax_total: paiseToRupees(invoice.tax_total_paise),
        discount: paiseToRupees(invoice.discount_paise),
        total: paiseToRupees(invoice.total_paise),
        items: invoice.items.map(item => ({
          ...item,
          unit_price: paiseToRupees(item.unit_price_paise),
          gst_amount: paiseToRupees(item.gst_amount_paise),
          item_total: paiseToRupees(item.item_total_paise)
        }))
      };

      res.status(201).json({
        success: true,
        message: 'Return invoice created successfully',
        invoice: invoiceWithRupees
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
}));

// GET /api/invoices - List invoices
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { 
    limit = 50, 
    offset = 0,
    type,
    customer_id,
    from_date,
    to_date
  } = req.query;

  const invoices = await listInvoices({
    limit: parseInt(limit),
    offset: parseInt(offset),
    type,
    customer_id,
    from_date,
    to_date
  });

  // Convert prices to rupees
  const invoicesWithRupees = invoices.map(inv => ({
    ...inv,
    subtotal: paiseToRupees(inv.subtotal_paise),
    tax_total: paiseToRupees(inv.tax_total_paise),
    discount: paiseToRupees(inv.discount_paise),
    total: paiseToRupees(inv.total_paise)
  }));

  res.json({
    success: true,
    count: invoices.length,
    invoices: invoicesWithRupees
  });
}));

// GET /api/invoices/:id - Get invoice with items
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const invoice = await getInvoiceWithItems(req.params.id);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  // Convert prices to rupees
  const invoiceWithRupees = {
    ...invoice,
    subtotal: paiseToRupees(invoice.subtotal_paise),
    tax_total: paiseToRupees(invoice.tax_total_paise),
    discount: paiseToRupees(invoice.discount_paise),
    total: paiseToRupees(invoice.total_paise),
    items: invoice.items.map(item => ({
      ...item,
      unit_price: paiseToRupees(item.unit_price_paise),
      gst_amount: paiseToRupees(item.gst_amount_paise),
      item_total: paiseToRupees(item.item_total_paise)
    }))
  };

  res.json({
    success: true,
    invoice: invoiceWithRupees
  });
}));

// GET /api/invoices/:id/pdf - Download invoice as PDF
router.get('/:id/pdf', authenticate, asyncHandler(async (req, res) => {
  try {
    const invoice = await getInvoiceWithItems(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(req.params.id);

    // Set response headers for PDF download
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${invoice.invoice_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}));

// POST /api/invoices/:id/email - Send invoice via email
router.post('/:id/email', authenticate, authorize('owner', 'admin', 'cashier'), asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const invoice = await getInvoiceWithItems(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(req.params.id);

    // Send email
    const result = await sendInvoiceEmail(email, invoice, pdfBuffer);

    if (result.sent) {
      res.json({
        success: true,
        message: `Invoice sent to ${email}`
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
}));

module.exports = router;
