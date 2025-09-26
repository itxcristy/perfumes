import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ProductService } from '../services/productService';
import { supabase } from '../supabase';

// Mock Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('ProductService', () => {
  let productService: ProductService;
  
  beforeEach(() => {
    productService = new ProductService();
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with default parameters', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
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
      const mockResponse = { data: mockData, error: null, count: 1 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        order: mockOrder
      });
      
      mockOrder.mockResolvedValue(mockResponse);
      
      const result = await productService.getProducts();
      
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith(
        'id,name,slug,description,price,original_price,category_id,categories!inner(name, slug),image_url,images,stock,rating,review_count,tags,featured,active,created_at',
        { count: 'exact' }
      );
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        price: 10.99,
        originalPrice: undefined,
        categoryId: 'cat1',
        category: 'Test Category',
        images: ['test.jpg'],
        stock: 5,
        rating: 4.5,
        reviewCount: 10,
        reviews: [],
        sellerId: '',
        sellerName: '',
        tags: ['test'],
        featured: false,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z')
      });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        order: mockOrder
      });
      
      mockOrder.mockResolvedValue({ data: null, error: mockError, count: null });
      
      await expect(productService.getProducts()).rejects.toThrow('Get Products failed: Database error');
    });
  });

  describe('getProductById', () => {
    it('should fetch product by ID', async () => {
      const mockData = {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        price: '10.99',
        original_price: '15.99',
        category_id: 'cat1',
        categories: { name: 'Test Category', slug: 'test-category' },
        image_url: 'test.jpg',
        images: ['test.jpg'],
        stock: 5,
        rating: '4.5',
        review_count: 10,
        tags: ['test'],
        featured: true,
        active: true,
        created_at: '2023-01-01T00:00:00Z',
        reviews: []
      };
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockResponse = { data: mockData, error: null };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue(mockResponse);
      
      const result = await productService.getProductById('1');
      
      expect(result).toEqual({
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        price: 10.99,
        originalPrice: 15.99,
        categoryId: 'cat1',
        category: 'Test Category',
        images: ['test.jpg'],
        stock: 5,
        rating: 4.5,
        reviewCount: 10,
        reviews: [],
        sellerId: '',
        sellerName: '',
        tags: ['test'],
        featured: true,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });

  describe('getFeaturedProducts', () => {
    it('should fetch featured products with limit', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Featured Product',
          slug: 'featured-product',
          description: 'Featured Description',
          price: '20.99',
          original_price: '25.99',
          category_id: 'cat1',
          categories: { name: 'Test Category', slug: 'test-category' },
          image_url: 'featured.jpg',
          images: ['featured.jpg'],
          stock: 3,
          rating: '4.8',
          review_count: 15,
          tags: ['featured'],
          featured: true,
          active: true,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockResponse = { data: mockData, error: null };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValueOnce({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        order: mockOrder
      });
      
      mockOrder.mockReturnValue({
        limit: mockLimit
      });
      
      mockLimit.mockResolvedValue(mockResponse);
      
      const result = await productService.getFeaturedProducts(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Featured Product',
        slug: 'featured-product',
        description: 'Featured Description',
        price: 20.99,
        originalPrice: 25.99,
        categoryId: 'cat1',
        category: 'Test Category',
        images: ['featured.jpg'],
        stock: 3,
        rating: 4.8,
        reviewCount: 15,
        reviews: [],
        sellerId: '',
        sellerName: '',
        tags: ['featured'],
        featured: true,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });
});