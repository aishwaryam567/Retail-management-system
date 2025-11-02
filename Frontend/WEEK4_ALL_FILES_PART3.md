# 🎨 Week 4 - All Files (Part 3 - Final)

## Pages Continued...

### 📁 src/pages/auth/Register.jsx

```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Register for Retail POS</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="cashier">Cashier</option>
              <option value="stock_manager">Stock Manager</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

### 📁 src/pages/Dashboard.jsx

```javascript
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats?.sales ? formatCurrency(stats.sales.total) : '₹0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
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
```

### 📁 src/App.jsx (REPLACE EXISTING)

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* More routes will be added in upcoming weeks */}
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
```

---

## ✅ Final Steps

1. Make sure backend is running: `cd Backend && npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Login with: `owner@example.com` / `password123`

---

## 🎉 Week 4 Complete!

You now have:
- ✅ Beautiful login/register pages
- ✅ Role-based sidebar navigation
- ✅ Protected routes
- ✅ Dashboard with live stats
- ✅ API integration
- ✅ Responsive design

**Next: Week 5 - Product Management UI** 🚀
