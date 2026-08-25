import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, Timer, Flame, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import api from '../services/api.js';

export const DealsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDeal = searchParams.get('deal') || 'all';

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        limit: 48,
        sortBy: 'discount',
      };

      if (currentDeal === 'under999') params.maxPrice = 999;
      if (currentDeal === 'under1999') params.maxPrice = 1999;
      if (currentDeal === '50off') params.discount = 50;
      if (currentDeal === '70off') params.discount = 70;
      if (currentDeal === 'flash') params.flash = true;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setLoading(false);
    }
  }, [currentDeal]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const dealTabs = [
    { label: '🔥 All Hot Deals', value: 'all' },
    { label: '⚡ Flash Sale Live', value: 'flash' },
    { label: '🏷️ Under ₹999', value: 'under999' },
    { label: '💎 Under ₹1,999', value: 'under1999' },
    { label: '💥 Min 50% Off', value: '50off' },
    { label: '🚀 Flat 70% Off', value: '70off' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      {/* Banner with Live Countdown */}
      <div className="bg-gradient-to-r from-rose-600 via-purple-700 to-indigo-700 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>Zylo Mega Markdown Day</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Unbeatable Deals & <span className="text-amber-300">Flash Sales</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Grab premium electronics, sarees, kids fashion, toys and essentials at up to 70% discount before stock vanishes.
            </p>
          </div>

          {/* Real-time countdown timer */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Flash Sale Ends In
              </div>
              <div className="text-xs text-white/70">Limited stock per household</div>
            </div>

            <div className="flex items-center gap-2 font-mono font-black text-xl sm:text-2xl">
              <div className="bg-white text-zinc-900 px-2.5 py-1.5 rounded-xl shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-amber-300">:</span>
              <div className="bg-white text-zinc-900 px-2.5 py-1.5 rounded-xl shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-amber-300">:</span>
              <div className="bg-rose-500 text-white px-2.5 py-1.5 rounded-xl shadow-xs animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Tabs */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {dealTabs.map(t => (
              <button
                key={t.value}
                onClick={() => setSearchParams({ deal: t.value })}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0 ${
                  currentDeal === t.value
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-zinc-900">
              {currentDeal === 'flash'
                ? '⚡ Live Lightning Deals'
                : currentDeal === 'under20'
                ? '🏷️ Budget Steals Under $20'
                : currentDeal === '50off'
                ? '💥 Heavy Discounts: 50% Off & Above'
                : 'All Active Discount Steals'}
            </h2>
            <p className="text-xs text-zinc-500">Every product includes Free Delivery & 7-Day Guarantee</p>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            {products.length} Deals Live
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-zinc-100 animate-pulse space-y-3">
                <div className="aspect-square bg-zinc-200 rounded-xl" />
                <div className="h-3 bg-zinc-200 rounded w-3/4" />
                <div className="h-3 bg-zinc-200 rounded w-1/2" />
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
