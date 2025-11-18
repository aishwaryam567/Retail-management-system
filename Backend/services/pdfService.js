const PDFDocument = require('pdfkit');
const { getInvoiceWithItems, getInvoiceById } = require('../db/models/invoices');
const { getProductById } = require('../db/models/products');
const { getCustomerById } = require('../db/models/customers');
const { paiseToRupees } = require('../utils/pricing');

/**
 * Generate PDF invoice for a given invoice ID
 * @param {string} invoiceId - Invoice UUID
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateInvoicePDF(invoiceId) {
  try {
    // 1. Fetch invoice data
    const invoice = await getInvoiceWithItems(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // 2. Fetch customer if exists
    let customer = null;
    if (invoice.customer_id) {
      customer = await getCustomerById(invoice.customer_id);
    }

    // 3. Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    // 4. Build invoice content
    buildInvoiceHeader(doc, invoice);
    buildBillToSection(doc, customer);
    buildInvoiceDetailsTable(doc, invoice);
    buildInvoiceSummary(doc, invoice);
    buildFooter(doc);

    // 5. Return as buffer
    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
}

/**
 * Build header section (company name, invoice number, date)
 */
function buildInvoiceHeader(doc, invoice) {
  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
  doc.moveDown(0.3);

  // Company info
  doc.fontSize(14).font('Helvetica-Bold').text('RETAIL MANAGEMENT SYSTEM', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('GST Compliant Billing Solution', { align: 'center' });
  doc.moveDown(0.5);

  // Invoice number and date
  const invoiceY = doc.y;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`Invoice No: ${invoice.invoice_number}`, 40);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}`, 40);
  
  doc.y = invoiceY;
  doc.text(`Invoice Type: ${invoice.type.toUpperCase()}`, 300);
  doc.text(`Status: ISSUED`, 300);

  doc.moveDown(1);
  doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
}

/**
 * Build Bill To section
 */
function buildBillToSection(doc, customer) {
  doc.fontSize(11).font('Helvetica-Bold').text('BILL TO:', 40);
  doc.fontSize(10).font('Helvetica');

  if (customer) {
    doc.text(customer.name || 'N/A');
    if (customer.phone) doc.text(`Phone: ${customer.phone}`);
    if (customer.email) doc.text(`Email: ${customer.email}`);
  } else {
    doc.text('Walk-in Customer');
  }

  doc.moveDown(0.5);
}

/**
 * Build invoice items table
 */
function buildInvoiceDetailsTable(doc, invoice) {
  const items = invoice.items || [];
  
  // Table headers
  const headerY = doc.y;
  const columnWidths = {
    sNo: 30,
    description: 160,
    hsn: 60,
    qty: 50,
    rate: 70,
    amount: 80,
    gst: 50
  };

  // Header background
  doc.fillColor('#f0f0f0').rect(40, headerY, 515, 25).fill();
  doc.fillColor('#000000');

  // Header text
  doc.fontSize(9).font('Helvetica-Bold').y = headerY + 5;
  doc.text('S.No', 40, headerY + 5);
  doc.text('Description', 40 + columnWidths.sNo);
  doc.text('HSN', 40 + columnWidths.sNo + columnWidths.description);
  doc.text('Qty', 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn, { width: columnWidths.qty, align: 'right' });
  doc.text('Rate', 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty, { width: columnWidths.rate, align: 'right' });
  doc.text('Amount', 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty + columnWidths.rate, { width: columnWidths.amount, align: 'right' });
  doc.text('GST %', 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty + columnWidths.rate + columnWidths.amount, { width: columnWidths.gst, align: 'right' });

  doc.moveDown(1.2);
  let currentY = doc.y;

  // Table rows
  items.forEach((item, index) => {
    const itemY = currentY;
    const itemAmount = paiseToRupees(item.item_total_paise);
    const itemRate = paiseToRupees(item.unit_price_paise);
    const itemGst = item.gst_rate || 0;

    doc.fontSize(9).font('Helvetica');
    doc.text(`${index + 1}`, 40, itemY);
    doc.text(item.product_name || 'N/A', 40 + columnWidths.sNo, itemY, { width: columnWidths.description, height: 40 });
    doc.text(item.hsn_code || '-', 40 + columnWidths.sNo + columnWidths.description, itemY);
    doc.text(item.qty.toString(), 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn, itemY, { width: columnWidths.qty, align: 'right' });
    doc.text(`₹ ${itemRate.toFixed(2)}`, 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty, itemY, { width: columnWidths.rate, align: 'right' });
    doc.text(`₹ ${itemAmount.toFixed(2)}`, 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty + columnWidths.rate, itemY, { width: columnWidths.amount, align: 'right' });
    doc.text(`${itemGst.toFixed(2)}%`, 40 + columnWidths.sNo + columnWidths.description + columnWidths.hsn + columnWidths.qty + columnWidths.rate + columnWidths.amount, itemY, { width: columnWidths.gst, align: 'right' });

    currentY += 25;
  });

  doc.y = currentY;
  doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
}

/**
 * Build invoice summary (subtotal, taxes, total)
 */
function buildInvoiceSummary(doc, invoice) {
  const summaryX = 350;
  const subtotal = paiseToRupees(invoice.subtotal_paise);
  const taxTotal = paiseToRupees(invoice.tax_total_paise);
  const discount = paiseToRupees(invoice.discount_paise);
  const total = paiseToRupees(invoice.total_paise);

  doc.fontSize(10).font('Helvetica');
  
  const lineY = doc.y;
  
  // Subtotal
  doc.text('Subtotal:', summaryX, lineY);
  doc.text(`₹ ${subtotal.toFixed(2)}`, summaryX + 150, lineY, { align: 'right' });
  
  // Discount
  if (discount > 0) {
    doc.text('Discount:', summaryX, lineY + 20);
    doc.text(`- ₹ ${discount.toFixed(2)}`, summaryX + 150, lineY + 20, { align: 'right' });
  }
  
  // Tax
  doc.text('Tax (GST):', summaryX, lineY + (discount > 0 ? 40 : 20));
  doc.text(`₹ ${taxTotal.toFixed(2)}`, summaryX + 150, lineY + (discount > 0 ? 40 : 20), { align: 'right' });
  
  // Total (highlight)
  const totalY = lineY + (discount > 0 ? 60 : 40);
  doc.fillColor('#f0f0f0').rect(summaryX - 10, totalY - 5, 170, 25).fill();
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12);
  doc.text('TOTAL:', summaryX, totalY + 3);
  doc.text(`₹ ${total.toFixed(2)}`, summaryX + 150, totalY + 3, { align: 'right' });

  doc.moveDown(3);
}

/**
 * Build footer
 */
function buildFooter(doc) {
  doc.fontSize(9).font('Helvetica').fillColor('#666666');
  doc.text('Thank you for your purchase!', { align: 'center' });
  doc.text('For support: support@retailsystem.com', { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center', fontSize: 8 });
}

module.exports = {
  generateInvoicePDF
};
