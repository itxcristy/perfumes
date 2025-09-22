import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Home,
  MoreHorizontal,
  Clock,
  Star,
  Bookmark,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useDynamicBreadcrumbs } from '../../hooks/useEnhancedNavigation';
import { BreadcrumbItem } from '../../utils/navigationEnhancement';

interface EnhancedBreadcrumbsProps {
  customBreadcrumbs?: BreadcrumbItem[];
  maxItems?: number;
  showIcons?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  enableCollapse?: boolean;
  enableBookmarks?: boolean;
  enableSharing?: boolean;
}

export const EnhancedBreadcrumbs: React.FC<EnhancedBreadcrumbsProps> = ({
  customBreadcrumbs,
  maxItems = 5,
  showIcons = true,
  showActions = true,
  showMetadata = false,
  className = '',
  variant = 'default',
  enableCollapse = true,
  enableBookmarks = false,
  enableSharing = false
}) => {
  const { breadcrumbs, updateBreadcrumbs } = useDynamicBreadcrumbs(customBreadcrumbs);
  const [collapsed, setCollapsed] = useState(false);
  const [bookmarkedPaths, setBookmarkedPaths] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Load bookmarked paths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('breadcrumb_bookmarks');
      if (saved) {
        setBookmarkedPaths(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.warn('Failed to load breadcrumb bookmarks:', error);
    }
  }, []);

  // Save bookmarked paths to localStorage
  const saveBookmarks = (bookmarks: Set<string>) => {
    try {
      localStorage.setItem('breadcrumb_bookmarks', JSON.stringify(Array.from(bookmarks)));
    } catch (error) {
      console.warn('Failed to save breadcrumb bookmarks:', error);
    }
  };

  // Process breadcrumbs for display
  const processedBreadcrumbs = useMemo(() => {
    if (!enableCollapse || breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // Keep first, last, and some middle items
    const first = breadcrumbs[0];
    const last = breadcrumbs[breadcrumbs.length - 1];
    const middle = breadcrumbs.slice(1, -1);

    if (collapsed) {
      return [first, { id: 'collapsed', label: '...', path: undefined }, last];
    }

    // Show limited middle items
    const visibleMiddle = middle.slice(-Math.max(0, maxItems - 2));
    return [first, ...visibleMiddle, last];
  }, [breadcrumbs, maxItems, collapsed, enableCollapse]);

  // Toggle bookmark for a path
  const toggleBookmark = (path: string) => {
    const newBookmarks = new Set(bookmarkedPaths);
    if (newBookmarks.has(path)) {
      newBookmarks.delete(path);
    } else {
      newBookmarks.add(path);
    }
    setBookmarkedPaths(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  // Copy path to clipboard
  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (error) {
      console.warn('Failed to copy path:', error);
    }
  };

  // Share current path
  const sharePath = async (path: string, title: string) => {
    const url = window.location.origin + path;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (error) {
        // Fallback to copy
        copyPath(path);
      }
    } else {
      copyPath(path);
    }
  };

  // Render breadcrumb item
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === processedBreadcrumbs.length - 1;
    const isCollapsed = item.id === 'collapsed';
    const isBookmarked = item.path && bookmarkedPaths.has(item.path);
    const isCopied = item.path && copiedPath === item.path;

    if (isCollapsed) {
      return (
        <motion.li
          key="collapsed"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center"
        >
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Show all breadcrumbs"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </motion.li>
      );
    }

    const content = (
      <div className="flex items-center space-x-2 group">
        {/* Icon */}
        {showIcons && item.icon && (
          <span className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
            {item.icon}
          </span>
        )}
        
        {/* Home icon for first item */}
        {showIcons && index === 0 && !item.icon && (
          <Home className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        )}

        {/* Label */}
        <span className={`${
          isLast 
            ? 'text-gray-900 font-medium' 
            : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}>
          {item.label}
        </span>

        {/* Metadata */}
        {showMetadata && item.metadata && (
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            {item.metadata.lastVisited && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(item.metadata.lastVisited).toLocaleDateString()}</span>
              </div>
            )}
            {item.metadata.visitCount && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{item.metadata.visitCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && item.path && !isLast && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {enableBookmarks && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleBookmark(item.path!);
                }}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                  isBookmarked ? 'text-yellow-500' : 'text-gray-400'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Bookmark className="w-3 h-3" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.preventDefault();
                copyPath(item.path!);
              }}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="Copy link"
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            
            {enableSharing && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  sharePath(item.path!, item.label);
                }}
                className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Share"
              >
                <Share2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );

    return (
      <motion.li
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center"
      >
        {item.path && !isLast ? (
          <Link
            to={item.path}
            className="flex items-center hover:bg-gray-50 rounded px-2 py-1 transition-colors"
          >
            {content}
          </Link>
        ) : (
          <div className="px-2 py-1">
            {content}
          </div>
        )}
      </motion.li>
    );
  };

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  const containerClasses = {
    default: 'bg-white border-b border-gray-200',
    compact: 'bg-gray-50',
    detailed: 'bg-white border border-gray-200 rounded-lg shadow-sm'
  };

  const innerClasses = {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3',
    compact: 'px-4 py-2',
    detailed: 'p-4'
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${containerClasses[variant]} ${className}`}
    >
      <div className={innerClasses[variant]}>
        <ol className="flex items-center space-x-1 text-sm">
          <AnimatePresence mode="wait">
            {processedBreadcrumbs.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderBreadcrumbItem(item, index)}
                
                {/* Separator */}
                {index < processedBreadcrumbs.length - 1 && (
                  <motion.li
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  </motion.li>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </ol>

        {/* Additional actions for current page */}
        {showActions && breadcrumbs.length > 0 && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {enableCollapse && breadcrumbs.length > maxItems && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="hover:text-gray-700 transition-colors"
                >
                  {collapsed ? 'Show all' : 'Collapse'}
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {enableBookmarks && (
                <div className="text-xs text-gray-500">
                  {bookmarkedPaths.size} bookmarked
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Breadcrumb context for managing breadcrumbs across components
export const BreadcrumbContext = React.createContext<{
  breadcrumbs: BreadcrumbItem[];
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (id: string) => void;
} | null>(null);

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const breadcrumbHook = useDynamicBreadcrumbs();
  
  return (
    <BreadcrumbContext.Provider value={breadcrumbHook}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
  }
  return context;
};
