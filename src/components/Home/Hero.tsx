import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Images */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10"></div>

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

        {/* Fallback gradient background */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-black" />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-['Poppins'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight animate-fade-in-up">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-white">
              Aligarh Attars
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 mt-2 sm:mt-3 md:mt-4">
              Welcomes You
            </span>
          </h1>

          <p
            className="font-['Poppins'] text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-3 sm:px-6 animate-fade-in-up font-light"
            style={{ animationDelay: '0.2s' }}
          >
            Curate your olfactory journey with our exclusive collection of premium fragrances,
            each carefully selected to embody sophistication and timeless elegance.
          </p>

          <nav
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link to="/products" className="group">
              <button
                className="font-['Poppins'] bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-full text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl group-hover:shadow-purple-500/25 min-w-[160px]"
              >
                <span className="flex items-center space-x-2">
                  <span>Shop Collection</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Link>

            <Link to="/products" className="group">
              <button
                className="font-['Poppins'] border-2 border-white/80 hover:border-white bg-white/10 hover:bg-white hover:text-black backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-full text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-[160px]"
              >
                Find Your Scent
              </button>
            </Link>
          </nav>
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