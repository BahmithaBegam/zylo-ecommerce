import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Flame } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import api from '../services/api.js';

export const NewArrivalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCat = searchParams.get('category') || 'all';

  const fetchNewArrivals = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        limit: 48,
        sortBy: 'newest',
      };
      if (currentCat !== 'all') params.category = currentCat;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch new arrivals', err);
    } finally {
      setLoading(false);
    }
  }, [currentCat]);

  useEffect(() => {
    fetchNewArrivals();
  }, [fetchNewArrivals]);

  const categories = [
    'all',
    'Women',
    'Sarees',
    'Men',
    'Kids',
    'Electronics',
    'Toys & Games',
    'Footwear',
    'Beauty',
    'Home & Living',
  ];

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      <div className="bg-gradient-to-r from-indigo-900 via-zinc-900 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-black uppercase text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spring / Summer 2026 Drops</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Fresh New <span className="text-indigo-400">Arrivals</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            Explore the freshest additions across fashion, handloom sarees, Gen-Z streetwear, smart audio, and toys.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSearchParams({ category: c })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  currentCat === c
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {c === 'all' ? '✨ All Departments' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-zinc-900">
            {currentCat === 'all' ? 'All Latest Catalog Drops' : `New Arrivals in ${currentCat}`}
          </h2>
          <span className="text-xs font-bold text-zinc-500">{products.length} Products</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-zinc-100 animate-pulse space-y-3">
                <div className="aspect-square bg-zinc-200 rounded-xl" />
                <div className="h-3 bg-zinc-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
