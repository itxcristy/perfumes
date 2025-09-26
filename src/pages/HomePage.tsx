import React, { Suspense, lazy, memo, useEffect } from 'react';
import { Hero } from '@/components/Home/Hero';
import { CategorySection } from '@/components/Home/CategorySection';
import { useProducts } from '@/contexts/ProductContext';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { performanceMonitor, trackPageNavigation } from '@/utils/performanceMonitor';

import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, ShieldCheck, Headphones, Zap, Award, Users, CheckCircle, Gift, Globe, Sparkles, Crown } from 'lucide-react';

// Import banner images
import oudhCollectionBanner from '../assets/images/banners/oudh-collection-banner.jpg';
import seasonalAttarsBanner from '../assets/images/banners/seasonal-attars-banner.jpg';
import heritageBlendsBanner from '../assets/images/banners/heritage-blends-banner.jpg';
import brandStoryImage from '../assets/images/homepage/brand-story.jpg';

// Lazy load non-critical components for better performance
const FeaturedProducts = lazy(() => import('@/components/Home/FeaturedProducts'));
const TrendingSection = lazy(() => import('@/components/Home/TrendingSection'));
const Testimonials = lazy(() => import('@/components/Home/Testimonials'));
const RecentlyViewed = lazy(() => import('@/components/Home/RecentlyViewed'));

// Optimized Promotional Banners Section - removed heavy animations for better performance
const PromotionalBanners: React.FC = memo(() => {
    const banners = [
        {
            id: 1,
            title: "Premium Oudh Collection",
            subtitle: "Authentic Cambodian & Indian Oudh",
            discount: "Up to 25% Off",
            cta: "Shop Oudh",
            link: "/categories/oudh-attars",
            bgColor: "from-purple-600 to-indigo-700",
            icon: Crown,
            image: oudhCollectionBanner
        },
        {
            id: 2,
            title: "Seasonal Attars",
            subtitle: "Limited Edition Spring Collection",
            discount: "New Arrivals",
            cta: "Explore Now",
            link: "/categories/seasonal-attars",
            bgColor: "from-blue-600 to-purple-600",
            icon: Sparkles,
            image: seasonalAttarsBanner
        },
        {
            id: 3,
            title: "Heritage Blends",
            subtitle: "Traditional Attar Craftsmanship",
            discount: "Fast Shipping",
            cta: "Discover",
            link: "/categories/heritage-attars",
            bgColor: "from-indigo-600 to-blue-700",
            icon: Award,
            image: heritageBlendsBanner
        }
    ];

    return (
        <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Section Header - Optimized without animations */}
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                        Exclusive Attar Collections
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-3 sm:px-0">
                        Discover our curated selection of premium attars from renowned houses worldwide
                    </p>
                </div>

                {/* Optimized Banner Grid - removed heavy animations for faster loading */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 touch-manipulation"
                        >
                            {/* Background with Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${banner.bgColor}`} />

                            {/* Background Image with optimized loading */}
                            <div
                                className="absolute inset-0 opacity-20 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundImage: `url(${banner.image})` }}
                            />

                            {/* Content with Mobile-Optimized Layout */}
                            <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 h-36 sm:h-40 md:h-44 lg:h-52 xl:h-56 flex flex-col justify-between text-white">
                                {/* Top Section */}
                                <div>
                                    <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                                        <banner.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" />
                                        <span className="text-[10px] sm:text-xs font-medium text-yellow-300 uppercase tracking-wider">
                                            {banner.discount}
                                        </span>
                                    </div>

                                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 leading-tight">
                                        {banner.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                                        {banner.subtitle}
                                    </p>
                                </div>

                                {/* Optimized CTA Button - removed framer-motion for better performance */}
                                <Link to={banner.link} className="inline-block">
                                    <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm hover:bg-white/30 transition-colors duration-200 flex items-center space-x-1.5 touch-manipulation">
                                        <span>{banner.cta}</span>
                                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    </button>
                                </Link>
                            </div>

                            {/* Decorative Elements - Responsive */}
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-full blur-lg" />
                            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300/20 rounded-full blur-md" />
                        </div>
                    ))}
                </div>

                {/* Optimized Bottom CTA - removed framer-motion */}
                <div className="text-center mt-6 sm:mt-8 md:mt-10">
                    <Link to="/products">
                        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center space-x-1.5 mx-auto touch-manipulation">
                            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>View All Collections</span>
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
});

