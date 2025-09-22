import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  UserCog,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Tag,
  TrendingUp,
  FileText,
  Shield,
  Bell,
  Gift,
  Palette
} from 'lucide-react';
import { AdminErrorBoundary } from '../Common/AdminErrorBoundary';
import { AdminLoadingState } from '../Common/EnhancedLoadingStates';

// Lazy-loaded admin components for code splitting and performance optimization
const ComprehensiveAdminDashboard = lazy(() =>
  import('./Admin/ComprehensiveAdminDashboard').then(module => ({
    default: module.ComprehensiveAdminDashboard
  }))
);

const ProductionUserManagement = lazy(() =>
  import('./Admin/ProductionUserManagement')
);

const ProductManagement = lazy(() =>
  import('./Admin/ProductManagement').then(module => ({
    default: module.ProductManagement
  }))
);

const OrderManager = lazy(() =>
  import('./Admin/OrderManager').then(module => ({
    default: module.OrderManager
  }))
);

const CategoryManagement = lazy(() =>
  import('./Admin/CategoryManagement').then(module => ({
    default: module.CategoryManagement
  }))
);

const CollectionManagement = lazy(() =>
  import('./Admin/CollectionManagement').then(module => ({
    default: module.CollectionManagement
  }))
);

const CouponManagement = lazy(() =>
  import('./Admin/CouponManagement').then(module => ({
    default: module.CouponManagement
  }))
);

const SettingsManagement = lazy(() =>
  import('./Admin/SettingsManagement').then(module => ({
    default: module.SettingsManagement
  }))
);

const EnhancedAnalyticsDashboard = lazy(() =>
  import('./Admin/EnhancedAnalyticsDashboard').then(module => ({
    default: module.EnhancedAnalyticsDashboard
  }))
);

const DedicatedAnalyticsDashboard = lazy(() =>
  import('./Admin/DedicatedAnalyticsDashboard').then(module => ({
    default: module.DedicatedAnalyticsDashboard
  }))
);

const MarketingManagement = lazy(() =>
  import('./Admin/MarketingManagement').then(module => ({
    default: module.MarketingManagement
  }))
);



const AuditLogs = lazy(() =>
  import('./Admin/AuditLogs').then(module => ({
    default: module.AuditLogs
  }))
);

const AdvancedReports = lazy(() =>
  import('./Admin/AdvancedReports').then(module => ({
    default: module.AdvancedReports
  }))
);

const AccessibilityDashboard = lazy(() =>
  import('./Admin/AccessibilityDashboard').then(module => ({
    default: module.AccessibilityDashboard
  }))
);

const ThemeCustomizationDashboard = lazy(() =>
  import('./Admin/ThemeCustomizationDashboard').then(module => ({
    default: module.ThemeCustomizationDashboard
  }))
);

interface NavItem {
  name: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  preload?: boolean;
}

