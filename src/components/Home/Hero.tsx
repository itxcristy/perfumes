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

      {/* Main Content with Animations */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading - Largest and Most Prominent - Fade in from top */}
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight animate-fade-in-down"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <span className="block drop-shadow-2xl">
              Aligarh Attars
            </span>
          </h1>

          {/* Welcome Message - Secondary Heading - Fade in from top with delay */}
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-purple-200 mb-6 md:mb-8 drop-shadow-lg animate-fade-in-down"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            Welcomes You
          </h2>

          {/* Description - Smaller than headings - Fade in with delay */}
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-100/90 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-md font-light animate-fade-in-up"
            style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            Discover the timeless elegance of traditional Indian attars, crafted with passion and heritage
          </p>

          {/* Buttons - Smallest, with rounded corners - Fade in from bottom with delay */}
          <div
            className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center animate-fade-in-up"
            style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
          >
            <Link
              to="/products"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              <span>Explore Collection</span>
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto bg-white/95 backdrop-blur-sm hover:bg-white text-purple-900 px-6 md:px-8 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 border-2 border-white/30"
            >
              <span>Learn More</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>

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