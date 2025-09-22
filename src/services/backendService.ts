import { supabase } from '../lib/supabase';
import { User, Product, Category } from '../types';

// Error handling utility
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
};

// Validation utility
const validateRequired = (data: any, requiredFields: string[]) => {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

// User service - READ ONLY (CRUD functions removed)
export const userService = {
  async getAll(filters?: { role?: string; isActive?: boolean; search?: string }) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(this.mapFromDB) || [];
    } catch (error) {
      handleDatabaseError(error, 'Get all users');
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapFromDB(data);
    } catch (error) {
      handleDatabaseError(error, 'Get user by ID');
    }
  },

  // CRUD functions will be re-implemented
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    throw new Error('User creation functionality is being rebuilt. Please try again later.');
  },

  async update(id: string, updates: Partial<User>) {
    throw new Error('User update functionality is being rebuilt. Please try again later.');
  },

  async delete(id: string) {
    throw new Error('User deletion functionality is being rebuilt. Please try again later.');
  },

  mapFromDB(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      role: data.role,
      avatar: data.avatar_url,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      isActive: data.is_active,
      emailVerified: data.email_verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};

// Category service - READ ONLY (CRUD functions removed)
export const categoryService = {
  async getAll(filters?: { isActive?: boolean; search?: string }) {
    try {
      let query = supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .order('name', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(this.mapFromDB) || [];
    } catch (error) {
      handleDatabaseError(error, 'Get all categories');
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapFromDB(data);
    } catch (error) {
      handleDatabaseError(error, 'Get category by ID');
    }
  },

  // CRUD functions will be re-implemented
  async create(categoryData: Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>) {
    throw new Error('Category creation functionality is being rebuilt. Please try again later.');
  },

  async update(id: string, updates: Partial<Category>) {
    throw new Error('Category update functionality is being rebuilt. Please try again later.');
  },

  async delete(id: string) {
    throw new Error('Category deletion functionality is being rebuilt. Please try again later.');
  },

  mapFromDB(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.image_url,
      isActive: data.is_active,
      productCount: data.products?.[0]?.count || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};

// Product service - READ ONLY (CRUD functions removed)
export const productService = {
  async getAll(filters?: {
    categoryId?: string;
    sellerId?: string;
    isActive?: boolean;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query
        .range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(this.mapFromDB) || [];
    } catch (error) {
      handleDatabaseError(error, 'Get products');
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          profiles(full_name),
          reviews(
            *,
            profiles(full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data ? this.mapFromDB(data) : null;
    } catch (error) {
      handleDatabaseError(error, 'Get product by ID');
    }
  },

  // CRUD functions will be re-implemented
  async create(productData: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'rating' | 'reviewCount'>) {
    throw new Error('Product creation functionality is being rebuilt. Please try again later.');
  },

  async update(id: string, updates: Partial<Product>) {
    throw new Error('Product update functionality is being rebuilt. Please try again later.');
  },

  async delete(id: string) {
    throw new Error('Product deletion functionality is being rebuilt. Please try again later.');
  },

  mapFromDB(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.image_url,
      categoryId: data.category_id,
      sellerId: data.seller_id,
      stock: data.stock,
      isActive: data.is_active,
      featured: data.featured,
      slug: data.slug,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      createdAt: new Date(data.created_at),
      reviews: data.reviews || [],
      rating: data.rating || 0,
      reviewCount: data.review_count || 0
    };
  }
};

// Export all services
export default {
  users: userService,
  categories: categoryService,
  products: productService
};
