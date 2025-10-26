import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface FeaturedProductCardProps {
  product: Product;
}

/**
 * FeaturedProductCard - Luxurious & Sophisticated Design
 * Premium card design with emphasis on elegance and product imagery
 */
export const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({ product }) => {
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product, 1);
      // Notification is handled by CartContext
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToWishlist(product);
      // Notification is handled by WishlistContext
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />

          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

          {/* Featured Badge */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-purple-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-xs font-semibold shadow-sm flex items-center gap-1">
            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
            <span className="hidden sm:inline">Featured</span>
          </div>

          {/* Action Buttons - Hidden on mobile, shown on hover on desktop */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-1.5 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 md:p-2 rounded-lg shadow-md transition-all duration-200 ${isInWishlist(product.id)
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-1.5 md:p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-all duration-200"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-3 md:p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] sm:text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1 md:mb-1.5 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 md:gap-1.5 mb-1.5 md:mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 md:h-3 md:w-3 ${i < Math.floor(Number(product.rating) || 0)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-[10px] md:text-xs text-gray-600">
                ({Number(product.reviewCount) || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="ml-1 md:ml-1.5 text-[10px] md:text-xs text-gray-500 line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Description Preview - Hidden on mobile */}
          {product.description && (
            <p className="hidden sm:block text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

      </div>
    </Link>
  );
};

export default FeaturedProductCard;

