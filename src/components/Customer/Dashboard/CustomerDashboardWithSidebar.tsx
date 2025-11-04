import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { CustomerSidebar } from '../Layout/CustomerSidebar';
import { CustomerTopNavbar } from '../Layout/CustomerTopNavbar';
import { CustomerOrdersPage } from '../Orders/CustomerOrdersPage';
import { CustomerProfilePage } from '../Profile/CustomerProfilePage';
import { CustomerAddressesPage } from '../Addresses/CustomerAddressesPage';
import { CustomerPaymentsPage } from '../Payments/CustomerPaymentsPage';
import { CustomerNotificationsPage } from '../Notifications/CustomerNotificationsPage';

export const CustomerDashboardWithSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'orders':
        return <CustomerOrdersPage />;
      case 'addresses':
        return <CustomerAddressesPage />;
      case 'payments':
        return <CustomerPaymentsPage />;
      case 'profile':
        return <CustomerProfilePage />;
      case 'notifications':
        return <CustomerNotificationsPage />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <p className="text-purple-100 mb-4">Manage your account efficiently</p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Update Profile
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">My Orders</h3>
                <p className="text-blue-100 mb-4">Track and manage your orders</p>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  View Orders
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Addresses</h3>
                <p className="text-green-100 mb-4">Manage your shipping addresses</p>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Manage Addresses
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <CustomerTopNavbar />

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <CustomerSidebar
          isOpen={sidebarOpen}
          isMobileOpen={mobileSidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            }`}
        >
          {/* Mobile Header with Menu Button */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-lg font-bold text-gray-900">My Account</h1>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileSidebarOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
            {renderActiveTab()}
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};