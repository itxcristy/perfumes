import { primaryCache, apiCache, userCache, imageCache } from './cache';
import { performanceMonitor } from './performance';

// Cache strategies for different data types
export type CacheStrategy = 
  | 'cache-first'           // Serve from cache, fallback to network
  | 'network-first'         // Try network first, fallback to cache
  | 'stale-while-revalidate' // Serve stale cache, update in background
  | 'network-only'          // Always fetch from network
  | 'cache-only';           // Only serve from cache

// Cache configuration for different entity types
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number;
  maxAge: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  compression: boolean;
  encryption?: boolean;
  syncOnline?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'manual';
}

// Predefined cache configurations for different data types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Critical user data - always fresh
  'user-profile': {
    strategy: 'network-first',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxAge: 15 * 60 * 1000, // 15 minutes
    priority: 'critical',
    tags: ['user', 'profile'],
    compression: false,
    encryption: true,
    syncOnline: true,
    conflictResolution: 'server-wins'
  },

  // Product catalog - can be stale but with longer TTL
  'products': {
    strategy: 'stale-while-revalidate',
    ttl: 30 * 60 * 1000, // Increased from 10 to 30 minutes
    maxAge: 2 * 60 * 60 * 1000, // Increased from 1 hour to 2 hours
    priority: 'high',
    tags: ['products', 'catalog'],
    compression: true,
    syncOnline: true,
    conflictResolution: 'server-wins'
  },

  // Categories - rarely change with much longer TTL
  'categories': {
    strategy: 'stale-while-revalidate', // Changed from cache-first to stale-while-revalidate
    ttl: 60 * 60 * 1000, // Increased from 30 minutes to 1 hour
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    priority: 'medium',
    tags: ['categories', 'catalog'],
    compression: true,
    syncOnline: false,
    conflictResolution: 'server-wins'
  },

  // Shopping cart - needs immediate sync
  'cart': {
    strategy: 'network-first',
    ttl: 1 * 60 * 1000, // 1 minute
    maxAge: 5 * 60 * 1000, // 5 minutes
    priority: 'critical',
    tags: ['cart', 'user'],
    compression: false,
    encryption: true,
    syncOnline: true,
    conflictResolution: 'merge'
  },

  // Orders - historical data with longer cache
  'orders': {
    strategy: 'stale-while-revalidate', // Changed from cache-first to stale-while-revalidate
    ttl: 30 * 60 * 1000, // Increased from 15 to 30 minutes
    maxAge: 2 * 60 * 60 * 1000, // Increased from 2 hours to 2 hours
    priority: 'high',
    tags: ['orders', 'user'],
    compression: true,
    encryption: true,
    syncOnline: true,
    conflictResolution: 'server-wins'
  },

  // Static assets - long cache
  'assets': {
    strategy: 'cache-first',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    priority: 'low',
    tags: ['assets', 'static'],
    compression: true,
    syncOnline: false,
    conflictResolution: 'server-wins'
  },

  // Analytics data - can be delayed
  'analytics': {
    strategy: 'network-only',
    ttl: 0,
    maxAge: 0,
    priority: 'low',
    tags: ['analytics'],
    compression: true,
    syncOnline: true,
    conflictResolution: 'server-wins'
  }
};

// Intelligent cache manager
export class IntelligentCacheManager {
  private syncQueue: Map<string, any> = new Map();
  private conflictQueue: Map<string, any> = new Map();
  private cacheWarmupQueue: Set<string> = new Set();
  private preloadQueue: Set<string> = new Set();

  constructor() {
    this.initializeEventListeners();
    this.startPeriodicSync();
  }

  private initializeEventListeners() {
    // Sync when coming back online
    window.addEventListener('online', () => {
      this.syncOfflineChanges();
    });

    // Removed automatic preloading on page visibility to prevent auto-refresh on tab switch
    // Critical data will be preloaded only on initial page load

    // Warm cache on idle
    window.addEventListener('load', () => {
      requestIdleCallback(() => {
        this.warmupCache();
      });
    });
  }

