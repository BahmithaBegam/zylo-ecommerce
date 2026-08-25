import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye, Zap, Check } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';
import { handleImageError, getCategoryFallback, getProductImageUrl } from '../../utils/imageFallbacks.js';
import { QuickViewModal } from './QuickViewModal.js';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0 || isAdding) return;

    setIsAdding(true);
    await addToCart(
      product._id,
      1,
      product.colors?.[0] || 'Standard',
      product.sizes?.[0] || 'Standard'
    );
    success(`Added ${product.name.slice(0, 24)}... to bag`);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setShowQuickView(true);
    }
  };

  // Determine top-left badge
  const getBadge = () => {
    if (product.badge) {
      const lower = product.badge.toLowerCase();
      if (lower.includes('seller')) return { text: product.badge, bg: 'bg-emerald-600' };
      if (lower.includes('price') || lower.includes('deal') || lower.includes('off') || lower.includes('flash')) {
        return { text: product.badge, bg: 'bg-rose-600' };
      }
      return { text: product.badge, bg: 'bg-indigo-600' };
    }
    if (product.bestseller) return { text: 'BESTSELLER', bg: 'bg-emerald-600' };
    if (product.discount >= 40) return { text: `${product.discount}% OFF`, bg: 'bg-rose-600' };
    if (product.newArrival) return { text: 'NEW', bg: 'bg-indigo-600' };
    return null;
  };

  const badge = getBadge();
  const calculatedDiscount =
    product.discount ||
    (product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <>
      <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
        {/* Product Image & Overlays */}
        <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
          {/* Top Badges & Wishlist Action */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
            {badge ? (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${badge.bg}`}
              >
                {badge.text}
              </span>
            ) : (
              <div />
            )}

            <button
              onClick={handleToggleWishlist}
              type="button"
              aria-label="Toggle Wishlist"
              className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md transition-all active:scale-75 shadow-sm ${
                isWishlisted
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900 ring-1 ring-rose-200 dark:ring-rose-800'
                  : 'bg-white/85 dark:bg-zinc-800/85 text-zinc-400 dark:text-zinc-300 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-700'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
                }`}
              />
            </button>
          </div>

          {/* 1:1 Aspect Ratio Image Container with hover zoom */}
          <div className="aspect-square w-full bg-zinc-100/80 dark:bg-zinc-800 overflow-hidden relative group/img">
            <img
              src={getProductImageUrl(product.images, product.category)}
              alt={product.name}
              loading="lazy"
              onError={(e) => handleImageError(e, product.category)}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
            />

            {/* Quick View Hover Pill */}
            <button
              onClick={handleOpenQuickView}
              type="button"
              className="absolute inset-x-4 bottom-3 z-10 py-2 bg-white/95 dark:bg-zinc-800/95 hover:bg-white dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-all duration-200 translate-y-2 group-hover/img:translate-y-0 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>

            {/* Low Stock Warning */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-xs shadow-xs">
                Only {product.stock} left
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Card Content Information */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
          <Link to={`/product/${product._id}`} className="space-y-1 block">
            {/* Brand & Category micro row */}
            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
              <span className="text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
                {product.brand || 'Zylo'}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-[90px]">
                {product.fabric || product.category}
              </span>
            </div>

            {/* Product Name (2-line limit) */}
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating Stars & Score */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
                <Star className="w-2.5 h-2.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                ({product.reviewCount || 42})
              </span>
            </div>
          </Link>

          {/* Pricing & Add to Cart Action */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-zinc-950 dark:text-white tracking-tight">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 line-through font-medium">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>
              {calculatedDiscount > 0 && (
                <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                  {calculatedDiscount}% OFF
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0 || isAdding}
              aria-label="Add to cart"
              type="button"
              className={`h-8 px-2.5 sm:px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-xs disabled:opacity-40 disabled:pointer-events-none ${
                isAdding
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white'
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline text-[10px]">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline text-[11px]">Add</span>
                </>
              )}
            </button>
          </div>

          {/* Free Delivery & Policy Micro strip */}
          <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-400 font-medium pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-emerald-600 dark:fill-emerald-400" /> Free Delivery
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">7-Day Returns</span>
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};
