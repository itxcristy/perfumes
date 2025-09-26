import { DataService, supabase } from '../dataService';
import { Product } from '../../types';

export class ProductService extends DataService {
  // Get all products with optional filters
  async getProducts(filters?: {
    categoryId?: string;
    categorySlug?: string;
    sellerId?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
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
          updated_at
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

      if (filters?.featured) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
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
          images: item.images || [item.image_url] || [],
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
        })),
        count: count || 0
      };
    } catch (error) {
      return this.handleError(error, 'Get Products');
    }
  }

  // Get product by ID
  async getProductById(id: string) {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: data.images || [data.image_url] || [],
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at)
      } : null;
    } catch (error) {
      return this.handleError(error, 'Get Product By ID');
    }
  }

  // Get product by slug
  async getProductBySlug(slug: string) {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        slug: data.slug || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
        categoryId: data.category_id,
        category: data.categories?.name || '',
        images: data.images || [data.image_url] || [],
        stock: data.stock || 0,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        reviews: data.reviews || [],
        sellerId: data.seller_id || '',
        sellerName: '',
        tags: data.tags || [],
        featured: data.featured || false,
        isActive: data.active,
        createdAt: new Date(data.created_at)
      } : null;
    } catch (error) {
      return this.handleError(error, 'Get Product By Slug');
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8) {
    try {
      const { data, error } = await supabase
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
        images: item.images || [item.image_url] || [],
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
}