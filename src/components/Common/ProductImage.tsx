import React from 'react';
import { globalResourceManager } from '../../utils/resourceManager.tsx';
import { RequestPriority } from '../../utils/networkResilience';
import { useNetwork, useNetworkAdaptation } from '@/contexts/NetworkStatusContext';
import { performanceMonitor } from '../../utils/performance';
import { useImagePerformance } from '../../utils/performance';

interface ProductImageProps {
    product: {
        name: string;
        images?: string[];
        id: string;
    };
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large';
    priority?: RequestPriority; // Add priority support
    onError?: () => void;
    onLoad?: () => void; // Add load callback
}

export const ProductImage: React.FC<ProductImageProps> = ({
    product,
    className = '',
    alt,
    size = 'medium',
    priority = 'normal',
    onError,
    onLoad
}) => {
    const [imageError, setImageError] = React.useState(false);
    const [currentImage, setCurrentImage] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const network = useNetworkAdaptation();
    // We're not using the performance hooks for now to simplify the component
    // const { startLoading, endLoading } = useImagePerformance(product.images?.[currentImage] || '');

    // Get the first valid image URL
    const getImageUrl = () => {
        if (product.images && product.images.length > 0) {
            // Check if we have a valid image URL (not just a placeholder)
            const validImages = product.images.filter(img =>
                img &&
                img.trim() !== '' &&
                !img.includes('placeholder') &&
                (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:'))
            );

            if (validImages.length > 0) {
                return validImages[currentImage] || validImages[0];
            }
        }
        return null;
    };

    // Generate fallback image with first letter
    const generateFallbackImage = (name: string) => {
        const firstLetter = name.charAt(0).toUpperCase();
        const colors = [
            { bg: '#E3F2FD', text: '#1976D2' }, // Blue
            { bg: '#F3E5F5', text: '#7B1FA2' }, // Purple
            { bg: '#E8F5E8', text: '#388E3C' }, // Green
            { bg: '#FFF3E0', text: '#F57C00' }, // Orange
            { bg: '#FCE4EC', text: '#C2185B' }, // Pink
            { bg: '#E0F2F1', text: '#00796B' }, // Teal
            { bg: '#FFF8E1', text: '#F9A825' }, // Amber
            { bg: '#EFEBE9', text: '#5D4037' }, // Brown
        ];

        // Use first letter to determine color
        const normalizedIndex = Math.abs(firstLetter.charCodeAt(0)) % colors.length;
        const color = normalizedIndex >= 0 && normalizedIndex < colors.length
            ? colors[normalizedIndex]
            : colors[0];

        // Size configurations
        const sizeConfig = {
            small: { width: 100, height: 100, fontSize: 32 },
            medium: { width: 200, height: 200, fontSize: 64 },
            large: { width: 400, height: 400, fontSize: 128 }
        };

        const config = sizeConfig[size];

        const bgColor = color?.bg || '#E3F2FD';
        const textColor = color?.text || '#1976D2';

        const svg = `
      <svg width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" 
              font-size="${config.fontSize}" font-weight="600" 
              fill="${textColor}" text-anchor="middle" 
              dominant-baseline="central">${firstLetter}</text>
      </svg>
    `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
            setIsLoading(false);
            if (onError) onError();
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    const imageUrl = getImageUrl();
    const shouldShowFallback = !imageUrl || imageError || !network.shouldLoadImages;

    // Handle network changes
    React.useEffect(() => {
        if (!network.shouldLoadImages) {
            setIsLoading(false);
        }
    }, [network.shouldLoadImages]);

    // If it's a data URL, it's already loaded
    React.useEffect(() => {
        if (imageUrl && imageUrl.startsWith('data:')) {
            setIsLoading(false);
        }
    }, [imageUrl]);

    return (
        <>
            {isLoading && network.shouldLoadImages && !imageUrl?.startsWith('data:') && (
                // Show skeleton loader while loading
                <div className={`bg-gray-200 animate-pulse ${className}`} />
            )}
            <img
                src={shouldShowFallback ? generateFallbackImage(product.name) : imageUrl || generateFallbackImage(product.name)}
                alt={alt || product.name}
                className={className}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading={priority === 'critical' ? 'eager' : 'lazy'}
                style={{ display: isLoading && network.shouldLoadImages && !imageUrl?.startsWith('data:') ? 'none' : 'block' }}
            />
        </>
    );
};

export default ProductImage;