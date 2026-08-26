/**
 * Unified Category Normalization & Matching Utility for Zylo Commerce
 * Ensures canonical names across URL query params, slugs, MongoDB, and in-memory store.
 */

export function normalizeCategory(cat: string): string {
  if (!cat) return '';
  const c = cat.toLowerCase().trim().replace(/['"]/g, '');

  if (c === 'sarees' || c === 'saree') return 'Sarees';
  if (c === 'women' || c === 'womens' || c === "women's" || c === 'women-fashion') return 'Women';
  if (c === 'men' || c === 'mens' || c === "men's" || c === 'men-fashion') return 'Men';
  if (c === 'kids' || c === 'kid' || c === 'baby' || c === 'kids-baby') return 'Kids';
  if (c === 'footwear' || c === 'shoes' || c === 'shoe' || c === 'footwears') return 'Footwear';
  if (c === 'beauty' || c === 'beauty-personal-care' || c === 'cosmetics' || c === 'beauty & personal care') return 'Beauty';
  if (c === 'electronics' || c === 'electronics-gadgets' || c === 'gadgets' || c === 'electronics & gadgets') return 'Electronics';
  if (
    c === 'home & living' ||
    c === 'home-living' ||
    c === 'home & kitchen' ||
    c === 'home-kitchen' ||
    c === 'home' ||
    c === 'home essentials' ||
    c === 'home living' ||
    c === 'home and living' ||
    c === 'home_living' ||
    c === 'homeliving' ||
    c === 'home-&-living' ||
    c === 'home + living' ||
    c === 'home%20%26%20living' ||
    c.includes('home')
  ) {
    return 'Home & Living';
  }
  if (c === 'toys & games' || c === 'toys-games' || c === 'toys' || c === 'toy' || c === 'games' || c === 'toy-games' || c.includes('toy')) return 'Toys & Games';
  if (c === 'bags & accessories' || c === 'bags-accessories' || c === 'bags' || c === 'accessories' || c.includes('bag')) return 'Bags & Accessories';
  if (c === 'sports & fitness' || c === 'sports-fitness' || c === 'sports' || c === 'fitness' || c.includes('sport')) return 'Sports & Fitness';

  return cat.trim();
}

export function isCategoryMatch(productCategory: string, queryCategory: string): boolean {
  if (!queryCategory || queryCategory === 'all') return true;
  if (!productCategory) return false;

  const normQuery = normalizeCategory(queryCategory).toLowerCase();
  const normProd = normalizeCategory(productCategory).toLowerCase();
  if (normQuery === normProd) return true;

  const rawQuery = queryCategory.toLowerCase().trim();
  const rawProd = productCategory.toLowerCase().trim();
  if (rawQuery === rawProd) return true;

  const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '');
  const cleanProd = rawProd.replace(/[^a-z0-9]/g, '');
  if (cleanQuery === cleanProd) return true;

  return false;
}
