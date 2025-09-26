import { primaryCache, apiCache, userCache, imageCache } from './cache';
import { performanceMonitor } from './performance';

// Advanced cache configuration with more granular control
export interface AdvancedCacheConfig {
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  ttl: number;
  maxAge: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  compression: boolean;
  encryption?: boolean;
  syncOnline?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  version?: number; // Cache version for invalidation
  dependencies?: string[]; // Cache keys this entry depends on
}

// Cache warming configuration
export interface CacheWarmingConfig {
  warmingInterval: number; // How often to warm cache (ms)
  warmingStrategy: 'aggressive' | 'conservative' | 'smart';
  warmingThreshold: number; // Access count threshold for warming
  maxWarmingBatchSize: number; // Max items to warm at once
}

// Background sync configuration
export interface BackgroundSyncConfig {
  syncInterval: number; // How often to sync (ms)
  maxRetries: number; // Max retry attempts
  retryDelay: number; // Base delay between retries (ms)
  exponentialBackoff: boolean; // Use exponential backoff
  batchSize: number; // Max items to sync in one batch
}

// Advanced cache manager with enhanced features
export class AdvancedCacheManager {
  private warmingConfig: CacheWarmingConfig;
  private syncConfig: BackgroundSyncConfig;
  private warmingTimer: NodeJS.Timeout | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private accessPatterns: Map<string, { count: number; lastAccess: number }> = new Map();
  private dependencies: Map<string, Set<string>> = new Map(); // key -> dependencies

  constructor(
    warmingConfig: Partial<CacheWarmingConfig> = {},
    syncConfig: Partial<BackgroundSyncConfig> = {}
  ) {
    this.warmingConfig = {
      warmingInterval: 300000, // 5 minutes
      warmingStrategy: 'smart',
      warmingThreshold: 10,
      maxWarmingBatchSize: 20,
      ...warmingConfig
    };

    this.syncConfig = {
      syncInterval: 60000, // 1 minute
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      batchSize: 10,
      ...syncConfig
    };

    this.startWarmingProcess();
    this.startSyncProcess();
  }

  /**
   * Enhanced get with advanced caching strategies
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: Partial<AdvancedCacheConfig> = {}
  ): Promise<T> {
    const defaultConfig: AdvancedCacheConfig = {
      strategy: 'stale-while-revalidate',
      ttl: 5 * 60 * 1000, // 5 minutes
      maxAge: 15 * 60 * 1000, // 15 minutes
      priority: 'medium',
      tags: [],
      compression: false,
      version: 1
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    // Track access pattern
    this.trackAccess(key);
    
    // Add dependencies if specified
    if (finalConfig.dependencies && finalConfig.dependencies.length > 0) {
      this.addDependencies(key, finalConfig.dependencies);
    }

    performanceMonitor.startMeasure(`advanced-cache-get-${key}`);

    try {
      switch (finalConfig.strategy) {
        case 'cache-first':
          return await this.cacheFirstStrategy(key, fetchFn, finalConfig);
        
        case 'network-first':
          return await this.networkFirstStrategy(key, fetchFn, finalConfig);
        
        case 'stale-while-revalidate':
          return await this.staleWhileRevalidateStrategy(key, fetchFn, finalConfig);
        
        case 'network-only':
          return await this.networkOnlyStrategy(key, fetchFn, finalConfig);
        
        case 'cache-only':
          return await this.cacheOnlyStrategy(key, finalConfig);
        
        default:
          return await fetchFn();
      }
    } finally {
      performanceMonitor.endMeasure(`advanced-cache-get-${key}`);
    }
  }

  /**
   * Set data with advanced caching options
   */
  async set<T>(
    key: string,
    data: T,
    config: Partial<AdvancedCacheConfig> = {}
  ): Promise<void> {
    const defaultConfig: AdvancedCacheConfig = {
      strategy: 'stale-while-revalidate',
      ttl: 5 * 60 * 1000,
      maxAge: 15 * 60 * 1000,
      priority: 'medium',
      tags: [],
      compression: false,
      version: 1
    };

    const finalConfig = { ...defaultConfig, ...config };
    const cache = this.selectCache(finalConfig.tags);

    // Add version to key for cache invalidation
    const versionedKey = `${key}_v${finalConfig.version}`;

    // Encrypt sensitive data
    const processedData = finalConfig.encryption ? this.encrypt(data) : data;

    cache.set(versionedKey, processedData, {
      ttl: finalConfig.ttl,
      priority: finalConfig.priority,
      tags: finalConfig.tags,
      compress: finalConfig.compression
    });

    // Invalidate dependencies
    this.invalidateDependencies(key);
  }

