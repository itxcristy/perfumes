import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Heart, ShoppingCart, Calendar } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface LatestArrivalProductCardProps {
  product: Product;
}

/**
 * LatestArrivalProductCard - Fresh, Modern & Minimalist Design
 * Emphasizes newness with clean lines and modern aesthetics
 */
export const LatestArrivalProductCard: React.FC<LatestArrivalProductCardProps> = ({ product }) => {
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

  // Calculate days since product was added
  const getDaysAgo = () => {
    if (!product.createdAt) return null;
    const createdDate = new Date(product.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysAgo = getDaysAgo();
  const isVeryNew = daysAgo && daysAgo <= 7;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 hover:border-purple-300">
        {/* NEW Badge with Animation */}
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
          <Sparkles className={`h-3 w-3 ${isVeryNew ? 'animate-pulse' : ''}`} />
          NEW
        </div>

        {/* Date Badge */}
        {product.createdAt && (
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(product.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )}

        {/* Image Container - Clean & Minimal */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />

          {/* Minimal Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Action Buttons - Minimalist Style */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-lg backdrop-blur-md shadow-md transition-all duration-300 hover:scale-110 ${
                isInWishlist(product.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg backdrop-blur-md shadow-md transition-all duration-300 hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Product Info - Clean Layout */}
        <div className="p-4">
          {/* Time Indicator */}
          {daysAgo && daysAgo <= 30 && (
            <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold mb-2">
              <Clock className="h-3 w-3" />
              <span>
                {daysAgo === 1 ? 'Added today' : 
                 daysAgo <= 7 ? `${daysAgo} days ago` : 
                 'Recently added'}
              </span>
            </div>
          )}

          {/* Product Name - Clean Typography */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Category Tag */}
          {product.category && (
            <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-3">
              {product.category}
            </span>
          )}

          {/* Price - Minimalist */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="text-sm text-gray-400 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Description - Subtle */}
          {product.description && (
            <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom Accent Line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </div>
    </Link>
  );
};

export default LatestArrivalProductCard;

