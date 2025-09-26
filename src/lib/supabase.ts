import { createClient } from '@supabase/supabase-js';
import { performanceMonitor } from '../utils/performance';
import { validateSellerId, validateAndFixStoredUser } from '../utils/uuidValidation';
import { Retry } from '../utils/errorHandling';
import {
  User,
  Product,
  Category,
  CartItem,
  WishlistItem,
  Order,
  Address,
  ProductVariant,
  Coupon,
  DashboardAnalytics
} from '../types';

// Environment validation with better error messages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appEnv = import.meta.env.VITE_APP_ENV || 'development';

// Enhanced environment validation with backend fix detection
function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required environment variables
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing from environment variables');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  } else if (supabaseUrl.includes('mock.supabase.co') || supabaseUrl.includes('localhost')) {
    warnings.push('Using mock or localhost URL - ensure this is intentional');
  }

  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  } else if (supabaseAnonKey.length < 50) {
    warnings.push('Supabase anon key seems unusually short');
  }

  // Configuration validation logging removed for production

  if (errors.length > 0) {
    throw new Error(`Supabase configuration errors: ${errors.join(', ')}`);
  }

  // Configuration validation completed
}

// Enhanced database initialization with automatic fix application
async function initializeDatabase() {
  try {
    try {
      // Set development mode parameters
      await supabase.rpc('set_config', {
        setting_name: 'app.development_mode',
        new_value: 'true',
        is_local: false
      });
    } catch (error) {
      // Ignore errors if function doesn't exist
      console.warn('Failed to set development mode config:', error);
    }

    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error && error.message.includes('infinite recursion')) {
      throw new Error('DATABASE_NEEDS_FIXING: Please run the COMPREHENSIVE-BACKEND-FIX.sql script in your Supabase SQL Editor.');
    }

    // Check if we're in direct login mode
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
      return;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('DATABASE_NEEDS_FIXING')) {
      throw error;
    }
    // In direct login mode, we can ignore database errors
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
      return;
    }
  }
}

// Validate environment on load
validateEnvironment();

// Initialize database on load (async)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initializeDatabase().catch(err => {
      // Database initialization errors handled silently in production
    });
  }, 1000);
}

// Minimal Supabase client configuration to fix hanging queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Disable to prevent issues
  },
  global: {
    headers: {
      'X-Client-Info': 'sufi-essences-dashboard',
      'Access-Control-Allow-Origin': 'http://localhost:5174'
    }
  },
  db: {
    schema: 'public'
  },
  // Add better error handling for CORS issues
  fetch: {
    // Add credentials for CORS requests
    credentials: 'omit',
    // Add timeout for requests
    timeout: 30000
  }
});

