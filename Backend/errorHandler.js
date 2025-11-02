// Global error handler middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Supabase/PostgreSQL errors
  if (err.code) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate entry', details: err.message });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Referenced record not found', details: err.message });
    }
    if (err.code === '23502') {
      return res.status(400).json({ error: 'Required field missing', details: err.message });
    }
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Default server error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

// Async handler wrapper to catch errors in async route handlers
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
