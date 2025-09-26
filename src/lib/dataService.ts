import { createClient } from '@supabase/supabase-js';
import { performanceMonitor } from '../utils/performance';
import { validateSellerId, validateAndFixStoredUser } from '../utils/uuidValidation';
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

// Validate environment on load
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is missing from environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing from environment variables');
}

// Minimal Supabase client configuration to fix hanging queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Disable to prevent issues
  }
});

// Base data service class for common functionality
export class DataService {
  protected handleError(error: any, operation: string) {
    console.error(`Data Service Error in ${operation}:`, error);
    throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
  }

  protected async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
}
