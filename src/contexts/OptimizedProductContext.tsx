import React, { createContext, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Product, Category, Review, ProductContextType } from '../types';
import { useNormalizedState, useMemoizedSelector, useBatchedUpdates } from '../utils/stateManagement';
import { useError } from './ErrorContext';
import { useNotification } from './NotificationContext';
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  addReview
} from '../lib/supabase';
import {
  createProduct,
  updateProduct,
  deleteProduct
} from '../lib/crudOperations';
import { primaryCache } from '../utils/cache';

// Enhanced context type with normalized state benefits
interface OptimizedProductContextType extends Omit<ProductContextType, 'products' | 'featuredProducts' | 'categories'> {
  // Normalized state selectors
  getAllProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getFeaturedProducts: () => Product[];
  getProductsByIds: (ids: string[]) => Product[];

  // Category selectors
  getAllCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByParent: (parentId?: string) => Category[];

  // Advanced filtering and sorting
  searchProducts: (query: string) => Product[];
  filterProducts: (filters: ProductFilters) => Product[];
  sortProducts: (products: Product[], sortBy: ProductSortBy) => Product[];

  // Pagination
  getProductsPaginated: (page: number, pageSize: number) => Product[];

  // Cache management
  invalidateCache: () => void;
  refreshData: () => Promise<void>;

  // Performance metrics
  getPerformanceMetrics: () => {
    totalProducts: number;
    totalCategories: number;
    cacheHitRate: number;
    lastUpdated: number;
  };
}

interface ProductFilters {
  categoryId?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  rating?: number;
}

type ProductSortBy = 'name' | 'price' | 'rating' | 'createdAt' | 'popularity';

const OptimizedProductContext = createContext<OptimizedProductContextType | undefined>(undefined);

export const useOptimizedProducts = () => {
  const context = useContext(OptimizedProductContext);
  if (!context) {
    throw new Error('useOptimizedProducts must be used within an OptimizedProductProvider');
  }
  return context;
};

interface OptimizedProductProviderProps {
  children: ReactNode;
  enablePersistence?: boolean;
  cacheTimeout?: number;
}

