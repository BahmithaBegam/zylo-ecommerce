import type { SyntheticEvent } from 'react';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
  women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
  men: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
  kids: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
  electronics: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  'home & living': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80',
  'home-living': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80',
  'home & kitchen': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&auto=format&fit=crop&q=80',
  'toys & games': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80',
  toys: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80',
  'bags & accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
  bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
  'sports & fitness': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
};

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

export function getCategoryFallback(category?: string): string {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const key = category.toLowerCase().trim();
  if (CATEGORY_FALLBACK_IMAGES[key]) {
    return CATEGORY_FALLBACK_IMAGES[key];
  }
  for (const [catKey, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key.includes(catKey) || catKey.includes(key)) {
      return url;
    }
  }
  return DEFAULT_FALLBACK_IMAGE;
}

export function getProductImageUrl(images?: string[], category?: string): string {
  if (!images || images.length === 0 || !images[0] || images[0] === 'IMAGE_REQUIRED') {
    return getCategoryFallback(category);
  }
  return images[0];
}

export function handleImageError(
  e: SyntheticEvent<HTMLImageElement, Event>,
  category?: string
) {
  const target = e.currentTarget;
  const fallback = getCategoryFallback(category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
