import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, X, RefreshCw, Plus, Filter, Search, SortAsc, SortDesc, Eye, Star, TrendingUp, Package, Zap, Award, Clock } from 'lucide-react';
import { ProductCard } from '../components/Product/ProductCard';
import { ProductListCard } from '../components/Product/ProductListCard';
import { AttrFilters, AttrFilterState } from '../components/Product/AttrFilters';
import { MobileProductGrid } from '../components/Mobile/MobileProductCarousel';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../contexts/ErrorContext';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingSpinner, ProgressiveLoading } from '../components/Common/LoadingSpinner';
import { ProductGridError, NetworkStatus } from '../components/Common/ErrorFallback';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ProductPageTrustSignals, RecentPurchaseNotification } from '../components/Trust';

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ProductStats {
  total: number;
  featured: number;
  newArrivals: number;
  onSale: number;
  inStock: number;
}

export const ProductionProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, categories, loading, basicLoading, detailsLoading, fetchProducts } = useProducts();
  const { error, clearError } = useError();
  const { showNotification } = useNotification();
  const { isOnline } = useNetworkStatus();

  // UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [showStats, setShowStats] = useState(true);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<AttrFilterState>({
    category: getInitialCategory(),
    search: searchParams.get('q') || '',
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    featured: false,
    newArrivals: false,
    onSale: false
  });

  // Sort options with icons
  const sortOptions: SortOption[] = [
    { value: 'featured', label: 'Featured', icon: <Star className="w-4 h-4" /> },
    { value: 'newest', label: 'Newest First', icon: <Clock className="w-4 h-4" /> },
    { value: 'price-low', label: 'Price: Low to High', icon: <SortAsc className="w-4 h-4" /> },
    { value: 'price-high', label: 'Price: High to Low', icon: <SortDesc className="w-4 h-4" /> },
    { value: 'rating', label: 'Highest Rated', icon: <Award className="w-4 h-4" /> },
    { value: 'popular', label: 'Most Popular', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'name', label: 'Name A-Z', icon: <SortAsc className="w-4 h-4" /> }
  ];

  // Get initial category from URL
  function getInitialCategory() {
    if (slug) {
      const category = categories.find(cat => cat.slug === slug);
      return category ? category.name : '';
    }
    return searchParams.get('category') || '';
  }

  // Calculate product statistics
  const productStats: ProductStats = useMemo(() => {
    return {
      total: products.length,
      featured: products.filter(p => p.is_featured).length,
      newArrivals: products.filter(p => p.is_new_arrival).length,
      onSale: products.filter(p => p.sale_price && p.sale_price < p.price).length,
      inStock: products.filter(p => p.inventory_quantity > 0).length
    };
  }, [products]);

  // Enhanced filtering logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filtering
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        (p.category && p.category.toLowerCase().includes(searchTerm)) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm))
      );
    }

    // Category filtering
    if (filters.category && filters.category !== '' && filters.category.toLowerCase() !== 'all') {
      filtered = filtered.filter(p =>
        p.category && p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price range filtering
    if (filters.priceRange) {
      filtered = filtered.filter(p => {
        const price = p.sale_price || p.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Rating filtering
    if (filters.rating > 0) {
      filtered = filtered.filter(p => p.rating_average >= filters.rating);
    }

    // Stock filtering
    if (filters.inStock) {
      filtered = filtered.filter(p => p.inventory_quantity > 0);
    }

    // Featured filtering
    if (filters.featured) {
      filtered = filtered.filter(p => p.is_featured);
    }

    // New arrivals filtering
    if (filters.newArrivals) {
      filtered = filtered.filter(p => p.is_new_arrival);
    }

    // On sale filtering
    if (filters.onSale) {
      filtered = filtered.filter(p => p.sale_price && p.sale_price < p.price);
    }

    return filtered;
  }, [products, filters]);

  // Enhanced sorting logic
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.rating_average - a.rating_average;
        });
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'price-low':
        return sorted.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
      case 'price-high':
        return sorted.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
      case 'rating':
        return sorted.sort((a, b) => b.rating_average - a.rating_average);
      case 'popular':
        return sorted.sort((a, b) => b.view_count - a.view_count);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: AttrFilterState) => {
    setFilters(newFilters);

    // Update URL params
    setSearchParams(prev => {
      if (newFilters.category && newFilters.category !== '' && newFilters.category !== 'all') {
        prev.set('category', newFilters.category);
      } else {
        prev.delete('category');
      }
      if (newFilters.search) {
        prev.set('q', newFilters.search);
      } else {
        prev.delete('q');
      }
      return prev;
    });
  }, [setSearchParams]);

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    fetchProducts(true);
  }, [clearError, fetchProducts]);

  // Handle add product
  const handleAddProduct = useCallback(() => {
    if (!user) {
      showNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to add products.'
      });
      return;
    }

    if (user.role !== 'admin' && user.role !== 'seller') {
      showNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need admin or seller privileges to add products.'
      });
      return;
    }

    setIsAddProductOpen(true);
  }, [user, showNotification]);

  // Initial data fetching
  useEffect(() => {
    console.log('ProductsPage: Fetching products on mount');
    fetchProducts();
  }, [fetchProducts]);

  // PWA-specific effects
  useEffect(() => {
    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync-products');
      }).catch(console.error);
    }

    // Handle offline/online status
    const handleOnline = () => {
      showNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Connection restored. Syncing data...'
      });
      fetchProducts(true);
    };

    const handleOffline = () => {
      showNotification({
        type: 'warning',
        title: 'Offline Mode',
        message: 'You\'re offline. Some features may be limited.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification, fetchProducts]);

  // Loading states
  if (basicLoading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="container mx-auto px-4 py-8">
          <ProgressiveLoading
            stages={[
              { name: 'Loading products...', duration: 1000 },
              { name: 'Applying filters...', duration: 500 },
              { name: 'Optimizing display...', duration: 300 }
            ]}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isOnline) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="container mx-auto px-4 py-8">
          <ProductGridError
            error={error}
            onRetry={handleRetry}
            showNetworkStatus={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Network Status */}
      <NetworkStatus />

      {/* Trust Signals */}
      <ProductPageTrustSignals />

      {/* Recent Purchase Notifications */}
      <RecentPurchaseNotification />

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {filters.category && filters.category !== 'all'
                  ? `${filters.category} Products`
                  : 'All Products'
                }
              </h1>
              <p className="text-text-secondary">
                Discover our curated collection of premium products
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {(user?.role === 'admin' || user?.role === 'seller') && (
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              )}

              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-background-secondary text-text-primary rounded-lg hover:bg-background-tertiary transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showStats ? 'Hide' : 'Show'} Stats
              </button>
            </div>
          </div>

          {/* Product Statistics */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                <div className="bg-background-secondary rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text-primary">{productStats.total}</div>
                  <div className="text-sm text-text-secondary">Total Products</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text-primary">{productStats.featured}</div>
                  <div className="text-sm text-text-secondary">Featured</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text-primary">{productStats.newArrivals}</div>
                  <div className="text-sm text-text-secondary">New Arrivals</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text-primary">{productStats.onSale}</div>
                  <div className="text-sm text-text-secondary">On Sale</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-text-primary">{productStats.inStock}</div>
                  <div className="text-sm text-text-secondary">In Stock</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={filters.search}
                  onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFiltersChange({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-background-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-background-secondary border border-border-primary rounded-lg hover:bg-background-tertiary transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {Object.values(filters).some(v =>
                (typeof v === 'string' && v !== '' && v !== 'all') ||
                (typeof v === 'boolean' && v) ||
                (Array.isArray(v) && v[0] > 0)
              ) && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
            </button>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Category: {filters.category}
                <button
                  onClick={() => handleFiltersChange({ ...filters, category: '' })}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFiltersChange({ ...filters, search: '' })}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Featured Only
                <button
                  onClick={() => handleFiltersChange({ ...filters, featured: false })}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.newArrivals && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                New Arrivals
                <button
                  onClick={() => handleFiltersChange({ ...filters, newArrivals: false })}
                  className="hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.onSale && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                On Sale
                <button
                  onClick={() => handleFiltersChange({ ...filters, onSale: false })}
                  className="hover:text-red-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                In Stock Only
                <button
                  onClick={() => handleFiltersChange({ ...filters, inStock: false })}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden lg:block w-80 flex-shrink-0"
              >
                <div className="sticky top-6">
                  <AttrFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    categories={categories}
                    products={products}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-text-secondary">
                Showing {sortedProducts.length} of {products.length} products
                {filters.category && filters.category !== 'all' && (
                  <span> in {filters.category}</span>
                )}
              </div>

              {detailsLoading && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>

            {/* Products Display */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">No products found</h3>
                <p className="text-text-secondary mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => setFilters({
                    category: '',
                    search: '',
                    priceRange: [0, 1000],
                    rating: 0,
                    inStock: false,
                    featured: false,
                    newArrivals: false,
                    onSale: false
                  })}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`
                ${viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }
              `}>
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {viewMode === 'grid' ? (
                        <ProductCard product={product} />
                      ) : (
                        <ProductListCard product={product} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More Button */}
            {sortedProducts.length > 0 && sortedProducts.length < products.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchProducts(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Products'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-80 h-full bg-background-primary overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Filters</h2>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <AttrFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    categories={categories}
                    products={products}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Product Grid for PWA */}
        <div className="lg:hidden mt-8">
          <MobileProductGrid products={sortedProducts.slice(0, 10)} />
        </div>

        {/* PWA Install Prompt */}
        {typeof window !== 'undefined' && 'serviceWorker' in navigator && (
          <div className="fixed bottom-4 right-4 z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Install App</h4>
                  <p className="text-sm opacity-90">Get the full experience with our PWA</p>
                </div>
                <button
                  onClick={() => {
                    // PWA install logic would go here
                    showNotification({
                      type: 'info',
                      title: 'PWA Install',
                      message: 'Add to home screen for the best experience!'
                    });
                  }}
                  className="bg-white text-primary-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Install
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionProductsPage;
