import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, Star, Droplets, TrendingUp, Users, Award, Lock } from 'lucide-react';

interface ProfessionalAuthLayoutProps {
  children: React.ReactNode;
  showBranding?: boolean;
}

/**
 * Professional Auth Layout with psychological triggers
 * - Social proof (customer count, reviews)
 * - Trust signals (security, authenticity)
 * - FOMO (limited time offers)
 * - Clear value proposition
 */
export const ProfessionalAuthLayout: React.FC<ProfessionalAuthLayoutProps> = ({
  children,
  showBranding = true
}) => {
  const [customerCount, setCustomerCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Animate numbers for social proof
  useEffect(() => {
    const animateNumber = (target: number, setter: (n: number) => void, duration: number = 2000) => {
      const start = 0;
      const increment = target / (duration / 50);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 50);

      return () => clearInterval(timer);
    };

    animateNumber(15000, setCustomerCount);
    animateNumber(4800, setReviewCount);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding & Trust Signals */}
        {showBranding && (
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl p-10 text-white overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>

            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-wide">Aligarh Attars</h1>
              </div>

              <h2 className="text-3xl font-serif font-bold mb-4 leading-tight tracking-tight">
                Experience the Essence of Luxury
              </h2>

              <p className="text-white/90 text-base font-serif mb-8 max-w-md leading-relaxed">
                Discover our exquisite collection of premium fragrances, crafted with passion and tradition.
              </p>
            </div>

            {/* Value Propositions */}
            <div className="relative z-10">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                  <Droplets className="h-6 w-6 mb-2" />
                  <h3 className="font-serif font-semibold text-sm mb-1">Premium Quality</h3>
                  <p className="text-xs text-white/80 font-serif">Authentic ingredients</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                  <Heart className="h-6 w-6 mb-2" />
                  <h3 className="font-serif font-semibold text-sm mb-1">Heritage Craft</h3>
                  <p className="text-xs text-white/80 font-serif">Traditional methods</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/20">
                  <Star className="h-6 w-6 mb-2" />
                  <h3 className="font-serif font-semibold text-sm mb-1">Luxury Experience</h3>
                  <p className="text-xs text-white/80 font-serif">Unforgettable scents</p>
                </div>
              </div>

              {/* Social Proof - Trust Signals */}
              <div className="space-y-4 border-t border-white/20 pt-6">
                {/* Customer Count */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{customerCount.toLocaleString()}+ Happy Customers</p>
                    <p className="text-xs text-white/70">Join our growing community</p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{reviewCount.toLocaleString()}+ 5-Star Reviews</p>
                    <p className="text-xs text-white/70">Trusted by fragrance enthusiasts</p>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">100% Secure & Private</p>
                    <p className="text-xs text-white/70">Your data is protected</p>
                  </div>
                </div>

                {/* Limited Time Offer */}
                <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm font-semibold">New Member Exclusive</p>
                  </div>
                  <p className="text-xs text-white/90">Get 15% off your first order when you sign up today!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Auth Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAuthLayout;