  /**
   * Cache warming - proactively load frequently accessed data
   */
  private async warmCache(): Promise<void> {
    try {
      const candidates = this.getCandidatesForWarming();
      
      // Limit batch size
      const batch = candidates.slice(0, this.warmingConfig.maxWarmingBatchSize);
      
      // Warm each candidate
      await Promise.all(
        batch.map(async ({ key, fetchFn }) => {
          try {
            await fetchFn();
          } catch (error) {
            console.warn(`Cache warming failed for ${key}:`, error);
          }
        })
      );
    } catch (error) {
      console.error('Cache warming process failed:', error);
    }
  }

  /**
   * Get candidates for cache warming based on access patterns
   */
  private getCandidatesForWarming(): Array<{ key: string; fetchFn: () => Promise<any> }> {
    const candidates: Array<{ key: string; fetchFn: () => Promise<any> }> = [];
    const now = Date.now();
    
    for (const [key, pattern] of this.accessPatterns.entries()) {
      // Check if this key should be warmed based on strategy
      const shouldWarm = this.shouldWarmKey(key, pattern, now);
      
      if (shouldWarm) {
        // In a real implementation, you'd have the fetch function stored
        // For now, we'll just create a placeholder
        candidates.push({
          key,
          fetchFn: async () => {
            // This would be replaced with actual fetch logic
            console.log(`Warming cache for ${key}`);
          }
        });
      }
    }
    
    return candidates;
  }

  /**
   * Determine if a key should be warmed based on access pattern and strategy
   */
  private shouldWarmKey(
    key: string, 
    pattern: { count: number; lastAccess: number }, 
    now: number
  ): boolean {
    switch (this.warmingConfig.warmingStrategy) {
      case 'aggressive':
        return pattern.count >= this.warmingConfig.warmingThreshold;
      
      case 'conservative':
        // Only warm if accessed recently and frequently
        return (
          pattern.count >= this.warmingConfig.warmingThreshold &&
          now - pattern.lastAccess < this.warmingConfig.warmingInterval
        );
      
      case 'smart':
      default:
        // Smart warming considers both frequency and recency
        const timeDecay = (now - pattern.lastAccess) / this.warmingConfig.warmingInterval;
        const score = pattern.count / (1 + timeDecay);
        return score >= this.warmingConfig.warmingThreshold / 2;
    }
  }

  /**
   * Background sync for offline data
   */
  private async syncOfflineData(): Promise<void> {
    // This would sync data that was stored while offline
    // Implementation depends on your specific data structure
    console.log('Running background sync...');
  }

  /**
   * Track access patterns for cache warming
   */
  private trackAccess(key: string): void {
    const pattern = this.accessPatterns.get(key) || { count: 0, lastAccess: Date.now() };
    pattern.count++;
    pattern.lastAccess = Date.now();
    this.accessPatterns.set(key, pattern);
  }

