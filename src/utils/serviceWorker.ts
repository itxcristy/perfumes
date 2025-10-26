interface ServiceWorkerAPI {
  register(): Promise<ServiceWorkerRegistration | null>;
  unregister(): Promise<boolean>;
  update(): Promise<void>;
  clearCache(): Promise<void>;
  getCacheStats(): Promise<any>;
  prefetchResources(urls: string[]): Promise<void>;
  isSupported(): boolean;
  getRegistration(): ServiceWorkerRegistration | null;
}

class ServiceWorkerManager implements ServiceWorkerAPI {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupUpdateChecking();
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service Workers are not supported in this browser');
      return null;
    }

    // Skip service worker registration in development to avoid conflicts
    if (import.meta.env.DEV) {
      return null;
    }

    try {
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });


      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          this.handleServiceWorkerUpdate(newWorker);
        }
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      
      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval);
        this.updateCheckInterval = null;
      }
      
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check for and apply service worker updates
   */
  async update(): Promise<void> {
    // Skip in development
    if (import.meta.env.DEV) {
      return;
    }

    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
    } catch (error) {
      // Silent update failure
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    return this.sendMessage('CLEAR_CACHE');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    const response = await this.sendMessage('CACHE_STATS');
    return response.stats;
  }

  /**
   * Prefetch resources for caching
   */
  async prefetchResources(urls: string[]): Promise<void> {
    // Skip in development
    if (import.meta.env.DEV) {
      return;
    }
    
    return this.sendMessage('PREFETCH_RESOURCES', { urls });
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Get current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Send message to service worker
   */
  private async sendMessage(type: string, payload?: any): Promise<any> {
    if (!navigator.serviceWorker.controller) {
      throw new Error('No service worker controller available');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type, payload },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Handle service worker updates
   */
  private handleServiceWorkerUpdate(newWorker: ServiceWorker): void {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New service worker available
          this.showUpdateNotification();
        } else {
          // First time installation
        }
      }
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        break;
      case 'OFFLINE_READY':
        break;
      case 'UPDATE_AVAILABLE':
        this.showUpdateNotification();
        break;
      default:
    }
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    // In a real app, you'd show a proper notification UI
    // For now, we'll just log and could dispatch a custom event
    
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('sw-update-available', {
      detail: {
        registration: this.registration
      }
    }));
  }

  /**
   * Setup periodic update checking
   */
  private setupUpdateChecking(): void {
    // Skip in development
    if (import.meta.env.DEV) {
      return;
    }
    
    // Check for updates every 30 minutes
    this.updateCheckInterval = setInterval(() => {
      if (this.registration) {
        this.update().catch(console.error);
      }
    }, 30 * 60 * 1000);
  }

  /**
   * Apply pending update
   */
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    window.location.reload();
  }
}

// Enhanced cache management utilities
export class CacheManager {
  private sw: ServiceWorkerManager;

  constructor(serviceWorkerManager: ServiceWorkerManager) {
    this.sw = serviceWorkerManager;
  }

  /**
   * Prefetch critical resources
   */
  async prefetchCriticalResources(): Promise<void> {
    // Skip in development
    if (import.meta.env.DEV) {
      return;
    }
    
    const criticalResources = [
      '/assets/css/index.css',
      '/assets/js/vendor.js',
      '/assets/js/main.js',
      // Add other critical resources
    ];

    try {
      await this.sw.prefetchResources(criticalResources);
    } catch (error) {
      console.error('❌ Failed to prefetch critical resources:', error);
    }
  }

  /**
   * Prefetch route-based resources
   */
  async prefetchRoute(route: string): Promise<void> {
    // Skip in development
    if (import.meta.env.DEV) {
      return;
    }
    
    const routeResources = this.getRouteResources(route);
    
    try {
      await this.sw.prefetchResources(routeResources);
    } catch (error) {
      console.error(`❌ Failed to prefetch route ${route}:`, error);
    }
  }

  /**
   * Get cache health report
   */
  async getCacheHealth(): Promise<{
    totalSize: number;
    cacheStatus: Record<string, any>;
    recommendations: string[];
  }> {
    try {
      const stats = await this.sw.getCacheStats();
      const recommendations: string[] = [];
      let totalEntries = 0;

      Object.entries(stats).forEach(([cacheName, cacheData]: [string, any]) => {
        totalEntries += cacheData.entryCount || 0;
        
        if (cacheData.entryCount > 100) {
          recommendations.push(`${cacheName} cache has many entries (${cacheData.entryCount})`);
        }
        
        if (!cacheData.exists) {
          recommendations.push(`${cacheName} cache is not properly initialized`);
        }
      });

      return {
        totalSize: totalEntries,
        cacheStatus: stats,
        recommendations
      };
    } catch (error) {
      console.error('❌ Failed to get cache health:', error);
      return {
        totalSize: 0,
        cacheStatus: {},
        recommendations: ['Failed to get cache statistics']
      };
    }
  }

  private getRouteResources(route: string): string[] {
    // Define resources needed for specific routes
    const routeResourceMap: Record<string, string[]> = {
      '/products': [
        '/api/products',
        '/api/categories',
        // Add product page specific resources
      ],
      '/dashboard': [
        '/api/dashboard/analytics',
        '/api/user/profile',
        // Add dashboard specific resources
      ],
      '/checkout': [
        '/api/payment/methods',
        '/api/shipping/options',
        // Add checkout specific resources
      ]
    };

    return routeResourceMap[route] || [];
  }
}

// Create singleton instances
export const serviceWorkerManager = new ServiceWorkerManager();
export const cacheManager = new CacheManager(serviceWorkerManager);

// Auto-register service worker when module loads
if (typeof window !== 'undefined') {
  // Wait for page load to avoid blocking initial render
  window.addEventListener('load', () => {
    serviceWorkerManager.register().then((registration) => {
      if (registration) {
        
        // Prefetch critical resources after registration
        cacheManager.prefetchCriticalResources().catch(console.error);
      }
    }).catch(console.error);
  });

  // Listen for network status changes
  window.addEventListener('online', () => {
    serviceWorkerManager.update().catch(console.error);
  });

  window.addEventListener('offline', () => {
  });
}

// Export for manual control
export default serviceWorkerManager;