import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  User, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SellerProductsList } from '../Seller/Products/SellerProductsList';
import { SellerOrdersPage } from '../Seller/Orders/SellerOrdersPage';
import { SellerHeader } from '../Seller/Layout/SellerHeader';

interface SellerSidebarProps {
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
    name: 'Products',
    path: 'products',
    icon: <Package className="h-5 w-5" />
  },
  {
    name: 'Orders',
    path: 'orders',
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    name: 'Analytics',
    path: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    name: 'Profile',
    path: 'profile',
    icon: <User className="h-5 w-5" />
  }
];

const SellerSidebar: React.FC<SellerSidebarProps> = ({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileToggle,
  activeTab,
  onTabChange
}) => {
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Seller
              </span>
            </button>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5 text-white" />
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
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <span
                className={`${
                  activeTab === item.path
                    ? 'text-blue-600'
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
        className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 bg-white border-r border-gray-200 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Seller
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 w-full text-left ${
                activeTab === item.path
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`${
                  activeTab === item.path
                    ? 'text-blue-600'
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
    </>
  );
};

const SellerDashboardHome: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || user?.email || 'Seller'}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Manage your inventory</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting fulfillment</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹0</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.hash = '#/dashboard/products'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Add Products</h3>
                <p className="text-sm text-gray-600">List your products for sale</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => window.location.hash = '#/dashboard/orders'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Manage Orders</h3>
                <p className="text-sm text-gray-600">View and fulfill orders</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => window.location.hash = '#/dashboard/profile'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your seller information</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  return (
    <div className="p-6">
      <SellerProductsList />
    </div>
  );
};

const OrdersPage: React.FC = () => {
  return <SellerOrdersPage />;
};

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Track your sales performance</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
        </div>
        
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">Sales data and performance metrics will appear here</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your seller information</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Seller Profile</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.fullName || 'Seller'}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Role: Seller</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.fullName || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  placeholder="Enter business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SellerDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  // Parse the hash to determine active tab
  useEffect(() => {
    const hash = location.hash;
    if (hash.includes('products/edit')) {
      setActiveTab('products');
    } else if (hash.includes('products/new')) {
      setActiveTab('products');
    } else if (hash.includes('products')) {
      setActiveTab('products');
    } else if (hash.includes('orders')) {
      setActiveTab('orders');
    } else if (hash.includes('analytics')) {
      setActiveTab('analytics');
    } else if (hash.includes('profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.hash]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <SellerDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SellerSidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <SellerHeader
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content - with padding top to account for fixed header */}
        <main className="pt-16">
          {renderActiveTab()}
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