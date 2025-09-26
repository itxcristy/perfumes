import { BaseService } from './BaseService';
import { Product } from '../../types';
import { Cache, CacheInvalidation } from '../newCaching';

/**
 * Product service handling all product-related operations
 */
export class NewProductService extends BaseService {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: {
    categoryId?: string;
    categorySlug?: string;
    sellerId?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Product[]; count: number }> {
    try {
      // Create cache key based on filters
      const cacheKey = `products:${JSON.stringify(filters || {})}`;
      
      // Try to get from cache first
      const cached = Cache.get<{ data: Product[]; count: number }>(cacheKey);
      if (cached) {
        return cached;
      }

      let query = this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          original_price,
          category_id,
          categories!inner(name, slug),
          image_url,
          images,
          stock,
          rating,
          review_count,
          tags,
          featured,
          active,
          created_at,
          updated_at,
          seller_id
        `, { count: 'exact' })
        .eq('active', true);

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.categorySlug) {
        query = query.eq('categories.slug', filters.categorySlug);
      }

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const result = {
        data: (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || '',
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
          categoryId: item.category_id,
          category: item.categories?.name || '',
          images: this.formatImagesFromDB(item.images || item.image_url),
          stock: item.stock || 0,
          rating: parseFloat(item.rating) || 0,
          reviewCount: item.review_count || 0,
          reviews: [],
          sellerId: item.seller_id || '',
          sellerName: '',
          tags: item.tags || [],
          featured: item.featured || false,
          isActive: item.active,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        })),
        count: count || 0
      };

      // Cache the result
      Cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Products');
    }
    try {
      let query = this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          original_price,
          category_id,
          categories!inner(name, slug),
          image_url,
          images,
          stock,
          rating,
          review_count,
          tags,
          featured,
          active,
          created_at,
          updated_at,
          seller_id
        `, { count: 'exact' })
        .eq('active', true);

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.categorySlug) {
        query = query.eq('categories.slug', filters.categorySlug);
      }

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || '',
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
          categoryId: item.category_id,
          category: item.categories?.name || '',
          images: this.formatImagesFromDB(item.images || item.image_url),
          stock: item.stock || 0,
          rating: parseFloat(item.rating) || 0,
          reviewCount: item.review_count || 0,
          reviews: [],
          sellerId: item.seller_id || '',
          sellerName: '',
          tags: item.tags || [],
          featured: item.featured || false,
          isActive: item.active,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        })),
        count: count || 0
      };
    } catch (error) {
      return this.handleError(error, 'Get Products');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      // Try to get from cache first
      const cacheKey = `products:${id}`;
      const cached = Cache.get<Product>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_variants(*),
          reviews(*, profiles(display_name))
        `)
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
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: this.formatImagesFromDB(data.images || data.image_url),
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Cache the result
      Cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Product By ID');
    }
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_variants(*),
          reviews(*, profiles(display_name))
        `)
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
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: this.formatImagesFromDB(data.images || data.image_url),
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Get Product By ID');
    }
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      if (!slug) {
        throw new Error('Product slug is required');
      }

      // Try to get from cache first
      const cacheKey = `products:slug:${slug}`;
      const cached = Cache.get<Product>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_variants(*),
          reviews(*, profiles(display_name))
        `)
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
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: this.formatImagesFromDB(data.images || data.image_url),
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Cache the result
      Cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Product By Slug');
    }
    try {
      if (!slug) {
        throw new Error('Product slug is required');
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_variants(*),
          reviews(*, profiles(display_name))
        `)
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
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: this.formatImagesFromDB(data.images || data.image_url),
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Get Product By Slug');
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      // Try to get from cache first
      const cacheKey = `featured_products:${limit}`;
      const cached = Cache.get<Product[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          original_price,
          category_id,
          categories!inner(name, slug),
          image_url,
          images,
          stock,
          rating,
          review_count,
          tags,
          featured,
          active,
          created_at
        `)
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const result = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
        categoryId: item.category_id,
        category: item.categories?.name || '',
        images: this.formatImagesFromDB(item.images || item.image_url),
        stock: item.stock || 0,
        rating: parseFloat(item.rating) || 0,
        reviewCount: item.review_count || 0,
        reviews: [],
        sellerId: item.seller_id || '',
        sellerName: '',
        tags: item.tags || [],
        featured: item.featured || false,
        isActive: item.active,
        createdAt: new Date(item.created_at)
      }));

      // Cache the result
      Cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes

      return result;
    } catch (error) {
      return this.handleError(error, 'Get Featured Products');
    }
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          original_price,
          category_id,
          categories!inner(name, slug),
          image_url,
          images,
          stock,
          rating,
          review_count,
          tags,
          featured,
          active,
          created_at
        `)
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
        categoryId: item.category_id,
        category: item.categories?.name || '',
        images: this.formatImagesFromDB(item.images || item.image_url),
        stock: item.stock || 0,
        rating: parseFloat(item.rating) || 0,
        reviewCount: item.review_count || 0,
        reviews: [],
        sellerId: item.seller_id || '',
        sellerName: '',
        tags: item.tags || [],
        featured: item.featured || false,
        isActive: item.active,
        createdAt: new Date(item.created_at)
      }));
    } catch (error) {
      return this.handleError(error, 'Get Featured Products');
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    sellerId?: string;
    stock?: number;
    images?: string[];
    featured?: boolean;
  }): Promise<Product> {
    try {
      // Validate required fields
      this.validateRequired(productData, ['name', 'description', 'price', 'categoryId']);
      this.validatePositiveNumber(productData.price, 'Price');

      // Generate slug from name
      const slug = this.generateSlug(productData.name);

      const { data, error } = await this.supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.categoryId,
          seller_id: productData.sellerId || null,
          stock: productData.stock || 0,
          images: this.formatImagesForDB(productData.images),
          featured: productData.featured || false,
          slug: slug,
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
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        sellerId: data.seller_id,
        sellerName: '',
        stock: data.stock,
        images: this.formatImagesFromDB(data.images),
        tags: [],
        featured: data.featured,
        slug: data.slug,
        isActive: data.active,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateProducts();

      return result;
    } catch (error) {
      return this.handleError(error, 'Create Product');
    }
    try {
      // Validate required fields
      this.validateRequired(productData, ['name', 'description', 'price', 'categoryId']);
      this.validatePositiveNumber(productData.price, 'Price');

      // Generate slug from name
      const slug = this.generateSlug(productData.name);

      const { data, error } = await this.supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.categoryId,
          seller_id: productData.sellerId || null,
          stock: productData.stock || 0,
          images: this.formatImagesForDB(productData.images),
          featured: productData.featured || false,
          slug: slug,
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
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        sellerId: data.seller_id,
        sellerName: '',
        stock: data.stock,
        images: this.formatImagesFromDB(data.images),
        tags: [],
        featured: data.featured,
        slug: data.slug,
        isActive: data.active,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Create Product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      if (!productId) throw new Error('Product ID is required');

      // Validate price if provided
      if (updates.price !== undefined) {
        this.validatePositiveNumber(updates.price, 'Price');
      }

      // Validate stock if provided
      if (updates.stock !== undefined) {
        this.validateNonNegativeNumber(updates.stock, 'Stock');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.images !== undefined) updateData.images = this.formatImagesForDB(updates.images);
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.isActive !== undefined) updateData.active = updates.isActive;

      // Regenerate slug if name is updated
      if (updates.name !== undefined) {
        updateData.slug = this.generateSlug(updates.name);
      }

      const { data, error } = await this.supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      const result = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        sellerId: data.seller_id,
        sellerName: '',
        stock: data.stock,
        images: this.formatImagesFromDB(data.images),
        tags: [],
        featured: data.featured,
        slug: data.slug,
        isActive: data.active,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Invalidate cache
      CacheInvalidation.invalidateProduct(productId);

      return result;
    } catch (error) {
      return this.handleError(error, 'Update Product');
    }
    try {
      if (!productId) throw new Error('Product ID is required');

      // Validate price if provided
      if (updates.price !== undefined) {
        this.validatePositiveNumber(updates.price, 'Price');
      }

      // Validate stock if provided
      if (updates.stock !== undefined) {
        this.validateNonNegativeNumber(updates.stock, 'Stock');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.images !== undefined) updateData.images = this.formatImagesForDB(updates.images);
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.isActive !== undefined) updateData.active = updates.isActive;

      // Regenerate slug if name is updated
      if (updates.name !== undefined) {
        updateData.slug = this.generateSlug(updates.name);
      }

      const { data, error } = await this.supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        sellerId: data.seller_id,
        sellerName: '',
        stock: data.stock,
        images: this.formatImagesFromDB(data.images),
        tags: [],
        featured: data.featured,
        slug: data.slug,
        isActive: data.active,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleError(error, 'Update Product');
    }
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      if (!productId) throw new Error('Product ID is required');

      const { error } = await this.supabase
        .from('products')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Invalidate cache
      CacheInvalidation.invalidateProduct(productId);

      return true;
    } catch (error) {
      this.handleError(error, 'Delete Product');
      return false; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
    try {
      if (!productId) throw new Error('Product ID is required');

      const { error } = await this.supabase
        .from('products')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      return true;
    } catch (error) {
      this.handleError(error, 'Delete Product');
      return false; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
  }
}