import React, { Suspense, useEffect, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@/styles/pwa-responsive.css';
import { CombinedProvider } from '@/contexts/CombinedProvider';
import { Layout } from '@/components/Layout/Layout';
import { DatabaseErrorOverlay } from '@/components/Common/DatabaseErrorOverlay';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { ScrollToTop } from '@/components/Common/ScrollToTop';
import { PageLoader } from '@/components/Common/UniversalLoader';
import { GlobalMediaErrorHandler } from '@/components/Common/MediaErrorHandler';
import { SkipLink } from '@/utils/accessibilityEnhancements';

// Lazy-loaded pages for code splitting - optimized for performance
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const ProductsPage = React.lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'));
const SearchPage = React.lazy(() => import('@/pages/SearchPage'));
const WishlistPage = React.lazy(() => import('@/pages/WishlistPage'));
const ComparePage = React.lazy(() => import('@/pages/ComparePage'));
const NewArrivalsPage = React.lazy(() => import('@/pages/NewArrivalsPage'));
const DealsPage = React.lazy(() => import('@/pages/DealsPage'));
const CategoriesPage = React.lazy(() => import('@/pages/CategoriesPage'));
const CollectionsPage = React.lazy(() => import('@/pages/CollectionsPage'));
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage')); // Added About page

// Heavy admin/dashboard pages - loaded only when needed
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage.tsx').then(module => ({ default: module.default }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProductionProfilePage.tsx').then(module => ({ default: module.default }))
);
const CheckoutPage = React.lazy(() =>
  import('./pages/CheckoutPage.tsx').then(module => ({ default: module.default }))
);
const OrdersPage = React.lazy(() =>
  import('./pages/OrdersPage.tsx').then(module => ({ default: module.default }))
);
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage.tsx').then(module => ({ default: module.default }))
);



// Universal optimized loading fallback component
const PageLoadingFallback = memo(() => (
  <div className="min-h-screen bg-white">
    {/* Show immediate header skeleton */
    }
    <div className="h-16 bg-white shadow-sm animate-pulse">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Show hero skeleton */
    }
    <div className="min-h-[50vh] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-80 bg-white/20 rounded mb-4 mx-auto"></div>
        <div className="h-6 w-60 bg-white/20 rounded mx-auto"></div>
      </div>
    </div>
  </div>
));

PageLoadingFallback.displayName = 'PageLoadingFallback';

function App() {
  // Handle media errors globally
  useEffect(() => {
    const handleMediaError = (e: Event) => {
      const target = e.target as HTMLMediaElement;
      // Prevent the error from propagating
      e.stopImmediatePropagation();
    };

    // Add event listeners for media elements
    document.addEventListener('error', handleMediaError, true);

    return () => {
      document.removeEventListener('error', handleMediaError, true);
    };
  }, []);

  // Initialize accessibility features
  useEffect(() => {
    // This will add skip links and other accessibility features
    const initializeAccessibility = async () => {
      const { initializeAccessibility } = await import('./utils/accessibilityEnhancements');
      initializeAccessibility();
    };

    initializeAccessibility();
  }, []);



  return (
    <ErrorBoundary>
      <CombinedProvider>
        <Router>
          <GlobalMediaErrorHandler />
          <ScrollToTop />
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Admin routes - NO Layout wrapper (has its own AdminLayout) */}
              <Route path="/admin/*" element={<DashboardPage />} />

              {/* Regular routes - WITH Layout wrapper */}
              <Route path="/*" element={
                <Layout>
                  <main id="main-content" className="focus:outline-none">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/dashboard/*" element={<DashboardPage />} />
                      {/* <Route path="/profile" element={<ProfilePage />} /> */}
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                      <Route path="/deals" element={<DealsPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/categories/:slug" element={<ProductsPage />} />
                      <Route path="/collections" element={<CollectionsPage />} />
                      <Route path="/collections/:slug" element={<ProductsPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/about" element={<AboutPage />} /> {/* Added About route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                </Layout>
              } />
            </Routes>
          </Suspense>
          <DatabaseErrorOverlay />
        </Router>
      </CombinedProvider>
    </ErrorBoundary>
  );
}

export default App;