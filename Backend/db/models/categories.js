const supabase = require('../supabaseClient');

async function createCategory({ name, description }) {
  const payload = { name, description };
  const { data, error } = await supabase.from('categories').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

async function getCategoryById(id) {
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function updateCategory(id, updates) {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return true;
}

module.exports = { createCategory, listCategories, getCategoryById, updateCategory, deleteCategory };
