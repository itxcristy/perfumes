import React, { Suspense, lazy, memo } from 'react';
import { Hero } from '@/components/Home/Hero';
import { CategorySection } from '@/components/Home/CategorySection';
import { useProducts } from '@/contexts/ProductContext';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

// Lazy load non-critical components for better performance
const FeaturedProducts = lazy(() => import('@/components/Home/FeaturedProducts'));
const LovedByThousands = lazy(() => import('@/components/Home/LovedByThousands'));
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

      {/* Why Choose Us Section */}
      <Suspense fallback={<SectionLoader bgColor="bg-white" />}>
        <LovedByThousands />
      </Suspense>

      {/* Latest Arrivals Section */}
      <Suspense fallback={<SectionLoader bgColor="bg-white" />}>
        <LatestArrivals />
      </Suspense>

      {/* CTA Section - Professional Design */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-purple-200">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Discover Exquisite Fragrances
            </h2>
            <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience our premium collection of traditional attars, crafted with the finest ingredients and time-honored techniques
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}