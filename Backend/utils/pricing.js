// Utility functions for price conversion and GST calculations
// All prices are stored in paise (1 rupee = 100 paise) to avoid floating point errors

// Convert rupees to paise (1 rupee = 100 paise)
function rupeesToPaise(rupees) {
  return Math.round(rupees * 100);
}

// Convert paise to rupees
function paiseToRupees(paise) {
  return paise / 100;
}

// Calculate GST amount from base price and rate
function calculateGST(basePricePaise, gstRate) {
  return Math.round((basePricePaise * gstRate) / 100);
}

// Calculate price including GST
function addGST(basePricePaise, gstRate) {
  const gstAmount = calculateGST(basePricePaise, gstRate);
  return basePricePaise + gstAmount;
}

// Calculate base price from price including GST
function removeGST(priceWithGSTPaise, gstRate) {
  const basePricePaise = Math.round((priceWithGSTPaise * 100) / (100 + gstRate));
  return basePricePaise;
}

// Calculate CGST and SGST (half of total GST each for intra-state)
function splitGST(gstAmountPaise) {
  const half = Math.round(gstAmountPaise / 2);
  return {
    cgst: half,
    sgst: gstAmountPaise - half // To handle odd numbers
  };
}

// Format paise to rupees string with 2 decimals
function formatCurrency(paise) {
  return `₹${paiseToRupees(paise).toFixed(2)}`;
}

module.exports = {
  rupeesToPaise,
  paiseToRupees,
  calculateGST,
  addGST,
  removeGST,
  splitGST,
  formatCurrency
};