// Direct REST API function for fetching categories with better error handling
export const testDirectRestAPI = async () => {
  try {
    // Use retry mechanism for better resilience
    const response = await Retry.withBackoff(async () => {
      const res = await fetch(`${supabaseUrl}/rest/v1/categories?select=*&eq.active.true&order=sort_order.asc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Add credentials handling for CORS
        credentials: 'omit'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      return res;
    }, 3, 1000);

    const data = await response.json();
    return { success: true, data, count: data.length };
  } catch (error) {
    console.error('Direct REST API Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Connection health monitoring
let connectionHealthy = true;
let lastHealthCheck = 0;

export const checkDatabaseConnection = async (): Promise<{ healthy: boolean; latency?: number; error?: string }> => {
  const now = Date.now();

  // Prevent too frequent health checks (at most once per 30 seconds)
  if (now - lastHealthCheck < 30000 && connectionHealthy) {
    return { healthy: connectionHealthy };
  }

  lastHealthCheck = now;

  try {
    const startTime = Date.now();
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      connectionHealthy = false;
      return { healthy: false, error: error.message };
    }

    connectionHealthy = true;
    return { healthy: true, latency };
  } catch (error) {
    connectionHealthy = false;
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

// Utility functions for data transformation
const isValidUUID = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

// Data transformation utilities
const productToDB = (product: any) => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    image_url: product.imageUrl || product.image_url,
    category_id: product.categoryId || product.category_id,
    seller_id: product.sellerId || product.seller_id,
    stock: product.stock,
    active: product.isActive !== undefined ? product.isActive : true,
    featured: product.featured || false,
    slug: product.slug,
    meta_title: product.metaTitle || product.meta_title,
    meta_description: product.metaDescription || product.meta_description
  };
};

const categoryToDB = (category: any) => {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    image_url: category.imageUrl || category.image_url,
    active: category.isActive !== undefined ? category.isActive : true,
    created_at: category.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: category.updatedAt?.toISOString() || new Date().toISOString()
  };
};

// ===== DATA FETCHING FUNCTIONS (WORKING) =====

// Enhanced product fetching with all details (for when needed)
export const getProducts = async (filters?: {
    categoryId?: string;
    categorySlug?: string;
    seller?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories!inner(name, slug),
        product_variants(*)
      `)
      .eq('active', true);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.categorySlug) {
      query = query.eq('categories.slug', filters.categorySlug);
    }

    if (filters?.seller) {
      query = query.eq('seller_id', filters.seller);
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

    const { data, error } = await query;

    if (error) throw error;

    // Transform database results to match Product interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || '',
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
      categoryId: item.category_id,
      category: item.categories?.name || '',
      images: item.images || [], // Use the images array directly from database
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
    console.error('Error fetching products:', error);
    return [];
  }
};

// Enhanced product fetching with all details (for when needed)
export const getProductById = async (id: string) => {
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
    return data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

// Enhanced product fetching with all details (for when needed)
export const getProductBySlug = async (slug: string) => {
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
    return data;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
};

// Enhanced category fetching with all details (for when needed)
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    // Transform the data to match our Category interface
    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image_url || '', // Map image_url to image
      parentId: cat.parent_id,
      isActive: cat.is_active,
      sortOrder: cat.sort_order,
      productCount: 0, // Will be calculated separately if needed
      createdAt: new Date(cat.created_at),
      updatedAt: new Date(cat.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Enhanced category fetching with all details (for when needed)
export const getCategoryBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
};

// Enhanced user profile fetching with all details (for when needed)
export const getProfileForUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Enhanced cart items fetching with all details (for when needed)
export const getCartItems = async (userId?: string) => {
  try {
    // Get user ID if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for cart items');
        return [];
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(name, price, image_url, slug)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

// Add item to cart
export const addToCart = async (productId: string, variantId?: string, quantity: number = 1): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('add_to_cart', {
      p_product_id: productId,
      p_variant_id: variantId,
      p_quantity: quantity
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return false;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return false;
  }
};

// Clear entire cart
export const clearCart = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
};

// ===== WISHLIST FUNCTIONS =====

// Get wishlist items
export const getWishlistItems = async (userId?: string) => {
  try {
    // Get user ID if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for wishlist items');
        return [];
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    return [];
  }
};

// Add item to wishlist
export const addToWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        product_id: productId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

// ===== REVIEW FUNCTIONS =====

// Add a review
export const addReview = async (reviewData: {
  productId?: string;
  product_id?: string;
  userId?: string;
  user_id?: string;
  rating: number;
  comment?: string;
  title?: string;
}): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: reviewData.productId || reviewData.product_id,
        user_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
};

// ===== ORDER FUNCTIONS =====

// Create order for authenticated user
export const createOrder = async (orderData: {
  items: any[];
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod: string;
}): Promise<string | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.18; // 18% GST for India
    const shippingAmount = subtotal > 500 ? 0 : 50; // Fast Shipping over ₹500
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = 'ORD' + Date.now().toString();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress || orderData.shippingAddress,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: data.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return data.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Create guest order
export const createGuestOrder = async (orderData: {
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  guestEmail: string;
  guestName: string;
  paymentId?: string;
}): Promise<string | null> => {
  try {
    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.18; // 18% GST for India
    const shippingAmount = subtotal > 500 ? 0 : 50; // Fast Shipping over ₹500
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = 'ORD' + Date.now().toString();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        guest_email: orderData.guestEmail,
        guest_name: orderData.guestName,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: orderData.paymentId ? 'paid' : 'pending',
        payment_method: orderData.paymentMethod,
        payment_id: orderData.paymentId,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.shippingAddress,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: data.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return data.id;
  } catch (error) {
    console.error('Error creating guest order:', error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Get order by ID
export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, image_url)),
        profiles(full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: 'admin' | 'seller' | 'customer'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// ===== BULK USER OPERATIONS =====

// Bulk update users
export const updateUsersBulk = async (userIds: string[], updates: any): Promise<{ success: boolean; updatedCount?: number; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();

    if (error) throw error;

    return {
      success: true,
      updatedCount: data?.length || 0
    };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update users'
    };
  }
};

// Bulk delete users
export const deleteUsersBulk = async (userIds: string[]): Promise<{ success: boolean; deletedCount?: number; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds)
      .select();

    if (error) throw error;

    return {
      success: true,
      deletedCount: data?.length || 0
    };
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete users'
    };
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend confirmation email'
    };
  }
};

