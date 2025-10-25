import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';
import { useMobileDetection } from '../../hooks/useMobileGestures';

// Import category images
import attarBlendsImg from '../../assets/images/categories/attar-blends.jpg';
import booksCollectionImg from '../../assets/images/categories/books-collection.jpg';
import hijabCollectionImg from '../../assets/images/categories/hijab-collection.jpg';
import muskAttarsImg from '../../assets/images/categories/musk-attars.jpg';
import oudhAttarsImg from '../../assets/images/categories/oudh-attars.jpg';
import quranCollectionImg from '../../assets/images/categories/quran-collection.jpg';

interface CategoryDisplayCardProps {
  category: Category;
}

export const CategoryDisplayCard: React.FC<CategoryDisplayCardProps> = ({ category }) => {
  const { isMobile } = useMobileDetection();

  // Map category names to specific images
  const categoryImages: Record<string, string> = {
    "Attar Blends": attarBlendsImg,
    "Islamic Books": booksCollectionImg,
    "Hijab Collection": hijabCollectionImg,
    "Musk Attars": muskAttarsImg,
    "Oudh Attars": oudhAttarsImg,
    "Quran Collection": quranCollectionImg,
  };

  // Use specific image if available, otherwise fallback to category.imageUrl
  const categoryImage = categoryImages[category.name] || category.imageUrl;

  // Mobile-specific styling
  const cardClasses = isMobile
    ? "group relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer h-64 flex flex-col justify-end touch-manipulation"
    : "group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer h-80 flex flex-col justify-end";

  const textClasses = isMobile
    ? "text-lg font-bold mb-1 text-white drop-shadow-lg"
    : "text-2xl font-bold mb-2 text-white drop-shadow-lg";

  const countClasses = isMobile
    ? "text-xs font-semibold"
    : "text-sm font-semibold";

  return (
    <Link to={`/products?category=${category.id}`}>
      <div className={cardClasses}>
        <img
          src={categoryImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Enhanced gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent"></div>

        <div className="relative p-4 sm:p-6 text-white z-10">
          <h3 className={textClasses}>{category.name}</h3>
          <div className="flex items-center text-sm font-medium text-white drop-shadow-md mt-2">
            <span>Explore Now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>

        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/95 text-neutral-900 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
          <span className={countClasses}>{category.productCount}+ items</span>
        </div>
      </div>
    </Link>
  );
};