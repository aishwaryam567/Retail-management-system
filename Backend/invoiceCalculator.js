const { calculateGST } = require('./pricing');

/**
 * Calculate invoice totals from line items
 * @param {Array} items - Array of { qty, unit_price_paise, gst_rate, discount_paise? }
 * @returns {Object} - { subtotal_paise, tax_total_paise, discount_paise, total_paise, items_with_totals }
 */
function calculateInvoiceTotals(items) {
  let subtotal_paise = 0;
  let tax_total_paise = 0;
  let total_discount_paise = 0;

  const items_with_totals = items.map(item => {
    const line_subtotal = Math.round(item.qty * item.unit_price_paise);
    const item_discount = item.discount_paise || 0;
    const taxable_amount = line_subtotal - item_discount;
    const gst_amount = calculateGST(taxable_amount, item.gst_rate || 0);
    const line_total = taxable_amount + gst_amount;

    subtotal_paise += line_subtotal;
    tax_total_paise += gst_amount;
    total_discount_paise += item_discount;

    return {
      ...item,
      gst_amount_paise: gst_amount,
      item_total_paise: line_total
    };
  });

  const total_paise = subtotal_paise - total_discount_paise + tax_total_paise;

  return {
    subtotal_paise,
    tax_total_paise,
    discount_paise: total_discount_paise,
    total_paise,
    items_with_totals
  };
}

module.exports = { calculateInvoiceTotals };
