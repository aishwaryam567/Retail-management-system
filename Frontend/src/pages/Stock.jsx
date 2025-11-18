import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Stock() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, low, critical, adequate
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('adjustment');

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const products = response.data.products || [];
      
      // Enrich with stock status
      const enriched = products.map(product => ({
        ...product,
        stock_status: getStockStatus(product)
      }));
      
      setStockData(enriched);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    const stock = product.current_stock || 0;
    const reorder = product.reorder_level || 0;
    
    if (stock === 0) return 'critical';
    if (stock < reorder) return 'low';
    if (stock < reorder * 1.5) return 'warning';
    return 'adequate';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'adequate':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'critical':
        return '🔴 CRITICAL - Out of Stock';
      case 'low':
        return '🟠 LOW - Below Reorder Level';
      case 'warning':
        return '🟡 WARNING - Near Reorder Level';
      case 'adequate':
        return '🟢 ADEQUATE';
      default:
        return 'UNKNOWN';
    }
  };

  const filteredData = stockData.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.stock_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !adjustmentQty) {
      console.warn('Product and quantity required');
      return;
    }

    try {
      const product = stockData.find(p => p.id === selectedProduct);
      if (!product) return;

      // Call stock movement API
      await api.post('/stock/adjustment', {
        product_id: parseInt(selectedProduct),
        change_qty: parseInt(adjustmentQty),
        reason: adjustmentReason
      });

      console.log('Stock adjusted');
      setShowAdjustForm(false);
      setSelectedProduct('');
      setAdjustmentQty('');
      setAdjustmentReason('adjustment');
      fetchStockData();
    } catch (err) {
      console.error('Stock adjustment error:', err);
    }
  };

  const criticalCount = stockData.filter(p => p.stock_status === 'critical').length;
  const lowCount = stockData.filter(p => p.stock_status === 'low').length;
  const totalValue = stockData.reduce((sum, p) => sum + (p.current_stock * (p.selling_price || 0)), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <Button onClick={() => setShowAdjustForm(true)} variant="primary">
          + Adjust Stock
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Total Items</p>
          <p className="text-2xl font-bold">{stockData.length}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-red-600 text-sm">Critical Stock</p>
          <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
        </Card>
        <Card className="p-4 bg-orange-50">
          <p className="text-orange-600 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-orange-700">{lowCount}</p>
        </Card>
        <Card className="p-4 bg-blue-50">
          <p className="text-blue-600 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-blue-700">₹{(totalValue / 100).toFixed(0)}</p>
        </Card>
      </div>

      {/* Adjustment Form */}
      {showAdjustForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
          <form onSubmit={handleAdjustmentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Product *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full rounded-lg border-2 border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none px-4 py-2.5 text-base text-purple-900 bg-white"
                >
                  <option value="">Select Product</option>
                  {stockData.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.current_stock})
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Quantity Change *"
                type="number"
                name="adjustmentQty"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(e.target.value)}
                placeholder="e.g., 5 or -3"
              />
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Reason</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full rounded-lg border-2 border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none px-4 py-2.5 text-base text-purple-900 bg-white"
                >
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="damaged">Damaged/Loss</option>
                  <option value="theft">Theft/Shrinkage</option>
                  <option value="return">Customer Return</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Adjust Stock
              </Button>
              <Button
                type="button"
                onClick={() => setShowAdjustForm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="critical">Critical</option>
          <option value="low">Low</option>
          <option value="warning">Warning</option>
          <option value="adequate">Adequate</option>
        </select>
      </div>

      {/* Stock Table */}
      {loading ? (
        <Card className="p-6 text-center">Loading stock data...</Card>
      ) : error ? (
        <Card className="p-6 bg-red-100 text-red-700">{error}</Card>
      ) : filteredData.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No products found. {searchTerm && 'Try adjusting your search.'}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Stock Value</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{product.sku}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {product.current_stock || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {product.reorder_level || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₹ {((product.current_stock || 0) * (product.selling_price || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.stock_status)}`}>
                        {getStatusLabel(product.stock_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setShowAdjustForm(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Adjust
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