  /**
   * Get data with intelligent caching strategy
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    entityType: string = 'default'
  ): Promise<T> {
    const config = CACHE_CONFIGS[entityType] || CACHE_CONFIGS['products'];
    const cache = this.selectCache(entityType);
    
    performanceMonitor.startMeasure(`cache-get-${key}`);

    try {
      switch (config.strategy) {
        case 'cache-first':
          return await this.cacheFirstStrategy(key, fetchFn, cache, config);
        
        case 'network-first':
          return await this.networkFirstStrategy(key, fetchFn, cache, config);
        
        case 'stale-while-revalidate':
          return await this.staleWhileRevalidateStrategy(key, fetchFn, cache, config);
        
        case 'network-only':
          return await this.networkOnlyStrategy(key, fetchFn, config);
        
        case 'cache-only':
          return await this.cacheOnlyStrategy(key, cache);
        
        default:
          return await fetchFn();
      }
    } finally {
      performanceMonitor.endMeasure(`cache-get-${key}`);
    }
  }

  /**
   * Set data with intelligent caching
   */
  async set<T>(
    key: string,
    data: T,
    entityType: string = 'default',
    options: Partial<CacheConfig> = {}
  ): Promise<void> {
    const config = { ...CACHE_CONFIGS[entityType], ...options };
    const cache = this.selectCache(entityType);

    // Encrypt sensitive data
    const processedData = config.encryption ? this.encrypt(data) : data;

    cache.set(key, processedData, {
      ttl: config.ttl,
      priority: config.priority,
      tags: config.tags,
      compress: config.compression
    });

    // Queue for sync if needed
    if (config.syncOnline && !navigator.onLine) {
      this.syncQueue.set(key, { data, entityType, timestamp: Date.now() });
    }
  }

