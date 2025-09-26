import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { QueryBuilder, ProductQueryBuilder, CategoryQueryBuilder } from '../queryBuilder';
import { supabase } from '../supabase';

// Mock Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('QueryBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base QueryBuilder', () => {
    it('should build basic select query', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockResolvedValue(mockResponse);
      
      const result = await queryBuilder.execute();
      
      expect(supabase.from).toHaveBeenCalledWith('test_table');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(result).toEqual({ data: [], count: 0 });
    });

    it('should build query with specific fields', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockResolvedValue(mockResponse);
      
      const result = await queryBuilder.select('id', 'name').execute();
      
      expect(mockSelect).toHaveBeenCalledWith('id,name', { count: 'exact' });
      expect(result).toEqual({ data: [], count: 0 });
    });

    it('should build query with filters', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockNeq = vi.fn().mockReturnThis();
      const mockGt = vi.fn().mockReturnThis();
      const mockLt = vi.fn().mockReturnThis();
      const mockLike = vi.fn().mockReturnThis();
      const mockIlike = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockReturnValue({
        neq: mockNeq
      });
      
      mockNeq.mockReturnValue({
        gt: mockGt
      });
      
      mockGt.mockReturnValue({
        lt: mockLt
      });
      
      mockLt.mockReturnValue({
        like: mockLike
      });
      
      mockLike.mockReturnValue({
        ilike: mockIlike
      });
      
      mockIlike.mockResolvedValue(mockResponse);
      
      const result = await queryBuilder
        .eq('status', 'active')
        .neq('type', 'draft')
        .gt('price', 10)
        .lt('stock', 100)
        .like('name', 'test')
        .ilike('description', 'sample')
        .execute();
      
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(mockNeq).toHaveBeenCalledWith('type', 'draft');
      expect(mockGt).toHaveBeenCalledWith('price', 10);
      expect(mockLt).toHaveBeenCalledWith('stock', 100);
      expect(mockLike).toHaveBeenCalledWith('name', 'test');
      expect(mockIlike).toHaveBeenCalledWith('description', 'sample');
      expect(result).toEqual({ data: [], count: 0 });
    });

    it('should build query with ordering', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        order: mockOrder
      });
      
      mockOrder.mockResolvedValue(mockResponse);
      
      const result = await queryBuilder
        .order('created_at', true)
        .order('name', false)
        .execute();
      
      expect(mockOrder).toHaveBeenCalledTimes(2);
      expect(mockOrder).toHaveBeenNthCalledWith(1, 'created_at', { ascending: true });
      expect(mockOrder).toHaveBeenNthCalledWith(2, 'name', { ascending: false });
      expect(result).toEqual({ data: [], count: 0 });
    });

    it('should build query with limit and offset', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        limit: mockLimit,
        range: mockRange
      });
      
      mockLimit.mockResolvedValue(mockResponse);
      mockRange.mockResolvedValue(mockResponse);
      
      // Test with limit only
      await queryBuilder.limit(10).execute();
      expect(mockLimit).toHaveBeenCalledWith(10);
      
      // Test with limit and offset
      await queryBuilder.limit(10).offset(20).execute();
      expect(mockRange).toHaveBeenCalledWith(20, 29);
    });

    it('should handle errors gracefully', async () => {
      const queryBuilder = new QueryBuilder('test_table');
      const mockSelect = vi.fn().mockReturnThis();
      const mockError = new Error('Database error');
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockResolvedValue({ data: null, error: mockError, count: null });
      
      await expect(queryBuilder.execute()).rejects.toThrow('Database error');
    });
  });

  describe('ProductQueryBuilder', () => {
    it('should initialize with default product fields', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockResolvedValue(mockResponse);
      
      await queryBuilder.execute();
      
      expect(mockSelect).toHaveBeenCalledWith(
        'id,name,slug,description,price,original_price,category_id,categories!inner(name, slug),image_url,images,stock,rating,review_count,tags,featured,active,created_at',
        { count: 'exact' }
      );
    });

    it('should apply category filter', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockResolvedValue(mockResponse);
      
      await queryBuilder.byCategory('cat1').execute();
      
      expect(mockEq).toHaveBeenCalledWith('category_id', 'cat1');
    });

    it('should apply category slug filter', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockResolvedValue(mockResponse);
      
      await queryBuilder.byCategorySlug('test-category').execute();
      
      expect(mockEq).toHaveBeenCalledWith('categories.slug', 'test-category');
    });

    it('should apply seller filter', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockResolvedValue(mockResponse);
      
      await queryBuilder.bySeller('seller1').execute();
      
      expect(mockEq).toHaveBeenCalledWith('seller_id', 'seller1');
    });

    it('should apply featured filter', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockResolvedValue(mockResponse);
      
      await queryBuilder.featured(true).execute();
      
      expect(mockEq).toHaveBeenCalledWith('featured', true);
    });

    it('should apply search filter', async () => {
      const queryBuilder = new ProductQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockIlike = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        ilike: mockIlike
      });
      
      mockIlike.mockResolvedValue(mockResponse);
      
      await queryBuilder.search('perfume').execute();
      
      expect(mockIlike).toHaveBeenCalledWith('name', '%perfume%');
    });
  });

  describe('CategoryQueryBuilder', () => {
    it('should initialize with default category fields', async () => {
      const queryBuilder = new CategoryQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockResolvedValue(mockResponse);
      
      await queryBuilder.execute();
      
      expect(mockSelect).toHaveBeenCalledWith(
        'id,name,slug,description,image_url,active,sort_order,created_at,updated_at'
      );
    });

    it('should apply active filter', async () => {
      const queryBuilder = new CategoryQueryBuilder();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockResponse = { data: [], error: null, count: 0 };
      
      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        eq: mockEq
      });
      
      mockEq.mockResolvedValue(mockResponse);
      
      await queryBuilder.active().execute();
      
      expect(mockEq).toHaveBeenCalledWith('active', true);
    });
  });
});