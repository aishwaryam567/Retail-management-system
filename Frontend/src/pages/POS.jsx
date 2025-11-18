import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function POS() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers')
      ]);
      setProducts(productsRes.data.products || []);
      setCustomers(customersRes.data.customers || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedQty) {
      console.warn('Product and quantity required');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (product.current_stock < parseFloat(selectedQty)) {
      console.warn(`Insufficient stock. Available: ${product.current_stock}`);
      return;
    }

    const existingItem = cart.find(item => item.product_id === selectedProduct);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === selectedProduct
          ? { ...item, qty: item.qty + parseFloat(selectedQty) }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: selectedProduct,
        product_name: product.name,
        sku: product.sku,
        qty: parseFloat(selectedQty),
        unit_price: product.selling_price,
        gst_rate: product.gst_rate || 0
      }]);
    }

    setSelectedProduct('');
    setSelectedQty('1');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, qty: newQty }
        : item
    ));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    cart.forEach(item => {
      const itemTotal = item.qty * item.unit_price;
      const gst = (itemTotal * item.gst_rate) / 100;
      subtotal += itemTotal;
      totalTax += gst;
    });

    const discountAmount = parseFloat(discount) || 0;
    const total = subtotal + totalTax - discountAmount;

    return { subtotal, totalTax, discountAmount, total };
  };

  const { subtotal, totalTax, discountAmount, total } = calculateTotals();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      console.warn('Cart is empty');
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomer || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          qty: item.qty,
          discount: 0
        })),
        discount: discountAmount
      };

      const response = await api.post('/invoices', payload);
      const invoice = response.data.invoice;

      console.log(`Invoice #${invoice.invoice_number} created`);

      // Reset form
      setCart([]);
      setSelectedCustomer('');
      setDiscount('0');
      setSelectedProduct('');
      setSelectedQty('1');
      setSearchProduct('');

      // Refresh products to update stock
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <Card className="p-6 text-center">Loading...</Card>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">POS - Create Invoice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Items</h2>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="space-y-4">
              {/* Product Search */}
              <div>
                <label className="block text-sm font-semibold mb-2">Search Product</label>
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2">Select Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Choose a product...</option>
                  {filteredProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.selling_price?.toFixed(2) || 0} (Stock: {product.current_stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <Input
                  type="number"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>

              <Button onClick={handleAddToCart} variant="primary" className="w-full">
                Add to Cart
              </Button>
            </div>

            {/* Cart Items */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Cart Items ({cart.length})</h3>

              {cart.length === 0 ? (
                <div className="text-gray-500 text-center py-6">Cart is empty</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-gray-600">{item.sku} × ₹{item.unit_price?.toFixed(2) || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateQty(item.product_id, parseFloat(e.target.value))}
                          min="0.01"
                          step="0.01"
                          className="w-16 px-2 py-1 border rounded text-center"
                        />
                        <p className="w-20 text-right font-semibold">
                          ₹{(item.qty * item.unit_price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item.product_id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Billing Section */}
        <div>
          <Card className="p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Bill Summary</h2>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Customer (Optional)</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-b py-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST):</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold bg-blue-50 p-2 rounded">
                <span>Total:</span>
                <span className="text-blue-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Discount Amount (₹)</label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handlePlaceOrder}
                variant="primary"
                className="w-full"
                disabled={cart.length === 0}
              >
                Complete Sale
              </Button>
              <Button
                onClick={() => {
                  setCart([]);
                  setSelectedCustomer('');
                  setDiscount('0');
                  setSelectedProduct('');
                  setSelectedQty('1');
                  setSearchProduct('');
                }}
                variant="secondary"
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
