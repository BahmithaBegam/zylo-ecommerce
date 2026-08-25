import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Gamepad2,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import api from '../services/api.js';

export const ToysPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 24,
  });

  const currentToyType = searchParams.get('toyType') || 'all';
  const currentAge = searchParams.get('ageGroup') || 'all';
  const currentSort = searchParams.get('sortBy') || 'bestseller';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchToys = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        category: 'Toys & Games',
        page: currentPage,
        limit: 24,
        sortBy: currentSort,
      };

      if (currentToyType !== 'all') params.toyType = currentToyType;
      if (currentAge !== 'all') params.ageGroup = currentAge;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch toys', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchToys();
  }, [fetchToys]);

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

  const toyTypes = [
    { label: 'All Toys & Games', value: 'all' },
    { label: 'STEM & Robotics Kits', value: 'Educational & STEM Toys' },
    { label: 'Remote Control Cars & Crawlers', value: 'Remote Control' },
    { label: 'Dollhouses & Dolls', value: 'Dolls & Dollhouses' },
    { label: '3D Puzzles & Brainteasers', value: 'Puzzles & Brainteasers' },
    { label: 'Building Blocks & Magnetic Tiles', value: 'Building Blocks & LEGO' },
    { label: 'Superhero Action Figures', value: 'Action Figures' },
    { label: 'Montessori & Toddler Toys', value: 'Baby & Toddler Toys' },
  ];

  const ageFilters = [
    { label: 'All Ages', value: 'all' },
    { label: '0–2 Years', value: '0-2 Years' },
    { label: '3–5 Years', value: '3-5 Years' },
    { label: '6–8 Years', value: '6-8 Years' },
    { label: '9–12 Years', value: '9-12 Years' },
    { label: 'Teens & Family', value: 'Teens' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-violet-900 via-indigo-900 to-cyan-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Gamepad2 className="w-4 h-4" />
              <span>Zylo Toys & Play Wonderland</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Ignite Imagination, <span className="text-cyan-300">Curiosity & Play</span>
            </h1>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              Explore STEM robotics, high-speed 4WD all-terrain RC crawlers, handcrafted wooden dollhouses, 1000-piece cosmic galaxy puzzles, and safe non-toxic building blocks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-cyan-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Non-Toxic & Safety Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-400" />
                <span>Free Express Home Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toy Type Chips Bar */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {toyTypes.map(tt => {
              const active = (currentToyType === 'all' && tt.value === 'all') || currentToyType === tt.value;
              return (
                <button
                  key={tt.value}
                  onClick={() => updateParam('toyType', tt.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-600/20'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {tt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block space-y-5 bg-white p-5 rounded-2xl border border-zinc-200 self-start sticky top-32">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900">Filter by Age</span>
              {(currentToyType !== 'all' || currentAge !== 'all') && (
                <button onClick={() => setSearchParams(new URLSearchParams())} className="text-xs text-rose-600 font-bold">
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              {ageFilters.map(ag => (
                <button
                  key={ag.value}
                  onClick={() => updateParam('ageGroup', ag.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    (currentAge === 'all' && ag.value === 'all') || currentAge === ag.value
                      ? 'bg-cyan-50 text-cyan-800'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <span>{ag.label}</span>
                  {((currentAge === 'all' && ag.value === 'all') || currentAge === ag.value) && (
                    <Check className="w-3.5 h-3.5 text-cyan-700" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-900">
                {currentToyType !== 'all' ? currentToyType : 'All Trending Toys & Brain Games'}
              </h2>
              <span className="text-xs font-bold text-zinc-500">{pagination.total} toys available</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 border border-zinc-100 animate-pulse space-y-3">
                    <div className="aspect-square bg-zinc-200 rounded-xl" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
