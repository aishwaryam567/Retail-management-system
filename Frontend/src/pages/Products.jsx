import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    hsn_code: '',
    gst_rate: '18',
    purchase_price: '',
    selling_price: '',
    unit: 'pc',
    category_id: '',
    reorder_level: '5'
  });

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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
    
    if (!formData.name || !formData.sku || !formData.selling_price) {
      return;
    }

    try {
      const payload = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price),
        gst_rate: parseFloat(formData.gst_rate),
        reorder_level: parseInt(formData.reorder_level),
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        hsn_code: '',
        gst_rate: '18',
        purchase_price: '',
        selling_price: '',
        unit: 'pc',
        category_id: '',
        reorder_level: '5'
      });
      fetchProducts();
    } catch (err) {
      console.error('Product action error:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      hsn_code: product.hsn_code || '',
      gst_rate: product.gst_rate?.toString() || '18',
      purchase_price: (product.purchase_price || '').toString(),
      selling_price: (product.selling_price || '').toString(),
      unit: product.unit || 'pc',
      category_id: product.category_id?.toString() || '',
      reorder_level: product.reorder_level?.toString() || '5'
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.category_id?.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              sku: '',
              name: '',
              description: '',
              hsn_code: '',
              gst_rate: '18',
              purchase_price: '',
              selling_price: '',
              unit: 'pc',
              category_id: '',
              reorder_level: '5'
            });
            setShowForm(true);
          }}
          variant="primary"
        >
          + Add Product
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="SKU *"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., PROD001"
                disabled={!!editingProduct}
              />
              <Input
                label="Product Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Laptop"
              />
              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
              />
              <Input
                label="HSN Code"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                placeholder="e.g., 8471"
              />
              <Input
                label="Category"
                type="select"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Input>
              <Input
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g., pc, kg, ltr"
              />
              <Input
                label="Purchase Price (₹)"
                name="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={handleInputChange}
                step="0.01"
              />
              <Input
                label="Selling Price (₹) *"
                name="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={handleInputChange}
                step="0.01"
              />
              <Input
                label="GST Rate (%)"
                name="gst_rate"
                type="number"
                value={formData.gst_rate}
                onChange={handleInputChange}
                step="0.01"
              />
              <Input
                label="Reorder Level"
                name="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <Card className="p-6 text-center">Loading products...</Card>
      ) : error ? (
        <Card className="p-6 bg-red-100 text-red-700">{error}</Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No products found. {searchTerm && 'Try adjusting your search.'}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Purchase Price</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-center">GST %</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{product.sku}</td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{getCategoryName(product.category_id)}</td>
                    <td className="px-4 py-3 text-right">₹ {product.purchase_price?.toFixed(2) || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹ {product.selling_price?.toFixed(2) || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">{product.gst_rate?.toFixed(2) || 0}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.current_stock < product.reorder_level ? 'text-red-600 font-bold' : ''}>
                        {product.current_stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
