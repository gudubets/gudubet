/**
 * Image utilities for cache busting and optimization
 */

/**
 * Add cache busting parameter to image URL
 * This ensures browsers reload images when they're updated
 */
export const addCacheBuster = (url: string | undefined): string => {
  if (!url) return '';
  
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

/**
 * Add cache buster only if the image was recently updated
 * This reduces unnecessary cache busting for old images
 */
export const addSmartCacheBuster = (url: string | undefined, updatedAt?: string): string => {
  if (!url) return '';
  
  // If no update time provided, use regular cache buster
  if (!updatedAt) return addCacheBuster(url);
  
  const updateTime = new Date(updatedAt).getTime();
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds
  
  // Only add cache buster if image was updated in the last hour
  if (updateTime > oneHourAgo) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${updateTime}`;
  }
  
  return url;
};

/**
 * Create a placeholder image URL for when no image is available
 */
export const getPlaceholderImage = (width: number = 300, height: number = 200): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2937"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle" dy="0.3em">
        Resim Yükleniyor...
      </text>
    </svg>
  `)}`;
};

/**
 * Preload an image to improve loading performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Force reload an image by updating its src
 * Useful for refreshing cached images
 */
export const forceImageReload = (imgElement: HTMLImageElement) => {
  const originalSrc = imgElement.src;
  imgElement.src = '';
  imgElement.src = addCacheBuster(originalSrc);
};