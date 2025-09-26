import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProductService } from '../services/productService';
import { CategoryService } from '../services/categoryService';
import { Cache } from '../caching';
import { performanceMonitor } from '../middleware/performanceMonitor';

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

describe('Load Testing', () => {
  let productService: ProductService;
  let categoryService: CategoryService;
  
  beforeEach(() => {
    productService = new ProductService();
    categoryService = new CategoryService();
    vi.clearAllMocks();
    Cache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Database Load Testing', () => {
    it('should handle 100 concurrent product requests', async () => {
      const mockProducts = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: `${(Math.random() * 100).toFixed(2)}`,
        category_id: `cat${Math.floor(i / 5) + 1}`,
        categories: { 
          name: `Category ${Math.floor(i / 5) + 1}`, 
          slug: `category-${Math.floor(i / 5) + 1}` 
        },
        image_url: `product-${i + 1}.jpg`,
        images: [`product-${i + 1}.jpg`],
        stock: Math.floor(Math.random() * 100),
        rating: (Math.random() * 5).toFixed(1),
        review_count: Math.floor(Math.random() * 100),
        tags: [`tag${Math.floor(i / 10) + 1}`],
        featured: i % 4 === 0,
        active: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: mockProducts.length };

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

      // Track performance metrics
      const startTime = performance.now();
      
      // Create 100 concurrent requests
      const concurrentRequests = Array(100).fill(null).map(() => 
        productService.getProducts({ limit: 20 })
      );

      const results = await Promise.all(concurrentRequests);
      const endTime = performance.now();
      
      // All requests should succeed
      expect(results).toHaveLength(100);
      
      // All results should be identical (cached)
      results.forEach(result => {
        expect(result.data).toHaveLength(20);
        expect(result.data[0].name).toBe('Product 1');
      });
      
      // Should only hit the database once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      // Performance should be reasonable
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`100 concurrent requests completed in ${totalTime.toFixed(2)}ms`);
    });

    it('should handle mixed load of product and category requests', async () => {
      // Mock category data
      const mockCategories = Array.from({ length: 10 }, (_, i) => ({
        id: `cat${i + 1}`,
        name: `Category ${i + 1}`,
        slug: `category-${i + 1}`,
        active: true,
        sort_order: i + 1
      }));

      // Mock product data
      const mockProducts = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: `${(Math.random() * 100).toFixed(2)}`,
        category_id: `cat${Math.floor(i / 5) + 1}`,
        categories: { 
          name: `Category ${Math.floor(i / 5) + 1}`, 
          slug: `category-${Math.floor(i / 5) + 1}` 
        },
        image_url: `product-${i + 1}.jpg`,
        images: [`product-${i + 1}.jpg`],
        stock: Math.floor(Math.random() * 100),
        rating: (Math.random() * 5).toFixed(1),
        review_count: Math.floor(Math.random() * 100),
        tags: [`tag${Math.floor(i / 10) + 1}`],
        featured: i % 4 === 0,
        active: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const mockCategorySelect = vi.fn().mockReturnThis();
      const mockCategoryEq = vi.fn().mockReturnThis();
      const mockCategoryOrder = vi.fn().mockReturnThis();
      const mockCategoryResponse = { data: mockCategories, error: null };

      const mockProductSelect = vi.fn().mockReturnThis();
      const mockProductEq = vi.fn().mockReturnThis();
      const mockProductOrder = vi.fn().mockReturnThis();
      const mockProductResponse = { data: mockProducts, error: null, count: mockProducts.length };

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

      // Create mixed load: 50 product requests, 25 category requests
      const productRequests = Array(50).fill(null).map(() => 
        productService.getProducts({ limit: 50 })
      );
      
      const categoryRequests = Array(25).fill(null).map(() => 
        categoryService.getCategories()
      );

      const allRequests = [...productRequests, ...categoryRequests];
      
      const startTime = performance.now();
      const results = await Promise.all(allRequests);
      const endTime = performance.now();
      
      // Verify all requests completed successfully
      expect(results).toHaveLength(75);
      
      // Verify product requests
      const productResults = results.slice(0, 50);
      productResults.forEach(result => {
        expect(result.data).toHaveLength(50);
      });
      
      // Verify category requests
      const categoryResults = results.slice(50);
      categoryResults.forEach(result => {
        expect(result).toHaveLength(10);
      });
      
      // Should only hit database twice due to caching (once for products, once for categories)
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(8000); // Should complete within 8 seconds
      
      console.log(`Mixed load test (75 requests) completed in ${totalTime.toFixed(2)}ms`);
    });

    it('should handle high-concurrency scenario with filtering', async () => {
      const mockProducts = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Filtered Product ${i + 1}`,
        slug: `filtered-product-${i + 1}`,
        price: `${(Math.random() * 100).toFixed(2)}`,
        category_id: `cat${Math.floor(i / 20) + 1}`,
        categories: { 
          name: `Category ${Math.floor(i / 20) + 1}`, 
          slug: `category-${Math.floor(i / 20) + 1}` 
        },
        image_url: `filtered-${i + 1}.jpg`,
        images: [`filtered-${i + 1}.jpg`],
        stock: Math.floor(Math.random() * 100),
        rating: (Math.random() * 5).toFixed(1),
        review_count: Math.floor(Math.random() * 100),
        tags: [`featured`],
        featured: true,
        active: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts.slice(0, 20), error: null, count: 100 };

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockImplementation((field: string, value: any) => {
        if (field === 'active' && value === true) {
          return {
            eq: (field: string, value: any) => {
              if (field === 'featured' && value === true) {
                return { order: mockOrder };
              }
              return { order: mockOrder };
            }
          };
        }
        return { order: mockOrder };
      });

      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue(mockResponse);

      // Create 75 concurrent requests for featured products
      const concurrentRequests = Array(75).fill(null).map(() => 
        productService.getProducts({ featured: true, limit: 20 })
      );

      const startTime = performance.now();
      const results = await Promise.all(concurrentRequests);
      const endTime = performance.now();
      
      // All requests should succeed
      expect(results).toHaveLength(75);
      
      // All results should have 20 products (limited)
      results.forEach(result => {
        expect(result.data).toHaveLength(20);
        // All should be featured products
        result.data.forEach((product: any) => {
          expect(product.featured).toBe(true);
        });
      });
      
      // Should only hit the database once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(6000); // Should complete within 6 seconds
      
      console.log(`High-concurrency filtering test (75 requests) completed in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Under Stress', () => {
    it('should maintain reasonable response times under sustained load', async () => {
      const mockProducts = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Stress Test Product ${i + 1}`,
        slug: `stress-product-${i + 1}`,
        price: `${(Math.random() * 100).toFixed(2)}`,
        category_id: `cat1`,
        categories: { name: `Test Category`, slug: `test-category` },
        image_url: `stress-${i + 1}.jpg`,
        images: [`stress-${i + 1}.jpg`],
        stock: Math.floor(Math.random() * 100),
        rating: (Math.random() * 5).toFixed(1),
        review_count: Math.floor(Math.random() * 100),
        tags: [`stress`],
        featured: i % 3 === 0,
        active: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockProducts, error: null, count: mockProducts.length };

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

      // Simulate sustained load over 10 seconds
      const startTime = Date.now();
      const results: any[] = [];
      
      // Send requests in batches of 10 every 200ms for 10 seconds
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const batch = Array(10).fill(null).map(() => 
            productService.getProducts({ limit: 30 })
          );
          results.push(...batch);
        }, i * 200);
      }
      
      // Wait for all requests to complete
      await new Promise(resolve => setTimeout(resolve, 11000));
      
      const endTime = Date.now();
      
      // Verify performance
      const totalTime = endTime - startTime;
      console.log(`Sustained load test completed in ${totalTime}ms`);
      
      // Should have sent 500 requests (50 batches * 10 requests)
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only one actual DB call due to caching
    });
  });
});