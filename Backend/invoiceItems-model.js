const supabase = require('./db/supabaseClient');

async function createInvoiceItem({ invoice_id, product_id, qty, unit_price_paise, gst_rate, gst_amount_paise, item_total_paise }) {
  const payload = {
    invoice_id,
    product_id,
    qty,
    unit_price_paise,
    gst_rate,
    gst_amount_paise,
    item_total_paise
  };
  const { data, error } = await supabase.from('invoice_items').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function createInvoiceItems(items) {
  const { data, error } = await supabase.from('invoice_items').insert(items).select();
  if (error) throw error;
  return data;
}

async function getItemsByInvoiceId(invoice_id) {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*, products(name, sku, hsn_code)')
    .eq('invoice_id', invoice_id);
  if (error) throw error;
  return data;
}

module.exports = { createInvoiceItem, createInvoiceItems, getItemsByInvoiceId };
