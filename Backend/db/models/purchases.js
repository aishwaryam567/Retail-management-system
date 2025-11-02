const supabase = require('../supabaseClient');

async function createPurchase({ supplier_id, invoice_no, date, total_paise, created_by }) {
  const payload = { supplier_id, invoice_no, date, total_paise, created_by };
  const { data, error } = await supabase.from('purchases').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listPurchases({ limit = 50, offset = 0, supplier_id, from_date, to_date } = {}) {
  let query = supabase.from('purchases').select('*, suppliers(name), users(full_name)').order('date', { ascending: false });
  
  if (supplier_id) query = query.eq('supplier_id', supplier_id);
  if (from_date) query = query.gte('date', from_date);
  if (to_date) query = query.lte('date', to_date);
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getPurchaseById(id) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(name, contact), users(full_name)')
    .eq('id', id)
    .limit(1);
  if (error) throw error;
  return data && data[0];
}

module.exports = { createPurchase, listPurchases, getPurchaseById };
