import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-64 right-0 z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Welcome, {user?.full_name}!
          </h2>
          <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-base font-semibold text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;