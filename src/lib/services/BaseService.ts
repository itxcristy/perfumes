import { supabase } from '../supabase';
import { ErrorHandler, ValidationError, Validation } from '../../utils/errorHandling';

/**
 * Base service class providing common functionality for all services
 */
export class BaseService {
  protected supabase = supabase;

  /**
   * Handle errors consistently across all services
   */
  protected handleError(error: any, operation: string): never {
    const appError = ErrorHandler.handle(error);
    console.error(`Service Error in ${operation}:`, appError);
    throw appError;
  }

  /**
   * Validate required fields in data objects
   */
  protected validateRequired(data: any, fields: string[]): void {
    Validation.required(data, fields);
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string): void {
    Validation.email(email);
  }

  /**
   * Validate that a value is a positive number
   */
  protected validatePositiveNumber(value: number, fieldName: string): void {
    Validation.positiveNumber(value, fieldName);
  }

  /**
   * Validate that a value is a non-negative number
   */
  protected validateNonNegativeNumber(value: number, fieldName: string): void {
    Validation.nonNegativeNumber(value, fieldName);
  }

  /**
   * Generate a slug from a string
   */
  protected generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Get the current authenticated user
   */
  protected async getCurrentUser() {
    // If direct login is enabled, return mock user
    if (import.meta.env.VITE_DIRECT_LOGIN_ENABLED === 'true') {
      return {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      };
    }
    
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Convert images array to database format
   */
  protected formatImagesForDB(images: string[] | string | undefined): string[] {
    if (Array.isArray(images)) {
      return images;
    } else if (typeof images === 'string') {
      return [images];
    }
    return [];
  }

  /**
   * Convert images from database format
   */
  protected formatImagesFromDB(images: string[] | string | null | undefined): string[] {
    if (Array.isArray(images)) {
      return images;
    } else if (typeof images === 'string') {
      return [images];
    }
    return [];
  }
}