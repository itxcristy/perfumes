import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  navigationManager, 
  NavigationItem, 
  BreadcrumbItem, 
  NavigationState,
  NavigationAnalytics 
} from '../utils/navigationEnhancement';
import { useAuth } from '../contexts/AuthContext';

/**
 * Enhanced navigation hook with route guards, analytics, and performance optimization
 */
export const useEnhancedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentRoute: null,
    breadcrumbs: [],
    history: [],
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
    error: null
  });

  // Update navigation state when location changes
  useEffect(() => {
    const updateNavigationState = async () => {
      setNavigationState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const currentRoute = navigationManager.getRoute(location.pathname);
        const breadcrumbs = navigationManager.generateBreadcrumbs(location.pathname);
        
        // Preload predicted routes
        await navigationManager.preloadPredictedRoutes(location.pathname);

        setNavigationState({
          currentRoute,
          breadcrumbs,
          history: [], // Will be populated from navigation manager
          canGoBack: navigationManager.canGoBack(),
          canGoForward: navigationManager.canGoForward(),
          isLoading: false,
          error: null
        });
      } catch (error) {
        setNavigationState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Navigation error'
        }));
      }
    };

    updateNavigationState();
  }, [location.pathname]);

  // Enhanced navigate function with guards
  const enhancedNavigate = useCallback(async (
    path: string, 
    options: {
      replace?: boolean;
      state?: any;
      skipGuards?: boolean;
    } = {}
  ) => {
    setNavigationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await navigationManager.navigate(path, user, options);
      
      if (result.success) {
        navigate(path, { 
          replace: options.replace, 
          state: options.state 
        });
      } else {
        if (result.redirectTo) {
          navigate(result.redirectTo, { replace: true });
        }
        setNavigationState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Navigation blocked'
        }));
      }
    } catch (error) {
      setNavigationState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Navigation failed'
      }));
    }
  }, [navigate, user]);

  // Go back with navigation manager
  const goBack = useCallback(() => {
    const previousPath = navigationManager.goBack();
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate(-1);
    }
  }, [navigate]);

  // Go forward with navigation manager
  const goForward = useCallback(() => {
    const nextPath = navigationManager.goForward();
    if (nextPath) {
      navigate(nextPath);
    } else {
      navigate(1);
    }
  }, [navigate]);

  // Get navigation suggestions
  const getNavigationSuggestions = useCallback((limit?: number) => {
    return navigationManager.getNavigationSuggestions(location.pathname, limit);
  }, [location.pathname]);

  // Search routes
  const searchRoutes = useCallback((query: string) => {
    return navigationManager.searchRoutes(query);
  }, []);

  return {
    ...navigationState,
    navigate: enhancedNavigate,
    goBack,
    goForward,
    getNavigationSuggestions,
    searchRoutes,
    currentPath: location.pathname
  };
};

/**
 * Hook for dynamic breadcrumbs with customization
 */
export const useDynamicBreadcrumbs = (customBreadcrumbs?: BreadcrumbItem[]) => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (customBreadcrumbs) {
      setBreadcrumbs(customBreadcrumbs);
    } else {
      const generated = navigationManager.generateBreadcrumbs(location.pathname);
      setBreadcrumbs(generated);
    }
  }, [location.pathname, customBreadcrumbs]);

  const updateBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    setBreadcrumbs(prev => [...prev, breadcrumb]);
  }, []);

  const removeBreadcrumb = useCallback((id: string) => {
    setBreadcrumbs(prev => prev.filter(b => b.id !== id));
  }, []);

  return {
    breadcrumbs,
    updateBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb
  };
};

/**
 * Hook for route guards
 */
export const useRouteGuards = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [guardStatus, setGuardStatus] = useState<{
    checking: boolean;
    allowed: boolean;
    message?: string;
    redirectTo?: string;
  }>({
    checking: false,
    allowed: true
  });

  // Check guards when route changes
  useEffect(() => {
    const checkGuards = async () => {
      setGuardStatus({ checking: true, allowed: true });

      const result = await navigationManager.canNavigate(location.pathname, user);
      
      if (!result.allowed) {
        setGuardStatus({
          checking: false,
          allowed: false,
          message: result.message,
          redirectTo: result.redirectTo
        });

        // Redirect if specified
        if (result.redirectTo) {
          navigate(result.redirectTo, { replace: true });
        }
      } else {
        setGuardStatus({
          checking: false,
          allowed: true
        });
      }
    };

    checkGuards();
  }, [location.pathname, user, navigate]);

  return guardStatus;
};

