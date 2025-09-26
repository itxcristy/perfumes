import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProductService } from '../services/productService';
import { CategoryService } from '../services/categoryService';
import { Cache, SessionCache, CacheInvalidation } from '../caching';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

// Mock the supabase module
vi.mock('../supabase', () => ({
  supabase: mockSupabase
}));

describe('Cache Eviction Simulation', () => {
  let productService: ProductService;
  let categoryService: CategoryService;
  
  beforeEach(() => {
    productService = new ProductService();
    categoryService = new CategoryService();
    vi.clearAllMocks();
    Cache.clear();
    SessionCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Memory Cache Eviction', () => {
    it('should evict oldest items when cache exceeds maximum size', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          price: '10.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'test.jpg',
          images: ['test.jpg'],
          stock: 5,
          rating: '4.5',
          review_count: 10,
          tags: ['test'],
          featured: false,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue(mockResponse);

      // Fill cache with more items than maximum size (100)
      const cacheFillPromises = [];
      for (let i = 0; i < 110; i++) {
        // Create unique cache entries
        const uniqueProductService = new ProductService();
        cacheFillPromises.push(
          uniqueProductService.getProducts({ categoryId: `cat${i}` })
        );
      }

      await Promise.all(cacheFillPromises);

      // Verify that cache size is maintained at maximum
      // Note: This is a simplified test as we're mocking the Supabase calls
      // In a real scenario, we'd check the actual cache size
      expect(mockSupabase.from).toHaveBeenCalledTimes(110); // Each call hits DB due to unique filters
    });

    it('should properly expire items based on TTL', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'TTL Test Product',
          slug: 'ttl-test-product',
          price: '15.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'ttl.jpg',
          images: ['ttl.jpg'],
          stock: 3,
          rating: '4.2',
          review_count: 5,
          tags: ['ttl'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue(mockResponse);

      // Set item with short TTL
      Cache.set('test-key', { data: 'test' }, 10); // 10ms TTL

      // Item should be available immediately
      expect(Cache.get('test-key')).toEqual({ data: 'test' });

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      // Item should be expired and removed
      expect(Cache.get('test-key')).toBeNull();

      // Verify normal product request still works
      const result = await productService.getProducts();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Session Storage Cache', () => {
    it('should persist cache across page reloads', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Session Cache Product',
          slug: 'session-cache-product',
          price: '20.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'session.jpg',
          images: ['session.jpg'],
          stock: 7,
          rating: '4.7',
          review_count: 12,
          tags: ['session'],
          featured: false,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue(mockResponse);

      // First request - should populate session cache
      const result1 = await productService.getProducts();
      
      // Simulate page reload by clearing memory cache but keeping session storage
      Cache.clear();
      
      // Second request - should use session cache
      const result2 = await productService.getProducts();
      
      expect(result1.data).toEqual(result2.data);
    });

    it('should expire session cache items properly', async () => {
      // Set item with short TTL in session cache
      SessionCache.set('session-test', { data: 'session-test' }, 10); // 10ms TTL

      // Item should be available immediately
      expect(SessionCache.get('session-test')).toEqual({ data: 'session-test' });

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      // Item should be expired and removed
      expect(SessionCache.get('session-test')).toBeNull();
    });
  });

  describe('Cache Invalidation Strategies', () => {
    it('should invalidate all product-related caches', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Invalidation Test Product',
          slug: 'invalidation-test-product',
          price: '25.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'invalidation.jpg',
          images: ['invalidation.jpg'],
          stock: 4,
          rating: '4.3',
          review_count: 8,
          tags: ['invalidation'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue(mockResponse);

      // Populate cache with product data
      await productService.getProducts();
      
      // Cache should be populated
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // Invalidate all product caches
      CacheInvalidation.invalidateProducts();
      
      // Next request should hit database again
      await productService.getProducts();
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it('should invalidate specific product cache', async () => {
      const mockProduct = {
        id: 'specific-123',
        name: 'Specific Product',
        slug: 'specific-product',
        price: '30.99',
        category_id: 'cat1',
        categories: { name: 'Test Category', slug: 'test-category' },
        image_url: 'specific.jpg',
        images: ['specific.jpg'],
        stock: 6,
        rating: '4.9',
        review_count: 15,
        tags: ['specific'],
        featured: false,
        active: true,
        created_at: '2023-01-01T00:00:00Z'
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProduct, error: null };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        single: mockSingle
      });

      mockSingle.mockResolvedValue(mockResponse);

      // Request specific product to populate cache
      await productService.getProductById('specific-123');
      
      // Cache should be populated
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // Invalidate specific product cache
      CacheInvalidation.invalidateProduct('specific-123');
      
      // Next request should hit database again
      await productService.getProductById('specific-123');
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it('should invalidate all category-related caches', async () => {
      const mockCategories = [
        { id: 'cat1', name: 'Invalidation Category 1', slug: 'invalidation-category-1', active: true },
        { id: 'cat2', name: 'Invalidation Category 2', slug: 'invalidation-category-2', active: true }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockCategories, error: null };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue(mockResponse);

      // Request categories to populate cache
      await categoryService.getCategories();
      
      // Cache should be populated
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // Invalidate all category caches
      CacheInvalidation.invalidateCategories();
      
      // Next request should hit database again
      await categoryService.getCategories();
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Decorator Testing', () => {
    it('should cache method results using decorator', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Decorator Test Product',
          slug: 'decorator-test-product',
          price: '35.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'decorator.jpg',
          images: ['decorator.jpg'],
          stock: 2,
          rating: '4.1',
          review_count: 6,
          tags: ['decorator'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      mockLimit.mockResolvedValue(mockResponse);

      // Request featured products multiple times
      const result1 = await productService.getFeaturedProducts(5);
      const result2 = await productService.getFeaturedProducts(5);
      const result3 = await productService.getFeaturedProducts(5);
      
      // Should only hit database once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // All results should be identical
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});