const supabase = require('./db/supabaseClient');

async function createSupplier({ name, contact = {}, gst_number, address }) {
  const payload = { name, contact, gst_number, address };
  const { data, error } = await supabase.from('suppliers').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listSuppliers({ limit = 50, offset = 0, search } = {}) {
  let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false });
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getSupplierById(id) {
  const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function updateSupplier(id, updates) {
  const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function deleteSupplier(id) {
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw error;
  return true;
}

module.exports = { createSupplier, listSuppliers, getSupplierById, updateSupplier, deleteSupplier };
