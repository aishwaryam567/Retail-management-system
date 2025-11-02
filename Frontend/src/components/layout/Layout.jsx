import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-primary-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Navbar />
        
        <main className="mt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;