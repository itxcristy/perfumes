import React, { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { MiniTrustIndicators, TrendingIndicator } from '../Trust';
import { useAddToCartWithAuth } from '../../hooks/useAddToCartWithAuth';
import { useAddToWishlistWithAuth } from '../../hooks/useAddToWishlistWithAuth';
import ProductImage from '../Common/ProductImage';
import { useCartButtonStyles } from '../../hooks/useCartButtonStyles';

interface ProductCardProps {
  product: Product;
  isListView?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isListView = false }) => {
  const { isInWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { handleAddToCart } = useAddToCartWithAuth();
  const { handleAddToWishlist } = useAddToWishlistWithAuth();
  const { cartButtonText, cartButtonStyle, cartButtonHoverStyle } = useCartButtonStyles();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleAddToWishlist(product);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    if (product.stock <= 5) return { text: 'Low Stock', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { text: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className={`product-card group flex ${isListView ? 'flex-row gap-2.5' : 'flex-col'} bg-white shadow-sm hover:shadow-md transition-shadow duration-200 touch-manipulation ${isListView ? 'p-3 rounded-none border-b border-gray-200 min-h-[160px]' : 'h-full rounded-lg overflow-hidden border border-gray-100'
        }`}
    >
      {/* Image Container - Amazon-style square image */}
      <div className={`relative overflow-hidden group/image bg-gray-50 flex-shrink-0 ${isListView
        ? 'w-[140px] h-[140px] rounded-md'
        : ''
        }`}>

        <Link to={`/products/${product.id}`} className="block h-full">
          {/* Fixed aspect ratio: 1:1 for list view, 4:3 for grid view */}
          <div className={`${isListView ? 'w-full h-full' : 'aspect-[4/3]'} relative overflow-hidden`}>
            <ProductImage
              product={product}
              className="w-full h-full object-cover"
              alt={product.name}
              size="medium"
            />

            {/* Image Navigation - Amazon Style with mobile optimization */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {product.images.map((_, index) => (
                  <button
                    key={`${product.id}-image-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-150 ${index === currentImageIndex
                      ? 'bg-white shadow-md'
                      : 'bg-white/70 hover:bg-white/90'
                      }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </Link>

        {/* Discount Badge - Amazon style */}
        {discount > 0 && (
          <div className={`absolute ${isListView ? 'top-1 left-1' : 'top-2 left-2'} z-10`}>
            <span className={`bg-red-600 text-white font-bold shadow-sm ${isListView ? 'text-[11px] px-1.5 py-1 rounded-sm' : 'text-[10px] px-1.5 py-0.5 rounded'
              }`}>
              {discount}% off
            </span>
          </div>
        )}

        {/* Trending Badge - Grid view only */}
        {product.featured && !isListView && (
          <div className="absolute top-2 left-2 z-10">
            <TrendingIndicator isHot={true} className="shadow-sm" />
          </div>
        )}

        {/* Amazon-Style Action Buttons with mobile touch optimization - Hidden in list view */}
        {!isListView && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex flex-col space-y-1 sm:space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlistToggle}
              className={`p-1 sm:p-1.5 rounded-full shadow-sm border transition-colors duration-200 ${isInWishlist(product.id)
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-gray-600 hover:text-red-500 border-gray-200 hover:border-red-200'
                } touch-manipulation`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>

          </div>
        )}

        {/* Amazon-Style Add to Cart Button with mobile touch optimization - Hidden in list view */}
        {!isListView && (
          <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-white via-white/95 to-transparent">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (product.stock > 0) {
                  handleAddToCart(product);
                }
              }}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg font-medium transition-colors duration-200 ${product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : ''
                } touch-manipulation`}
              style={product.stock !== 0 ? cartButtonStyle : undefined}
              onMouseEnter={(e) => {
                if (product.stock !== 0) {
                  Object.assign(e.currentTarget.style, cartButtonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock !== 0) {
                  Object.assign(e.currentTarget.style, cartButtonStyle);
                }
              }}
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-[10px] sm:text-xs font-medium">
                {product.stock === 0 ? 'Out of Stock' : cartButtonText}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Product Information - Amazon-style layout with buttons on right */}
      <div className={`flex ${isListView ? 'flex-row flex-1 gap-2' : 'flex-col flex-1'} min-w-0 ${isListView ? '' : 'p-2.5 sm:p-3'}`}>

        {/* Left side: Product details */}
        <div className={`flex flex-col flex-1 min-w-0 ${isListView ? 'justify-start' : ''}`}>

          {/* Product Name - Prominent */}
          <Link to={`/products/${product.id}`}>
            <h3 className={`font-normal text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 ${isListView ? 'text-[14px] leading-tight mb-1' : 'text-xs sm:text-sm leading-4'
              }`}>
              {product.name}
            </h3>
          </Link>

          {/* Rating and Reviews */}
          <div className={`flex flex-col ${isListView ? 'gap-1 mb-1' : 'gap-1 mt-2'}`}>
            {/* Rating - Amazon style */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`${product.id}-star-${i}`}
                    className={`${isListView ? 'h-3 w-3' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'} ${i < Math.floor(product.rating)
                      ? 'text-orange-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className={`${isListView ? 'text-xs' : 'text-[10px]'} text-blue-600 font-medium`}>
                {product.rating}
              </span>
            </div>

            {/* Price - Large and prominent */}
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-gray-900 ${isListView ? 'text-xl' : 'text-sm sm:text-base'}`}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <>
                  <span className={`text-gray-500 line-through ${isListView ? 'text-sm' : 'text-[10px]'}`}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  {discount > 0 && (
                    <span className={`text-red-600 font-medium ${isListView ? 'text-xs' : 'text-[10px]'}`}>
                      ({discount}% off)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Delivery Info - Amazon style */}
            {isListView && (
              <div className="flex items-center">
                <span className="text-[11px] text-gray-700">
                  {product.stock > 0 ? 'Get it by Tomorrow' : 'Currently unavailable'}
                </span>
              </div>
            )}

            {/* Prime Badge - Amazon style (optional) */}
            {isListView && product.featured && (
              <div className="flex items-center mt-1">
                <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                  prime
                </span>
              </div>
            )}
          </div>

          {/* Bottom Section: Stock and Trust Indicators (Grid View Only) */}
          {!isListView && (
            <>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                  {product.stock > 0 ? (product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`) : 'Out of stock'}
                </span>
              </div>

              <div className="pt-1.5 border-t border-gray-100 mt-2">
                <MiniTrustIndicators
                  freeShipping={product.price >= 2000}
                  warranty={true}
                  returns={true}
                  className="justify-center scale-75"
                />
              </div>
            </>
          )}
        </div>

        {/* Right side: Action buttons for list view */}
        {isListView && (
          <div className="flex flex-col gap-2 justify-center items-end flex-shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-md border transition-colors duration-200 ${isInWishlist(product.id)
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-gray-600 hover:text-red-500 border-gray-200 hover:border-red-200'
                } touch-manipulation`}
              style={{ minWidth: '40px', minHeight: '40px' }}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (product.stock > 0) {
                  handleAddToCart(product);
                }
              }}
              disabled={product.stock === 0}
              className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap ${product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : ''
                } touch-manipulation`}
              style={product.stock !== 0 ? { ...cartButtonStyle, minHeight: '40px' } : { minHeight: '40px' }}
              onMouseEnter={(e) => {
                if (product.stock !== 0) {
                  Object.assign(e.currentTarget.style, cartButtonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock !== 0) {
                  Object.assign(e.currentTarget.style, cartButtonStyle);
                }
              }}
            >
              <span className="text-xs font-medium">
                {product.stock === 0 ? 'Out of Stock' : cartButtonText}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};