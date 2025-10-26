import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  // Background images array - using perfume images
  const backgroundImages = [
    '/images/perfumes/perfume-1.jpg', // Luxury perfume bottles
    '/images/perfumes/perfume-2.jpg', // Elegant fragrance display
    '/images/perfumes/perfume-3.jpg', // Modern perfume collection
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Change background image every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Preload images for smooth transitions
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgroundImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setIsLoaded(true);
      } catch (error) {
        console.warn('Some images failed to load:', error);
        setIsLoaded(true); // Continue anyway
      }
    };

    preloadImages();
  }, [backgroundImages]);

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950">
      {/* Dynamic Background Images */}
      <div className="absolute inset-0">
        {/* Professional overlay - deep, luxurious */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-950/40 to-black/60 z-10"></div>

        {/* Background Images with Smooth Transition */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentImageIndex && isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}

        {/* Fallback warm background */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200" />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight">
            <span className="block drop-shadow-lg">
              Aligarh Attars
            </span>
            <span className="block text-purple-300 mt-2 md:mt-4 drop-shadow-lg">
              Welcomes You
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
            Discover the timeless elegance of traditional Indian attars, crafted with passion and heritage
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 md:px-10 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Explore Collection</span>
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto bg-white hover:bg-purple-50 text-purple-900 px-8 md:px-10 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 border-2 border-white/20"
            >
              <span>Learn More</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Trust Indicators */}
      <div
        className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-3 sm:px-4 animate-fade-in-up"
        style={{ animationDelay: '0.6s' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 text-white/90 text-xs sm:text-sm md:text-base backdrop-blur-sm bg-black/20 rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 md:px-6">
          <div
            className="flex items-center space-x-1.5 sm:space-x-2 animate-fade-in-left"
            style={{ animationDelay: '0.8s' }}
          >
            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
            <span className="font-medium">Fast Shipping</span>
          </div>

          <div
            className="flex items-center space-x-1.5 sm:space-x-2 animate-fade-in-up"
            style={{ animationDelay: '1.0s' }}
          >
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
            <span className="font-medium">Authentic Products</span>
          </div>

          <div
            className="flex items-center space-x-1.5 sm:space-x-2 animate-fade-in-right"
            style={{ animationDelay: '1.2s' }}
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
            <span className="font-medium">30-Day Returns</span>
          </div>
        </div>
      </div>
    </section>
  );
};