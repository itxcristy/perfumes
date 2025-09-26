import { performanceMonitor, enhancedPerformanceMonitor, useImagePerformance, useApiPerformance } from '../utils/performance';
import { renderHook, act } from '@testing-library/react';

// Mock window.performance for testing
const mockPerformance = {
  now: jest.fn().mockReturnValue(1000),
  getEntriesByType: jest.fn().mockReturnValue([]),
};

// Mock window.PerformanceObserver for testing
const mockPerformanceObserver = jest.fn(callback => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Clear all metrics before each test
    performanceMonitor.clearMetrics();
    
    // Reset mocks
    mockPerformance.now.mockClear();
    mockPerformance.getEntriesByType.mockClear();
    
    // Mock window.performance
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true,
    });
    
    // Mock PerformanceObserver
    Object.defineProperty(window, 'PerformanceObserver', {
      value: mockPerformanceObserver,
      writable: true,
    });
  });

  describe('recordMetric', () => {
    it('should record a metric correctly', () => {
      performanceMonitor.recordMetric('test_metric', 100, 'timing');
      
      const metrics = performanceMonitor.getAllMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test_metric');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].type).toBe('timing');
    });

    it('should not record metrics when disabled', () => {
      // @ts-ignore - accessing private property for testing
      performanceMonitor.isEnabled = false;
      
      performanceMonitor.recordMetric('test_metric', 100, 'timing');
      
      const metrics = performanceMonitor.getAllMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Core Web Vitals Tracking', () => {
    it('should track LCP correctly', () => {
      // @ts-ignore - accessing private method for testing
      performanceMonitor.detailedMetrics.lcp = 2500;
      
      const detailedMetrics = performanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.lcp).toBe(2500);
    });

    it('should track FID correctly', () => {
      // @ts-ignore - accessing private method for testing
      performanceMonitor.detailedMetrics.fid = 50;
      
      const detailedMetrics = performanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.fid).toBe(50);
    });

    it('should track CLS correctly', () => {
      // @ts-ignore - accessing private method for testing
      performanceMonitor.detailedMetrics.cls = 0.05;
      
      const detailedMetrics = performanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.cls).toBe(0.05);
    });
  });

  describe('Custom Metrics Tracking', () => {
    it('should track image load times', () => {
      enhancedPerformanceMonitor.trackImageLoad('test-image.jpg', 1500, true);
      
      const detailedMetrics = enhancedPerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.imageLoadTime).toBe(1500);
    });

    it('should track API response times', () => {
      enhancedPerformanceMonitor.trackApiResponse('/api/test', 300, true);
      
      const detailedMetrics = enhancedPerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.apiResponseTime).toBe(300);
    });

    it('should track cache performance', () => {
      enhancedPerformanceMonitor.trackCachePerformance(85);
      
      const detailedMetrics = enhancedPerformanceMonitor.getDetailedMetrics();
      expect(detailedMetrics.cacheHitRate).toBe(85);
    });
  });

  describe('Performance Hooks', () => {
    describe('useImagePerformance', () => {
      it('should track image loading performance', () => {
        const { result } = renderHook(() => useImagePerformance('test-image.jpg'));
        
        // Start loading
        act(() => {
          result.current.startLoading();
        });
        
        // End loading with success
        act(() => {
          result.current.endLoading(true);
        });
        
        // Check that metrics were recorded
        const metrics = enhancedPerformanceMonitor.getAllMetrics();
        expect(metrics.some(metric => metric.name === 'image_load')).toBe(true);
      });
    });

    describe('useApiPerformance', () => {
      it('should track API request performance', () => {
        const { result } = renderHook(() => useApiPerformance('/api/test'));
        
        // Start request
        act(() => {
          result.current.startRequest();
        });
        
        // End request with success
        act(() => {
          result.current.endRequest(true);
        });
        
        // Check that metrics were recorded
        const metrics = enhancedPerformanceMonitor.getAllMetrics();
        expect(metrics.some(metric => metric.name === 'api_response')).toBe(true);
      });
    });
  });

  describe('Performance Thresholds', () => {
    it('should warn when LCP exceeds threshold', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      performanceMonitor.recordMetric('lcp', 3000, 'timing');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Performance issue detected'));
      
      consoleWarnSpy.mockRestore();
    });

    it('should warn when FID exceeds threshold', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      performanceMonitor.recordMetric('fid', 200, 'timing');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Performance issue detected'));
      
      consoleWarnSpy.mockRestore();
    });

    it('should warn when CLS exceeds threshold', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      performanceMonitor.recordMetric('cls', 0.2, 'gauge');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Performance issue detected'));
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getPerformanceSummary', () => {
    it('should calculate correct averages', () => {
      performanceMonitor.recordMetric('test_metric', 100, 'timing');
      performanceMonitor.recordMetric('test_metric', 200, 'timing');
      performanceMonitor.recordMetric('test_metric', 300, 'timing');
      
      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary.test_metric.average).toBe(200);
      expect(summary.test_metric.max).toBe(300);
      expect(summary.test_metric.min).toBe(100);
      expect(summary.test_metric.count).toBe(3);
    });
  });
});