import { ProductDoc } from '../db.js';

export interface ImageValidationReport {
  isValid: boolean;
  totalProducts: number;
  validImages: number;
  uniquePrimaryImages: number;
  duplicatePrimaryImages: number;
  missingImages: number;
  brokenImages: number;
  placeholderImages: number;
  categoryMismatches: number;
  duplicateUrls: string[];
  categoryBreakdown: Record<
    string,
    {
      total: number;
      uniquePrimary: number;
      valid: number;
      mismatches: number;
    }
  >;
}

export function validateProductImages(products: ProductDoc[]): ImageValidationReport {
  const primaryUrls: string[] = [];
  const basePhotoIds: string[] = [];
  const urlMap = new Map<string, number>();
  const idMap = new Map<string, number>();
  let missingImages = 0;
  let brokenImages = 0;
  let placeholderImages = 0;
  let categoryMismatches = 0;
  let validImages = 0;
  const duplicateUrls: string[] = [];

  const categoryBreakdown: Record<
    string,
    { total: number; uniquePrimary: number; valid: number; mismatches: number; urls: Set<string> }
  > = {};

  for (const prod of products) {
    const cat = prod.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = {
        total: 0,
        uniquePrimary: 0,
        valid: 0,
        mismatches: 0,
        urls: new Set(),
      };
    }
    categoryBreakdown[cat].total += 1;

    // 1. Missing images check
    if (!prod.images || prod.images.length === 0 || !prod.images[0]) {
      missingImages += 1;
      continue;
    }

    const primary = prod.images[0].trim();

    // 2. Broken / invalid protocol check
    if (!primary || (!primary.startsWith('http://') && !primary.startsWith('https://'))) {
      brokenImages += 1;
      continue;
    }

    // 3. Placeholder images check
    if (
      primary.includes('via.placeholder.com') ||
      primary.includes('placehold.it') ||
      primary.includes('dummyimage.com') ||
      primary.includes('example.com')
    ) {
      placeholderImages += 1;
      continue;
    }

    // 4. Duplicate primary image & base photo ID tracking
    primaryUrls.push(primary);
    categoryBreakdown[cat].urls.add(primary);

    const photoIdMatch = primary.match(/photo-[a-zA-Z0-9-]+/);
    const basePhotoId = photoIdMatch ? photoIdMatch[0] : primary.split('?')[0];
    basePhotoIds.push(basePhotoId);

    const count = (urlMap.get(primary) || 0) + 1;
    urlMap.set(primary, count);
    if (count === 2) {
      duplicateUrls.push(primary);
    }

    const idCount = (idMap.get(basePhotoId) || 0) + 1;
    idMap.set(basePhotoId, idCount);
    if (idCount === 2 && !duplicateUrls.includes(basePhotoId)) {
      duplicateUrls.push(`Duplicate Base Photo: ${basePhotoId}`);
    }

    // 5. Category mismatch check
    const catLower = cat.toLowerCase();
    const prodNameLower = prod.name.toLowerCase();
    let mismatch = false;

    if (catLower.includes('saree') && !prodNameLower.includes('saree')) {
      mismatch = true;
    } else if (catLower.includes('toy') && (prodNameLower.includes('saree') || prodNameLower.includes('kurti') || prodNameLower.includes('sneaker') || prodNameLower.includes('lipstick'))) {
      mismatch = true;
    } else if (catLower.includes('footwear') && (prodNameLower.includes('saree') || prodNameLower.includes('kurti') || prodNameLower.includes('serum') || prodNameLower.includes('air fryer'))) {
      mismatch = true;
    } else if (catLower.includes('electronics') && (prodNameLower.includes('saree') || prodNameLower.includes('kurti') || prodNameLower.includes('dress') || prodNameLower.includes('lipstick') || prodNameLower.includes('skillet'))) {
      mismatch = true;
    } else if (catLower.includes('beauty') && (prodNameLower.includes('saree') || prodNameLower.includes('sneaker') || prodNameLower.includes('smartwatch') || prodNameLower.includes('t-shirt') || prodNameLower.includes('fryer'))) {
      mismatch = true;
    }

    if (mismatch) {
      categoryMismatches += 1;
      categoryBreakdown[cat].mismatches += 1;
    }

    validImages += 1;
    categoryBreakdown[cat].valid += 1;
  }

  const uniquePrimarySet = new Set(primaryUrls);
  const uniqueBaseIdSet = new Set(basePhotoIds);
  const uniquePrimaryImages = uniqueBaseIdSet.size;
  const duplicatePrimaryImages = primaryUrls.length - uniquePrimaryImages;

  const resultBreakdown: Record<
    string,
    { total: number; uniquePrimary: number; valid: number; mismatches: number }
  > = {};

  for (const [cat, data] of Object.entries(categoryBreakdown)) {
    resultBreakdown[cat] = {
      total: data.total,
      uniquePrimary: data.urls.size,
      valid: data.valid,
      mismatches: data.mismatches,
    };
  }

  const isValid =
    products.length > 0 &&
    duplicatePrimaryImages === 0 &&
    missingImages === 0 &&
    brokenImages === 0 &&
    placeholderImages === 0 &&
    categoryMismatches === 0 &&
    uniquePrimaryImages === products.length;

  console.log('\n==================================================');
  console.log('PRODUCT IMAGE AUDIT REPORT — ZYLO COMMERCE');
  console.log('==================================================');
  console.log(`Total Products:             ${products.length}`);
  console.log(`Valid Images:               ${validImages}`);
  console.log(`Unique Primary Photos:      ${uniquePrimaryImages}`);
  console.log(`Duplicate Primary Photos:   ${duplicatePrimaryImages}`);
  console.log(`Missing Images:             ${missingImages}`);
  console.log(`Broken Images:              ${brokenImages}`);
  console.log(`Placeholder Images:         ${placeholderImages}`);
  console.log(`Category/Image Mismatches:  ${categoryMismatches}`);
  console.log('--------------------------------------------------');
  console.log('Category Breakdown:');
  for (const [cat, stats] of Object.entries(resultBreakdown)) {
    console.log(
      `- ${cat.padEnd(20)}: ${stats.total} products | ${stats.uniquePrimary} unique primary photos | ${stats.mismatches} mismatches`
    );
  }
  console.log('--------------------------------------------------');
  console.log(`Catalog Integrity Status:   ${isValid ? '100% VALIDATED & COMPLIANT' : 'ISSUES DETECTED'}`);
  console.log('==================================================\n');

  return {
    isValid,
    totalProducts: products.length,
    validImages,
    uniquePrimaryImages,
    duplicatePrimaryImages,
    missingImages,
    brokenImages,
    placeholderImages,
    categoryMismatches,
    duplicateUrls,
    categoryBreakdown: resultBreakdown,
  };
}
