import { BaseService } from './BaseService';
import { Category } from '../../types';
import { Cache, CacheInvalidation } from '../newCaching';

/**
 * Category service handling all category-related operations
 */
export class NewCategoryService extends BaseService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Try to get from cache first
      const cached = Cache.get<Category[]>('categories:all');
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          active,
          sort_order,
          created_at,
          updated_at
        `)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const result = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.image_url,
        isActive: item.active,
        sortOrder: item.sort_order,
        productCount: 0, // Will be calculated separately if needed
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      // Cache the result
      Cache.set('categories:all', result, 15 * 60 * 1000); // 15 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Categories');
    }
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          active,
          sort_order,
          created_at,
          updated_at
        `)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.image_url,
        isActive: item.active,
        sortOrder: item.sort_order,
        productCount: 0, // Will be calculated separately if needed
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      return this.handleError(error, 'Get Categories');
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      // Try to get from cache first
      const cacheKey = `categories:${id}`;
      const cached = Cache.get<Category>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const result = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Cache the result
      Cache.set(cacheKey, result, 15 * 60 * 1000); // 15 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Category By ID');
    }
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Get Category By ID');
    }
  }

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      if (!slug) {
        throw new Error('Category slug is required');
      }

      // Try to get from cache first
      const cacheKey = `categories:slug:${slug}`;
      const cached = Cache.get<Category>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const result = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Cache the result
      Cache.set(cacheKey, result, 15 * 60 * 1000); // 15 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Category By Slug');
    }
    try {
      if (!slug) {
        throw new Error('Category slug is required');
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Get Category By Slug');
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
  }): Promise<Category> {
    try {
      // Validate required fields
      this.validateRequired(categoryData, ['name']);

      // Generate slug from name
      const slug = this.generateSlug(categoryData.name);

      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          slug: slug,
          description: categoryData.description || null,
          image_url: categoryData.imageUrl || null,
          sort_order: categoryData.sortOrder || 0,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const result = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateCategories();

      return result;
    } catch (error) {
      return this.handleError(error, 'Create Category');
    }
    try {
      // Validate required fields
      this.validateRequired(categoryData, ['name']);

      // Generate slug from name
      const slug = this.generateSlug(categoryData.name);

      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          slug: slug,
          description: categoryData.description || null,
          image_url: categoryData.imageUrl || null,
          sort_order: categoryData.sortOrder || 0,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Create Category');
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    try {
      if (!categoryId) throw new Error('Category ID is required');

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) {
        updateData.name = updates.name;
        // Regenerate slug if name is updated
        updateData.slug = this.generateSlug(updates.name);
      }
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.isActive !== undefined) updateData.active = updates.isActive;
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

      const { data, error } = await this.supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      const result = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateCategory(categoryId);

      return result;
    } catch (error) {
      return this.handleError(error, 'Update Category');
    }
    try {
      if (!categoryId) throw new Error('Category ID is required');

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) {
        updateData.name = updates.name;
        // Regenerate slug if name is updated
        updateData.slug = this.generateSlug(updates.name);
      }
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.isActive !== undefined) updateData.active = updates.isActive;
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

      const { data, error } = await this.supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        productCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Update Category');
    }
  }

  /**
   * Delete a category (with dependency checks)
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      if (!categoryId) throw new Error('Category ID is required');

      // Check if category has active products
      const { count, error: countError } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('active', true);

      if (countError) throw countError;

      if (count && count > 0) {
        throw new Error('Cannot delete category with active products. Please move or delete products first.');
      }

      // Soft delete by setting active to false
      const { error } = await this.supabase
        .from('categories')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;

      // Invalidate cache
      CacheInvalidation.invalidateCategory(categoryId);

      return true;
    } catch (error) {
      this.handleError(error, 'Delete Category');
      return false; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
    try {
      if (!categoryId) throw new Error('Category ID is required');

      // Check if category has active products
      const { count, error: countError } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('active', true);

      if (countError) throw countError;

      if (count && count > 0) {
        throw new Error('Cannot delete category with active products. Please move or delete products first.');
      }

      // Soft delete by setting active to false
      const { error } = await this.supabase
        .from('categories')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;

      return true;
    } catch (error) {
      this.handleError(error, 'Delete Category');
      return false; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
  }
}