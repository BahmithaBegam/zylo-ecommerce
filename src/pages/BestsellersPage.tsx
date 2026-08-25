import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Star, Trophy, Sparkles } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import api from '../services/api.js';

export const BestsellersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCat = searchParams.get('category') || 'all';

  const fetchBestsellers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        limit: 48,
        sortBy: 'bestseller',
      };
      if (currentCat !== 'all') params.category = currentCat;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch bestsellers', err);
    } finally {
      setLoading(false);
    }
  }, [currentCat]);

  useEffect(() => {
    fetchBestsellers();
  }, [fetchBestsellers]);

  const categories = [
    'all',
    'Sarees',
    'Women',
    'Men',
    'Kids',
    'Electronics',
    'Toys & Games',
    'Footwear',
    'Beauty',
  ];

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-black/20 px-3.5 py-1 rounded-full text-xs font-black uppercase text-amber-200">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Highest Rated & Customer Loved</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Zylo <span className="text-amber-200">Best Sellers</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">
            Over 200,000+ happy shoppers rated these top products 4.5+ stars for quality, durability, and unmatched value.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSearchParams({ category: c })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  currentCat === c
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {c === 'all' ? '🏆 All Bestsellers' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-zinc-900">
            {currentCat === 'all' ? 'Top Ranked Products Across All Categories' : `Best Selling in ${currentCat}`}
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
