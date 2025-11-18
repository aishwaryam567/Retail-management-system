import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices?limit=100&offset=0');
      setInvoices(response.data.invoices || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}`);
      setSelectedInvoice(response.data.invoice);
      setShowDetails(true);
    } catch (err) {
      console.error('Invoice fetch error:', err);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleSendEmail = async (invoiceId) => {
    const email = prompt('Enter customer email:');
    if (!email) return;

    try {
      await api.post(`/invoices/${invoiceId}/email`, { email });
      console.log('Invoice sent to ' + email);
    } catch (err) {
      console.error('Email send error:', err);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer_id && invoice.customer_id.includes(searchTerm));
    
    const matchesFilter = filterType === 'all' || invoice.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const totalSales = invoices
    .filter(i => i.type === 'sale')
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const totalReturns = invoices
    .filter(i => i.type === 'return')
    .reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-green-600 text-sm">Total Sales</p>
          <p className="text-2xl font-bold text-green-700">₹{(totalSales / 100).toFixed(0)}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-red-600 text-sm">Returns</p>
          <p className="text-2xl font-bold text-red-700">₹{(totalReturns / 100).toFixed(0)}</p>
        </Card>
        <Card className="p-4 bg-blue-50">
          <p className="text-blue-600 text-sm">Net Sales</p>
          <p className="text-2xl font-bold text-blue-700">₹{((totalSales - totalReturns) / 100).toFixed(0)}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="sale">Sales</option>
          <option value="return">Returns</option>
        </select>
      </div>

      {/* Details Modal */}
      {showDetails && selectedInvoice && (
        <Card className="mb-6 p-6 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Invoice Details - {selectedInvoice.invoice_number}</h2>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{new Date(selectedInvoice.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold">{selectedInvoice.type.toUpperCase()}</p>
            </div>
          </div>

          {/* Items Table */}
          {selectedInvoice.items && selectedInvoice.items.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold mb-2">Items:</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td>{item.product_name}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">₹{(item.unit_price || 0).toFixed(2)}</td>
                      <td className="text-right">₹{(item.item_total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{(selectedInvoice.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{(selectedInvoice.tax_total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>₹{(selectedInvoice.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">₹{(selectedInvoice.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <Button
              onClick={() => handleDownloadPDF(selectedInvoice.id, selectedInvoice.invoice_number)}
              variant="primary"
              size="sm"
            >
              Download PDF
            </Button>
            <Button
              onClick={() => handleSendEmail(selectedInvoice.id)}
              variant="secondary"
              size="sm"
            >
              Send Email
            </Button>
            <Button
              onClick={() => setShowDetails(false)}
              variant="secondary"
              size="sm"
            >
              Close
            </Button>
          </div>
        </Card>
      )}

      {/* Invoices Table */}
      {loading ? (
        <Card className="p-6 text-center">Loading invoices...</Card>
      ) : error ? (
        <Card className="p-6 bg-red-100 text-red-700">{error}</Card>
      ) : filteredInvoices.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No invoices found. {searchTerm && 'Try adjusting your search.'}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Tax</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">₹{(invoice.subtotal || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">₹{(invoice.tax_total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold">₹{(invoice.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(invoice)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                        className="text-green-600 hover:underline text-sm"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleSendEmail(invoice.id)}
                        className="text-purple-600 hover:underline text-sm"
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
