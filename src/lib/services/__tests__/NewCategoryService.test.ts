import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NewCategoryService } from '../NewCategoryService';
import { supabase } from '../../supabase';
import { AppError } from '../../utils/errorHandling';

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

describe('NewCategoryService', () => {
  let categoryService: NewCategoryService;
  
  beforeEach(() => {
    categoryService = new NewCategoryService();
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch all active categories', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test Description',
          image_url: 'test.jpg',
          active: true,
          sort_order: 1,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: mockData, error: null };
      
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
      
      const result = await categoryService.getCategories();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        imageUrl: 'test.jpg',
        isActive: true,
        sortOrder: 1,
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
      
      mockOrder.mockResolvedValue({ data: null, error: mockError });
      
      await expect(categoryService.getCategories()).rejects.toThrow(AppError);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'New Category Description',
        imageUrl: 'new.jpg',
        sortOrder: 2
      };
      
      const mockInsertData = {
        id: 'new1',
        name: 'New Category',
        slug: 'new-category',
        description: 'New Category Description',
        image_url: 'new.jpg',
        active: true,
        sort_order: 2,
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
      
      const result = await categoryService.createCategory(categoryData);
      
      expect(result).toEqual({
        id: 'new1',
        name: 'New Category',
        slug: 'new-category',
        description: 'New Category Description',
        imageUrl: 'new.jpg',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      });
    });
  });
});