import React, { Suspense, lazy, memo } from 'react';
import { Hero } from '@/components/Home/Hero';
import { CategorySection } from '@/components/Home/CategorySection';
import { useProducts } from '@/contexts/ProductContext';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

// Lazy load non-critical components for better performance
const FeaturedProducts = lazy(() => import('@/components/Home/FeaturedProducts'));
const BestSellers = lazy(() => import('@/components/Home/BestSellers'));
const LatestArrivals = lazy(() => import('@/components/Home/LatestArrivals'));

// Loading fallback component
const SectionLoader = memo(({ bgColor = 'bg-white' }: { bgColor?: string }) => (
  <div className={`py-12 md:py-16 ${bgColor}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <LoadingSpinner />
    </div>
  </div>
));

SectionLoader.displayName = 'SectionLoader';

export default function HomePage() {
  const { categories, loading: categoriesLoading } = useProducts();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section with Carousel */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our curated collection of premium attars and fragrances
            </p>
          </div>
          <CategorySection categories={categories} loading={categoriesLoading && categories.length === 0} />
        </div>
      </section>

      {/* Featured Products Section */}
      <Suspense fallback={<SectionLoader bgColor="bg-white" />}>
        <FeaturedProducts />
      </Suspense>

      {/* Best Sellers Section */}
      <Suspense fallback={<SectionLoader bgColor="bg-amber-50" />}>
        <BestSellers />
      </Suspense>

      {/* Latest Arrivals Section */}
      <Suspense fallback={<SectionLoader bgColor="bg-white" />}>
        <LatestArrivals />
      </Suspense>

      {/* CTA Section - Improved Design */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-200 rounded-full opacity-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Discover Exquisite Fragrances
              </h2>
              <p className="text-gray-700 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience our premium collection of traditional attars, crafted with the finest ingredients and time-honored techniques
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore Collection</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}