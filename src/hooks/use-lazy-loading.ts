import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadingProps {
  src: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

export function useLazyLoading({
  src,
  placeholderSrc = '/placeholder.svg',
  threshold = 0.1,
  rootMargin = '50px'
}: UseLazyLoadingProps) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    let mounted = true;

    const loadImage = (imageUrl: string) => {
      // Don't attempt to load empty or invalid URLs
      if (!imageUrl || imageUrl.trim() === '') {
        if (mounted) {
          setError('Invalid image URL');
          setIsLoaded(false);
        }
        return;
      }

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        if (mounted) {
          setImageSrc(imageUrl);
          setIsLoaded(true);
          setError(null);
        }
      };
      img.onerror = () => {
        if (mounted) {
          setError('Failed to load image');
          setIsLoaded(false);
        }
      };
    };

    if ('IntersectionObserver' in window && imageRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded) {
              loadImage(src);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(imageRef.current);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      loadImage(src);
    }

    return () => {
      mounted = false;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, threshold, rootMargin, isLoaded]);

  return { imageSrc, isLoaded, error, imageRef };
}