import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Baby,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Smile,
  Heart,
  ShieldCheck,
  Truck,
  Sparkle,
} from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import api from '../services/api.js';

export const KidsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 24,
  });

  const currentAge = searchParams.get('ageGroup') || 'all';
  const currentSub = searchParams.get('subcategory') || 'all';
  const currentSort = searchParams.get('sortBy') || 'bestseller';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchKidsProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        category: 'Kids',
        page: currentPage,
        limit: 24,
        sortBy: currentSort,
      };

      if (currentAge !== 'all') params.ageGroup = currentAge;
      if (currentSub !== 'all') params.subcategory = currentSub;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch kids items', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchKidsProducts();
  }, [fetchKidsProducts]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    updateParam('page', String(newPage));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const ageGroups = [
    { label: 'All Ages', value: 'all', emoji: '🌟' },
    { label: '0–2 Years (Baby)', value: '0-2 Years', emoji: '👶' },
    { label: '3–5 Years (Toddler)', value: '3-5 Years', emoji: '🧸' },
    { label: '6–8 Years (Junior)', value: '6-8 Years', emoji: '🎨' },
    { label: '9–12 Years (Pre-Teen)', value: '9-12 Years', emoji: '🚀' },
    { label: 'Teens (13+)', value: 'Teens', emoji: '🎧' },
  ];

  const subcategories = [
    { label: 'All Kids Clothing', value: 'all' },
    { label: 'Girls Dresses & Frocks', value: 'Girls Dresses' },
    { label: 'Boys Clothing Sets', value: 'Boys Clothing' },
    { label: 'Baby Rompers & Care', value: 'Baby Clothing' },
    { label: 'Festive Ethnic Sets', value: 'Kids Ethnic Wear' },
    { label: 'Kids Footwear & Shoes', value: 'Kids Footwear' },
    { label: 'School Bags & Essentials', value: 'School Essentials' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      {/* Kids Playful Banner */}
      <div className="relative bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zylo Kids & Baby Corner</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Adorable, Safe & <span className="underline decoration-amber-300 decoration-wavy">Playful Styles</span>
            </h1>

            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              Explore 100% skin-safe organic cotton wear, sparkling party frocks, festive kurta dhoti sets, ergonomic school backpacks, and comfy light-up shoes designed for little smiles.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-white/90">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>100% Skin-Safe Certified Fabrics</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                <Truck className="w-4 h-4 text-sky-300" />
                <span>Free Express Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Age Filters Bar */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-xs font-black uppercase text-zinc-400 tracking-wider shrink-0 mr-1">
              Shop by Age:
            </span>
            {ageGroups.map(ag => {
              const active = (currentAge === 'all' && ag.value === 'all') || currentAge === ag.value;
              return (
                <button
                  key={ag.value}
                  onClick={() => updateParam('ageGroup', ag.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                    active
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <span>{ag.emoji}</span>
                  <span>{ag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Subcategory Sidebar */}
          <div className="hidden lg:block space-y-4 bg-white p-5 rounded-2xl border border-zinc-200 self-start sticky top-32">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900">Categories</span>
              {(currentAge !== 'all' || currentSub !== 'all') && (
                <button onClick={() => setSearchParams(new URLSearchParams())} className="text-xs text-rose-600 font-bold">
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              {subcategories.map(sub => (
                <button
                  key={sub.value}
                  onClick={() => updateParam('subcategory', sub.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    (currentSub === 'all' && sub.value === 'all') || currentSub === sub.value
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <span>{sub.label}</span>
                  {((currentSub === 'all' && sub.value === 'all') || currentSub === sub.value) && (
                    <Check className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-900">
                {currentAge !== 'all' ? `Kids Styles for ${currentAge}` : 'All Kids & Baby Outfits'}
              </h2>
              <span className="text-xs font-bold text-zinc-500">{pagination.total} products</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 border border-zinc-100 animate-pulse space-y-3">
                    <div className="aspect-square bg-zinc-200 rounded-xl" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
                <p className="text-zinc-500 text-xs">No products found for this age group.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map(p => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-zinc-200">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-1.5 border border-zinc-200 bg-white rounded-xl text-xs font-bold text-zinc-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-zinc-700 px-3">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3.5 py-1.5 border border-zinc-200 bg-white rounded-xl text-xs font-bold text-zinc-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
