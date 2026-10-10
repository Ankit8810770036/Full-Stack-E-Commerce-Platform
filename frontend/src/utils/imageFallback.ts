// Robust Offline SVG Placeholder that renders cleanly without any external network dependency
export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="50%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#bgGrad)"/>
      <g transform="translate(220, 200)" fill="none" stroke="url(#boxGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M80 10 L150 45 L150 125 L80 160 L10 125 L10 45 Z"/>
        <path d="M10 45 L80 80 L150 45"/>
        <path d="M80 80 L80 160"/>
        <circle cx="80" cy="80" r="12" fill="#3b82f6"/>
      </g>
      <text x="300" y="420" fill="#a1a1aa" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" text-anchor="middle" letter-spacing="1">
        PRODUCT IMAGE
      </text>
      <text x="300" y="455" fill="#71717a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" text-anchor="middle">
        Cartify Verified Marketplace
      </text>
    </svg>
  `);

/**
 * Image error handler that replaces a broken or failed image URL with the offline SVG placeholder.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  customFallback?: string
) => {
  const target = e.currentTarget;
  const fallback = customFallback || FALLBACK_PRODUCT_IMAGE;
  // Prevent infinite loop if fallback also fails
  if (target.src !== fallback) {
    target.onerror = null;
    target.src = fallback;
  }
};

/**
 * Safely formats and optimizes image URLs without corrupting parameters.
 */
export const getOptimizedImageUrl = (url?: string, width = 600, quality = 80): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  // If already a data URI or blob, return as is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Handle Unsplash optimization cleanly
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('w', width.toString());
      parsed.searchParams.set('q', quality.toString());
      return parsed.toString();
    } catch {
      // Fallback for relative or malformed URLs
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}auto=format&w=${width}&q=${quality}`;
    }
  }

  return trimmed;
};
