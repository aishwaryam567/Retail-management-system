const supabase = require('../supabaseClient');

async function createStockMovement({ product_id, change_qty, reason, ref_id, created_by }) {
  const payload = { product_id, change_qty, reason, ref_id, created_by };
  const { data, error } = await supabase.from('stock_movements').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function createStockMovements(movements) {
  const { data, error } = await supabase.from('stock_movements').insert(movements).select();
  if (error) throw error;
  return data;
}

async function listStockMovements({ limit = 100, offset = 0, product_id, reason } = {}) {
  let query = supabase.from('stock_movements').select('*, products(name, sku), users(full_name)').order('created_at', { ascending: false });
  
  if (product_id) query = query.eq('product_id', product_id);
  if (reason) query = query.eq('reason', reason);
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getProductStockBalance(product_id) {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('change_qty')
    .eq('product_id', product_id);
  
  if (error) throw error;
  
  const balance = data.reduce((sum, movement) => sum + movement.change_qty, 0);
  return balance;
}

module.exports = { 
  createStockMovement, 
  createStockMovements, 
  listStockMovements, 
  getProductStockBalance 
};
