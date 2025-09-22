/**
 * Performance Optimization Utilities for Admin Dashboard
 * Implements advanced caching, memoization, and performance monitoring
 */

import { useCallback, useRef, useMemo, useEffect } from 'react';

// Cache for expensive computations
const computationCache = new Map<string, any>();

// Performance monitoring
interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

const performanceMetrics: PerformanceMetrics[] = [];

/**
 * Advanced memoization hook with cache invalidation
 */
export const useAdvancedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T => {
  const key = cacheKey || JSON.stringify(deps);
  
  return useMemo(() => {
    if (computationCache.has(key)) {
      return computationCache.get(key);
    }
    
    const result = factory();
    computationCache.set(key, result);
    
    // Clean up old cache entries (keep last 100)
    if (computationCache.size > 100) {
      const firstKey = computationCache.keys().next().value;
      computationCache.delete(firstKey);
    }
    
    return result;
  }, deps);
};

/**
 * Debounced callback hook for performance optimization
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
};

/**
 * Throttled callback hook for high-frequency events
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastCallRef = useRef<number>(0);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay, ...deps]
  );
};

// Performance monitoring removed for production

/**
 * Get performance metrics for analysis
 */
export const getPerformanceMetrics = () => {
  return [...performanceMetrics];
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  
  const isIntersecting = useRef(false);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting;
      },
      {
        threshold: 0.1,
        ...options
      }
    );
    
    observerRef.current.observe(elementRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return { elementRef, isIntersecting: isIntersecting.current };
};

/**
 * Virtual scrolling utilities
 */
export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const scrollTop = useRef(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop.current]);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);
  
  return { visibleItems, handleScroll };
};

// Memory monitoring removed for production

/**
 * Component preloader
 */
export const preloadComponent = async (importFn: () => Promise<any>) => {
  try {
    await importFn();
  } catch (error) {
    // Silently handle preload failures
  }
};

/**
 * Cache management utilities
 */
export const cacheUtils = {
  clear: () => computationCache.clear(),
  size: () => computationCache.size,
  has: (key: string) => computationCache.has(key),
  delete: (key: string) => computationCache.delete(key),
  keys: () => Array.from(computationCache.keys())
};
