import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['owner', 'admin', 'cashier', 'stock_manager'] },
    { path: '/pos', label: 'Point of Sale', roles: ['owner', 'admin', 'cashier'] },
    { path: '/products', label: 'Products', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/categories', label: 'Categories', roles: ['owner', 'admin'] },
    { path: '/customers', label: 'Customers', roles: ['owner', 'admin', 'cashier'] },
    { path: '/suppliers', label: 'Suppliers', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/invoices', label: 'Invoices', roles: ['owner', 'admin', 'cashier'] },
    { path: '/purchases', label: 'Purchases', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/stock', label: 'Stock Management', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/reports', label: 'Reports', roles: ['owner', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-linear-to-b from-purple-600 to-purple-700 text-white min-h-screen fixed left-0 top-0 overflow-y-auto border-r border-purple-300 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8 text-white">Retail POS</h1>
        
        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-base font-medium ${
                  isActive
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-purple-50 hover:bg-purple-500 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;