import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Star,
    Heart,
    ShoppingCart,
    Truck,
    Shield,
    ChevronDown,
    ChevronUp,
    X,
    SlidersHorizontal,
    MapPin,
    Zap,
    Award,
    Package,
    RefreshCw,
    ArrowLeft,
    Share2,
    Menu,
    Home
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useNotification } from '../contexts/NotificationContext';
import { ProductCard } from '../components/Product/ProductCard';

interface FilterState {
    category: string;
    search: string;
    priceRange: [number, number];
    rating: number;
    brand: string;
    discount: string;
    availability: string;
    sortBy: string;
}

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { slug } = useParams<{ slug?: string }>();
    const { products, categories, loading, fetchProducts } = useProducts();
    const { showNotification } = useNotification();

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState({
        category: true,
        price: true,
        brand: false,
        rating: false,
        discount: false
    });

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        category: slug || searchParams.get('category') || '',
        search: searchParams.get('q') || '',
        priceRange: [0, 50000],
        rating: 0,
        brand: '',
        discount: '',
        availability: '',
        sortBy: 'popularity'
    });

    // Sort options like Amazon
    const sortOptions = [
        { value: 'popularity', label: 'Popularity' },
        { value: 'price-low-high', label: 'Price -- Low to High' },
        { value: 'price-high-low', label: 'Price -- High to Low' },
        { value: 'newest', label: 'Newest First' },
        { value: 'rating', label: 'Avg. Customer Review' },
        { value: 'discount', label: 'Discount -- High to Low' }
    ];

    // Price ranges like Amazon
    const priceRanges = [
        { label: 'Under ₹1,000', min: 0, max: 1000 },
        { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
        { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
        { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
        { label: 'Over ₹25,000', min: 25000, max: 100000 }
    ];

    // Discount options
    const discountOptions = [
        { label: 'All Discounts', value: '' },
        { label: '50% Off or more', value: '50' },
        { label: '40% Off or more', value: '40' },
        { label: '30% Off or more', value: '30' },
        { label: '20% Off or more', value: '20' },
        { label: '10% Off or more', value: '10' }
    ];

    // Get unique brands
    const brands = useMemo(() => {
        const brandSet = new Set(products.map(p => p.sellerName).filter(Boolean));
        return Array.from(brandSet).sort();
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.sellerName.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        filtered = filtered.filter(p => {
            const price = p.originalPrice && p.originalPrice > p.price ? p.price : p.price;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });

        if (filters.rating > 0) {
            filtered = filtered.filter(p => p.rating >= filters.rating);
        }

        if (filters.brand) {
            filtered = filtered.filter(p => p.sellerName === filters.brand);
        }

        if (filters.discount) {
            const minDiscount = parseInt(filters.discount);
            filtered = filtered.filter(p => {
                if (!p.originalPrice || p.originalPrice <= p.price) return false;
                const discount = ((p.originalPrice - p.price) / p.originalPrice) * 100;
                return discount >= minDiscount;
            });
        }

        if (filters.availability === 'in-stock') {
            filtered = filtered.filter(p => p.stock > 0);
        }

        return filtered;
    }, [products, filters]);

    // Sort products
    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];

        switch (filters.sortBy) {
            case 'price-low-high':
                return sorted.sort((a, b) => {
                    const priceA = a.originalPrice && a.originalPrice > a.price ? a.price : a.price;
                    const priceB = b.originalPrice && b.originalPrice > b.price ? b.price : b.price;
                    return priceA - priceB;
                });
            case 'price-high-low':
                return sorted.sort((a, b) => {
                    const priceA = a.originalPrice && a.originalPrice > a.price ? a.price : a.price;
                    const priceB = b.originalPrice && b.originalPrice > b.price ? b.price : b.price;
                    return priceB - priceA;
                });
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'discount':
                return sorted.sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                });
            default:
                return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        }
    }, [filteredProducts, filters.sortBy]);

    const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));

        const newParams = new URLSearchParams(searchParams);
        if (key === 'search' && value) {
            newParams.set('q', value);
        } else if (key === 'category' && value) {
            newParams.set('category', value);
        }
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const clearAllFilters = () => {
        setFilters({
            category: '',
            search: '',
            priceRange: [0, 50000],
            rating: 0,
            brand: '',
            discount: '',
            availability: '',
            sortBy: 'popularity'
        });
        setSearchParams({});
    };



    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle scroll for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // PWA-like back button handler
    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    <div className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                        <div className="w-64 space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-80 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile App-like Header */}
            <div className={`bg-white border-b sticky top-0 z-50 transition-all duration-200 ${isScrolled ? 'shadow-md' : ''
                }`}>
                <div className="px-4 py-3">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between md:hidden mb-3">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
                            {filters.category || 'Products'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Breadcrumb */}
                    <div className="hidden md:flex items-center text-sm text-gray-600 mb-3">
                        <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </Link>
                        <span className="mx-2">&gt;</span>
                        {filters.category ? (
                            <>
                                <span>Products</span>
                                <span className="mx-2">&gt;</span>
                                <span className="text-gray-900">{filters.category}</span>
                            </>
                        ) : (
                            <span className="text-gray-900">All Products</span>
                        )}
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search for products, brands and more"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : ''
                                } lg:hidden`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Quick Filters Bar - Mobile */}
                <div className="md:hidden bg-gray-50 border-t px-4 py-2">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => handleFilterChange('sortBy', 'popularity')}
                            className={`flex-shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${filters.sortBy === 'popularity'
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-600'
                                }`}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => handleFilterChange('sortBy', 'price-low-high')}
                            className={`flex-shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${filters.sortBy === 'price-low-high'
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-600'
                                }`}
                        >
                            Price: Low to High
                        </button>
                        <button
                            onClick={() => handleFilterChange('sortBy', 'rating')}
                            className={`flex-shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${filters.sortBy === 'rating'
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-600'
                                }`}
                        >
                            Highest Rated
                        </button>
                        <button
                            onClick={() => handleFilterChange('discount', '20')}
                            className={`flex-shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${filters.discount === '20'
                                ? 'bg-red-100 border-red-300 text-red-700'
                                : 'bg-white border-gray-300 text-gray-600'
                                }`}
                        >
                            20% Off+
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 flex gap-3 md:gap-4 relative">
                {/* Mobile Filter Overlay */}
                {showFilters && (
                    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)}>
                        <div
                            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <MobileFilters
                                filters={filters}
                                categories={categories}
                                brands={brands}
                                priceRanges={priceRanges}
                                discountOptions={discountOptions}
                                expandedFilters={expandedFilters}
                                setExpandedFilters={setExpandedFilters}
                                handleFilterChange={handleFilterChange}
                                clearAllFilters={clearAllFilters}
                                onClose={() => setShowFilters(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar Filters - Sleek and Compact */}
                <div className="w-64 flex-shrink-0 hidden lg:block sticky top-24 h-fit">
                    <DesktopFilters
                        filters={filters}
                        categories={categories}
                        brands={brands}
                        priceRanges={priceRanges}
                        discountOptions={discountOptions}
                        expandedFilters={expandedFilters}
                        setExpandedFilters={setExpandedFilters}
                        handleFilterChange={handleFilterChange}
                        clearAllFilters={clearAllFilters}
                    />
                </div>

                {/* Main Content - Optimized Width */}
                <div className="flex-1 min-w-0 max-w-full">
                    {/* Results Header - Enhanced for mobile */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-3 md:mb-4">
                        <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className="text-sm md:text-base text-gray-600">
                                    <span className="font-semibold text-gray-900">{sortedProducts.length}</span> of {products.length} results
                                    {filters.search && (
                                        <span className="hidden sm:inline"> for "<span className="font-medium">{filters.search}</span>"</span>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Sort Dropdown - Mobile Optimized */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[120px] md:min-w-[140px]"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* View Toggle - Hidden on mobile */}
                                <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 transition-colors ${viewMode === 'grid'
                                            ? 'bg-blue-50 text-blue-600 border-r border-blue-200'
                                            : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
                                            }`}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 transition-colors ${viewMode === 'list'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid - Optimized Responsive Layout */}
                    {sortedProducts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search className="h-10 md:h-12 w-10 md:w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                            <button
                                onClick={clearAllFilters}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className={`${viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4'
                            : 'space-y-3 md:space-y-4'
                            }`}>
                            {sortedProducts.map(product => (
                                <div key={product.id} className={viewMode === 'list' ? '' : ''}>
                                    <ProductCard product={product} isListView={viewMode === 'list'} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Desktop Filters Component
const DesktopFilters: React.FC<{
    filters: FilterState;
    categories: any[];
    brands: string[];
    priceRanges: any[];
    discountOptions: any[];
    expandedFilters: any;
    setExpandedFilters: any;
    handleFilterChange: any;
    clearAllFilters: any;
}> = ({
    filters,
    categories,
    brands,
    priceRanges,
    discountOptions,
    expandedFilters,
    setExpandedFilters,
    handleFilterChange,
    clearAllFilters
}) => {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        {Object.values(filters).some(v =>
                            (typeof v === 'string' && v !== '' && v !== 'popularity') ||
                            (Array.isArray(v) && (v[0] > 0 || v[1] < 50000)) ||
                            (typeof v === 'number' && v > 0)
                        ) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear all
                                </button>
                            )}
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Category Filter */}
                    <div>
                        <div
                            className="flex items-center justify-between cursor-pointer mb-3"
                            onClick={() => setExpandedFilters((prev: any) => ({ ...prev, category: !prev.category }))}
                        >
                            <h4 className="font-medium text-gray-900">Category</h4>
                            {expandedFilters.category ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                        {expandedFilters.category && (
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.category === ''}
                                        onChange={() => handleFilterChange('category', '')}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">All Categories</span>
                                </label>
                                {categories.map(category => (
                                    <label key={category.id} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={filters.category === category.name}
                                            onChange={() => handleFilterChange('category', category.name)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div>
                        <div
                            className="flex items-center justify-between cursor-pointer mb-3"
                            onClick={() => setExpandedFilters((prev: any) => ({ ...prev, price: !prev.price }))}
                        >
                            <h4 className="font-medium text-gray-900">Price</h4>
                            {expandedFilters.price ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                        {expandedFilters.price && (
                            <div className="space-y-2">
                                {priceRanges.map(range => (
                                    <label key={range.label} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                                            onChange={() => handleFilterChange('priceRange', [range.min, range.max])}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <div
                            className="flex items-center justify-between cursor-pointer mb-3"
                            onClick={() => setExpandedFilters((prev: any) => ({ ...prev, rating: !prev.rating }))}
                        >
                            <h4 className="font-medium text-gray-900">Customer Ratings</h4>
                            {expandedFilters.rating ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                        {expandedFilters.rating && (
                            <div className="space-y-2">
                                {[4, 3, 2, 1].map(rating => (
                                    <label key={rating} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={filters.rating === rating}
                                            onChange={() => handleFilterChange('rating', rating)}
                                            className="mr-2"
                                        />
                                        <div className="flex items-center">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`h-3 w-3 ${star <= rating
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-1 text-sm">& Up</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Discount Filter */}
                    <div>
                        <div
                            className="flex items-center justify-between cursor-pointer mb-3"
                            onClick={() => setExpandedFilters((prev: any) => ({ ...prev, discount: !prev.discount }))}
                        >
                            <h4 className="font-medium text-gray-900">Discount</h4>
                            {expandedFilters.discount ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                        {expandedFilters.discount && (
                            <div className="space-y-2">
                                {discountOptions.map(option => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="discount"
                                            checked={filters.discount === option.value}
                                            onChange={() => handleFilterChange('discount', option.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

// Mobile Filters Component
const MobileFilters: React.FC<{
    filters: FilterState;
    categories: any[];
    brands: string[];
    priceRanges: any[];
    discountOptions: any[];
    expandedFilters: any;
    setExpandedFilters: any;
    handleFilterChange: any;
    clearAllFilters: any;
    onClose: () => void;
}> = ({
    filters,
    categories,
    brands,
    priceRanges,
    discountOptions,
    expandedFilters,
    setExpandedFilters,
    handleFilterChange,
    clearAllFilters,
    onClose
}) => {
        return (
            <div className="p-4 space-y-6">
                {Object.values(filters).some(v =>
                    (typeof v === 'string' && v !== '' && v !== 'popularity') ||
                    (Array.isArray(v) && (v[0] > 0 || v[1] < 50000)) ||
                    (typeof v === 'number' && v > 0)
                ) && (
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    clearAllFilters();
                                    onClose();
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                {/* Category Filter */}
                <div>
                    <div
                        className="flex items-center justify-between cursor-pointer mb-3 py-2"
                        onClick={() => setExpandedFilters((prev: any) => ({ ...prev, category: !prev.category }))}
                    >
                        <h4 className="font-medium text-gray-900">Category</h4>
                        {expandedFilters.category ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </div>
                    {expandedFilters.category && (
                        <div className="space-y-3 pb-4 border-b border-gray-200">
                            <label className="flex items-center py-2">
                                <input
                                    type="radio"
                                    name="category-mobile"
                                    checked={filters.category === ''}
                                    onChange={() => handleFilterChange('category', '')}
                                    className="mr-3 w-4 h-4"
                                />
                                <span className="text-sm">All Categories</span>
                            </label>
                            {categories.map(category => (
                                <label key={category.id} className="flex items-center py-2">
                                    <input
                                        type="radio"
                                        name="category-mobile"
                                        checked={filters.category === category.name}
                                        onChange={() => handleFilterChange('category', category.name)}
                                        className="mr-3 w-4 h-4"
                                    />
                                    <span className="text-sm">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Apply Filters Button */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        );
    };

export default ProductsPage;