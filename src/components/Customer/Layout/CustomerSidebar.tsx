import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  CreditCard, 
  User, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface CustomerSidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    name: 'My Orders',
    path: 'orders',
    icon: <Package className="h-5 w-5" />
  },
  {
    name: 'Manage Addresses',
    path: 'addresses',
    icon: <MapPin className="h-5 w-5" />
  },
  {
    name: 'Payment Methods',
    path: 'payments',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    name: 'Profile',
    path: 'profile',
    icon: <User className="h-5 w-5" />
  },
  {
    name: 'Notifications',
    path: 'notifications',
    icon: <Bell className="h-5 w-5" />
  }
];

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileToggle,
  activeTab,
  onTabChange
}) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    onTabChange(path);
    if (window.innerWidth < 1024) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-200 hidden lg:block ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isOpen ? (
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Customer
              </span>
            </button>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group w-full text-left ${
                activeTab === item.path
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <span
                className={`${
                  activeTab === item.path
                    ? 'text-purple-600'
                    : 'text-gray-500 group-hover:text-gray-700'
                }`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="absolute bottom-4 right-0 transform translate-x-1/2">
          <button
            onClick={onToggle}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 bg-white border-r border-gray-200 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Customer
            </span>
          </button>
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user?.fullName || user?.email?.split('@')[0] || 'Customer'}
              </p>
              <p className="text-sm text-gray-600">Customer Account</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 w-full text-left ${
                activeTab === item.path
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`${
                  activeTab === item.path
                    ? 'text-purple-600'
                    : 'text-gray-500'
                }`}
              >
                {item.icon}
              </span>
              <span className="ml-3 text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed bottom-6 right-6 z-30 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};