// Memoized navigation item component for performance
const NavigationItem = memo<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}>(({ item, isActive, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    title={collapsed ? item.name : undefined}
  >
    <span className="flex-shrink-0">{item.icon}</span>
    {!collapsed && (
      <span className="ml-3 truncate">{item.name}</span>
    )}
  </button>
));

NavigationItem.displayName = 'NavigationItem';

// Memoized component renderer with Suspense
const ComponentRenderer = memo<{
  component: React.ComponentType;
  isActive: boolean;
}>(({ component: Component, isActive }) => {
  if (!isActive) return null;

  return (
    <Suspense fallback={
      <AdminLoadingState
        type="dashboard"
        message="Loading component..."
      />
    }>
      <Component />
    </Suspense>
  );
});

ComponentRenderer.displayName = 'ComponentRenderer';

export const AdminDashboard: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simple responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload critical components for better performance
  useEffect(() => {
    const preloadCriticalComponents = async () => {
      try {
        // Preload the most commonly used admin components
        await import('./Admin/ComprehensiveAdminDashboard');

        // Preload secondary components after a delay
        setTimeout(async () => {
          await Promise.all([
            import('./Admin/ProductionUserManagement'),
            import('./Admin/ProductManagement'),
            import('./Admin/OrderManager')
          ]);
        }, 2000);
      } catch (error) {
        console.warn('Failed to preload some admin components:', error);
      }
    };

    // Preload after initial render is complete
    const timeoutId = setTimeout(preloadCriticalComponents, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Memoized navigation configuration with performance optimizations
  const navigation: NavItem[] = useMemo(() => [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      component: ComprehensiveAdminDashboard,
      preload: true // Preload critical dashboard component
    },
    {
      name: 'Users',
      icon: <Users className="h-5 w-5" />,
      component: ProductionUserManagement
    },
    {
      name: 'Products',
      icon: <Package className="h-5 w-5" />,
      component: ProductManagement
    },
    {
      name: 'Orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      component: OrderManager
    },
    {
      name: 'Categories',
      icon: <Tag className="h-5 w-5" />,
      component: CategoryManagement
    },
    {
      name: 'Collections',
      icon: <Gift className="h-5 w-5" />,
      component: CollectionManagement
    },
    {
      name: 'Coupons',
      icon: <Tag className="h-5 w-5" />,
      component: CouponManagement
    },
    {
      name: 'Marketing',
      icon: <TrendingUp className="h-5 w-5" />,
      component: MarketingManagement
    },
    {
      name: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      component: DedicatedAnalyticsDashboard
    },
    {
      name: 'Reports',
      icon: <FileText className="h-5 w-5" />,
      component: AdvancedReports
    },

    {
      name: 'Audit Logs',
      icon: <Bell className="h-5 w-5" />,
      component: AuditLogs
    },
    {
      name: 'Accessibility',
      icon: <UserCog className="h-5 w-5" />,
      component: AccessibilityDashboard
    },
    {
      name: 'Theme',
      icon: <Palette className="h-5 w-5" />,
      component: ThemeCustomizationDashboard
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      component: SettingsManagement
    }
  ], []);

  // Optimized tab switching with preloading and caching
  const handleTabSwitch = useCallback((tabName: string) => {
    const normalizedTabName = tabName.toLowerCase();
    if (normalizedTabName !== activeTab) {
      setIsLoading(true);
      setActiveTab(normalizedTabName);

      // Reduced loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 150);
    }
  }, [activeTab]);

  // Preload critical components on mount
  useEffect(() => {
    const preloadComponents = navigation.filter(item => item.preload);
    preloadComponents.forEach(item => {
      // Trigger lazy loading for preload components
      item.component;
    });
  }, [navigation]);

  // Memoized active navigation item
  const activeNavItem = useMemo(() =>
    navigation.find(item => item.name.toLowerCase() === activeTab),
    [navigation, activeTab]
  );

  const handleNavigation = async (tabName: string) => {
    const normalizedTabName = tabName.toLowerCase();
    setIsLoading(true);
    setActiveTab(normalizedTabName);

    if (isMobile) {
      setSidebarOpen(false); // Close mobile sidebar after navigation
    }

    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Skip Links for Accessibility */}
      <div className="sr-only">
        <a href="#main-content" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        <a href="#sidebar-nav" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-blue-600 text-white px-4 py-2 rounded z-50">
          Skip to navigation
        </a>
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isMobile
          ? sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          : sidebarCollapsed ? 'w-16' : 'w-64'
          } ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'flex-shrink-0'
          } bg-white transform transition-all duration-300 ease-in-out shadow-lg border-r border-gray-200 h-full`}
        aria-label="Admin navigation sidebar"
        role="navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200">
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            )}

            {/* Toggle button for desktop, close button for mobile */}
            <button
              className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${sidebarCollapsed && !isMobile ? 'mx-auto' : ''
                }`}
              onClick={isMobile ? closeSidebar : toggleSidebar}
              aria-label={isMobile ? 'Close sidebar' : 'Toggle sidebar'}
            >
              {isMobile ? (
                <X className="h-5 w-5" />
              ) : sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <nav
              id="sidebar-nav"
              className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
              aria-label="Admin dashboard navigation"
              role="navigation"
            >
              {navigation.map((item) => {
                const isActive = activeTab === item.name.toLowerCase();
                return (
                  <NavigationItem
                    key={item.name}
                    item={item}
                    isActive={isActive}
                    onClick={() => handleTabSwitch(item.name)}
                    collapsed={sidebarCollapsed && !isMobile}
                  />
                );
              })}
            </nav>

            {/* Footer */}
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <Bell className="h-4 w-4" />
                  <span>Admin Dashboard v2.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className="flex flex-col flex-1 min-w-0 h-full overflow-hidden"
        aria-label="Main dashboard content"
        role="main"
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {navigation.find(item => item.name.toLowerCase() === activeTab)?.name || 'Admin Dashboard'}
              </h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
          </div>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => item.name.toLowerCase() === activeTab)?.name || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your e-commerce platform
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6 lg:p-8 h-full">
            <div className="max-w-7xl mx-auto h-full">
              <AdminErrorBoundary>
                {isLoading ? (
                  <AdminLoadingState
                    type={activeTab as any}
                    message={`Loading ${activeNavItem?.name || 'content'}...`}
                  />
                ) : activeNavItem ? (
                  <ComponentRenderer
                    component={activeNavItem.component}
                    isActive={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Component not found</p>
                  </div>
                )}
              </AdminErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
