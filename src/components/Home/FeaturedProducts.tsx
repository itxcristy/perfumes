import React, { useEffect, memo } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { ProductGridSkeleton } from '../Common/ProductCardSkeleton';
import { FeaturedProductCard } from '../Product/FeaturedProductCard';
import { Link } from 'react-router-dom';

/**
 * FeaturedProducts Component
 * Displays handpicked featured products with luxurious card design
 * Optimized for performance with lazy loading
 */
export const FeaturedProducts: React.FC = memo(() => {
    const { featuredProducts, featuredLoading, fetchFeaturedProducts } = useProducts();

    useEffect(() => {
        // Fetch 8 featured products on mount
        fetchFeaturedProducts(8);
    }, [fetchFeaturedProducts]);

    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Star className="h-6 w-6 text-amber-600 fill-current" />
                        <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
                            Handpicked Selection
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Featured Products
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Handpicked selections from our premium collection of authentic attars and fragrances
                    </p>
                </div>

                {/* Products Grid */}
                {featuredLoading ? (
                    <ProductGridSkeleton count={8} variant="featured" />
                ) : featuredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <FeaturedProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* View All Link */}
                        <div className="text-center mt-12">
                            <Link
                                to="/products?featured=true"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                View All Featured Products
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                            <Star className="h-8 w-8 text-amber-600 fill-current" />
                        </div>
                        <p className="text-gray-600 text-lg">No featured products available at the moment.</p>
                        <p className="text-gray-500 mt-2">Check back soon for our latest featured items!</p>
                    </div>
                )}
            </div>
        </section>
    );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export default FeaturedProducts;