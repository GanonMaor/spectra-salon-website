import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminTopbar } from '../components/AdminTopbar';
import { useActionLogger } from '../utils/actionLogger';

const AdminLayout: React.FC = () => {
  const { user } = useUserContext();
  const { logPageLoad } = useActionLogger();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    logPageLoad('admin_layout');
  }, [logPageLoad]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Topbar */}
        <AdminTopbar
          user={user}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;