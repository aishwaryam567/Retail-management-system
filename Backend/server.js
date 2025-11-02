const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const supabase = require('./db/supabaseClient');

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Express Backend!');
});

// Health check for DB
app.get('/health/db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, db: !!data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});