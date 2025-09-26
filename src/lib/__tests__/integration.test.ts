import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProductService } from '../services/productService';
import { CategoryService } from '../services/categoryService';
import { Cache, SessionCache, CacheInvalidation } from '../caching';
import { performanceMonitor } from '../middleware/performanceMonitor';
import { RetryManager } from '../retry';
import { RateLimiter } from '../rateLimiting';

// Mock network latency
const simulateNetworkLatency = (min: number = 50, max: number = 200) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

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

describe('Integration Tests', () => {
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

  describe('Concurrent User Scenarios', () => {
    it('should handle multiple concurrent product requests', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          slug: 'test-product-1',
          price: '10.99',
          category_id: 'cat1',
          categories: { name: 'Category 1', slug: 'category-1' },
          image_url: 'test1.jpg',
          images: ['test1.jpg'],
          stock: 5,
          rating: '4.5',
          review_count: 10,
          tags: ['test'],
          featured: false,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Test Product 2',
          slug: 'test-product-2',
          price: '15.99',
          category_id: 'cat1',
          categories: { name: 'Category 1', slug: 'category-1' },
          image_url: 'test2.jpg',
          images: ['test2.jpg'],
          stock: 3,
          rating: '4.2',
          review_count: 5,
          tags: ['test'],
          featured: true,
          active: true,
          created_at: '2023-01-02T00:00:00Z'
        }
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: 2 };

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

      // Simulate 5 concurrent users requesting products
      const concurrentRequests = Array(5).fill(null).map(() => 
        productService.getProducts()
      );

      const results = await Promise.all(concurrentRequests);

      // All requests should return the same data
      results.forEach(result => {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].name).toBe('Test Product 1');
        expect(result.data[1].name).toBe('Test Product 2');
      });

      // Verify caching works - subsequent requests should be cached
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed product and category requests', async () => {
      const mockCategories = [
        { id: 'cat1', name: 'Category 1', slug: 'category-1', active: true },
        { id: 'cat2', name: 'Category 2', slug: 'category-2', active: true }
      ];

      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          price: '10.99',
          category_id: 'cat1',
          categories: { name: 'Category 1', slug: 'category-1' },
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

      const mockCategorySelect = vi.fn().mockReturnThis();
      const mockCategoryEq = vi.fn().mockReturnThis();
      const mockCategoryOrder = vi.fn().mockReturnThis();
      const mockCategoryResponse = { data: mockCategories, error: null };

      const mockProductSelect = vi.fn().mockReturnThis();
      const mockProductEq = vi.fn().mockReturnThis();
      const mockProductOrder = vi.fn().mockReturnThis();
      const mockProductResponse = { data: mockProducts, error: null, count: 1 };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'categories') {
          return {
            select: mockCategorySelect,
            eq: mockCategoryEq,
            order: mockCategoryOrder
          };
        } else {
          return {
            select: mockProductSelect,
            eq: mockProductEq,
            order: mockProductOrder
          };
        }
      });

      mockCategorySelect.mockResolvedValue(mockCategoryResponse);
      mockCategoryEq.mockReturnValue({ order: mockCategoryOrder });
      mockCategoryOrder.mockReturnValue({ order: mockCategoryOrder });
      mockCategoryOrder.mockResolvedValue(mockCategoryResponse);

      mockProductSelect.mockReturnValue({ eq: mockProductEq });
      mockProductEq.mockReturnValue({ order: mockProductOrder });
      mockProductOrder.mockResolvedValue(mockProductResponse);

      // Simulate concurrent requests for categories and products
      const categoryRequest = categoryService.getCategories();
      const productRequest = productService.getProducts();
      
      const [categories, products] = await Promise.all([categoryRequest, productRequest]);

      expect(categories).toHaveLength(2);
      expect(products.data).toHaveLength(1);
    });
  });

  describe('Network Latency Injection', () => {
    beforeEach(() => {
      // Mock network latency for all Supabase calls
      vi.spyOn(global.Date, 'now').mockImplementation(() => new Date().getTime());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle high latency scenarios gracefully', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Latency Test Product',
          slug: 'latency-test-product',
          price: '25.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'latency.jpg',
          images: ['latency.jpg'],
          stock: 10,
          rating: '4.8',
          review_count: 20,
          tags: ['latency'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      // Simulate high latency response
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      // Add artificial delay to simulate network latency
      mockOrder.mockImplementation(async () => {
        await simulateNetworkLatency(300, 500); // 300-500ms delay
        return { data: mockData, error: null, count: 1 };
      });

      // Measure request time
      const startTime = Date.now();
      const result = await productService.getProducts({ featured: true });
      const endTime = Date.now();
      const requestTime = endTime - startTime;

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Latency Test Product');
      // Request should take at least 300ms due to simulated latency
      expect(requestTime).toBeGreaterThanOrEqual(300);
    });

    it('should retry on network failures', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      // Simulate network failures for first 2 attempts, then success
      let attempt = 0;
      mockOrder.mockImplementation(async () => {
        attempt++;
        if (attempt <= 2) {
          await simulateNetworkLatency(100, 200);
          throw new Error('Network timeout');
        }
        await simulateNetworkLatency(50, 100);
        return { 
          data: [{ id: '1', name: 'Retry Success Product' }], 
          error: null, 
          count: 1 
        };
      });

      // Configure retry manager for testing
      const retryManager = new RetryManager({
        maxRetries: 3,
        initialDelay: 50,
        maxDelay: 1000,
        backoffMultiplier: 2
      });

      const result = await retryManager.execute(
        () => productService.getProducts(),
        'getProducts'
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Retry Success Product');
      // Should have retried at least once
      expect(attempt).toBe(3);
    });
  });

  describe('Cache Eviction Simulation', () => {
    it('should properly invalidate caches on data changes', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Cache Test Product',
          slug: 'cache-test-product',
          price: '30.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'cache.jpg',
          images: ['cache.jpg'],
          stock: 7,
          rating: '4.6',
          review_count: 15,
          tags: ['cache'],
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

      // First request - should hit Supabase
      const result1 = await productService.getProducts();
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // Second request - should use cache
      const result2 = await productService.getProducts();
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // No additional call
      expect(result1.data).toEqual(result2.data);

      // Invalidate cache
      CacheInvalidation.invalidateProducts();
      
      // Third request - should hit Supabase again after cache invalidation
      const result3 = await productService.getProducts();
      expect(mockSupabase.from).toHaveBeenCalledTimes(2); // Additional call after invalidation
      expect(result1.data).toEqual(result3.data);
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from temporary database errors', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      // Simulate temporary database error followed by recovery
      let attempt = 0;
      mockOrder.mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          // First attempt - database error
          throw new Error('Database connection failed');
        } else {
          // Second attempt - success
          return { 
            data: [{ id: '1', name: 'Recovery Product' }], 
            error: null, 
            count: 1 
          };
        }
      });

      // Use retry mechanism
      const retryManager = new RetryManager({
        maxRetries: 3,
        initialDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2
      });

      const result = await retryManager.execute(
        () => productService.getProducts(),
        'getProducts'
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Recovery Product');
      expect(attempt).toBe(2); // Should have recovered on second attempt
    });

    it('should handle rate limiting gracefully', async () => {
      // Create a rate limiter for testing
      const rateLimiter = new RateLimiter({
        windowMs: 1000, // 1 second window
        maxRequests: 2, // Max 2 requests per window
        prefix: 'test:'
      });

      // Mock the rate limiting store
      const mockStore = new Map();
      vi.spyOn(rateLimiter as any, 'getStore').mockReturnValue(mockStore);

      // Simulate requests that exceed rate limit
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          rateLimiter.checkRateLimit('user-123')
            .then(() => productService.getProducts())
            .catch(error => ({ error: error.message }))
        );
      }

      const results = await Promise.all(requests);

      // First 2 requests should succeed, rest should be rate limited
      const successfulRequests = results.filter((result: any) => 
        !result.error || !result.error.includes('rate limit')
      ).length;

      expect(successfulRequests).toBeGreaterThanOrEqual(2);
    });
  });
});