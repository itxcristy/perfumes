import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

// Add CSS animations
const style = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  .animate-fade-in {
    animation: fade-in 1s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 1s ease-out 0.3s forwards;
    opacity: 0;
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

// Extract real reviews from products
const extractRealReviews = (products: any[]) => {
  const reviews: any[] = [];
  
  // Flatten all reviews from products
  products.forEach(product => {
    if (product.reviews && product.reviews.length > 0) {
      product.reviews.forEach((review: any) => {
        // Only include reviews with comments and high ratings
        if (review.comment && review.rating >= 4) {
          reviews.push({
            id: review.id,
            quote: review.comment,
            name: review.profiles?.full_name || 'Anonymous Customer',
            location: 'Verified Customer',
            rating: review.rating,
            product: {
              name: product.name,
              image: product.images && product.images.length > 0 ? product.images[0] : '',
              id: product.id
            },
            avatar: review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.profiles?.full_name || 'Anonymous')}&background=7e22ce&color=ffffff`
          });
        }
      });
    }
  });
  
  // If we don't have enough real reviews, add some sample ones
  if (reviews.length < 3) {
    const sampleReviews = [
      {
        id: 'sample-1',
        quote: "The Mogra Attar transformed my evening routine. Its intoxicating aroma lingers beautifully through the night, creating an enchanting atmosphere.",
        name: "Priya Sharma",
        location: "Mumbai, Maharashtra",
        rating: 5,
        product: {
          name: "Mogra Attar",
          image: "https://images.unsplash.com/photo-1587556930116-1a5e8e4e8a8e?w=600&h=400&fit=crop",
          id: "mogra-attar"
        },
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
      },
      {
        id: 'sample-2',
        quote: "I've been searching for the perfect rose fragrance for years. This Kashmiri Rose Attar captures the essence of a Kashmiri garden in full bloom - delicate yet profound.",
        name: "Rahul Verma",
        location: "New Delhi, India",
        rating: 5,
        product: {
          name: "Kashmiri Rose Attar",
          image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=400&fit=crop",
          id: "kashmiri-rose"
        },
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
      },
      {
        id: 'sample-3',
        quote: "The Sandalwood Classic is sophistication in a bottle. Rich, warm, and deeply comforting - perfect for evening wear. It's become my signature scent.",
        name: "Amit Patel",
        location: "Bangalore, Karnataka",
        rating: 5,
        product: {
          name: "Sandalwood Classic",
          image: "https://images.unsplash.com/photo-1587556930116-1a5e8e4e8a8e?w=600&h=400&fit=crop",
          id: "sandalwood-classic"
        },
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
      }
    ];
    
    return [...reviews, ...sampleReviews.slice(0, 6 - reviews.length)];
  }
  
  return reviews.slice(0, 6);
};

// Enhanced Testimonial Card Component with fixed image sizing
const TestimonialCard: React.FC<{ testimonial: any }> = ({ testimonial }) => {
  return (
    <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden w-full border border-amber-100 transform hover:-translate-y-1">
      <div className="flex flex-col md:flex-row h-full">
        {/* Product Image with fixed size */}
        <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative flex-shrink-0">
          {testimonial.product.image ? (
            <img
              src={testimonial.product.image}
              alt={testimonial.product.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg'; // Fallback image
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500">No Image</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl">{testimonial.product.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-3/5 p-6 flex flex-col justify-between">
          {/* Rating and Quote */}
          <div>
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>

            <blockquote className="text-gray-700 mb-4">
              <p className="italic text-lg leading-relaxed">"{testimonial.quote}"</p>
            </blockquote>
          </div>

          {/* Customer Info and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-100">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=7e22ce&color=ffffff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.location}</p>
              </div>
            </div>
            
            <Link 
              to={`/products/${testimonial.product.id}`}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Responsive Carousel Component with real reviews
const TestimonialCarousel: React.FC = () => {
  const { products } = useProducts();
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Extract real reviews from products
  useEffect(() => {
    if (products && products.length > 0) {
      const realReviews = extractRealReviews(products);
      setTestimonialsData(realReviews);
    }
  }, [products]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying || testimonialsData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonialsData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonialsData]);

  const goToNext = () => {
    if (testimonialsData.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % testimonialsData.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    if (testimonialsData.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + testimonialsData.length) % testimonialsData.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (testimonialsData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl py-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      {/* Navigation Arrows */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-6 w-6 text-amber-700" />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-6 w-6 text-amber-700" />
      </button>

      {/* Carousel Track */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {testimonialsData.map((testimonial, index) => (
          <div key={testimonial.id || index} className="w-full flex-shrink-0 px-4">
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {testimonialsData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-amber-500 w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const LovedByThousands: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 w-full relative overflow-hidden">
      <style>{style}</style>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 w-full">
          <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Star className="h-4 w-4 mr-2 fill-current" />
            <span>Trusted by 5,000+ Customers</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Real stories from customers who discovered their signature scent
          </p>
        </div>

        {/* Responsive Carousel */}
        <div className="w-full mb-12">
          <TestimonialCarousel />
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-amber-600 mb-2">4.9</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
              ))}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-amber-600 mb-2">5K+</div>
            <div className="text-gray-600 text-sm">Happy Customers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-amber-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">Repeat Buyers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-amber-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Customer Support</div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/reviews"
            className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Read All Reviews
          </Link>
          <p className="text-gray-700 mt-6 text-lg font-medium">
            Join 5,000+ Happy Customers
          </p>
        </div>
      </div>
    </section>
  );
};

export default LovedByThousands;