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
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-700 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Today's Sales</p>
              <p className="text-2xl font-bold text-secondary-800">
                {stats?.sales ? formatCurrency(stats.sales.total) : '₹0'}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {stats?.sales?.count || 0} transactions
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>

        {/* Revenue Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.revenue ? formatCurrency(stats.revenue.net) : '₹0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tax: {stats?.revenue ? formatCurrency(stats.revenue.tax_collected) : '₹0'}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </Card>

        {/* Products Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(stats?.inventory?.total_products || 0)}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {stats?.inventory?.low_stock_items || 0} low stock
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </Card>

        {/* Customers Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(stats?.customers?.total || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active customers</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Stats">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Sale Value</span>
              <span className="font-semibold">
                {stats?.sales ? formatCurrency(stats.sales.average) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returns Today</span>
              <span className="font-semibold text-red-600">
                {stats?.returns ? formatCurrency(stats.returns.total) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock Items</span>
              <span className="font-semibold text-red-600">
                {stats?.inventory?.out_of_stock_items || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title="System Status">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium">System Online</p>
                <p className="text-sm text-gray-500">All services running</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium">Database Connected</p>
                <p className="text-sm text-gray-500">Real-time sync active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="font-medium">Secure Connection</p>
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