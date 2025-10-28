import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    name: 'Products',
    path: '/admin/products',
    icon: <Package className="h-5 w-5" />
  },
  {
    name: 'Categories',
    path: '/admin/categories',
    icon: <Tag className="h-5 w-5" />
  },
  {
    name: 'Orders',
    path: '/admin/orders',
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: <Users className="h-5 w-5" />
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: <Settings className="h-5 w-5" />
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileToggle
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-200 hidden lg:block ${isOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isOpen ? (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Admin
              </span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive(item.path)
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
              title={!isOpen ? item.name : undefined}
            >
              <span
                className={`${isActive(item.path)
                  ? 'text-amber-600'
                  : 'text-gray-500 group-hover:text-gray-700'
                  }`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
            </Link>
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
        className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 bg-white border-r border-gray-200 lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileToggle}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span
                className={`${isActive(item.path)
                  ? 'text-amber-600'
                  : 'text-gray-500'
                  }`}
              >
                {item.icon}
              </span>
              <span className="ml-3 text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

