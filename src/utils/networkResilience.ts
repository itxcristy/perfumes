import { useState, useEffect, useCallback, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

// Network status hook
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g',
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Initial status
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
};

// Retry mechanism with exponential backoff
export const createRetryableRequest = <T>(
  requestFn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = (error: Error) => {
      // Retry on network errors, timeouts, and 5xx status codes
      return error.message.includes('network') ||
             error.message.includes('timeout') ||
             error.message.includes('fetch') ||
             (error as any).status >= 500;
    }
  } = config;

  return async (): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if condition is not met
        if (!retryCondition(lastError)) {
          throw lastError;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
        
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };
};

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      ...config
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'half-open';
        this.failures = 0;
      } else {
        throw new Error('Circuit breaker is open - service unavailable');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.config.failureThreshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

// Offline queue for requests
export class OfflineRequestQueue {
  private queue: Array<{
    id: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
    retries: number;
  }> = [];
  
  private isProcessing = false;
  private maxRetries = 3;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Process queue when coming back online
    window.addEventListener('online', () => {
      this.processQueue();
    });

    // Clean up old requests periodically
    setInterval(() => {
      this.cleanupOldRequests();
    }, 60000); // Every minute
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.queue.push({
        id,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0
      });

      // Try to process immediately if online
      if (navigator.onLine) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue.shift()!;
      
      try {
        const result = await item.request();
        item.resolve(result);
      } catch (error) {
        item.retries++;
        
        if (item.retries < this.maxRetries) {
          // Re-queue for retry
          this.queue.unshift(item);
        } else {
          item.reject(error);
        }
      }
    }

    this.isProcessing = false;
  }

  private cleanupOldRequests() {
    const now = Date.now();
    this.queue = this.queue.filter(item => {
      const isOld = now - item.timestamp > this.maxAge;
      if (isOld) {
        item.reject(new Error('Request expired'));
      }
      return !isOld;
    });
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      oldestRequest: this.queue.length > 0 ? this.queue[0].timestamp : null
    };
  }

  clearQueue() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

// Hook for graceful degradation
export const useGracefulDegradation = () => {
  const networkStatus = useNetworkStatus();
  const [degradationLevel, setDegradationLevel] = useState<'none' | 'partial' | 'full'>('none');

  useEffect(() => {
    if (!networkStatus.isOnline) {
      setDegradationLevel('full');
    } else if (networkStatus.isSlowConnection) {
      setDegradationLevel('partial');
    } else {
      setDegradationLevel('none');
    }
  }, [networkStatus]);

  const shouldLoadImages = degradationLevel !== 'full';
  const shouldLoadAnimations = degradationLevel === 'none';
  const shouldUseOptimizedQueries = degradationLevel !== 'none';
  const shouldShowOfflineMessage = degradationLevel === 'full';

  return {
    networkStatus,
    degradationLevel,
    shouldLoadImages,
    shouldLoadAnimations,
    shouldUseOptimizedQueries,
    shouldShowOfflineMessage
  };
};

// Global instances
export const globalCircuitBreaker = new CircuitBreaker();
export const globalOfflineQueue = new OfflineRequestQueue();

// Enhanced fetch with resilience features
export const resilientFetch = async (
  url: string,
  options: RequestInit = {},
  config: {
    useRetry?: boolean;
    useCircuitBreaker?: boolean;
    useOfflineQueue?: boolean;
    retryConfig?: Partial<RetryConfig>;
  } = {}
) => {
  const {
    useRetry = true,
    useCircuitBreaker = true,
    useOfflineQueue = true,
    retryConfig = {}
  } = config;

  let fetchOperation = () => fetch(url, options);

  // Add retry mechanism
  if (useRetry) {
    fetchOperation = createRetryableRequest(fetchOperation, retryConfig);
  }

  // Add circuit breaker
  if (useCircuitBreaker) {
    const originalOperation = fetchOperation;
    fetchOperation = () => globalCircuitBreaker.execute(originalOperation);
  }

  // Add offline queue
  if (useOfflineQueue && !navigator.onLine) {
    return globalOfflineQueue.enqueue(fetchOperation);
  }

  return fetchOperation();
};
