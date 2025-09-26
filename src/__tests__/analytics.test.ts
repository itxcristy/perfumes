import { analytics } from '../utils/analytics';
import { performanceMonitor } from '../utils/performance';

// Mock window and document for testing
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test',
  },
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: 'https://google.com',
  writable: true,
});

describe('Analytics', () => {
  beforeEach(() => {
    // Clear all data before each test
    analytics.clearData();
  });

  describe('trackUserInteraction', () => {
    it('should track user interactions correctly', () => {
      analytics.trackUserInteraction('click', 'button', { id: 'test-button' });
      
      // @ts-ignore - accessing private property for testing
      const interactions = analytics.userInteractions;
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].type).toBe('click');
      expect(interactions[0].element).toBe('button');
      expect(interactions[0].metadata).toEqual({ id: 'test-button' });
    });
  });

  describe('trackConversion', () => {
    it('should track conversion events correctly', () => {
      analytics.trackConversion('purchase', 99.99, { productId: '12345' });
      
      // @ts-ignore - accessing private property for testing
      const conversions = analytics.conversions;
      
      expect(conversions).toHaveLength(1);
      expect(conversions[0].type).toBe('purchase');
      expect(conversions[0].value).toBe(99.99);
      expect(conversions[0].metadata).toEqual({ productId: '12345' });
    });
  });

  describe('trackCustomEvent', () => {
    it('should track custom performance events', () => {
      analytics.trackCustomEvent('custom_metric', 150, 'timing');
      
      const metrics = performanceMonitor.getAllMetrics();
      const customMetric = metrics.find(metric => metric.name === 'custom_metric');
      
      expect(customMetric).toBeDefined();
      expect(customMetric?.value).toBe(150);
      expect(customMetric?.type).toBe('timing');
    });
  });

  describe('getAnalyticsData', () => {
    it('should return all analytics data', () => {
      // Track some interactions
      analytics.trackUserInteraction('click', 'button');
      analytics.trackUserInteraction('scroll', 'document', { percent: 50 });
      
      // Track a conversion
      analytics.trackConversion('signup');
      
      const data = analytics.getAnalyticsData();
      
      expect(data.userInteractions).toHaveLength(2);
      expect(data.conversions).toHaveLength(1);
      expect(data.pageViews).toHaveLength(1); // Auto-tracked on initialization
      expect(data.summary).toBeDefined();
    });
  });

  describe('getSummary', () => {
    it('should calculate correct summary statistics', () => {
      // Track some data
      analytics.trackUserInteraction('click', 'button');
      analytics.trackConversion('signup');
      
      // @ts-ignore - accessing private method for testing
      const summary = analytics.getSummary();
      
      expect(summary.totalInteractions).toBe(1);
      expect(summary.totalConversions).toBe(1);
      expect(summary.totalPageViews).toBe(1); // Auto-tracked on initialization
    });
  });

  describe('clearData', () => {
    it('should clear all analytics data', () => {
      // Track some data
      analytics.trackUserInteraction('click', 'button');
      analytics.trackConversion('signup');
      
      // Clear data
      analytics.clearData();
      
      const data = analytics.getAnalyticsData();
      
      expect(data.userInteractions).toHaveLength(0);
      expect(data.conversions).toHaveLength(0);
      // Note: pageViews is not cleared as it's auto-tracked on initialization
    });
  });
});