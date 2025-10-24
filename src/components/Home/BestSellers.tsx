import React, { useEffect, memo } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { ProductGridSkeleton } from '../Common/ProductCardSkeleton';
import { BestSellerProductCard } from '../Product/BestSellerProductCard';
import { Link } from 'react-router-dom';

/**
 * BestSellers Component
 * Displays best-selling products with bold, attention-grabbing card design
 * Emphasizes social proof and popularity
 */
export const BestSellers: React.FC = memo(() => {
  const { bestSellers, bestSellersLoading, fetchBestSellers } = useProducts();

  useEffect(() => {
    // Fetch 8 best sellers on mount
    fetchBestSellers(8);
  }, [fetchBestSellers]);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-amber-600" />
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
              Customer Favorites
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Best Sellers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our most loved fragrances, chosen by customers for their exceptional quality and lasting impressions
          </p>
        </div>

        {/* Products Grid */}
        {bestSellersLoading ? (
          <ProductGridSkeleton count={8} variant="bestseller" />
        ) : bestSellers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, index) => (
                <BestSellerProductCard
                  key={product.id}
                  product={product}
                  rank={index + 1}
                />
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-12">
              <Link
                to="/products?sort=best-sellers"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View All Best Sellers
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-gray-600 text-lg">No best sellers available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for our top-rated products!</p>
          </div>
        )}
      </div>
    </section>
  );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;

