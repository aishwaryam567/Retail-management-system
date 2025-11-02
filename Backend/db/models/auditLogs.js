const supabase = require('../supabaseClient');

async function createAuditLog({ actor_id, action, object_type, object_id, changes }) {
  const payload = { actor_id, action, object_type, object_id, changes };
  const { data, error } = await supabase.from('audit_logs').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

async function listAuditLogs({ limit = 100, offset = 0, actor_id, object_type, from_date } = {}) {
  let query = supabase.from('audit_logs').select('*, users(full_name, email)').order('created_at', { ascending: false });
  
  if (actor_id) query = query.eq('actor_id', actor_id);
  if (object_type) query = query.eq('object_type', object_type);
  if (from_date) query = query.gte('created_at', from_date);
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

module.exports = { createAuditLog, listAuditLogs };