export const OptimizedProductProvider: React.FC<OptimizedProductProviderProps> = ({
  children,
  enablePersistence = true,
  cacheTimeout = 5 * 60 * 1000 // 5 minutes
}) => {
  const { setError } = useError();
  const { showNotification } = useNotification();
  const batchUpdate = useBatchedUpdates();

  // Normalized state for products and categories
  const products = useNormalizedState<Product>('products', {
    enablePersistence,
    cacheTimeout,
    enableOptimisticUpdates: true
  });

  const categories = useNormalizedState<Category>('categories', {
    enablePersistence,
    cacheTimeout
  });

  // Memoized selectors for better performance
  const productSelectors = useMemo(() => ({
    getAllProducts: () => products.selectors.getAll(),

    getProductById: (id: string) => products.selectors.getById(id),

    getProductsByCategory: (categoryId: string) =>
      products.selectors.getFiltered(product => product.categoryId === categoryId),

    getFeaturedProducts: () =>
      products.selectors.getFiltered(product => product.featured),

    getProductsByIds: (ids: string[]) => products.selectors.getByIds(ids),

    searchProducts: (query: string) => {
      const searchTerm = query.toLowerCase();
      return products.selectors.getFiltered(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    },

    filterProducts: (filters: ProductFilters) => {
      return products.selectors.getFiltered(product => {
        if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
        if (filters.priceRange) {
          const { min, max } = filters.priceRange;
          if (product.price < min || product.price > max) return false;
        }
        if (filters.inStock !== undefined && (product.stock > 0) !== filters.inStock) return false;
        if (filters.featured !== undefined && product.featured !== filters.featured) return false;
        if (filters.tags && !filters.tags.some(tag => product.tags.includes(tag))) return false;
        if (filters.rating && product.rating < filters.rating) return false;
        return true;
      });
    },

    sortProducts: (productList: Product[], sortBy: ProductSortBy) => {
      return [...productList].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return a.price - b.price;
          case 'rating':
            return b.rating - a.rating;
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'popularity':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          default:
            return 0;
        }
      });
    },

    getProductsPaginated: (page: number, pageSize: number) =>
      products.selectors.getPaginated(page, pageSize)
  }), [products.selectors]);

  const categorySelectors = useMemo(() => ({
    getAllCategories: () => categories.selectors.getAll(),

    getCategoryById: (id: string) => categories.selectors.getById(id),

    getCategoriesByParent: (parentId?: string) =>
      categories.selectors.getFiltered(category => category.parentId === parentId)
  }), [categories.selectors]);

  // Data fetching with caching
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'products_all';

    if (!forceRefresh) {
      const cached = primaryCache.get<Product[]>(cacheKey);
      if (cached && !products.selectors.isStale()) {
        products.actions.setEntities(cached);
        return;
      }
    }

    try {
      products.actions.setLoading(true);
      const fetchedProducts = await getProducts();

      batchUpdate(() => {
        products.actions.setEntities(fetchedProducts, true);
        primaryCache.set(cacheKey, fetchedProducts, { ttl: cacheTimeout });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      products.actions.setError(errorMessage);
      setError(errorMessage);
    }
  }, [products.actions, products.selectors, batchUpdate, cacheTimeout, setError]);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'categories_all';

    if (!forceRefresh) {
      const cached = primaryCache.get<Category[]>(cacheKey);
      if (cached && !categories.selectors.isStale()) {
        categories.actions.setEntities(cached);
        return;
      }
    }

    try {
      categories.actions.setLoading(true);
      const fetchedCategories = await getCategories();

      batchUpdate(() => {
        categories.actions.setEntities(fetchedCategories, true);
        primaryCache.set(cacheKey, fetchedCategories, { ttl: cacheTimeout });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      categories.actions.setError(errorMessage);
      setError(errorMessage);
    }
  }, [categories.actions, categories.selectors, batchUpdate, cacheTimeout, setError]);

  // CRUD operations will be re-implemented with proper error handling
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'rating' | 'reviewCount'>) => {
    products.actions.setError('Product creation functionality is being rebuilt. Please try again later.');
    showNotification({
      type: 'error',
      title: 'Feature Unavailable',
      message: 'Product creation functionality is being rebuilt. Please try again later.'
    });
    console.log('addProduct called with:', productData);
  }, [products.actions, showNotification]);

  const updateProductData = useCallback(async (updatedProduct: Product) => {
    products.actions.setError('Product update functionality is being rebuilt. Please try again later.');
    showNotification({
      type: 'error',
      title: 'Feature Unavailable',
      message: 'Product update functionality is being rebuilt. Please try again later.'
    });
    console.log('updateProductData called with:', updatedProduct);
  }, [products.actions, showNotification]);

  const deleteProductData = useCallback(async (productId: string) => {
    products.actions.setError('Product deletion functionality is being rebuilt. Please try again later.');
    showNotification({
      type: 'error',
      title: 'Feature Unavailable',
      message: 'Product deletion functionality is being rebuilt. Please try again later.'
    });
    console.log('deleteProductData called with:', productId);
  }, [products.actions, showNotification]);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => ({
    totalProducts: products.selectors.getCount(),
    totalCategories: categories.selectors.getCount(),
    cacheHitRate: primaryCache.getStats().hitRate,
    lastUpdated: Math.max(products.lastUpdated, categories.lastUpdated)
  }), [products.selectors, products.lastUpdated, categories.selectors, categories.lastUpdated]);

  // Initialize data on mount
  useEffect(() => {
    if (products.selectors.isStale()) {
      fetchProducts();
    }
    if (categories.selectors.isStale()) {
      fetchCategories();
    }
  }, [fetchProducts, fetchCategories, products.selectors, categories.selectors]);

  const contextValue: OptimizedProductContextType = useMemo(() => ({
    // Selectors
    ...productSelectors,
    ...categorySelectors,

    // CRUD operations
    addProduct,
    updateProduct: updateProductData,
    deleteProduct: deleteProductData,

    // Legacy compatibility
    fetchReviewsForProduct: async (productId: string) => {
      const product = products.selectors.getById(productId);
      return product?.reviews || [];
    },
    submitReview: async (review: Omit<Review, 'id' | 'createdAt' | 'profiles'>) => {
      await addReview(review);
      // Refresh product to get updated reviews
      fetchProducts(true);
    },
    fetchProducts,
    fetchCategories,
    fetchFeaturedProducts: () => fetchProducts(),

    // State
    loading: products.isLoading || categories.isLoading,
    basicLoading: products.isLoading,
    detailsLoading: false,
    featuredLoading: products.isLoading,
    isUsingMockData: false,

    // Category operations (simplified for now)
    addCategory: async () => { },
    updateCategory: async () => { },
    deleteCategory: async () => { },

    // Cache management
    invalidateCache: () => {
      products.actions.invalidate();
      categories.actions.invalidate();
      primaryCache.clear();
    },
    refreshData: async () => {
      await Promise.all([
        fetchProducts(true),
        fetchCategories(true)
      ]);
    },

    // Performance
    getPerformanceMetrics
  }), [
    productSelectors,
    categorySelectors,
    addProduct,
    updateProductData,
    deleteProductData,
    fetchProducts,
    fetchCategories,
    products.isLoading,
    products.actions,
    categories.isLoading,
    categories.actions,
    getPerformanceMetrics
  ]);

  return (
    <OptimizedProductContext.Provider value={contextValue}>
      {children}
    </OptimizedProductContext.Provider>
  );
};
