import React, { useEffect, memo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { ProductGridSkeleton } from '../Common/ProductCardSkeleton';
import { LatestArrivalProductCard } from '../Product/LatestArrivalProductCard';
import { Link } from 'react-router-dom';

/**
 * LatestArrivals Component
 * Displays newest products with fresh, modern, minimalist card design
 * Emphasizes newness and recent additions
 */
export const LatestArrivals: React.FC = memo(() => {
  const { latestProducts, latestLoading, fetchLatestProducts } = useProducts();

  useEffect(() => {
    // Fetch 4 latest products on mount for homepage display
    fetchLatestProducts(4);
  }, [fetchLatestProducts]);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">
              Just Arrived
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Arrivals
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Be the first to experience our newest fragrances, freshly added to our exclusive collection
          </p>
        </div>

        {/* Products Grid */}
        {latestLoading ? (
          <ProductGridSkeleton count={4} variant="latest" />
        ) : latestProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <LatestArrivalProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-12">
              <Link
                to="/products?sort=latest"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Explore All New Arrivals
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600 text-lg">No new arrivals at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for fresh additions to our collection!</p>
          </div>
        )}
      </div>
    </section>
  );
});

LatestArrivals.displayName = 'LatestArrivals';

export default LatestArrivals;

