import React, { memo } from 'react';

interface OptimizedLoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    className?: string;
}

/**
 * Optimized loading spinner with minimal re-renders
 */
export const OptimizedLoadingSpinner = memo<OptimizedLoadingSpinnerProps>(({
    size = 'medium',
    text = 'Loading...',
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p className="mt-2 text-sm text-gray-600 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';
