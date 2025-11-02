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

async function listProducts({ limit = 50, offset = 0, search, category_id } = {}) {
  let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  if (category_id) {
    query = query.eq('category_id', category_id);
  }
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function updateProduct(id, updates) {
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}

async function getLowStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .filter('current_stock', 'lte', 'reorder_level')
    .order('current_stock', { ascending: true });
  if (error) throw error;
  return data;
}

async function updateStock(product_id, quantity) {
  const product = await getProductById(product_id);
  if (!product) throw new Error('Product not found');
  
  const newStock = (product.current_stock || 0) + quantity;
  return updateProduct(product_id, { current_stock: newStock });
}

module.exports = { 
  createProduct, 
  getProductById, 
  listProducts, 
  updateProduct, 
  deleteProduct, 
  getLowStockProducts,
  updateStock 
};
