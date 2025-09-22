import { intelligentCache, CACHE_CONFIGS } from './intelligentCaching';
import { offlineSync } from './offlineSync';
import { optimisticUpdates } from './optimisticUpdates';
import { supabase } from '../lib/supabase';
import { performanceMonitor } from './performance';

// Data layer configuration
export interface DataLayerConfig {
  enableOptimisticUpdates: boolean;
  enableOfflineSync: boolean;
  enableIntelligentCaching: boolean;
  enablePerformanceMonitoring: boolean;
  defaultTimeout: number;
  retryAttempts: number;
  batchSize: number;
}

// Query options
export interface QueryOptions {
  cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  ttl?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  enableOptimistic?: boolean;
  enableOfflineQueue?: boolean;
  timeout?: number;
  retries?: number;
  tags?: string[];
}

// Mutation options
export interface MutationOptions extends QueryOptions {
  optimisticData?: any;
  rollbackOnError?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
  invalidateTags?: string[];
  updateRelated?: Array<{
    entityType: string;
    entityId: string;
    updates: any;
  }>;
}

// Data layer response
export interface DataLayerResponse<T> {
  data: T;
  fromCache: boolean;
  timestamp: number;
  source: 'cache' | 'network' | 'optimistic';
  metadata?: {
    cacheHit: boolean;
    networkLatency?: number;
    cacheAge?: number;
    conflicts?: any[];
  };
}

// Default configuration
const DEFAULT_CONFIG: DataLayerConfig = {
  enableOptimisticUpdates: true,
  enableOfflineSync: true,
  enableIntelligentCaching: true,
  enablePerformanceMonitoring: true,
  defaultTimeout: 10000,
  retryAttempts: 3,
  batchSize: 50
};

export class DataLayer {
  private config: DataLayerConfig;
  private queryCache: Map<string, Promise<any>> = new Map(); // Prevent duplicate requests
  private subscriptions: Map<string, Set<Function>> = new Map(); // Real-time subscriptions

  constructor(config: Partial<DataLayerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupRealtimeSubscriptions();
  }

  /**
   * Query data with intelligent caching
   */
  async query<T>(
    key: string,
    queryFn: () => Promise<T>,
    entityType: string = 'default',
    options: QueryOptions = {}
  ): Promise<DataLayerResponse<T>> {
    const startTime = Date.now();
    const measureKey = `data-layer-query-${key}`;
    
    if (this.config.enablePerformanceMonitoring) {
      performanceMonitor.startMeasure(measureKey);
    }

    try {
      // Check for in-flight request
      const inFlightRequest = this.queryCache.get(key);
      if (inFlightRequest) {
        const data = await inFlightRequest;
        return {
          data,
          fromCache: true,
          timestamp: Date.now(),
          source: 'cache',
          metadata: { cacheHit: true }
        };
      }

      // Create and cache the request promise
      const requestPromise = this.executeQuery(key, queryFn, entityType, options);
      this.queryCache.set(key, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up in-flight request
        this.queryCache.delete(key);
      }
    } finally {
      if (this.config.enablePerformanceMonitoring) {
        performanceMonitor.endMeasure(measureKey);
      }
    }
  }

