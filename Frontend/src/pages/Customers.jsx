import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    loyalty_points: '0'
  });

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data.customers || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        loyalty_points: parseInt(formData.loyalty_points) || 0
      };

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/customers', payload);
      }

      setShowForm(false);
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        loyalty_points: '0'
      });
      fetchCustomers();
    } catch (err) {
      console.error('Customer action error:', err);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      loyalty_points: customer.loyalty_points?.toString() || '0'
    });
    setShowForm(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${customerId}`);
        fetchCustomers();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              loyalty_points: '0'
            });
            setShowForm(true);
          }}
          variant="primary"
        >
          + Add Customer
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Customer Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +91 98765 43210"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., john@example.com"
              />
              <Input
                label="Loyalty Points"
                name="loyalty_points"
                type="number"
                value={formData.loyalty_points}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      {loading ? (
        <Card className="p-6 text-center">Loading customers...</Card>
      ) : error ? (
        <Card className="p-6 bg-red-100 text-red-700">{error}</Card>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No customers found. {searchTerm && 'Try adjusting your search.'}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Loyalty Points</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{customer.name}</td>
                    <td className="px-4 py-3">{customer.phone || 'N/A'}</td>
                    <td className="px-4 py-3">{customer.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {customer.loyalty_points || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
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
