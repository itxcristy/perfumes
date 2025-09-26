import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { CategoryService } from '../services/categoryService';
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

describe('CategoryService', () => {
  let categoryService: CategoryService;
  
  beforeEach(() => {
    categoryService = new CategoryService();
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
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(mockSelect).toHaveBeenCalledWith(
        'id,name,slug,description,image_url,active,sort_order,created_at,updated_at'
      );
      expect(mockEq).toHaveBeenCalledWith('active', true);
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true });
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
      
      await expect(categoryService.getCategories()).rejects.toThrow('Get Categories failed: Database error');
    });
  });

  describe('getCategoryBySlug', () => {
    it('should fetch category by slug', async () => {
      const mockData = {
        id: '1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        image_url: 'test.jpg',
        active: true,
        sort_order: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
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
      
      const result = await categoryService.getCategoryBySlug('test-category');
      
      expect(result).toEqual({
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

    it('should return null for non-existent category', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockResponse = { data: null, error: { code: 'PGRST116', message: 'Not found' } };
      
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
      
      const result = await categoryService.getCategoryBySlug('non-existent');
      
      expect(result).toBeNull();
    });
  });
});