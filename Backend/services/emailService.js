const nodemailer = require('nodemailer');

/**
 * Email Service for invoice notifications and low stock alerts
 * Uses SMTP configuration (can be Gmail, SendGrid, custom SMTP, etc.)
 */

// Configuration - adjust these based on your email provider
const emailConfig = {
  // For Gmail: use App Password (not regular password)
  // For SendGrid: use service: 'SendGrid' and auth with API key
  // For custom SMTP: use host, port, secure, auth
  
  // Gmail Example:
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

/**
 * Send invoice email to customer
 * @param {string} customerEmail - Customer email address
 * @param {Object} invoice - Invoice data
 * @param {Buffer} pdfBuffer - PDF invoice buffer
 */
async function sendInvoiceEmail(customerEmail, invoice, pdfBuffer) {
  try {
    if (!customerEmail) {
      console.log('📧 No customer email provided, skipping email');
      return { sent: false, reason: 'No email address' };
    }

    const transporter = getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@retailsystem.com',
      to: customerEmail,
      subject: `Invoice #${invoice.invoice_number} - Retail Management System`,
      html: generateInvoiceEmailHTML(invoice),
      attachments: [
        {
          filename: `Invoice_${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent to ${customerEmail}`);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending invoice email:', error.message);
    // Don't throw - email failure shouldn't break invoice creation
    return { sent: false, error: error.message };
  }
}

/**
 * Send low stock alert email
 * @param {Array} lowStockProducts - Array of products with low stock
 * @param {Array} recipients - Email addresses to notify
 */
async function sendLowStockAlert(lowStockProducts, recipients = []) {
  try {
    if (!recipients.length) {
      console.log('📧 No recipients for low stock alert');
      return { sent: false, reason: 'No recipients' };
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@retailsystem.com',
      to: recipients.join(','),
      subject: `⚠️ Low Stock Alert - ${lowStockProducts.length} items`,
      html: generateLowStockEmailHTML(lowStockProducts)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock alert sent to ${recipients.length} recipient(s)`);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending low stock alert:', error.message);
    return { sent: false, error: error.message };
  }
}

/**
 * Send new user welcome email
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @param {string} role - User role
 * @param {string} tempPassword - Temporary password (or None if using auth link)
 */
async function sendWelcomeEmail(email, fullName, role, tempPassword = null) {
  try {
    const transporter = getTransporter();

    let htmlContent = `
      <h2>Welcome to Retail Management System!</h2>
      <p>Hi <strong>${fullName}</strong>,</p>
      <p>Your account has been created with the following details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Role:</strong> ${role}</li>
      </ul>
    `;

    if (tempPassword) {
      htmlContent += `
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p><em>Please change your password after first login.</em></p>
      `;
    }

    htmlContent += `
      <p>You can now log in at: <a href="http://localhost:5173">Retail System Dashboard</a></p>
      <p>If you have any questions, contact support.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@retailsystem.com',
      to: email,
      subject: 'Welcome to Retail Management System',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { sent: false, error: error.message };
  }
}

/**
 * Send daily sales report email
 * @param {Array} recipients - Email addresses
 * @param {Object} reportData - Sales data for the day
 */
async function sendDailySalesReport(recipients, reportData) {
  try {
    if (!recipients.length) {
      console.log('📧 No recipients for daily sales report');
      return { sent: false, reason: 'No recipients' };
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@retailsystem.com',
      to: recipients.join(','),
      subject: `📊 Daily Sales Report - ${new Date().toLocaleDateString('en-IN')}`,
      html: generateDailySalesReportHTML(reportData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Daily sales report sent to ${recipients.length} recipient(s)`);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending daily sales report:', error.message);
    return { sent: false, error: error.message };
  }
}

/**
 * Test email connection
 */
async function testEmailConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ==================== EMAIL TEMPLATES ====================

function generateInvoiceEmailHTML(invoice) {
  const total = (invoice.total_paise / 100).toFixed(2);
  const date = new Date(invoice.created_at).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .invoice-details { margin: 20px 0; padding: 15px; background: #f8f9fa; }
        .amount { font-size: 18px; font-weight: bold; color: #007bff; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Invoice Receipt</h2>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Total Amount:</strong> <span class="amount">₹ ${total}</span></p>
        </div>
        <p>Thank you for your purchase! Your invoice is attached to this email.</p>
        <p>For any queries, please contact our support team.</p>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2025 Retail Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateLowStockEmailHTML(products) {
  const productRows = products.map(p => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.sku}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.current_stock}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.reorder_level}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b6b; color: white; padding: 15px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f8f9fa; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>⚠️ Low Stock Alert</h2>
        </div>
        <p>The following items have fallen below reorder level:</p>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p>Please reorder these items to maintain adequate inventory.</p>
      </div>
    </body>
    </html>
  `;
}

function generateDailySalesReportHTML(reportData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 15px; text-align: center; }
        .stat { display: inline-block; margin: 10px 20px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📊 Daily Sales Report</h2>
          <p>${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        <div>
          <div class="stat">
            <p>Total Sales</p>
            <p class="stat-value">₹ ${(reportData.totalSales || 0).toFixed(2)}</p>
          </div>
          <div class="stat">
            <p>Invoices</p>
            <p class="stat-value">${reportData.invoiceCount || 0}</p>
          </div>
          <div class="stat">
            <p>Tax Collected</p>
            <p class="stat-value">₹ ${(reportData.taxTotal || 0).toFixed(2)}</p>
          </div>
        </div>
        <p>For detailed analytics, log in to your dashboard.</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendInvoiceEmail,
  sendLowStockAlert,
  sendWelcomeEmail,
  sendDailySalesReport,
  testEmailConnection
};
