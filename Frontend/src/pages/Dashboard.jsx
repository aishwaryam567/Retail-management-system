import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import { formatCurrency, formatNumber } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats?period=today');
      setStats(response.data.statistics);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Card */}
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Today's Sales</p>
              <p className="text-2xl text-gray-800 font-bold">
                {stats?.sales ? formatCurrency(stats.sales.total) : '₹0'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.sales?.count || 0} transactions
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue Card */}
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Net Revenue</p>
              <p className="text-2xl text-green-600 font-bold">
                {stats?.revenue ? formatCurrency(stats.revenue.net) : '₹0'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tax: {stats?.revenue ? formatCurrency(stats.revenue.tax_collected) : '₹0'}
              </p>
            </div>
          </div>
        </Card>

        {/* Products Card */}
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Products</p>
              <p className="text-2xl text-gray-800 font-bold">
                {formatNumber(stats?.inventory?.total_products || 0)}
              </p>
              <p className="text-xs text-red-500 mt-2">
                {stats?.inventory?.low_stock_items || 0} low stock
              </p>
            </div>
          </div>
        </Card>

        {/* Customers Card */}
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Customers</p>
              <p className="text-2xl text-gray-800 font-bold">
                {formatNumber(stats?.customers?.total || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Active customers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Stats" variant="elevated">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-base text-gray-600">Average Sale Value</span>
              <span className="text-base font-semibold text-gray-800">
                {stats?.sales ? formatCurrency(stats.sales.average) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-base text-gray-600">Returns Today</span>
              <span className="text-base font-semibold text-red-600">
                {stats?.returns ? formatCurrency(stats.returns.total) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-600">Out of Stock Items</span>
              <span className="text-base font-semibold text-red-600">
                {stats?.inventory?.out_of_stock_items || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title="System Status" variant="elevated">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-base font-semibold text-gray-900">System Online</p>
                <p className="text-sm text-gray-500">All services running</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-base font-semibold text-gray-900">Database Connected</p>
                <p className="text-sm text-gray-500">Real-time sync active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-base font-semibold text-gray-900">Secure Connection</p>
                <p className="text-sm text-gray-500">SSL/TLS enabled</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;