  /**
   * Execute query with caching strategy
   */
  private async executeQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    entityType: string,
    options: QueryOptions
  ): Promise<DataLayerResponse<T>> {
    const config = CACHE_CONFIGS[entityType] || CACHE_CONFIGS['products'];
    const strategy = options.cacheStrategy || config.strategy;

    if (this.config.enableIntelligentCaching) {
      const data = await intelligentCache.get(key, queryFn, entityType);
      
      // Determine if data came from cache
      const fromCache = await this.isDataFromCache(key, entityType);
      
      return {
        data,
        fromCache,
        timestamp: Date.now(),
        source: fromCache ? 'cache' : 'network',
        metadata: {
          cacheHit: fromCache,
          networkLatency: fromCache ? 0 : undefined
        }
      };
    } else {
      // Direct network request
      const data = await queryFn();
      return {
        data,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network',
        metadata: { cacheHit: false }
      };
    }
  }

  /**
   * Mutate data with optimistic updates
   */
  async mutate<T>(
    key: string,
    mutationFn: () => Promise<T>,
    entityType: string,
    entityId: string,
    options: MutationOptions = {}
  ): Promise<DataLayerResponse<T>> {
    const measureKey = `data-layer-mutate-${key}`;
    
    if (this.config.enablePerformanceMonitoring) {
      performanceMonitor.startMeasure(measureKey);
    }

    try {
      if (this.config.enableOptimisticUpdates && options.enableOptimistic !== false) {
        return await this.optimisticMutate(key, mutationFn, entityType, entityId, options);
      } else {
        return await this.directMutate(key, mutationFn, entityType, entityId, options);
      }
    } finally {
      if (this.config.enablePerformanceMonitoring) {
        performanceMonitor.endMeasure(measureKey);
      }
    }
  }

  /**
   * Optimistic mutation
   */
  private async optimisticMutate<T>(
    key: string,
    mutationFn: () => Promise<T>,
    entityType: string,
    entityId: string,
    options: MutationOptions
  ): Promise<DataLayerResponse<T>> {
    try {
      let result: T;

      if (options.optimisticData) {
        // Apply optimistic update
        result = await optimisticUpdates.optimisticUpdate(
          entityType,
          entityId,
          options.optimisticData,
          mutationFn,
          {
            rollbackOnError: options.rollbackOnError,
            conflictResolution: options.conflictResolution || 'server-wins'
          }
        );
      } else {
        // Direct mutation with optimistic handling
        result = await mutationFn();
      }

      // Invalidate related caches
      if (options.invalidateTags) {
        await this.invalidateCacheByTags(options.invalidateTags);
      }

      // Update related entities
      if (options.updateRelated) {
        await this.updateRelatedEntities(options.updateRelated);
      }

      return {
        data: result,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network'
      };
    } catch (error) {
      // Queue for offline sync if enabled
      if (this.config.enableOfflineSync && options.enableOfflineQueue !== false) {
        this.queueOfflineMutation(entityType, entityId, options, error);
      }
      throw error;
    }
  }

  /**
   * Direct mutation without optimistic updates
   */
  private async directMutate<T>(
    key: string,
    mutationFn: () => Promise<T>,
    entityType: string,
    entityId: string,
    options: MutationOptions
  ): Promise<DataLayerResponse<T>> {
    try {
      const result = await mutationFn();

      // Update cache
      if (this.config.enableIntelligentCaching) {
        await intelligentCache.set(key, result, entityType);
      }

      // Invalidate related caches
      if (options.invalidateTags) {
        await this.invalidateCacheByTags(options.invalidateTags);
      }

      return {
        data: result,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network'
      };
    } catch (error) {
      // Queue for offline sync if enabled
      if (this.config.enableOfflineSync && options.enableOfflineQueue !== false) {
        this.queueOfflineMutation(entityType, entityId, options, error);
      }
      throw error;
    }
  }

  /**
   * Create entity
   */
  async create<T>(
    entityType: string,
    data: T,
    options: MutationOptions = {}
  ): Promise<DataLayerResponse<T>> {
    const mutationFn = () => this.createOnServer(entityType, data);
    
    if (this.config.enableOptimisticUpdates && options.enableOptimistic !== false) {
      const result = await optimisticUpdates.optimisticCreate(
        entityType,
        data,
        mutationFn,
        {
          rollbackOnError: options.rollbackOnError,
          conflictResolution: options.conflictResolution || 'client-wins'
        }
      );

      return {
        data: result,
        fromCache: false,
        timestamp: Date.now(),
        source: 'optimistic'
      };
    } else {
      const result = await mutationFn();
      return {
        data: result,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network'
      };
    }
  }

  /**
   * Update entity
   */
  async update<T>(
    entityType: string,
    entityId: string,
    updates: Partial<T>,
    options: MutationOptions = {}
  ): Promise<DataLayerResponse<T>> {
    const key = `${entityType}_${entityId}`;
    const mutationFn = () => this.updateOnServer(entityType, entityId, updates);
    
    return await this.mutate(key, mutationFn, entityType, entityId, {
      ...options,
      optimisticData: updates
    });
  }

  /**
   * Delete entity
   */
  async delete(
    entityType: string,
    entityId: string,
    options: MutationOptions = {}
  ): Promise<DataLayerResponse<void>> {
    const mutationFn = () => this.deleteOnServer(entityType, entityId);
    
    if (this.config.enableOptimisticUpdates && options.enableOptimistic !== false) {
      await optimisticUpdates.optimisticDelete(
        entityType,
        entityId,
        mutationFn,
        {
          rollbackOnError: options.rollbackOnError,
          conflictResolution: options.conflictResolution || 'server-wins'
        }
      );

      return {
        data: undefined as void,
        fromCache: false,
        timestamp: Date.now(),
        source: 'optimistic'
      };
    } else {
      await mutationFn();
      return {
        data: undefined as void,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network'
      };
    }
  }

  /**
   * Batch operations
   */
  async batch<T>(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      entityType: string;
      entityId?: string;
      data?: any;
    }>,
    options: MutationOptions = {}
  ): Promise<DataLayerResponse<T[]>> {
    const mutationFn = () => this.batchOnServer(operations);
    
    if (this.config.enableOptimisticUpdates && options.enableOptimistic !== false) {
      const results = await optimisticUpdates.optimisticBatch(
        operations,
        mutationFn,
        {
          rollbackOnError: options.rollbackOnError,
          conflictResolution: options.conflictResolution || 'merge'
        }
      );

      return {
        data: results,
        fromCache: false,
        timestamp: Date.now(),
        source: 'optimistic'
      };
    } else {
      const results = await mutationFn();
      return {
        data: results,
        fromCache: false,
        timestamp: Date.now(),
        source: 'network'
      };
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe<T>(
    entityType: string,
    entityId: string,
    callback: (data: T) => void
  ): () => void {
    const key = `${entityType}_${entityId}`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
      this.setupRealtimeSubscription(entityType, entityId);
    }
    
    this.subscriptions.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(key);
          this.cleanupRealtimeSubscription(entityType, entityId);
        }
      }
    };
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateCacheByTags(tags: string[]): Promise<void> {
    if (this.config.enableIntelligentCaching) {
      // Implementation depends on cache structure
      console.log('Invalidating cache for tags:', tags);
    }
  }

  /**
   * Update related entities
   */
  private async updateRelatedEntities(
    updates: Array<{
      entityType: string;
      entityId: string;
      updates: any;
    }>
  ): Promise<void> {
    for (const update of updates) {
      const key = `${update.entityType}_${update.entityId}`;
      if (this.config.enableIntelligentCaching) {
        // Get current data and merge updates
        const currentData = await intelligentCache.get(
          key,
          () => Promise.resolve(null),
          update.entityType
        );
        
        if (currentData) {
          const updatedData = { ...currentData, ...update.updates };
          await intelligentCache.set(key, updatedData, update.entityType);
        }
      }
    }
  }

  /**
   * Queue offline mutation
   */
  private queueOfflineMutation(
    entityType: string,
    entityId: string,
    options: MutationOptions,
    error: any
  ): void {
    if (this.config.enableOfflineSync) {
      // Queue based on operation type
      if (options.optimisticData) {
        offlineSync.update(entityType, entityId, options.optimisticData);
      }
    }
  }

  /**
   * Check if data came from cache
   */
  private async isDataFromCache(key: string, entityType: string): Promise<boolean> {
    // Implementation depends on cache structure
    return false; // Simplified
  }

  /**
   * Setup real-time subscriptions
   */
  private setupRealtimeSubscriptions(): void {
    // Setup global real-time listeners
    if (supabase) {
      // Implementation for Supabase real-time subscriptions
    }
  }

  /**
   * Setup real-time subscription for specific entity
   */
  private setupRealtimeSubscription(entityType: string, entityId: string): void {
    // Implementation for entity-specific subscriptions
  }

  /**
   * Cleanup real-time subscription
   */
  private cleanupRealtimeSubscription(entityType: string, entityId: string): void {
    // Implementation for cleanup
  }

  /**
   * Server communication methods (implement based on your API)
   */
  private async createOnServer<T>(entityType: string, data: T): Promise<T> {
    // Implement actual server create
    return data;
  }

  private async updateOnServer<T>(entityType: string, entityId: string, updates: Partial<T>): Promise<T> {
    // Implement actual server update
    return updates as T;
  }

  private async deleteOnServer(entityType: string, entityId: string): Promise<void> {
    // Implement actual server delete
  }

  private async batchOnServer(operations: any[]): Promise<any[]> {
    // Implement actual batch processing
    return [];
  }
}

// Global data layer instance
export const dataLayer = new DataLayer();

// Convenience hooks for React components
export const useDataLayer = () => dataLayer;
