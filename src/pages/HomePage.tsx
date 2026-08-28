import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Flame,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Heart,
  Tag,
  Clock,
} from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { CategoryCard } from '../components/common/UIComponents.js';
import { Footer } from '../components/layout/Footer.js';
import api from '../services/api.js';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealTab, setSelectedDealTab] = useState<'flash' | 'under499' | 'under999' | '50off' | '70off'>('flash');

  // Real-time flash sale countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const res = await api.get('/products', { params: { limit: 120 } });
        if (res.data?.success && res.data.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Category slices
  const trendingProducts = products.filter(p => p.bestseller || p.rating >= 4.6).slice(0, 8);
  const womenProducts = products.filter(p => p.category === 'Women').slice(0, 8);
  const kidsProducts = products.filter(p => p.category === 'Kids' || p.category === 'Toys & Games').slice(0, 8);
  const genZFashion = products.filter(p => p.category === 'Women' || p.category === 'Men').slice(0, 8);

  // Deals filters
  const getDealsFiltered = () => {
    switch (selectedDealTab) {
      case 'under499':
        return products.filter(p => p.price <= 499).slice(0, 8);
      case 'under999':
        return products.filter(p => p.price <= 999 && p.price > 499).slice(0, 8);
      case '50off':
        return products.filter(p => p.discount >= 50).slice(0, 8);
      case '70off':
        return products.filter(p => p.discount >= 60).slice(0, 8);
      case 'flash':
      default:
        return products.filter(p => p.discount >= 40 || p.isFlashDeal).slice(0, 8);
    }
  };

  const dealProducts = getDealsFiltered();

  // 10 Visual Category Cards
  const categoriesList = [
    {
      name: "Women's Fashion",
      subtitle: 'Kurtis, Sarees, Dresses & Tops',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Women',
      badge: 'Trending',
    },
    {
      name: "Men's Fashion",
      subtitle: 'Oversized Tees & Denim',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Men',
      badge: 'Streetwear',
    },
    {
      name: 'Kids',
      subtitle: 'Frocks, Sets & Baby Wear',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80',
      href: '/kids',
      badge: 'Cute',
    },
    {
      name: 'Toys',
      subtitle: 'STEM, Dolls & RC Cars',
      image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80',
      href: '/toys',
      badge: 'Fun',
    },
    {
      name: 'Beauty',
      subtitle: 'Skincare, Makeup & Scents',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Beauty',
      badge: 'Clean',
    },
    {
      name: 'Electronics',
      subtitle: 'TWS, Smartwatches & Gear',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Electronics',
      badge: 'Hi-Fi',
    },
    {
      name: 'Home',
      subtitle: 'Bedding, Kitchen & Accents',
      image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Home+%26+Living',
      badge: 'Cozy',
    },
    {
      name: 'Footwear',
      subtitle: 'Sneakers, Heels & Flats',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Footwear',
      badge: 'Kicks',
    },
    {
      name: 'Sports',
      subtitle: 'Activewear & Fitness Gear',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Sports+%26+Fitness',
      badge: 'Active',
    },
    {
      name: 'Bags',
      subtitle: 'Backpacks, Wallets & Totes',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Bags+%26+Accessories',
      badge: 'Chic',
    },
    {
      name: 'Books',
      subtitle: 'Bestsellers, Planners & Art',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      href: '/shop?category=Books+%26+Stationery',
      badge: 'Read',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col justify-between space-y-8 sm:space-y-16 pt-0 w-full max-w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 w-full">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 text-white min-h-[380px] sm:min-h-[500px] flex items-center shadow-xl w-full">
          {/* Background image overlay with soft gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=85"
              alt="Gen-Z Fashion and Lifestyle"
              className="w-full h-full object-cover object-center opacity-45 transform scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent sm:hidden" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-4 sm:p-12 lg:p-16 max-w-2xl space-y-4 sm:space-y-6 w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>Zylo New Season Drop</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] break-words">
                FIND YOUR NEXT <br />
                <span className="bg-gradient-to-r from-indigo-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  FAVORITE.
                </span>
              </h1>
              <p className="text-xs sm:text-base text-zinc-300 font-normal leading-relaxed max-w-lg">
                Fashion, beauty, tech and everyday essentials — all in one place. Authentic brands, express doorstep delivery, and prices that make sense.
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2 flex-wrap">
              <Link
                to="/shop"
                className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center gap-2 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?sort=bestselling"
                className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold backdrop-blur-md border border-white/20 transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                <span>Explore Trends</span>
              </Link>
            </div>

            {/* Quick Guarantees Pill */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-zinc-300 font-medium">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Free Shipping above ₹999
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 7-Day Doorstep Returns
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              EXPLORE BY DEPARTMENT
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              Shop By Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {categoriesList.map(cat => (
            <CategoryCard
              key={cat.name}
              name={cat.name}
              subtitle={cat.subtitle}
              image={cat.image}
              href={cat.href}
              badge={cat.badge}
            />
          ))}
        </div>
      </section>

      {/* 3. TRENDING SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                HOT RIGHT NOW
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
              Trending Right Now
            </h2>
          </div>
          <Link
            to="/shop?sort=bestselling"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {trendingProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. WOMEN'S FASHION SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-4 sm:p-10 lg:p-12 shadow-xl relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Editorial Text Left */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-pink-400/20 text-pink-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-pink-400/30">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Curated Wardrobe</span>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  WOMEN'S <br />
                  <span className="text-pink-300">COLLECTION.</span>
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 font-medium leading-relaxed">
                  Everyday elegance to festive grandeur. Explore handcrafted Anarkalis, pure silk drapes, modern tiered dresses, and relaxed linen co-ord sets.
                </p>
              </div>

              {/* Sub-category Pill Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                {[
                  { name: 'Kurtas & Suits', sub: 'Kurtis & Suits' },
                  { name: 'Sarees', sub: 'Sarees' },
                  { name: 'Dresses', sub: 'Dresses' },
                  { name: 'Co-ords', sub: 'Co-ords' },
                  { name: 'Tops & Tees', sub: 'Tops & Tees' },
                  { name: 'Ethnic Sets', sub: 'Ethnic Wear' },
                ].map(tag => (
                  <Link
                    key={tag.name}
                    to={`/shop?category=Women&subcategory=${encodeURIComponent(tag.sub)}`}
                    className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-purple-100 text-[11px] sm:text-xs font-semibold backdrop-blur-xs transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>

              <div className="pt-1 sm:pt-2">
                <Link
                  to="/shop?category=Women"
                  className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white text-xs sm:text-sm font-black shadow-lg transition-all active:scale-95"
                >
                  <span>Explore Women's Fashion</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>

            {/* Women Showcase Grid Right */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {womenProducts.slice(0, 3).map(product => (
                <div key={product._id} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-md">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. GEN-Z FASHION SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-pink-600 dark:text-pink-400">
              CURATED VIBES
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              Style It Your Way
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
              Trending outfits, streetwear, oversized tees, co-ords, and everyday drip.
            </p>
          </div>
          <Link
            to="/shop?category=Women"
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1 group shrink-0"
          >
            <span>Explore Fashion</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {genZFashion.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. KIDS & TOYS SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
              LITTLE ONES & PLAY
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              For Little Explorers
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
              Kids dresses, boys & girls clothing, baby essentials, educational toys, and STEM games.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/kids"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1"
            >
              Kids Wear
            </Link>
            <span>•</span>
            <Link
              to="/toys"
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1"
            >
              Toys
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {kidsProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. DEALS SECTION WITH COUNTDOWN TIMER */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-b from-rose-50/70 dark:from-zinc-900 to-white dark:to-zinc-950 rounded-2xl sm:rounded-3xl border border-rose-200/80 dark:border-zinc-800 p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-6 w-full">
          
          {/* Deals Header with Countdown Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-rose-100 dark:border-zinc-800 w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-white" /> FLASH SALE
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
                Deals You Don't Want To Miss
              </h2>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2 bg-zinc-950 dark:bg-zinc-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md border border-zinc-800 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mr-0.5 sm:mr-1">
                Ends In:
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm">
                <span className="bg-zinc-800 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-md text-amber-300">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-zinc-800 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-md text-amber-300">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-zinc-800 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-md text-rose-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Deal Filters Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar w-full min-w-0">
            {[
              { id: 'flash', label: '⚡ Flash Sale' },
              { id: 'under499', label: 'Under ₹499' },
              { id: 'under999', label: 'Under ₹999' },
              { id: '50off', label: 'Up to 50% Off' },
              { id: '70off', label: 'Up to 70% Off' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDealTab(tab.id as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0 ${
                  selectedDealTab === tab.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Deals Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {dealProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. SINGLE POLISHED FOOTER ONLY ON HOME PAGE */}
      <Footer />

    </div>
  );
};