// Confirm user email (admin function)
export const confirmUserEmail = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would typically require admin privileges
    // For now, we'll update the profile to mark email as confirmed
    const { error } = await supabase
      .from('profiles')
      .update({
        email_confirmed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error confirming user email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm user email'
    };
  }
};

// ===== ADDRESS FUNCTIONS =====

// Get user addresses
export const getUserAddresses = async (userId?: string) => {
  try {
    // Get user ID if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for addresses');
        return [];
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
};

// Add address
export const addAddress = async (addressData: any): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        full_name: addressData.fullName,
        street_address: addressData.streetAddress,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone,
        type: addressData.type,
        is_default: addressData.isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding address:', error);
    return false;
  }
};

// Update address
export const updateAddress = async (addressData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('addresses')
      .update({
        full_name: addressData.fullName,
        street_address: addressData.streetAddress,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone,
        type: addressData.type,
        is_default: addressData.isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressData.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
};

// Delete address
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
};

// Set default address
export const setDefaultAddress = async (addressId: string, type: 'shipping' | 'billing'): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // First, unset all default addresses of this type for the user
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('type', type);

    // Then set the selected address as default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
};

// Enhanced orders fetching with all details (for when needed)
export const getOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, image_url))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Duplicate function removed - using the one above

// Enhanced addresses fetching with all details (for when needed)
export const getAddresses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
};

// Enhanced dashboard analytics fetching with all details (for when needed)
export const getDashboardAnalytics = async (userId: string, role: string) => {
  try {
    // Different analytics based on user role
    let data: DashboardAnalytics = {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      recentOrders: [],
      topProducts: [],
      salesTrends: [],
      categoryPerformance: []
    };

    if (role === 'admin') {
      // Admin gets all data
      const [ordersResult, productsResult, customersResult] = await Promise.all([
        supabase.from('orders').select('total_amount'),
        supabase.from('products').select('id'),
        supabase.from('profiles').select('id').eq('role', 'customer')
      ]);

      data.totalRevenue = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      data.totalProducts = productsResult.data?.length || 0;
      data.totalUsers = customersResult.data?.length || 0;
    } else if (role === 'seller') {
      // Seller gets only their data
      const [ordersResult, productsResult] = await Promise.all([
        supabase.from('orders').select('total_amount, order_items!inner(products!inner(seller_id))').eq('order_items.products.seller_id', userId),
        supabase.from('products').select('id').eq('seller_id', userId)
      ]);

      data.totalRevenue = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      data.totalProducts = productsResult.data?.length || 0;
    }

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        profiles(display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    data.recentOrders = (recentOrders || []).map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number || '',
      userId: order.user_id || '',
      items: [],
      total: parseFloat(order.total_amount) || 0,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      status: order.status,
      paymentStatus: 'pending',
      shippingAddress: {} as Address,
      createdAt: new Date(order.created_at)
    }));

    // Get top products
    const { data: topProducts } = await supabase
      .from('products')
      .select('id, name, price, image_url, slug, sales_count')
      .order('sales_count', { ascending: false })
      .limit(5);

    data.topProducts = (topProducts || []).map((product: any) => {
      const baseProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug || '',
        description: '',
        price: product.price,
        categoryId: '',
        category: '',
        images: [product.image_url || ''],
        stock: 0,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        sellerId: '',
        sellerName: '',
        tags: [],
        featured: false,
        createdAt: new Date()
      };
      
      // Only add originalPrice if it exists
      if (product.original_price) {
        return {
          ...baseProduct,
          originalPrice: parseFloat(product.original_price)
        };
      }
      
      return baseProduct;
    });

    // Get sales data
    const { data: salesData } = await supabase
      .from('sales_data_view')
      .select('*')
      .order('date', { ascending: true })
      .limit(30);

    data.salesTrends = (salesData || []).map((item: any) => ({
      date: item.date,
      sales: item.sales || 0,
      orders: item.orders || 0
    }));

    return data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      recentOrders: [],
      topProducts: [],
      salesTrends: [],
      categoryPerformance: []
    };
  }
};

