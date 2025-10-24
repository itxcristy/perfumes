import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Category } from '../../types';

interface CategorySectionProps {
  categories: Category[];
  loading?: boolean;
}

/**
 * CategorySkeleton - Skeleton loader for category cards
 */
const CategorySkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-64">
    <div className="h-80 bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
      {/* Image Skeleton */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />

        {/* Description Lines */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * CategorySection Component
 * Horizontal scrolling carousel for categories
 * Minimal animations - only image zoom on hover
 * Fetches data from database with skeleton loaders
 */
export const CategorySection: React.FC<CategorySectionProps> = ({ categories, loading = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(8)].map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">No categories available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="flex-shrink-0 w-64 group/card"
          >
            <div className="relative h-80 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              {/* Image Container - Only image zooms on hover */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-category.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Product Count Badge */}
                {category.product_count !== undefined && Number(category.product_count) > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <span className="text-xs font-semibold text-gray-700">
                      {Number(category.product_count)} {Number(category.product_count) === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover/card:text-amber-600 transition-colors duration-300">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Bottom Border Accent - subtle animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};