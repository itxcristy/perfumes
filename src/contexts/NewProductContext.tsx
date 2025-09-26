import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductContextType, Review, Category } from '../types';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';
import { NewProductService } from '../lib/services/NewProductService';
import { NewCategoryService } from '../lib/services/NewCategoryService';
import { Cache, SessionCache } from '../lib/caching';

// Initialize services
const productService = new NewProductService();
const categoryService = new NewCategoryService();

// Cache configuration
const CACHE_KEYS = {
  PRODUCTS: 'products',
  FEATURED_PRODUCTS: 'featured_products',
  CATEGORIES: 'categories'
};

const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  FEATURED_PRODUCTS: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 15 * 60 * 1000 // 15 minutes
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { setError } = useError();
  const { user: authUser } = useAuth();

  /**
   * Fetch all categories with caching
   */
  const fetchCategories = useCallback(async () => {
    try {
      // Check cache first
      const cachedCategories = Cache.get<Category[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories) {
        setCategories(cachedCategories);
        return;
      }

      const categoriesData = await categoryService.getCategories();
      
      setCategories(categoriesData);
      setIsUsingMockData(false);
      
      // Cache the results
      Cache.set(CACHE_KEYS.CATEGORIES, categoriesData, CACHE_TTL.CATEGORIES);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    }
  }, [setError]);

  /**
   * Fetch featured products with caching
   */
  const fetchFeaturedProducts = useCallback(async (limit: number = 8) => {
    try {
      setFeaturedLoading(true);
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.FEATURED_PRODUCTS}_${limit}`;
      const cached = Cache.get<Product[]>(cacheKey);
      if (cached) {
        setFeaturedProducts(cached);
        setFeaturedLoading(false);
        return;
      }

      const featuredData = await productService.getFeaturedProducts(limit);
      
      setFeaturedProducts(featuredData);
      setIsUsingMockData(false);
      
      // Cache the results
      Cache.set(cacheKey, featuredData, CACHE_TTL.FEATURED_PRODUCTS);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Failed to load featured products');
      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, [setError]);

  /**
   * Fetch all products with caching
   */
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setLoading(true);
    }
    setBasicLoading(true);

    try {
      // Check cache first (unless force refresh)
      const cachedProducts = !forceRefresh ? Cache.get<Product[]>(CACHE_KEYS.PRODUCTS) : null;
      const cachedCategories = !forceRefresh ? Cache.get<Category[]>(CACHE_KEYS.CATEGORIES) : null;

      if (cachedProducts && cachedCategories && !forceRefresh) {
        setProducts(cachedProducts);
        setCategories(cachedCategories);
        setBasicLoading(false);
        setLoading(false);
        return;
      }

      // Load categories first (critical for navigation)
      const categoriesResult = await categoryService.getCategories();
      setCategories(categoriesResult);
      Cache.set(CACHE_KEYS.CATEGORIES, categoriesResult, CACHE_TTL.CATEGORIES);

      // Load products
      const { data: productsResult } = await productService.getProducts({ limit: 50 });
      
      setProducts(productsResult);
      setIsUsingMockData(false);
      
      // Cache the results
      Cache.set(CACHE_KEYS.PRODUCTS, productsResult, CACHE_TTL.PRODUCTS);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setBasicLoading(false);
      setLoading(false);
    }
  }, [setError]);

  /**
   * Initialize data loading
   */
  useEffect(() => {
    // Start with categories (critical for navigation)
    fetchCategories();

    // Load products with a small delay to prevent blocking
    const timer = setTimeout(() => {
      fetchProducts();
    }, 50);

    // Load featured products even later
    const featuredTimer = setTimeout(() => {
      fetchFeaturedProducts();
    }, 200);

    return () => {
      clearTimeout(timer);
      clearTimeout(featuredTimer);
    };
  }, [fetchProducts, fetchCategories, fetchFeaturedProducts]);

  /**
   * Add a new product
   */
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'rating' | 'reviewCount'>) => {
    try {
      const sellerId = authUser?.id;
      const newProduct = await productService.createProduct({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        categoryId: productData.categoryId,
        sellerId: sellerId || '',
        stock: productData.stock,
        images: productData.images,
        featured: productData.featured
      });

      if (newProduct) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.PRODUCTS);
        Cache.delete(`${CACHE_KEYS.FEATURED_PRODUCTS}_8`);
        
        // Refresh data
        await fetchProducts(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Error adding product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Update an existing product
   */
  const updateProductData = async (updatedProduct: Product) => {
    try {
      const { id, createdAt, reviews, rating, reviewCount, ...updates } = updatedProduct;

      const result = await productService.updateProduct(id, updates);
      if (result) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.PRODUCTS);
        Cache.delete(`${CACHE_KEYS.FEATURED_PRODUCTS}_8`);
        
        // Refresh data
        await fetchProducts(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error updating product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Delete a product
   */
  const deleteProductData = async (productId: string) => {
    try {
      const result = await productService.deleteProduct(productId);
      if (result) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.PRODUCTS);
        Cache.delete(`${CACHE_KEYS.FEATURED_PRODUCTS}_8`);
        
        // Refresh data
        await fetchProducts(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Fetch reviews for a product
   */
  const fetchReviewsForProduct = async (productId: string): Promise<Review[]> => {
    try {
      const { data, error } = await productService.supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      return data as Review[];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };

  /**
   * Submit a review for a product
   */
  const submitReview = async (review: Omit<Review, 'id' | 'createdAt' | 'profiles'>) => {
    try {
      const payload: Partial<Review> = {
        product_id: review.productId || review.product_id!,
        rating: review.rating,
        comment: review.comment,
        title: review.title,
        created_at: new Date().toISOString()
      } as any;
      
      const { error } = await productService.supabase
        .from('reviews')
        .insert(payload);

      if (error) {
        setError('Failed to submit review: ' + error.message);
      } else {
        setError(null);
      }
    } catch (error) {
      setError('Error submitting review: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Add a new category
   */
  const addCategory = async (categoryData: Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await categoryService.createCategory({
        name: categoryData.name,
        description: categoryData.description,
        imageUrl: (categoryData as any).imageUrl || (categoryData as any).image,
        sortOrder: categoryData.sortOrder
      });

      if (newCategory) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.CATEGORIES);
        
        // Refresh data
        await fetchCategories();
        setError(null);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Error adding category: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Update an existing category
   */
  const updateCategoryData = async (updatedCategory: Category) => {
    try {
      const { id, createdAt, updatedAt, productCount, ...updates } = updatedCategory;
      const result = await categoryService.updateCategory(id, updates);

      if (result) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.CATEGORIES);
        
        // Refresh data
        await fetchCategories();
        setError(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Error updating category: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  /**
   * Delete a category
   */
  const deleteCategoryData = async (categoryId: string) => {
    try {
      const success = await categoryService.deleteCategory(categoryId);

      if (success) {
        // Invalidate cache
        Cache.delete(CACHE_KEYS.CATEGORIES);
        
        // Refresh data
        await fetchCategories();
        setError(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error deleting category: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: ProductContextType = useMemo(() => ({
    products,
    featuredProducts,
    categories,
    addProduct,
    updateProduct: updateProductData,
    deleteProduct: deleteProductData,
    fetchReviewsForProduct,
    submitReview,
    fetchProducts,
    fetchCategories,
    fetchFeaturedProducts,
    loading,
    basicLoading,
    detailsLoading,
    featuredLoading,
    isUsingMockData,
    addCategory,
    updateCategory: updateCategoryData,
    deleteCategory: deleteCategoryData
  }), [
    products,
    featuredProducts,
    categories,
    loading,
    basicLoading,
    detailsLoading,
    featuredLoading,
    isUsingMockData
  ]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};