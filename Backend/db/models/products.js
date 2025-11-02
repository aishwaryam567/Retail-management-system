const supabase = require('../supabaseClient');

async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function listProducts({ limit = 50, offset = 0, search } = {}) {
  let query = supabase.from('products').select('*').range(offset, offset + limit - 1);
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

module.exports = { createProduct, getProductById, listProducts };