// Optimized Brand Story Section - removed framer-motion animations
const BrandStory: React.FC = memo(() => {
    return (
        <section className="py-8 sm:py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                    <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 text-blue-600 font-medium">
                                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Our Story</span>
                            </div>

                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                Connecting You to
                                <span className="text-blue-600"> Quality & Trust</span>
                            </h2>

                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Founded with a vision to revolutionize online shopping, we've built relationships with premium brands worldwide to bring you authentic, high-quality products at competitive prices.
                            </p>

                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Every product in our catalog is carefully vetted, every seller thoroughly verified, and every transaction secured with industry-leading protection.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
                                <div className="text-lg sm:text-xl font-bold text-gray-900">1M+</div>
                                <div className="text-[10px] sm:text-xs text-gray-600">Happy Customers</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mx-auto mb-1.5 sm:mb-2" />
                                <div className="text-lg sm:text-xl font-bold text-gray-900">50K+</div>
                                <div className="text-[10px] sm:text-xs text-gray-600">Premium Products</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2">
                        <img
                            src={brandStoryImage}
                            alt="Our Brand Story"
                            className="w-full rounded-xl sm:rounded-2xl shadow-lg"
                            loading="lazy"
                        />

                        <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100 max-w-[200px] sm:max-w-[240px]">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Quality Guaranteed</p>
                                    <p className="text-[10px] sm:text-xs text-gray-600">100% Authentic Products</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

// Attractive Product Carousel Section - designed for conversion
const AttractiveProductCarousel: React.FC = memo(() => {
    const { products } = useProducts();

    // Select the most attractive products for display
    const featuredProducts = products
        .filter(product => product.featured || product.rating >= 4.0)
        .slice(0, 8); // Show 8 products for better variety

    if (featuredProducts.length === 0) {
        return null; // Don't show empty carousel
    }

    return (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
                {/* Compelling Header */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <Sparkles className="h-4 w-4" />
                        <span>BESTSELLERS</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Products You'll
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Love</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Handpicked premium products with amazing reviews. Limited time offers inside! 💎
                    </p>
                </div>

                {/* Product Carousel */}
                <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {featuredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                {/* Sale Badge */}
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="absolute top-3 left-3 z-10">
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                        </div>
                                    </div>
                                )}

                                {/* Hot Badge for high-rated products */}
                                {product.rating >= 4.5 && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                                            <Crown className="h-3 w-3" />
                                            <span>HOT</span>
                                        </div>
                                    </div>
                                )}

                                {/* Product Image */}
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2">
                                                <ShoppingBag className="h-4 w-4" />
                                                <span>Quick Buy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    {/* Rating */}
                                    <div className="flex items-center space-x-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                                    </div>

                                    {/* Product Name */}
                                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-lg font-bold text-purple-600">
                                            ${product.price}
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-sm text-gray-500 line-through">
                                                ${product.originalPrice}
                                            </span>
                                        )}
                                    </div>

                                    {/* Call to Action */}
                                    <div className="flex items-center justify-between">
                                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-full font-semibold text-sm hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                                            Buy Now
                                        </button>
                                        <button className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Stock indicator */}
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="mt-2 text-xs text-orange-600 font-medium flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                            <span>Only {product.stock} left!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation arrows for larger screens */}
                    <div className="hidden lg:block">
                        <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-purple-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-purple-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-8 sm:mt-10">
                    <p className="text-sm text-gray-600 mb-4">🔥 Limited time offers • Fast Shipping on orders over $50</p>
                    <Link to="/products">
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold text-base hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
                            <span>View All Products</span>
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
});

// Loading fallback component for lazy-loaded sections
const SectionLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
    <div className="py-16 flex justify-center">
        <LoadingSpinner text={text} size="medium" />
    </div>
);

export const OptimizedHomePage: React.FC = () => {
    const { categories, basicLoading } = useProducts();

    // Track homepage performance
    useEffect(() => {
        trackPageNavigation('homepage');
        const endTracking = performanceMonitor.startTiming('homepage_render');

        return () => {
            endTracking();
        };
    }, []);

    // Show immediate content, load non-critical sections lazily
    if (basicLoading) {
        return (
            <div className="space-y-0">
                {/* Show Hero immediately while data loads */}
                <Hero />

                {/* Show loading for categories */}
                <SectionLoader text="Loading collections..." />
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {/* Critical above-the-fold content - loads immediately */}
            <Hero />

            {/* Categories Section - critical for navigation */}
            {categories && categories.length > 0 && (
                <CategorySection categories={categories} />
            )}

            {/* Promotional Banners - load immediately for better UX */}
            <PromotionalBanners />

            {/* Lazy load non-critical sections with proper fallbacks */}
            <Suspense fallback={<SectionLoader text="Loading featured products..." />}>
                <FeaturedProducts />
            </Suspense>

            {/* Brand Story - important for trust but can be delayed slightly */}
            <BrandStory />

            <Suspense fallback={<SectionLoader text="Loading trending items..." />}>
                <TrendingSection />
            </Suspense>

            <Suspense fallback={<SectionLoader text="Loading your recent views..." />}>
                <RecentlyViewed maxItems={6} className="bg-gray-50" />
            </Suspense>

            {/* Attractive Product Carousel - replaces Why Choose Us */}
            <AttractiveProductCarousel />

            <Suspense fallback={<SectionLoader text="Loading customer testimonials..." />}>
                <Testimonials />
            </Suspense>
        </div>
    );
};

export default OptimizedHomePage;