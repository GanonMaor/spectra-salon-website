import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import NewAdminSidebar from "../components/NewAdminSidebar";
// AdminTopbar removed - simplified layout
import { useActionLogger } from "../utils/actionLogger";

const AdminLayout: React.FC = () => {
  const { user } = useUserContext();
  const { logPageLoad } = useActionLogger();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    logPageLoad("admin_layout");
  }, [logPageLoad]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex relative overflow-hidden">
      {/* Background image - using spectra-system-on-colorbar.png */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/spectra-system-on-colorbar.png')"
        }}
      />
      {/* 70% black blur overlay as requested */}
      <div className="absolute inset-0 bg-black opacity-70" />
      
      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      
      {/* Fixed Sidebar */}
      <NewAdminSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div 
        className={`flex-1 flex flex-col relative z-10 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {/* Page Content - Single scroll area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
