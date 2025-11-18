import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/sales', {
        params: {
          from_date: dateRange.start,
          to_date: dateRange.end
        }
      });
      const reportData = response.data;
      
      // Transform backend response to frontend format
      setReports({
        total_revenue: reportData.summary?.total_sales || 0,
        total_tax: reportData.summary?.total_tax || 0,
        total_invoices: reportData.summary?.total_invoices || 0,
        sales_by_date: reportData.timeline?.map(item => ({
          date: item.period,
          revenue: item.sales * 100 // Convert back to paise for consistency
        })) || [],
        gst_breakdown: {},
        top_products: [],
        top_customers: []
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6"><Card className="p-6 text-center">Loading reports...</Card></div>;
  if (error) return <div className="p-6"><Card className="p-6 bg-red-100 text-red-700">{error}</Card></div>;

  const salesByDate = reports.sales_by_date || [];
  const gstBreakdown = reports.gst_breakdown || {};
  const topProducts = reports.top_products || [];
  const topCustomers = reports.top_customers || [];

  const totalRevenue = reports.total_revenue || 0;
  const totalTax = reports.total_tax || 0;
  const totalInvoices = reports.total_invoices || 0;
  const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const maxSales = Math.max(...salesByDate.map(d => d.revenue || 0), 1);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">From Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">To Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <button
            onClick={fetchReports}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-blue-50">
          <p className="text-blue-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-700">₹{(totalRevenue / 100).toFixed(0)}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-green-600 text-sm">Total Tax Collected</p>
          <p className="text-2xl font-bold text-green-700">₹{(totalTax / 100).toFixed(0)}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-purple-600 text-sm">Total Invoices</p>
          <p className="text-2xl font-bold text-purple-700">{totalInvoices}</p>
        </Card>
        <Card className="p-4 bg-orange-50">
          <p className="text-orange-600 text-sm">Avg Invoice Value</p>
          <p className="text-2xl font-bold text-orange-700">₹{(avgInvoiceValue / 100).toFixed(0)}</p>
        </Card>
      </div>

      {/* Charts - Sales by Date */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Daily Sales Trend</h2>
        <div className="space-y-2">
          {salesByDate.length > 0 ? (
            salesByDate.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-24 text-sm font-mono">
                  {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-400 to-blue-600 h-full flex items-center justify-end pr-2"
                    style={{
                      width: `${maxSales > 0 ? (day.revenue / maxSales) * 100 : 0}%`
                    }}
                  >
                    {day.revenue > 0 && (
                      <span className="text-white text-xs font-semibold">
                        ₹{(day.revenue / 100).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* GST Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">GST Breakdown</h2>
          <div className="space-y-3">
            {Object.keys(gstBreakdown).length > 0 ? (
              Object.entries(gstBreakdown).map(([rate, data]) => (
                <div key={rate} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{rate}% GST</span>
                    <span className="font-bold text-blue-600">₹{(data.total / 100).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Base Amount: ₹{(data.base / 100).toFixed(2)}</p>
                    <p>Tax Amount: ₹{(data.tax / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No GST data available</p>
            )}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Customers</h2>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, idx) => (
                <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{idx + 1}. {customer.customer_name || 'Walk-in Customer'}</p>
                    <p className="text-xs text-gray-600">{customer.invoice_count} invoices</p>
                  </div>
                  <span className="font-bold text-green-600">₹{(customer.total / 100).toFixed(0)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No customer data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Product Name</th>
                <th className="px-4 py-3 text-right">Units Sold</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3">{product.product_name}</td>
                    <td className="px-4 py-3 text-right">{product.total_qty}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{(product.total_revenue / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">₹{product.total_qty > 0 ? ((product.total_revenue / product.total_qty) / 100).toFixed(2) : '0.00'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Statistics */}
      <Card className="p-6 mt-6 bg-linear-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Period</p>
            <p className="font-semibold">
              {new Date(dateRange.start).toLocaleDateString('en-IN')} to {new Date(dateRange.end).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Tax Percentage</p>
            <p className="font-semibold">
              {totalRevenue > 0 ? ((totalTax / totalRevenue) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
          <div>
            <p className="text-gray-600">Average Daily Sales</p>
            <p className="font-semibold">
              ₹{salesByDate.length > 0 ? (salesByDate.reduce((sum, d) => sum + (d.revenue || 0), 0) / salesByDate.length / 100).toFixed(0) : '0'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
