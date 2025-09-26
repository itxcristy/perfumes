import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NewProductService } from '../NewProductService';
import { supabase } from '../../supabase';
import { AppError, ErrorCode } from '../../utils/errorHandling';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock error handling
vi.mock('../../utils/errorHandling', () => ({
  ErrorCode: {
    DATABASE_ERROR: 'DATABASE_ERROR'
  },
  AppError: class MockAppError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'AppError';
    }
  }
}));

describe('NewProductService', () => {
  let productService: NewProductService;
  
  beforeEach(() => {
    productService = new NewProductService();
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
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          seller_id: 'seller1'
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
        sellerId: 'seller1',
        sellerName: '',
        tags: ['test'],
        featured: false,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
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
      
      await expect(productService.getProducts()).rejects.toThrow(AppError);
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
        updated_at: '2023-01-01T00:00:00Z',
        seller_id: 'seller1',
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
        sellerId: 'seller1',
        sellerName: '',
        tags: ['test'],
        featured: true,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'New Product Description',
        price: 25.99,
        categoryId: 'cat1',
        sellerId: 'seller1',
        stock: 10,
        images: ['new.jpg'],
        featured: true
      };
      
      const mockInsertData = {
        id: 'new1',
        name: 'New Product',
        description: 'New Product Description',
        price: '25.99',
        category_id: 'cat1',
        seller_id: 'seller1',
        stock: 10,
        images: ['new.jpg'],
        featured: true,
        slug: 'new-product',
        active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockResponse = { data: mockInsertData, error: null };
      
      (supabase.from as Mock).mockReturnValue({
        insert: mockInsert
      });
      
      mockInsert.mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue(mockResponse);
      
      const result = await productService.createProduct(productData);
      
      expect(result).toEqual({
        id: 'new1',
        name: 'New Product',
        description: 'New Product Description',
        price: 25.99,
        categoryId: 'cat1',
        sellerId: 'seller1',
        sellerName: '',
        stock: 10,
        images: ['new.jpg'],
        tags: [],
        featured: true,
        slug: 'new-product',
        isActive: true,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });
});