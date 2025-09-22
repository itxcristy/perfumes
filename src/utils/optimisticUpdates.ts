import { offlineSync } from './offlineSync';
import { intelligentCache } from './intelligentCaching';
import { useNormalizedState } from './stateManagement';

// Optimistic update configuration
export interface OptimisticConfig {
  timeout: number; // How long to wait before considering update failed
  rollbackOnError: boolean; // Whether to rollback on error
  showLoadingState: boolean; // Whether to show loading indicators
  retryOnFailure: boolean; // Whether to retry failed updates
  maxRetries: number; // Maximum retry attempts
  conflictResolution: 'client-wins' | 'server-wins' | 'merge';
}

// Optimistic update state
export interface OptimisticUpdate {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  originalData: any;
  optimisticData: any;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled-back';
  error?: string;
  retries: number;
}

// Default optimistic configuration
const DEFAULT_CONFIG: OptimisticConfig = {
  timeout: 10000, // 10 seconds
  rollbackOnError: true,
  showLoadingState: true,
  retryOnFailure: true,
  maxRetries: 3,
  conflictResolution: 'server-wins'
};

export class OptimisticUpdateManager {
  private updates: Map<string, OptimisticUpdate> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupOfflineSyncListeners();
  }

  /**
   * Perform optimistic create operation
   */
  async optimisticCreate<T>(
    entityType: string,
    data: T,
    serverAction: () => Promise<T>,
    config: Partial<OptimisticConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const updateId = this.generateUpdateId();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic data with temporary ID
    const optimisticData = { ...data, id: tempId };

    // Create optimistic update record
    const update: OptimisticUpdate = {
      id: updateId,
      entityType,
      entityId: tempId,
      operation: 'create',
      originalData: null,
      optimisticData,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    this.updates.set(updateId, update);

    // Apply optimistic update to cache immediately
    await intelligentCache.set(`${entityType}_${tempId}`, optimisticData, entityType);

    // Emit optimistic update event
    this.emit('optimisticUpdate', { update, data: optimisticData });

    // Set timeout for rollback
    this.setUpdateTimeout(updateId, finalConfig);

    try {
      // Perform server action
      const serverResult = await serverAction();
      
      // Confirm optimistic update
      await this.confirmUpdate(updateId, serverResult);
      
      return serverResult;
    } catch (error) {
      // Handle failure
      await this.handleUpdateFailure(updateId, error, finalConfig);
      throw error;
    }
  }

  /**
   * Perform optimistic update operation
   */
  async optimisticUpdate<T>(
    entityType: string,
    entityId: string,
    updates: Partial<T>,
    serverAction: () => Promise<T>,
    config: Partial<OptimisticConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const updateId = this.generateUpdateId();

    // Get current data from cache
    const currentData = await intelligentCache.get(
      `${entityType}_${entityId}`,
      () => Promise.resolve(null),
      entityType
    );

    if (!currentData) {
      throw new Error(`Entity ${entityId} not found in cache`);
    }

    // Create optimistic data
    const optimisticData = { ...currentData, ...updates };

    // Create optimistic update record
    const update: OptimisticUpdate = {
      id: updateId,
      entityType,
      entityId,
      operation: 'update',
      originalData: currentData,
      optimisticData,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    this.updates.set(updateId, update);

    // Apply optimistic update to cache immediately
    await intelligentCache.set(`${entityType}_${entityId}`, optimisticData, entityType);

    // Emit optimistic update event
    this.emit('optimisticUpdate', { update, data: optimisticData });

    // Set timeout for rollback
    this.setUpdateTimeout(updateId, finalConfig);

    try {
      // Perform server action
      const serverResult = await serverAction();
      
      // Confirm optimistic update
      await this.confirmUpdate(updateId, serverResult);
      
      return serverResult;
    } catch (error) {
      // Handle failure
      await this.handleUpdateFailure(updateId, error, finalConfig);
      throw error;
    }
  }

  /**
   * Perform optimistic delete operation
   */
  async optimisticDelete<T>(
    entityType: string,
    entityId: string,
    serverAction: () => Promise<void>,
    config: Partial<OptimisticConfig> = {}
  ): Promise<void> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const updateId = this.generateUpdateId();

    // Get current data from cache
    const currentData = await intelligentCache.get(
      `${entityType}_${entityId}`,
      () => Promise.resolve(null),
      entityType
    );

    if (!currentData) {
      throw new Error(`Entity ${entityId} not found in cache`);
    }

    // Create optimistic update record
    const update: OptimisticUpdate = {
      id: updateId,
      entityType,
      entityId,
      operation: 'delete',
      originalData: currentData,
      optimisticData: null,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    this.updates.set(updateId, update);

    // Remove from cache immediately (optimistic delete)
    const cache = this.selectCache(entityType);
    cache.delete(`${entityType}_${entityId}`);

    // Emit optimistic update event
    this.emit('optimisticUpdate', { update, data: null });

    // Set timeout for rollback
    this.setUpdateTimeout(updateId, finalConfig);

    try {
      // Perform server action
      await serverAction();
      
      // Confirm optimistic update
      await this.confirmUpdate(updateId, null);
    } catch (error) {
      // Handle failure
      await this.handleUpdateFailure(updateId, error, finalConfig);
      throw error;
    }
  }

  /**
   * Batch optimistic updates
   */
  async optimisticBatch<T>(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      entityType: string;
      entityId?: string;
      data?: any;
      updates?: Partial<T>;
    }>,
    serverAction: () => Promise<any[]>,
    config: Partial<OptimisticConfig> = {}
  ): Promise<any[]> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const batchId = this.generateUpdateId();
    const updateIds: string[] = [];

    // Apply all optimistic updates
    for (const op of operations) {
      const updateId = this.generateUpdateId();
      updateIds.push(updateId);

      switch (op.type) {
        case 'create':
          await this.applyOptimisticCreate(updateId, op.entityType, op.data);
          break;
        case 'update':
          await this.applyOptimisticUpdate(updateId, op.entityType, op.entityId!, op.updates!);
          break;
        case 'delete':
          await this.applyOptimisticDelete(updateId, op.entityType, op.entityId!);
          break;
      }
    }

    // Set timeout for batch rollback
    this.setBatchTimeout(updateIds, finalConfig);

    try {
      // Perform server action
      const results = await serverAction();
      
      // Confirm all updates
      for (let i = 0; i < updateIds.length; i++) {
        await this.confirmUpdate(updateIds[i], results[i]);
      }
      
      return results;
    } catch (error) {
      // Rollback all updates
      for (const updateId of updateIds) {
        await this.handleUpdateFailure(updateId, error, finalConfig);
      }
      throw error;
    }
  }

  /**
   * Confirm an optimistic update
   */
  private async confirmUpdate(updateId: string, serverData: any): Promise<void> {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Clear timeout
    const timeout = this.timeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(updateId);
    }

    // Update status
    update.status = 'confirmed';

    // Update cache with server data if different from optimistic data
    if (serverData && update.operation !== 'delete') {
      const cacheKey = `${update.entityType}_${serverData.id || update.entityId}`;
      await intelligentCache.set(cacheKey, serverData, update.entityType);

      // If this was a create operation with temp ID, we need to update references
      if (update.operation === 'create' && serverData.id !== update.entityId) {
        // Remove temp entry
        const cache = this.selectCache(update.entityType);
        cache.delete(`${update.entityType}_${update.entityId}`);
      }
    }

    // Emit confirmation event
    this.emit('updateConfirmed', { update, serverData });

    // Clean up
    this.updates.delete(updateId);
  }

  /**
   * Handle update failure
   */
  private async handleUpdateFailure(
    updateId: string,
    error: any,
    config: OptimisticConfig
  ): Promise<void> {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Clear timeout
    const timeout = this.timeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(updateId);
    }

    update.error = error.message || 'Unknown error';
    update.retries++;

    // Retry logic
    if (config.retryOnFailure && update.retries < config.maxRetries) {
      update.status = 'pending';
      
      // Exponential backoff retry
      const delay = Math.min(1000 * Math.pow(2, update.retries), 10000);
      setTimeout(() => {
        this.retryUpdate(updateId, config);
      }, delay);
      
      return;
    }

    // Max retries reached or retry disabled
    update.status = 'failed';

    // Rollback if configured
    if (config.rollbackOnError) {
      await this.rollbackUpdate(update);
    }

    // Emit failure event
    this.emit('updateFailed', { update, error });

    // Clean up
    this.updates.delete(updateId);
  }

  /**
   * Rollback an optimistic update
   */
  private async rollbackUpdate(update: OptimisticUpdate): Promise<void> {
    const cacheKey = `${update.entityType}_${update.entityId}`;

    switch (update.operation) {
      case 'create':
        // Remove the optimistically created entity
        const cache = this.selectCache(update.entityType);
        cache.delete(cacheKey);
        break;

      case 'update':
        // Restore original data
        if (update.originalData) {
          await intelligentCache.set(cacheKey, update.originalData, update.entityType);
        }
        break;

      case 'delete':
        // Restore deleted entity
        if (update.originalData) {
          await intelligentCache.set(cacheKey, update.originalData, update.entityType);
        }
        break;
    }

    update.status = 'rolled-back';
    this.emit('updateRolledBack', { update });
  }

  /**
   * Retry a failed update
   */
  private async retryUpdate(updateId: string, config: OptimisticConfig): Promise<void> {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Queue for offline sync if offline
    if (!navigator.onLine) {
      this.queueForOfflineSync(update);
      return;
    }

    // Set new timeout
    this.setUpdateTimeout(updateId, config);

    // Emit retry event
    this.emit('updateRetry', { update });
  }

  /**
   * Queue update for offline sync
   */
  private queueForOfflineSync(update: OptimisticUpdate): void {
    switch (update.operation) {
      case 'create':
        offlineSync.create(update.entityType, update.optimisticData);
        break;
      case 'update':
        offlineSync.update(update.entityType, update.entityId, update.optimisticData);
        break;
      case 'delete':
        offlineSync.delete(update.entityType, update.entityId);
        break;
    }

    // Mark as queued for sync
    this.emit('updateQueuedForSync', { update });
    this.updates.delete(update.id);
  }

  /**
   * Get pending optimistic updates
   */
  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values());
  }

  /**
   * Get updates for specific entity
   */
  getUpdatesForEntity(entityType: string, entityId: string): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter(
      update => update.entityType === entityType && update.entityId === entityId
    );
  }

  /**
   * Check if entity has pending updates
   */
  hasPendingUpdates(entityType: string, entityId: string): boolean {
    return this.getUpdatesForEntity(entityType, entityId).length > 0;
  }

  /**
   * Cancel pending update
   */
  async cancelUpdate(updateId: string): Promise<void> {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Clear timeout
    const timeout = this.timeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(updateId);
    }

    // Rollback the update
    await this.rollbackUpdate(update);

    // Clean up
    this.updates.delete(updateId);
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Helper methods
   */
  private generateUpdateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setUpdateTimeout(updateId: string, config: OptimisticConfig): void {
    const timeout = setTimeout(() => {
      this.handleUpdateFailure(updateId, new Error('Update timeout'), config);
    }, config.timeout);
    
    this.timeouts.set(updateId, timeout);
  }

  private setBatchTimeout(updateIds: string[], config: OptimisticConfig): void {
    const timeout = setTimeout(() => {
      updateIds.forEach(id => {
        this.handleUpdateFailure(id, new Error('Batch timeout'), config);
      });
    }, config.timeout);

    updateIds.forEach(id => this.timeouts.set(id, timeout));
  }

  private selectCache(entityType: string) {
    // Simplified cache selection
    return intelligentCache;
  }

  private setupOfflineSyncListeners(): void {
    offlineSync.on('operationSynced', (operation: any) => {
      // Handle successful sync of queued operations
      this.emit('offlineOperationSynced', operation);
    });

    offlineSync.on('operationFailed', (data: any) => {
      // Handle failed sync of queued operations
      this.emit('offlineOperationFailed', data);
    });
  }

  // Placeholder methods for optimistic operations
  private async applyOptimisticCreate(updateId: string, entityType: string, data: any): Promise<void> {
    // Implementation for optimistic create
  }

  private async applyOptimisticUpdate(updateId: string, entityType: string, entityId: string, updates: any): Promise<void> {
    // Implementation for optimistic update
  }

  private async applyOptimisticDelete(updateId: string, entityType: string, entityId: string): Promise<void> {
    // Implementation for optimistic delete
  }
}

// Global optimistic update manager
export const optimisticUpdates = new OptimisticUpdateManager();
