// Simple validation helper
function validateRequired(fields) {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        missing_fields: missing 
      });
    }

    next();
  };
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateRole(role) {
  const validRoles = ['owner', 'admin', 'cashier', 'stock_manager'];
  return validRoles.includes(role);
}

function validateInvoiceType(type) {
  return ['sale', 'return'].includes(type);
}

function validateStockReason(reason) {
  return ['sale', 'purchase', 'adjustment', 'return'].includes(reason);
}

function validateGSTRate(rate) {
  const validRates = [0, 5, 12, 18, 28];
  return validRates.includes(parseFloat(rate));
}

module.exports = {
  validateRequired,
  validateEmail,
  validateRole,
  validateInvoiceType,
  validateStockReason,
  validateGSTRate
};
