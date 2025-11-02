import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'admin', 'cashier', 'stock_manager'] },
    { path: '/pos', label: 'Point of Sale', icon: '🛒', roles: ['owner', 'admin', 'cashier'] },
    { path: '/products', label: 'Products', icon: '📦', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/categories', label: 'Categories', icon: '📁', roles: ['owner', 'admin'] },
    { path: '/customers', label: 'Customers', icon: '👥', roles: ['owner', 'admin', 'cashier'] },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/invoices', label: 'Invoices', icon: '🧾', roles: ['owner', 'admin', 'cashier'] },
    { path: '/purchases', label: 'Purchases', icon: '📥', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/stock', label: 'Stock Management', icon: '📊', roles: ['owner', 'admin', 'stock_manager'] },
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['owner', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-secondary-500 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Retail POS</h1>
        
        <nav>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-accent-200 text-white'
                    : 'text-secondary-100 hover:bg-secondary-400 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;