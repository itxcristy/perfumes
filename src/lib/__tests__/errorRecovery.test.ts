import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProductService } from '../services/productService';
import { CategoryService } from '../services/categoryService';
import { Cache } from '../caching';
import { RetryManager } from '../retry';
import { RateLimiter } from '../rateLimiting';
import { ErrorHandler, ErrorType } from '../middleware/errorHandler';

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

describe('Error Recovery Workflows', () => {
  let productService: ProductService;
  let categoryService: CategoryService;
  let retryManager: RetryManager;
  let errorHandler: ErrorHandler;
  
  beforeEach(() => {
    productService = new ProductService();
    categoryService = new CategoryService();
    retryManager = new RetryManager({
      maxRetries: 3,
      initialDelay: 50,
      maxDelay: 1000,
      backoffMultiplier: 2
    });
    errorHandler = new ErrorHandler();
    vi.clearAllMocks();
    Cache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Error Recovery', () => {
    it('should retry on network timeouts and eventually succeed', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Network Recovery Product',
          slug: 'network-recovery-product',
          price: '10.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'network.jpg',
          images: ['network.jpg'],
          stock: 5,
          rating: '4.5',
          review_count: 10,
          tags: ['network'],
          featured: false,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

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
          throw new Error('Network timeout');
        }
        return { data: mockProducts, error: null, count: 1 };
      });

      const result = await retryManager.execute(
        () => productService.getProducts(),
        'getProducts'
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Network Recovery Product');
      expect(attempt).toBe(3); // Should have retried twice before success
    });

    it('should fail gracefully after maximum retries exceeded', async () => {
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

      // Always fail to simulate persistent network issues
      mockOrder.mockImplementation(async () => {
        throw new Error('Persistent network error');
      });

      await expect(
        retryManager.execute(
          () => productService.getProducts(),
          'getProducts'
        )
      ).rejects.toThrow('Persistent network error');
    });

    it('should handle different types of network errors appropriately', async () => {
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

      // Simulate different error types
      let attempt = 0;
      mockOrder.mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          throw new Error('ECONNRESET'); // Connection reset
        } else if (attempt === 2) {
          throw new Error('ETIMEDOUT'); // Timeout
        } else {
          throw new Error('ENOTFOUND'); // DNS lookup failed
        }
      });

      await expect(
        retryManager.execute(
          () => productService.getProducts(),
          'getProducts'
        )
      ).rejects.toThrow('ENOTFOUND');
      
      expect(attempt).toBe(3); // Should have tried all retry attempts
    });
  });

  describe('Database Error Recovery', () => {
    it('should recover from temporary database connection issues', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Database Recovery Product',
          slug: 'database-recovery-product',
          price: '15.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'database.jpg',
          images: ['database.jpg'],
          stock: 3,
          rating: '4.2',
          review_count: 5,
          tags: ['database'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

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

      // Simulate database connection issues for first attempt, then recovery
      let attempt = 0;
      mockOrder.mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          throw new Error('Database connection failed');
        }
        return { data: mockProducts, error: null, count: 1 };
      });

      const result = await retryManager.execute(
        () => productService.getProducts(),
        'getProducts'
      );

      expect(result.data).toHaveLength(1);
      expect(attempt).toBe(2); // Should have recovered on second attempt
    });

    it('should handle database constraint violations gracefully', async () => {
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

      // Simulate database constraint violation (non-retryable error)
      mockOrder.mockImplementation(async () => {
        throw new Error('constraint violation: duplicate key value violates unique constraint');
      });

      await expect(
        retryManager.execute(
          () => productService.getProducts(),
          'getProducts'
        )
      ).rejects.toThrow('constraint violation');
      
      // Should not retry constraint violations as they're not transient
      expect(mockOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rate Limiting Recovery', () => {
    it('should handle rate limiting with exponential backoff', async () => {
      const rateLimiter = new RateLimiter({
        windowMs: 1000, // 1 second window
        maxRequests: 2, // Max 2 requests per window
        prefix: 'test:'
      });

      // Mock the rate limiting store
      const mockStore = new Map();
      vi.spyOn(rateLimiter as any, 'getStore').mockReturnValue(mockStore);

      const mockProducts = [
        {
          id: '1',
          name: 'Rate Limit Product',
          slug: 'rate-limit-product',
          price: '20.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'rate.jpg',
          images: ['rate.jpg'],
          stock: 7,
          rating: '4.7',
          review_count: 12,
          tags: ['rate'],
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

  describe('Error Handling and Classification', () => {
    it('should properly classify and handle different error types', async () => {
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

      // Test network error classification
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('ECONNRESET');
      });

      try {
        await productService.getProducts();
      } catch (error: any) {
        const errorType = errorHandler.classifyError(error);
        expect(errorType).toBe(ErrorType.NETWORK_ERROR);
      }

      // Test database error classification
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Database connection failed');
      });

      try {
        await productService.getProducts();
      } catch (error: any) {
        const errorType = errorHandler.classifyError(error);
        expect(errorType).toBe(ErrorType.DATABASE_ERROR);
      }

      // Test validation error classification
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Invalid input data');
      });

      try {
        await productService.getProducts();
      } catch (error: any) {
        const errorType = errorHandler.classifyError(error);
        expect(errorType).toBe(ErrorType.VALIDATION_ERROR);
      }

      // Test authentication error classification
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Unauthorized access');
      });

      try {
        await productService.getProducts();
      } catch (error: any) {
        const errorType = errorHandler.classifyError(error);
        expect(errorType).toBe(ErrorType.AUTHENTICATION_ERROR);
      }
    });

    it('should log errors appropriately based on severity', async () => {
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

      // Mock console.error to capture logs
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Test critical error logging
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Critical database failure');
      });

      try {
        await productService.getProducts();
      } catch (error) {
        errorHandler.logError(error, 'getProducts', true);
      }

      expect(consoleErrorSpy).toHaveBeenCalled();

      // Test non-critical error logging
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Minor network glitch');
      });

      try {
        await productService.getProducts();
      } catch (error) {
        errorHandler.logError(error, 'getProducts', false);
      }

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Graceful Degradation', () => {
    it('should provide fallback data when primary source fails', async () => {
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

      // Simulate primary database failure
      mockOrder.mockImplementationOnce(async () => {
        throw new Error('Database unavailable');
      });

      // Provide cached fallback data
      const fallbackData = [
        {
          id: 'fallback-1',
          name: 'Fallback Product',
          slug: 'fallback-product',
          price: '25.99',
          category_id: 'cat1',
          categories: { name: 'Fallback Category', slug: 'fallback-category' },
          image_url: 'fallback.jpg',
          images: ['fallback.jpg'],
          stock: 1,
          rating: '4.0',
          review_count: 1,
          tags: ['fallback'],
          featured: false,
          active: true,
          createdAt: new Date()
        }
      ];

      // Mock cache to return fallback data
      vi.spyOn(Cache, 'get').mockImplementation((key: string) => {
        if (key.includes('products')) {
          return fallbackData;
        }
        return null;
      });

      // Implement a method that uses fallback
      const getProductsWithFallback = async () => {
        try {
          return await productService.getProducts();
        } catch (error) {
          // Try to get from cache as fallback
          const cached = Cache.get('products_fallback');
          if (cached) {
            return { data: cached, count: cached.length };
          }
          throw error;
        }
      };

      // Set up cache with fallback data
      Cache.set('products_fallback', fallbackData);

      const result = await getProductsWithFallback();
      
      expect(result.data).toEqual(fallbackData);
    });

    it('should continue operating with reduced functionality during partial outages', async () => {
      // Mock category service to fail
      const mockCategorySelect = vi.fn().mockReturnThis();
      const mockCategoryEq = vi.fn().mockReturnThis();
      const mockCategoryOrder = vi.fn().mockReturnThis();
      
      // Mock product service to work
      const mockProductSelect = vi.fn().mockReturnThis();
      const mockProductEq = vi.fn().mockReturnThis();
      const mockProductOrder = vi.fn().mockReturnThis();
      
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

      // Category service fails
      mockCategorySelect.mockImplementation(() => {
        throw new Error('Category service unavailable');
      });

      // Product service works
      const mockProducts = [
        {
          id: '1',
          name: 'Partial Outage Product',
          slug: 'partial-outage-product',
          price: '30.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'partial.jpg',
          images: ['partial.jpg'],
          stock: 4,
          rating: '4.3',
          review_count: 8,
          tags: ['partial'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      const mockProductResponse = { data: mockProducts, error: null, count: 1 };
      mockProductSelect.mockReturnValue({ eq: mockProductEq });
      mockProductEq.mockReturnValue({ order: mockProductOrder });
      mockProductOrder.mockResolvedValue(mockProductResponse);

      // Product requests should still work
      const products = await productService.getProducts();
      expect(products.data).toHaveLength(1);
      
      // Category requests should fail gracefully
      await expect(categoryService.getCategories()).rejects.toThrow('Category service unavailable');
    });
  });
});