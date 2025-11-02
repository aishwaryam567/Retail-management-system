const supabase = require('../supabaseClient');

async function createUser({ email, full_name, role }) {
  const payload = { email, full_name, role };
  const { data, error } = await supabase.from('users').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function getUserByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function listUsers({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

async function updateUser(id, updates) {
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

module.exports = { createUser, getUserByEmail, getUserById, listUsers, updateUser };
