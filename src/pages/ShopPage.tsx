import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  Star,
  ChevronDown,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Filter,
  Zap,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { QuickViewModal } from '../components/product/QuickViewModal.js';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatINR } from '../utils/formatters.js';
import api from '../services/api.js';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 24,
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedBrand = searchParams.get('brand') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const minDiscount = searchParams.get('discount') || '';
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const freeDeliveryOnly = searchParams.get('freeDelivery') === 'true';
  const sortBy = searchParams.get('sortBy') || 'popularity';
  const isBestseller = searchParams.get('bestseller') === 'true';
  const isNewArrival = searchParams.get('newArrival') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for price inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        limit: 24,
        sortBy,
      };

      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.rating = minRating;
      if (inStock) params.inStock = 'true';
      if (isBestseller) params.bestseller = 'true';
      if (isNewArrival) params.newArrival = 'true';
      if (minDiscount) params.discount = minDiscount;
      if (selectedSize) params.size = selectedSize;
      if (selectedColor) params.color = selectedColor;

      const [res, catRes] = await Promise.all([
        api.get('/products', { params }),
        categories.length === 0 ? api.get('/categories') : Promise.resolve({ data: { categories } }),
      ]);

      if (res.data.success) {
        let loaded = res.data.products;
        if (freeDeliveryOnly) {
          loaded = loaded.filter((p: Product) => p.freeDelivery !== false);
        }
        setProducts(loaded);
        setPagination(res.data.pagination);
        if (res.data.facets?.brands) {
          setBrands(res.data.facets.brands);
        }
      }
      if (catRes.data?.categories && categories.length === 0) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    search,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    isBestseller,
    isNewArrival,
    minDiscount,
    selectedSize,
    selectedColor,
    freeDeliveryOnly,
    sortBy,
    categories.length,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all') {
      p.delete(key);
    } else {
      p.set(key, value);
    }
    if (key !== 'page') {
      p.delete('page');
    }
    setSearchParams(p);
  };

  const setPriceRange = (min: string, max: string) => {
    const p = new URLSearchParams(searchParams);
    if (min) p.set('minPrice', min); else p.delete('minPrice');
    if (max) p.set('maxPrice', max); else p.delete('maxPrice');
    p.delete('page');
    setLocalMinPrice(min);
    setLocalMaxPrice(max);
    setSearchParams(p);
  };

  const handlePriceApply = () => {
    const p = new URLSearchParams(searchParams);
    if (localMinPrice) p.set('minPrice', localMinPrice);
    else p.delete('minPrice');

    if (localMaxPrice) p.set('maxPrice', localMaxPrice);
    else p.delete('maxPrice');

    p.delete('page');
    setSearchParams(p);
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating !== '' ||
    inStock ||
    minDiscount !== '' ||
    selectedSize !== '' ||
    selectedColor !== '' ||
    freeDeliveryOnly ||
    isBestseller ||
    isNewArrival ||
    search !== '';

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff', border: true },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header Row */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">
              <span>Marketplace</span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {selectedCategory === 'all' ? 'All Products' : selectedCategory}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {search ? `Search results for "${search}"` : selectedCategory === 'all' ? 'Explore All Products' : selectedCategory}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Showing <strong className="text-zinc-900 dark:text-white">{pagination.total}</strong> authentic items
            </p>
          </div>

          {/* Controls: Sort Dropdown & View Mode & Mobile Filter Trigger */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-zinc-950 dark:bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl px-3 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <label htmlFor="shop-sort" className="font-bold text-zinc-600 dark:text-zinc-300">Sort:</label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={e => updateParam('sortBy', e.target.value)}
                className="bg-transparent font-black text-zinc-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="popularity" className="dark:bg-zinc-900">Most Popular</option>
                <option value="price_low" className="dark:bg-zinc-900">Price: Low to High</option>
                <option value="price_high" className="dark:bg-zinc-900">Price: High to Low</option>
                <option value="rating" className="dark:bg-zinc-900">Customer Rating</option>
                <option value="discount" className="dark:bg-zinc-900">Biggest Discount</option>
                <option value="newest" className="dark:bg-zinc-900">Newest Arrivals</option>
              </select>
            </div>

            {/* Grid vs Compact toggle */}
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Standard Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'compact' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Compact Grid View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons Strip */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>

          <button
            onClick={() => setPriceRange('0', '499')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              minPrice === '0' && maxPrice === '499'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Under ₹499
          </button>

          <button
            onClick={() => setPriceRange('500', '999')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              minPrice === '500' && maxPrice === '999'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            ₹500 - ₹999
          </button>

          <button
            onClick={() => updateParam('discount', minDiscount === '50' ? null : '50')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              minDiscount === '50'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            🔥 50%+ OFF
          </button>

          <button
            onClick={() => updateParam('rating', minRating === '4' ? null : '4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              minRating === '4'
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400" /> 4★ & Above
          </button>

          <button
            onClick={() => updateParam('bestseller', isBestseller ? null : 'true')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              isBestseller
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            🏆 Bestsellers
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 ml-auto whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Main Body: Desktop Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Categories
              </h4>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', 'all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      selectedCategory.toLowerCase() === cat.name.toLowerCase()
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="truncate pr-1">{cat.name}</span>
                    {cat.productCount !== undefined && (
                      <span
                        className={`text-[10px] ${
                          selectedCategory.toLowerCase() === cat.name.toLowerCase()
                            ? 'text-white/80'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        ({cat.productCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Presets & Custom Range */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Price (₹)
              </h4>
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                <button
                  onClick={() => setPriceRange('0', '499')}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-lg text-center"
                >
                  Under ₹499
                </button>
                <button
                  onClick={() => setPriceRange('500', '999')}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-lg text-center"
                >
                  ₹500 - ₹999
                </button>
                <button
                  onClick={() => setPriceRange('1000', '1999')}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-lg text-center"
                >
                  ₹1k - ₹2k
                </button>
                <button
                  onClick={() => setPriceRange('2000', '')}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-lg text-center"
                >
                  ₹2,000+
                </button>
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={localMinPrice}
                  onChange={e => setLocalMinPrice(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono text-zinc-900 dark:text-white"
                />
                <span className="text-zinc-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={localMaxPrice}
                  onChange={e => setLocalMaxPrice(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono text-zinc-900 dark:text-white"
                />
              </div>
              <button
                onClick={handlePriceApply}
                className="w-full py-1.5 bg-zinc-950 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Apply Range
              </button>
            </div>

            {/* Size Options */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map(sz => (
                  <button
                    key={sz}
                    onClick={() => updateParam('size', selectedSize === sz ? null : sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSize === sz
                        ? 'bg-zinc-950 dark:bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Color
              </h4>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(c => (
                  <button
                    key={c.name}
                    onClick={() => updateParam('color', selectedColor === c.name ? null : c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      c.border ? 'border border-zinc-300 dark:border-zinc-600' : ''
                    } ${
                      selectedColor === c.name
                        ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Rating
              </h4>
              <div className="space-y-1">
                {[
                  { label: '4.5★ & Above', value: '4.5' },
                  { label: '4.0★ & Above', value: '4.0' },
                  { label: '3.5★ & Above', value: '3.5' },
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => updateParam('rating', minRating === r.value ? null : r.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      minRating === r.value
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {minRating === r.value && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock & Discount */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={e => updateParam('inStock', e.target.checked ? 'true' : null)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freeDeliveryOnly}
                  onChange={e => updateParam('freeDelivery', e.target.checked ? 'true' : null)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Free Delivery Eligible</span>
              </label>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No products matched your filters"
              description="Try clearing some filter tags or search terms to see more catalog items."
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              {/* Responsive Product Grid */}
              <div
                className={`grid gap-3.5 sm:gap-4 ${
                  viewMode === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {products.map(prod => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onQuickView={p => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-4">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => {
                      updateParam('page', String(currentPage - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          updateParam('page', String(pageNum));
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                          currentPage === pageNum
                            ? 'bg-zinc-950 dark:bg-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => {
                      updateParam('page', String(currentPage + 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Filters
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => updateParam('category', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c.name} className="dark:bg-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Price Ranges */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
                Price Budget
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPriceRange('0', '499')}
                  className="py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold"
                >
                  Under ₹499
                </button>
                <button
                  onClick={() => setPriceRange('500', '999')}
                  className="py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold"
                >
                  ₹500 - ₹999
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-3 bg-zinc-950 dark:bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal instance */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};
