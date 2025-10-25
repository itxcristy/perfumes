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
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image Container with Luxury Overlay */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Featured Badge */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110 ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-3.5 w-3.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1.5">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(Number(product.rating) || 0)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({Number(product.reviewCount) || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="ml-1.5 text-xs text-gray-500 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Description Preview */}
          {product.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom Border Accent */}
        <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </div>
    </Link>
  );
};

export default FeaturedProductCard;