/**
 * Hook for navigation analytics
 */
export const useNavigationAnalytics = () => {
  const [analytics, setAnalytics] = useState<NavigationAnalytics | null>(null);

  const refreshAnalytics = useCallback(() => {
    const currentAnalytics = navigationManager.getAnalytics();
    setAnalytics(currentAnalytics);
  }, []);

  useEffect(() => {
    refreshAnalytics();
    
    // Refresh analytics periodically
    const interval = setInterval(refreshAnalytics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  const getRouteMetrics = useCallback((path: string) => {
    if (!analytics) return null;

    return {
      visits: analytics.routeVisits[path] || 0,
      averageLoadTime: analytics.averageLoadTime[path] || 0,
      bounceRate: analytics.bounceRate[path] || 0
    };
  }, [analytics]);

  const getPopularRoutes = useCallback((limit: number = 10) => {
    if (!analytics) return [];

    return Object.entries(analytics.routeVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([path, visits]) => ({
        path,
        visits,
        averageLoadTime: analytics.averageLoadTime[path] || 0
      }));
  }, [analytics]);

  const getUserFlow = useCallback((limit: number = 50) => {
    if (!analytics) return [];

    return analytics.userFlow
      .slice(-limit)
      .map(flow => ({
        ...flow,
        fromRoute: navigationManager.getRoute(flow.from),
        toRoute: navigationManager.getRoute(flow.to)
      }));
  }, [analytics]);

  return {
    analytics,
    refreshAnalytics,
    getRouteMetrics,
    getPopularRoutes,
    getUserFlow
  };
};

/**
 * Hook for navigation performance optimization
 */
export const useNavigationPerformance = () => {
  const location = useLocation();
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    cacheHit: boolean;
  } | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure initial render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime
      }));
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRenderTime);

    // Measure route load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        loadTime,
        renderTime: prev?.renderTime || 0,
        cacheHit: false // Will be updated by cache system
      }));
    };

    // Measure after component is fully loaded
    setTimeout(measureLoadTime, 0);
  }, [location.pathname]);

  const preloadRoute = useCallback(async (path: string) => {
    const route = navigationManager.getRoute(path);
    if (route && route.component) {
      try {
        // Trigger component preload
        await route.component;
      } catch (error) {
        console.warn(`Failed to preload route ${path}:`, error);
      }
    }
  }, []);

  const preloadRoutes = useCallback(async (paths: string[]) => {
    await Promise.all(paths.map(preloadRoute));
  }, [preloadRoute]);

  return {
    performanceMetrics,
    preloadRoute,
    preloadRoutes
  };
};

/**
 * Hook for navigation state persistence
 */
export const useNavigationPersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save navigation state to localStorage
  const saveNavigationState = useCallback((state: any) => {
    try {
      localStorage.setItem('navigation_state', JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, []);

  // Restore navigation state from localStorage
  const restoreNavigationState = useCallback(() => {
    try {
      const saved = localStorage.getItem('navigation_state');
      if (saved) {
        const state = JSON.parse(saved);
        const age = Date.now() - state.timestamp;
        
        // Only restore if less than 1 hour old
        if (age < 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
    }
    return null;
  }, []);

  // Clear saved navigation state
  const clearNavigationState = useCallback(() => {
    try {
      localStorage.removeItem('navigation_state');
    } catch (error) {
      console.warn('Failed to clear navigation state:', error);
    }
  }, []);

  // Auto-save current location
  useEffect(() => {
    saveNavigationState({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location, saveNavigationState]);

  return {
    saveNavigationState,
    restoreNavigationState,
    clearNavigationState
  };
};

/**
 * Hook for keyboard navigation shortcuts
 */
export const useKeyboardNavigation = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for modifier keys
      const isCtrl = event.ctrlKey || event.metaKey;
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      // Build shortcut key
      let shortcutKey = '';
      if (isCtrl) shortcutKey += 'ctrl+';
      if (isAlt) shortcutKey += 'alt+';
      if (isShift) shortcutKey += 'shift+';
      shortcutKey += event.key.toLowerCase();

      // Execute shortcut if found
      const handler = shortcuts[shortcutKey];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
