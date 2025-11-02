const supabase = require('../supabaseClient');

async function createInvoice({ invoice_number, type, customer_id, created_by, subtotal_paise, tax_total_paise, discount_paise, total_paise }) {
  const payload = {
    invoice_number,
    type,
    customer_id,
    created_by,
    subtotal_paise,
    tax_total_paise,
    discount_paise,
    total_paise
  };
  const { data, error } = await supabase.from('invoices').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listInvoices({ limit = 50, offset = 0, type, customer_id, from_date, to_date } = {}) {
  let query = supabase.from('invoices').select('*, customers(name), users(full_name)').order('created_at', { ascending: false });
  
  if (type) query = query.eq('type', type);
  if (customer_id) query = query.eq('customer_id', customer_id);
  if (from_date) query = query.gte('created_at', from_date);
  if (to_date) query = query.lte('created_at', to_date);
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getInvoiceById(id) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name, phone, email), users(full_name)')
    .eq('id', id)
    .limit(1);
  if (error) throw error;
  return data && data[0];
}

async function getInvoiceWithItems(id) {
  const invoice = await getInvoiceById(id);
  if (!invoice) return null;
  
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select('*, products(name, sku, hsn_code)')
    .eq('invoice_id', id);
  
  if (error) throw error;
  invoice.items = items || [];
  return invoice;
}

async function generateInvoiceNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${today}-%`)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  
  if (data && data.length > 0) {
    const lastNumber = data[0].invoice_number.split('-')[2];
    const nextNumber = String(parseInt(lastNumber) + 1).padStart(4, '0');
    return `INV-${today}-${nextNumber}`;
  }
  return `INV-${today}-0001`;
}

module.exports = { 
  createInvoice, 
  listInvoices, 
  getInvoiceById, 
  getInvoiceWithItems, 
  generateInvoiceNumber 
};
