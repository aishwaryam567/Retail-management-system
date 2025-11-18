import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    gst_number: '',
    payment_terms: '30'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data.suppliers || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      gst_number: '',
      payment_terms: '30'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      gst_number: supplier.gst_number || '',
      payment_terms: supplier.payment_terms || '30'
    });
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier_name.trim()) {
      console.warn('Supplier name required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      fetchSuppliers();
      resetForm();
    } catch (err) {
      console.error('Supplier action error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.gst_number.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Supplier'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-blue-50">
          <p className="text-blue-600 text-sm">Total Suppliers</p>
          <p className="text-2xl font-bold text-blue-700">{suppliers.length}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-green-600 text-sm">Active Suppliers</p>
          <p className="text-2xl font-bold text-green-700">
            {suppliers.filter(s => s.is_active !== false).length}
          </p>
        </Card>
        <Card className="p-4 bg-orange-50">
          <p className="text-orange-600 text-sm">With GST</p>
          <p className="text-2xl font-bold text-orange-700">
            {suppliers.filter(s => s.gst_number).length}
          </p>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6 mb-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Supplier Name *</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="e.g., ABC Distributors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Person</label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Name of contact"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">GST Number</label>
                <Input
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  placeholder="22AABCT1234H1Z1"
                  maxLength="15"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Payment Terms (days)</label>
                <Input
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  type="number"
                  min="0"
                  max="180"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary">
                {editingId ? 'Update Supplier' : 'Add Supplier'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by name, phone, email or GST..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Suppliers List */}
      {loading ? (
        <Card className="p-6 text-center">Loading suppliers...</Card>
      ) : error ? (
        <Card className="p-6 bg-red-100 text-red-700">{error}</Card>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {suppliers.length === 0 ? 'No suppliers yet. Add one to get started.' : 'No suppliers match your search.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuppliers.map(supplier => (
            <Card key={supplier.id} className="p-4 border-l-4 border-blue-600 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{supplier.supplier_name}</h3>
                  {supplier.contact_person && (
                    <p className="text-sm text-gray-600">Attn: {supplier.contact_person}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {supplier.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-mono">{supplier.phone}</p>
                  </div>
                )}
                {supplier.email && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-mono text-blue-600">{supplier.email}</p>
                  </div>
                )}
                {supplier.address && (
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p>{supplier.address}{supplier.city ? `, ${supplier.city}` : ''}</p>
                  </div>
                )}
                {supplier.gst_number && (
                  <div>
                    <p className="text-gray-600">GST Number</p>
                    <p className="font-mono font-semibold">{supplier.gst_number}</p>
                  </div>
                )}
                {supplier.payment_terms && (
                  <div>
                    <p className="text-gray-600">Payment Terms</p>
                    <p className="font-semibold">{supplier.payment_terms} days</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                {supplier.is_active === false && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Inactive</span>
                )}
                {supplier.gst_number && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">GST Registered</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