  /**
   * Add dependencies for a cache key
   */
  private addDependencies(key: string, dependencies: string[]): void {
    for (const dep of dependencies) {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep)!.add(key);
    }
  }

  /**
   * Invalidate all keys that depend on a given key
   */
  private invalidateDependencies(key: string): void {
    const dependents = this.dependencies.get(key);
    if (dependents) {
      for (const dependent of dependents) {
        // Invalidate dependent cache entries
        primaryCache.delete(dependent);
        apiCache.delete(dependent);
        userCache.delete(dependent);
        imageCache.delete(dependent);
      }
    }
  }

  /**
   * Select appropriate cache based on tags
   */
  private selectCache(tags: string[]) {
    if (tags.includes('user') || tags.includes('profile') || tags.includes('cart')) {
      return userCache;
    }
    if (tags.includes('image') || tags.includes('asset')) {
      return imageCache;
    }
    if (tags.includes('api')) {
      return apiCache;
    }
    return primaryCache;
  }

  /**
   * Cache-first strategy implementation
   */
  private async cacheFirstStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: AdvancedCacheConfig
  ): Promise<T> {
    const versionedKey = `${key}_v${config.version}`;
    const cache = this.selectCache(config.tags);
    
    // Try cache first
    const cached = cache.get<T>(versionedKey);
    if (cached !== null) {
      return config.encryption ? this.decrypt(cached) : cached;
    }

    // Fallback to network
    try {
      const data = await fetchFn();
      await this.set(key, data, config);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Network-first strategy implementation
   */
  private async networkFirstStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: AdvancedCacheConfig
  ): Promise<T> {
    const versionedKey = `${key}_v${config.version}`;
    const cache = this.selectCache(config.tags);
    
    try {
      const data = await fetchFn();
      await this.set(key, data, config);
      return data;
    } catch (error) {
      // Fallback to cache
      const cached = cache.get<T>(versionedKey);
      if (cached !== null) {
        console.warn(`Serving cached data for ${key} due to network error`);
        return config.encryption ? this.decrypt(cached) : cached;
      }
      throw error;
    }
  }

  /**
   * Stale-while-revalidate strategy implementation
   */
  private async staleWhileRevalidateStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: AdvancedCacheConfig
  ): Promise<T> {
    const versionedKey = `${key}_v${config.version}`;
    const cache = this.selectCache(config.tags);
    const cached = cache.get<T>(versionedKey);
    
    // Serve cached data immediately if available
    if (cached !== null) {
      // Update in background
      setTimeout(async () => {
        try {
          const freshData = await fetchFn();
          await this.set(key, freshData, config);
        } catch (error) {
          console.warn(`Background update failed for ${key}:`, error);
        }
      }, 0);
      
      return config.encryption ? this.decrypt(cached) : cached;
    }

    // No cache, fetch fresh data
    const data = await fetchFn();
    await this.set(key, data, config);
    return data;
  }

  /**
   * Network-only strategy implementation
   */
  private async networkOnlyStrategy<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: AdvancedCacheConfig
  ): Promise<T> {
    const data = await fetchFn();
    
    // Still cache for offline fallback if configured
    if (config.syncOnline) {
      await this.set(key, data, config);
    }
    
    return data;
  }

  /**
   * Cache-only strategy implementation
   */
  private async cacheOnlyStrategy<T>(
    key: string,
    config: AdvancedCacheConfig
  ): Promise<T> {
    const versionedKey = `${key}_v${config.version}`;
    const cache = this.selectCache(config.tags);
    const cached = cache.get<T>(versionedKey);
    
    if (cached === null) {
      throw new Error(`No cached data available for ${key}`);
    }
    return config.encryption ? this.decrypt(cached) : cached;
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

  /**
   * Start cache warming process
   */
  private startWarmingProcess(): void {
    this.warmingTimer = setInterval(() => {
      this.warmCache();
    }, this.warmingConfig.warmingInterval);
  }

  /**
   * Start background sync process
   */
  private startSyncProcess(): void {
    this.syncTimer = setInterval(() => {
      this.syncOfflineData();
    }, this.syncConfig.syncInterval);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.warmingTimer) {
      clearInterval(this.warmingTimer);
      this.warmingTimer = null;
    }
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    this.accessPatterns.clear();
    this.dependencies.clear();
  }
}

// Global advanced cache manager instance
export const advancedCacheManager = new AdvancedCacheManager();

// Utility functions for common caching patterns

/**
 * Cache with time-based invalidation
 */
export const timeBasedCache = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> => {
  return advancedCacheManager.get(key, fetchFn, { ttl });
};

/**
 * Cache with dependency-based invalidation
 */
export const dependencyBasedCache = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: string[]
): Promise<T> => {
  return advancedCacheManager.get(key, fetchFn, { dependencies });
};

/**
 * Cache with version-based invalidation
 */
export const versionBasedCache = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  version: number = 1
): Promise<T> => {
  return advancedCacheManager.get(key, fetchFn, { version });
};

/**
 * Priority cache for critical data
 */
export const priorityCache = <T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return advancedCacheManager.get(key, fetchFn, { priority: 'critical' });
};