// Enhanced featured products fetching with all details (for when needed)
export const getFeaturedProducts = async (limit: number = 8) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        original_price,
        images,
        slug,
        description,
        rating,
        review_count,
        stock,
        categories(name, slug)
      `)
      .eq('featured', true)
      .eq('active', true)
      .limit(limit);

    if (error) throw error;

    // Transform database results to match Product interface
    return (data || []).map((item: any) => {
      const baseProduct = {
        id: item.id,
        name: item.name,
        slug: item.slug || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        categoryId: '',
        category: item.categories?.name || '',
        images: item.images || [], // Use the images array directly from database
        stock: item.stock || 0,
        rating: parseFloat(item.rating) || 0,
        reviewCount: item.review_count || 0,
        reviews: [],
        sellerId: '',
        sellerName: '',
        tags: [],
        featured: true,
        createdAt: new Date()
      };
      
      // Only add originalPrice if it exists
      if (item.original_price) {
        return {
          ...baseProduct,
          originalPrice: parseFloat(item.original_price)
        };
      }
      
      return baseProduct;
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Enhanced basic products fetching with all details (for when needed)
export const getProductsBasic = async (filters?: {
    categoryId?: string;
    categorySlug?: string;
    seller?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        original_price,
        images,
        slug,
        description,
        stock,
        rating,
        review_count,
        featured,
        categories(name, slug)
      `)
      .eq('active', true);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.categorySlug) {
      query = query.eq('categories.slug', filters.categorySlug);
    }

    if (filters?.seller) {
      query = query.eq('seller_id', filters.seller);
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

    const { data, error } = await query;

    if (error) throw error;

    // Transform database results to match Product interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || '',
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
      categoryId: '',
      category: item.categories?.name || '',
      images: item.images || [], // Use the images array directly from database
      stock: item.stock || 0,
      rating: parseFloat(item.rating) || 0,
      reviewCount: item.review_count || 0,
      reviews: [],
      sellerId: '',
      sellerName: '',
      tags: [],
      featured: item.featured || false,
      createdAt: new Date()
    }));
  } catch (error) {
    console.error('Error fetching basic products:', error);
    return [];
  }
};

// Enhanced minimal products fetching with all details (for when needed)
export const getProductsMinimal = async (limit?: number) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        images,
        slug
      `)
      .eq('active', true);

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform database results to match Product interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || '',
      description: '',
      price: parseFloat(item.price) || 0,
      categoryId: '',
      category: '',
      images: item.images || [], // Use the images array directly from database
      stock: 0,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      sellerId: '',
      sellerName: '',
      tags: [],
      featured: false,
      createdAt: new Date()
    }));
  } catch (error) {
    console.error('Error fetching minimal products:', error);
    return [];
  }
};

// Enhanced users fetching with all details (for when needed)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Enhanced user preferences fetching with all details (for when needed)
export const getUserPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors

    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
};

// Enhanced user security settings fetching with all details (for when needed)
export const getUserSecuritySettings = async (userId: string) => {
  try {
    // For now, return null since the table doesn't exist yet
    // This prevents 404 errors in the console
    console.warn('user_security_settings table not found - feature not implemented yet');
    return null;
  } catch (error) {
    console.error('Error fetching user security settings:', error);
    return null;
  }
};

// Enhanced user payment methods fetching with all details (for when needed)
export const getUserPaymentMethods = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching user payment methods:', error);
    return [];
  }
};

// Enhanced user preferences updating
export const updateUserPreferences = async (userId: string, preferences: any) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
};

// Enhanced user security settings updating
export const updateUserSecuritySettings = async (userId: string, settings: any) => {
  try {
    // For now, return null since the table doesn't exist yet
    console.warn('user_security_settings table not found - feature not implemented yet');
    return null;
  } catch (error) {
    console.error('Error updating user security settings:', error);
    return null;
  }
};

// Enhanced payment method management
export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const { error } = await supabase
      .from('user_payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return false;
  }
};

export const setDefaultPaymentMethod = async (userId: string, paymentMethodId: string) => {
  try {
    // First, unset all other payment methods as default
    await supabase
      .from('user_payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the selected one as default
    const { error } = await supabase
      .from('user_payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return false;
  }
};

// ===== PLACEHOLDER FOR NEW CRUD FUNCTIONS =====
// These will be added in the next step with proper error handling and validation
