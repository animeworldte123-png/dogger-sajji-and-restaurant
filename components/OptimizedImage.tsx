import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fallbackTitleEn?: string;
  fallbackTitleUr?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  shimmerVariant?: 'dark' | 'light' | 'amber';
}

/**
 * High-performance, anti-lag image component with:
 * - Native loading="lazy" and decoding="async"
 * - Lightweight inline colored SVG shimmer placeholder (Zero CLS)
 * - Graceful fallback on network/load errors
 * - Smooth opacity transition on load complete
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden',
  loading = 'lazy',
  decoding = 'async',
  fallbackTitleEn,
  fallbackTitleUr,
  fallbackIcon,
  onLoad,
  onError,
  shimmerVariant = 'dark',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // SVG Shimmer Color Palettes
  const shimmerColors = {
    dark: {
      bg: '#0f172a',
      shimmerStart: '#1e293b',
      shimmerMid: '#334155',
      shimmerEnd: '#1e293b',
    },
    amber: {
      bg: '#1c1917',
      shimmerStart: '#292524',
      shimmerMid: '#78350f',
      shimmerEnd: '#292524',
    },
    light: {
      bg: '#f8fafc',
      shimmerStart: '#f1f5f9',
      shimmerMid: '#e2e8f0',
      shimmerEnd: '#f1f5f9',
    },
  }[shimmerVariant];

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError();
  };

  return (
    <div className={containerClassName}>
      {/* 1. Lightweight Inline Colored SVG Shimmer (Zero Layout Shift) */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0"
          style={{ backgroundColor: shimmerColors.bg }}
        >
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 400 300"
          >
            <defs>
              <linearGradient id={`shimmer-grad-${shimmerVariant}`} x1="-100%" y1="0%" x2="200%" y2="0%">
                <stop offset="0%" stopColor={shimmerColors.shimmerStart} stopOpacity="0.8">
                  <animate
                    attributeName="offset"
                    values="-1; 1"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="50%" stopColor={shimmerColors.shimmerMid} stopOpacity="1">
                  <animate
                    attributeName="offset"
                    values="-0.5; 1.5"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor={shimmerColors.shimmerEnd} stopOpacity="0.8">
                  <animate
                    attributeName="offset"
                    values="0; 2"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#shimmer-grad-${shimmerVariant})`} />
          </svg>
        </div>
      )}

      {/* 2. Fallback Card if Network Fails or Missing Resource */}
      {hasError ? (
        <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 text-center text-slate-300">
          {fallbackIcon || <Utensils className="w-7 h-7 mb-1.5 opacity-50 text-amber-500" />}
          {fallbackTitleEn && <span className="text-xs font-bold text-white line-clamp-1">{fallbackTitleEn}</span>}
          {fallbackTitleUr && (
            <span className="text-[11px] font-urdu text-amber-400 mt-0.5 line-clamp-1" dir="rtl">
              {fallbackTitleUr}
            </span>
          )}
        </div>
      ) : (
        /* 3. The Optimized Image Element */
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
