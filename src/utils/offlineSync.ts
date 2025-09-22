import { intelligentCache } from './intelligentCaching';
import { primaryCache } from './cache';

// Offline operation types
export type OfflineOperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'BATCH';

// Offline operation structure
export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  entityType: string;
  entityId: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[]; // Other operation IDs this depends on
  conflictResolution: 'client-wins' | 'server-wins' | 'merge' | 'manual';
}

// Conflict resolution result
export interface ConflictResolution {
  resolution: 'client' | 'server' | 'merged' | 'manual';
  data: any;
  conflicts: Array<{
    field: string;
    clientValue: any;
    serverValue: any;
    resolution: any;
  }>;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTime: number;
  syncErrors: Array<{
    operationId: string;
    error: string;
    timestamp: number;
  }>;
}

export class OfflineSyncManager {
  private operations: Map<string, OfflineOperation> = new Map();
  private syncInProgress: boolean = false;
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: 0,
    lastSyncTime: 0,
    syncErrors: []
  };
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeFromStorage();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  /**
   * Add an offline operation to the queue
   */
  addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries'>): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0
    };

    this.operations.set(id, fullOperation);
    this.persistToStorage();
    this.updateSyncStatus();

    // Emit event
    this.emit('operationAdded', fullOperation);

    // Try immediate sync if online
    if (navigator.onLine) {
      this.syncOperations();
    }

    return id;
  }

  /**
   * Create operation
   */
  create(entityType: string, data: any, options: {
    priority?: OfflineOperation['priority'];
    conflictResolution?: OfflineOperation['conflictResolution'];
  } = {}): string {
    return this.addOperation({
      type: 'CREATE',
      entityType,
      entityId: data.id || `temp_${Date.now()}`,
      data,
      maxRetries: 3,
      priority: options.priority || 'medium',
      conflictResolution: options.conflictResolution || 'client-wins'
    });
  }

  /**
   * Update operation
   */
  update(entityType: string, entityId: string, data: any, options: {
    priority?: OfflineOperation['priority'];
    conflictResolution?: OfflineOperation['conflictResolution'];
  } = {}): string {
    return this.addOperation({
      type: 'UPDATE',
      entityType,
      entityId,
      data,
      maxRetries: 3,
      priority: options.priority || 'medium',
      conflictResolution: options.conflictResolution || 'merge'
    });
  }

  /**
   * Delete operation
   */
  delete(entityType: string, entityId: string, options: {
    priority?: OfflineOperation['priority'];
    conflictResolution?: OfflineOperation['conflictResolution'];
  } = {}): string {
    return this.addOperation({
      type: 'DELETE',
      entityType,
      entityId,
      data: { id: entityId },
      maxRetries: 3,
      priority: options.priority || 'medium',
      conflictResolution: options.conflictResolution || 'server-wins'
    });
  }

  /**
   * Batch operations
   */
  batch(operations: Array<{
    type: Exclude<OfflineOperationType, 'BATCH'>;
    entityType: string;
    entityId: string;
    data: any;
  }>, options: {
    priority?: OfflineOperation['priority'];
    conflictResolution?: OfflineOperation['conflictResolution'];
  } = {}): string {
    return this.addOperation({
      type: 'BATCH',
      entityType: 'batch',
      entityId: `batch_${Date.now()}`,
      data: operations,
      maxRetries: 3,
      priority: options.priority || 'medium',
      conflictResolution: options.conflictResolution || 'merge'
    });
  }

  /**
   * Sync all pending operations
   */
  async syncOperations(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    this.syncStatus.isSyncing = true;
    this.emit('syncStarted');

    try {
      // Sort operations by priority and timestamp
      const sortedOperations = Array.from(this.operations.values())
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
        });

      // Process operations with dependency resolution
      await this.processOperationsWithDependencies(sortedOperations);

      this.syncStatus.lastSyncTime = Date.now();
      this.emit('syncCompleted');

    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('syncFailed', error);
    } finally {
      this.syncInProgress = false;
      this.syncStatus.isSyncing = false;
      this.updateSyncStatus();
    }
  }

  /**
   * Process operations with dependency resolution
   */
  private async processOperationsWithDependencies(operations: OfflineOperation[]): Promise<void> {
    const processed = new Set<string>();
    const processing = new Set<string>();

    const processOperation = async (operation: OfflineOperation): Promise<void> => {
      if (processed.has(operation.id) || processing.has(operation.id)) {
        return;
      }

      processing.add(operation.id);

      // Process dependencies first
      if (operation.dependencies) {
        for (const depId of operation.dependencies) {
          const depOperation = this.operations.get(depId);
          if (depOperation && !processed.has(depId)) {
            await processOperation(depOperation);
          }
        }
      }

      try {
        await this.syncSingleOperation(operation);
        this.operations.delete(operation.id);
        processed.add(operation.id);
      } catch (error) {
        this.handleSyncError(operation, error);
      } finally {
        processing.delete(operation.id);
      }
    };

    // Process all operations
    for (const operation of operations) {
      await processOperation(operation);
    }

    this.persistToStorage();
  }

  /**
   * Sync a single operation
   */
  private async syncSingleOperation(operation: OfflineOperation): Promise<void> {
    const { type, entityType, entityId, data } = operation;

    switch (type) {
      case 'CREATE':
        await this.syncCreate(entityType, data, operation);
        break;
      case 'UPDATE':
        await this.syncUpdate(entityType, entityId, data, operation);
        break;
      case 'DELETE':
        await this.syncDelete(entityType, entityId, operation);
        break;
      case 'BATCH':
        await this.syncBatch(data, operation);
        break;
    }

    this.emit('operationSynced', operation);
  }

  /**
   * Sync create operation
   */
  private async syncCreate(entityType: string, data: any, operation: OfflineOperation): Promise<void> {
    // Check if entity already exists on server (conflict detection)
    const existingEntity = await this.fetchEntityFromServer(entityType, data.id);
    
    if (existingEntity) {
      // Handle conflict
      const resolution = await this.resolveConflict(operation, existingEntity, data);
      if (resolution.resolution === 'server') {
        // Server wins, update local cache
        await intelligentCache.set(`${entityType}_${data.id}`, existingEntity, entityType);
        return;
      }
      data = resolution.data;
    }

    // Create on server
    const createdEntity = await this.createEntityOnServer(entityType, data);
    
    // Update local cache with server response
    await intelligentCache.set(`${entityType}_${createdEntity.id}`, createdEntity, entityType);
  }

  /**
   * Sync update operation
   */
  private async syncUpdate(entityType: string, entityId: string, data: any, operation: OfflineOperation): Promise<void> {
    // Fetch current server state
    const serverEntity = await this.fetchEntityFromServer(entityType, entityId);
    
    if (!serverEntity) {
      throw new Error(`Entity ${entityId} not found on server`);
    }

    // Check for conflicts
    const resolution = await this.resolveConflict(operation, serverEntity, data);
    
    if (resolution.resolution === 'server') {
      // Server wins, update local cache
      await intelligentCache.set(`${entityType}_${entityId}`, serverEntity, entityType);
      return;
    }

    // Update on server
    const updatedEntity = await this.updateEntityOnServer(entityType, entityId, resolution.data);
    
    // Update local cache
    await intelligentCache.set(`${entityType}_${entityId}`, updatedEntity, entityType);
  }

  /**
   * Sync delete operation
   */
  private async syncDelete(entityType: string, entityId: string, operation: OfflineOperation): Promise<void> {
    try {
      await this.deleteEntityOnServer(entityType, entityId);
      
      // Remove from local cache
      const cache = this.selectCache(entityType);
      cache.delete(`${entityType}_${entityId}`);
    } catch (error) {
      if (error.status === 404) {
        // Entity already deleted on server, just remove from cache
        const cache = this.selectCache(entityType);
        cache.delete(`${entityType}_${entityId}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Sync batch operations
   */
  private async syncBatch(operations: any[], operation: OfflineOperation): Promise<void> {
    // Process batch operations on server
    const results = await this.processBatchOnServer(operations);
    
    // Update local cache with results
    for (const result of results) {
      if (result.success) {
        await intelligentCache.set(
          `${result.entityType}_${result.entityId}`, 
          result.data, 
          result.entityType
        );
      }
    }
  }

  /**
   * Resolve conflicts between client and server data
   */
  private async resolveConflict(
    operation: OfflineOperation,
    serverData: any,
    clientData: any
  ): Promise<ConflictResolution> {
    const { conflictResolution } = operation;

    switch (conflictResolution) {
      case 'client-wins':
        return {
          resolution: 'client',
          data: clientData,
          conflicts: []
        };

      case 'server-wins':
        return {
          resolution: 'server',
          data: serverData,
          conflicts: []
        };

      case 'merge':
        return this.mergeData(serverData, clientData);

      case 'manual':
        // Emit event for manual resolution
        return new Promise((resolve) => {
          this.emit('conflictRequiresManualResolution', {
            operation,
            serverData,
            clientData,
            resolve
          });
        });

      default:
        return {
          resolution: 'server',
          data: serverData,
          conflicts: []
        };
    }
  }

  /**
   * Merge client and server data
   */
  private mergeData(serverData: any, clientData: any): ConflictResolution {
    const merged = { ...serverData };
    const conflicts: ConflictResolution['conflicts'] = [];

    for (const [key, clientValue] of Object.entries(clientData)) {
      const serverValue = serverData[key];
      
      if (serverValue !== clientValue) {
        conflicts.push({
          field: key,
          clientValue,
          serverValue,
          resolution: clientValue // Default to client value
        });
        merged[key] = clientValue;
      }
    }

    return {
      resolution: 'merged',
      data: merged,
      conflicts
    };
  }

  /**
   * Handle sync errors
   */
  private handleSyncError(operation: OfflineOperation, error: any): void {
    operation.retries++;
    
    this.syncStatus.syncErrors.push({
      operationId: operation.id,
      error: error.message || 'Unknown error',
      timestamp: Date.now()
    });

    if (operation.retries >= operation.maxRetries) {
      // Max retries reached, move to failed operations
      this.emit('operationFailed', { operation, error });
      this.operations.delete(operation.id);
    } else {
      // Schedule retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, operation.retries), 30000);
      setTimeout(() => {
        if (navigator.onLine) {
          this.syncOperations();
        }
      }, delay);
    }

    this.persistToStorage();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get pending operations
   */
  getPendingOperations(): OfflineOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this.operations.clear();
    this.persistToStorage();
    this.updateSyncStatus();
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
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncOperations();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.updateSyncStatus();
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (navigator.onLine && this.operations.size > 0) {
        this.syncOperations();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(): void {
    this.syncStatus.pendingOperations = this.operations.size;
    this.emit('statusUpdated', this.syncStatus);
  }

  /**
   * Persist operations to storage
   */
  private persistToStorage(): void {
    try {
      const operations = Array.from(this.operations.entries());
      localStorage.setItem('offline_operations', JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to persist offline operations:', error);
    }
  }

  /**
   * Initialize from storage
   */
  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem('offline_operations');
      if (stored) {
        const operations = JSON.parse(stored);
        this.operations = new Map(operations);
        this.updateSyncStatus();
      }
    } catch (error) {
      console.error('Failed to load offline operations:', error);
    }
  }

  /**
   * Select appropriate cache
   */
  private selectCache(entityType: string) {
    return primaryCache; // Simplified for now
  }

  // Placeholder methods for server communication
  private async fetchEntityFromServer(entityType: string, entityId: string): Promise<any> {
    // Implement actual server fetch
    return null;
  }

  private async createEntityOnServer(entityType: string, data: any): Promise<any> {
    // Implement actual server create
    return data;
  }

  private async updateEntityOnServer(entityType: string, entityId: string, data: any): Promise<any> {
    // Implement actual server update
    return data;
  }

  private async deleteEntityOnServer(entityType: string, entityId: string): Promise<void> {
    // Implement actual server delete
  }

  private async processBatchOnServer(operations: any[]): Promise<any[]> {
    // Implement actual batch processing
    return [];
  }
}

// Global offline sync manager
export const offlineSync = new OfflineSyncManager();
