import { Product } from '../types/index.js';

export interface ImageValidationReport {
  isValid: boolean;
  totalProducts: number;
  uniquePrimaryImages: number;
  duplicateImages: number;
  missingImages: number;
  invalidImages: number;
  duplicateUrls: string[];
  categoryBreakdown: Record<string, { total: number; unique: number }>;
}

export function validateProductImages(products: Product[]): ImageValidationReport {
  const primaryUrls: string[] = [];
  const urlMap = new Map<string, number>();
  let missingImages = 0;
  let invalidImages = 0;
  const duplicateUrls: string[] = [];
  const categoryBreakdown: Record<string, { total: number; unique: number; urls: Set<string> }> = {};

  for (const prod of products) {
    const cat = prod.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, unique: 0, urls: new Set() };
    }
    categoryBreakdown[cat].total += 1;

    if (!prod.images || prod.images.length === 0 || !prod.images[0]) {
      missingImages += 1;
      continue;
    }

    const primary = prod.images[0].trim();
    if (!primary || !primary.startsWith('http')) {
      invalidImages += 1;
      continue;
    }

    primaryUrls.push(primary);
    categoryBreakdown[cat].urls.add(primary);

    const count = (urlMap.get(primary) || 0) + 1;
    urlMap.set(primary, count);
    if (count === 2) {
      duplicateUrls.push(primary);
    }
  }

  const uniquePrimarySet = new Set(primaryUrls);
  const uniquePrimaryImages = uniquePrimarySet.size;
  const duplicateImages = primaryUrls.length - uniquePrimaryImages;

  const resultBreakdown: Record<string, { total: number; unique: number }> = {};
  for (const [cat, data] of Object.entries(categoryBreakdown)) {
    resultBreakdown[cat] = {
      total: data.total,
      unique: data.urls.size,
    };
  }

  const isValid =
    products.length >= 500 &&
    duplicateImages === 0 &&
    missingImages === 0 &&
    invalidImages === 0 &&
    uniquePrimaryImages === products.length;

  return {
    isValid,
    totalProducts: products.length,
    uniquePrimaryImages,
    duplicateImages,
    missingImages,
    invalidImages,
    duplicateUrls,
    categoryBreakdown: resultBreakdown,
  };
}
