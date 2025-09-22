import { supabase } from '../../lib/supabase';
import { StorageService } from '../../services/storageService';

/**
 * Initialize database tables and storage buckets
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Check if products table exists and has required columns
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError) {
      console.error('Products table error:', productsError);
      // Table might not exist or have permission issues
    } else {
      console.log('Products table is accessible');
    }

    // Check if categories table exists
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.error('Categories table error:', categoriesError);
    } else {
      console.log('Categories table is accessible');
    }

    // Check if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('Profiles table is accessible');
    }

    // Initialize all storage buckets using StorageService
    console.log('Initializing storage buckets...');
    const bucketsInitialized = await StorageService.initializeAllBuckets();

    if (bucketsInitialized) {
      console.log('All storage buckets initialized successfully');
    } else {
      console.warn('Some storage buckets failed to initialize');
    }

    console.log('Database initialization completed');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

/**
 * Check database connection and basic functionality
 */
export const checkDatabaseHealth = async () => {
  try {
    // Simple health check
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database health check failed:', error);
      return false;
    }

    console.log('Database health check passed');
    return true;
  } catch (error) {
    console.error('Database health check error:', error);
    return false;
  }
};
