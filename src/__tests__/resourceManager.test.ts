import { ResourceManager, globalResourceManager } from '../utils/resourceManager';
import { RequestPriority } from '../utils/networkResilience';

// Mock fetch for testing
global.fetch = jest.fn();

describe('ResourceManager', () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager({
      maxConcurrentRequests: 2,
      enableDeduplication: true,
      enablePrefetching: true
    });
    
    // Clear all metrics before each test
    // @ts-ignore - accessing private property for testing
    resourceManager.metrics = {
      activeRequests: 0,
      queuedRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      bandwidthUsage: 0,
      memoryUsage: 0,
      averageResponseTime: 0,
      requestDistribution: {
        critical: 0,
        high: 0,
        normal: 0,
        low: 0,
        background: 0
      },
      successRate: 100,
      retryCount: 0
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addRequest', () => {
    it('should add a request to the queue', async () => {
      const request = {
        url: 'https://api.example.com/data',
        priority: 'normal' as RequestPriority,
        tags: ['test'],
        dependencies: [],
        dedupKey: 'test-request'
      };

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      const result = await resourceManager.addRequest(request);
      
      expect(result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(request.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle request failures', async () => {
      const request = {
        url: 'https://api.example.com/data',
        priority: 'normal' as RequestPriority,
        tags: ['test'],
        dependencies: [],
        dedupKey: 'test-request'
      };

      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(resourceManager.addRequest(request)).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should respect request priority ordering', async () => {
      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      // Add requests with different priorities
      const lowPriorityRequest = resourceManager.addRequest({
        url: 'https://api.example.com/low',
        priority: 'low',
        tags: ['low'],
        dependencies: []
      });

      const criticalPriorityRequest = resourceManager.addRequest({
        url: 'https://api.example.com/critical',
        priority: 'critical',
        tags: ['critical'],
        dependencies: []
      });

      const normalPriorityRequest = resourceManager.addRequest({
        url: 'https://api.example.com/normal',
        priority: 'normal',
        tags: ['normal'],
        dependencies: []
      });

      // Wait for all requests to complete
      await Promise.all([criticalPriorityRequest, normalPriorityRequest, lowPriorityRequest]);

      // Critical request should be processed first
      expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://api.example.com/critical', expect.any(Object));
      expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://api.example.com/normal', expect.any(Object));
      expect(global.fetch).toHaveBeenNthCalledWith(3, 'https://api