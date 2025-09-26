import { DataService } from '../dataService';

// Performance metrics interface
export interface PerformanceMetrics {
  queryExecutionTime: number;
  networkLatency: number;
  cacheHitRatio: number;
  errorRate: number;
  timestamp: number;
}

// Monitoring tags interface
export interface MonitoringTags {
  operation?: string;
  service?: string;
  userId?: string;
  [key: string]: string | undefined;
}

// Performance monitoring middleware
export class PerformanceMonitor extends DataService {
  private static readonly METRICS_WINDOW = 60 * 1000; // 1 minute
  private static cacheHits = 0;
  private static cacheMisses = 0;
  private static errorCount = 0;
  private static successCount = 0;
  
  // Track a metric with optional tags
  static track(operation: string, duration: number, tags: MonitoringTags = {}) {
    // Add to monitoring service
    if ('monitoringService' in globalThis) {
      (globalThis as any).monitoringService.trackMetric(
        'operation_duration', 
        duration, 
        { operation, ...tags }
      );
    }
    
    // Update internal counters for cache hit ratio
    if (tags.service === 'cache') {
      if (tags.hit === 'true') {
        this.cacheHits++;
      } else {
        this.cacheMisses++;
      }
    }
    
    // Update success/error counters
    if (duration >= 0) {
      this.successCount++;
    } else {
      this.errorCount++;
    }
    
    // Clean up old metrics periodically
    this.cleanupOldMetrics();
  }

  // Record query execution time
  static recordQueryTime(operation: string, executionTime: number, tags: MonitoringTags = {}) {
    this.track(operation, executionTime, { ...tags, service: 'database' });
  }

  // Record network latency
  static recordNetworkLatency(operation: string, latency: number, tags: MonitoringTags = {}) {
    this.track(operation, latency, { ...tags, service: 'network' });
    
    // Also track in the data service for consistency
    if (typeof window !== 'undefined') {
      (window as any).performanceMetrics = {
        ...(window as any).performanceMetrics,
        networkLatency: latency
      };
    }
  }

  // Record cache hit/miss
  static recordCacheHit(operation: string, hit: boolean, tags: MonitoringTags = {}) {
    const hitValue = hit ? 'true' : 'false';
    this.track(operation, hit ? 1 : -1, { 
      ...tags, 
      service: 'cache', 
      hit: hitValue 
    });
  }

  // Record error rate
  static recordError(operation: string, error: any, tags: MonitoringTags = {}) {
    this.errorCount++;
    
    // Track with negative duration to indicate error
    this.track(operation, -1, { 
      ...tags, 
      service: 'error', 
      errorType: error?.name || 'Unknown' 
    });
    
    // Also use the error handler if available
    try {
      if ('ErrorHandler' in globalThis) {
        (globalThis as any).ErrorHandler.logError({
          type: this.determineErrorType(error),
          message: error?.message || 'Unknown error',
          operation,
          timestamp: Date.now(),
          userId: tags.userId,
          metadata: {
            stack: error?.stack
          }
        });
      }
    } catch {
      // Ignore errors in error handling
    }
  }

  // Get current performance metrics
  static getMetrics(): PerformanceMetrics {
    const totalRequests = this.successCount + this.errorCount;
    const cacheHitRatio = totalRequests > 0 ? this.cacheHits / (this.cacheHits + this.cacheMisses) : 0;
    const errorRate = totalRequests > 0 ? this.errorCount / totalRequests : 0;
    
    return {
      queryExecutionTime: 0, // This would be calculated from actual query times
      networkLatency: 0, // This would be calculated from actual network measurements
      cacheHitRatio,
      errorRate,
      timestamp: Date.now()
    };
  }

  // Cleanup old metrics to prevent memory leaks
  private static cleanupOldMetrics() {
    const now = Date.now();
    
    // Reset counters every minute to get rolling window
    if (now % this.METRICS_WINDOW < 1000) { // Roughly once per window period
      this.cacheHits = 0;
      this.cacheMisses = 0;
      this.errorCount = 0;
      this.successCount = 0;
    }
  }

  // Determine error type for tracking purposes
  private static determineErrorType(error: any): string {
    if (!error) return 'Unknown';
    
    if (error.name) return error.name;
    
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': return 'NotFound';
        case '23505': return 'Conflict';
        case '42501': return 'Forbidden';
        default: return `Database_${error.code}`;
      }
    }
    
    if (error.message) {
      if (error.message.includes('network')) return 'NetworkError';
      if (error.message.includes('timeout')) return 'Timeout';
      if (error.message.includes('authentication')) return 'AuthenticationError';
      if (error.message.includes('validation')) return 'ValidationError';
    }
    
    return 'Unknown';
  }
}

// Decorator for automatic performance monitoring
export function MonitorPerformance(tags: MonitoringTags = {}) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const start = Date.now();
      let success = false;
      
      try {
        const result = await originalMethod.apply(this, args);
        success = true;
        return result;
      } catch (error) {
        // Re-throw after recording
        throw error;
      } finally {
        const duration = Date.now() - start;
        const finalTags = {
          ...tags,
          operation: propertyKey,
          class: target.constructor.name
n        };
        
        // Record the performance metric
        PerformanceMonitor.track(propertyKey, success ? duration : -duration, finalTags);
      }
    };
    
    return descriptor;
  };
}