  /**
   * Cache-first strategy implementation
   */
  private async cacheFirstStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    cache: any,
    config: CacheConfig
  ): Promise<T> {
    // Try cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return config.encryption ? this.decrypt(cached) : cached;
    }

    // Fallback to network
    try {
      const data = await fetchFn();
      await this.set(key, data, this.getEntityTypeFromConfig(config));
      return data;
    } catch (error) {
      // If network fails, try to serve stale cache
      const stale = cache.get(key, { ignoreExpiry: true });
      if (stale !== null) {
        console.warn(`Serving stale cache for ${key} due to network error`);
        return config.encryption ? this.decrypt(stale) : stale;
      }
      throw error;
    }
  }

  /**
   * Network-first strategy implementation
   */
  private async networkFirstStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    cache: any,
    config: CacheConfig
  ): Promise<T> {
    try {
      const data = await fetchFn();
      await this.set(key, data, this.getEntityTypeFromConfig(config));
      return data;
    } catch (error) {
      // Fallback to cache
      const cached = cache.get(key);
      if (cached !== null) {
        console.warn(`Serving cached data for ${key} due to network error`);
        return config.encryption ? this.decrypt(cached) : cached;
      }
      throw error;
    }
  }

  /**
   * Stale-while-revalidate strategy implementation with enhanced background update
   */
  private async staleWhileRevalidateStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    cache: any,
    config: CacheConfig
  ): Promise<T> {
    const cached = cache.get(key);
    
    // Serve cached data immediately if available
    if (cached !== null) {
      // Update in background with smarter retry logic
      this.backgroundUpdateWithRetry(key, fetchFn, config);
      return config.encryption ? this.decrypt(cached) : cached;
    }

    // No cache, fetch fresh data
    const data = await fetchFn();
    await this.set(key, data, this.getEntityTypeFromConfig(config));
    return data;
  }

  /**
   * Network-only strategy implementation
   */
  private async networkOnlyStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const data = await fetchFn();
    
    // Still cache for offline fallback if configured
    if (config.syncOnline) {
      await this.set(key, data, this.getEntityTypeFromConfig(config));
    }
    
    return data;
  }

  /**
   * Cache-only strategy implementation
   */
  private async cacheOnlyStrategy<T>(key: string, cache: any): Promise<T> {
    const cached = cache.get(key);
    if (cached === null) {
      throw new Error(`No cached data available for ${key}`);
    }
    return cached;
  }

  /**
   * Enhanced background update with retry mechanism
   */
  private async backgroundUpdateWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const data = await fetchFn();
        await this.set(key, data, this.getEntityTypeFromConfig(config));
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Background update attempt ${attempt + 1} failed for ${key}:`, error);
        
        // Don't retry on last attempt
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`Background update failed after ${maxRetries + 1} attempts for ${key}:`, lastError);
  }

  /**
   * Select appropriate cache based on entity type
   */
  private selectCache(entityType: string) {
    switch (entityType) {
      case 'user-profile':
      case 'cart':
      case 'orders':
        return userCache;
      case 'assets':
        return imageCache;
      case 'analytics':
        return apiCache;
      default:
        return primaryCache;
    }
  }

  /**
   * Sync offline changes when back online
   */
  private async syncOfflineChanges(): Promise<void> {
    if (this.syncQueue.size === 0) return;

    console.log(`Syncing ${this.syncQueue.size} offline changes...`);

    for (const [key, item] of this.syncQueue.entries()) {
      try {
        // Implement sync logic based on entity type
        await this.syncItem(key, item);
        this.syncQueue.delete(key);
      } catch (error) {
        console.error(`Failed to sync ${key}:`, error);
        // Keep in queue for retry
      }
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(key: string, item: any): Promise<void> {
    const { data, entityType, timestamp } = item;
    const config = CACHE_CONFIGS[entityType];

    // Check for conflicts
    if (config.conflictResolution !== 'client-wins') {
      // Fetch latest server data to check for conflicts
      // Implementation depends on your API structure
    }

    // Sync based on entity type
    switch (entityType) {
      case 'cart':
        // Sync cart items
        break;
      case 'user-profile':
        // Sync user profile changes
        break;
      // Add other entity types
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  private async warmupCache(): Promise<void> {
    console.log('Warming up cache...');
    
    // Warm up categories (most critical for navigation)
    try {
      const categoriesKey = generateCacheKey('categories');
      if (!primaryCache.has(categoriesKey)) {
        // In a real implementation, this would fetch from API
        // For now, we'll just log that we're warming up
        console.log('Warming up categories cache');
      }
    } catch (error) {
      console.warn('Failed to warm up categories cache:', error);
    }
    
    // Warm up featured products
    try {
      const featuredKey = generateCacheKey('featured-products');
      if (!primaryCache.has(featuredKey)) {
        // In a real implementation, this would fetch from API
        console.log('Warming up featured products cache');
      }
    } catch (error) {
      console.warn('Failed to warm up featured products cache:', error);
    }
  }

  /**
   * Preload critical data with priority
   */
  async preloadCriticalData(): Promise<void> {
    console.log('Preloading critical data...');
    
    // Preload user profile if authenticated
    try {
      // In a real implementation, this would check auth state and preload user data
      console.log('Preloading user profile data');
    } catch (error) {
      console.warn('Failed to preload user profile:', error);
    }
    
    // Preload cart data
    try {
      // In a real implementation, this would preload cart data
      console.log('Preloading cart data');
    } catch (error) {
      console.warn('Failed to preload cart data:', error);
    }
  }

  /**
   * Start periodic sync for offline changes
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (navigator.onLine && this.syncQueue.size > 0) {
        this.syncOfflineChanges();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  /**
   * Simple encryption/decryption (implement proper encryption in production)
   */
  private encrypt(data: any): any {
    // Implement proper encryption
    return data;
  }

  private decrypt(data: any): any {
    // Implement proper decryption
    return data;
  }

  private getEntityTypeFromConfig(config: CacheConfig): string {
    // Extract entity type from config tags
    return config.tags[0] || 'default';
  }
}

// Global intelligent cache manager instance
export const intelligentCache = new IntelligentCacheManager();
