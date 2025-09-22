import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class StorageService {
  // Define all required buckets for the e-commerce platform
  private static readonly BUCKETS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
    COLLECTION_BANNERS: 'collection-banners',
    USERS: 'users',
    MARKETING: 'marketing'
  } as const;

  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Get the appropriate bucket name based on folder
   */
  private static getBucketName(folder: string): string {
    if (folder.startsWith('products')) return this.BUCKETS.PRODUCTS;
    if (folder.startsWith('categories')) return this.BUCKETS.CATEGORIES;
    if (folder.startsWith('collections/banners')) return this.BUCKETS.COLLECTION_BANNERS;
    if (folder.startsWith('collections')) return this.BUCKETS.COLLECTIONS;
    if (folder.startsWith('users')) return this.BUCKETS.USERS;
    if (folder.startsWith('marketing')) return this.BUCKETS.MARKETING;

    // Default to products bucket
    return this.BUCKETS.PRODUCTS;
  }

  /**
   * Upload an image file to Supabase storage
   */
  static async uploadImage(
    file: File,
    folder: string = 'products',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { url: '', path: '', error: validation.error };
      }

      // Get appropriate bucket name
      const bucketName = this.getBucketName(folder);

      // Ensure all buckets exist
      await this.initializeAllBuckets();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Simulate progress if callback provided
      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 });
      }

      // Standard upload - simplified approach
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // If bucket doesn't exist, try to create it and retry
        if (error.message?.includes('Bucket not found') || (error as any).status === 400) {
          await this.initializeAllBuckets();
          const retryResult = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryResult.error) {
            return { url: '', path: '', error: retryResult.error.message };
          }

          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(retryResult.data.path);

          return {
            url: urlData.publicUrl,
            path: retryResult.data.path,
          };
        }
        return { url: '', path: '', error: error.message };
      }

      // Simulate progress completion
      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      const result = { url: urlData.publicUrl, path: data.path };
      return result;
    } catch (error) {
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }



  /**
   * Delete an image from storage
   */
  static async deleteImage(path: string, folder: string = 'products'): Promise<boolean> {
    try {
      const bucketName = this.getBucketName(folder);
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      const msg = `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`;
      return { isValid: false, error: msg };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      const msg = 'Only JPEG, PNG, and WebP images are allowed';
      return { isValid: false, error: msg };
    }

    return { isValid: true };
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number } = {}
  ): string {
    if (!url) return url;

    // If it's already a Supabase storage URL, we can add transformations
    if (url.includes('supabase')) {
      const params = new URLSearchParams();

      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.quality) params.append('quality', options.quality.toString());

      if (params.toString()) {
        return `${url}?${params.toString()}`;
      }
    }

    return url;
  }

  /**
   * Create a single storage bucket if it doesn't exist
   */
  private static async createBucketIfNotExists(bucketName: string): Promise<boolean> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (createError) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize all required storage buckets
   */
  static async initializeAllBuckets(): Promise<boolean> {
    try {
      const bucketNames = Object.values(this.BUCKETS);
      const results = await Promise.all(
        bucketNames.map(bucketName => this.createBucketIfNotExists(bucketName))
      );

      const allSuccessful = results.every(result => result);
      return allSuccessful;
    } catch (error) {
      return false;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static async initializeBucket(): Promise<boolean> {
    return this.initializeAllBuckets();
  }
}


// Expose for debugging in DevTools: window.__StorageService
try { if (typeof window !== 'undefined') { (window as any).__StorageService = StorageService; } } catch {}
