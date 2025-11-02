const supabase = require('./db/supabaseClient');

async function createCustomer({ name, phone, email, metadata = {} }) {
  const payload = { name, phone, email, loyalty_points: 0, metadata };
  const { data, error } = await supabase.from('customers').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listCustomers({ limit = 50, offset = 0, search } = {}) {
  let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getCustomerById(id) {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).limit(1);
  if (error) throw error;
  return data && data[0];
}

async function updateCustomer(id, updates) {
  const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function addLoyaltyPoints(id, points) {
  const customer = await getCustomerById(id);
  if (!customer) throw new Error('Customer not found');
  const newPoints = (customer.loyalty_points || 0) + points;
  return updateCustomer(id, { loyalty_points: newPoints });
}

async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
  return true;
}

module.exports = { createCustomer, listCustomers, getCustomerById, updateCustomer, addLoyaltyPoints, deleteCustomer };
