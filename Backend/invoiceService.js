const { generateInvoiceNumber, createInvoice, getInvoiceWithItems } = require('./db/models/invoices');
const { createInvoiceItems } = require('./db/models/invoiceItems');
const { createStockMovements } = require('./db/models/stockMovements');
const { updateStock, getProductById } = require('./db/models/products');
const { addLoyaltyPoints, getCustomerById } = require('./db/models/customers');
const { createAuditLog } = require('./db/models/auditLogs');
const { calculateInvoiceTotals } = require('./utils/invoiceCalculator');
const { rupeesToPaise } = require('./utils/pricing');

/**
 * Create a sale invoice with automatic calculations and stock updates
 * @param {Object} data - Invoice data
 * @param {string} data.customer_id - Customer UUID
 * @param {Array} data.items - Array of { product_id, qty, discount_paise? }
 * @param {number} data.invoice_discount_paise - Optional discount on entire invoice
 * @param {string} user_id - User creating the invoice
 */
async function createSaleInvoice(data, user_id) {
  const { customer_id, items, invoice_discount_paise = 0 } = data;

  // 1. Validate customer exists
  if (customer_id) {
    const customer = await getCustomerById(customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }
  }

  // 2. Validate and enrich items with product data
  const enrichedItems = [];
  for (const item of items) {
    const product = await getProductById(item.product_id);
    if (!product) {
      throw new Error(`Product not found: ${item.product_id}`);
    }

    // Check stock availability
    if (product.current_stock < item.qty) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.current_stock}, Requested: ${item.qty}`);
    }

    enrichedItems.push({
      product_id: item.product_id,
      qty: item.qty,
      unit_price_paise: product.selling_price_paise,
      gst_rate: product.gst_rate || 0,
      discount_paise: item.discount_paise || 0,
      product_name: product.name,
      product_sku: product.sku
    });
  }

  // 3. Calculate invoice totals
  const calculations = calculateInvoiceTotals(enrichedItems);

  // Apply invoice-level discount
  const finalDiscount = calculations.discount_paise + invoice_discount_paise;
  const finalTotal = calculations.total_paise - invoice_discount_paise;

  // 4. Generate invoice number
  const invoice_number = await generateInvoiceNumber();

  // 5. Create invoice record
  const invoice = await createInvoice({
    invoice_number,
    type: 'sale',
    customer_id,
    created_by: user_id,
    subtotal_paise: calculations.subtotal_paise,
    tax_total_paise: calculations.tax_total_paise,
    discount_paise: finalDiscount,
    total_paise: finalTotal
  });

  // 6. Create invoice items
  const invoiceItemsData = calculations.items_with_totals.map(item => ({
    invoice_id: invoice.id,
    product_id: item.product_id,
    qty: item.qty,
    unit_price_paise: item.unit_price_paise,
    gst_rate: item.gst_rate,
    gst_amount_paise: item.gst_amount_paise,
    item_total_paise: item.item_total_paise
  }));

  await createInvoiceItems(invoiceItemsData);

  // 7. Create stock movements and update stock
  const stockMovements = enrichedItems.map(item => ({
    product_id: item.product_id,
    change_qty: -item.qty, // Negative for sale
    reason: 'sale',
    ref_id: invoice.id,
    created_by: user_id
  }));

  await createStockMovements(stockMovements);

  // Update product stock levels
  for (const item of enrichedItems) {
    await updateStock(item.product_id, -item.qty);
  }

  // 8. Add loyalty points (1 point per ₹100 spent)
  if (customer_id) {
    const pointsEarned = Math.floor(finalTotal / 10000); // Total is in paise, 10000 paise = ₹100
    if (pointsEarned > 0) {
      await addLoyaltyPoints(customer_id, pointsEarned);
    }
  }

  // 9. Create audit log
  await createAuditLog({
    actor_id: user_id,
    action: 'INVOICE_CREATED',
    object_type: 'invoice',
    object_id: invoice.id,
    changes: {
      invoice_number,
      customer_id,
      total_paise: finalTotal,
      items_count: items.length
    }
  });

  // 10. Return complete invoice
  return await getInvoiceWithItems(invoice.id);
}

/**
 * Create a return invoice (reverse sale)
 * @param {Object} data - Return data
 * @param {string} data.original_invoice_id - Original invoice UUID
 * @param {Array} data.items - Array of { product_id, qty }
 * @param {string} data.reason - Reason for return
 * @param {string} user_id - User creating the return
 */
async function createReturnInvoice(data, user_id) {
  const { original_invoice_id, items, reason } = data;

  // 1. Validate original invoice exists
  const originalInvoice = await getInvoiceWithItems(original_invoice_id);
  if (!originalInvoice) {
    throw new Error('Original invoice not found');
  }

  if (originalInvoice.type !== 'sale') {
    throw new Error('Can only return sale invoices');
  }

  // 2. Validate return items against original invoice
  const returnItems = [];
  for (const returnItem of items) {
    const originalItem = originalInvoice.items.find(i => i.product_id === returnItem.product_id);
    if (!originalItem) {
      throw new Error(`Product ${returnItem.product_id} was not in original invoice`);
    }

    if (returnItem.qty > originalItem.qty) {
      throw new Error(`Cannot return more than original quantity for product ${returnItem.product_id}`);
    }

    const product = await getProductById(returnItem.product_id);
    
    returnItems.push({
      product_id: returnItem.product_id,
      qty: returnItem.qty,
      unit_price_paise: originalItem.unit_price_paise,
      gst_rate: originalItem.gst_rate,
      discount_paise: 0
    });
  }

  // 3. Calculate return totals
  const calculations = calculateInvoiceTotals(returnItems);

  // 4. Generate invoice number
  const invoice_number = await generateInvoiceNumber();

  // 5. Create return invoice
  const invoice = await createInvoice({
    invoice_number,
    type: 'return',
    customer_id: originalInvoice.customer_id,
    created_by: user_id,
    subtotal_paise: calculations.subtotal_paise,
    tax_total_paise: calculations.tax_total_paise,
    discount_paise: 0,
    total_paise: calculations.total_paise
  });

  // 6. Create invoice items
  const invoiceItemsData = calculations.items_with_totals.map(item => ({
    invoice_id: invoice.id,
    product_id: item.product_id,
    qty: item.qty,
    unit_price_paise: item.unit_price_paise,
    gst_rate: item.gst_rate,
    gst_amount_paise: item.gst_amount_paise,
    item_total_paise: item.item_total_paise
  }));

  await createInvoiceItems(invoiceItemsData);

  // 7. Create stock movements and update stock (positive for return)
  const stockMovements = returnItems.map(item => ({
    product_id: item.product_id,
    change_qty: item.qty, // Positive for return
    reason: 'return',
    ref_id: invoice.id,
    created_by: user_id
  }));

  await createStockMovements(stockMovements);

  // Update product stock levels
  for (const item of returnItems) {
    await updateStock(item.product_id, item.qty);
  }

  // 8. Deduct loyalty points (1 point per ₹100 returned)
  if (originalInvoice.customer_id) {
    const pointsToDeduct = Math.floor(calculations.total_paise / 10000);
    if (pointsToDeduct > 0) {
      await addLoyaltyPoints(originalInvoice.customer_id, -pointsToDeduct);
    }
  }

  // 9. Create audit log
  await createAuditLog({
    actor_id: user_id,
    action: 'RETURN_INVOICE_CREATED',
    object_type: 'invoice',
    object_id: invoice.id,
    changes: {
      invoice_number,
      original_invoice_id,
      reason,
      total_paise: calculations.total_paise,
      items_count: items.length
    }
  });

  // 10. Return complete invoice
  return await getInvoiceWithItems(invoice.id);
}

/**
 * Quick sale for walk-in customers (no customer record)
 * @param {Object} data - Sale data
 * @param {Array} data.items - Array of { product_id, qty, discount? }
 * @param {number} data.discount - Optional discount in rupees
 * @param {string} user_id - User creating the sale
 */
async function createQuickSale(data, user_id) {
  const { items, discount } = data;

  // Convert discount to paise if provided
  const invoice_discount_paise = discount ? rupeesToPaise(discount) : 0;

  // Create sale without customer_id
  return await createSaleInvoice({
    customer_id: null,
    items,
    invoice_discount_paise
  }, user_id);
}

module.exports = {
  createSaleInvoice,
  createReturnInvoice,
  createQuickSale
};
