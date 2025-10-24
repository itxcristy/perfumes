import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

