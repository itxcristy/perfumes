import { supabase } from './supabase';
import { User, Product, Category, Order } from '../types';

// ===== NEW CLEAN CRUD FUNCTIONS =====
// These functions will replace the broken ones with proper error handling and validation

// Error handling utility
const handleError = (error: any, operation: string) => {
  console.error(`CRUD Error in ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
};

// Validation utilities
const validateRequired = (data: any, fields: string[]) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Required fields missing: ${missing.join(', ')}`);
  }
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
};

// ===== USER CRUD OPERATIONS =====

export const createUser = async (userData: {
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  phone?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  password?: string;
}): Promise<User> => {
  try {
    // Validate required fields
    validateRequired(userData, ['email', 'name', 'role']);
    validateEmail(userData.email);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Use the database function to create user profile
    const { data: userId, error: createError } = await supabase.rpc('create_user_profile', {
      p_email: userData.email,
      p_full_name: userData.name,
      p_role: userData.role,
      p_phone: userData.phone || null,
      p_date_of_birth: userData.dateOfBirth || null,
      p_is_active: userData.isActive !== undefined ? userData.isActive : true
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    // Get the created user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    return {
      id: profileData.id,
      email: profileData.email,
      name: profileData.full_name,
      role: profileData.role,
      phone: profileData.phone,
      dateOfBirth: profileData.date_of_birth,
      isActive: profileData.is_active,
      emailVerified: profileData.email_verified || true,
      createdAt: new Date(profileData.created_at),
      updatedAt: new Date(profileData.updated_at)
    };
  } catch (error) {
    handleError(error, 'Create User');
    throw error; // Re-throw for caller to handle
  }
};

// Helper function to generate secure password
const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    if (!userId) throw new Error('User ID is required');

    // Validate email if provided
    if (updates.email) {
      validateEmail(updates.email);
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) updateData.full_name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      role: data.role,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      isActive: data.is_active,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Update User');
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) throw new Error('User ID is required');

    // First, check if user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Delete related data first (to maintain referential integrity)
    const relatedTables = ['addresses', 'cart_items', 'wishlist_items', 'reviews'];
    
    for (const table of relatedTables) {
      await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
    }

    // Delete the user profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    handleError(error, 'Delete User');
    throw error;
  }
};

// ===== PRODUCT CRUD OPERATIONS =====

export const createProduct = async (productData: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId?: string;
  stock?: number;
  imageUrl?: string;
  featured?: boolean;
}): Promise<Product> => {
  try {
    // Validate required fields
    validateRequired(productData, ['name', 'description', 'price', 'categoryId']);

    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category_id: productData.categoryId,
        seller_id: productData.sellerId || null,
        stock: productData.stock || 0,
        image_url: productData.imageUrl || null,
        featured: productData.featured || false,
        slug: slug,
        is_active: true,
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
      sellerName: '', // Will be populated by join if needed
      stock: data.stock,
      images: data.image_url ? [data.image_url] : [], // Convert single image to array
      tags: [], // Default empty array
      featured: data.featured,
      slug: data.slug,
      isActive: data.is_active,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Create Product');
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product> => {
  try {
    if (!productId) throw new Error('Product ID is required');

    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.featured !== undefined) updateData.featured = updates.featured;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
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
      sellerName: '', // Will be populated by join if needed
      stock: data.stock,
      images: data.image_url ? [data.image_url] : [], // Convert single image to array
      tags: [], // Default empty array
      featured: data.featured,
      slug: data.slug,
      isActive: data.is_active,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Update Product');
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    if (!productId) throw new Error('Product ID is required');

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('products')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) throw error;

    return true;
  } catch (error) {
    handleError(error, 'Delete Product');
    throw error;
  }
};

// ===== CATEGORY CRUD OPERATIONS =====

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  imageUrl?: string;
}): Promise<Category> => {
  try {
    // Validate required fields
    validateRequired(categoryData, ['name']);

    // Generate slug from name
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description || null,
        image_url: categoryData.imageUrl || null,
        is_active: true,
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
      isActive: data.is_active,
      productCount: 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Create Category');
    throw error;
  }
};

export const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<Category> => {
  try {
    if (!categoryId) throw new Error('Category ID is required');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
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
      isActive: data.is_active,
      productCount: 0, // Will be calculated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Update Category');
    throw error;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    if (!categoryId) throw new Error('Category ID is required');

    // Check if category has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (count && count > 0) {
      throw new Error('Cannot delete category with active products. Please move or delete products first.');
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('categories')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId);

    if (error) throw error;

    return true;
  } catch (error) {
    handleError(error, 'Delete Category');
    throw error;
  }
};

// ===== READ/GET OPERATIONS =====

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return data.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      parentId: category.parent_id,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      createdAt: new Date(category.created_at),
      updatedAt: new Date(category.updated_at)
    }));
  } catch (error) {
    handleError(error, 'Get Categories');
    throw error;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      categoryId: product.category_id,
      sellerId: product.seller_id,
      stock: product.stock,
      images: product.image_url ? [product.image_url] : [],
      featured: product.featured,
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      createdAt: new Date(product.created_at),
      reviews: []
    }));
  } catch (error) {
    handleError(error, 'Get Products');
    throw error;
  }
};

export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      categoryId: product.category_id,
      sellerId: product.seller_id,
      stock: product.stock,
      images: product.image_url ? [product.image_url] : [],
      featured: product.featured,
      rating: product.rating || 0,
      reviewCount: product.review_count || 0,
      createdAt: new Date(product.created_at),
      reviews: []
    }));
  } catch (error) {
    handleError(error, 'Get Featured Products');
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    if (!productId) throw new Error('Product ID is required');

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: data.category_id,
      sellerId: data.seller_id,
      stock: data.stock,
      images: data.image_url ? [data.image_url] : [],
      featured: data.featured,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      createdAt: new Date(data.created_at),
      reviews: []
    };
  } catch (error) {
    handleError(error, 'Get Product By ID');
    throw error;
  }
};

export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    if (!categoryId) throw new Error('Category ID is required');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.image_url,
      parentId: data.parent_id,
      sortOrder: data.sort_order,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    handleError(error, 'Get Category By ID');
    throw error;
  }
};

// ===== ORDER CRUD OPERATIONS =====

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    if (!orderId) throw new Error('Order ID is required');
    if (!status) throw new Error('Status is required');

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        order_items(*, products(name, image_url)),
        profiles(full_name, email)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      status: data.status,
      totalAmount: parseFloat(data.total_amount),
      shippingAddress: data.shipping_address,
      paymentMethod: data.payment_method,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      items: data.order_items || []
    };
  } catch (error) {
    handleError(error, 'Update Order Status');
    throw error;
  }
};
