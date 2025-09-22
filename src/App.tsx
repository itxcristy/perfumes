import React, { Suspense, useEffect, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/pwa-responsive.css';
import { CombinedProvider } from './contexts/CombinedProvider';
import { Layout } from './components/Layout/Layout';
import { DatabaseErrorOverlay } from './components/Common/DatabaseErrorOverlay';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { ScrollToTop } from './components/Common/ScrollToTop';
import { PageLoader } from './components/Common/UniversalLoader';
import { GlobalMediaErrorHandler } from './components/Common/MediaErrorHandler';
import { SkipLink } from './utils/accessibilityEnhancements';
import { initializeDatabase } from './utils/database/init';

// Lazy-loaded pages for code splitting - optimized for performance
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage.tsx'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage.tsx'));
const SearchPage = React.lazy(() => import('./pages/SearchPage.tsx'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage.tsx'));
const ComparePage = React.lazy(() => import('./pages/ComparePage.tsx'));
const NewArrivalsPage = React.lazy(() => import('./pages/NewArrivalsPage.tsx'));
const DealsPage = React.lazy(() => import('./pages/DealsPage.tsx'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage.tsx'));
const CollectionsPage = React.lazy(() => import('./pages/CollectionsPage.tsx'));
const AuthPage = React.lazy(() => import('./pages/AuthPage.tsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));

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



// Universal loading fallback component
const PageLoadingFallback = memo(() => (
  <PageLoader
    text="Loading page..."
    subText="Please wait while we load the content"
  />
));

PageLoadingFallback.displayName = 'PageLoadingFallback';

function App() {
  // Initialize database on app start
  useEffect(() => {
    initializeDatabase();
  }, []);

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
          <Layout>
            <main id="main-content" className="focus:outline-none">
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
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
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
          </Layout>
          <DatabaseErrorOverlay />
        </Router>
      </CombinedProvider>
    </ErrorBoundary>
  );
}

export default App;